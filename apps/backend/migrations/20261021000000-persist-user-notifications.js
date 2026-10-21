/** Ensure durable notification, read-state and message collections. No message data is removed. */
module.exports = {
  async up(db) {
    for (const name of ['notifications', 'notification_reads', 'messages']) {
      if (!(await db.listCollections({ name }).toArray()).length) await db.createCollection(name);
    }
    for (const [name, field] of [['notifications', 'createdAt'], ['notification_reads', 'readAt']]) {
      for (const index of await db.collection(name).indexes()) {
        if (index.expireAfterSeconds !== undefined && index.key[field] === 1) await db.collection(name).dropIndex(index.name);
      }
    }
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('notification_reads').createIndex({ notificationId: 1, userId: 1 }, { unique: true });
    await db.collection('messages').createIndex({ roomId: 1, createdAt: -1 });
  },
  async down() {
    // Intentionally preserve user history; restoring TTL would irreversibly erase older records.
  },
};
