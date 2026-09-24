import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Headers,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CreateRegistrationDto } from '../../dtos/create-registration.dto';
import { UpdateRegistrationStatusDto } from '../../dtos/update-registration-status.dto';
import { RegisterPlayerUseCase } from '../../domains/use-cases/register-player.use-case';
import { RegistrationsService } from '../../domains/services/registrations.service';
import { RegistrationStatus, UserRole } from '@courtmate/shared';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateRegistrationDto,
    @Headers('x-player-id') playerId?: string,
  ) {
    // Authenticated user ID takes precedence over spoofable header
    const resolvedPlayerId = req.user?.sub || playerId || this.defaultPlayerId;
    return this.registerPlayerUseCase.execute(resolvedPlayerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyRegistrations(@Req() req: any, @Headers('x-player-id') playerId?: string) {
    const resolvedPlayerId = req.user?.sub || playerId || this.defaultPlayerId;
    return this.registrationsService.findByPlayer(resolvedPlayerId);
  }

  @Get('tournament/:tournamentId')
  async findByTournament(
    @Param('tournamentId') tournamentId: string,
    @Query('status') status?: string,
  ) {
    return this.registrationsService.findByTournament(tournamentId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    const userRole = req.user?.role;
    if (
      userRole &&
      userRole !== UserRole.ORGANIZER &&
      userRole !== UserRole.SUPER_ADMIN &&
      userRole !== UserRole.REGIONAL_ADMIN
    ) {
      throw new ForbiddenException(
        'Chỉ Ban tổ chức giải đấu hoặc Quản trị viên mới có quyền cập nhật trạng thái đơn đăng ký.',
      );
    }
    return this.registrationsService.updateStatus(id, dto.status);
  }
}
