import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoachProfileEntity } from './coach-profile.schema';
import { CoachCourseEntity } from './coach-course.schema';
import { CoachBookingEntity } from './coach-booking.schema';
import { CoachReviewEntity } from './coach-review.schema';
import {
  SportType,
  CoachVerificationStatus,
  CoachBookingStatus,
  CoachBookingType,
  CoachProfile,
  CoachCourse,
  CoachBooking,
  CoachReview,
} from '@courtmate/shared';

@Injectable()
export class CoachesService implements OnModuleInit {
  constructor(
    @InjectModel(CoachProfileEntity.name)
    private readonly coachProfileModel: Model<CoachProfileEntity>,
    @InjectModel(CoachCourseEntity.name)
    private readonly coachCourseModel: Model<CoachCourseEntity>,
    @InjectModel(CoachBookingEntity.name)
    private readonly coachBookingModel: Model<CoachBookingEntity>,
    @InjectModel(CoachReviewEntity.name)
    private readonly coachReviewModel: Model<CoachReviewEntity>,
  ) {}

  async onModuleInit() {
    // Seed initial coaches and courses if database is empty
    const count = await this.coachProfileModel.countDocuments();
    if (count === 0) {
      await this.seedInitialCoaches();
    }
  }

  // 1. GET COACHES WITH FILTER
  async findAll(query: {
    sport?: SportType;
    city?: string;
    keyword?: string;
    minRating?: number;
    maxRate?: number;
  }) {
    const filter: any = { verificationStatus: CoachVerificationStatus.APPROVED };

    if (query.sport) {
      filter.sports = query.sport;
    }
    if (query.city) {
      filter.city = new RegExp(query.city, 'i');
    }
    if (query.keyword) {
      filter.$or = [
        { fullName: new RegExp(query.keyword, 'i') },
        { headline: new RegExp(query.keyword, 'i') },
        { bio: new RegExp(query.keyword, 'i') },
      ];
    }
    if (query.minRating) {
      filter.rating = { $gte: Number(query.minRating) };
    }
    if (query.maxRate) {
      filter.hourlyRate = { $lte: Number(query.maxRate) };
    }

    const coaches = await this.coachProfileModel.find(filter).sort({ rating: -1, reviewCount: -1 }).lean();
    return coaches.map(c => ({ ...c, id: c._id.toString() }));
  }

  // 2. GET COACH DETAIL WITH REVIEWS & COURSES
  async findOne(id: string) {
    const coach = await this.coachProfileModel.findById(id).lean();
    if (!coach) {
      throw new NotFoundException('Không tìm thấy huấn luyện viên');
    }

    const [reviews, courses] = await Promise.all([
      this.coachReviewModel.find({ coachId: id }).sort({ createdAt: -1 }).lean(),
      this.coachCourseModel.find({ coachId: id, status: 'OPEN' }).lean(),
    ]);

    return {
      ...coach,
      id: coach._id.toString(),
      reviews: reviews.map(r => ({ ...r, id: r._id.toString() })),
      courses: courses.map(c => ({ ...c, id: c._id.toString() })),
    };
  }

  // 3. REGISTER AS COACH (BY USER)
  async registerAsCoach(userId: string, data: Partial<CoachProfile>) {
    const existing = await this.coachProfileModel.findOne({ userId });
    if (existing) {
      throw new BadRequestException('Bạn đã gửi hồ sơ đăng ký làm Huấn luyện viên');
    }

    const created = await this.coachProfileModel.create({
      ...data,
      userId,
      verificationStatus: CoachVerificationStatus.PENDING,
      rating: 5.0,
      reviewCount: 0,
    });

    return { ...created.toObject(), id: created._id.toString() };
  }

  // 4. ADMIN VERIFY COACH
  async verifyCoach(id: string, status: CoachVerificationStatus) {
    const coach = await this.coachProfileModel.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    ).lean();

