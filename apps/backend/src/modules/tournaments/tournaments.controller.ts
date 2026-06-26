import { Controller, Post, Get, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
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
  async findAll() {
    return this.tournamentsService.findAll();
  }
}
