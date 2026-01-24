import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

interface Customer {
  id: number
  client_number: string
  client_name: string
  RFC: string | null
  direccion: string | null
  colonia: string | null
  ciudad: string | null
  estado: string | null
  cp: string | null
  correo: string | null
  tel: string | null
  created_at: string
}

interface CustomerInput {
  client_number?: string
  client_name?: string
  RFC?: string | null
  direccion?: string | null
  colonia?: string | null
  ciudad?: string | null
  estado?: string | null
  cp?: string | null
  correo?: string | null
  tel?: string | null
}

// GET - Obtener un cliente específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(params.id) as Customer | undefined

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const response = NextResponse.json({ customer })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("[v0] Error fetching customer:", error)
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 })
  }
}

// PUT - Actualizar cliente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as CustomerInput
    const db = getDatabase()

    // Check if client_number already exists (if being changed)
    if (body.client_number) {
      const existing = db
        .prepare("SELECT id FROM customers WHERE client_number = ? AND id != ?")
        .get(body.client_number, params.id)
      if (existing) {
        return NextResponse.json({ error: "El número de cliente ya existe" }, { status: 400 })
      }
    }

    const stmt = db.prepare(`
      UPDATE customers 
      SET client_number = COALESCE(?, client_number),
          client_name = COALESCE(?, client_name),
          RFC = ?,
          direccion = ?,
          colonia = ?,
          ciudad = ?,
          estado = ?,
          cp = ?,
          correo = ?,
          tel = ?
      WHERE id = ?
    `)

    stmt.run(
      body.client_number || null,
      body.client_name || null,
      body.RFC !== undefined ? body.RFC : null,
      body.direccion !== undefined ? body.direccion : null,
      body.colonia !== undefined ? body.colonia : null,
      body.ciudad !== undefined ? body.ciudad : null,
      body.estado !== undefined ? body.estado : null,
      body.cp !== undefined ? body.cp : null,
      body.correo !== undefined ? body.correo : null,
      body.tel !== undefined ? body.tel : null,
      params.id,
    )

    const updatedCustomer = db.prepare("SELECT * FROM customers WHERE id = ?").get(params.id) as Customer

    return NextResponse.json({ customer: updatedCustomer })
  } catch (error) {
    console.error("[v0] Error updating customer:", error)
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}

// DELETE - Eliminar cliente
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()

    // Check if customer has orders
    const orders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE client_number = (SELECT client_number FROM customers WHERE id = ?)").get(params.id) as { count: number } | undefined

    if (orders && orders.count > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el cliente porque tiene pedidos asociados" },
        { status: 400 },
      )
    }

    const stmt = db.prepare("DELETE FROM customers WHERE id = ?")
    stmt.run(params.id)

    return NextResponse.json({ message: "Cliente eliminado exitosamente" })
  } catch (error) {
    console.error("[v0] Error deleting customer:", error)
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 })
  }
}




