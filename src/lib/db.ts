
'use server';
import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';

// This is a global promise for the database connection.
// This ensures that we only open the database once per server instance.
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

async function setupDatabase(db: Database) {
    console.log("Setting up database...");
    
    // Forcing a schema refresh by dropping the table.
    // This is acceptable for this simulated environment to ensure schema updates.
    await db.exec("DROP TABLE IF EXISTS production_metrics;");
    console.log("Dropped existing 'production_metrics' table for schema update.");

    // Check if the table already exists.
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='production_metrics'");

    if (!tableExists) {
        console.log("Table 'production_metrics' not found. Creating it now.");
        // Create the new table with chemical composition and Bogue's fields, matching backend.json
        await db.exec(`
            CREATE TABLE production_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                plant_id TEXT NOT NULL,
                kiln_temp REAL NOT NULL,
                feed_rate REAL NOT NULL,
                lsf REAL NOT NULL,
                cao REAL NOT NULL,
                sio2 REAL NOT NULL,
                al2o3 REAL NOT NULL,
                fe2o3 REAL NOT NULL,
                c3s REAL NOT NULL,
                c2s REAL NOT NULL,
                c3a REAL NOT NULL,
                c4af REAL NOT NULL
            );
        `);
        console.log("Database table 'production_metrics' is ready with new schema.");
    } else {
        console.log("Database table 'production_metrics' already exists.");
    }
}


export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: './kiln.db', // The database file will be created in the project root.
      driver: sqlite3.Database
    }).then(async (db) => {
      await setupDatabase(db);
      return db;
    });
  }
  return dbPromise;
}

    