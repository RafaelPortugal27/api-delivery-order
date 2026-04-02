// src/application/helpers/formatOrderMessage.ts
import { Order } from '../../domain/entities/Order'
import { Address } from '../../domain/entities/Address'

interface FormatOrderMessageParams {
  order: Order
  storeName: string
  address: Address
  total: number
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    notes?: string
  }>
}

export function formatOrderMessage({
  order,
  storeName,
  address,
  items,
  total,
}: FormatOrderMessageParams): string {
  const itemsText = items
    .map((item) => {
      const subtotal = (item.unitPrice * item.quantity).toFixed(2)
      const obs = item.notes ? `\n   📝 Obs: ${item.notes}` : ''
      return `• ${item.quantity}x ${item.productName} — R$ ${subtotal}${obs}`
    })
    .join('\n')

  const addressText = [
    `${address.street}, ${address.number}`,
    address.complement ? `${address.complement}` : null,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    `CEP: ${address.zipCode}`,
  ]
    .filter(Boolean)
    .join('\n')

  return `🍔 *Novo Pedido — ${storeName}*
━━━━━━━━━━━━━━━━━━━━
🆔 Pedido: \`${order.id.slice(0, 8).toUpperCase()}\`
🕐 Horário: ${new Date(order.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

📦 *Itens:*
${itemsText}

💰 *Total: R$ ${total.toFixed(2)}*
${order.notes ? `\n📝 *Observação geral:* ${order.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
📍 *Endereço de Entrega:*
${addressText}
━━━━━━━━━━━━━━━━━━━━
_Responda este pedido no sistema._`
}
