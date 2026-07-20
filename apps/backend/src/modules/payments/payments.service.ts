import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
const { PayOS } = require('@payos/node');
import { Model } from 'mongoose';
import { RegistrationStatus } from '@courtmate/shared';
import { Registration } from '../registrations/infrastructure/persistence/registration.entity';
import { TournamentStub } from '../registrations/infrastructure/persistence/tournament-stub.entity';
import { CreatePaymentDto } from './payment.dto';
import { PaymentTransaction } from './payment.entity';

type Query = Record<string, string | number | undefined>;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private payos: any;

  constructor(
    @InjectModel(PaymentTransaction.name) private readonly payments: Model<PaymentTransaction>,
    @InjectModel(Registration.name) private readonly registrations: Model<Registration>,
    @InjectModel(TournamentStub.name) private readonly tournaments: Model<TournamentStub>,
    private readonly config: ConfigService,
  ) {
    this.payos = new PayOS({
      clientId: this.config.get<string>('PAYOS_CLIENT_ID') || 'client-id',
      apiKey: this.config.get<string>('PAYOS_API_KEY') || 'api-key',
      checksumKey: this.config.get<string>('PAYOS_CHECKSUM_KEY') || 'checksum-key'
    });
  }

  async createPayment(dto: CreatePaymentDto, ipAddress: string, playerId: string) {
    this.logger.log(`Khởi tạo thanh toán: registrationId=${dto.registrationId}, provider=${dto.provider}, playerId=${playerId}`);
    
    const registration = await this.registrations.findById(dto.registrationId).exec();
    if (!registration) {
      this.logger.error(`Không tìm thấy hồ sơ đăng ký: registrationId=${dto.registrationId}`);
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    
    if (registration.playerId !== playerId) {
      this.logger.error(`Sai chủ hồ sơ: registration.playerId=${registration.playerId}, request.playerId=${playerId}`);
      throw new ForbiddenException('Bạn không có quyền thanh toán hồ sơ này');
    }
    
    if (registration.status === RegistrationStatus.PAID) {
      this.logger.warn(`Hồ sơ đã thanh toán trước đó: registrationId=${dto.registrationId}`);
      throw new BadRequestException('Hồ sơ đăng ký đã được thanh toán');
    }

    const tournament = await this.tournaments.findById(registration.tournamentId).exec();
    if (!tournament) {
      this.logger.error(`Không tìm thấy giải đấu stub: tournamentId=${registration.tournamentId}`);
      throw new NotFoundException('Không tìm thấy giải đấu');
    }
    
    const categoryFees = (tournament as any).categories?.map((item: any) => Number(item.fee)).filter(Number.isFinite) || [];
    const amount = Number(tournament.registrationFee || Math.min(...categoryFees));
    this.logger.log(`Thông tin lệ phí: registrationFee=${tournament.registrationFee}, categoryFees=[${categoryFees.join(', ')}], resolvedAmount=${amount}`);
    
    if (!Number.isFinite(amount) || amount < 1000) {
      this.logger.error(`Lệ phí không hợp lệ (< 1000 VND): amount=${amount}`);
      throw new BadRequestException('Giải đấu chưa có lệ phí thanh toán hợp lệ');
    }

    const existing = await this.payments.findOne({ registrationId: dto.registrationId, provider: dto.provider, status: 'PENDING' }).exec();
    if (existing) {
      if (existing.payUrl) {
        this.logger.log(`Tìm thấy giao dịch PENDING có sẵn, tái sử dụng URL: orderId=${existing.orderId}`);
        return this.toClientResponse(existing);
      } else {
        await this.payments.deleteOne({ _id: existing._id }).exec();
      }
    }

    const orderId = String(Date.now()).slice(-9) + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    this.logger.log(`Tạo giao dịch mới: orderId=${orderId}, amount=${amount}`);
    
    const transaction = await this.payments.create({
      orderId,
      registrationId: dto.registrationId,
      provider: dto.provider,
      amount,
      status: 'PENDING',
    });

    try {
      const gateway = dto.provider === 'PAYOS'
        ? await this.createPayosPayment(transaction)
        : await this.createMomoPayment(transaction);
      transaction.payUrl = gateway.payUrl;
      transaction.gatewayResponse = gateway.raw;
      await transaction.save();
      this.logger.log(`Tạo URL thanh toán thành công: payUrl=${gateway.payUrl}`);
      return this.toClientResponse(transaction);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gọi đối tác thanh toán ${dto.provider}: ${error.message}`, error.stack);
      transaction.status = 'FAILED';
      await transaction.save();
      throw error;
    }
  }

  async getStatus(orderId: string, playerId: string) {
    const transaction = await this.payments.findOne({ orderId }).exec();
    if (!transaction) throw new NotFoundException('Không tìm thấy giao dịch');
    const registration = await this.registrations.findById(transaction.registrationId).select('playerId').exec();
    if (!registration || registration.playerId !== playerId) throw new ForbiddenException('Bạn không có quyền xem giao dịch này');

    if (transaction.status === 'PENDING' && transaction.provider === 'PAYOS') {
      try {
        const payosLink = await this.payos.paymentRequests.get(Number(orderId));
        if (payosLink && payosLink.status === 'PAID') {
          const success = true;
          // transactions might be empty, grab reference if available
          const reference = payosLink.transactions?.[0]?.reference || '';
          await this.completeTransaction(transaction, success, reference, { ...payosLink });
        } else if (payosLink && (payosLink.status === 'CANCELLED' || payosLink.status === 'FAILED')) {
          await this.completeTransaction(transaction, false, '', { ...payosLink });
        }
      } catch (error: any) {
        this.logger.warn(`Lỗi khi lấy thông tin giao dịch từ PayOS (orderId=${orderId}): ${error.message}`);
      }
    }

    return this.toClientResponse(transaction);
  }

  async handlePayosIpn(body: any) {
    try {
      const webhookData = this.payos.webhooks.verify(body);
      const transaction = await this.payments.findOne({ orderId: String(webhookData.orderCode) }).exec();
      if (!transaction) return { success: false, message: 'Order not found' };
      if (transaction.status === 'PAID') return { success: true, message: 'Already paid' };
      if (webhookData.amount !== transaction.amount) return { success: false, message: 'Invalid amount' };

      const success = webhookData.code === '00' || webhookData.success === true;
      await this.completeTransaction(transaction, success, String(webhookData.reference || ''), body);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Invalid signature' };
    }
  }

  async handleMomoIpn(payload: Query) {
    if (!this.verifyMomoCallback(payload)) throw new BadRequestException('Invalid MoMo signature');
    const transaction = await this.payments.findOne({ orderId: String(payload.orderId) }).exec();
    if (!transaction) throw new NotFoundException('Không tìm thấy giao dịch');
    if (Number(payload.amount) !== transaction.amount) throw new BadRequestException('Số tiền callback không hợp lệ');
    if (transaction.status !== 'PAID') {
      await this.completeTransaction(transaction, Number(payload.resultCode) === 0, String(payload.transId || ''), payload);
    }
    return { resultCode: 0, message: 'Success' };
  }

  private async createPayosPayment(transaction: PaymentTransaction) {
    const orderCode = Number(transaction.orderId);
    const returnUrl = this.config.get('PAYOS_RETURN_URL', 'courtmate://payment/return');
    const cancelUrl = this.config.get('PAYOS_CANCEL_URL', 'courtmate://payment/cancel');
    
    const body = {
      orderCode,
      amount: transaction.amount,
      description: `Thanh toan phi dang ky`,
      returnUrl,
      cancelUrl,
    };
    
    const paymentLink = await this.payos.paymentRequests.create(body);
    return { payUrl: paymentLink.checkoutUrl, raw: { provider: 'PAYOS' } };
  }

  private async createMomoPayment(transaction: PaymentTransaction) {
    const partnerCode = this.required('MOMO_PARTNER_CODE');
    const accessKey = this.required('MOMO_ACCESS_KEY');
    const secretKey = this.required('MOMO_SECRET_KEY');
    const endpoint = this.config.get('MOMO_CREATE_URL', 'https://test-payment.momo.vn/v2/gateway/api/create');
    const redirectUrl = this.required('MOMO_REDIRECT_URL');
    const ipnUrl = this.required('MOMO_IPN_URL');
    const requestId = transaction.orderId;
    const requestType = 'captureWallet';
    const extraData = Buffer.from(JSON.stringify({ registrationId: transaction.registrationId })).toString('base64');
    const orderInfo = `CourtMate registration ${transaction.registrationId}`;
    const rawSignature = `accessKey=${accessKey}&amount=${transaction.amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${transaction.orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = createHmac('sha256', secretKey).update(rawSignature, 'utf8').digest('hex');
    const body = { partnerCode, partnerName: 'CourtMate', storeId: 'CourtMate', requestId, amount: transaction.amount, orderId: transaction.orderId, orderInfo, redirectUrl, ipnUrl, requestType, extraData, lang: 'vi', autoCapture: true, signature };
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
    const data = await response.json() as any;
    if (!response.ok || data.resultCode !== 0 || !data.payUrl) {
      throw new ServiceUnavailableException(data.message || 'MoMo không thể tạo giao dịch');
    }
    return { payUrl: data.payUrl as string, raw: data as Record<string, unknown> };
  }

  // VNPAY removed

  private verifyMomoCallback(data: Query) {
    const raw = `accessKey=${this.required('MOMO_ACCESS_KEY')}&amount=${data.amount}&extraData=${data.extraData || ''}&message=${data.message || ''}&orderId=${data.orderId}&orderInfo=${data.orderInfo || ''}&orderType=${data.orderType || ''}&partnerCode=${data.partnerCode}&payType=${data.payType || ''}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId || ''}`;
    const expected = createHmac('sha256', this.required('MOMO_SECRET_KEY')).update(raw, 'utf8').digest('hex');
    return this.safeEqual(String(data.signature || '').toLowerCase(), expected.toLowerCase());
  }

  private async completeTransaction(transaction: PaymentTransaction, success: boolean, gatewayId: string, response: Query) {
    transaction.status = success ? 'PAID' : 'FAILED';
    transaction.gatewayTransactionId = gatewayId;
    transaction.gatewayResponse = response;
    transaction.processedAt = new Date();
    await transaction.save();

    if (success) {
      const registration = await this.registrations.findByIdAndUpdate(
        transaction.registrationId,
        { $set: { status: RegistrationStatus.PAID, paymentTransactionId: transaction.orderId } },
        { new: true }
      ).exec();
      
      if (registration) {
        // Increment joinedSlots in the tournaments collection (which TournamentStub points to)
        await this.tournaments.findByIdAndUpdate(
          registration.tournamentId,
          { $inc: { joinedSlots: 1 } }
        ).exec();
      }
    }
  }

  private toClientResponse(transaction: PaymentTransaction) {
    return { orderId: transaction.orderId, registrationId: transaction.registrationId, provider: transaction.provider, amount: transaction.amount, status: transaction.status, payUrl: transaction.payUrl };
  }

  private required(key: string) {
    const value = this.config.get<string>(key);
    if (!value) throw new ServiceUnavailableException(`Thiếu cấu hình ${key}`);
    return value;
  }

  private queryString(values: Query) {
    return Object.entries(values).filter(([, value]) => value !== undefined && value !== '').sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`).join('&');
  }

  private vnpDate(date: Date) {
    const local = new Date(date.getTime() + 7 * 60 * 60_000);
    return local.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  }

  private safeEqual(a: string, b: string) {
    const left = Buffer.from(a); const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  }
}
