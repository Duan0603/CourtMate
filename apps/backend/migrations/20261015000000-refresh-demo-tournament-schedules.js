// Refresh only untouched survey-seed schedules; preserve real/user-edited events.
const fixtures = [
  {
    "title": "Laughing Open Mùa 2",
    "startDate": "2026-10-10T08:00:00.000Z",
    "endDate": "2026-10-12T18:00:00.000Z"
  },
  {
    "title": "GIẢI CẦU LÔNG FPTU BADMINTON SERIES 2025",
    "startDate": "2026-11-05T08:00:00.000Z",
    "endDate": "2026-11-08T18:00:00.000Z"
  },
  {
    "title": "Giải Pickleball Queens Đà Nẵng 2026",
    "startDate": "2026-11-20T08:00:00.000Z",
    "endDate": "2026-11-23T18:00:00.000Z"
  },
  {
    "title": "Giải Pickleball JCI Việt Nam mở rộng 2026",
    "startDate": "2026-12-05T08:00:00.000Z",
    "endDate": "2026-12-07T18:00:00.000Z"
  },
  {
    "title": "Giải Pickleball báo chí Đà Nẵng mở rộng 2026",
    "startDate": "2026-12-15T08:00:00.000Z",
    "endDate": "2026-12-17T18:00:00.000Z"
  },
  {
    "title": "Giải Pickleball Học sinh Sinh viên TP. Đà Nẵng 2026 (Cúp FPT City)",
    "startDate": "2026-10-24T08:00:00.000Z",
    "endDate": "2026-10-26T18:00:00.000Z"
  },
  {
    "title": "Heineken Pickleball World Cup 2026 – Cá nhân",
    "startDate": "2027-01-10T08:00:00.000Z",
    "endDate": "2027-01-15T18:00:00.000Z"
  },
  {
    "title": "Heineken Pickleball World Cup 2026 – Quốc gia",
    "startDate": "2027-01-16T08:00:00.000Z",
    "endDate": "2027-01-20T18:00:00.000Z"
  },
  {
    "title": "World Junior Pickleball Cup 2026",
    "startDate": "2027-01-22T08:00:00.000Z",
    "endDate": "2027-01-24T18:00:00.000Z"
  },
  {
    "title": "Giải Pickleball phường Liên Chiểu 2026",
    "startDate": "2026-11-14T08:00:00.000Z",
    "endDate": "2026-11-15T18:00:00.000Z"
  },
  {
    "title": "Giải Vô địch Cầu lông các nhóm tuổi Thiếu niên Quốc gia (Tranh giải Donex).",
    "startDate": "2026-07-20T08:00:00.000Z",
    "endDate": "2026-07-28T18:00:00.000Z"
  },
  {
    "title": "Giải Cầu lông Đại hội Thể dục thể thao thành phố Đà Nẵng",
    "startDate": "2026-08-12T08:00:00.000Z",
    "endDate": "2026-08-18T18:00:00.000Z"
  },
  {
    "title": "Giải Cầu lông truyền thống Nhà Văn hóa Lao động",
    "startDate": "2026-09-02T08:00:00.000Z",
    "endDate": "2026-09-04T18:00:00.000Z"
  }
];
const DAY = 86400000;
const marker = '_demoScheduleRefresh20261015';
module.exports = {
  async up(db) {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const first = Math.min(...fixtures.map(item => new Date(item.startDate).getTime()));
    const shift = Math.max(0, today.getTime() + 14 * DAY - first);
    if (!shift) return;
    let updated = 0;
    for (const item of fixtures) {
      const collection = db.collection('tournaments');
      const current = await collection.findOne({title: item.title, startDate: new Date(item.startDate), endDate: new Date(item.endDate), status: {$in: ['OPEN', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED']}, [marker]: {$exists: false}});
      if (!current) continue;
      const startDate = new Date(new Date(item.startDate).getTime() + shift);
      const endDate = new Date(new Date(item.endDate).getTime() + shift);
      const format = date => new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Bangkok'}).format(date);
      const original = {startDate: current.startDate, endDate: current.endDate, time: current.time ?? null, status: current.status, matchDates: current.matchDates ?? null, appliedStart: startDate, appliedEnd: endDate};
      const update = {startDate, endDate, time: format(startDate) + ' - ' + format(endDate), status: 'OPEN', [marker]: original};
      if (current.matchDates?.length) update.matchDates = current.matchDates.map(date => new Date(new Date(date).getTime() + shift));
      const result = await collection.updateOne({_id: current._id, startDate: current.startDate, endDate: current.endDate, status: current.status}, {$set: update});
      updated += result.modifiedCount;
    }
    console.log('Refreshed ' + updated + ' untouched demo tournament schedules.');
  },
  async down(db) {
    for (const item of await db.collection('tournaments').find({[marker]: {$exists: true}}).toArray()) {
      const original = item[marker];
      const restored = {startDate: original.startDate, endDate: original.endDate, status: original.status};
      const unset = {[marker]: ''};
      if (original.time === null) unset.time = ''; else restored.time = original.time;
      if (original.matchDates === null) unset.matchDates = ''; else restored.matchDates = original.matchDates;
      await db.collection('tournaments').updateOne({_id: item._id, startDate: original.appliedStart, endDate: original.appliedEnd}, {$set: restored, $unset: unset});
    }
  },
};
