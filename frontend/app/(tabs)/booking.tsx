import React, { useState, useMemo } from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, MapPin, Calendar, Clock, Check, ChevronRight, Info, CreditCard } from 'lucide-react-native';
import { useMockData } from '@/hooks/useMockData';
import { SPORTS_LIST } from '@/constants/MockData';
import { Venue, TimeSlot } from '@/types';

export default function BookingScreen() {
  const { 
    venues, 
    selectedSportFilter, 
    setSelectedSportFilter, 
    bookVenueSlot,
    selectedDate,
    setSelectedDate
  } = useMockData();

  // Filter venues by sport
  const filteredVenues = venues.filter(v => v.sport === selectedSportFilter);

  // Active venue defaults to first matching venue
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    filteredVenues.length > 0 ? filteredVenues[0].id : (venues.length > 0 ? venues[0].id : '')
  );
  
  const activeVenue = venues.find(v => v.id === selectedVenueId) || (filteredVenues.length > 0 ? filteredVenues[0] : null);

  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'visa' | 'wallet'>('wallet');
  const [isSuccessLocal, setIsSuccessLocal] = useState(false);

  // Generate next 7 days for horizontal calendar selector
  const next7Days = useMemo(() => {
    const days = [];
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'H.nay' : weekdays[d.getDay()];
      const dayNum = d.getDate();
      days.push({
        dateString,
        dayName,
        dayNum,
      });
    }
    return days;
  }, []);

  const handleSportChange = (sportId: any) => {
    setSelectedSportFilter(sportId);
    const matching = venues.filter(v => v.sport === sportId);
    if (matching.length > 0) {
      setSelectedVenueId(matching[0].id);
    }
    setSelectedSlots([]);
  };

  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
    setSelectedSlots([]);
  };

  // Helper to check if selected slots are consecutive
  const isConsecutive = (slots: TimeSlot[]) => {
    if (slots.length <= 1) return true;
    const sorted = [...slots].sort((a, b) => {
      const startA = a.time.split(' - ')[0];
      const startB = b.time.split(' - ')[0];
      return startA.localeCompare(startB);
    });
    
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = sorted[i - 1].time.split(' - ')[1];
      const currentStart = sorted[i].time.split(' - ')[0];
      if (prevEnd !== currentStart) {
        return false;
      }
    }
    return true;
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isBooked) return;
    
    const isAlreadySelected = selectedSlots.some(s => s.time === slot.time);
    if (isAlreadySelected) {
      const nextSelection = selectedSlots.filter(s => s.time !== slot.time);
      if (nextSelection.length === 0 || isConsecutive(nextSelection)) {
        setSelectedSlots(nextSelection);
      } else {
        Alert.alert(
          'Thông báo',
          'Không thể bỏ chọn khung giờ ở giữa. Lựa chọn sẽ được đặt lại từ khung giờ này.',
          [{ text: 'OK', onPress: () => setSelectedSlots([slot]) }]
        );
      }
    } else {
      const nextSelection = [...selectedSlots, slot];
      if (isConsecutive(nextSelection)) {
        setSelectedSlots(nextSelection);
      } else {
        Alert.alert(
          'Thông báo',
          'Vui lòng chọn các khung giờ liền kề nhau. Lịch đặt của bạn đã được thiết lập lại từ khung giờ mới này.',
          [{ text: 'OK', onPress: () => setSelectedSlots([slot]) }]
        );
      }
    }
  };

  const handleBookNowInit = () => {
    if (selectedSlots.length === 0) return;
    setShowCheckout(true);
  };

  const handleConfirmBooking = () => {
    if (!activeVenue || selectedSlots.length === 0) return;

    const slotTimes = selectedSlots.map(s => s.time);
    const success = bookVenueSlot(activeVenue.id, slotTimes, selectedDate);
    
    if (success) {
      setIsSuccessLocal(true);
      setTimeout(() => {
        setIsSuccessLocal(false);
        setShowCheckout(false);
        setSelectedSlots([]);
      }, 2200);
    } else {
      Alert.alert('Lỗi', 'Một trong các khung giờ đã được chọn trước đó. Vui lòng chọn khung giờ khác.');
    }
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString('vi-VN') + ' đ';
  };

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  }, [selectedSlots]);

  const displayDateStr = useMemo(() => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-');
    return `${day}/${month}/${year}`;
  }, [selectedDate]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* 1. Horizontal Sport Filter Tabs at top */}
      <View className="flex-shrink-0 bg-secondary border-b border-borderGray/30 py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {SPORTS_LIST.map((sport) => {
            const isActive = selectedSportFilter === sport.id;
            return (
              <TouchableOpacity
                key={sport.id}
                onPress={() => handleSportChange(sport.id)}
                className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                  isActive ? 'bg-accent' : 'bg-background border border-borderGray'
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-xs">{sport.emoji}</Text>
                <Text className={`text-xs font-semibold ${isActive ? 'text-black font-bold' : 'text-textGray'}`}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. 7-Day Horizontal Calendar Slider */}
      <View className="flex-shrink-0 bg-secondary/80 border-b border-borderGray/40 py-2.5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {next7Days.map((day) => {
            const isActive = selectedDate === day.dateString;
            return (
              <TouchableOpacity
                key={day.dateString}
                onPress={() => {
                  setSelectedDate(day.dateString);
                  setSelectedSlots([]); // Clear selections when changing date
                }}
                className={`w-14 h-16 rounded-xl flex items-center justify-center border ${
                  isActive 
                    ? 'bg-accent border-accent text-black' 
                    : 'bg-background border-borderGray/80'
                }`}
                activeOpacity={0.75}
              >
                <Text className={`text-[9px] font-black uppercase ${isActive ? 'text-black' : 'text-textGray'}`}>
                  {day.dayName}
                </Text>
                <Text className={`text-base font-black mt-0.5 ${isActive ? 'text-black' : 'text-white'}`}>
                  {day.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Contents Scrollable */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      >
        {/* Venue Slider Cards */}
        <View className="px-4">
          <Text className="text-[10px] text-textGray uppercase font-black tracking-widest mb-2">
            Đại lý Sân Thể Thao ({filteredVenues.length})
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
          >
            {filteredVenues.map((venue) => {
              const isActive = selectedVenueId === venue.id;
              return (
                <TouchableOpacity
                  key={venue.id}
                  onPress={() => handleVenueChange(venue.id)}
                  className={`w-64 rounded-xl overflow-hidden bg-secondary border ${
                    isActive ? 'border-accent' : 'border-borderGray opacity-75'
                  }`}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: venue.imageUrl }} className="h-28 w-full" />
                  <View className="p-3">
                    <View className="flex-row justify-between items-start gap-1">
                      <Text className="text-xs font-extrabold text-white truncate max-w-[150px]">{venue.name}</Text>
                      <View className="bg-background px-1.5 py-0.5 rounded flex-row items-center gap-0.5">
                        <Star size={10} color="#FFD700" fill="#FFD700" />
                        <Text className="text-[10px] text-amber-400 font-bold">{venue.rating}</Text>
                      </View>
                    </View>
                    <Text className="text-[10px] text-textGray truncate mt-1" numberOfLines={1}>
                      📍 {venue.distance} km • {venue.address}
                    </Text>
                    <Text className="text-[10px] text-accent font-bold mt-1">
                      Từ {formatPrice(venue.pricePerHour)} / giờ
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredVenues.length === 0 && (
              <View className="w-full py-6 items-center border border-dashed border-borderGray rounded-xl">
                <Text className="text-xs text-textGray">
                  Chưa cập nhật sân mới cho môn này. Thử chọn "Cầu lông" hoặc "Bóng đá"!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Selected Venue Info & Slot Selection Matrix */}
        {activeVenue && (
          <View className="mt-4 px-4">
            <View className="bg-secondary/60 p-4 border border-borderGray rounded-2xl">
              <Text className="text-[10px] text-textGray uppercase font-black tracking-widest mb-2">
                Chọn khung giờ (Time-slot matrix)
              </Text>
              
              {/* Legend */}
              <View className="flex-row gap-4 mb-4">
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 rounded bg-secondary border border-borderGray" />
                  <Text className="text-[10px] text-textGray">Hết chỗ</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 rounded bg-background border border-borderGray" />
                  <Text className="text-[10px] text-textGray">Trống</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 rounded bg-accent" />
                  <Text className="text-[10px] text-textGray">Bạn chọn</Text>
                </View>
              </View>

              {/* Grid 2x4 Slots */}
              <View className="flex-row flex-wrap justify-between gap-y-2.5">
                {activeVenue.slots.map((slot) => {
                  const isSelected = selectedSlots.some(s => s.time === slot.time);
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      disabled={slot.isBooked}
                      onPress={() => handleSlotSelect(slot)}
                      className={`w-[48%] py-3 px-3 rounded-xl border flex-col justify-between ${
                        slot.isBooked 
                          ? 'bg-secondary/50 border-background opacity-50' 
                          : isSelected
                            ? 'bg-accent border-accent text-black'
                            : 'bg-background border-borderGray text-white'
                      }`}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row justify-between items-center w-full mb-1">
                        <Text className={`text-[11px] font-bold tracking-tight ${isSelected ? 'text-black' : 'text-white'}`}>
                          {slot.time}
                        </Text>
                        {slot.isBooked ? (
                          <Text className="text-[9px] text-textGray/60 uppercase font-bold">Bận</Text>
                        ) : isSelected ? (
                          <View className="w-3.5 h-3.5 rounded-full bg-black items-center justify-center">
                            <Check size={8} color="#39FF14" strokeWidth={3} />
                          </View>
                        ) : slot.isPeak ? (
                          <Text className="text-[10px]">🔥</Text>
                        ) : null}
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className={`text-[10px] ${isSelected ? 'text-black font-black' : 'text-textGray font-semibold'}`}>
                          {formatPrice(slot.price)}
                        </Text>
                        {slot.isPeak && !slot.isBooked && (
                          <Text className={`text-[8px] font-extrabold uppercase tracking-widest ${isSelected ? 'text-black/70' : 'text-accent'}`}>
                            Peak
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="mt-3.5 flex-row items-start gap-2">
                <Info size={14} color="#39FF14" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text className="text-[10px] text-textGray leading-normal flex-1">
                  Nửa dưới bầu trời (Thumb Zone) tối ưu đặt lịch siêu nhanh trong 5 giây bằng cách nhấp chọn khung giờ và xác nhận đặt sân bằng thanh điều khiển bên dưới.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 3. STICKY BOTTOM RESERVATION CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-secondary/90 border-t border-borderGray p-4 pb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-[9px] text-textGray uppercase tracking-widest">Tổng tiền thanh toán</Text>
          <Text className="text-sm font-black text-accent mt-0.5">
            {selectedSlots.length > 0 ? formatPrice(totalPrice) : '0 đ'}
          </Text>
        </View>
        
        <TouchableOpacity
          disabled={selectedSlots.length === 0}
          onPress={handleBookNowInit}
          className={`py-3 px-6 rounded-2xl flex-row items-center gap-1 ${
            selectedSlots.length > 0 ? 'bg-accent' : 'bg-secondary border border-borderGray opacity-55'
          }`}
          activeOpacity={0.8}
        >
          <Text className={`text-xs font-black uppercase tracking-wider ${selectedSlots.length > 0 ? 'text-black' : 'text-textGray'}`}>
            Đặt sân ngay
          </Text>
          <ChevronRight size={14} color={selectedSlots.length > 0 ? '#000000' : '#8E8E93'} />
        </TouchableOpacity>
      </View>

      {/* 4. OVERLAY CHECKOUT SHEET */}
      {showCheckout && activeVenue && selectedSlots.length > 0 && (
        <View className="absolute inset-0 bg-black/60 z-40 justify-end">
          {/* Backdrop Tap to close */}
          <TouchableOpacity className="absolute inset-0" onPress={() => setShowCheckout(false)} />
          
          <View className="w-full bg-[#0d1424] border-t border-borderGray rounded-t-3xl p-4 pb-8 space-y-4 z-50">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-2 border-b border-borderGray/50">
              <Text className="text-xs font-bold text-white uppercase tracking-wider">Hóa đơn booking sân</Text>
              <TouchableOpacity 
                onPress={() => setShowCheckout(false)}
                className="w-6 h-6 rounded-full bg-slate-900 border border-borderGray flex items-center justify-center"
              >
                <Text className="text-textGray text-xs">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Receipt Card */}
            <View className="bg-slate-900/80 border border-borderGray/50 p-3 rounded-xl gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-textGray">🏟️ Tên sân:</Text>
                <Text className="text-xs font-semibold text-white max-w-[150px] truncate" numberOfLines={1}>{activeVenue.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-textGray">🗓️ Ngày đặt:</Text>
                <Text className="text-xs font-semibold text-white">{displayDateStr}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-textGray">🕒 Khung giờ ({selectedSlots.length} slot):</Text>
                <Text className="text-xs font-semibold text-accent text-right max-w-[180px]">
                  {selectedSlots.map(s => s.time).join(', ')}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-borderGray/30 pt-2">
                <Text className="text-sm font-bold text-slate-200">Tổng thanh toán:</Text>
                <Text className="text-sm font-black text-accent">{formatPrice(totalPrice)}</Text>
              </View>
            </View>

            {/* Payment Methods */}
            <View className="mt-2">
              <Text className="text-[10px] text-textGray uppercase font-black tracking-widest mb-2">
                Hình thức thanh toán
              </Text>
              <View className="flex-row justify-between gap-2">
                <TouchableOpacity
                  onPress={() => setPaymentMethod('wallet')}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                    paymentMethod === 'wallet' ? 'bg-accent/10 border-accent' : 'bg-background border-borderGray'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-base mb-1">💼</Text>
                  <Text className={`text-[9px] font-bold ${paymentMethod === 'wallet' ? 'text-accent' : 'text-textGray'}`}>
                    Ví Courtmate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('momo')}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                    paymentMethod === 'momo' ? 'bg-rose-500/10 border-rose-500' : 'bg-background border-borderGray'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-base mb-1">🌸</Text>
                  <Text className={`text-[9px] font-bold ${paymentMethod === 'momo' ? 'text-rose-400' : 'text-textGray'}`}>
                    Ví MoMo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('visa')}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                    paymentMethod === 'visa' ? 'bg-sky-500/10 border-sky-500' : 'bg-background border-borderGray'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-base mb-1">💳</Text>
                  <Text className={`text-[9px] font-bold ${paymentMethod === 'visa' ? 'text-sky-400' : 'text-textGray'}`}>
                    Visa/Master
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pay button */}
            <TouchableOpacity
              onPress={handleConfirmBooking}
              className="w-full bg-accent py-3.5 rounded-2xl items-center justify-center flex-row gap-1.5 mt-2"
              activeOpacity={0.8}
            >
              <Text className="text-black text-xs font-black uppercase tracking-wider">Xác nhận thanh toán</Text>
              <CreditCard size={14} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 5. SUCCESS PAYMENT SPLASH */}
      {isSuccessLocal && (
        <View className="absolute inset-0 z-50 bg-background/95 justify-center items-center p-6 text-center">
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-6 shadow-xl shadow-accent/30">
            <Check size={36} color="#000000" strokeWidth={3} />
          </View>
          <Text className="text-[10px] text-accent uppercase font-black tracking-widest mb-1 text-center">
            Đặt sân thành công!
          </Text>
          <Text className="text-base font-black text-white max-w-[240px] leading-snug mb-2 text-center">
            Cảm ơn bạn đã đặt sân qua Courtmate
          </Text>
          <Text className="text-xs text-textGray max-w-[200px] text-center">
            Hóa đơn điện tử và thẻ ra sân đã được tự động thêm vào lịch trình của bạn.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

