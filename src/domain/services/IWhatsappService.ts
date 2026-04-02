// src/domain/services/IWhatsappService.ts
export interface ISendOrderPayload {
  to: string       // número do whatsapp da loja (ex: +5511999999999)
  message: string
}

export interface IWhatsappService {
  sendMessage(payload: ISendOrderPayload): Promise<void>
}
