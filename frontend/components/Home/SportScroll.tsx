import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Target, Flame, Activity, Award, Trophy } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

// Define the type for a sport item
export interface SportItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ color: string; size: number }>;
}

// Predefined list of sports
export const SPORTS_LIST: SportItem[] = [
  { id: 'badminton', name: 'Cầu lông', icon: Target },
  { id: 'basketball', name: 'Bóng rổ', icon: Flame },
  { id: 'football', name: 'Bóng đá', icon: Activity },
  { id: 'tennis', name: 'Quần vợt', icon: Award },
  { id: 'table_tennis', name: 'Bóng bàn', icon: Trophy },
];

interface SportScrollProps {
  selectedSportId: string;
  onSelectSport: (id: any) => void;
}

export default function SportScroll({ 
  selectedSportId, 
  onSelectSport 
}: SportScrollProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn môn thể thao</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SPORTS_LIST.map((sport) => {
          const isActive = sport.id === selectedSportId;
          const IconComponent = sport.icon;
          
          return (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportCard,
                isActive && styles.sportCardActive
              ]}
              onPress={() => onSelectSport(sport.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive
              ]}>
                <IconComponent 
                  color={isActive ? Colors.dark.accent : Colors.dark.textGray} 
                  size={24} 
                />
              </View>
              <Text style={[
                styles.sportName,
                isActive && styles.sportNameActive
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 15,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  sportCard: {
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.dark.secondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 80,
  },
  sportCardActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  sportName: {
    color: Colors.dark.textGray,
    fontSize: 12,
    fontWeight: '500',
  },
  sportNameActive: {
    color: Colors.dark.accent,
    fontWeight: 'bold',
  },
});
