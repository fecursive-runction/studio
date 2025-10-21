import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {registerHelpers} from './helpers';

// Register custom Handlebars helpers
registerHelpers();

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
