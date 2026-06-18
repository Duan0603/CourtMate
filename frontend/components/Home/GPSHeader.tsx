import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { MapPin, Search, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

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
    <View style={styles.container}>
      {/* Top row: GPS Location Pin and Notification Icon */}
      <View style={styles.topRow}>
        <View style={styles.locationContainer}>
          <MapPin size={18} color={Colors.dark.accent} style={styles.pinIcon} />
          <View>
            <Text style={styles.subTitle}>VỊ TRÍ HIỆN TẠI</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Bell size={20} color={Colors.dark.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <Search size={18} color={Colors.dark.textGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sân hoặc đồng đội..."
          placeholderTextColor={Colors.dark.textGray}
          value={searchText}
          onChangeText={handleTextChange}
          keyboardAppearance="dark"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: Colors.dark.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  pinIcon: {
    marginRight: 8,
  },
  subTitle: {
    color: Colors.dark.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locationText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.accent,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 14,
    height: '100%',
  },
});
