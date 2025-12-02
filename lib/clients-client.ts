import type { ClientInfo } from "./clients";

// Re-export ClientInfo for convenience
export type { ClientInfo } from "./clients";

export function buildFullAddress(client: ClientInfo): string {
  const parts: string[] = []
  if (client.direccion) parts.push(client.direccion)
  if (client.colonia) parts.push(client.colonia)
  if (client.ciudad) parts.push(client.ciudad)
  if (client.estado) parts.push(client.estado)
  if (client.cp) parts.push(`CP ${client.cp}`)
  return parts.join(", ") || "Dirección no especificada"
}

export function getCompanyName(client: ClientInfo): string {
  return client.clientName || "Cliente sin nombre"
}