    if (!coach) throw new NotFoundException('Huấn luyện viên không tồn tại');
    return { ...coach, id: coach._id.toString() };
  }

  // 5. GET COURSES
  async getCourses(sport?: SportType, city?: string) {
    const filter: any = { status: 'OPEN' };
    if (sport) filter.sport = sport;

    const courses = await this.coachCourseModel.find(filter).sort({ createdAt: -1 }).lean();
    return courses.map(c => ({ ...c, id: c._id.toString() }));
  }

  // 6. CREATE COURSE (BY COACH)
  async createCourse(coachId: string, data: Partial<CoachCourse>) {
    const created = await this.coachCourseModel.create({
      ...data,
      coachId,
      status: 'OPEN',
      enrolledCount: 0,
    });
    return { ...created.toObject(), id: created._id.toString() };
  }

  // 7. BOOK COACH / ENROLL COURSE
  async createBooking(userId: string, userDetails: { name: string; phone?: string; email?: string }, data: any) {
    const coach = await this.coachProfileModel.findById(data.coachId);
    if (!coach) throw new NotFoundException('Huấn luyện viên không tồn tại');

    let totalPrice = data.totalPrice;
    let courseTitle = undefined;

    if (data.bookingType === CoachBookingType.COURSE) {
      const course = await this.coachCourseModel.findById(data.courseId);
      if (!course) throw new NotFoundException('Khoá học không tồn tại');
      if (course.enrolledCount >= course.maxStudents) {
        throw new BadRequestException('Khoá học đã đủ học viên');
      }
      totalPrice = course.price;
      courseTitle = course.title;

      // Update enrolled count
      await this.coachCourseModel.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });
    } else {
      // Hourly booking
      const hours = data.durationHours || 1;
      totalPrice = coach.hourlyRate * hours;
    }

    const booking = await this.coachBookingModel.create({
      ...data,
      userId,
      userName: userDetails.name,
      userPhone: userDetails.phone || '',
      userEmail: userDetails.email || '',
      coachName: coach.fullName,
      coachAvatar: coach.avatarUrl,
      courseTitle,
      totalPrice,
      status: CoachBookingStatus.CONFIRMED,
      paymentStatus: 'UNPAID',
    });

    return { ...booking.toObject(), id: booking._id.toString() };
  }

  // 8. GET BOOKINGS FOR USER
  async getUserBookings(userId: string) {
    const bookings = await this.coachBookingModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return bookings.map(b => ({ ...b, id: b._id.toString() }));
  }

  // 9. ADD REVIEW FOR COACH
  async addReview(coachId: string, userId: string, data: { userName: string; userAvatar?: string; rating: number; comment: string; bookingType: CoachBookingType }) {
    const review = await this.coachReviewModel.create({
      coachId,
      userId,
      userName: data.userName,
      userAvatar: data.userAvatar || '',
      rating: data.rating,
      comment: data.comment,
      bookingType: data.bookingType || CoachBookingType.HOURLY,
    });

    // Recompute coach rating
    const allReviews = await this.coachReviewModel.find({ coachId });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);

    await this.coachProfileModel.findByIdAndUpdate(coachId, {
      rating: parseFloat(avgRating),
      reviewCount: allReviews.length,
    });

    return { ...review.toObject(), id: review._id.toString() };
  }

  // SEED INITIAL DEMO COACHES & COURSES
  private async seedInitialCoaches() {
    const demoCoaches = [
      {
        userId: 'coach_demo_01',
        fullName: 'Nguyễn Văn Hoàng',
        headline: 'HLV Cầu Lông Cấp 1 Quốc Gia - Cựu Kiện Tướng Thể Thao',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
        phone: '0905123456',
        email: 'hoang.badminton@courtmate.vn',
        sports: [SportType.BADMINTON],
        bio: 'Hơn 9 năm kinh nghiệm huấn luyện chuyên nghiệp cho cả người mới bắt đầu và vận động viên phong trào chuẩn bị thi đấu giải. Phong cách giảng dạy tận tâm, tập trung rèn luyện bộ pháp di chuyển chuẩn xác và kỹ thuật đập cầu giải phóng tối đa lực tay.',
        experienceYears: 9,
        certificates: [
          { title: 'Chứng chỉ Huấn luyện viên Cầu lông Cấp 1 Quốc gia', issuedBy: 'Liên đoàn Cầu lông Việt Nam (VBF)', year: 2018 },
          { title: 'Huy chương Bạc Đôi nam Giải Vô địch Quốc Gia 2017', issuedBy: 'Tổng cục Thể dục Thể thao', year: 2017 },
        ],
        hourlyRate: 250000,
        city: 'Đà Nẵng',
        districts: ['Hải Châu', 'Sơn Trà', 'Cẩm Lệ'],
        preferredCourts: ['Sân Cầu lông Quân Khu 5', 'Sân Kỳ Đồng', 'CLB Tiên Sơn'],
        rating: 4.9,
        reviewCount: 38,
        verificationStatus: CoachVerificationStatus.APPROVED,
        availableSlots: [
          { dayOfWeek: 1, startTime: '17:30', endTime: '21:30' },
          { dayOfWeek: 3, startTime: '17:30', endTime: '21:30' },
          { dayOfWeek: 5, startTime: '17:30', endTime: '21:30' },
          { dayOfWeek: 6, startTime: '08:00', endTime: '18:00' },
        ],
      },
      {
        userId: 'coach_demo_02',
        fullName: 'Trần Minh Quân',
        headline: 'HLV Pickleball Quốc Tế IPTPA Level 2 - Tiên phong Pickleball Đà Nẵng',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=1200&auto=format&fit=crop&q=80',
        phone: '0918765432',
        email: 'quan.pickleball@courtmate.vn',
        sports: [SportType.PICKLEBALL],
        bio: 'Chứng chỉ HLV Pickleball Quốc tế IPTPA. Chuyên đào tạo kỹ thuật Dink bóng chuẩn xác, chiến thuật phòng thủ chuyển giao thế trận Third-shot drop và bao sân đôi.',
        experienceYears: 6,
        certificates: [
          { title: 'IPTPA Level II Certified Teaching Professional', issuedBy: 'International Pickleball Teaching Professional Association', year: 2022 },
          { title: 'Vô địch Đôi nam Open Danang Pickleball Cup 2024', issuedBy: 'Pickleball Đà Nẵng', year: 2024 },
        ],
        hourlyRate: 350000,
        city: 'Đà Nẵng',
        districts: ['Sơn Trà', 'Ngũ Hành Sơn'],
        preferredCourts: ['Pickleball D-Club Sơn Trà', 'Sân Pickleball Mỹ Khê'],
        rating: 5.0,
        reviewCount: 29,
        verificationStatus: CoachVerificationStatus.APPROVED,
        availableSlots: [
          { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
          { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
          { dayOfWeek: 0, startTime: '07:30', endTime: '11:30' },
        ],
      },
      {
        userId: 'coach_demo_03',
        fullName: 'Lê Thảo My',
        headline: 'HLV Cầu Lông Trẻ & Nữ - Chuyên Đào Tạo Cơ Bản Đến Nâng Cao',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&auto=format&fit=crop&q=80',
        phone: '0935555666',
        email: 'thaomy.badminton@courtmate.vn',
        sports: [SportType.BADMINTON],
        bio: 'Tốt nghiệp Đại học Sư phạm Thể dục Thể thao, có chứng chỉ huấn luyện viên cầu lông chuyên nghiệp. Phương pháp dạy trực quan, kiên nhẫn, đặc biệt hiệu quả với phụ nữ, trẻ em và người mới bắt đầu.',
        experienceYears: 5,
        certificates: [
          { title: 'Chứng chỉ Sư phạm Huấn luyện Thể thao Học đường', issuedBy: 'Đại học Thể dục Thể thao', year: 2021 },
        ],
        hourlyRate: 280000,
        city: 'Đà Nẵng',
        districts: ['Hải Châu', 'Thanh Khê'],
        preferredCourts: ['Sân Cầu Lông Tiên Sơn', 'Sân Kỳ Đồng'],
        rating: 4.8,
        reviewCount: 22,
        verificationStatus: CoachVerificationStatus.APPROVED,
        availableSlots: [
          { dayOfWeek: 1, startTime: '06:00', endTime: '09:00' },
          { dayOfWeek: 3, startTime: '06:00', endTime: '09:00' },
          { dayOfWeek: 5, startTime: '06:00', endTime: '09:00' },
        ],
      },
    ];

    for (const coachData of demoCoaches) {
      const coach = await this.coachProfileModel.create(coachData);
      
      // Seed reviews for coach
      await this.coachReviewModel.create([
        {
          coachId: coach._id.toString(),
          userId: 'user_rev_1',
          userName: 'Phạm Minh Trí',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          comment: 'Thầy dạy cực kỳ nhiệt tình, sửa từng góc vợt và bước chân. Sau 4 buổi tập cú smash của mình cắm và uy lực hơn hẳn!',
          bookingType: CoachBookingType.HOURLY,
        },
        {
          coachId: coach._id.toString(),
          userId: 'user_rev_2',
          userName: 'Đặng Mai Lan',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          rating: 5,
          comment: 'Rất đúng giờ, bài tập đa dạng không bị nhàm chán. Vote 5 sao cho chất lượng giảng dạy của Coach!',
          bookingType: CoachBookingType.COURSE,
        },
      ]);

      // Seed Courses for coach
      if (coachData.sports.includes(SportType.BADMINTON)) {
        await this.coachCourseModel.create({
          coachId: coach._id.toString(),
          title: 'Khoá Cầu Lông Căn Bản - Chỉnh Bộ Pháp & Đập Cầu Chắc Tay',
          sport: SportType.BADMINTON,
          level: 'Cơ bản đến Trung cấp',
          price: 1800000,
          totalSessions: 8,
          durationPerSession: 90,
          scheduleDescription: 'Thứ 2 & Thứ 4 hàng tuần (18:00 - 19:30)',
          maxStudents: 6,
          enrolledCount: 3,
          location: 'Sân Cầu Lông Kỳ Đồng - Quận Thanh Khê, Đà Nẵng',
          description: 'Khoá học 8 buổi thiết kế chuyên sâu: 2 buổi sửa bộ di chuyển 6 góc sân, 2 buổi chỉnh kỹ thuật phông cầu/chém cầu, 3 buổi rèn đập smash giải phóng lực cổ tay, 1 buổi ghép đấu cọ xát thực chiến.',
          syllabus: [
            'Buổi 1-2: Bộ pháp di chuyển 6 góc sân và phản xạ lùi đón cầu',
            'Buổi 3-4: Kỹ thuật phông cầu cao sâu và ve trái tay (backhand)',
            'Buổi 5-7: Kỹ thuật đập smash, chụp lưới và đổi hướng tấn công',
            'Buổi 8: Ghép trận đôi/đơn và hướng dẫn chiến thuật bao sân',
          ],
          status: 'OPEN',
        });
      }

      if (coachData.sports.includes(SportType.PICKLEBALL)) {
        await this.coachCourseModel.create({
          coachId: coach._id.toString(),
          title: 'Trại Huấn Luyện Pickleball Cấp Tốc - Kiểm Soát Kitchen & Dinking',
          sport: SportType.PICKLEBALL,
          level: 'Mọi cấp độ',
          price: 2200000,
          totalSessions: 6,
          durationPerSession: 120,
          scheduleDescription: 'Thứ 3 & Thứ 5 hàng tuần (19:00 - 21:00)',
          maxStudents: 4,
          enrolledCount: 2,
          location: 'Pickleball D-Club Sơn Trà, Đà Nẵng',
          description: 'Khoá học chuyên sâu về tư duy vị trí trong sân Pickleball: Kỹ năng Third-shot drop chuẩn xác, kiên nhẫn dink bóng ở khu vực Non-Volley Zone (Kitchen) và cách bẻ bóng hiểm hóc khi đối thủ sơ hở.',
          syllabus: [
            'Buổi 1: Luật phát bóng, trả bóng an toàn vào khoảng trống sâu',
            'Buổi 2: Làm chủ cú Third-shot drop mềm mại vào Kitchen',
            'Buổi 3: Dinking bóng ngang, dinking chéo và rèn luyện tính kiên nhẫn',
            'Buổi 4: Speed-up bóng và phản xạ volley phòng thủ',
            'Buổi 5-6: Chiến thuật phối hợp đôi, stacking và thi đấu cọ xát',
          ],
          status: 'OPEN',
        });
      }
    }
  }
}
