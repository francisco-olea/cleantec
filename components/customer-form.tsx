"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface CustomerFormProps {
  customerId?: string
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_number: "",
    client_name: "",
    RFC: "",
    direccion: "",
    colonia: "",
    ciudad: "",
    estado: "",
    cp: "",
    correo: "",
    tel: "",
  })

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, { cache: "no-store" })
      const data = await response.json()

      if (data.customer) {
        setFormData({
          client_number: data.customer.client_number || "",
          client_name: data.customer.client_name || "",
          RFC: data.customer.RFC || "",
          direccion: data.customer.direccion || "",
          colonia: data.customer.colonia || "",
          ciudad: data.customer.ciudad || "",
          estado: data.customer.estado || "",
          cp: data.customer.cp || "",
          correo: data.customer.correo || "",
          tel: data.customer.tel || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching customer:", error)
      toast.error("Error al cargar cliente")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = customerId ? `/api/customers/${customerId}` : "/api/customers"
      const method = customerId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_number: formData.client_number,
          client_name: formData.client_name,
          RFC: formData.RFC || null,
          direccion: formData.direccion || null,
          colonia: formData.colonia || null,
          ciudad: formData.ciudad || null,
          estado: formData.estado || null,
          cp: formData.cp || null,
          correo: formData.correo || null,
          tel: formData.tel || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(customerId ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente")
        router.push("/admin/clientes")
      } else {
        toast.error(data.error || "Error al guardar cliente")
      }
    } catch (error) {
      console.error("[v0] Error saving customer:", error)
      toast.error("Error al guardar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customerId ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_number">Número de Cliente *</Label>
              <Input
                id="client_number"
                required
                value={formData.client_number}
                onChange={(e) => setFormData({ ...formData, client_number: e.target.value })}
                placeholder="Ej: A100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Nombre del Cliente *</Label>
              <Input
                id="client_name"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="RFC">RFC</Label>
            <Input
              id="RFC"
              value={formData.RFC}
              onChange={(e) => setFormData({ ...formData, RFC: e.target.value })}
              placeholder="Ej: ABC123456DEF"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Calle Principal 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colonia">Colonia</Label>
              <Input
                id="colonia"
                value={formData.colonia}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                placeholder="Ej: Centro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cp">Código Postal</Label>
              <Input
                id="cp"
                value={formData.cp}
                onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
                placeholder="Ej: 83450"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ej: San Luis Río Colorado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                placeholder="Ej: Sonora"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tel">Teléfono</Label>
              <Input
                id="tel"
                type="tel"
                value={formData.tel}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                placeholder="Ej: 6531234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Email</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="Ej: cliente@example.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/clientes")} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : customerId ? "Actualizar Cliente" : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}




