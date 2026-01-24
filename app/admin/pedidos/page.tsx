"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { OrdersTable } from "@/components/orders-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { OrderWithItems } from "@/lib/db"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated")
    if (!isAuthenticated) {
      router.push("/admin")
      return
    }

    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" })
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">Gestiona todos los pedidos de los clientes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>Total de pedidos: {orders.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={orders} onRefresh={fetchOrders} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
