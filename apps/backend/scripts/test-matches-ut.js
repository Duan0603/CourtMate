const { MatchesService } = require('../dist/modules/matches/matches.service');
const { BadmintonSkillLevel, MatchStatus, SportType } = require('@courtmate/shared');

async function runTests() {
  console.log('🧪 BẮT ĐẦU CHẠY UNIT TEST (MatchesService):');
  let passed = 0;

  let mockMatchModel = function (dto) {
    return {
      ...dto,
      _id: 'match_123',
      save: async function () {
        return this;
      },
    };
  };
  mockMatchModel.find = () => ({ sort: () => ({ exec: async () => [] }) });
  mockMatchModel.findById = () => ({ exec: async () => null });
  mockMatchModel.findOne = () => ({ exec: async () => null });

  const service = new MatchesService(mockMatchModel);
  const hostUser = { id: 'u_host', name: 'Host Test', phone: '0905123456' };

  // Test 1: Tạo kèo hợp lệ
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 2);

  const res1 = await service.createMatch(hostUser, {
    sport: SportType.BADMINTON,
    title: 'Kèo test UT',
    venueName: 'Sân Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng',
    district: 'Thanh Khê',
    startTime: tomorrow.toISOString(),
    endTime: tomorrowEnd.toISOString(),
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
  });

  if (
    res1.status === MatchStatus.OPEN &&
    res1.joinedCount === 1 &&
    res1.players.length === 1 &&
    res1.shareCode.startsWith('CM-')
  ) {
    console.log('✅ TEST 1 PASSED: Tạo kèo thành công với trình độ TBY -> TB+ và sinh shareCode chuẩn');
    passed++;
  } else {
    throw new Error('Test 1 failed');
  }

  // Test 2: Chặn giờ quá khứ
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await service.createMatch(hostUser, {
      sport: SportType.BADMINTON,
      title: 'Kèo quá khứ',
      venueName: 'Sân Test',
      venueAddress: 'ĐN',
      district: 'Hải Châu',
      startTime: pastDate.toISOString(),
      endTime: tomorrow.toISOString(),
      totalSlots: 4,
      minSkillLevel: BadmintonSkillLevel.TB,
      maxSkillLevel: BadmintonSkillLevel.TB,
    });
    throw new Error('Test 2 failed: Không bắt lỗi quá khứ');
  } catch (e) {
    if (e.message.includes('quá khứ')) {
      console.log('✅ TEST 2 PASSED: Chặn tạo kèo có giờ bắt đầu ở quá khứ');
      passed++;
    } else throw e;
  }

  // Test 3: Join slot và tự động đổi sang FULL
  const existingMatch = {
    _id: 'match_999',
    status: MatchStatus.OPEN,
    totalSlots: 2,
    joinedCount: 1,
    players: [{ userId: 'u_host', name: 'Host' }],
    minSkillLevel: BadmintonSkillLevel.TB,
    save: async function () {
      return this;
    },
  };
  mockMatchModel.findById = (id) => ({ exec: async () => existingMatch });

  const joinRes = await service.joinMatch(
    { id: 'u_guest_2', name: 'Khách 2' },
    'match_999',
    BadmintonSkillLevel.TB,
  );
  if (joinRes.joinedCount === 2 && joinRes.status === MatchStatus.FULL) {
    console.log('✅ TEST 3 PASSED: Tham gia slot thành công và tự động chuyển sang FULL khi đủ người');
    passed++;
  } else throw new Error('Test 3 failed');

  // Test 4: Chặn join trùng lặp
  const openMatchWithUser = {
    _id: 'match_999',
    status: MatchStatus.OPEN,
    totalSlots: 4,
    joinedCount: 2,
    players: [{ userId: 'u_host', name: 'Host' }, { userId: 'u_guest_2', name: 'Khách 2' }],
    minSkillLevel: BadmintonSkillLevel.TB,
    save: async function () {
      return this;
    },
  };
  mockMatchModel.findById = (id) => ({ exec: async () => openMatchWithUser });

  try {
    await service.joinMatch({ id: 'u_guest_2', name: 'Khách 2' }, 'match_999');
    throw new Error('Test 4 failed: Không chặn join 2 lần');
  } catch (e) {
    if (e.status === 409 || e.message.includes('đã tham gia')) {
      console.log('✅ TEST 4 PASSED: Chặn người chơi tham gia 2 lần vào cùng 1 kèo');
      passed++;
    } else throw e;
  }

  // Test 5: Rút lui khỏi kèo và mở lại OPEN
  const farFuture = new Date();
  farFuture.setDate(farFuture.getDate() + 5);
  existingMatch.startTime = farFuture;
  existingMatch.hostId = 'u_host';
  const leaveRes = await service.leaveMatch('u_guest_2', 'match_999');
  if (leaveRes.joinedCount === 1 && leaveRes.status === MatchStatus.OPEN) {
    console.log('✅ TEST 5 PASSED: Rút lui hợp lệ thành công và mở lại slot sang OPEN');
    passed++;
  } else throw new Error('Test 5 failed');

  // Test 6: Chủ kèo không được tự rút lui
  const hostMatch = {
    _id: 'match_host',
    hostId: 'u_host',
    startTime: farFuture,
    players: [{ userId: 'u_host', name: 'Host' }],
  };
  mockMatchModel.findById = () => ({ exec: async () => hostMatch });

  try {
    await service.leaveMatch('u_host', 'match_host');
    throw new Error('Test 6 failed: Chủ kèo rút lui mà không bắt lỗi');
  } catch (e) {
    if (e.message.includes('Chủ kèo không thể rút lui')) {
      console.log('✅ TEST 6 PASSED: Ngăn chặn chủ kèo tự ý rút lui');
      passed++;
    } else throw e;
  }

  // Test 7: Ngăn chặn user đã join 1 slot ở kèo khác tham gia thêm slot kèo mới
  const anotherMatch = {
    _id: 'match_another',
    title: 'Kèo mới mở',
    venueName: 'Sân Quân Khu 5',
    status: MatchStatus.OPEN,
    totalSlots: 4,
    joinedCount: 1,
    players: [{ userId: 'u_other_host', name: 'Other Host' }],
    minSkillLevel: BadmintonSkillLevel.TB,
    save: async function () {
      return this;
    },
  };
  mockMatchModel.findById = () => ({ exec: async () => anotherMatch });
  // Giả lập user 'u_busy' đã có 1 slot ở kèo trước đó đang active
  mockMatchModel.findOne = () => ({
    exec: async () => ({
      _id: 'match_first',
      title: 'Kèo Kỳ Đồng Tối Nay',
      venueName: 'Sân Kỳ Đồng',
      status: MatchStatus.OPEN,
    }),
  });

  try {
    await service.joinMatch({ id: 'u_busy', name: 'Người chơi bận rộn' }, 'match_another');
    throw new Error('Test 7 failed: Không chặn user đã có slot ở kèo khác');
  } catch (e) {
    if (e.message.includes('Mỗi người chơi chỉ được tham gia 1 slot')) {
      console.log('✅ TEST 7 PASSED: Ngăn chặn thành công user đã join slot khác tham gia slot mới');
      passed++;
    } else throw e;
  }

  console.log(`\n🎉 HOÀN THÀNH 100% UNIT TESTS: ${passed}/7 PASSED!`);
}

runTests().catch((err) => {
  console.error('❌ UNIT TEST FAILED:', err);
  process.exit(1);
});
