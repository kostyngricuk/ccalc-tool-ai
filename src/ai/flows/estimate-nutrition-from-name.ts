
'use server';
/**
 * @fileOverview Estimates nutritional information for a food item by its name.
 *
 * - estimateNutritionFromName - A function that handles the nutritional estimation based on food name.
 * - EstimateNutritionFromNameInput - The input type for the estimateNutritionFromName function.
 * - EstimateNutritionFromNameOutput - The return type for the estimateNutritionFromName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateNutritionFromNameInputSchema = z.object({
  foodName: z.string().describe('The name of the food item to estimate nutrition for.'),
});
export type EstimateNutritionFromNameInput = z.infer<
  typeof EstimateNutritionFromNameInputSchema
>;

const EstimateNutritionFromNameOutputSchema = z.object({
  calories: z.number().default(0).describe('Estimated total calories in kcal for a standard serving. Default to 0 if not determinable.'),
  protein: z.number().default(0).describe('Estimated total protein in grams for a standard serving. Default to 0 if not determinable.'),
  carbs: z.number().default(0).describe('Estimated total carbohydrates in grams for a standard serving. Default to 0 if not determinable.'),
  fat: z.number().default(0).describe('Estimated total fat in grams for a standard serving. Default to 0 if not determinable.'),
});
export type EstimateNutritionFromNameOutput = z.infer<
  typeof EstimateNutritionFromNameOutputSchema
>;

export async function estimateNutritionFromName(
  input: EstimateNutritionFromNameInput
): Promise<EstimateNutritionFromNameOutput> {
  return estimateNutritionFromNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateNutritionFromNamePrompt',
  input: {schema: EstimateNutritionFromNameInputSchema},
  output: {schema: EstimateNutritionFromNameOutputSchema},
  prompt: `You are a nutritional assistant. Given the food name, estimate its typical nutritional values for a standard serving. 
Provide calories (kcal), protein (grams), carbohydrates (grams), and fat (grams). 
If any value cannot be reliably determined, use 0 for that value. 
Only return the numerical values as per the output schema.
Food Name: {{{foodName}}}`,
});

const estimateNutritionFromNameFlow = ai.defineFlow(
  {
    name: 'estimateNutritionFromNameFlow',
    inputSchema: EstimateNutritionFromNameInputSchema,
    outputSchema: EstimateNutritionFromNameOutputSchema,
  },
  async (input: EstimateNutritionFromNameInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
