import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CreateTournamentScreen } from '../src/features/tournaments/screens/CreateTournamentScreen';

const NAVY = '#00102F';

export default function CreateTournamentRoute() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
      <View style={{ paddingTop: insets.top, backgroundColor: NAVY }}>
        <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity
            accessibilityLabel="Quay lại"
            onPress={() => router.back()}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '600', marginLeft: 8 }}>
            Tạo giải đấu
          </Text>
        </View>
      </View>
      <CreateTournamentScreen />
    </View>
  );
}
