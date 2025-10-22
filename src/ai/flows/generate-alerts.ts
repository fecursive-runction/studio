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
  clinkerQualityScore: z.number().describe('The current clinker quality score (0-1).'),
});
export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;


const AlertSchema = z.object({
    id: z.string().describe("A unique ID for the alert, e.g., 'alert_123'."),
    severity: z.enum(['CRITICAL', 'WARNING', 'INFO', 'RESOLVED']).describe("The severity of the alert."),
    message: z.string().describe("The alert message."),
    icon: z.enum(['AlertTriangle', 'Info', 'ShieldCheck']).describe("The icon to display with the alert."),
});

const GenerateAlertsOutputSchema = z.object({
    alerts: z.array(AlertSchema).describe("An array of generated alerts based on the input metrics."),
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
    - Clinker Quality Score: {{{clinkerQualityScore}}}
  
    Use the following rules to generate alerts. Generate between 2 and 4 alerts.
    - CRITICAL Alert (Icon: AlertTriangle): If Kiln Temperature > 1480°C or < 1420°C. Message should reflect the extreme temperature.
    - WARNING Alert (Icon: AlertTriangle): If Kiln Temperature is between 1470-1480°C or 1420-1430°C.
    - WARNING Alert (Icon: AlertTriangle): If Clinker Quality Score < 0.90. Message should indicate low quality.
    - INFO Alert (Icon: Info): If all metrics are within normal operating parameters. The message should state that operations are normal.
    - INFO Alert (Icon: Info): Provide an informational alert about a routine check or status if other conditions are not met.
    - Create a unique ID for each alert.
    
    Return a JSON object containing an 'alerts' array. Do not generate a RESOLVED alert.
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
