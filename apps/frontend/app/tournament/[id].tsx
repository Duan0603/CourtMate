import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Image, Alert, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Share, MapPin, Calendar, CreditCard, ArrowRight } from 'lucide-react-native';
import { tournamentsApi } from '../../src/features/tournaments/services/tournaments.api';
import { Tournament, TournamentStatus } from '@courtmate/shared';
import { Typography } from '../../src/components/ui/Typography';
import { MOCK_ACTIVE_TOURNAMENTS, MOCK_RECOMMENDED } from '../../src/features/dashboard/screens/DashboardScreen';

function formatFee(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function getMinFee(tournament: Tournament) {
  const fees = tournament.categories?.map((c) => c.fee).filter((f) => Number.isFinite(f)) ?? [];
  return fees.length ? Math.min(...fees) : tournament.registrationFee ?? 45000;
}

export default function TournamentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const mockData = [...MOCK_ACTIVE_TOURNAMENTS, ...MOCK_RECOMMENDED].find(t => t.id === id);
      if (mockData) {
        setTournament({
          id: mockData.id,
          title: mockData.title,
          sport: mockData.sport,
          location: (mockData as any).location || (mockData as any).info,
          startDate: new Date(),
          categories: [{ name: 'Intermediate', fee: 45000 }],
          status: TournamentStatus.OPEN,
          description: "Tham gia giải đấu vòng loại được mong đợi nhất mùa giải.",
          image: (mockData as any).image || undefined,
        } as any);
        setIsLoading(false);
      } else {
        tournamentsApi.getTournamentDetails(id)
          .then(res => {
            const data = (res as any).data || res;
            setTournament(data);
          })
          .catch(err => {
            console.error(err);
            Alert.alert('Lỗi', 'Không thể tải thông tin giải đấu');
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [id]);

  const handleOpenMap = () => {
    const loc = tournament?.location || 'Metro Tennis Center New York';
    const query = encodeURIComponent(loc);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`
    });
    Linking.openURL(url);
  };

  const minFee = useMemo(() => (tournament ? getMinFee(tournament) : 0), [tournament]);

  // Render dummy avatars for participant roster
  const dummyAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqU6IpSkFIimKXiUYhOscsR4L0dPJOW0aXaSQRaDFjHWRZqhfA0i3G7aIPIK2n3GD8a0Y39LcDz-YDb4KCokzpGCLUcv8ReG_gL0v2bJQlXrt1XUiqzThac4JSPz5T1xv_mnDE_2ollTfm7mlgvkoD7e3VU0ejL0Zoiu-CmHDv0gWsq64ioCFm4oQMN4YFvEy1bFcE69A4lzkKO9dz5LxAUKY6MtTKcwlpnXYSpEYC7LrPhc6eIEDRzw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTpL9d84gPMerrKM6krAeDqQaMB8VXzxeWG1RmryoTyvYbASH3dnEWVLeYU3w7kmDNeY8OlMEwmsoiu3QJgHT4SbGFdhlBNnTVjnwzqsadQa8VlLUSyb7sd3GgFa12Dk1-hul09MvEmGXoeDXofjEZ5M11A_zCmHcpclfeqVfn2d2KularfxS88oqEWg5jhZgh6fqaCpmBCxxpVI69tWy_pAbZ8XHtdpdMBlxfWlgkZkFdeX5eXswdSQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAaGOXp9zKSia58kO94VMjc97HLw8iHNm1zG-LX9dl0AZwUH0K-IUOOpsWelNAiXQCpPDo3igaBdg87pIUW2kal6tZ586Zes7Mfkn5pOD7UXFabWVq_F2fpjcMvlya590QXQPI4hNQD0ZEF3M1WQnhMohqDhYLFsuynTlx96dnG3WLptDYfjHWrkQ1kSWud5R2hvF-lSkDnMmkCp7xfnvdgWkTfmNPgwcVJT2SbiUhAKgTOKAQRy5OoLw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzcv4qok8PlbQvbc_5aj42pL2dq8Qpc3ma7xL4hry6W2NYPDVeSLSV5MwKCK8-2K3pL-zzMDBomEqEPcuPeosp4upPhi61hmY0n6JvyQBzPwvA5TJotET2iVcJzEH-3G3-eA2fpwMPiUta3GGTP0u-lje0p1aFD1sbwl5x9dSMz_BtL17hT_5p0l8fvz8jUL-6DmftIN1Asz1beWFglJ5L0p1HseHLXbUsvLUlW20P70Trr8NQ1qnBVw',
  ];

  if (isLoading) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Top Navigation Bar */}
      <View className="w-full absolute top-0 z-50 bg-surface/80 flex-row items-center justify-between px-md py-sm shadow-sm" style={{ paddingTop: 40 }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft color="#000000" size={28} />
        </TouchableOpacity>
        <Typography variant="headline-lg-mobile" className="text-primary font-bold">
          CourtMate
        </Typography>
        <TouchableOpacity className="p-2" onPress={() => Alert.alert('Chia sẻ', 'Tính năng đang phát triển')}>
          <Share color="#000000" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="w-full h-72 relative">
          <ImageBackground 
            source={{ uri: (tournament as any)?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj-0SSKmPxFPxl2kcGyexPAHUzeiHTt5T_dpw5zUC_BgF4oqj0qN2FqojB7T9pyiQlAHbutjMpw1wuTlPwquFEqJRafoTN0dhkaKgq4zCWuk_btYP6JcNPSqj6rI9' }}
            className="w-full h-full justify-end"
            resizeMode="cover"
          >
            {/* Gradient Overlay simulation */}
            <View className="absolute inset-0 bg-black/30" />
            
            {/* Badges Overlay */}
            <View className="absolute bottom-10 left-md right-md flex-row flex-wrap space-x-sm">
              <View className="bg-secondary-container px-md py-xs rounded-full">
                <Typography variant="label-sm" color="white" className="uppercase tracking-wider">
                  {tournament?.sport || 'Quần vợt'}
                </Typography>
              </View>
              <View className="bg-surface-container-highest px-md py-xs rounded-full">
                <Typography variant="label-sm" className="text-on-surface uppercase tracking-wider">
                  Sân cứng
                </Typography>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content Canvas */}
        <View className="px-md -mt-xl z-10 space-y-lg">
          
          {/* Header Info */}
          <View className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 }}>
            <Typography variant="headline-md" className="text-primary mb-xs font-bold">
              {tournament?.title || 'Spring Open Qualifiers'}
            </Typography>
            <View className="flex-row items-center space-x-xs mb-md">
              <MapPin color="#45464d" size={18} />
              <Typography variant="label-md" className="text-on-surface-variant ml-1">
                {tournament?.location || 'Metro Tennis Center, NY'}
              </Typography>
            </View>
            
            <View className="flex-row border-t border-outline-variant/20 pt-md mt-md">
              <View className="flex-1">
                <Typography variant="label-sm" className="text-on-surface-variant uppercase">Trình độ</Typography>
                <Typography variant="headline-md" className="text-primary mt-1 font-bold">
                  {tournament?.categories?.[0]?.name || 'Trung bình'}
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="label-sm" className="text-on-surface-variant uppercase">Thể thức</Typography>
                <Typography variant="headline-md" className="text-primary mt-1 font-bold">Loại trực tiếp</Typography>
              </View>
            </View>
          </View>

          {/* Overview Section */}
          <View className="space-y-sm mt-lg">
            <Typography variant="label-sm" className="text-on-surface-variant tracking-widest uppercase px-xs">Tổng quan</Typography>
            <View className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 mt-xs">
              <Typography variant="body-md" className="text-on-surface-variant leading-[24px]">
                {tournament?.description || "Tham gia giải đấu vòng loại được mong đợi nhất mùa giải. Một sân chơi chuyên nghiệp và cạnh tranh."}
              </Typography>
              
              {/* Richer detail elements to fix "quá ít thông tin" */}
              <View className="border-t border-outline-variant/20 pt-md mt-md space-y-sm">
                <Typography variant="label-sm" className="text-on-surface-variant font-bold">CHI TIẾT GIẢI ĐẤU</Typography>
                <Typography variant="body-md" className="text-on-surface-variant">
                  • <Typography variant="label-md" className="text-primary font-bold">Thể thức thi đấu:</Typography> Đấu đơn/đôi loại trực tiếp (Knock-out stage).
                </Typography>
                <Typography variant="body-md" className="text-on-surface-variant">
                  • <Typography variant="label-md" className="text-primary font-bold">Giải thưởng:</Typography> Cúp vô địch + Huy chương + Quà tặng nhà tài trợ.
                </Typography>
                <Typography variant="body-md" className="text-on-surface-variant">
                  • <Typography variant="label-md" className="text-primary font-bold">Yêu cầu:</Typography> Có mặt trước giờ thi đấu 15 phút để làm thủ tục check-in.
                </Typography>
              </View>

              <View className="mt-md flex-row items-center space-x-md border-t border-outline-variant/20 pt-md">
                <View className="flex-row items-center space-x-xs">
                  <Calendar color="#1d4ed8" size={20} />
                  <Typography variant="label-md" className="text-primary ml-1 font-medium">
                    {tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'May 12 - 14'}
                  </Typography>
                </View>
                <View className="flex-row items-center space-x-xs">
                  <CreditCard color="#1d4ed8" size={20} />
                  <Typography variant="label-md" className="text-primary ml-1 font-medium">
                    {formatFee(minFee)}
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Participant Roster */}
          <View className="space-y-sm mt-lg">
            <View className="flex-row justify-between items-end px-xs">
              <Typography variant="label-sm" className="text-on-surface-variant tracking-widest uppercase">Danh sách đăng ký</Typography>
              <Typography variant="label-sm" className="text-secondary">24 / 32 Đã đăng ký</Typography>
            </View>
            <View className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 mt-xs">
              <View className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mb-md">
                <View className="bg-secondary h-full rounded-full w-[75%]" />
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row overflow-hidden" style={{ paddingLeft: 10 }}>
                  {dummyAvatars.map((avatar, idx) => (
                    <View key={idx} className="h-10 w-10 rounded-full border-2 border-surface-container-lowest bg-surface-variant overflow-hidden" style={{ marginLeft: -12 }}>
                      <Image source={{ uri: avatar }} className="h-full w-full" />
                    </View>
                  ))}
                  <View className="h-10 w-10 rounded-full border-2 border-surface-container-lowest bg-secondary-container items-center justify-center" style={{ marginLeft: -12 }}>
                    <Typography variant="label-sm" className="text-on-secondary-container">+20</Typography>
                  </View>
                </View>

                <TouchableOpacity 
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={() => router.push(`/register/${id}`)}
                  style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}
                >
                  <Typography variant="label-md" color="white" className="font-bold">Đăng ký ngay</Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Venue & Map */}
          <View className="space-y-sm mt-lg mb-6">
            <Typography variant="label-sm" className="text-on-surface-variant tracking-widest uppercase px-xs">Địa điểm thi đấu</Typography>
            <View className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 mt-xs">
              <TouchableOpacity className="h-40 w-full bg-surface-variant relative overflow-hidden" onPress={handleOpenMap} activeOpacity={0.8}>
                <ImageBackground 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoxXkRV5jt0fyHLKlxEKLay4HKlVSLvecabzcT-9VX0jc_04bohVm6TttGBxPIYegInj5dByHEMScJo4a2lwfH-LTjneGHoMUcJnPbmm03Tqjo49c9FgV7BDjSPJOkdsi-AfkKhweUurQnYtanisc_mO8rfnJxhPSdTi_PrQDYWjGLWuBc3IvjG3FCS74GfAyPgh_xMZb3OuSHGoayz9BEj20RqYvKzHq6LX_CV_vm2K2it8_2Q7E_yQ' }}
                  className="w-full h-full opacity-80"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-secondary p-2 rounded-full" style={{ elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 }}>
                    <MapPin color="#ffffff" size={24} />
                  </View>
                </View>
              </TouchableOpacity>
              <View className="p-md pointer-events-none">
                <Typography variant="label-md" className="text-primary font-bold mb-1">
                  {tournament?.location || 'Metro Tennis Center'}
                </Typography>
                <Typography variant="label-sm" className="text-on-surface-variant">
                  {tournament?.district ? `${tournament.district}, ` : ''}{tournament?.city || 'New York, NY 10001'}
                </Typography>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Bottom Action Panel */}
      <View className="bg-surface-container-lowest/95 border-t border-outline-variant/30 px-md py-lg flex-row items-center space-x-md" style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
        <View className="flex-1">
          <Typography variant="label-sm" className="text-on-surface-variant">Giá đăng ký sớm</Typography>
          <Typography variant="headline-md" className="text-primary font-bold">{formatFee(minFee)}</Typography>
        </View>
        <TouchableOpacity 
          className="flex-[2] bg-primary rounded-xl py-md flex-row items-center justify-center space-x-sm"
          onPress={() => router.push(`/register/${id}`)}
        >
          <Typography variant="headline-md" color="white" className="font-bold">Đăng ký thi đấu</Typography>
          <ArrowRight color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
