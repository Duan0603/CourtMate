import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { MapPin, Search, Bell } from 'lucide-react-native';

interface GPSHeaderProps {
  locationName?: string;
  onSearch?: (text: string) => void;
}

export default function GPSHeader({ 
  locationName = 'Sân vận động Mỹ Đình, Nam Từ Liêm, Hà Nội', 
  onSearch 
}: GPSHeaderProps) {
  const [searchText, setSearchText] = useState('');

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <View className="w-full px-[20px] pt-[10px] pb-[15px] bg-background">
      {/* Top row: GPS Location Pin and Notification Icon */}
      <View className="flex-row justify-between items-center mb-[16px]">
        <View className="flex-row items-center flex-1 mr-[15px]">
          <MapPin size={18} color="#39FF14" style={{ marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-textGray text-[10px] font-bold tracking-[1px]">VỊ TRÍ HIỆN TẠI</Text>
            <Text className="text-white text-[14px] font-semibold mt-[2px]" numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-[40px] h-[40px] rounded-full bg-secondary justify-center items-center border border-borderGray" activeOpacity={0.7}>
          <Bell size={20} color="#FFFFFF" />
          <View className="absolute top-[10px] right-[10px] w-[8px] h-[8px] rounded-full bg-accent" />
        </TouchableOpacity>
      </View>

      {/* Search Bar Row */}
      <View className="flex-row items-center bg-secondary rounded-[12px] px-[12px] h-[46px] border border-borderGray">
        <Search size={18} color="#8E8E93" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-white text-[14px] h-full"
          placeholder="Tìm kiếm sân hoặc đồng đội..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={handleTextChange}
          keyboardAppearance="dark"
        />
      </View>
    </View>
  );
}
