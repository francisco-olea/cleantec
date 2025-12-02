// NO server imports here
// NO db imports here

export interface ClientInfo {
  clientNumber: string
  clientName: string
  RFC?: string
  direccion?: string
  colonia?: string
  ciudad?: string
  estado?: string
  cp?: string | number
  correo?: string
  tel?: string
}
