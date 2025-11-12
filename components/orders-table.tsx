"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, FileText, Download, Printer } from "lucide-react"
import type { OrderWithItems } from "@/lib/db"

interface OrdersTableProps {
  orders: OrderWithItems[]
  onRefresh: () => void
}

export function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleDownloadPDF = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Pedido-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error downloading PDF:", error)
      alert("Error al descargar el PDF")
    }
  }

  const handlePrintPDF = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      alert("Error al generar el PDF")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmado: "default",
      procesando: "secondary",
      entregado: "outline",
      cancelado: "destructive",
    }

    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay pedidos registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.client_name}</p>
                    <p className="text-sm text-muted-foreground">{order.client_number}</p>
                  </div>
                </TableCell>
                <TableCell>{order.client_company}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString("es-MX")}</TableCell>
                <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrintPDF(order.id)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(order.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Pedido {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información del Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Empresa:</span> {selectedOrder.client_company}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cliente:</span> {selectedOrder.client_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Número:</span> {selectedOrder.client_number}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Teléfono:</span> {selectedOrder.client_phone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Dirección:</span> {selectedOrder.client_address}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Información del Pedido</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Fecha:</span>{" "}
                      {new Date(selectedOrder.created_at).toLocaleString("es-MX")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Estado:</span> {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Subtotal:</span> ${selectedOrder.subtotal.toFixed(2)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">IVA:</span> ${selectedOrder.iva.toFixed(2)}
                    </p>
                    <p className="font-semibold">
                      <span className="text-muted-foreground">Total:</span> ${selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.product_sku || "-"}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">${item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleDownloadPDF(selectedOrder.id)} className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button variant="outline" onClick={() => setDetailsOpen(false)} className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
