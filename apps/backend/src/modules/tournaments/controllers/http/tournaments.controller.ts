import { Controller, Post, Get, Body, UploadedFile, UseInterceptors, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TournamentsService } from '../../domains/services/tournaments.service';
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
        // Ensure each category has a required `id` field
        categories = categories.map((cat: any, index: number) => ({
          ...cat,
          id: cat.id || `cat-${(cat.name || 'category').toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        }));
      }
    } catch (e) {
      console.error('Error parsing categories:', e);
    }

    const createDto = {
      title: body.title,
      description: body.description,
      sport: body.sport,
      time: body.time,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : new Date(),
      location: body.location,
      city: body.city,
      categories: categories,
      rulesText: body.rulesText,
      coverImage: body.coverImage,
      rulesFileUrl: body.rulesFileUrl,
      registrationFee: body.registrationFee ? Number(body.registrationFee) : undefined,
      slotsLimit: body.slotsLimit ? Number(body.slotsLimit) : undefined,
    };

    const fileUrl = file ? `/uploads/${file.filename}` : body.rulesFileUrl;

    // TODO: Retrieve from req.user
    const mockOrganizer = {
      id: 'org-123',
      name: 'Da Nang Sports Hub',
      isVerified: true,
    };

    return this.tournamentsService.create(createDto as any, fileUrl, mockOrganizer);
  }

  @Get()
  async findAll(@Query() query: any) {
    const tournaments = await this.tournamentsService.findAll(query);
    // Determine if we are returning local or national fallback
    const isFallback = query.city && tournaments.length > 0 && tournaments[0].city !== query.city;
    
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
        registrationFee: t.registrationFee,
        slotsLimit: t.slotsLimit,
        joinedSlots: (t as any).joinedSlots || 0,
        matchDates: (t as any).matchDates,
        sourceName: t.sourceName,
        sourceUrl: t.sourceUrl,
      })),
      meta: {
        isFallback,
        message: isFallback ? 'No local tournaments found. Showing national fallback.' : 'Local tournaments',
      }
    };
  }

  @Get('my-organized')
  async findMyOrganized() {
    // TODO: Retrieve from req.user
    const mockOrganizerId = 'org-123';
    const tournaments = await this.tournamentsService.findByOrganizerId(mockOrganizerId);
    
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
        status: t.status,
        categories: t.categories,
      }))
    };
  }

  @Get('bookmarked')
  async findBookmarked(@Query('ids') ids?: string) {
    if (!ids) return { data: [] };
    const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
    const tournaments = await this.tournamentsService.findByIds(idArray);
    
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
      }))
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
      registrationFee: t.registrationFee,
      slotsLimit: t.slotsLimit,
      rules: t.rules,
      schedule: t.schedule,
      matchDates: (t as any).matchDates,
      registrationLink: t.registrationLink,
      sourceName: t.sourceName,
      sourceUrl: t.sourceUrl,
      joinedSlots: t.joinedSlots || 0,
      createdAt: t.createdAt,
    };
  }
}
