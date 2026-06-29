import { Controller, Get, Post, Patch, Body, Headers, Param, Query } from '@nestjs/common';
import { CreateRegistrationDto } from '../../dtos/create-registration.dto';
import { UpdateRegistrationStatusDto } from '../../dtos/update-registration-status.dto';
import { RegisterPlayerUseCase } from '../../domains/use-cases/register-player.use-case';
import { RegistrationsService } from '../../domains/services/registrations.service';
import { RegistrationStatus } from '@courtmate/shared';

@Controller('registrations')
export class RegistrationsController {
  private readonly defaultPlayerId = '64957e841234567890abcdef'; // Standard MongoDB ObjectId fallback format

  constructor(
    private readonly registerPlayerUseCase: RegisterPlayerUseCase,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Get('tournaments')
  async getTournaments() {
    return this.registrationsService.findAllTournaments();
  }

  @Post()
  async create(
    @Body() dto: CreateRegistrationDto,
    @Headers('x-player-id') playerId?: string,
  ) {
    const resolvedPlayerId = playerId || this.defaultPlayerId;
    return this.registerPlayerUseCase.execute(resolvedPlayerId, dto);
  }

  @Get('my')
  async findMyRegistrations(@Headers('x-player-id') playerId?: string) {
    const resolvedPlayerId = playerId || this.defaultPlayerId;
    return this.registrationsService.findByPlayer(resolvedPlayerId);
  }

  @Get('tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.registrationsService.findByTournament(tournamentId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    return this.registrationsService.updateStatus(id, dto.status);
  }
}
