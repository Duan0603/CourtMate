import { CreateTournamentDto, Tournament, TournamentStatus, TournamentCategory, SportType } from '@courtmate/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lấy BACKEND_URL từ biến môi trường hoặc config (MVP dùng localhost/LAN IP)
const BACKEND_URL = 'http://10.0.2.2:3000'; // Dành cho Android Emulator, thay đổi tuỳ theo device thật
const API_URL = 'http://localhost:3000'; // In a real app this would use an env var

export const createTournament = async (
  data: CreateTournamentDto,
  rulesFile?: { uri: string; name: string; type: string }
) => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('sport', data.sport);
  formData.append('time', data.time);
  formData.append('location', data.location);
  formData.append('city', data.city);
  formData.append('categories', JSON.stringify(data.categories));

  if (data.rulesText) {
    formData.append('rulesText', data.rulesText);
  }

  if (rulesFile) {
    formData.append('rulesFile', {
      uri: rulesFile.uri,
      name: rulesFile.name,
      type: rulesFile.type,
    } as any);
  }

  const response = await fetch(`${BACKEND_URL}/tournaments`, {
    method: 'POST',
    body: formData,
    headers: {
      // Fetch automatically sets Content-Type to multipart/form-data with boundary when passing FormData
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create tournament');
  }

  return response.json();
};

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
  },

  async getBookmarkedTournaments(token: string, ids: string[]): Promise<{ data: Tournament[] }> {
    try {
      const url = new URL(`${API_URL}/tournaments/bookmarked`);
      if (ids.length > 0) {
        url.searchParams.append('ids', ids.join(','));
      }
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookmarked tournaments');
      return response.json();
    } catch (error) {
      console.error('Error fetching bookmarked tournaments:', error);
      throw error;
    }
  },

  async getMyOrganizedTournaments(token: string): Promise<{ data: Tournament[] }> {
    try {
      const response = await fetch(`${API_URL}/tournaments/my-organized`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch organized tournaments');
      return response.json();
    } catch (error) {
      console.error('Error fetching organized tournaments:', error);
      throw error;
    }
  }
};
