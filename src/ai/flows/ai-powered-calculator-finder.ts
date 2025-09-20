'use server';

/**
 * @fileOverview An AI-powered calculator finder flow.
 *
 * - aiPoweredCalculatorFinder - A function that suggests the most relevant calculator category based on a natural language query.
 * - AIPoweredCalculatorFinderInput - The input type for the aiPoweredCalculatorFinder function.
 * - AIPoweredCalculatorFinderOutput - The return type for the aiPoweredCalculatorFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredCalculatorFinderInputSchema = z.object({
  query: z
    .string()
    .describe('A natural language query describing the calculation needed.'),
});
export type AIPoweredCalculatorFinderInput = z.infer<typeof AIPoweredCalculatorFinderInputSchema>;

const AIPoweredCalculatorFinderOutputSchema = z.object({
  category: z.string().describe('The most relevant calculator category for the query.'),
});
export type AIPoweredCalculatorFinderOutput = z.infer<typeof AIPoweredCalculatorFinderOutputSchema>;

export async function aiPoweredCalculatorFinder(input: AIPoweredCalculatorFinderInput): Promise<AIPoweredCalculatorFinderOutput> {
  return aiPoweredCalculatorFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredCalculatorFinderPrompt',
  input: {schema: AIPoweredCalculatorFinderInputSchema},
  output: {schema: AIPoweredCalculatorFinderOutputSchema},
  prompt: `You are an AI assistant helping users find the right calculator category on MegaCalc Hub.

  Given the user's query, suggest the most relevant calculator category from the following list:
  Finance, Health & Fitness, Home Improvement, Engineering, Cognitive & Psychology, Education, Technology, Travel & Distance, Cooking & Food, Environment, Personal Budgeting, Business & Startup, Crypto & Web3, Parenting, Sports & Training, DIY & Crafts, Time & Date, Gardening, Fun & Games, Data & Statistics, Miscellaneous.

  Query: {{{query}}}

  Category:`,
});

const aiPoweredCalculatorFinderFlow = ai.defineFlow(
  {
    name: 'aiPoweredCalculatorFinderFlow',
    inputSchema: AIPoweredCalculatorFinderInputSchema,
    outputSchema: AIPoweredCalculatorFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
