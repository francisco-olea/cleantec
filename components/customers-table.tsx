"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Customer {
  id: number
  client_number: string
  client_name: string
  RFC: string | null
  direccion: string | null
  colonia: string | null
  ciudad: string | null
  estado: string | null
  cp: string | null
  correo: string | null
  tel: string | null
  created_at: string
}

export function CustomersTable() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error("[v0] Error fetching customers:", error)
      toast.error("Error al cargar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de eliminar el cliente "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Cliente eliminado exitosamente")
        fetchCustomers()
      } else {
        toast.error(data.error || "Error al eliminar cliente")
      }
    } catch (error) {
      console.error("[v0] Error deleting customer:", error)
      toast.error("Error al eliminar cliente")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando clientes...</div>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Cliente</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>RFC</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.client_number}</TableCell>
              <TableCell>{customer.client_name}</TableCell>
              <TableCell>{customer.RFC || "-"}</TableCell>
              <TableCell>
                {customer.direccion
                  ? `${customer.direccion}${customer.colonia ? `, ${customer.colonia}` : ""}`
                  : "-"}
              </TableCell>
              <TableCell>{customer.ciudad || "-"}</TableCell>
              <TableCell>{customer.estado || "-"}</TableCell>
              <TableCell>{customer.tel || "-"}</TableCell>
              <TableCell>{customer.correo || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/clientes/${customer.id}`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(customer.id, customer.client_name)}
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

      {customers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No hay clientes registrados</div>
      )}
    </div>
  )
}




