'use server';

import { BigQuery } from '@google-cloud/bigquery';

let bigquery: BigQuery;

function getBigQueryClient() {
    if (!bigquery) {
      // In a production environment, you would manage credentials more securely,
      // e.g., using Application Default Credentials on Cloud Run.
      // For local development, ensure you've authenticated via `gcloud auth application-default login`.
      bigquery = new BigQuery();
    }
    return bigquery;
}

/**
 * Executes a SQL query against the Google BigQuery database.
 * 
 * @param sql The SQL query string to execute.
 * @returns A promise that resolves to an array of query result rows.
 * @throws An error if the query fails to execute.
 */
export async function executeBigQuery(sql: string): Promise<Record<string, any>[]> {
  const bq = getBigQueryClient();
  const options = {
    query: sql,
    location: 'US', // Replace with your BigQuery dataset's location if different
  };

  try {
    const [rows] = await bq.query(options);
    console.log(`BigQuery job completed. Found ${rows.length} rows.`);
    // The BigQuery client returns rich objects. We serialize them to plain JSON
    // to ensure they can be passed between Server Components and Client Components.
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error('BigQuery Query Error:', error);
    throw new Error('Failed to execute query on BigQuery.');
  }
}

/**
 * Inserts rows into a specified BigQuery table.
 *
 * @param datasetId The ID of the dataset containing the table.
 * @param tableId The ID of the table to insert rows into.
 * @param rows The row(s) to insert.
 * @returns A promise that resolves when the insertion is complete.
 * @throws An error if the insertion fails.
 */
export async function insertIntoBigQuery(datasetId: string, tableId: string, rows: any | any[]) {
    const bq = getBigQueryClient();
    try {
        await bq.dataset(datasetId).table(tableId).insert(rows);
        console.log(`Inserted ${Array.isArray(rows) ? rows.length : 1} rows into ${datasetId}.${tableId}`);
    } catch (error: any) {
        console.error('BigQuery Insert Error:', JSON.stringify(error, null, 2));
        throw new Error('Failed to insert data into BigQuery.');
    }
}
