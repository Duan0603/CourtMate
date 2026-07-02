import React from 'react';
import { YStack, XStack, Text, Image, Card, Theme, View, Button } from 'tamagui';
import { Tournament, TournamentStatus } from '@courtmate/shared';
import { Bookmark } from 'lucide-react-native';

interface TournamentCardProps {
  tournament: Tournament;
  onPress: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: any) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ 
  tournament, 
  onPress,
  isBookmarked = false,
  onToggleBookmark
}) => {
  const isRegistrationOpen = tournament.status === TournamentStatus.OPEN;
  
  // Format dates locally
  const startDateStr = new Date(tournament.startDate).toLocaleDateString('vi-VN');
  
  // Determine lowest fee
  const minFee = tournament.categories.length > 0 
    ? Math.min(...tournament.categories.map(c => c.fee))
    : 0;

  return (
    <Theme name="light">
      <Card 
        elevate 
        size="$4" 
        bordered 
        animation="bouncy" 
        scale={0.9} 
        hoverStyle={{ scale: 0.925 }} 
        pressStyle={{ scale: 0.875 }}
        onPress={onPress}
        marginBottom="$4"
        overflow="hidden"
      >
        <Card.Header padded paddingBottom={0}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <View 
              backgroundColor={isRegistrationOpen ? '$green8' : '$gray8'}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
            >
              <Text color="white" fontSize="$2" fontWeight="bold">
                {isRegistrationOpen ? 'Mở đăng ký' : 'Sắp diễn ra / Đóng'}
              </Text>
            </View>
            <Button
              circular
              size="$3"
              backgroundColor="rgba(0,0,0,0.5)"
              onPress={(e: any) => {
                e.stopPropagation();
                if (onToggleBookmark) onToggleBookmark(e);
              }}
              icon={<Bookmark size={18} color={isBookmarked ? "#FFD700" : "white"} fill={isBookmarked ? "#FFD700" : "transparent"} />}
            />
          </XStack>
        </Card.Header>

        {tournament.coverImage ? (
          <Image
            source={{ uri: tournament.coverImage }}
            width="100%"
            height={160}
            resizeMode="cover"
            position="absolute"
            zIndex={-1}
          />
        ) : (
          <View 
            width="100%" 
            height={160} 
            backgroundColor="$gray5" 
            position="absolute" 
            zIndex={-1} 
          />
        )}

        <Card.Footer padded paddingTop="$6">
          <YStack flex={1} backgroundColor="rgba(255, 255, 255, 0.9)" padding="$3" borderRadius="$3">
            <Text fontSize="$5" fontWeight="bold" numberOfLines={2}>
              {tournament.title}
            </Text>
            
            <XStack marginTop="$2" alignItems="center" space="$2">
              <Text fontSize="$3">📅</Text>
              <Text fontSize="$3" color="$gray10">{startDateStr}</Text>
            </XStack>
            
            <XStack marginTop="$1" alignItems="center" space="$2">
              <Text fontSize="$3">📍</Text>
              <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                {tournament.location}, {tournament.district ? `${tournament.district}, ` : ''}{tournament.city}
              </Text>
            </XStack>

            <XStack marginTop="$2" justifyContent="space-between" alignItems="center">
              <View backgroundColor="$blue3" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                <Text color="$blue10" fontSize="$2" fontWeight="bold">{tournament.sport}</Text>
              </View>
              <Text fontSize="$4" fontWeight="bold" color="$red10">
                Từ {minFee.toLocaleString('vi-VN')}đ
              </Text>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
    </Theme>
  );
};
