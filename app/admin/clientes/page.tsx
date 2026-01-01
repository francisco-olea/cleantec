"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { CustomersTable } from "@/components/customers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AdminCustomersPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated")
    if (auth !== "true") {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Administra la información de clientes de Clean Tec</p>
          </div>
          <Button onClick={() => router.push("/admin/clientes/nuevo")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <CustomersTable />
      </div>
    </AdminLayout>
  )
}




