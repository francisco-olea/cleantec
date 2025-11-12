"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"
import { useCart } from "@/components/cart-provider"
import { Plus, Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { state, dispatch } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const isInCart = state.items.some((item) => item.id === product.id)

  const handleAddToCart = () => {
    setIsAdding(true)
    dispatch({ type: "ADD_ITEM", payload: product })

    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Agotado</Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg leading-tight text-balance">{product.name}</h3>
          <p className="text-sm text-muted-foreground text-pretty">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
          className="w-full"
          variant={isInCart ? "secondary" : "default"}
        >
          {isAdding ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isAdding ? "Agregado" : isInCart ? "Agregar Más" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
