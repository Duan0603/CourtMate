import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from './guards/roles.guard';
import { User, UserSchema } from '../../modules/users/infrastructure/persistence/user.entity';

/**
 * AuthModule provides role-based access control infrastructure.
 * Registers the User model needed by RolesGuard for mock auth lookups.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [RolesGuard],
  exports: [RolesGuard, MongooseModule],
})
export class AuthModule {}
