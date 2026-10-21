const { test } = require('node:test');
const assert = require('node:assert/strict');
const { of, throwError, lastValueFrom } = require('rxjs');
const { ActivityNotificationsInterceptor } = require('../dist/modules/notifications/activity-notifications.interceptor');
const { NotificationsService } = require('../dist/modules/notifications/notifications.service');
const { NotificationsGateway } = require('../dist/modules/notifications/notifications.gateway');
const { NotificationSchema } = require('../dist/modules/notifications/schemas/notification.schema');
const { NotificationReadSchema } = require('../dist/modules/notifications/schemas/notification-read.schema');
const context = (url, method = 'POST', user = { sub: 'actor' }) => ({ getType: () => 'http', switchToHttp: () => ({ getResponse: () => ({ setHeader: () => {} }), getRequest: () => ({ originalUrl: url, method, user }) }) });
test('successful activity persists once; match updates reach other participants exactly once', async () => {
  const sent = [];
  const interceptor = new ActivityNotificationsInterceptor({ send: async dto => { sent.push(dto); return { ...dto, _id: 'notification', createdAt: new Date() }; } });
  const result = { _id: 'match', hostId: 'host', title: 'Giao lưu', players: [{ userId: 'actor' }, { userId: 'host' }, { userId: 'player' }] };
  assert.equal(await lastValueFrom(interceptor.intercept(context('/matches/match/join'), { handle: () => of(result) })), result);
  assert.deepEqual(sent.map(item => item.userId).sort(), ['actor', 'host', 'player']);
  assert.equal(sent[1].link, '/matches/match');
});
test('all favorites entry points produce a stored account notification', async () => {
  const sent = [];
  const interceptor = new ActivityNotificationsInterceptor({ send: async dto => { sent.push(dto); return { ...dto, _id: 'notification', createdAt: new Date() }; } });
  await lastValueFrom(interceptor.intercept(context('/users/bookmarks/tournament', 'DELETE'), { handle: () => of({}) }));
  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'FAVORITE_TOURNAMENT');
  assert.equal(sent[0].userId, 'actor');
});
test('reads, notification actions, unauthenticated requests and failed mutations do not emit', async () => {
  const sent = [];
  const interceptor = new ActivityNotificationsInterceptor({ send: async dto => { sent.push(dto); return { ...dto, _id: 'notification', createdAt: new Date() }; } });
  for (const ctx of [context('/matches', 'GET'), context('/notifications/read-all', 'PATCH'), context('/matches', 'POST', null)]) {
    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of({}) }));
  }
  await lastValueFrom(interceptor.intercept(context('/matches'), { handle: () => of({ success: false }) }));
  await assert.rejects(lastValueFrom(interceptor.intercept(context('/matches'), { handle: () => throwError(() => new Error('failed')) })));
  assert.equal(sent.length, 0);
});
test('notification is saved before it is delivered, in the intended user room', async () => {
  const calls = [];
  class Model { constructor(dto) { Object.assign(this, dto, { _id: 'notification', createdAt: new Date() }); } async save() { calls.push('save'); return this; } }
  const service = new NotificationsService(Model, {}, { emitToUser: (id, payload) => calls.push([id, payload.id]), emitBroadcast: () => calls.push('broadcast') });
  await service.send({ userId: 'recipient', type: 'UPDATE', title: 'Title', body: 'Body' });
  assert.deepEqual(calls, ['save', ['recipient', 'notification']]);
});
test('another account cannot dismiss a private notification', async () => {
  let writes = 0;
  const model = { findById: () => ({ exec: async () => ({ userId: 'owner' }) }), deleteOne: () => { writes++; } };
  const reads = { updateOne: async () => { writes++; } };
  await new NotificationsService(model, reads, {}).deleteOne('intruder', 'notification');
  assert.equal(writes, 0);
});
test('socket authentication uses the configured signing key', async () => {
  let secret; const rooms = [];
  const gateway = new NotificationsGateway({ verifyAsync: async (_, options) => { secret = options.secret; return { sub: 'recipient' }; } }, { get: () => 'configured-test-key' });
  await gateway.handleConnection({ id: 'socket', handshake: { auth: { token: 'test-token' } }, join: room => rooms.push(room), disconnect: () => assert.fail('unexpected disconnect') });
  assert.equal(secret, 'configured-test-key');
  assert.deepEqual(rooms, ['user:recipient', 'broadcast']);
});
test('notification history and read status have no automatic expiry', () => {
  for (const schema of [NotificationSchema, NotificationReadSchema]) assert.equal(schema.indexes().some(([, options]) => options.expireAfterSeconds !== undefined), false);
});

test('migration prepares durable storage without deleting existing user data', async () => {
  const migration = require('../migrations/20261021000000-persist-user-notifications');
  const created = [], dropped = [], indexed = [];
  const db = {
    listCollections: ({ name }) => ({ toArray: async () => name === 'messages' ? [{ name }] : [] }),
    createCollection: async name => created.push(name),
    collection: name => ({
      indexes: async () => [{ name: 'ttl', key: { [name === 'notifications' ? 'createdAt' : 'readAt']: 1 }, expireAfterSeconds: 2592000 }, { name: '_id_', key: { _id: 1 } }],
      dropIndex: async index => dropped.push([name, index]),
      createIndex: async keys => indexed.push([name, keys]),
    }),
  };
  await migration.up(db);
  assert.deepEqual(created, ['notifications', 'notification_reads']);
  assert.deepEqual(dropped, [['notifications', 'ttl'], ['notification_reads', 'ttl']]);
  assert.equal(indexed.length, 3);
});

test('HTTP fallback delivers the same saved notification id as realtime', async () => {
  let header;
  const saved = { _id: 'stored-id', userId: 'actor', type: 'ACCOUNT_ACTIVITY', title: 'Updated', body: 'Saved', createdAt: new Date() };
  const interceptor = new ActivityNotificationsInterceptor({ send: async () => saved });
  const ctx = context('/users/profile', 'PUT');
  const request = ctx.switchToHttp().getRequest();
  ctx.switchToHttp = () => ({ getRequest: () => request, getResponse: () => ({ setHeader: (key, value) => { assert.equal(key, 'X-CourtMate-Notification'); header = value; } }) });
  await lastValueFrom(interceptor.intercept(ctx, { handle: () => of({ name: 'Updated' }) }));
  assert.equal(JSON.parse(decodeURIComponent(header)).id, 'stored-id');
});
