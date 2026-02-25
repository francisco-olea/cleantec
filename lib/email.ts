import nodemailer from "nodemailer"
import type { OrderWithItems } from "./db"

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface OrderEmailData {
  orderNumber: string
  clientName: string
  clientCompany: string
  clientAddress: string
  clientPhone: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  subtotal: number
  iva: number
  total: number
}

export async function sendOrderNotificationEmail(orderData: OrderEmailData): Promise<boolean> {
  try {
    // Format items list for email (prices without IVA for clarity)
    const itemsHtml = orderData.items
      .map(
        (item) => {
          // Remove 8% IVA from prices to match subtotal
          const unitPriceWithoutIVA = item.unit_price / 1.08
          const totalPriceWithoutIVA = item.total_price / 1.08
          return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${unitPriceWithoutIVA.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${totalPriceWithoutIVA.toFixed(2)}</td>
      </tr>
    `
        },
      )
      .join("")

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; }
    .section { background-color: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .order-number { font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background-color: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    .totals { margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-final { font-size: 18px; font-weight: bold; color: #16a34a; border-top: 2px solid #16a34a; padding-top: 12px; margin-top: 8px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Nuevo Pedido Recibido</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="margin-top: 0; color: #16a34a;">Información del Pedido</h2>
        <p class="order-number">Pedido #${orderData.orderNumber}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-MX", { 
          year: "numeric", 
          month: "long", 
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}</p>
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #16a34a;">Información del Cliente</h2>
        <p><strong>Nombre:</strong> ${orderData.clientName}</p>
        ${orderData.clientCompany ? `<p><strong>Empresa:</strong> ${orderData.clientCompany}</p>` : ""}
        <p><strong>Dirección:</strong> ${orderData.clientAddress}</p>
        ${orderData.clientPhone ? `<p><strong>Teléfono:</strong> ${orderData.clientPhone}</p>` : ""}
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #16a34a;">Productos</h2>
        <p style="font-size: 13px; color: #6b7280; margin-top: -8px; margin-bottom: 12px;">* Precios mostrados sin IVA</p>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio Unit.</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>$${orderData.subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>IVA (8%):</span>
            <span>$${orderData.iva.toFixed(2)}</span>
          </div>
          <div class="totals-row total-final">
            <span>TOTAL:</span>
            <span>$${orderData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="section" style="background-color: #fef3c7; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>⚡ Acción requerida:</strong> Por favor procesa este pedido y contacta al cliente para confirmar la entrega.</p>
      </div>
    </div>

    <div class="footer">
      <p>Este es un correo automático generado por el sistema de pedidos Clean Tec.</p>
      <p style="margin: 5px 0;">Clean Tec - Suministros de Limpieza</p>
      <p style="margin: 5px 0;">Tel: +52 653 530 7164 | Email: ventas@clean-tec.com.mx</p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = `
NUEVO PEDIDO RECIBIDO

Pedido: ${orderData.orderNumber}
Fecha: ${new Date().toLocaleString("es-MX")}

CLIENTE:
Nombre: ${orderData.clientName}
${orderData.clientCompany ? `Empresa: ${orderData.clientCompany}` : ""}
Dirección: ${orderData.clientAddress}
${orderData.clientPhone ? `Teléfono: ${orderData.clientPhone}` : ""}

PRODUCTOS:
${orderData.items.map((item) => {
  const totalWithoutIVA = item.total_price / 1.08
  return `- ${item.product_name} x${item.quantity} - $${totalWithoutIVA.toFixed(2)}`
}).join("\n")}

RESUMEN:
Subtotal: $${orderData.subtotal.toFixed(2)}
IVA (8%): $${orderData.iva.toFixed(2)}
TOTAL: $${orderData.total.toFixed(2)}

---
Este es un correo automático generado por el sistema de pedidos Clean Tec.
    `

    // Send email
    await transporter.sendMail({
      from: `"Clean Tec - Pedidos" <${process.env.SMTP_FROM}>`,
      to: process.env.ORDER_NOTIFICATION_EMAIL,
      subject: `🛒 Nuevo Pedido #${orderData.orderNumber} - ${orderData.clientName}`,
      text: textContent,
      html: htmlContent,
    })

    console.log(`[Email] Order notification sent for ${orderData.orderNumber}`)
    return true
  } catch (error) {
    console.error("[Email] Error sending order notification:", error)
    return false
  }
}
