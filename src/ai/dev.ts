'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-cement-production.ts';
import '@/ai/flows/generate-alerts.ts';
