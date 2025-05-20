
'use server';

/**
 * @fileOverview Estimates the calorie and nutritional content of a meal from an image.
 *
 * - estimateCaloriesFromImage - A function that handles the image analysis and nutritional estimation.
 * - EstimateCaloriesFromImageInput - The input type for the estimateCaloriesFromImage function.
 * - EstimateCaloriesFromImageOutput - The return type for the estimateCaloriesFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateCaloriesFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type EstimateCaloriesFromImageInput = z.infer<
  typeof EstimateCaloriesFromImageInputSchema
>;

const EstimateCaloriesFromImageOutputSchema = z.object({
  itemName: z.string().describe('A descriptive name for the meal in the image (e.g., "Mixed Salad with Chicken", "Fruit Bowl"). Default to "Scanned Meal" if not identifiable.'),
  calories: z.number().describe('Estimated total calories in kcal. Default to 0 if not determinable.'),
  protein: z.number().describe('Estimated total protein in grams. Default to 0 if not determinable.'),
  carbs: z.number().describe('Estimated total carbohydrates in grams. Default to 0 if not determinable.'),
  fat: z.number().describe('Estimated total fat in grams. Default to 0 if not determinable.'),
  nutritionLabel: z
    .string()
    .describe(
      'A formatted nutrition label summarizing the estimated nutritional content of the meal, including calories, fats, carbohydrates, and proteins. This is for display purposes.'
    ),
});
export type EstimateCaloriesFromImageOutput = z.infer<
  typeof EstimateCaloriesFromImageOutputSchema
>;

export async function estimateCaloriesFromImage(
  input: EstimateCaloriesFromImageInput
): Promise<EstimateCaloriesFromImageOutput> {
  return estimateCaloriesFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateCaloriesFromImagePrompt',
  input: {schema: EstimateCaloriesFromImageInputSchema},
  output: {schema: EstimateCaloriesFromImageOutputSchema},
  prompt: `Analyze the food in the following image. 
Provide a descriptive name for the meal (e.g., "Mixed Salad with Chicken", "Fruit Bowl"). If you cannot identify a specific name, use "Scanned Meal".
Estimate its total calories (as a number, e.g., 350). If not determinable, use 0.
Estimate its total protein in grams (as a number, e.g., 15.5). If not determinable, use 0.
Estimate its total carbohydrates in grams (as a number, e.g., 45.2). If not determinable, use 0.
Estimate its total fat in grams (as a number, e.g., 12.0). If not determinable, use 0.
Finally, generate a human-readable formatted nutrition label string summarizing this information for display, including total calories, fats, carbohydrates, and proteins.

Image: {{media url=photoDataUri}}`,
});

const estimateCaloriesFromImageFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesFromImageFlow',
    inputSchema: EstimateCaloriesFromImageInputSchema,
    outputSchema: EstimateCaloriesFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

