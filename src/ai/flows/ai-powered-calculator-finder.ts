'use server';

/**
 * @fileOverview An AI-powered calculator finder flow.
 *
 * - aiPoweredCalculatorFinder - A function that suggests the most relevant calculator based on a natural language query.
 * - AIPoweredCalculatorFinderInput - The input type for the aiPoweredCalculatorFinder function.
 * - AIPoweredCalculatorFinderOutput - The return type for the aiPoweredCalculatorFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { calculators } from '@/lib/calculators';

const AIPoweredCalculatorFinderInputSchema = z.object({
  query: z
    .string()
    .describe('A natural language query describing the calculation needed.'),
});
export type AIPoweredCalculatorFinderInput = z.infer<typeof AIPoweredCalculatorFinderInputSchema>;

const AIPoweredCalculatorFinderOutputSchema = z.object({
  calculatorSlug: z.string().describe('The slug of the most relevant calculator for the query.'),
});
export type AIPoweredCalculatorFinderOutput = z.infer<typeof AIPoweredCalculatorFinderOutputSchema>;

export async function aiPoweredCalculatorFinder(input: AIPoweredCalculatorFinderInput): Promise<AIPoweredCalculatorFinderOutput> {
  return aiPoweredCalculatorFinderFlow(input);
}

const calculatorList = calculators.map(c => `- ${c.name} (slug: ${c.slug}): ${c.description}`).join('\n');

const prompt = ai.definePrompt({
  name: 'aiPoweredCalculatorFinderPrompt',
  input: {schema: AIPoweredCalculatorFinderInputSchema},
  output: {schema: AIPoweredCalculatorFinderOutputSchema},
  prompt: `You are an AI assistant helping users find the right calculator on MegaCalc Hub.

  Given the user's query, find the single most relevant calculator from the list below and return its slug.

  Here is the list of available calculators:
  ${calculatorList}

  User Query: {{{query}}}

  Respond with only the slug of the most appropriate calculator.`,
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
