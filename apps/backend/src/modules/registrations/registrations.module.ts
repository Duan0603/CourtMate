import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationsController } from './controllers/http/registrations.controller';
import { RegistrationsService } from './domains/services/registrations.service';
import { RegisterPlayerUseCase } from './domains/use-cases/register-player.use-case';
import { Registration, RegistrationSchema } from './infrastructure/persistence/registration.entity';
import { TournamentStub, TournamentStubSchema } from './infrastructure/persistence/tournament-stub.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: TournamentStub.name, schema: TournamentStubSchema },
    ]),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegisterPlayerUseCase],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
