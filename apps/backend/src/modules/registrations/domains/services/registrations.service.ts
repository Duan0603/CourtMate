import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from '../../infrastructure/persistence/registration.entity';
import { TournamentStub } from '../../infrastructure/persistence/tournament-stub.entity';
import { CreateRegistrationDto } from '../../dtos/create-registration.dto';
import { RegistrationStatus } from '@courtmate/shared';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    @InjectModel(TournamentStub.name)
    private readonly tournamentModel: Model<TournamentStub>,
  ) {}

  async findAllTournaments(): Promise<TournamentStub[]> {
    return this.tournamentModel.find().exec();
  }

  async create(playerId: string, dto: CreateRegistrationDto): Promise<Registration> {
    const newReg = new this.registrationModel({
      ...dto,
      playerId,
      status: RegistrationStatus.PENDING,
    });
    return newReg.save();
  }

  async findByPlayer(playerId: string): Promise<Registration[]> {
    return this.registrationModel
      .find({ playerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTournament(tournamentId: string): Promise<Registration[]> {
    return this.registrationModel.find({ tournamentId }).exec();
  }

  async countApprovedOrPaidByTournament(tournamentId: string): Promise<number> {
    return this.registrationModel.countDocuments({
      tournamentId,
      status: { $in: [RegistrationStatus.APPROVED, RegistrationStatus.PAID] },
    });
  }

  async findById(id: string): Promise<Registration> {
    const reg = await this.registrationModel.findById(id).exec();
    if (!reg) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đăng ký với ID ${id}`);
    }
    return reg;
  }

  async updateStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    const reg = await this.registrationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!reg) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đăng ký với ID ${id}`);
    }
    return reg;
  }
}
