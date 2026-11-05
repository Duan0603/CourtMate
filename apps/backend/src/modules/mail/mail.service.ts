import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { User } from '../users/infrastructure/persistence/user.entity';

export interface RegistrationEmailPayload {
  registration: any;
  tournament: any;
  transaction?: any;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private etherealTransporterPromise: Promise<nodemailer.Transporter> | null = null;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Convert a Vietnamese organizer name into a clean fallback Gmail address
   * e.g. "Giải ABC" -> "giaiabc@gmail.com", "CLB Cầu lông FUB" -> "clbcaulongfub@gmail.com"
   */
  public slugifyToEmail(name: string): string {
    const cleaned = (name || 'ban.to.chuc')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 28);
    return `${cleaned || 'bantochuc'}@gmail.com`;
  }

  /**
   * Resolve the Organizer's display name and email address (e.g. giaiABC@gmail.com)
   */
  async resolveOrganizerSender(tournament: any): Promise<{ name: string; email: string }> {
    const organizerName = tournament?.organizer?.name || 'Ban Tổ Chức Giải Đấu';

    // 1. Check direct email on tournament.organizer
    if (tournament?.organizer?.email && tournament.organizer.email.includes('@')) {
      return {
        name: organizerName,
        email: tournament.organizer.email.trim(),
      };
    }

    // 2. Look up Organizer user in `users` collection by ID
    const orgId = tournament?.organizer?.id;
    if (orgId && Types.ObjectId.isValid(orgId)) {
      try {
        const orgUser = await this.userModel
          .findById(orgId)
          .select('email name')
          .lean()
          .exec();
        if (orgUser?.email) {
          return {
            name: organizerName || orgUser.name,
            email: orgUser.email.trim(),
          };
        }
      } catch (err) {
        this.logger.warn(`Failed to lookup organizer by ID ${orgId}: ${(err as Error).message}`);
      }
    }

    // 3. Look up Organizer user in `users` collection by matching name
    if (organizerName) {
      try {
        const escaped = organizerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const orgUser = await this.userModel
          .findOne({
            role: 'ORGANIZER',
            name: { $regex: escaped, $options: 'i' },
          })
          .select('email name')
          .lean()
          .exec();
        if (orgUser?.email) {
          return {
            name: organizerName,
            email: orgUser.email.trim(),
          };
        }
      } catch (err) {
        this.logger.warn(`Failed to lookup organizer by name "${organizerName}": ${(err as Error).message}`);
      }
    }

    // 4. Fallback: derive clean Gmail from organizer name
    return {
      name: organizerName,
      email: this.slugifyToEmail(organizerName),
    };
  }

  /**
   * Resolve the Registrant's recipient email address
   */
  async resolveRecipientEmail(registration: any): Promise<string | null> {
    if (registration?.email && registration.email.includes('@')) {
      return registration.email.trim();
    }

    const playerId = registration?.playerId;
    if (playerId && Types.ObjectId.isValid(playerId)) {
      try {
        const user = await this.userModel
          .findById(playerId)
          .select('email')
          .lean()
          .exec();
        if (user?.email && user.email.includes('@')) {
          return user.email.trim();
        }
      } catch (err) {
        this.logger.warn(`Failed to lookup player email for playerId=${playerId}: ${(err as Error).message}`);
      }
    }

    return null;
  }

  /**
   * Send email using Brevo (Sendinblue) Transactional HTTP API (v3)
   * Completely bypasses cloud port blocking (e.g. Render / AWS / GCP)
   */
  private async sendViaBrevoApi(params: {
    toEmail: string;
    playerName: string;
    organizer: { name: string; email: string };
    subject: string;
    html: string;
    text: string;
  }): Promise<{ messageId?: string }> {
    const apiKey = this.config.get<string>('BREVO_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const configuredSenderEmail =
      this.config.get<string>('BREVO_SENDER_EMAIL')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim();

    if (!configuredSenderEmail) {
      throw new Error('BREVO_SENDER_EMAIL (hoặc SMTP_USER) chưa được cấu hình để gửi qua Brevo');
    }

    const defaultSenderName = this.config.get<string>('BREVO_SENDER_NAME')?.trim() || 'CourtMate';
    const senderName = params.organizer.name
      ? `${params.organizer.name} (${defaultSenderName})`
      : defaultSenderName;

    const payload = {
      sender: {
        name: senderName,
        email: configuredSenderEmail,
      },
      to: [
        {
          email: params.toEmail,
          name: params.playerName,
        },
      ],
      replyTo: {
        email: params.organizer.email,
        name: params.organizer.name,
      },
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as any;

    if (!response.ok) {
      const errMsg = data?.message || response.statusText || 'Unknown Brevo error';
      throw new Error(`Brevo API error (${response.status}): ${errMsg}`);
    }

    return { messageId: data?.messageId };
  }

  /**
   * Create or return Nodemailer transporter (uses configured Gmail/SMTP or falls back to Ethereal test SMTP)
   */
  private async getTransporter(): Promise<{ transporter: nodemailer.Transporter; isTestAccount: boolean }> {
    const smtpUser = this.config.get<string>('SMTP_USER')?.trim();
    const smtpPass = this.config.get<string>('SMTP_PASS')?.trim();
    const smtpHost = this.config.get<string>('SMTP_HOST')?.trim() || 'smtp.gmail.com';
    const smtpPort = Number(this.config.get<string>('SMTP_PORT') || 587);

    if (smtpUser && smtpPass && !smtpUser.includes('your-email')) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      return { transporter, isTestAccount: false };
    }

    if (!this.etherealTransporterPromise) {
      this.etherealTransporterPromise = nodemailer.createTestAccount().then((account) => {
        this.logger.log(
          `[MailService] Chưa cấu hình SMTP_USER/SMTP_PASS trong .env -> Sử dụng hộp thư thử nghiệm Ethereal (${account.user})`,
        );
        return nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      });
    }

    const transporter = await this.etherealTransporterPromise;
    return { transporter, isTestAccount: true };
  }

  /**
   * Send confirmation & electronic ticket email to the player after tournament registration is PAID
   */
  async sendTournamentRegistrationPaidEmail(
    payload: RegistrationEmailPayload,
  ): Promise<{ sent: boolean; to?: string; from?: string; previewUrl?: string }> {
    const { registration, tournament, transaction } = payload;

    const toEmail = await this.resolveRecipientEmail(registration);
    if (!toEmail) {
      this.logger.warn(
        `[MailService] Không tìm thấy email người nhận cho hồ sơ đăng ký ID=${registration?._id || registration?.id}`,
      );
      return { sent: false };
    }

    const organizer = await this.resolveOrganizerSender(tournament);
    const tournamentId = String(tournament?._id || tournament?.id || registration?.tournamentId || '');
    const regId = String(registration?._id || registration?.id || 'CONFIRMED');
    const playerId = String(registration?.playerId || 'ATHLETE');
    const playerName = registration?.playerName || 'Vận động viên';
    const contactPhone = registration?.contactPhone || '';
    const partnerName = registration?.partnerName || '';
    const categoryName =
      registration?.categoryName ||
      tournament?.categories?.[0]?.name ||
      'Nội dung tiêu chuẩn';

    const amountPaid =
      transaction?.amount ??
      tournament?.registrationFee ??
      tournament?.categories?.[0]?.fee ??
      0;

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amountPaid) || 0);

    const startDateFormatted = tournament?.startDate
      ? new Date(tournament.startDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Theo lịch của Ban Tổ Chức';

    const locationText = [tournament?.location, tournament?.district, tournament?.city]
      .filter(Boolean)
      .join(', ');

    const ticketCode = `CM-TKT-${tournamentId.slice(-6).toUpperCase()}-${playerId.slice(-4).toUpperCase()}`;
    const qrPayload = `COURTMATE_TICKET:${tournamentId}:${playerId}:${regId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPayload)}`;

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      (this.config.get<string>('PAYOS_RETURN_URL') || 'http://localhost:3001/payment/return').replace(
        /\/payment\/return.*$/,
        '',
      );
    const ticketUrl = `${frontendUrl}/ticket/${tournamentId}`;

    // Display From as the Organizer's name and email (e.g., "CLB Cầu Lông Đà Nẵng <giaiABC@gmail.com>")
    const fromHeader = {
      name: `${organizer.name} (${organizer.email})`,
      address: organizer.email,
    };

    const replyToHeader = {
      name: organizer.name,
      address: organizer.email,
    };

    const subject = `[${tournament?.title || 'Giải đấu CourtMate'}] Xác nhận đăng ký & Vé điện tử - ${playerName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6fb;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:2px solid #0f172a;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%);padding:28px 32px;color:#ffffff;">
              <div style="display:inline-block;background-color:#dcfce7;color:#166534;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">
                ✓ ĐÃ THANH TOÁN &amp; XÁC NHẬN VÉ ĐIỆN TỬ
              </div>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:800;color:#ffffff;">
                ${tournament?.title || 'Giải đấu thể thao CourtMate'}
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#dbeafe;">
                Ban tổ chức: <strong style="color:#ffffff;">${organizer.name}</strong> &bull;
                <a href="mailto:${organizer.email}" style="color:#93c5fd;text-decoration:underline;">${organizer.email}</a>
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 12px;">
              <p style="margin:0 0 10px;font-size:15px;line-height:1.6;">
                Xin chào <strong>${playerName}</strong>,
              </p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
                Ban tổ chức <strong>${organizer.name}</strong> (<a href="mailto:${organizer.email}" style="color:#2563eb;text-decoration:none;font-weight:600;">${organizer.email}</a>) xác nhận bạn đã hoàn tất đăng ký và thanh toán lệ phí tham dự giải đấu <strong>${tournament?.title || ''}</strong>. Dưới đây là thông tin hồ sơ thi đấu và mã QR check-in của bạn:
              </p>
            </td>
          </tr>

          <!-- Ticket Code & QR -->
          <tr>
            <td style="padding:16px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:2px dashed #0f172a;border-radius:16px;padding:20px;text-align:center;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:1px;text-transform:uppercase;">
                      MÃ VÉ ĐIỆN TỬ (E-PASS)
                    </div>
                    <div style="font-size:20px;font-weight:900;color:#1d4ed8;font-family:monospace;margin:6px 0 14px;">
                      ${ticketCode}
                    </div>
                    <img src="${qrUrl}" alt="QR Check-in" width="180" height="180" style="display:block;margin:0 auto;border-radius:12px;border:1px solid #e2e8f0;background:#ffffff;padding:8px;" />
                    <p style="margin:12px 0 0;font-size:12px;color:#475569;">
                      Vui lòng xuất trình mã QR này tại bàn trọng tài để điểm danh trước giờ thi đấu 20 phút.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Athlete & Registration Info -->
          <tr>
            <td style="padding:8px 32px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="background-color:#f1f5f9;padding:10px 16px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                    Thông tin vận động viên &amp; Thanh toán
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;width:42%;">Họ và tên VĐV</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">${playerName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Số điện thoại</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">${contactPhone}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Hạng mục thi đấu</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1d4ed8;border-top:1px solid #e2e8f0;">${categoryName}</td>
                </tr>
                ${
                  partnerName
                    ? `<tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">VĐV đánh cặp (Partner)</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">${partnerName}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Lệ phí đã thanh toán</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:800;color:#16a34a;border-top:1px solid #e2e8f0;">${formattedAmount} (ĐÃ THANH TOÁN)</td>
                </tr>
                ${
                  transaction?.orderId
                    ? `<tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Mã giao dịch</td>
                  <td style="padding:10px 16px;font-size:13px;font-family:monospace;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">#${transaction.orderId}</td>
                </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Tournament Schedule & Venue -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="background-color:#f1f5f9;padding:10px 16px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                    Lịch trình &amp; Địa điểm thi đấu
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;width:42%;">Ngày khởi tranh</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">${startDateFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Địa điểm sân</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">${locationText || 'Đà Nẵng'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Liên hệ Ban Tổ Chức</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #e2e8f0;">
                    ${organizer.name} (<a href="mailto:${organizer.email}" style="color:#2563eb;text-decoration:none;">${organizer.email}</a>)
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <a href="${ticketUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:12px;border:2px solid #0f172a;">
                Xem &amp; In Vé Điện Tử Trực Tuyến &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 32px;text-align:center;font-size:12px;color:#64748b;line-height:1.5;">
              Email này được gửi từ Ban tổ chức <strong>${organizer.name} (${organizer.email})</strong> thông qua hệ thống quản lý giải đấu <strong>CourtMate</strong>.<br/>
              Nếu cần hỗ trợ, bạn có thể trả lời (Reply) trực tiếp email này về địa chỉ <a href="mailto:${organizer.email}" style="color:#2563eb;">${organizer.email}</a>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const text = [
      `XÁC NHẬN ĐĂNG KÝ & VÉ ĐIỆN TỬ THI ĐẤU - ${tournament?.title || 'CourtMate'}`,
      `Ban tổ chức: ${organizer.name} <${organizer.email}>`,
      ``,
      `Xin chào ${playerName},`,
      `Ban tổ chức ${organizer.name} (${organizer.email}) xác nhận bạn đã hoàn tất đăng ký và thanh toán giải đấu "${tournament?.title}".`,
      ``,
      `- Mã vé điện tử: ${ticketCode}`,
      `- Họ tên VĐV: ${playerName}`,
      `- Số điện thoại: ${contactPhone}`,
      `- Hạng mục: ${categoryName}`,
      partnerName ? `- VĐV đánh cặp: ${partnerName}` : null,
      `- Lệ phí: ${formattedAmount} (ĐÃ THANH TOÁN)`,
      transaction?.orderId ? `- Mã giao dịch: #${transaction.orderId}` : null,
      `- Thời gian thi đấu: ${startDateFormatted}`,
      `- Địa điểm: ${locationText}`,
      `- Xem vé điện tử tại: ${ticketUrl}`,
      ``,
      `Mọi thắc mắc vui lòng liên hệ trực tiếp BTC qua email: ${organizer.email}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const brevoApiKey = this.config.get<string>('BREVO_API_KEY')?.trim();

      if (brevoApiKey) {
        // Priority 1: Brevo HTTP REST API (Recommended for Cloud / Render)
        this.logger.log(`[MailService] Đang gửi email qua Brevo Transactional API tới "${toEmail}"...`);
        const result = await this.sendViaBrevoApi({
          toEmail,
          playerName,
          organizer,
          subject,
          html,
          text,
        });

        this.logger.log(
          `[MailService] Đã gửi thành công email xác nhận qua Brevo tới "${toEmail}" (messageId=${result.messageId})`,
        );

        return {
          sent: true,
          to: toEmail,
          from: `${organizer.name} <${organizer.email}>`,
        };
      }

      // Priority 2: Standard SMTP / Nodemailer (fallback)
      const { transporter, isTestAccount } = await this.getTransporter();
      const info = await transporter.sendMail({
        from: fromHeader,
        sender: organizer.email,
        replyTo: replyToHeader,
        to: toEmail,
        subject,
        text,
        html,
      });

      const previewUrl = isTestAccount ? (nodemailer.getTestMessageUrl(info) || undefined) : undefined;
      this.logger.log(
        `[MailService] Đã gửi email xác nhận giải đấu tới "${toEmail}" từ BTC "${organizer.name} <${organizer.email}>" (messageId=${info.messageId})${
          previewUrl ? ` | Xem trước email: ${previewUrl}` : ''
        }`,
      );

      return {
        sent: true,
        to: toEmail,
        from: `${organizer.name} <${organizer.email}>`,
        previewUrl,
      };
    } catch (error: any) {
      this.logger.error(
        `[MailService] Lỗi khi gửi email xác nhận cho "${toEmail}": ${error.message}`,
        error.stack,
      );
      return { sent: false };
    }
  }
}

