
'use server';

/**
 * @fileOverview AI-powered alert generation for cement plant monitoring.
 * 
 * - generateAlerts - A function that generates alerts based on live production data.
 * - GenerateAlertsInput - The input type for the generateAlerts function.
 * - GenerateAlertsOutput - The return type for the generateAlerts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAlertsInputSchema = z.object({
  kilnTemperature: z.number().describe('The current temperature of the kiln in degrees Celsius.'),
  feedRate: z.number().describe('The current feed rate of raw materials in tons per hour.'),
  lsf: z.number().describe('The current Lime Saturation Factor (LSF) of the raw mix.'),
});
export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;


const AlertSchema = z.object({
    severity: z.enum(['CRITICAL', 'WARNING', 'INFO']).describe("The severity of the alert."),
    message: z.string().describe("The alert message."),
});

const GenerateAlertsOutputSchema = z.object({
    alerts: z.array(AlertSchema).describe("An array of generated alerts. Can be empty if no alerts are warranted."),
});
export type GenerateAlertsOutput = z.infer<typeof GenerateAlertsOutputSchema>;


export async function generateAlerts(input: GenerateAlertsInput): Promise<GenerateAlertsOutput> {
  return generateAlertsFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateAlertsPrompt',
    input: { schema: GenerateAlertsInputSchema },
    output: { schema: GenerateAlertsOutputSchema },
    prompt: `You are an AI monitoring system for a cement plant. Your task is to generate alerts based on the following live data.
  
    Current Plant State:
    - Kiln Temperature: {{{kilnTemperature}}} °C
    - Raw Material Feed Rate: {{{feedRate}}} tons/hour
    - Lime Saturation Factor (LSF): {{{lsf}}}
  
    Use the following rules to generate alerts.
    - Ideal Kiln Temperature is between 1430°C and 1470°C.
    - Ideal Lime Saturation Factor (LSF) is between 94% and 98%.
    - CRITICAL Alert: If Kiln Temperature > 1480°C or < 1420°C. Message should reflect the extreme temperature.
    - WARNING Alert: If Kiln Temperature is between 1470-1480°C or 1420-1430°C.
    - WARNING Alert: If LSF is below 94 or above 98. Message should indicate the LSF is out of spec and might affect clinker quality.
    
    If all metrics are within their ideal ranges, return an empty array for the 'alerts' field.
    Do not generate an INFO alert if operations are normal.
    Return a valid JSON object matching the output schema.
    `,
  });
  
  const generateAlertsFlow = ai.defineFlow(
    {
      name: 'generateAlertsFlow',
      inputSchema: GenerateAlertsInputSchema,
      outputSchema: GenerateAlertsOutputSchema,
    },
    async input => {
      const { output } = await prompt(input);
      return output!;
    }
  );


