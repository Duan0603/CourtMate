import { Controller, Post, Body, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from '@courtmate/shared';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() createDto: CreateReportDto) {
    // TODO: Retrieve from req.user
    const mockUserId = 'user-123';
    return this.reportsService.create(createDto, mockUserId);
  }

  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }
}
