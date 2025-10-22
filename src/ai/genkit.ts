import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
      requestTimeout: 30000, // 30 seconds
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
