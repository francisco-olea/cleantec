"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { CustomerForm } from "@/components/customer-form"

export default function NewCustomerPage() {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
          <p className="text-muted-foreground">Agrega un nuevo cliente al sistema</p>
        </div>

        <CustomerForm />
      </div>
    </AdminLayout>
  )
}




