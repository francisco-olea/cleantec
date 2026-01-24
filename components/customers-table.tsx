"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
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

const ITEMS_PER_PAGE = 25

export function CustomersTable() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCustomers = customers.slice(startIndex, endIndex)

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers", { cache: "no-store" })
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
          {paginatedCustomers.map((customer) => (
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

      {/* Pagination Controls */}
      {customers.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, customers.length)} de {customers.length} clientes
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




