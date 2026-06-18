import { useState, useMemo } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MatchPending {
  id: string;
  sportId: string;
  sportName: string;
  title: string;
  hostName: string;
  playersCount: number;
  maxPlayers: number;
  level: 'Trung bình' | 'Khá' | 'Tốt' | 'Mọi trình độ';
  time: string;
  note: string;
}

export interface Arena {
  id: string;
  name: string;
  location: Location;
  address: string;
  distance: number; // in km
  rating: number;
  activeMatches: MatchPending[];
}

export const USER_MOCK_LOCATION: Location = {
  latitude: 21.0285,
  longitude: 105.8542,
};

export const MOCK_ARENAS: Arena[] = [
  {
    id: 'arena_1',
    name: 'Sân Cầu Lông Duy Hưng',
    address: 'Số 120 Trịnh Hoài Đức, Cát Linh, Đống Đa, Hà Nội',
    distance: 0.6,
    rating: 4.8,
    location: {
      latitude: 21.0315,
      longitude: 105.8512,
    },
    activeMatches: [
      {
        id: 'match_1',
        sportId: 'badminton',
        sportName: 'Cầu lông',
        title: 'Giao lưu cầu lông đôi nam nữ',
        hostName: 'Nguyễn Văn Nam',
        playersCount: 3,
        maxPlayers: 4,
        level: 'Trung bình',
        time: '19:00 - 21:00 Hôm nay',
        note: 'Cần tìm 1 bạn nữ ghép đôi nam nữ giao lưu vui vẻ, trình độ trung bình.',
      },
      {
        id: 'match_2',
        sportId: 'badminton',
        sportName: 'Cầu lông',
        title: 'Tìm partner đơn nam trình khá',
        hostName: 'Trần Anh Tuấn',
        playersCount: 1,
        maxPlayers: 2,
        level: 'Khá',
        time: '20:00 - 22:00 Hôm nay',
        note: 'Đánh đơn nam đổ mồ hôi, chia tiền sân nước.',
      }
    ],
  },
  {
    id: 'arena_2',
    name: 'Sân Bóng Đá Cầu Giấy',
    address: 'Số 35 Nguyễn Phong Sắc, Dịch Vọng, Cầu Giấy, Hà Nội',
    distance: 1.2,
    rating: 4.5,
    location: {
      latitude: 21.0245,
      longitude: 105.8612,
    },
    activeMatches: [
      {
        id: 'match_3',
        sportId: 'football',
        sportName: 'Bóng đá',
        title: 'Cần 2 măng non đá sân 7 tối nay',
        hostName: 'Lê Minh Quân',
        playersCount: 12,
        maxPlayers: 14,
        level: 'Trung bình',
        time: '20:30 - 22:00 Hôm nay',
        note: 'Đã có áo bib, chỉ cần xách giày vào đá. Giao lưu vui vẻ không quạu.',
      }
    ],
  },
  {
    id: 'arena_3',
    name: 'Sân Bóng Rổ Bách Khoa',
    address: 'Khu thể thao Bách Khoa, Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
    distance: 1.8,
    rating: 4.6,
    location: {
      latitude: 21.0185,
      longitude: 105.8452,
    },
    activeMatches: [
      {
        id: 'match_4',
        sportId: 'basketball',
        sportName: 'Bóng rổ',
        title: 'Bóng rổ 3v3 nửa sân hội sinh viên',
        hostName: 'Hoàng Quốc Việt',
        playersCount: 5,
        maxPlayers: 6,
        level: 'Mọi trình độ',
        time: '17:30 - 19:30 Hôm nay',
        note: 'Tìm 1 bạn ghép đội chơi 3v3 nửa sân, tính điểm giao lưu nhẹ nhàng.',
      }
    ],
  },
  {
    id: 'arena_4',
    name: 'CLB Tennis Ba Đình',
    address: 'Số 2 Hoàng Văn Thụ, Quán Thánh, Ba Đình, Hà Nội',
    distance: 2.1,
    rating: 4.7,
    location: {
      latitude: 21.0365,
      longitude: 105.8392,
    },
    activeMatches: [
      {
        id: 'match_5',
        sportId: 'tennis',
        sportName: 'Quần vợt',
        title: 'Kèo đơn nam tennis cuối tuần',
        hostName: 'Phạm Hồng Thái',
        playersCount: 1,
        maxPlayers: 2,
        level: 'Khá',
        time: '08:00 - 10:00 Chủ Nhật',
        note: 'Đánh đơn nam mồ hôi cuối tuần, chia đôi tiền sân bóng.',
      }
    ],
  },
  {
    id: 'arena_5',
    name: 'CLB Bóng Bàn Tràng Thi',
    address: 'Số 42 Tràng Thi, Hàng Bông, Hoàn Kiếm, Hà Nội',
    distance: 0.9,
    rating: 4.4,
    location: {
      latitude: 21.0265,
      longitude: 105.8442,
    },
    activeMatches: [
      {
        id: 'match_6',
        sportId: 'table_tennis',
        sportName: 'Bóng bàn',
        title: 'Giao lưu bóng bàn đơn/đôi bóng bàn cỏ',
        hostName: 'Đặng Tiến Đạt',
        playersCount: 2,
        maxPlayers: 4,
        level: 'Trung bình',
        time: '18:00 - 20:00 Ngày mai',
        note: 'Có sẵn vợt cho mượn, chơi bia cỏ giao hữu vui vẻ.',
      }
    ],
  },
];

export function useMockData() {
  const [arenas] = useState<Arena[]>(MOCK_ARENAS);
  const userLocation = USER_MOCK_LOCATION;

  const getArenasBySport = (sportId: string) => {
    return arenas.filter(arena => 
      arena.activeMatches.some(match => match.sportId === sportId)
    );
  };

  return {
    userLocation,
    arenas,
    getArenasBySport,
  };
}
