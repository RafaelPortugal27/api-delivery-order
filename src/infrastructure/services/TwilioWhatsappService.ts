// src/infrastructure/services/TwilioWhatsappService.ts
import twilio from 'twilio'
import { IWhatsappService, ISendOrderPayload } from '../../domain/services/IWhatsappService'

export class TwilioWhatsappService implements IWhatsappService {
  private client: ReturnType<typeof twilio>
  private from: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    this.from = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'
    this.client = twilio(accountSid, authToken)
  }

  async sendMessage({ to, message }: ISendOrderPayload): Promise<void> {
    // Garante o formato whatsapp:+55...
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

    await this.client.messages.create({
      body: message,
      from: this.from,
      to: toFormatted,
    })
  }
}
