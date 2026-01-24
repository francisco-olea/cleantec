import { NextResponse } from "next/server"
import { getDatabase, type OrderWithItems, type OrderItem } from "@/lib/db"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// GET: Get a single order by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()
    const { id } = params

    // Get order
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderWithItems | undefined

    if (!order) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    }

    // Get order items
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id) as OrderItem[]
    order.items = items

    const response = NextResponse.json({ success: true, order })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("[v0] Error fetching order:", error)
    return NextResponse.json({ success: false, error: "Error al obtener el pedido" }, { status: 500 })
  }
}

// GET by order number
export async function GET_BY_NUMBER(orderNumber: string) {
  try {
    const db = getDatabase()

    // Get order
    const order = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(orderNumber) as
      | OrderWithItems
      | undefined

    if (!order) {
      return null
    }

    // Get order items
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id) as OrderItem[]
    order.items = items

    return order
  } catch (error) {
    console.error("[v0] Error fetching order by number:", error)
    return null
  }
}
