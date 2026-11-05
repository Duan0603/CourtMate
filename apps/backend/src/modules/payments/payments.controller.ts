import { Body, Controller, Get, Headers, Ip, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from './payment.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreatePaymentDto,
    @Ip() ipAddress: string,
    @Req() request: any,
    @Headers('origin') origin?: string,
  ) {
    return this.payments.createPayment(
      dto,
      ipAddress.replace('::ffff:', ''),
      String(request.user.sub),
      origin,
    );
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
  status(@Param('orderId') orderId: string) {
    return this.payments.getStatus(orderId);
  }

  @Post(':orderId/cancel')
  cancel(@Param('orderId') orderId: string, @Req() request: any) {
    const playerId = request.user?.sub ? String(request.user.sub) : undefined;
    return this.payments.cancelPayment(orderId, playerId);
  }
}
