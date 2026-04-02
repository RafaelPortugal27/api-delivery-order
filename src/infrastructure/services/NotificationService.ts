// src/infrastructure/services/NotificationService.ts
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { INotificationService, ISendOtpPayload } from '../../domain/services/INotificationService'
import { OtpChannel } from '../../domain/entities/OtpCode'

export class NotificationService implements INotificationService {
  private mailer: nodemailer.Transporter
  private twilioClient: ReturnType<typeof twilio>

  constructor() {
    this.mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    )
  }

  async sendOtp({ to, code, channel }: ISendOtpPayload): Promise<void> {
    const handlers: Record<OtpChannel, () => Promise<void>> = {
      EMAIL: () => this.sendEmail(to, code),
      SMS: () => this.sendSms(to, code),
      WHATSAPP: () => this.sendWhatsappOtp(to, code),
    }

    await handlers[channel]()
  }

  private async sendEmail(to: string, code: string): Promise<void> {
    await this.mailer.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Seu código de acesso',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2>🍔 Código de Acesso</h2>
          <p>Use o código abaixo para entrar:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                      padding: 16px; background: #f5f5f5; border-radius: 8px; 
                      text-align: center;">
            ${code}
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">
            Válido por ${process.env.OTP_EXPIRES_IN_MINUTES ?? 10} minutos. Não compartilhe este código.
          </p>
        </div>
      `,
    })
  }

  private async sendSms(to: string, code: string): Promise<void> {
    await this.twilioClient.messages.create({
      body: `Seu código de acesso: ${code}. Válido por ${process.env.OTP_EXPIRES_IN_MINUTES ?? 10} minutos.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })
  }

  private async sendWhatsappOtp(to: string, code: string): Promise<void> {
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    await this.twilioClient.messages.create({
      body: `🔐 Seu código de acesso: *${code}*\nVálido por ${process.env.OTP_EXPIRES_IN_MINUTES ?? 10} minutos.`,
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: toFormatted,
    })
  }
}
