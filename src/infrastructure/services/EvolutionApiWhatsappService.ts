// src/infrastructure/services/EvolutionApiWhatsappService.ts
// Evolution API é uma alternativa open-source ao Twilio para WhatsApp
// Docs: https://doc.evolution-api.com
import axios from 'axios'
import { IWhatsappService, ISendOrderPayload } from '../../domain/services/IWhatsappService'

export class EvolutionApiWhatsappService implements IWhatsappService {
  private baseUrl: string
  private apiKey: string
  private instance: string

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
    this.apiKey = process.env.EVOLUTION_API_KEY ?? ''
    this.instance = process.env.EVOLUTION_INSTANCE ?? 'default'
  }

  async sendMessage({ to, message }: ISendOrderPayload): Promise<void> {
    // Remove o prefixo whatsapp: se vier do formato Twilio
    const number = to.replace('whatsapp:', '').replace('+', '')

    await axios.post(
      `${this.baseUrl}/message/sendText/${this.instance}`,
      {
        number,
        text: message,
      },
      {
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
