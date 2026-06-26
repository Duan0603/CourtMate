import { Controller, Get, Param, Query } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  async findAll(@Query('city') city?: string) {
    const tournaments = await this.tournamentsService.findAll(city);
    // Determine if we are returning local or national fallback
    const isFallback = city && tournaments.length > 0 && tournaments[0].city !== city;
    
    return {
      data: tournaments.map(t => ({
        id: t._id,
        title: t.title,
        sport: t.sport,
        coverImage: t.coverImage,
        startDate: t.startDate,
        location: t.location,
        district: t.district,
        city: t.city,
        organizer: t.organizer,
        status: t.status,
        categories: t.categories,
      })),
      meta: {
        isFallback,
        message: isFallback ? 'No local tournaments found. Showing national fallback.' : 'Local tournaments',
      }
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const t = await this.tournamentsService.findById(id);
    return {
      id: t._id,
      title: t.title,
      description: t.description,
      sport: t.sport,
      coverImage: t.coverImage,
      startDate: t.startDate,
      endDate: t.endDate,
      location: t.location,
      district: t.district,
      city: t.city,
      organizer: t.organizer,
      status: t.status,
      categories: t.categories,
      rules: t.rules,
      schedule: t.schedule,
      registrationLink: t.registrationLink,
      createdAt: t.createdAt,
    };
  }
}
