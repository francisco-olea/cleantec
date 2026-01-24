import { NextResponse } from "next/server"
import { getDatabase, type CreateOrderInput, type OrderWithItems } from "@/lib/db"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// POST: Create a new order
export async function POST(request: Request) {
  try {
    const db = getDatabase()
    const orderData: CreateOrderInput = await request.json()

    // Generate order number
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const orderNumber = `CT-${timestamp}-${random}`

    console.log("[v0] Creating order:", orderNumber)

    // Insert order
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, client_number, client_name, client_company, 
        client_address, client_phone, subtotal, iva, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertOrder.run(
      orderNumber,
      orderData.client_number,
      orderData.client_name,
      orderData.client_company,
      orderData.client_address,
      orderData.client_phone,
      orderData.subtotal,
      orderData.iva,
      orderData.total,
      orderData.notes || null,
    )

    const orderId = result.lastInsertRowid as number

    // Insert order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_sku, 
        quantity, unit_price, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    for (const item of orderData.items) {
      insertOrderItem.run(
        orderId,
        item.product_id,
        item.product_name,
        item.product_sku,
        item.quantity,
        item.unit_price,
        item.total_price,
      )
    }

    console.log("[v0] Order created successfully:", orderNumber)

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: "Pedido creado exitosamente",
    })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ success: false, error: "Error al crear el pedido" }, { status: 500 })
  }
}

// GET: Get all orders
export async function GET(request: Request) {
  try {
    const db = getDatabase()
    const { searchParams } = new URL(request.url)
    const clientNumber = searchParams.get("clientNumber")

    let query = "SELECT * FROM orders"
    const params: string[] = []

    if (clientNumber) {
      query += " WHERE client_number = ?"
      params.push(clientNumber)
    }

    query += " ORDER BY created_at DESC"

    const orders = db.prepare(query).all(...params) as OrderWithItems[]

    // Get items for each order
    const getOrderItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?")

    for (const order of orders) {
      order.items = getOrderItems.all(order.id) as any[]
    }

    const response = NextResponse.json({ success: true, orders })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Error al obtener pedidos" }, { status: 500 })
  }
}
