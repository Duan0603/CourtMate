import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from '../../infrastructure/persistence/registration.entity';
import { TournamentStub } from '../../infrastructure/persistence/tournament-stub.entity';
import { CreateRegistrationDto } from '../../dtos/create-registration.dto';
import { RegistrationStatus } from '@courtmate/shared';
import { NotificationsService } from '../../../notifications/notifications.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    @InjectModel(TournamentStub.name)
    private readonly tournamentModel: Model<TournamentStub>,
    private readonly notificationsService: NotificationsService,
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
    const saved = await newReg.save();

    // Broadcast so everyone currently on the site sees "X vừa đăng ký giải Y".
    try {
      const tour = await this.tournamentModel.findById(dto.tournamentId).exec();
      await this.notificationsService.send({
        type: 'REGISTRATION_NEW',
        title: 'Đăng ký mới',
        body: tour?.title
          ? `${dto.playerName} vừa đăng ký giải "${tour.title}"`
          : `${dto.playerName} vừa đăng ký một giải đấu`,
        link: `/tournaments/${dto.tournamentId}`,
      });
    } catch (error) {
      console.error('[Notifications] Broadcast new-registration error:', error);
    }

    return saved;
  }

  async findByPlayer(playerId: string): Promise<Registration[]> {
    return this.registrationModel
      .find({ playerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTournament(tournamentId: string, status?: string): Promise<Registration[]> {
    const filter: any = { tournamentId };
    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      // By default, public list only shows officially confirmed registrations
      filter.status = { $in: [RegistrationStatus.PAID, RegistrationStatus.APPROVED] };
    }
    return this.registrationModel.find(filter).sort({ createdAt: -1 }).exec();
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
    if (status === RegistrationStatus.PAID) {
      throw new BadRequestException('Trạng thái PAID chỉ được cập nhật bởi callback cổng thanh toán');
    }

    const oldReg = await this.findById(id);
    const oldStatus = oldReg.status;

    const reg = await this.registrationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!reg) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đăng ký với ID ${id}`);
    }

    // Send notification when registration is ACTUALLY approved (status changed to APPROVED)
    if (status !== oldStatus) {
      try {
        const DEFAULT_PLAYER_ID = '64957e841234567890abcdef';
        if (reg.playerId === DEFAULT_PLAYER_ID) {
          console.warn('[Notifications] Skipping notification for default fallback playerId');
        } else {
          const tour = await this.tournamentModel.findById(reg.tournamentId).exec();
          await this.notificationsService.send({
            type: 'REGISTRATION_' + status,
            userId: reg.playerId,
            title: status === RegistrationStatus.APPROVED ? 'Đăng ký được duyệt' : 'Đăng ký có cập nhật',
            body: tour?.title
              ? `Đơn đăng ký giải "${tour.title}" của bạn: ${status}`
              : 'Đơn đăng ký của bạn: ' + status,
            link: `/tournaments/${reg.tournamentId}`,
          });
        }
      } catch (error) {
        console.error('[Notifications] Send user notification error:', error);
      }
    }

    return reg;
  }
}
