import 'server-only'
import db from "./db"

export async function getClientByNumber(client_number: string) {
  return db.prepare("SELECT * FROM clients WHERE client_number = ?").get(client_number);
}