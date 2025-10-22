'use server';
import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';

// This is a global promise for the database connection.
// This ensures that we only open the database once per server instance.
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

async function setupDatabase(db: Database) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS production_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            plant_id TEXT NOT NULL,
            kiln_temp REAL NOT NULL,
            feed_rate REAL NOT NULL,
            energy_kwh_per_ton REAL NOT NULL,
            clinker_quality_score REAL NOT NULL
        );
    `);
    console.log("Database table 'production_metrics' is ready.");
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
