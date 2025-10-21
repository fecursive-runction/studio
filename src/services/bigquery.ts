'use server';

import { BigQuery } from '@google-cloud/bigquery';

let bigquery: BigQuery;

/**
 * Executes a SQL query against the Google BigQuery database.
 * 
 * This function initializes the BigQuery client if it hasn't been already,
 * using the project ID and credentials from the environment.
 * It assumes the query is for the `cement_plant_data` dataset.
 *
 * @param sql The SQL query string to execute.
 * @returns A promise that resolves to an array of query result rows.
 * @throws An error if the query fails to execute.
 */
export async function executeBigQuery(sql: string): Promise<Record<string, any>[]> {
  if (!bigquery) {
    // In a production environment, you would manage credentials more securely,
    // e.g., using Application Default Credentials on Cloud Run.
    // For local development, ensure you've authenticated via `gcloud auth application-default login`.
    bigquery = new BigQuery();
  }

  const options = {
    query: sql,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US', // Replace with your BigQuery dataset's location if different
  };

  try {
    const [rows] = await bigquery.query(options);
    console.log(`BigQuery job completed. Found ${rows.length} rows.`);
    // The BigQuery client returns rich objects. We serialize them to plain JSON
    // to ensure they can be passed between Server Components and Client Components.
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error('BigQuery Error:', error);
    throw new Error('Failed to execute query on BigQuery.');
  }
}
