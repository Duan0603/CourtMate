import { Tournament, TournamentSchema } from './infrastructure/persistence/tournament.entity';
import { TournamentsService } from './domains/services/tournaments.service';
import { TournamentsController } from './controllers/http/tournaments.controller';
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService, MongooseModule],
})
export class TournamentsModule implements OnModuleInit {
  constructor(private readonly tournamentsService: TournamentsService) {}

  async onModuleInit() {
    await this.tournamentsService.seedMockData();
  }
}
