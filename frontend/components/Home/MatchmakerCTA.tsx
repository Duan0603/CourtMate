import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap } from 'lucide-react-native';

interface MatchmakerCTAProps {
  selectedSportId: string;
}

export default function MatchmakerCTA({ selectedSportId }: MatchmakerCTAProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/map');
  };

  return (
    <View className="w-full px-[20px] pt-[10px] pb-[25px] items-center">
      <TouchableOpacity
        className="bg-accent w-full h-[58px] rounded-[29px] flex-row justify-center items-center"
        style={styles.buttonShadow}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Zap size={22} color="#000000" style={{ marginRight: 10 }} />
        <Text className="text-black text-[16px] font-bold tracking-[0.5px]">TÌM ĐỒNG ĐỘI NGAY</Text>
      </TouchableOpacity>
      <Text className="text-textGray text-[12px] mt-[12px] text-center">
        Quét tìm người chơi xung quanh vị trí của bạn ngay lập tức
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonShadow: {
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
