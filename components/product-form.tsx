"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface ProductFormProps {
  productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    price2: "",
    category: "",
    image_url: "",
    stock: "",
    sku: "",
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (data.product) {
        setFormData({
          name: data.product.name,
          description: data.product.description,
          price: data.product.price.toString(),
          price2: (data.product.price2 || 0).toString(),
          category: data.product.category,
          image_url: data.product.image_url,
          stock: data.product.stock.toString(),
          sku: data.product.sku || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching product:", error)
      toast.error("Error al cargar producto")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products"
      const method = productId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          price2: formData.price2 ? Number.parseFloat(formData.price2) : 0,
          category: formData.category,
          image_url: formData.image_url,
          stock: Number.parseInt(formData.stock || "0"),
          sku: formData.sku || undefined,
        }),
      })

      if (response.ok) {
        toast.success(productId ? "Producto actualizado exitosamente" : "Producto creado exitosamente")
        router.push("/admin/productos")
      } else {
        toast.error("Error al guardar producto")
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast.error("Error al guardar producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Detergente Líquido Industrial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price2">Precio 2</Label>
              <Input
                id="price2"
                type="number"
                step="0.01"
                value={formData.price2}
                onChange={(e) => setFormData({ ...formData, price2: e.target.value })}
                placeholder="0.00 (opcional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Detergentes, Desinfectantes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Código SKU (opcional)"
            />
          </div>

          <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : productId ? "Actualizar Producto" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
