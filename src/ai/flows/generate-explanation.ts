'use server';
/**
 * @fileOverview Generates an explanation for a given AI optimization recommendation.
 * 
 * - generateExplanation - A function that generates the explanation text.
 * - GenerateExplanationInput - The input type for the generateExplanation function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema includes the original metrics and the AI's recommended adjustments.
const GenerateExplanationInputSchema = z.object({
  kilnTemperature: z.number(),
  feedRate: z.number(),
  lsf: z.number(),
  limestoneAdjustment: z.string(),
  clayAdjustment: z.string(),
  predictedLSF: z.number(),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;

export async function generateExplanation(input: GenerateExplanationInput): Promise<string> {
  const explanationFlow = ai.defineFlow(
    {
      name: 'generateExplanationFlow',
      inputSchema: GenerateExplanationInputSchema,
      outputSchema: z.string(),
    },
    async (input) => {
      const prompt = `Based on the following data, provide a clear, concise explanation for the recommendation.
        - Current LSF: ${input.lsf.toFixed(1)}%
        - Recommended Limestone Adjustment: ${input.limestoneAdjustment}
        - Recommended Clay Adjustment: ${input.clayAdjustment}
        - Predicted LSF: ${input.predictedLSF.toFixed(1)}%
        
        Explain the trade-offs involved, particularly how adjustments to the raw mix (limestone for CaO, clay for SiO2/Al2O3) affect the LSF to bring it into the ideal range of 94-98%.`;
      
      const { text } = await ai.generate({ prompt });
      return text;
    }
  );

  return explanationFlow(input);
}
