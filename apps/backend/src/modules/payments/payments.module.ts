import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, RegistrationSchema } from '../registrations/infrastructure/persistence/registration.entity';
import { TournamentStub, TournamentStubSchema } from '../registrations/infrastructure/persistence/tournament-stub.entity';
import { PaymentTransaction, PaymentTransactionSchema } from './payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    { name: Registration.name, schema: RegistrationSchema },
    { name: TournamentStub.name, schema: TournamentStubSchema },
  ])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
