import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import type { ClientInfo } from "@/lib/clients"

// GET: Validate client number
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientNumber = searchParams.get("clientNumber")

    if (!clientNumber) {
      return NextResponse.json({ success: false, error: "Client number is required" }, { status: 400 })
    }

    const db = getDatabase()
    const customer = db
      .prepare("SELECT client_number, client_name, RFC, direccion, colonia, ciudad, estado, cp, correo, tel FROM customers WHERE client_number = ?")
      .get(clientNumber.trim()) as {
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
      } | undefined

    if (!customer) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    const clientInfo: ClientInfo = {
      clientNumber: customer.client_number,
      clientName: customer.client_name,
      RFC: customer.RFC,
      direccion: customer.direccion,
      colonia: customer.colonia,
      ciudad: customer.ciudad,
      estado: customer.estado,
      cp: customer.cp,
      correo: customer.correo,
      tel: customer.tel,
    }

    return NextResponse.json({ success: true, client: clientInfo })
  } catch (error) {
    console.error("[v0] Error fetching client:", error)
    return NextResponse.json({ success: false, error: "Error al obtener información del cliente" }, { status: 500 })
  }
}

