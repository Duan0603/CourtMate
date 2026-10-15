import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';
import { CoachProfileEntity, CoachProfileSchema } from './coach-profile.schema';
import { CoachCourseEntity, CoachCourseSchema } from './coach-course.schema';
import { CoachBookingEntity, CoachBookingSchema } from './coach-booking.schema';
import { CoachReviewEntity, CoachReviewSchema } from './coach-review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoachProfileEntity.name, schema: CoachProfileSchema },
      { name: CoachCourseEntity.name, schema: CoachCourseSchema },
      { name: CoachBookingEntity.name, schema: CoachBookingSchema },
      { name: CoachReviewEntity.name, schema: CoachReviewSchema },
    ]),
  ],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService],
})
export class CoachesModule {}
