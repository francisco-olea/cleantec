"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { CartItem } from "@/components/cart-item"
import { OrderReview } from "@/components/order-review"
import { ClientValidation } from "@/components/client-validation"
import { OrderConfirmation } from "@/components/order-confirmation"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { useState } from "react"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type CheckoutStep = "cart" | "review" | "validation" | "confirmation"

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart")

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const handleProceedToReview = () => {
    setCurrentStep("review")
  }

  const handleBackToCart = () => {
    setCurrentStep("cart")
  }

  const handleProceedToValidation = () => {
    setCurrentStep("validation")
  }

  const handleBackToReview = () => {
    setCurrentStep("review")
  }

  const handleProceedToConfirmation = () => {
    setCurrentStep("confirmation")
  }

  const handleOrderComplete = () => {
    setCurrentStep("cart")
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "cart":
        return (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito de Compras
                {itemCount > 0 && <Badge variant="secondary">{itemCount} productos</Badge>}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col h-full">
              {state.items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tu carrito está vacío</p>
                    <p className="text-sm text-muted-foreground mt-2">Agrega productos desde nuestro catálogo</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto py-4">
                    <div className="space-y-4">
                      {state.items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({itemCount} productos)</span>
                        <span>${state.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Envío</span>
                        <span>Incluido</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">${state.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={handleProceedToReview} className="w-full" size="lg">
                      Revisar Pedido
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )

      case "review":
        return (
          <div className="h-full overflow-auto">
            <OrderReview onBack={handleBackToCart} onContinue={handleProceedToValidation} />
          </div>
        )

      case "validation":
        return (
          <div className="h-full overflow-auto">
            <ClientValidation onBack={handleBackToReview} onContinue={handleProceedToConfirmation} />
          </div>
        )

      case "confirmation":
        return (
          <div className="h-full overflow-auto">
            <OrderConfirmation onComplete={handleOrderComplete} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl">{renderStepContent()}</SheetContent>
    </Sheet>
  )
}
