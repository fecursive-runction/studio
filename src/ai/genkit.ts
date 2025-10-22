import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specifying the API version can help with stability.
      apiVersion: 'v1beta',
    }),
  ],
  model: 'gemini-pro', // Use a stable and widely available model.
});
