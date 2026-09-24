/**
 * Migration: Seed Da Nang Survey Data (Courts/Venues & Tournaments/Organizers)
 * Source: BẢNG KHẢO SÁT - ĐÀ NẴNG.xlsx
 * 
 * - 50 Venues / Sports Facilities across Da Nang districts
 * - 13 Tournaments (Badminton & Pickleball)
 * - 11 Organizer User Accounts with verified status
 */

const ORGANIZERS_DATA = [
  {
    "email": "btc.laughing@courtmate.vn",
    "name": "CLB Cầu lông Laughing",
    "contactName": "Nguyễn Hữu Huy",
    "sport": "BADMINTON",
    "district": "Sơn Trà",
    "btcCode": "BTC1"
  },
  {
    "email": "btc.fub@courtmate.vn",
    "name": "CLB Cầu lông FUB - FPTU Đà Nẵng",
    "contactName": "FUB Club x ICPDP",
    "sport": "BADMINTON",
    "district": "Ngũ Hành Sơn",
    "btcCode": "BTC2"
  },
  {
    "email": "dpf.danang@courtmate.vn",
    "name": "Liên đoàn Pickleball TP. Đà Nẵng (DPF)",
    "contactName": "Trần Phước Sơn",
    "sport": "PICKLEBALL",
    "district": "Hải Châu",
    "btcCode": "BTC3"
  },
  {
    "email": "jci.hoian@courtmate.vn",
    "name": "JCI Hội An & Lãnh đạo Doanh nhân trẻ",
    "contactName": "Ban điều hành JCI",
    "sport": "PICKLEBALL",
    "district": "Hải Châu",
    "btcCode": "BTC4"
  },
  {
    "email": "nhabaodanang@courtmate.vn",
    "name": "Hội Nhà báo TP. Đà Nẵng",
    "contactName": "Lãnh đạo Hội Nhà báo",
    "sport": "PICKLEBALL",
    "district": "Hải Châu",
    "btcCode": "BTC5"
  },
  {
    "email": "dpf.fptcity@courtmate.vn",
    "name": "Ban điều hành Cúp Học sinh SV DPF - FPT City",
    "contactName": "Đại diện DPF x FPT",
    "sport": "PICKLEBALL",
    "district": "Hải Châu",
    "btcCode": "BTC6"
  },
  {
    "email": "worldcup.pickleball@courtmate.vn",
    "name": "Ban tổ chức Pickleball World Cup & DPF",
    "contactName": "BTC Pickleball World Cup",
    "sport": "PICKLEBALL",
    "district": "Hải Châu",
    "btcCode": "BTC7_8_9"
  },
  {
    "email": "ubnd.lienchieu@courtmate.vn",
    "name": "UBND Phường Liên Chiểu",
    "contactName": "Lãnh đạo UBND Phường",
    "sport": "PICKLEBALL",
    "district": "Liên Chiểu",
    "btcCode": "BTC10"
  },
  {
    "email": "vbf.danang@courtmate.vn",
    "name": "Liên đoàn Cầu lông Việt Nam (VBF) x Sở VH-TT",
    "contactName": "Đại diện VBF & Sở VH-TT",
    "sport": "BADMINTON",
    "district": "Hải Châu",
    "btcCode": "BTC12"
  },
  {
    "email": "sovhtt.danang@courtmate.vn",
    "name": "Sở Văn hóa, Thể thao và Du lịch TP. Đà Nẵng",
    "contactName": "Ban tổ chức Đại hội TDTT",
    "sport": "BADMINTON",
    "district": "Hải Châu",
    "btcCode": "BTC13"
  },
  {
    "email": "nvhlaodong.danang@courtmate.vn",
    "name": "Nhà Văn hóa Lao động TP. Đà Nẵng",
    "contactName": "Ban Giám đốc NVH Lao động",
    "sport": "BADMINTON",
    "district": "Hải Châu",
    "btcCode": "BTC14"
  }
];

