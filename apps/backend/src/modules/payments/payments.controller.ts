import { Body, Controller, Get, Ip, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from './payment.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePaymentDto, @Ip() ipAddress: string, @Req() request: any) {
    return this.payments.createPayment(dto, ipAddress.replace('::ffff:', ''), String(request.user.sub));
  }

  @Post('payos/ipn')
  payosIpn(@Body() body: any) {
    return this.payments.handlePayosIpn(body);
  }

  @Post('momo/ipn')
  momoIpn(@Body() body: Record<string, string | number>) {
    return this.payments.handleMomoIpn(body);
  }

  @Get('momo/return')
  momoReturn(@Query() query: Record<string, string | number>) {
    return this.payments.handleMomoIpn(query);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  status(@Param('orderId') orderId: string, @Req() request: any) {
    return this.payments.getStatus(orderId, String(request.user.sub));
  }
}
