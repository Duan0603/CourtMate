import { SUPPORTED_CITIES, SupportedCity, REGION_CONFIGS } from '@courtmate/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CITY_STORAGE_KEY = '@courtmate/user_city';

/**
 * Location service providing city detection and persistence.
 *
 * Strategy (no expo-location required for MVP):
 * 1. Check AsyncStorage for a saved city preference
 * 2. If none, return null (frontend will show CitySelector)
 *
 * When expo-location is added later, add GPS-based reverse geocoding here.
 */
export const locationService = {
  /**
   * Get the user's saved city preference.
   */
  getSavedCity: async (): Promise<SupportedCity | null> => {
    const saved = await AsyncStorage.getItem(CITY_STORAGE_KEY);
    if (saved && (SUPPORTED_CITIES as readonly string[]).includes(saved)) {
      return saved as SupportedCity;
    }
    return null;
  },

  /**
   * Save the user's city preference.
   */
  saveCity: async (city: SupportedCity): Promise<void> => {
    await AsyncStorage.setItem(CITY_STORAGE_KEY, city);
  },

  /**
   * Clear saved city preference.
   */
  clearCity: async (): Promise<void> => {
    await AsyncStorage.removeItem(CITY_STORAGE_KEY);
  },

  /**
   * Get display name for a city.
   */
  getCityDisplayName: (city: string): string => {
    const config = REGION_CONFIGS.find(
      (r) => r.city.toLowerCase() === city.toLowerCase(),
    );
    return config?.displayName || city;
  },

  /**
   * Get all supported cities.
   */
  getSupportedCities: () => [...SUPPORTED_CITIES],
};
