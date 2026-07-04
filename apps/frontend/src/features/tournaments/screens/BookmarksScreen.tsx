import React, { useEffect, useState, useCallback } from 'react';
import { View, YStack, Text, ScrollView, Spinner } from 'tamagui';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tournament } from '@courtmate/shared';
import { TournamentCard } from '../components/TournamentCard';
import { authApi } from '../../auth/services/auth.api';
import { tournamentsApi } from '../services/tournaments.api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BookmarksScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const profile = await authApi.getProfile(token);
      const ids = profile.bookmarkedTournaments || [];
      setBookmarkedIds(ids);

      if (ids.length > 0) {
        const result = await tournamentsApi.getBookmarkedTournaments(token, ids);
        setTournaments(result.data);
      } else {
        setTournaments([]);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookmarks();
  };

  const handleToggleBookmark = async (tournamentId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const isBookmarked = bookmarkedIds.includes(tournamentId);
      
      // Optimistic update
      setBookmarkedIds(prev => isBookmarked ? prev.filter(id => id !== tournamentId) : [...prev, tournamentId]);
      
      if (isBookmarked) {
        await authApi.removeBookmark(token, tournamentId);
        // Also remove from the list
        setTournaments(prev => prev.filter(t => t.id !== tournamentId || (t as any)._id !== tournamentId));
      } else {
        await authApi.addBookmark(token, tournamentId);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on failure by refetching
      fetchBookmarks();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <YStack padding="$4" paddingBottom="$0">
        <Text fontSize="$8" fontWeight="bold" color="$blue10">
          Đã lưu
        </Text>
        <Text fontSize="$3" color="$gray10" marginTop="$1">
          Các giải đấu bạn đang theo dõi
        </Text>
      </YStack>

      {loading ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </View>
      ) : (
        <ScrollView
          flex={1}
          padding="$4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {tournaments.length === 0 ? (
            <YStack padding="$4" alignItems="center" marginTop="$10">
              <Text fontSize="$5" color="$gray10" textAlign="center">
                Bạn chưa lưu giải đấu nào.
              </Text>
            </YStack>
          ) : (
            tournaments.map((tournament) => {
              // Handle both _id from mongo and mapped id
              const tId = tournament.id || (tournament as any)._id;
              return (
                <TournamentCard
                  key={tId}
                  tournament={tournament}
                  isBookmarked={bookmarkedIds.includes(tId)}
                  onToggleBookmark={() => handleToggleBookmark(tId)}
                  onPress={() => {
                    // Navigate to details in a real app
                    console.log('Navigate to details', tId);
                  }}
                />
              );
            })
          )}
          <View height={40} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
