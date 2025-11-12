export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
  unit?: string
  stock?: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  clientNumber: string
  status: "pending" | "confirmed" | "delivered"
  createdAt: Date
}
