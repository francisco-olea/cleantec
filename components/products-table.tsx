"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface DbProduct {
  id: number
  name: string
  description: string
  price: number
  price2: number
  category: string
  image_url: string
  stock: number
  active: number
}

const ITEMS_PER_PAGE = 25

export function ProductsTable() {
  const router = useRouter()
  const [products, setProducts] = useState<DbProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Pagination calculations
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProducts = products.slice(startIndex, endIndex)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" })
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast.error("Error al cargar productos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de eliminar el producto "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Producto eliminado exitosamente")
        fetchProducts()
      } else {
        toast.error("Error al eliminar producto")
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast.error("Error al eliminar producto")
    }
  }

  const handleToggleActive = async (id: number, currentActive: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: currentActive === 1 ? 0 : 1 }),
      })

      if (response.ok) {
        toast.success(currentActive === 1 ? "Producto desactivado" : "Producto activado")
        fetchProducts()
      } else {
        toast.error("Error al actualizar producto")
      }
    } catch (error) {
      console.error("[v0] Error toggling product:", error)
      toast.error("Error al actualizar producto")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando productos...</div>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Precio 2</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.price2 > 0 ? `$${product.price2.toFixed(2)}` : "-"}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Badge variant={product.active === 1 ? "default" : "secondary"}>
                  {product.active === 1 ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(product.id, product.active)}
                    title={product.active === 1 ? "Desactivar" : "Activar"}
                  >
                    {product.active === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/productos/${product.id}`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No hay productos registrados</div>
      )}

      {/* Pagination Controls */}
      {products.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, products.length)} de {products.length} productos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm px-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
