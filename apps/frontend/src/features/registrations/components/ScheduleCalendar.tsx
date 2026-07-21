import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';

const NAVY = '#00102F';
const YELLOW = '#FFC400';
const MUTED = '#52627A';
const BORDER = 'rgba(0,16,47,0.12)';

const WEEKS = ['CN', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'];
const TABS = ['TẤT CẢ', 'SẮP TỚI', 'ĐÃ QUA'];

interface ScheduleCalendarProps {
  registrations: any[];
  apiTournaments: any[];
  initialDate?: string | Date;
}

export function ScheduleCalendar({ registrations, apiTournaments, initialDate }: ScheduleCalendarProps) {
  const [activeTab, setActiveTab] = useState('TẤT CẢ');
  const [currentDate, setCurrentDate] = useState(() => {
    const requestedDate = initialDate ? new Date(initialDate) : new Date(Date.now());
    return isNaN(requestedDate.getTime()) ? new Date(Date.now()) : requestedDate;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const paidRegistrationCount = registrations.filter(registration => registration.status === 'PAID').length;

  useEffect(() => {
    const requestedDate = initialDate ? new Date(initialDate) : new Date(Date.now());
    if (isNaN(requestedDate.getTime())) return;
    setCurrentDate(new Date(requestedDate.getFullYear(), requestedDate.getMonth(), 1));
    setSelectedDate(null);
  }, [initialDate ? new Date(initialDate).getTime() : undefined]);

  // Collect all match dates from registered tournaments
  const matchEvents = useMemo(() => {
    const events: Record<string, any[]> = {};
    
    registrations.forEach(reg => {
      // A tournament only becomes part of the player's schedule after the
      // payment callback has confirmed the registration as paid.
      if (reg.status !== 'PAID') return;

      // Robust string comparison for IDs (converting both to string)
      const t = apiTournaments.find(item => 
        String(item.id || item._id) === String(reg.tournamentId)
      );
      if (!t) return;

      const dates = t.matchDates?.length
        ? t.matchDates
        : [t.startDate].filter(Boolean);
      if (!dates || dates.length === 0) return;
      
      dates.forEach((dateString: any) => {
        if (!dateString) return;
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return;
        
        // Use local date part to format dateKey to avoid timezone shift
        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
        
        if (!events[dateKey]) events[dateKey] = [];
        
        // Avoid duplicate events on same date for the same registration
        const isDuplicate = events[dateKey].some(e => e.id === (reg.id || reg._id));
        if (!isDuplicate) {
          events[dateKey].push({
            id: reg.id || reg._id,
            title: t.title,
            sport: t.sport,
            location: t.location || t.info || 'Đang cập nhật địa điểm',
            status: reg.status,
            time: t.time || '08:00',
          });
        }
      });
    });
    
    return events;
  }, [registrations, apiTournaments]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  // Filter events based on active tab and selected date
  const displayEvents = useMemo(() => {
    if (selectedDate) {
      const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
      return matchEvents[key] || [];
    }

    // If no date selected, show all for the current month
    const allCurrentMonth: any[] = [];
    Object.keys(matchEvents).forEach(key => {
      const [y, m] = key.split('-').map(Number);
      if (y === currentDate.getFullYear() && m === currentDate.getMonth()) {
        allCurrentMonth.push(...matchEvents[key]);
      }
    });
    
    return allCurrentMonth.filter((item, index, self) => 
      index === self.findIndex((t) => (t.id === item.id))
    );
  }, [matchEvents, selectedDate, currentDate, activeTab]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
      {/* Top Tabs (Semester style) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 }}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isActive ? (index === 0 ? YELLOW : '#FFFFFF') : 'transparent',
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: isActive && index > 0 ? BORDER : 'transparent',
                shadowColor: isActive ? '#000' : 'transparent',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Text style={{ 
                color: isActive && index === 0 ? '#FFFFFF' : NAVY, 
                fontWeight: '600', 
                fontSize: 12,
                opacity: isActive ? 1 : 0.6 
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calendar Header */}
      <View style={{ backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: BORDER }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
            <ChevronLeft color={NAVY} size={20} />
          </TouchableOpacity>
          <Text style={{ color: NAVY, fontSize: 16, fontWeight: '600' }}>
            Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8 }}>
            <ChevronRight color={NAVY} size={20} />
          </TouchableOpacity>
        </View>

        {/* Days of week */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {WEEKS.map(w => (
            <Text key={w} style={{ flex: 1, textAlign: 'center', color: MUTED, fontSize: 12, fontWeight: '500' }}>{w}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={{ width: '14.28%', height: 48 }} />;
            
            const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const eventsOnDay = matchEvents[dateKey] || [];
            const hasEvent = eventsOnDay.length > 0;
            const isSelected = selectedDate?.getDate() === day.getDate() && selectedDate?.getMonth() === day.getMonth() && selectedDate?.getFullYear() === day.getFullYear();
            return (
              <TouchableOpacity 
                key={dateKey}
                onPress={() => setSelectedDate(isSelected ? null : day)}
                style={{ 
                  width: '14.28%', 
                  height: 48, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <View style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: isSelected ? NAVY : 'transparent',
                }}>
                  <Text style={{ 
                    color: isSelected ? '#FFFFFF' : NAVY,
                    fontSize: 14, 
                    fontWeight: isSelected ? '600' : '400'
                  }}>
                    {day.getDate()}
                  </Text>
                </View>
                {/* Event Dots */}
                <View style={{ flexDirection: 'row', marginTop: 2, height: 4 }}>
                  {hasEvent && eventsOnDay.slice(0, 3).map((e, i) => (
                    <View 
                      key={i} 
                      style={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: 2, 
                        backgroundColor: e.sport === 'PICKLEBALL' ? '#F97316' : e.sport === 'BADMINTON' ? '#22C55E' : '#EF4444', 
                        marginHorizontal: 1 
                      }} 
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Event List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: NAVY, fontSize: 16, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
          {selectedDate ? `Lịch thi đấu ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}` : 'Tất cả sự kiện trong tháng'}
        </Text>

        {displayEvents.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', paddingHorizontal: 16 }}>
              {registrations.length > 0 && paidRegistrationCount === 0
                ? `Bạn có ${registrations.length} hồ sơ đăng ký nhưng chưa có khoản thanh toán thành công.`
                : 'Không có trận đấu nào được lên lịch trong tháng này.'}
            </Text>
          </View>
        ) : (
          displayEvents.map((event, index) => (
            <View key={`${event.id}-${index}`} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={{ color: NAVY, fontSize: 16, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>{event.title}</Text>
                  <Text style={{ color: MUTED, fontSize: 14 }}>Giờ thi đấu: {event.time}</Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: event.status === 'PAID' ? '#E8F5E9' : '#FFF3E0' }}>
                  <Text style={{ color: event.status === 'PAID' ? '#22C55E' : '#F97316', fontSize: 12, fontWeight: '600' }}>
                    {event.status === 'PAID' ? 'Sẵn sàng' : 'Chưa thanh toán'}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin color={MUTED} size={16} />
                <Text style={{ color: MUTED, fontSize: 14, marginLeft: 4, flex: 1 }} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
