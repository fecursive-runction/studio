import { config } from 'dotenv';
config();

import '@/ai/helpers'; // Import helpers for dev environment
import '@/ai/flows/optimize-cement-production.ts';
import '@/ai/flows/query-plant-data-with-natural-language.ts';
