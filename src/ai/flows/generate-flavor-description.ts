'use server';
/**
 * @fileOverview A Genkit flow for generating captivating and unique short descriptions for drink flavors.
 *
 * - generateFlavorDescription - A function that handles the flavor description generation process.
 * - GenerateFlavorDescriptionInput - The input type for the generateFlavorDescription function.
 * - GenerateFlavorDescriptionOutput - The return type for the generateFlavorDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlavorDescriptionInputSchema = z.object({
  flavorName: z.string().describe('The name of the drink flavor (e.g., "Guava", "Apple").'),
  flavorColor: z.string().describe('The primary color associated with the drink flavor (e.g., "Green", "Pink").'),
});
export type GenerateFlavorDescriptionInput = z.infer<typeof GenerateFlavorDescriptionInputSchema>;

const GenerateFlavorDescriptionOutputSchema = z.object({
  description: z.string().describe('A captivating and unique 1-3 line description for the drink flavor.'),
});
export type GenerateFlavorDescriptionOutput = z.infer<typeof GenerateFlavorDescriptionOutputSchema>;

export async function generateFlavorDescription(
  input: GenerateFlavorDescriptionInput
): Promise<GenerateFlavorDescriptionOutput> {
  return generateFlavorDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlavorDescriptionPrompt',
  input: {schema: GenerateFlavorDescriptionInputSchema},
  output: {schema: GenerateFlavorDescriptionOutputSchema},
  prompt: `You are a creative copywriter for NECTAR, a luxury functional beverage brand.
Your task is to generate a captivating and unique short narrative description for a drink flavor.

The description should be 1-3 lines long and evoke the essence of the flavor, making it sound appealing and fresh.
Consider the flavor name and its associated color to inspire the description.

Flavor Name: {{{flavorName}}}
Flavor Color: {{{flavorColor}}}`,
});

const generateFlavorDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFlavorDescriptionFlow',
    inputSchema: GenerateFlavorDescriptionInputSchema,
    outputSchema: GenerateFlavorDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
