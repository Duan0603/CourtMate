import { Injectable } from '@nestjs/common';
import { SUPPORTED_CITIES, REGION_CONFIGS, RegionConfig, SupportedCity } from '@courtmate/shared';

@Injectable()
export class RegionService {
  /**
   * Get all supported region configurations.
   */
  getAllRegions(): RegionConfig[] {
    return REGION_CONFIGS;
  }

  /**
   * Get active regions only.
   */
  getActiveRegions(): RegionConfig[] {
    return REGION_CONFIGS.filter((r) => r.isActive);
  }

  /**
   * Validate if a city is supported.
   */
  isSupportedCity(city: string): boolean {
    return (SUPPORTED_CITIES as readonly string[]).some(
      (c) => c.toLowerCase() === city.toLowerCase(),
    );
  }

  /**
   * Get region config by city name (case-insensitive).
   */
  getRegionByCity(city: string): RegionConfig | undefined {
    return REGION_CONFIGS.find(
      (r) => r.city.toLowerCase() === city.toLowerCase(),
    );
  }

  /**
   * Normalize a city name to its canonical supported form.
   */
  normalizeCity(city: string): SupportedCity | null {
    const match = (SUPPORTED_CITIES as readonly string[]).find(
      (c) => c.toLowerCase() === city.toLowerCase(),
    );
    return (match as SupportedCity) || null;
  }
}
