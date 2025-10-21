'use server';

import { BigQuery, Table, Dataset } from '@google-cloud/bigquery';

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

const DATASET_ID = 'cement_plant_data';
const TABLE_ID = 'production_metrics';

// Schema for the production_metrics table
const schema = [
    { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'plant_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'kiln_temp', type: 'FLOAT' },
    { name: 'feed_rate', type: 'FLOAT' },
    { name: 'energy_kwh_per_ton', type: 'FLOAT' },
    { name: 'clinker_quality_score', type: 'FLOAT' },
];


/**
 * Ensures that the required BigQuery dataset and table exist.
 * Creates them if they are missing.
 */
async function ensureBigQueryTableExists() {
    const bq = getBigQueryClient();
    const dataset = bq.dataset(DATASET_ID);
    const [datasetExists] = await dataset.exists();

    if (!datasetExists) {
        console.log(`Dataset ${DATASET_ID} does not exist. Creating...`);
        await dataset.create({ location: 'US' });
        console.log(`Dataset ${DATASET_ID} created.`);
    }

    const table = dataset.table(TABLE_ID);
    const [tableExists] = await table.exists();

    if (!tableExists) {
        console.log(`Table ${TABLE_ID} does not exist. Creating...`);
        await table.create({
            schema: schema,
            timePartitioning: {
                type: 'DAY',
                field: 'timestamp',
            },
        });
        console.log(`Table ${TABLE_ID} created.`);
    }
}


/**
 * Executes a SQL query against the Google BigQuery database.
 * 
 * @param sql The SQL query string to execute.
 * @returns A promise that resolves to an array of query result rows.
 * @throws An error if the query fails to execute.
 */
export async function executeBigQuery(sql: string): Promise<Record<string, any>[]> {
  await ensureBigQueryTableExists();
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
    await ensureBigQueryTableExists();
    const bq = getBigQueryClient();
    try {
        await bq.dataset(datasetId).table(tableId).insert(rows);
        console.log(`Inserted ${Array.isArray(rows) ? rows.length : 1} rows into ${datasetId}.${tableId}`);
    } catch (error: any) {
        console.error('BigQuery Insert Error:', JSON.stringify(error, null, 2));
        throw new Error('Failed to insert data into BigQuery.');
    }
}
