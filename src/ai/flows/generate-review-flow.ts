'use server';
/**
 * @fileOverview A Genkit flow for generating sophisticated and brand-aligned product reviews.
 *
 * - generateReview - A function that handles the AI review drafting process.
 * - GenerateReviewInput - The input type for the generateReview function.
 * - GenerateReviewOutput - The return type for the generateReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReviewInputSchema = z.object({
  productName: z.string().describe('The name of the NECTAR flavor (e.g., "Guava", "Apple").'),
  rating: z.number().min(1).max(5).describe('The user-selected star rating.'),
});
export type GenerateReviewInput = z.infer<typeof GenerateReviewInputSchema>;

const GenerateReviewOutputSchema = z.object({
  review: z.string().describe('A sophisticated, sensory-focused review draft (1-2 sentences).'),
});
export type GenerateReviewOutput = z.infer<typeof GenerateReviewOutputSchema>;

export async function generateReview(
  input: GenerateReviewInput
): Promise<GenerateReviewOutput> {
  return generateReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReviewPrompt',
  input: {schema: GenerateReviewInputSchema},
  output: {schema: GenerateReviewOutputSchema},
  prompt: `You are a sophisticated food and beverage critic and loyal customer of NECTAR, a luxury functional beverage brand.
Your task is to write a short, sensory-focused review for the flavor "{{{productName}}}" based on a star rating of {{{rating}}} out of 5.

The review should:
1. Be elegant and concise (1-2 sentences).
2. Focus on the tasting notes (e.g., crispness, sweetness, mouthfeel).
3. Sound like a real, discerning customer who appreciates high-end products.
4. If the rating is 5, be ecstatic. If 4, be very satisfied. If 3 or below, be polite but constructive.

NECTAR values: Freshness, Cold-Pressed Quality, No Added Sugars, Pure Fruit Essence.`,
});

const generateReviewFlow = ai.defineFlow(
  {
    name: 'generateReviewFlow',
    inputSchema: GenerateReviewInputSchema,
    outputSchema: GenerateReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
