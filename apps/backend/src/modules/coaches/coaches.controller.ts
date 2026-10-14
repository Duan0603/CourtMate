import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Headers,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { SportType, CoachVerificationStatus } from '@courtmate/shared';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  // 1. GET ALL APPROVED COACHES WITH FILTER
  @Get()
  async getCoaches(
    @Query('sport') sport?: SportType,
    @Query('city') city?: string,
    @Query('keyword') keyword?: string,
    @Query('minRating') minRating?: number,
    @Query('maxRate') maxRate?: number,
  ) {
    return this.coachesService.findAll({
      sport,
      city,
      keyword,
      minRating,
      maxRate,
    });
  }

  // 2. GET OPEN COURSES
  @Get('courses')
  async getCourses(
    @Query('sport') sport?: SportType,
    @Query('city') city?: string,
  ) {
    return this.coachesService.getCourses(sport, city);
  }

  // 3. GET SINGLE COACH PROFILE WITH REVIEWS & COURSES
  @Get(':id')
  async getCoach(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  // 4. REGISTER AS COACH (BY USER)
  @Post('register')
  async registerCoach(
    @Body() body: any,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = body.userId || headerUserId || 'user_guest_' + Date.now();
    return this.coachesService.registerAsCoach(userId, body);
  }

  // 5. BOOK A COACH OR ENROLL IN COURSE
  @Post(':id/book')
  async bookCoach(
    @Param('id') coachId: string,
    @Body() body: any,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = body.userId || headerUserId || 'user_guest_' + Date.now();
    const userDetails = {
      name: body.userName || 'Học viên CourtMate',
      phone: body.userPhone || '',
      email: body.userEmail || '',
    };
    return this.coachesService.createBooking(userId, userDetails, {
      ...body,
      coachId,
    });
  }

  // 6. GET USER'S BOOKINGS
  @Get('bookings/my')
  async getMyBookings(@Query('userId') queryUserId?: string, @Headers('x-user-id') headerUserId?: string) {
    const userId = queryUserId || headerUserId || 'user_guest';
    return this.coachesService.getUserBookings(userId);
  }

  // 7. SUBMIT REVIEW FOR COACH
  @Post(':id/reviews')
  async addReview(
    @Param('id') coachId: string,
    @Body() body: any,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = body.userId || headerUserId || 'user_guest';
    return this.coachesService.addReview(coachId, userId, body);
  }

  // 8. ADMIN VERIFY COACH
  @Patch(':id/verify')
  async verifyCoach(
    @Param('id') coachId: string,
    @Body('status') status: CoachVerificationStatus,
  ) {
    return this.coachesService.verifyCoach(coachId, status);
  }
}
