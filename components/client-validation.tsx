"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ClientInfo } from "@/lib/clients"
import { buildFullAddress, getCompanyName } from "@/lib/clients-client"
import { ArrowLeft, ArrowRight, User, MapPin, Phone, Building, AlertCircle, CheckCircle } from "lucide-react"

interface ClientValidationProps {
  onBack: () => void
  onContinue: () => void
}

export function ClientValidation({ onBack, onContinue }: ClientValidationProps) {
  const [clientNumber, setClientNumber] = useState("")
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleValidateClient = async () => {
    if (!clientNumber.trim()) {
      setError("Por favor ingresa tu número de cliente")
      return
    }

    setIsValidating(true)
    setError("")

    try {
      const response = await fetch(`/api/clients?clientNumber=${encodeURIComponent(clientNumber.trim())}`)
      const result = await response.json()

      if (result.success && result.client) {
        setClientInfo(result.client)
        setError("")
      } else {
        setError("Número de cliente no encontrado. Verifica que sea correcto o contacta a nuestro equipo de ventas.")
        setClientInfo(null)
      }
    } catch (error) {
      console.error("[v0] Error validating client:", error)
      setError("Error al validar el número de cliente. Por favor intenta de nuevo.")
      setClientInfo(null)
    } finally {
      setIsValidating(false)
    }
  }

  const handleContinue = () => {
    if (clientInfo) {
      // Store client info for order confirmation
      localStorage.setItem("selectedClient", JSON.stringify(clientInfo))
      onContinue()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Resumen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Validación de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientNumber">Número de Cliente</Label>
              <div className="flex gap-2">
                <Input
                  id="clientNumber"
                  placeholder="Ej: CT001"
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleValidateClient()}
                  disabled={isValidating}
                />
                <Button onClick={handleValidateClient} disabled={isValidating || !clientNumber.trim()}>
                  {isValidating ? "Validando..." : "Validar"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {clientInfo && (
              <Alert className="border-secondary bg-secondary/10">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-secondary-foreground">
                  Cliente validado correctamente
                </AlertDescription>
              </Alert>
            )}
          </div>

          {clientInfo && (
            <Card className="border-secondary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p className="text-sm">{getCompanyName(clientInfo)}</p>
                    {clientInfo.RFC && (
                      <p className="text-xs text-muted-foreground">RFC: {clientInfo.RFC}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Dirección de Entrega
                    </Label>
                    <p className="text-sm">{buildFullAddress(clientInfo)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {clientInfo.correo && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Correo</Label>
                        <p className="text-sm">{clientInfo.correo}</p>
                      </div>
                    )}

                    {clientInfo.tel && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Teléfono
                        </Label>
                        <p className="text-sm">{clientInfo.tel}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={handleContinue} className="w-full" size="lg">
                    Confirmar Dirección de Entrega
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!clientInfo && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">¿No tienes número de cliente?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Para realizar pedidos necesitas ser un cliente registrado. Contacta a nuestro equipo de ventas para
                obtener tu número de cliente.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Teléfono:</strong> +52 55 1234-5678
                </p>
                <p>
                  <strong>Email:</strong> ventas@cleantec.com
                </p>
                <p>
                  <strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Ejemplos de números de cliente:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {["001", "A100000", "A100001", "A100002", "A100010"].map((num) => (
                <Button key={num} variant="outline" size="sm" onClick={() => setClientNumber(num)} className="text-xs">
                  {num}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
