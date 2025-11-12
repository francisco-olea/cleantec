import { getDatabase } from "../lib/db"
import fs from "fs"
import path from "path"

interface CSVProduct {
  name: string
  description: string
  price: string
  price2: string
  image_url: string
  category: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parsePrice(priceStr: string): number {
  // Remove commas and convert to number
  const cleaned = priceStr.replace(/,/g, "").trim()
  const parsed = Number.parseFloat(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
}

async function importProducts() {
  try {
    const db = getDatabase()
    const csvPath = path.join(process.cwd(), "CleanTecData - Productos.csv")

    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`)
      process.exit(1)
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const lines = csvContent.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      console.error("CSV file is empty or has no data rows")
      process.exit(1)
    }

    // Parse header
    const header = parseCSVLine(lines[0])
    console.log("CSV Headers:", header)

    // Find column indices
    const nameIdx = header.indexOf("name")
    const descIdx = header.indexOf("description")
    const priceIdx = header.indexOf("price")
    const price2Idx = header.indexOf("price2")
    const imageIdx = header.indexOf("image_url")
    const categoryIdx = header.indexOf("category")

    if (nameIdx === -1 || priceIdx === -1 || categoryIdx === -1) {
      console.error("Required columns not found in CSV")
      process.exit(1)
    }

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO products (name, description, price, price2, category, image_url, stock, active, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Clear existing products (optional - comment out if you want to keep existing)
    // db.prepare("DELETE FROM products").run()
    // console.log("Cleared existing products")

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCSVLine(lines[i])
        
        if (row.length < header.length) {
          console.warn(`Skipping row ${i + 1}: insufficient columns`)
          skipped++
          continue
        }

        const name = row[nameIdx]?.trim()
        const description = row[descIdx]?.trim() || "Descripción del producto"
        const priceStr = row[priceIdx]?.trim() || "0"
        const price2Str = row[price2Idx]?.trim() || "0"
        const imageUrl = row[imageIdx]?.trim() || "public/images/cleantec-logo.png"
        const category = row[categoryIdx]?.trim() || "Otros"

        if (!name) {
          console.warn(`Skipping row ${i + 1}: missing name`)
          skipped++
          continue
        }

        const price = parsePrice(priceStr)
        const price2 = parsePrice(price2Str)

        // Check if product already exists (by name)
        const existing = db.prepare("SELECT id FROM products WHERE name = ?").get(name) as { id: number } | undefined

        if (existing) {
          // Update existing product
          db.prepare(`
            UPDATE products 
            SET description = ?, price = ?, price2 = ?, category = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(description, price, price2, category, imageUrl, existing.id)
          imported++
        } else {
          // Insert new product
          insertStmt.run(name, description, price, price2, category, imageUrl, 0, 1, null)
          imported++
        }
      } catch (error) {
        const errorMsg = `Error processing row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(errorMsg)
        skipped++
      }
    }

    console.log("\n=== Import Summary ===")
    console.log(`Total rows processed: ${lines.length - 1}`)
    console.log(`Successfully imported/updated: ${imported}`)
    console.log(`Skipped: ${skipped}`)
    if (errors.length > 0) {
      console.log(`\nErrors (${errors.length}):`)
      errors.slice(0, 10).forEach((err) => console.log(`  - ${err}`))
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`)
      }
    }

    // Show total products count
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }
    console.log(`\nTotal products in database: ${totalProducts.count}`)
  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  }
}

// Run import
importProducts()
  .then(() => {
    console.log("\nImport completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Import failed:", error)
    process.exit(1)
  })

