'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import './helpers'; // Import to run helper registration

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
