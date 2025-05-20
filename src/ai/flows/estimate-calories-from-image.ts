// 'use server'
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
  nutritionLabel: z
    .string()
    .describe(
      'A formatted nutrition label summarizing the estimated nutritional content of the meal, including calories, fats, carbohydrates, and proteins.'
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
  prompt: `Analyze the food in the following image and provide an estimated nutrition label in a human-readable format, including total calories, fats, carbohydrates, and proteins.\n\nImage: {{media url=photoDataUri}}`,
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
