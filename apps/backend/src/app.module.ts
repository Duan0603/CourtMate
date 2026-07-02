import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ArticlesModule } from './modules/articles/articles.module';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './core/auth/auth.module';
import { CityRoutingMiddleware } from './core/middleware/city-routing.middleware';

@Module({
  imports: [
    // Load config globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/backend/.env', '.env'],
    }),
    
    // Connect to MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin',
        ),
      }),
      inject: [ConfigService],
    }),

    // Cache management using Redis or In-memory as fallback
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 10, // 10 minutes cache TTL
    }),

    // Feature Modules
    ArticlesModule,

    // Phase 8: Multi-Region & Admin
    AuthModule,
    UsersModule,
    TournamentsModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CityRoutingMiddleware).forRoutes('*');
  }
}
