import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Head()
  healthCheck() {
    return {
      status: 'ok',
      service: 'CourtMate NestJS Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
