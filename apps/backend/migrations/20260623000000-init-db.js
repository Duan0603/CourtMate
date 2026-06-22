module.exports = {
  async up(db, client) {
    // 1. Seed user collection with explicit roles (Organizer & Player profile types)
    const usersCount = await db.collection('users').countDocuments();
    let organizers = [];
    let players = [];

    if (usersCount === 0) {
      const insertedUsers = await db.collection('users').insertMany([
        {
          email: 'admin@courtmate.vn',
          name: 'CourtMate Admin',
          role: 'SUPER_ADMIN',
          preferences: {
            profileType: 'ORGANIZER',
            sports: ['BADMINTON', 'FOOTBALL', 'PICKLEBALL', 'TENNIS'],
            location: 'Da Nang'
          },
          isVerified: true,
          createdAt: new Date()
        },
        {
          email: 'organizer.son@courtmate.vn',
          name: 'Nguyen Van To Chuc',
          role: 'USER',
          preferences: {
            profileType: 'ORGANIZER',
            sports: ['BADMINTON', 'PICKLEBALL'],
            location: 'Da Nang'
          },
          isVerified: true,
          createdAt: new Date()
        },
        {
          email: 'player.hoang@courtmate.vn',
          name: 'Nguyen Van Cau Thu',
          role: 'USER',
          preferences: {
            profileType: 'PLAYER',
            sports: ['BADMINTON'],
            location: 'Da Nang'
          },
          isVerified: true,
          createdAt: new Date()
        },
        {
          email: 'player.lan@courtmate.vn',
          name: 'Tran Thi Dong Doi',
          role: 'USER',
          preferences: {
            profileType: 'PLAYER',
            sports: ['PICKLEBALL'],
            location: 'Da Nang'
          },
          isVerified: false,
          createdAt: new Date()
        }
      ]);
      console.log('Seeded initial users (Organizers & Players).');
      
      const allUsers = await db.collection('users').find().toArray();
      organizers = allUsers.filter(u => u.preferences.profileType === 'ORGANIZER');
      players = allUsers.filter(u => u.preferences.profileType === 'PLAYER');
    } else {
      const allUsers = await db.collection('users').find().toArray();
      organizers = allUsers.filter(u => u.preferences?.profileType === 'ORGANIZER');
      players = allUsers.filter(u => u.preferences?.profileType === 'PLAYER');
    }

    // 2. Clear any old articles collection since matchmaking is scoped out in v1
    await db.collection('articles').drop().catch(() => {});
    console.log('Dropped legacy articles collection.');

    // 3. Seed initial tournaments
    const tournamentsCount = await db.collection('tournaments').countDocuments();
    let tournamentIds = [];

    if (tournamentsCount === 0) {
      const insertedTournaments = await db.collection('tournaments').insertMany([
        {
          title: 'Giải vô địch Cầu lông Phong trào Đà Nẵng 2026',
          description: 'Giải đấu cầu lông phong trào quy mô toàn thành phố dành cho các nhóm tuổi từ 18-35 và trên 35.',
          sport: 'BADMINTON',
          time: '15/07/2026 - 18/07/2026',
          location: 'Nhà thi đấu Thể dục Thể thao Đà Nẵng, Phan Đăng Lưu',
          city: 'Da Nang',
          organizer: {
            id: organizers[0]?._id?.toString() || 'mock-organizer-id-1',
            name: organizers[0]?.name || 'Nguyen Van To Chuc',
            isVerified: true
          },
          rules: 'Thi đấu theo luật Cầu lông hiện hành của Tổng cục TDTT. Đăng ký theo cặp đấu đôi nam hoặc đôi nam nữ.',
          registrationFee: 200000, // fee in VND
          slotsLimit: 32,
          createdAt: new Date()
        },
        {
          title: 'Danang Pickleball Open 2026',
          description: 'Giải đấu giao lưu môn Pickleball phong trào lần đầu tiên tổ chức tại Sơn Trà, Đà Nẵng.',
          sport: 'PICKLEBALL',
          time: '30/08/2026',
          location: 'Sân Pickleball Sơn Trà, Đà Nẵng',
          city: 'Da Nang',
          organizer: {
            id: organizers[1]?._id?.toString() || organizers[0]?._id?.toString() || 'mock-organizer-id-2',
            name: organizers[1]?.name || organizers[0]?.name || 'CourtMate Admin',
            isVerified: true
          },
          rules: 'Thi đấu đôi nam, đôi nữ và đôi nam nữ phối hợp. Luật thi đấu áp dụng luật Pickleball quốc tế.',
          registrationFee: 150000,
          slotsLimit: 24,
          createdAt: new Date()
        }
      ]);
      console.log('Seeded initial tournaments.');
      
      const allTournaments = await db.collection('tournaments').find().toArray();
      tournamentIds = allTournaments.map(t => t._id);
    } else {
      const allTournaments = await db.collection('tournaments').find().toArray();
      tournamentIds = allTournaments.map(t => t._id);
    }

    // 4. Seed mock tournament registrations
    const registrationsCount = await db.collection('registrations').countDocuments();
    if (registrationsCount === 0 && tournamentIds.length > 0 && players.length > 0) {
      await db.collection('registrations').insertMany([
        {
          tournamentId: tournamentIds[0].toString(),
          playerId: players[0]._id.toString(),
          playerName: players[0].name,
          partnerName: 'Le Van Dong Doi',
          contactPhone: '0905123456',
          skillLevel: 'INTERMEDIATE',
          status: 'APPROVED',
          createdAt: new Date()
        },
        {
          tournamentId: tournamentIds[0].toString(),
          playerId: players[1]?._id?.toString() || players[0]._id.toString(),
          playerName: players[1]?.name || players[0].name,
          partnerName: 'Nguyen Thi Dong Doi',
          contactPhone: '0905987654',
          skillLevel: 'BEGINNER',
          status: 'PENDING',
          createdAt: new Date()
        },
        {
          tournamentId: tournamentIds[1].toString(),
          playerId: players[0]._id.toString(),
          playerName: players[0].name,
          partnerName: 'Tran Van Partner',
          contactPhone: '0905111222',
          skillLevel: 'ADVANCED',
          status: 'PENDING',
          createdAt: new Date()
        }
      ]);
      console.log('Seeded initial mock registrations.');
    }
  },

  async down(db, client) {
    await db.collection('users').deleteMany({ email: { $in: ['admin@courtmate.vn', 'organizer.son@courtmate.vn', 'player.hoang@courtmate.vn', 'player.lan@courtmate.vn'] } });
    await db.collection('tournaments').deleteMany({ title: { $in: ['Giải vô địch Cầu lông Phong trào Đà Nẵng 2026', 'Danang Pickleball Open 2026'] } });
    await db.collection('registrations').deleteMany({});
    console.log('Cleared seeded tournament records.');
  }
};
