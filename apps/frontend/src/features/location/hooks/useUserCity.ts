import { useState, useEffect, useCallback } from 'react';
import { SupportedCity } from '@courtmate/shared';
import { locationService } from '../services/location.service';

interface UseUserCityReturn {
  city: SupportedCity | null;
  isLoading: boolean;
  setCity: (city: SupportedCity) => Promise<void>;
  clearCity: () => Promise<void>;
  displayName: string;
}

/**
 * Hook for managing the user's current city context.
 * Used by city-based routing to filter tournaments by location.
 */
export function useUserCity(): UseUserCityReturn {
  const [city, setCityState] = useState<SupportedCity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedCity();
  }, []);

  const loadSavedCity = async () => {
    try {
      const saved = await locationService.getSavedCity();
      setCityState(saved);
    } finally {
      setIsLoading(false);
    }
  };

  const setCity = useCallback(async (newCity: SupportedCity) => {
    await locationService.saveCity(newCity);
    setCityState(newCity);
  }, []);

  const clearCity = useCallback(async () => {
    await locationService.clearCity();
    setCityState(null);
  }, []);

  const displayName = city
    ? locationService.getCityDisplayName(city)
    : 'Chọn thành phố';

  return { city, isLoading, setCity, clearCity, displayName };
}
