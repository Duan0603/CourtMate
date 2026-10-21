const {test}=require('node:test');
const assert=require('node:assert/strict');
const {AuthService}=require('../dist/modules/auth/auth.service');
const {UserRole}=require('@courtmate/shared');
const mongoose=require('mongoose');
const {UserSchema}=require('../dist/modules/users/infrastructure/persistence/user.entity');
function setup(){let stored;const users={findByEmail:async()=>null,createWithPassword:async(email,hash,name,role,organizer)=>{stored={_id:'test',email,name,role,organizer};return stored;}};return {service:new AuthService(users,{sign:()=> 'test-token'}),stored:()=>stored};}
test('registration rejects every missing password requirement before creating a user',async()=>{
 for(const password of ['Ab1!','abcdefgh1!','ABCDEFGH!','Abcdefgh1','12345678!','Abcđ1234']){const {service,stored}=setup();await assert.rejects(()=>service.register('qa@example.com',password,'QA',UserRole.PLAYER),/Mật khẩu/);assert.equal(stored(),undefined);}
});
test('strong password registers a player and trims name/email',async()=>{const {service,stored}=setup();await service.register(' QA@EXAMPLE.COM ','Abcdef1!',' QA ',UserRole.PLAYER);assert.equal(stored().email,'qa@example.com');assert.equal(stored().name,'QA');});
test('organizer requires certificate and supported sports',async()=>{for(const organizer of [undefined,{certificateUrl:'https://example.com/proof.png',sports:[]},{certificateUrl:'data:image/png;base64,AA',sports:['TENNIS']},{certificateUrl:'https://example.com/proof.png',sports:['UNKNOWN']}]){const {service,stored}=setup();await assert.rejects(()=>service.register('qa@example.com','Abcdef1!','Club',UserRole.ORGANIZER,organizer),/giấy chứng nhận/);assert.equal(stored(),undefined);}});
test('organizer metadata reaches persistence and schema retains certificate and sports',async()=>{const {service,stored}=setup();const organizer={certificateUrl:'https://example.com/proof.png',sports:['TENNIS','BADMINTON']};await service.register('qa@example.com','Abcdef1!','Club',UserRole.ORGANIZER,organizer);assert.deepEqual(stored().organizer,organizer);const Model=mongoose.model('AuthRegistrationSpec',UserSchema);const user=new Model({email:'qa@example.com',role:'ORGANIZER',organizerCertificateUrl:organizer.certificateUrl,preferences:{sports:organizer.sports}});await user.validate();assert.equal(user.toObject().organizerCertificateUrl,organizer.certificateUrl);assert.deepEqual([...user.preferences.sports],organizer.sports);});

test('Vietnamese uppercase letters are accepted without counting letters as symbols',async()=>{const {service}=setup();await service.register('qa@example.com','Đặng1234!','QA',UserRole.PLAYER);});
