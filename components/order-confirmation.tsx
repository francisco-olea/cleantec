"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/components/cart-provider"
import type { ClientInfo } from "@/lib/clients"
import { buildFullAddress, getCompanyName } from "@/lib/clients-client"
import { CheckCircle, Package, MapPin, User, Phone, Building, Calendar, Clock, Send, Loader2 } from "lucide-react"
import Image from "next/image"

interface OrderConfirmationProps {
  onComplete: () => void
}

export function OrderConfirmation({ onComplete }: OrderConfirmationProps) {
  const { state, dispatch } = useCart()
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    const storedClient = localStorage.getItem("selectedClient")
    if (storedClient) {
      setClientInfo(JSON.parse(storedClient))
    }
  }, [])

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2) // 2 days from now

  const handleSubmitOrder = async () => {
    if (!clientInfo) return

    setIsSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        client_number: clientInfo.clientNumber,
        client_name: clientInfo.clientName,
        client_company: getCompanyName(clientInfo),
        client_address: buildFullAddress(clientInfo),
        client_phone: clientInfo.tel || "",
        subtotal: state.total,
        iva: state.total * 0.16,
        total: state.total * 1.16,
        items: state.items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_sku: (item as any).sku || null,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
      }

      // Send order to API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        setOrderNumber(result.orderNumber)
        setOrderSubmitted(true)

        // Clear cart after successful order
        setTimeout(() => {
          dispatch({ type: "CLEAR_CART" })
          localStorage.removeItem("selectedClient")
        }, 3000)
      } else {
        alert("Error al enviar el pedido. Por favor intenta de nuevo.")
      }
    } catch (error) {
      console.error("[v0] Error submitting order:", error)
      alert("Error al enviar el pedido. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  if (orderSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-2">¡Pedido Confirmado!</h2>
            <p className="text-muted-foreground">Tu pedido ha sido enviado exitosamente</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Número de Pedido</p>
              <p className="text-xl font-bold text-primary">{orderNumber}</p>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total del pedido:</span>
                <span className="font-semibold">${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Productos:</span>
                <span>{itemCount} artículos</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega estimada:</span>
                <span>{estimatedDelivery.toLocaleDateString("es-MX")}</span>
              </div>
            </div>

            <Alert className="border-secondary bg-secondary/10">
              <CheckCircle className="h-4 w-4 text-secondary" />
              <AlertDescription className="text-secondary-foreground">
                Recibirás una confirmación por email y nuestro equipo se pondrá en contacto contigo para coordinar la
                entrega.
              </AlertDescription>
            </Alert>

            <Button onClick={handleComplete} className="w-full" size="lg">
              Continuar Comprando
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!clientInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error: Información de cliente no encontrada</p>
        <Button onClick={onComplete} className="mt-4">
          Volver al Inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Confirmar Pedido</h2>
        <p className="text-muted-foreground">Revisa todos los detalles antes de enviar tu pedido</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos del Pedido
                <Badge variant="secondary">{itemCount} productos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-balance">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Cantidad: {item.quantity}</span>
                      <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{getCompanyName(clientInfo)}</p>
                    <p className="text-sm text-muted-foreground">Cliente: {clientInfo.clientNumber}</p>
                    {clientInfo.RFC && (
                      <p className="text-xs text-muted-foreground">RFC: {clientInfo.RFC}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{buildFullAddress(clientInfo)}</p>
                  </div>
                </div>

                {(clientInfo.tel || clientInfo.correo) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      {clientInfo.tel && <p className="text-sm">{clientInfo.tel}</p>}
                      {clientInfo.correo && (
                        <p className="text-sm text-muted-foreground">{clientInfo.correo}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({itemCount} productos)</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Costo de envío</span>
                  <span>Incluido</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>IVA (16%)</span>
                  <span>${(state.total * 0.16).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${(state.total * 1.16).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Entrega estimada: {estimatedDelivery.toLocaleDateString("es-MX")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horario: 8:00 AM - 5:00 PM</span>
                </div>
              </div>

              <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando Pedido...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Confirmar y Enviar Pedido
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <h4 className="font-medium">Términos y Condiciones</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Los precios incluyen IVA</li>
                  <li>• Entrega gratuita en pedidos mayores a $500</li>
                  <li>• Tiempo de entrega: 1-3 días hábiles</li>
                  <li>• Garantía de calidad en todos los productos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
