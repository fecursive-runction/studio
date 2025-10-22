'use server';
import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';

// This is a global promise for the database connection.
// This ensures that we only open the database once per server instance.
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

async function setupDatabase(db: Database) {
    // Drop the old table if it exists to apply new schema
    await db.exec('DROP TABLE IF EXISTS production_metrics');
    
    // Create the new table with chemical composition fields
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
            fe2o3 REAL NOT NULL
        );
    `);
    console.log("Database table 'production_metrics' is ready with new chemical schema.");
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
