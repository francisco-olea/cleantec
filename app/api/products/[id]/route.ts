import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, type Product, type ProductInput } from "@/lib/db"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - Obtener un producto específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(params.id) as Product | undefined

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const response = NextResponse.json({ product })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<ProductInput> & { active?: number }
    const db = getDatabase()

    const stmt = db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          price2 = COALESCE(?, price2),
          category = COALESCE(?, category),
          image_url = COALESCE(?, image_url),
          stock = COALESCE(?, stock),
          active = COALESCE(?, active),
          sku = COALESCE(?, sku),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(
      body.name || null,
      body.description || null,
      body.price !== undefined ? body.price : null,
      body.price2 !== undefined ? body.price2 : null,
      body.category || null,
      body.image_url || null,
      body.stock !== undefined ? body.stock : null,
      body.active !== undefined ? body.active : null,
      body.sku || null,
      params.id,
    )

    const updatedProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(params.id) as Product

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase()

    // Soft delete - marcar como inactivo
    const stmt = db.prepare("UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    stmt.run(params.id)

    return NextResponse.json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
