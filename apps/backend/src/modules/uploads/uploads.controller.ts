import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PDF_TYPES = new Set(['application/pdf']);

function uploadOptions(folder: string, allowed: Set<string>, maxBytes: number) {
  const directory = resolve(process.cwd(), 'uploads', folder);
  mkdirSync(directory, { recursive: true });
  return {
    storage: diskStorage({
      destination: directory,
      filename: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
        callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
      if (!allowed.has(file.mimetype)) return callback(new BadRequestException(`Định dạng ${file.mimetype} không được hỗ trợ`), false);
      callback(null, true);
    },
  };
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @Post('tournament-banner')
  @UseInterceptors(FileInterceptor('file', uploadOptions('banners', IMAGE_TYPES, 8 * 1024 * 1024)))
  banner(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    return this.response(file, 'banners', request);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', uploadOptions('avatars', IMAGE_TYPES, 5 * 1024 * 1024)))
  avatar(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    return this.response(file, 'avatars', request);
  }

  @Post('rules')
  @UseInterceptors(FileInterceptor('file', uploadOptions('rules', PDF_TYPES, 10 * 1024 * 1024)))
  rules(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    return this.response(file, 'rules', request);
  }

  private response(file: Express.Multer.File | undefined, folder: string, request: Request) {
    if (!file) throw new BadRequestException('Vui lòng chọn một file hợp lệ');
    const configuredBase = this.config.get<string>('PUBLIC_BASE_URL')?.replace(/\/$/, '');
    const base = configuredBase || `${request.protocol}://${request.get('host')}`;
    return {
      url: `${base}/uploads/${folder}/${file.filename}`,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