const TOURNAMENTS_DATA = [
  {
    "btcCode": "BTC1",
    "title": "Laughing Open Mùa 2",
    "description": "Giải đấu Laughing Open Mùa 2 được tổ chức tại Đà Nẵng bởi CLB Laughing . Quy mô: 70 vdv . Thể thức thi đấu: Vòng tròn tính điểm (Round Robin). Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Sắp xếp các vận động viên thi đấu cũng như kiểm soát các thủ tục tiến hành trận đấu mượt mà",
    "sport": "BADMINTON",
    "time": "10/10/2026 - 12/10/2026",
    "startDate": "2026-10-10T08:00:00.000Z",
    "endDate": "2026-10-12T18:00:00.000Z",
    "location": "Cụm sân cầu lông Sơn Trà, TP. Đà Nẵng",
    "district": "Sơn Trà",
    "city": "Da Nang",
    "orgEmail": "btc.laughing@courtmate.vn",
    "orgName": "CLB Laughing ",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Cầu lông chính thức. Thể thức: Vòng tròn tính điểm (Round Robin). Đăng ký qua: Google Form.",
    "registrationFee": 200000,
    "slotsLimit": 36,
    "registrationLink": "https://www.facebook.com/profile.php?id=61566969656498&__cft__[0]=AZjURZeb9cZjcG-u9Z47Mlnf20cD3BB8zm0T-Js6a-BIGDIEposiEmGZN3A-2SgL6Gk4D6I1gbqQP3yaeuzB6qqZftHI5i-kDB42FpHG7QdSd3zLDDseORSYb1l95HqFgAkZxp6ZQYwl3Exl&__tn__=-UC%2CP-R",
    "categories": [
      {
        "id": "cat-btc1-1",
        "name": "Đôi Nam Phong trào",
        "fee": 200000,
        "maxParticipants": 18
      },
      {
        "id": "cat-btc1-2",
        "name": "Đôi Nam Nữ",
        "fee": 200000,
        "maxParticipants": 18
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC2",
    "title": "GIẢI CẦU LÔNG FPTU BADMINTON SERIES 2025",
    "description": "Giải đấu GIẢI CẦU LÔNG FPTU BADMINTON SERIES 2025 được tổ chức tại Đà Nẵng bởi Phòng Hợp tác quốc tế & Phát triển cá nhân (ICPDP) phối hợp cùng FUB Club - Câu lạc bộ cầu lông FUDA. Quy mô: 100 vdv. Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Kiểm soát điều phối các lịch thi đấu của các vận động viên thi đấu trên 2 nội dung.",
    "sport": "BADMINTON",
    "time": "05/11/2026 - 08/11/2026",
    "startDate": "2026-11-05T08:00:00.000Z",
    "endDate": "2026-11-08T18:00:00.000Z",
    "location": "Nhà văn hóa / Sân thể thao FPT University Đà Nẵng, Ngũ Hành Sơn",
    "district": "Ngũ Hành Sơn",
    "city": "Da Nang",
    "orgEmail": "btc.fub@courtmate.vn",
    "orgName": "Phòng Hợp tác quốc tế & Phát triển cá nhân (ICPDP) phối hợp cùng FUB Club - Câu lạc bộ cầu lông FUDA",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Cầu lông chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Google Form.",
    "registrationFee": 120000,
    "slotsLimit": 50,
    "registrationLink": "https://www.facebook.com/FUBadmintonClubDN",
    "categories": [
      {
        "id": "cat-btc2-1",
        "name": "Đơn Nam Sinh viên",
        "fee": 60000,
        "maxParticipants": 32
      },
      {
        "id": "cat-btc2-2",
        "name": "Đôi Nam Nữ Sinh viên",
        "fee": 120000,
        "maxParticipants": 24
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC3",
    "title": "Giải Pickleball Queens Đà Nẵng 2026",
    "description": "Giải đấu Giải Pickleball Queens Đà Nẵng 2026 được tổ chức tại Đà Nẵng bởi Liên đoàn Pickleball TP. Đà Nẵng (DPF) + Đối tác quốc tế. Quy mô: Nữ VĐV hàng đầu (Pro/Open). Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Phối hợp quốc tế, hậu cần VĐV nước ngoài",
    "sport": "PICKLEBALL",
    "time": "20/11/2026 - 23/11/2026",
    "startDate": "2026-11-20T08:00:00.000Z",
    "endDate": "2026-11-23T18:00:00.000Z",
    "location": "Cung Thể thao Tiên Sơn, 03 Phan Đăng Lưu, Hải Châu, Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "dpf.danang@courtmate.vn",
    "orgName": "Liên đoàn Pickleball TP. Đà Nẵng (DPF) + Đối tác quốc tế",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Website riêng / App.",
    "registrationFee": 250000,
    "slotsLimit": 32,
    "registrationLink": "Văn phòng DPF: Cung Tiên Sơn, 03 Phan Đăng Lưu, Hải Châu",
    "categories": [
      {
        "id": "cat-btc3-1",
        "name": "Đơn Nữ Pro/Open",
        "fee": 250000,
        "maxParticipants": 16
      },
      {
        "id": "cat-btc3-2",
        "name": "Đôi Nữ Mở Rộng",
        "fee": 400000,
        "maxParticipants": 16
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC4",
    "title": "Giải Pickleball JCI Việt Nam mở rộng 2026",
    "description": "Giải đấu Giải Pickleball JCI Việt Nam mở rộng 2026 được tổ chức tại Đà Nẵng bởi JCI Hội An + Liên đoàn Lãnh đạo & DN trẻ. Quy mô: Phong trào mở rộng (thiện nguyện). Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Gây quỹ từ thiện, quản lý thời gian đăng ký",
    "sport": "PICKLEBALL",
    "time": "05/12/2026 - 07/12/2026",
    "startDate": "2026-12-05T08:00:00.000Z",
    "endDate": "2026-12-07T18:00:00.000Z",
    "location": "Cụm sân Pickleball Hòa Cường, Hải Châu, Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "jci.hoian@courtmate.vn",
    "orgName": "JCI Hội An + Liên đoàn Lãnh đạo & DN trẻ",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Fanpage / Bài đăng mạng xã hội.",
    "registrationFee": 200000,
    "slotsLimit": 40,
    "registrationLink": "Form đăng ký",
    "categories": [
      {
        "id": "cat-btc4-1",
        "name": "Đôi Nam Doanh nhân",
        "fee": 200000,
        "maxParticipants": 20
      },
      {
        "id": "cat-btc4-2",
        "name": "Đôi Nam Nữ Phong trào Gây quỹ",
        "fee": 200000,
        "maxParticipants": 20
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC5",
    "title": "Giải Pickleball báo chí Đà Nẵng mở rộng 2026",
    "description": "Giải đấu Giải Pickleball báo chí Đà Nẵng mở rộng 2026 được tổ chức tại Đà Nẵng bởi Hội Nhà báo TP. Đà Nẵng. Quy mô: Báo chí + VĐV phong trào. Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Sân nhà tự sở hữu. Ghi chú vận hành: Phối hợp lịch trình nhà báo",
    "sport": "PICKLEBALL",
    "time": "15/12/2026 - 17/12/2026",
    "startDate": "2026-12-15T08:00:00.000Z",
    "endDate": "2026-12-17T18:00:00.000Z",
    "location": "Sân thể thao Hội Nhà báo TP. Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "nhabaodanang@courtmate.vn",
    "orgName": "Hội Nhà báo TP. Đà Nẵng",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Google Form.",
    "registrationFee": 150000,
    "slotsLimit": 32,
    "registrationLink": "Chưa công bố",
    "categories": [
      {
        "id": "cat-btc5-1",
        "name": "Đôi Nam Báo chí & Đối tác",
        "fee": 150000,
        "maxParticipants": 16
      },
      {
        "id": "cat-btc5-2",
        "name": "Đôi Nam Nữ",
        "fee": 150000,
        "maxParticipants": 16
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC6",
    "title": "Giải Pickleball Học sinh Sinh viên TP. Đà Nẵng 2026 (Cúp FPT City)",
    "description": "Giải đấu Giải Pickleball Học sinh Sinh viên TP. Đà Nẵng 2026 (Cúp FPT City) được tổ chức tại Đà Nẵng bởi Ban lãnh đạo DPF + Đại diện FPT. Quy mô: Học sinh (THCS, THPT) + Sinh viên (CĐ, ĐH). Thể thức thi đấu: Loại trực tiếp (Knockout). Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Quản lý lứa tuổi học sinh, an toàn",
    "sport": "PICKLEBALL",
    "time": "24/10/2026 - 26/10/2026",
    "startDate": "2026-10-24T08:00:00.000Z",
    "endDate": "2026-10-26T18:00:00.000Z",
    "location": "Cung Tiên Sơn, 03 Phan Đăng Lưu, Hải Châu, Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "dpf.fptcity@courtmate.vn",
    "orgName": "Ban lãnh đạo DPF + Đại diện FPT",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Loại trực tiếp (Knockout). Đăng ký qua: Zalo / Tin nhắn trực tiếp.",
    "registrationFee": 100000,
    "slotsLimit": 64,
    "registrationLink": "Văn phòng DPF: Cung Tiên Sơn, 03 Phan Đăng Lưu, Hải Châu",
    "categories": [
      {
        "id": "cat-btc6-1",
        "name": "Đơn Nam Học sinh (THCS, THPT)",
        "fee": 50000,
        "maxParticipants": 32
      },
      {
        "id": "cat-btc6-2",
        "name": "Đôi Nam Nữ Sinh viên (CĐ, ĐH)",
        "fee": 100000,
        "maxParticipants": 32
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC7",
    "title": "Heineken Pickleball World Cup 2026 – Cá nhân",
    "description": "Giải đấu Heineken Pickleball World Cup 2026 – Cá nhân được tổ chức tại Đà Nẵng bởi Ban tổ chức World Cup + DPF. Quy mô: DUPR 3.0–5.0 + Pro (theo độ tuổi). Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Hậu cần 80+ quốc gia, an ninh, kỷ lục Guinness",
    "sport": "PICKLEBALL",
    "time": "10/01/2027 - 15/01/2027",
    "startDate": "2027-01-10T08:00:00.000Z",
    "endDate": "2027-01-15T18:00:00.000Z",
    "location": "Cung Tiên Sơn + Các cụm sân đạt chuẩn, Hải Châu, Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "worldcup.pickleball@courtmate.vn",
    "orgName": "Ban tổ chức World Cup + DPF",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Fanpage / Bài đăng mạng xã hội.",
    "registrationFee": 500000,
    "slotsLimit": 128,
    "registrationLink": "Website: https://worldcup.pickleball.com/",
    "categories": [
      {
        "id": "cat-btc7-1",
        "name": "Đơn Nam DUPR 3.0 - 5.0 + Pro",
        "fee": 500000,
        "maxParticipants": 64
      },
      {
        "id": "cat-btc7-2",
        "name": "Đơn Nữ DUPR 3.0 - 5.0 + Pro",
        "fee": 500000,
        "maxParticipants": 64
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC8",
    "title": "Heineken Pickleball World Cup 2026 – Quốc gia",
    "description": "Giải đấu Heineken Pickleball World Cup 2026 – Quốc gia được tổ chức tại Đà Nẵng bởi Ban tổ chức World Cup + DPF. Quy mô: Open, Kids, Junior, Senior, Master (Đội tuyển quốc gia). Thể thức thi đấu: Vòng tròn tính điểm (Round Robin). Địa điểm thi đấu: Lưu động đổi sân theo từng giải. Ghi chú vận hành: Phối hợp 80+ quốc gia, lịch thi đấu dày đặc",
    "sport": "PICKLEBALL",
    "time": "16/01/2027 - 20/01/2027",
    "startDate": "2027-01-16T08:00:00.000Z",
    "endDate": "2027-01-20T18:00:00.000Z",
    "location": "Cung Thể thao Tiên Sơn, Hải Châu, Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "worldcup.pickleball@courtmate.vn",
    "orgName": "Ban tổ chức World Cup + DPF",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng tròn tính điểm (Round Robin). Đăng ký qua: Fanpage / Bài đăng mạng xã hội.",
    "registrationFee": 1000000,
    "slotsLimit": 32,
    "registrationLink": "Website: https://worldcup.pickleball.com/",
    "categories": [
      {
        "id": "cat-btc8-1",
        "name": "Nội dung Đồng đội Đội tuyển Quốc gia Open",
        "fee": 1000000,
        "maxParticipants": 16
      },
      {
        "id": "cat-btc8-2",
        "name": "Nội dung Đồng đội Master (50+)",
        "fee": 1000000,
        "maxParticipants": 16
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC9",
    "title": "World Junior Pickleball Cup 2026",
    "description": "Giải đấu World Junior Pickleball Cup 2026 được tổ chức tại Đà Nẵng bởi Ban tổ chức World Cup + DPF. Quy mô: Trẻ em (Kids, Junior). Thể thức thi đấu: Vòng tròn tính điểm (Round Robin). Địa điểm thi đấu: Lưu động đổi sân theo từng giải. Ghi chú vận hành: Quản lý VĐV trẻ, an toàn",
    "sport": "PICKLEBALL",
    "time": "22/01/2027 - 24/01/2027",
    "startDate": "2027-01-22T08:00:00.000Z",
    "endDate": "2027-01-24T18:00:00.000Z",
    "location": "Cụm sân Hợp Thành Phát, P. An Hải, Sơn Trà, Đà Nẵng",
    "district": "Sơn Trà",
    "city": "Da Nang",
    "orgEmail": "worldcup.pickleball@courtmate.vn",
    "orgName": "Ban tổ chức World Cup + DPF",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng tròn tính điểm (Round Robin). Đăng ký qua: Zalo / Tin nhắn trực tiếp.",
    "registrationFee": 200000,
    "slotsLimit": 48,
    "registrationLink": "Website: https://worldcup.pickleball.com/",
    "categories": [
      {
        "id": "cat-btc9-1",
        "name": "Đơn Nam Trẻ em U14 (Junior)",
        "fee": 200000,
        "maxParticipants": 24
      },
      {
        "id": "cat-btc9-2",
        "name": "Đơn Nữ Trẻ em U16 (Junior)",
        "fee": 200000,
        "maxParticipants": 24
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC10",
    "title": "Giải Pickleball phường Liên Chiểu 2026",
    "description": "Giải đấu Giải Pickleball phường Liên Chiểu 2026 được tổ chức tại Đà Nẵng bởi UBND P. Liên Chiểu. Quy mô: Phong trào nội bộ phường. Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Quản lý phong trào địa phương",
    "sport": "PICKLEBALL",
    "time": "14/11/2026 - 15/11/2026",
    "startDate": "2026-11-14T08:00:00.000Z",
    "endDate": "2026-11-15T18:00:00.000Z",
    "location": "Trung tâm Thể thao Phường Liên Chiểu, Đà Nẵng",
    "district": "Liên Chiểu",
    "city": "Da Nang",
    "orgEmail": "ubnd.lienchieu@courtmate.vn",
    "orgName": "UBND P. Liên Chiểu",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Pickleball chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Zalo / Tin nhắn trực tiếp.",
    "registrationFee": 100000,
    "slotsLimit": 32,
    "registrationLink": "Chưa công bố",
    "categories": [
      {
        "id": "cat-btc10-1",
        "name": "Đôi Nam Cán bộ & Nhân dân",
        "fee": 100000,
        "maxParticipants": 16
      },
      {
        "id": "cat-btc10-2",
        "name": "Đôi Nam Nữ Phong trào",
        "fee": 100000,
        "maxParticipants": 16
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC12",
    "title": "Giải Vô địch Cầu lông các nhóm tuổi Thiếu niên Quốc gia (Tranh giải Donex).",
    "description": "Giải đấu Giải Vô địch Cầu lông các nhóm tuổi Thiếu niên Quốc gia (Tranh giải Donex). được tổ chức tại Đà Nẵng bởi Liên đoàn Cầu lông Việt Nam phối hợp Sở VH-TT TP. Đà Nẵng. Quy mô: 600 - 700 VĐV. Thể thức thi đấu: Loại trực tiếp (Knockout). Địa điểm thi đấu: Thuê cố định 1 cụm sân. Ghi chú vận hành: Quản lý vận hành trong khi đang diễn ra giải",
    "sport": "BADMINTON",
    "time": "20/07/2026 - 28/07/2026",
    "startDate": "2026-07-20T08:00:00.000Z",
    "endDate": "2026-07-28T18:00:00.000Z",
    "location": "Cung Thể thao Tiên Sơn, Phan Đăng Lưu, Hải Châu, TP. Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "vbf.danang@courtmate.vn",
    "orgName": "Liên đoàn Cầu lông Việt Nam phối hợp Sở VH-TT TP. Đà Nẵng",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Cầu lông chính thức. Thể thức: Loại trực tiếp (Knockout). Đăng ký qua: Website riêng / App.",
    "registrationFee": 0,
    "slotsLimit": 256,
    "registrationLink": "Fanpage Liên đoàn Cầu lông Việt Nam / Website vbf.vn",
    "categories": [
      {
        "id": "cat-btc12-1",
        "name": "Đơn Nam U13 - U15",
        "fee": 0,
        "maxParticipants": 64
      },
      {
        "id": "cat-btc12-2",
        "name": "Đơn Nữ U13 - U15",
        "fee": 0,
        "maxParticipants": 64
      },
      {
        "id": "cat-btc12-3",
        "name": "Đôi Nam U17",
        "fee": 0,
        "maxParticipants": 64
      },
      {
        "id": "cat-btc12-4",
        "name": "Đôi Nữ U17",
        "fee": 0,
        "maxParticipants": 64
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC13",
    "title": "Giải Cầu lông Đại hội Thể dục thể thao thành phố Đà Nẵng",
    "description": "Giải đấu Giải Cầu lông Đại hội Thể dục thể thao thành phố Đà Nẵng được tổ chức tại Đà Nẵng bởi Sở Văn hóa, Thể thao và Du lịch TP. Đà Nẵng. Quy mô: Khoảng 300 VĐV. Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Thuê cố định 1 cụm sân.",
    "sport": "BADMINTON",
    "time": "12/08/2026 - 18/08/2026",
    "startDate": "2026-08-12T08:00:00.000Z",
    "endDate": "2026-08-18T18:00:00.000Z",
    "location": "Cung Thể thao Tiên Sơn, Phan Đăng Lưu, Hải Châu, TP. Đà Nẵng",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "sovhtt.danang@courtmate.vn",
    "orgName": "Sở Văn hóa, Thể thao và Du lịch TP. Đà Nẵng",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Cầu lông chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Website riêng / App.",
    "registrationFee": 0,
    "slotsLimit": 120,
    "registrationLink": "Cổng thông tin điện tử Sở VH-TT Đà Nẵng",
    "categories": [
      {
        "id": "cat-btc13-1",
        "name": "Đơn Nam Vô địch Thành phố",
        "fee": 0,
        "maxParticipants": 32
      },
      {
        "id": "cat-btc13-2",
        "name": "Đôi Nam - Nữ Vô địch Thành phố",
        "fee": 0,
        "maxParticipants": 32
      },
      {
        "id": "cat-btc13-3",
        "name": "Đồng đội Nam/Nữ Quận Huyện",
        "fee": 0,
        "maxParticipants": 16
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  },
  {
    "btcCode": "BTC14",
    "title": "Giải Cầu lông truyền thống Nhà Văn hóa Lao động",
    "description": "Giải đấu Giải Cầu lông truyền thống Nhà Văn hóa Lao động được tổ chức tại Đà Nẵng bởi Nhà Văn hóa Lao động TP. Đà Nẵng / Liên đoàn Lao động TP. Quy mô: 150 - 200 VĐV. Thể thức thi đấu: Vòng bảng + Loại trực tiếp. Địa điểm thi đấu: Sân nhà tự sở hữu.",
    "sport": "BADMINTON",
    "time": "02/09/2026 - 04/09/2026",
    "startDate": "2026-09-02T08:00:00.000Z",
    "endDate": "2026-09-04T18:00:00.000Z",
    "location": "Số 02 Trần Phú, Thạch Thang, Hải Châu, Đà Nẵng (Nhà VH Lao động)",
    "district": "Hải Châu",
    "city": "Da Nang",
    "orgEmail": "nvhlaodong.danang@courtmate.vn",
    "orgName": "Nhà Văn hóa Lao động TP. Đà Nẵng / Liên đoàn Lao động TP",
    "rules": "Luật thi đấu: Áp dụng luật thi đấu môn Cầu lông chính thức. Thể thức: Vòng bảng + Loại trực tiếp. Đăng ký qua: Website riêng / App.",
    "registrationFee": 100000,
    "slotsLimit": 64,
    "registrationLink": "Fanpage Công đoàn Đà Nẵng / Trực tiếp tại NVH",
    "categories": [
      {
        "id": "cat-btc14-1",
        "name": "Đôi Nam Công nhân Viên chức",
        "fee": 100000,
        "maxParticipants": 32
      },
      {
        "id": "cat-btc14-2",
        "name": "Đôi Nam Nữ Công đoàn viên",
        "fee": 100000,
        "maxParticipants": 32
      }
    ],
    "status": "OPEN",
    "isHidden": false,
    "isFeatured": false,
    "reportsCount": 0
  }
];

const VENUES_DATA = [
  {
    "code": "CL1",
    "name": "Sân cầu lông Ngũ Hành",
    "city": "Da Nang",
    "district": "Ngũ Hành Sơn",
    "address": "Cuối Đường Phạm Hữu Nhật, Ngũ Hành Sơn, Đà Nẵng",
    "phone": "0937132656",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh dương đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": 60000.0,
    "peakPrice": 80000.0,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL2",
    "name": "Sân vận động Ngũ Hành Sơn",
    "city": "Da Nang",
    "district": "Ngũ Hành Sơn",
    "address": "01 Trần Văn Đán, Ngũ Hành Sơn, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL3",
    "name": "SÂN CẦU LÔNG INDEXSPORT 2",
    "city": "Da Nang",
    "district": "Ngũ Hành Sơn",
    "address": "81C Đ. Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng",
    "phone": "0906507564",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL4",
    "name": "Sân 85 Ngũ Hành Sơn",
    "city": "Da Nang",
    "district": "Ngũ Hành Sơn",
    "address": "85 Ngũ Hành Sơn, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 2,
    "pickleballCourts": 0,
    "badmintonCourts": 2,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL5",
    "name": "SÂN CẦU LÔNG DƯƠNG GIA HX",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "207 Quách Thị Trang, Hòa Xuân, Đà Nẵng",
    "phone": "0396665599",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL6",
    "name": "T&T Badminton",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "534 Phạm Hùng, Hòa Xuân, Đà Nẵng",
    "phone": "0384941109",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 22h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL7",
    "name": "SÂN CẦU LÔNG INDEXSPORT",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "448 Mẹ Thứ, Hòa Xuân, Đà Nẵng",
    "phone": "0981086979",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL8",
    "name": "B&L BADMINTON",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "116 Đô Đốc Lân, Hòa Xuân, Đà Nẵng",
    "phone": "0988220775",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h31",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL9",
    "name": "Sân cầu lông Hiếu Con",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "172-182 Đỗ Quỳ, Hòa Xuân, Đà Nẵng",
    "phone": "0905403222",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL10",
    "name": "Sân Trường Tiểu học Ngô Quyền",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "32 Lương Định Của, Cẩm Lệ, Đà Nẵng",
    "phone": "02363846189",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL11",
    "name": "Sân K9/19 Trần Huấn",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "K9/19 Trần Huấn, Cẩm Lệ, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL12",
    "name": "Sân cầu lông CLB Nam Bo",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "45 Trần Xuân Soạn, khuê Trung, Cẩm lệ,Đà Nẵng",
    "phone": "0968635995, 0982752591",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 2,
    "pickleballCourts": 0,
    "badmintonCourts": 2,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm tím đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL13",
    "name": "Sân Cầu Lông Dacinco",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "456 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 2,
    "pickleballCourts": 0,
    "badmintonCourts": 2,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL14",
    "name": "SÂN CẦU LÔNG & PICKLEBALL INDEXSPORT 3",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "12 Trịnh Công Sơn, Hòa Cường, Đà Nẵng",
    "phone": "0983112711",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON",
      "PICKLEBALL"
    ],
    "totalCourts": 6,
    "pickleballCourts": 2,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL15",
    "name": "Sân cầu lông Giang Badminton - Giang Badminton Court",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "145 Lý Nhân Tông, Cẩm Lệ, Đà Nẵng",
    "phone": "0352732123",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL16",
    "name": "Cung Thể Thao Tiên Sơn",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "Phan Đăng Lưu, Hòa Cường, Đà Nẵng",
    "phone": "02363797947",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON",
      "PICKLEBALL"
    ],
    "totalCourts": null,
    "pickleballCourts": 0,
    "badmintonCourts": null,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "Unknown",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL17",
    "name": "SÂN CẦU LÔNG QUÂN KHU 5, HẢI CHÂU, ĐÀ NẴNG",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "07 Duy Tân, Hòa Cường, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 9,
    "pickleballCourts": 0,
    "badmintonCourts": 9,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân gỗ đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL18",
    "name": "Sân Cầu Lông Win Win 146 Duy Tân",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "146 Duy Tân, Hòa Cường, Đà Nẵng",
    "phone": "0927990909",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 5,
    "pickleballCourts": 0,
    "badmintonCourts": 5,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL19",
    "name": "Nhà Văn hóa Lao động Thành phố Đà Nẵng",
    "city": "Da Nang",
    "district": "Cẩm Lệ",
    "address": "2 Cách Mạng Tháng 8, Hòa Cường, Cẩm Lệ, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL20",
    "name": "ARMY Badminton 1",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "Đối diện, 1 Đ. Phạm Ngọc Mậu, An Khê, Đà Nẵng",
    "phone": "0966032142",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL21",
    "name": "ARMY Badminton 2",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "224 Lê Trọng Tấn, An Khê, Đà Nẵng, Việt Nam",
    "phone": "0966032142",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL22",
    "name": "Trung tâm Thể dục Thể thao Sơn Trà",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "Nguyễn Thiếp, An Hải, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 9,
    "pickleballCourts": 0,
    "badmintonCourts": 9,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân gỗ đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL23",
    "name": "Sân Trường Tiểu học Ngô Gia Tự",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "61 Phạm Cự Lượng, An Hải, Đà Nẵng",
    "phone": "02363831242",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL24",
    "name": "CLB Cầu Lông Wings Badminton",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "132 Tô Hiến Thành, An Hải, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Fanpage Facebook",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL25",
    "name": "Sân cầu lông Trường CĐ LTTP ",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "An Hải, Đà Nẵng",
    "phone": "0905225295",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL26",
    "name": "Sân pickleball, cầu lông AN ĐỒN 5.5",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "Đường số 5, An Hải, Đà Nẵng",
    "phone": "0708721111",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON",
      "PICKLEBALL"
    ],
    "totalCourts": 16,
    "pickleballCourts": 8,
    "badmintonCourts": 8,
    "venueType": "Trong nhà và ngoài trời",
    "quality": "Sân đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL27",
    "name": "Sân Cầu Lông An Sinh",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "Đường Số 1, An Hải, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 2,
    "pickleballCourts": 0,
    "badmintonCourts": 2,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL28",
    "name": "Khu thể thao Agribank",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "An Hải, Sơn Trà, Đà Nẵng",
    "phone": "0905077480",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL29",
    "name": "Sân cầu lông Aurora Sport",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "Đường Số 6, Khu công nghiệp, An Hải, Đà Nẵng",
    "phone": "0905690989",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 8,
    "pickleballCourts": 0,
    "badmintonCourts": 8,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh lá đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL30",
    "name": "PINPON SPORT Badminton",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "Đường Số 6, Khu công nghiệp, An Hải, Đà Nẵng",
    "phone": "0898200700",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 13,
    "pickleballCourts": 0,
    "badmintonCourts": 13,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL31",
    "name": "Sân Trường Chính trị ",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "34 Hồ Nghinh, An Hải, Đà Nẵng",
    "phone": "02363932840",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL32",
    "name": "Sân cầu lông Arena.02",
    "city": "Da Nang",
    "district": "Sơn Trà",
    "address": "25 Hồ Hán Thương, Sơn Trà, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL33",
    "name": "Sân Bưu Điện",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "50B Nguyễn Du, Hải Châu, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 7,
    "pickleballCourts": 0,
    "badmintonCourts": 7,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL34",
    "name": "Sân Cầu Lông Đa Phước - Da Phuoc Badminton Court",
    "city": "Da Nang",
    "district": "Hải Châu",
    "address": "Đường Ông Ích Khiêm, Khu đô thị Đa Phước, Hải Châu, Đà Nẵng",
    "phone": "0915571077",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL35",
    "name": "Sân Cầu Lông Trọng Nghĩa - Trong Nghia Badminton Court",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "194 Bế Văn Đàn, Thanh Khê, Đà Nẵng",
    "phone": "0702365369",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 7,
    "pickleballCourts": 0,
    "badmintonCourts": 7,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL36",
    "name": "Câu lạc bộ Bóng Bàn - Cầu Lông Thanh Khê Đông",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "34 Đỗ Ngọc Du, Thanh Khê, Đà Nẵng",
    "phone": "0903579113",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 5,
    "pickleballCourts": 0,
    "badmintonCourts": 5,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL37",
    "name": "Sân cầu lông Kỳ Đồng",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "Thanh Khê, Đà Nẵng",
    "phone": "0905014370",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL38",
    "name": "Sân Trường Đại học Thể dục Thể thao ",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "44 Dũng Sĩ Thanh Khê, Thanh Khê, Đà Nẵng",
    "phone": "02363707188",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 14,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL39",
    "name": "Sân Trường Cao đẳng Thương mại",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "45 Dũng Sĩ Thanh Khê, Thanh Khê, Đà Nẵng",
    "phone": "02363780525",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL40",
    "name": "Sân Cầu Lông Lâm Gia",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "17 Đ. Bàu Năng 11, Hòa Khánh, Đà Nẵng",
    "phone": "0981647647",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh dương đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL41",
    "name": "Ting ting badminton",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "69 Đ. Ngô Thì Nhậm, Liên Chiểu, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": null,
    "pickleballCourts": 0,
    "badmintonCourts": null,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL42",
    "name": "Sân Trường Đại Học Sư Phạm - Đại học Đà Nẵng",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "459 Tôn Đức Thắng, Hòa Khánh, Đà Nẵng",
    "phone": "02363841323",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "7h - 21h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL43",
    "name": "Sân Cầu Lông CBC Badminton ",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "642 Tôn Đức Thắng, Hòa Khánh, Đà Nẵng",
    "phone": "0927990909",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 3,
    "pickleballCourts": 0,
    "badmintonCourts": 3,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL44",
    "name": "SÂN CẦU LÔNG HOT SPORT",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "34VR+6FW, Hải Vân, Đà Nẵng",
    "phone": "",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 4,
    "pickleballCourts": 0,
    "badmintonCourts": 4,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL45",
    "name": "Tin sport Badminton",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "107 Trường Chinh, An Khê, Đà Nẵng",
    "phone": "0935333748",
    "contactName": "",
    "contactChannel": "Fanpage Facebook",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 5,
    "pickleballCourts": 0,
    "badmintonCourts": 5,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL46",
    "name": "ICON BADMINTON",
    "city": "Da Nang",
    "district": "Thanh Khê",
    "address": "122 Tôn Đản, An Khê, Đà Nẵng",
    "phone": "0905591379",
    "contactName": "",
    "contactChannel": "Fanpage Facebook",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 8,
    "pickleballCourts": 0,
    "badmintonCourts": 8,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL47",
    "name": "ACE BADMINTON",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "2a Hòa Nam 6, Hòa Khánh, Đà Nẵng",
    "phone": "0943209797",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 5,
    "pickleballCourts": 0,
    "badmintonCourts": 5,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh dương đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL48",
    "name": "Sân cầu lông Arena.01",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "40 Hoàng Văn Thái, Hòa Khánh, Đà Nẵng",
    "phone": "0788818585",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL49",
    "name": "Sân cầu lông Arena.03",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "38 Hoàng Văn Thái, Hòa Khánh, Đà Nẵng",
    "phone": "0788818585",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 8,
    "pickleballCourts": 0,
    "badmintonCourts": 8,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xanh dương đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  },
  {
    "code": "CL50",
    "name": "ForFun Badminton",
    "city": "Da Nang",
    "district": "Liên Chiểu",
    "address": "102 Hoàng Văn Thái, Hòa Khánh, Đà Nẵng",
    "phone": "0903647267",
    "contactName": "",
    "contactChannel": "Điện thoại trực tiếp",
    "surveyor": "Huân Thành",
    "sports": [
      "BADMINTON"
    ],
    "totalCourts": 6,
    "pickleballCourts": 0,
    "badmintonCourts": 6,
    "venueType": "Trong nhà (Indoor)",
    "quality": "Sân thảm xám đủ tiêu chuẩn, đèn sáng",
    "amenities": "",
    "operatingHours": "5h - 23h30",
    "standardPrice": null,
    "peakPrice": null,
    "targetAudience": "Không giới hạn đối tượng",
    "paymentMethods": "Tiền mặt, chuyển khoản",
    "managementTool": "",
    "mainPainPoint": "",
    "cooperationReadiness": "",
    "featureNeeds": ""
  }
];

module.exports = {
  async up(db, client) {
    console.log('--- Starting Migration: Seed Da Nang Survey Data ---');

    // 1. Seed Organizer Users
    console.log('Seeding organizer users...');
    const userEmails = ORGANIZERS_DATA.map(u => u.email);
    const existingUsers = await db.collection('users').find({ email: { $in: userEmails } }).toArray();
    const existingEmailSet = new Set(existingUsers.map(u => u.email));

    const usersToInsert = ORGANIZERS_DATA
      .filter(u => !existingEmailSet.has(u.email))
      .map(u => ({
        email: u.email,
        name: u.name,
        role: 'ORGANIZER',
        preferences: {
          profileType: 'ORGANIZER',
          sports: [u.sport],
          location: 'Da Nang',
          clubName: u.name,
        },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (usersToInsert.length > 0) {
      await db.collection('users').insertMany(usersToInsert);
      console.log(`Inserted ${usersToInsert.length} new organizer users.`);
    } else {
      console.log('Organizer users already exist.');
    }

    // Fetch all organizers for ID reference
    const allOrgUsers = await db.collection('users').find({ email: { $in: userEmails } }).toArray();
    const emailToUserMap = new Map(allOrgUsers.map(u => [u.email, u]));

    // 2. Seed Tournaments
    console.log('Seeding surveyed tournaments in Da Nang...');
    const tournamentTitles = TOURNAMENTS_DATA.map(t => t.title);
    const existingTournaments = await db.collection('tournaments').find({ title: { $in: tournamentTitles } }).toArray();
    const existingTitleSet = new Set(existingTournaments.map(t => t.title));

    const tournamentsToInsert = TOURNAMENTS_DATA
      .filter(t => !existingTitleSet.has(t.title))
      .map(t => {
        const orgUser = emailToUserMap.get(t.orgEmail);
        return {
          title: t.title,
          description: t.description,
          sport: t.sport,
          time: t.time,
          startDate: new Date(t.startDate),
          endDate: new Date(t.endDate),
          location: t.location,
          district: t.district,
          city: t.city,
          organizer: {
            id: orgUser ? orgUser._id.toString() : 'survey-organizer-id',
            name: orgUser ? orgUser.name : t.orgName,
            isVerified: true,
          },
          status: t.status,
          rules: t.rules,
          rulesText: t.rules,
          categories: t.categories,
          registrationFee: t.registrationFee,
          slotsLimit: t.slotsLimit,
          registrationLink: t.registrationLink,
          reportsCount: t.reportsCount,
          isHidden: t.isHidden,
          isFeatured: t.isFeatured,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    if (tournamentsToInsert.length > 0) {
      await db.collection('tournaments').insertMany(tournamentsToInsert);
      console.log(`Inserted ${tournamentsToInsert.length} new surveyed tournaments.`);
    } else {
      console.log('Surveyed tournaments already exist.');
    }

    // 3. Create & Seed Venues Collection
    console.log('Seeding 50 surveyed venues / courts in Da Nang...');
    const venuesCollection = db.collection('venues');
    
    // Ensure indexes on venues
    await venuesCollection.createIndex({ code: 1 }, { unique: true, background: true });
    await venuesCollection.createIndex({ city: 1, sports: 1 }, { background: true });
    await venuesCollection.createIndex({ district: 1 }, { background: true });

    const venueCodes = VENUES_DATA.map(v => v.code);
    const existingVenues = await venuesCollection.find({ code: { $in: venueCodes } }).toArray();
    const existingCodeSet = new Set(existingVenues.map(v => v.code));

    const venuesToInsert = VENUES_DATA
      .filter(v => !existingCodeSet.has(v.code))
      .map(v => ({
        ...v,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (venuesToInsert.length > 0) {
      await venuesCollection.insertMany(venuesToInsert);
      console.log(`Inserted ${venuesToInsert.length} surveyed venues into 'venues' collection.`);
    } else {
      console.log('Surveyed venues already exist.');
    }

    console.log('--- Migration completed successfully! ---');
  },

  async down(db, client) {
    console.log('--- Rolling back Migration: Seed Da Nang Survey Data ---');

    const tournamentTitles = TOURNAMENTS_DATA.map(t => t.title);
    await db.collection('tournaments').deleteMany({ title: { $in: tournamentTitles } });
    console.log('Deleted seeded tournaments.');

    const userEmails = ORGANIZERS_DATA.map(u => u.email);
    await db.collection('users').deleteMany({ email: { $in: userEmails } });
    console.log('Deleted seeded organizer users.');

    const venueCodes = VENUES_DATA.map(v => v.code);
    await db.collection('venues').deleteMany({ code: { $in: venueCodes } });
    console.log('Deleted seeded venues.');

    console.log('--- Rollback completed successfully! ---');
  }
};
