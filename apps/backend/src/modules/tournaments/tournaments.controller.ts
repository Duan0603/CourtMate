import { Controller, Post, Get, Body, UploadedFile, UseInterceptors, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TournamentsService } from './tournaments.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

const storage = diskStorage({
  destination: './uploads',
  filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  }
});

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('rulesFile', { storage }))
  async create(
    @Body() body: any, 
    @UploadedFile() file?: Express.Multer.File
  ) {
    let categories = [];
    try {
      if (body.categories) {
        categories = typeof body.categories === 'string' ? JSON.parse(body.categories) : body.categories;
      }
    } catch (e) {
      console.error('Error parsing categories:', e);
    }

    const createDto = {
      title: body.title,
      description: body.description,
      sport: body.sport,
      time: body.time,
      location: body.location,
      city: body.city,
      categories: categories,
      rulesText: body.rulesText,
    };

    const fileUrl = file ? `/uploads/${file.filename}` : undefined;

    // TODO: Retrieve from req.user
    const mockOrganizer = {
      id: 'org-123',
      name: 'Da Nang Sports Hub',
      isVerified: true,
    };

    return this.tournamentsService.create(createDto as any, fileUrl, mockOrganizer);
  }

  @Get()
  async findAll(@Query('city') city?: string) {
    const tournaments = await this.tournamentsService.findAll(city);
    // Determine if we are returning local or national fallback
    const isFallback = city && tournaments.length > 0 && tournaments[0].city !== city;
    
    return {
      data: tournaments.map(t => ({
        id: t._id,
        title: t.title,
        sport: t.sport,
        coverImage: t.coverImage,
        startDate: t.startDate,
        location: t.location,
        district: t.district,
        city: t.city,
        organizer: t.organizer,
        status: t.status,
        categories: t.categories,
      })),
      meta: {
        isFallback,
        message: isFallback ? 'No local tournaments found. Showing national fallback.' : 'Local tournaments',
      }
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const t = await this.tournamentsService.findById(id);
    return {
      id: t._id,
      title: t.title,
      description: t.description,
      sport: t.sport,
      coverImage: t.coverImage,
      startDate: t.startDate,
      endDate: t.endDate,
      location: t.location,
      district: t.district,
      city: t.city,
      organizer: t.organizer,
      status: t.status,
      categories: t.categories,
      rules: t.rules,
      schedule: t.schedule,
      registrationLink: t.registrationLink,
      createdAt: t.createdAt,
    };
  }
}
