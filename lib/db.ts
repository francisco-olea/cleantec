import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

let db: Database.Database | null = null

function initializeDatabase(database: Database.Database) {
  // Check if products table exists
  const productsTableExists = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
    .get() as { name: string } | undefined

  if (!productsTableExists) {
    console.log("[v0] Initializing products schema...")

    // Create products table
    database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        price2 REAL DEFAULT 0,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        sku TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    `)

    console.log("[v0] Products schema created successfully")

    // Seed initial products (only if table is empty)
    const productCount = database.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }
    
    if (productCount.count === 0) {
      console.log("[v0] Seeding initial products...")
      const seedProducts = database.prepare(`
        INSERT INTO products (name, description, price, price2, category, image_url, stock, sku) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const initialProducts = [
        [
          "Detergente Líquido Industriaaaaaaal",
          "Detergente de alta potencia para limpieza industrial. Elimina grasa y suciedad difícil.",
          45.99,
          0,
          "Detergentes",
          "/placeholder.svg?height=300&width=300",
          150,
          "DET-001",
        ],
      [
        "Desinfectante Multiasdfasdfasdfasdfusos",
        "Desinfectante de amplio espectro. Elimina 99.9% de bacterias y virus.",
        32.5,
        0,
        "Desinfectantes",
        "/placeholder.svg?height=300&width=300",
        200,
        "DES-001",
      ],
      [
        "Limpiador de Pisos",
        "Limpiador concentrado para todo tipo de pisos. Aroma fresco y duradero.",
        28.75,
        0,
        "Limpiadores Multiusos",
        "/placeholder.svg?height=300&width=300",
        180,
        "LIM-001",
      ],
      [
        "Cloro Blanqueador",
        "Cloro de alta concentración para blanquear y desinfectar.",
        18.99,
        0,
        "Desinfectantes",
        "/placeholder.svg?height=300&width=300",
        250,
        "CLO-001",
      ],
      [
        "Jabón Líquido para Manos",
        "Jabón antibacterial suave para manos. Con glicerina y aloe vera.",
        22.0,
        0,
        "Productos para Baños",
        "/placeholder.svg?height=300&width=300",
        300,
        "JAB-001",
      ],
      [
        "Limpiador de Vidrios",
        "Limpiador especial para vidrios y superficies brillantes. Sin rayas.",
        15.5,
        0,
        "Limpiadores Multiusos",
        "/placeholder.svg?height=300&width=300",
        120,
        "VID-001",
      ],
      [
        "Desengrasante Industrial",
        "Desengrasante de alta potencia para cocinas industriales y maquinaria.",
        52.0,
        0,
        "Productos para Cocina",
        "/placeholder.svg?height=300&width=300",
        100,
        "DES-002",
      ],
      [
        "Ambientador en Aerosol",
        "Ambientador de larga duración. Variedad de aromas disponibles.",
        12.99,
        0,
        "Limpiadores Multiusos",
        "/placeholder.svg?height=300&width=300",
        400,
        "AMB-001",
      ],
      [
        "Limpiavidrios Profesional",
        "Fórmula profesional para limpieza de vidrios sin residuos.",
        19.99,
        0,
        "Limpiadores Multiusos",
        "/placeholder.svg?height=300&width=300",
        150,
        "VID-002",
      ],
      [
        "Detergente en Polvo",
        "Detergente en polvo de alta eficiencia. Ideal para ropa blanca y de color.",
        38.5,
        0,
        "Detergentes",
        "/placeholder.svg?height=300&width=300",
        200,
        "DET-002",
      ],
      [
        "Limpiador Desinfectante",
        "Limpiador 2 en 1 que limpia y desinfecta en una sola aplicación.",
        35.0,
        0,
        "Desinfectantes",
        "/placeholder.svg?height=300&width=300",
        175,
        "LIM-002",
      ],
      [
        "Suavizante de Telas",
        "Suavizante concentrado con aroma duradero. Cuida las fibras textiles.",
        29.99,
        0,
        "Detergentes",
        "/placeholder.svg?height=300&width=300",
        220,
        "SUA-001",
      ],
    ]

    for (const product of initialProducts) {
      seedProducts.run(...product)
    }

    console.log("[v0] Database seeded with initial products")
    }
  }

  const ordersTableExists = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
    .get()

  if (!ordersTableExists) {
    console.log("[v0] Initializing orders schema...")

    database.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        client_number TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_company TEXT NOT NULL,
        client_address TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        subtotal REAL NOT NULL,
        iva REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'confirmado',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        product_sku TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    `)

    console.log("[v0] Orders schema created successfully")
  }

  // Migrate existing products table if unit column exists (run after table creation check)
  if (productsTableExists !== undefined) {
    try {
      const tableInfo = database.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>
      const hasUnit = tableInfo.some((col) => col.name === "unit")
      const hasPrice2 = tableInfo.some((col) => col.name === "price2")
      
      if (hasUnit && !hasPrice2) {
        console.log("[v0] Migrating products table: removing unit, adding price2...")
        database.exec(`
          CREATE TABLE products_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            price2 REAL DEFAULT 0,
            category TEXT NOT NULL,
            image_url TEXT NOT NULL,
            stock INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            sku TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          INSERT INTO products_new (id, name, description, price, price2, category, image_url, stock, active, sku, created_at, updated_at)
          SELECT id, name, description, price, 0 as price2, category, image_url, stock, active, COALESCE(sku, NULL) as sku, created_at, updated_at
          FROM products;
          
          DROP TABLE products;
          ALTER TABLE products_new RENAME TO products;
          
          CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
          CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
          CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
        `)
        console.log("[v0] Migration completed successfully")
      }
    } catch (error) {
      console.warn("[v0] Migration error (table may already be updated):", error)
    }
  }
}

export function getDatabase() {
  if (!db) {
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, "cleantec.db")
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")

    initializeDatabase(db)
  }
  return db
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  price2: number
  category: string
  image_url: string
  stock: number
  active: number
  sku?: string | null
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  description: string
  price: number
  price2?: number
  category: string
  image_url: string
  stock?: number
  sku?: string
}

export interface Order {
  id: number
  order_number: string
  client_number: string
  client_name: string
  client_company: string
  client_address: string
  client_phone: string
  subtotal: number
  iva: number
  total: number
  status: string
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface CreateOrderInput {
  client_number: string
  client_name: string
  client_company: string
  client_address: string
  client_phone: string
  subtotal: number
  iva: number
  total: number
  notes?: string
  items: Array<{
    product_id: number
    product_name: string
    product_sku: string | null
    quantity: number
    unit_price: number
    total_price: number
  }>
}
