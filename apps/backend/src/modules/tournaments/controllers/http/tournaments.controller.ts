import { Controller, Get, Query } from '@nestjs/common';
import { TournamentsService } from '../../domains/services/tournaments.service';
import { Request } from 'express';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * GET /tournaments
   * Supports city-based routing via query params.
   * Query: ?city=Da+Nang&sport=BADMINTON
   */
  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('sport') sport?: string,
  ) {
    return this.tournamentsService.findAll({ city, sport });
  }

  /**
   * GET /tournaments/:id
   */
  @Get(':id')
  async findOne(@Query('id') id: string) {
    return this.tournamentsService.findById(id);
  }
}
