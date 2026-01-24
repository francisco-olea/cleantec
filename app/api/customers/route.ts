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
  client_number: string
  client_name: string
  RFC?: string | null
  direccion?: string | null
  colonia?: string | null
  ciudad?: string | null
  estado?: string | null
  cp?: string | null
  correo?: string | null
  tel?: string | null
}

// GET - Obtener todos los clientes
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const customers = db.prepare("SELECT * FROM customers ORDER BY client_number").all() as Customer[]

    const response = NextResponse.json({ customers })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("[v0] Error fetching customers:", error)
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CustomerInput
    const db = getDatabase()

    // Check if client_number already exists
    const existing = db.prepare("SELECT id FROM customers WHERE client_number = ?").get(body.client_number)
    if (existing) {
      return NextResponse.json({ error: "El número de cliente ya existe" }, { status: 400 })
    }

    const stmt = db.prepare(`
      INSERT INTO customers (client_number, client_name, RFC, direccion, colonia, ciudad, estado, cp, correo, tel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      body.client_number,
      body.client_name,
      body.RFC || null,
      body.direccion || null,
      body.colonia || null,
      body.ciudad || null,
      body.estado || null,
      body.cp || null,
      body.correo || null,
      body.tel || null,
    )

    const newCustomer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid) as Customer

    return NextResponse.json({ customer: newCustomer }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating customer:", error)
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}




