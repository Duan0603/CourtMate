import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SUPPORTED_CITIES } from '@courtmate/shared';

/**
 * Middleware that extracts the user's city context from the request.
 *
 * City source priority:
 * 1. X-User-City header (set by frontend from geolocation/preference)
 * 2. Query parameter ?city=
 * 3. Falls back to undefined (no city filtering)
 *
 * Attaches `req.userCity` for downstream controllers/services.
 */
@Injectable()
export class CityRoutingMiddleware implements NestMiddleware {
  use(req: Request & { userCity?: string }, _res: Response, next: NextFunction) {
    const cityFromHeader = req.headers['x-user-city'] as string | undefined;
    const cityFromQuery = req.query['city'] as string | undefined;

    const rawCity = cityFromHeader || cityFromQuery;

    if (rawCity) {
      // Validate against supported cities (case-insensitive match)
      const matched = (SUPPORTED_CITIES as readonly string[]).find(
        (c) => c.toLowerCase() === rawCity.toLowerCase(),
      );
      req.userCity = matched || rawCity;
    }

    next();
  }
}
