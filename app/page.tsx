"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { CartSidebar } from "@/components/cart-sidebar"
import { CategoryFilter } from "@/components/category-filter"
import { Footer } from "@/components/footer"
import type { Product } from "@/types/product"

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(["Todos"])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products?active=true")
        const data = await response.json()

        if (data.products) {
          // Transform database products to match Product type
          const transformedProducts: Product[] = data.products.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image_url,
            category: p.category,
            inStock: p.stock > 0,
            unit: p.unit,
            stock: p.stock,
          }))

          setProducts(transformedProducts)

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(transformedProducts.map((p) => p.category)))
          setCategories(["Todos", ...uniqueCategories])
        }
      } catch (error) {
        console.error("[v0] Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts =
    selectedCategory === "Todos" ? products : products.filter((product) => product.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setIsCartOpen(true)} onMenuClick={() => setIsMobileMenuOpen(true)} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-balance">Catálogo de Productos de Limpieza</h2>
          <p className="text-center text-muted-foreground text-pretty max-w-2xl mx-auto">
            Encuentra todos los suministros de limpieza profesional que necesitas. Productos de alta calidad para
            mantener tus espacios impecables.
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron productos en esta categoría.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
