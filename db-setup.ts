import client from "./src/lib/turso.js";

async function createTables() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS societies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'pending',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      resident_id TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      image_url TEXT,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      status TEXT DEFAULT 'unpaid',
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      society_id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'inactive',
      expiry_date DATETIME,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  
  console.log("Tables created successfully");
}

createTables().catch(console.error);
