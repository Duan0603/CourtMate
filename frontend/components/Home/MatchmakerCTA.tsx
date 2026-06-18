import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface MatchmakerCTAProps {
  selectedSportId: string;
}

export default function MatchmakerCTA({ selectedSportId }: MatchmakerCTAProps) {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to map tab
    // Since map tab is a tab screen, we navigate to '/map'
    router.push('/map');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Zap size={22} color="#000000" style={styles.icon} />
        <Text style={styles.buttonText}>TÌM ĐỒNG ĐỘI NGAY</Text>
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Quét tìm người chơi xung quanh vị trí của bạn ngay lập tức
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.dark.accent,
    width: '100%',
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  helperText: {
    color: Colors.dark.textGray,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
