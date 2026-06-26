import { Tournament, TournamentStatus, TournamentCategory, SportType } from '@courtmate/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real app this would use an env var
const API_URL = 'http://localhost:3000';

export const tournamentsApi = {
  async getTournaments(city?: string): Promise<{ data: Tournament[], meta: any }> {
    try {
      const url = new URL(`${API_URL}/tournaments`);
      if (city) {
        url.searchParams.append('city', city);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  },

  async getTournamentDetails(id: string): Promise<Tournament> {
    try {
      const response = await fetch(`${API_URL}/tournaments/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournament details');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      throw error;
    }
  }
};
