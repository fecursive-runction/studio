import { genkit, type GenkitErrorCode } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { load } from 'js-yaml';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // Use the user-specified model, with the correct syntax.
  model: googleAI.model('gemini-1.5-pro-latest'),
  // Reduce retries to fail faster on persistent errors.
  retries: 1,
  // Add a timeout to prevent requests from hanging indefinitely.
  requestTimeout: 30000, // 30 seconds
  // Custom error handler to log more details
  errorHandler: (err: any) => {
    // Default error object structure
    let errorObject: {
      message: string;
      code?: GenkitErrorCode;
      status?: string;
      details?: any;
    } = {
      message: err.message || 'An unexpected error occurred.',
      details: err.stack,
    };

    // Check if the error is a Genkit-specific error with a structured response
    if (err.cause && typeof err.cause === 'string') {
      try {
        // Attempt to parse the YAML-like error string from Genkit
        const parsedError: any = load(err.cause);
        if (parsedError && parsedError.error) {
          errorObject = {
            message: parsedError.error.message || err.message,
            code: parsedError.error.code,
            status: parsedError.error.status,
            details: parsedError.error.details || err.stack,
          };
        }
      } catch (parseError) {
        // If parsing fails, fall back to the original error message
        console.error('Failed to parse Genkit error cause:', parseError);
        errorObject.details = err.cause;
      }
    }
    
    console.error('[Genkit Error Handler]', JSON.stringify(errorObject, null, 2));

    // Do not re-throw or suppress, let Genkit handle the rest
  },
});
