// Mock client database for demonstration
export interface ClientInfo {
  clientNumber: string
  companyName: string
  address: string
  city: string
  phone: string
  contactPerson: string
}

export const mockClients: ClientInfo[] = [
  {
    clientNumber: "CT001",
    companyName: "Hotel Plaza Central",
    address: "Av. Principal 123, Centro",
    city: "Ciudad de México",
    phone: "+52 55 1234-5678",
    contactPerson: "María González",
  },
  {
    clientNumber: "CT002",
    companyName: "Oficinas Corporativas ABC",
    address: "Blvd. Empresarial 456, Zona Financiera",
    city: "Guadalajara",
    phone: "+52 33 9876-5432",
    contactPerson: "Carlos Rodríguez",
  },
  {
    clientNumber: "CT003",
    companyName: "Centro Médico San Rafael",
    address: "Calle Salud 789, Colonia Médica",
    city: "Monterrey",
    phone: "+52 81 5555-0123",
    contactPerson: "Dr. Ana Martínez",
  },
  {
    clientNumber: "CT004",
    companyName: "Restaurante La Cocina",
    address: "Plaza Gastronómica 321, Centro Histórico",
    city: "Puebla",
    phone: "+52 22 4444-7890",
    contactPerson: "José Luis Hernández",
  },
  {
    clientNumber: "CT005",
    companyName: "Escuela Primaria Benito Juárez",
    address: "Av. Educación 654, Colonia Escolar",
    city: "Tijuana",
    phone: "+52 66 3333-2468",
    contactPerson: "Profra. Laura Sánchez",
  },
]

export function validateClientNumber(clientNumber: string): ClientInfo | null {
  const client = mockClients.find((c) => c.clientNumber.toLowerCase() === clientNumber.toLowerCase())
  return client || null
}
