import client from "./src/lib/turso.js";

async function setupDatabase() {
  console.log("Setting up database schema...");

  // Core Tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS societies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      upi_id TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'RESIDENT',
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  
  // Visitors
  await client.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      flat_no TEXT NOT NULL,
      visitor_name TEXT NOT NULL,
      photo_url TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Complaints
  await client.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      flat_no TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      image_url TEXT,
      resolution_image_url TEXT,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Expenses
  await client.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Maintenance
  await client.execute(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      flat_no TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      status TEXT DEFAULT 'UNPAID',
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  
  // Notices
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Events
  await client.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Subscriptions
  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      society_id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'INACTIVE',
      expiry_date DATETIME,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);

  // Parcels
  await client.execute(`
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      society_id TEXT NOT NULL,
      flat_no TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      photo_url TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(society_id) REFERENCES societies(id)
    )
  `);
  
  console.log("Database setup complete.");
}

setupDatabase().catch(console.error);
