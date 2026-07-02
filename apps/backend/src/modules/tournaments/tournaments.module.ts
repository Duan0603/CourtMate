import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tournament, TournamentSchema } from './infrastructure/persistence/tournament.entity';
import { TournamentsService } from './domains/services/tournaments.service';
import { TournamentsController } from './controllers/http/tournaments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService, MongooseModule],
})
export class TournamentsModule {}
