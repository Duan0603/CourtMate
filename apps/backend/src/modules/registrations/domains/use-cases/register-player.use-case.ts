import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationsService } from '../services/registrations.service';
import { TournamentStub } from '../../infrastructure/persistence/tournament-stub.entity';
import { CreateRegistrationDto } from '../../dtos/create-registration.dto';
import { Registration } from '../../infrastructure/persistence/registration.entity';
import { RegistrationStatus } from '@courtmate/shared';

@Injectable()
export class RegisterPlayerUseCase {
  constructor(
    private readonly registrationsService: RegistrationsService,
    @InjectModel(TournamentStub.name)
    private readonly tournamentModel: Model<TournamentStub>,
  ) {}

  async execute(playerId: string, dto: CreateRegistrationDto): Promise<Registration> {
    // 1. Verify tournament exists
    const tournament = await this.tournamentModel.findById(dto.tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Không tìm thấy giải đấu với ID ${dto.tournamentId}`);
    }

    // 2. Check for duplicate registration by the same player
    const existingRegs = await this.registrationsService.findByPlayer(playerId);
    const hasAlreadyRegistered = existingRegs.some(
      (reg) => reg.tournamentId === dto.tournamentId && reg.status !== RegistrationStatus.REJECTED
    );
    if (hasAlreadyRegistered) {
      throw new BadRequestException('Bạn đã đăng ký tham gia giải đấu này rồi.');
    }

    // 3. Verify slots availability
    const activeRegsCount = await this.registrationsService.countApprovedOrPaidByTournament(
      dto.tournamentId
    );
    if (activeRegsCount >= tournament.slotsLimit) {
      throw new BadRequestException('Giải đấu đã hết lượt đăng ký (đầy slots).');
    }

    // 4. Create registration
    return this.registrationsService.create(playerId, dto);
  }
}
