"use client"

import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import Image from "next/image"
import Link from "next/link"

interface HeaderProps {
  onCartClick: () => void
  onMenuClick: () => void
}

export function Header({ onCartClick, onMenuClick }: HeaderProps) {
  const { state } = useCart()
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/cleantec-logo.png"
                alt="Clean Tec Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary">Clean Tec</h1>
                <p className="text-sm text-muted-foreground">Suministros de Limpieza</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              Nosotros
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contacto
            </Link>
          </nav>

          <Button variant="outline" size="sm" onClick={onCartClick} className="relative bg-transparent">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Carrito
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
