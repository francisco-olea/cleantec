import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, type Product, type ProductInput } from "@/lib/db"

// GET - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    let query = "SELECT * FROM products"
    if (activeOnly) {
      query += " WHERE active = 1"
    }
    query += " ORDER BY category, name"

    const products = db.prepare(query).all() as Product[]

    return NextResponse.json({ products })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProductInput
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, price2, category, image_url, stock, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      body.name,
      body.description,
      body.price,
      body.price2 || 0,
      body.category,
      body.image_url,
      body.stock || 0,
      body.sku || null,
    )

    const newProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid) as Product

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
