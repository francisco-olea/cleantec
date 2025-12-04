import { NextResponse } from "next/server"
import { getDatabase, type OrderWithItems, type OrderItem } from "@/lib/db"
import { jsPDF } from "jspdf"
import { readFileSync } from "fs"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()
    const { id } = params

    // Get order with items
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderWithItems | undefined

    if (!order) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    }

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id) as OrderItem[]
    order.items = items

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    })

    // Load logo image
    let logoBase64: string | null = null
    try {
      const logoPath = path.join(process.cwd(), "public", "images", "cleantec-logo.png")
      const logoBuffer = readFileSync(logoPath)
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`
    } catch (error) {
      console.error("[v0] Error loading logo:", error)
      // Continue without logo if it fails
    }

    // Generate PDF content
    generatePDFContent(doc, order, logoBase64)

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Pedido-${order.order_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error details:", errorMessage)
    return NextResponse.json({ success: false, error: `Error al generar PDF: ${errorMessage}` }, { status: 500 })
  }
}

function generatePDFContent(doc: jsPDF, order: OrderWithItems, logoBase64: string | null) {
  const primaryColor = [14, 146, 210] // #0e92d2
  const secondaryColor = [33, 151, 71] // #219747
  const textColor = [51, 51, 51] // #333333
  const lightGray = [245, 245, 245] // #f5f5f5
  const white = [255, 255, 255]

  const pageWidth = 216 // Letter width in mm
  const margin = 12.7 // 50 points = ~12.7mm
  let yPos = margin

  // Header with logo
  const logoHeight = 15 // mm
  if (logoBase64) {
    try {
      // Add logo (30mm width, 15mm height to maintain aspect ratio)
      doc.addImage(logoBase64, "PNG", margin, yPos, 30, logoHeight)
      yPos += logoHeight + 3
    } catch (error) {
      console.error("[v0] Error adding logo to PDF:", error)
      // Fallback to text header if logo fails
      doc.setFillColor(...primaryColor)
      doc.setTextColor(...primaryColor)
      doc.setFontSize(28)
      doc.setFont("helvetica", "bold")
      doc.text("CLEAN TEC", margin, yPos)
      yPos += 10
    }
  } else {
    // Text header if no logo
    doc.setFillColor(...primaryColor)
    doc.setTextColor(...primaryColor)
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.text("CLEAN TEC", margin, yPos)
    yPos += 10
  }

  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Productos de Limpieza de Calidad", margin, yPos)

  // Order number in top right
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("PEDIDO", pageWidth - margin, yPos, { align: "right" })

  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text(order.order_number, pageWidth - margin, yPos + 8, { align: "right" })

  const orderDate = new Date(order.created_at)
  doc.setFontSize(9)
  doc.setTextColor(...textColor)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${orderDate.toLocaleDateString("es-MX")}`, pageWidth - margin, yPos + 15, { align: "right" })

  yPos += 25

  // Line separator
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.7)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  yPos += 15

  // Client Information Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("INFORMACIÓN DEL CLIENTE", margin, yPos)

  yPos += 10

  // Client details box
  const boxHeight = 30
  doc.setFillColor(...lightGray)
  doc.setDrawColor(...textColor)
  doc.setLineWidth(0.13)
  doc.rect(margin, yPos, pageWidth - margin * 2, boxHeight, "FD")

  yPos += 8

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textColor)
  doc.text("Empresa:", margin + 3, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(order.client_company || "-", margin + 25, yPos)

  yPos += 6

  doc.setFont("helvetica", "bold")
  doc.text("Cliente:", margin + 3, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(`${order.client_name || "-"} (${order.client_number || "-"})`, margin + 25, yPos)

  yPos += 6

  doc.setFont("helvetica", "bold")
  doc.text("Dirección:", margin + 3, yPos)
  doc.setFont("helvetica", "normal")
  const addressLines = doc.splitTextToSize(order.client_address || "-", pageWidth - margin * 2 - 28)
  doc.text(addressLines, margin + 25, yPos)

  yPos += addressLines.length * 6

  doc.setFont("helvetica", "bold")
  doc.text("Teléfono:", margin + 3, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(order.client_phone || "-", margin + 25, yPos)

  yPos += 20

  // Products Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("PRODUCTOS", margin, yPos)

  yPos += 10

  // Table header
  const headerY = yPos
  doc.setFillColor(...primaryColor)
  doc.setDrawColor(...primaryColor)
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, "FD")

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...white)
  doc.text("Producto", margin + 2, yPos + 5.5)
  doc.text("SKU", margin + 60, yPos + 5.5)
  doc.text("Cant.", margin + 95, yPos + 5.5, { align: "center" })
  doc.text("Precio Unit.", margin + 110, yPos + 5.5, { align: "right" })
  doc.text("Total", pageWidth - margin - 2, yPos + 5.5, { align: "right" })

  yPos += 8

  // Table rows
  const items = order.items || []
  doc.setDrawColor(...textColor)
  doc.setLineWidth(0.13)
  doc.setTextColor(...textColor)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  for (const item of items) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = margin + 20
    }

    // Draw row border
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, "D")

    // Product name
    const productLines = doc.splitTextToSize(item.product_name || "-", 55)
    doc.text(productLines, margin + 2, yPos + 5.5)

    // SKU
    doc.text(item.product_sku || "-", margin + 60, yPos + 5.5)

    // Quantity
    doc.text(item.quantity.toString(), margin + 95, yPos + 5.5, { align: "center" })

    // Unit price
    doc.text(`$${item.unit_price.toFixed(2)}`, margin + 110, yPos + 5.5, { align: "right" })

    // Total
    doc.setFont("helvetica", "bold")
    doc.text(`$${item.total_price.toFixed(2)}`, pageWidth - margin - 2, yPos + 5.5, { align: "right" })
    doc.setFont("helvetica", "normal")

    yPos += Math.max(8, productLines.length * 4)
  }

  yPos += 10

  // Totals Section
  const totalsX = pageWidth - margin - 50

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Subtotal:", totalsX, yPos, { align: "right" })
  doc.text(`$${order.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: "right" })

  yPos += 6

  doc.text("IVA (16%):", totalsX, yPos, { align: "right" })
  doc.text(`$${order.iva.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: "right" })

  yPos += 6

  // Line separator
  doc.setDrawColor(...textColor)
  doc.setLineWidth(0.25)
  doc.line(totalsX, yPos, pageWidth - margin - 2, yPos)

  yPos += 4

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("TOTAL:", totalsX, yPos, { align: "right" })
  doc.text(`$${order.total.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: "right" })

  // Footer
  const footerY = 270

  doc.setDrawColor(...secondaryColor)
  doc.setLineWidth(0.7)
  doc.line(margin, footerY, pageWidth - margin, footerY)

  doc.setFontSize(8)
  doc.setTextColor(...textColor)
  doc.setFont("helvetica", "normal")
  doc.text("Clean Tec | Tel: +506 2222-3333 / +506 8888-9999", pageWidth / 2, footerY + 5, { align: "center" })
  doc.text("Email: ventas@cleantec.com / info@cleantec.com", pageWidth / 2, footerY + 10, { align: "center" })
  doc.text("Cjon Revolución y 4ta, San Luis RC, Sonora", pageWidth / 2, footerY + 15, { align: "center" })

  doc.setFontSize(7)
  doc.setTextColor(153, 153, 153)
  doc.text(
    "Este documento es una confirmación de pedido. Los precios incluyen IVA. Gracias por su preferencia.",
    pageWidth / 2,
    footerY + 23,
    { align: "center", maxWidth: pageWidth - margin * 2 },
  )
}
