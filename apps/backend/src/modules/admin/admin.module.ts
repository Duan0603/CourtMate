import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/http/admin.controller';
import { AdminService } from './domains/services/admin.service';
import { RegionService } from './domains/services/region.service';
import { RegionalAdminGuard } from './guards/regional-admin.guard';
import { UsersModule } from '../users/users.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { AuthModule } from '../../core/auth/auth.module';

@Module({
  imports: [
    UsersModule,
    TournamentsModule,
    AuthModule,
    // Register raw registrations collection for aggregation queries
    MongooseModule.forFeature([
      { name: 'registrations', schema: {} as any, collection: 'registrations' },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, RegionService, RegionalAdminGuard],
})
export class AdminModule {}
