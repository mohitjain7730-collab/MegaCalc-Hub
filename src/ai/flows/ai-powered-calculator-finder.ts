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

// The output is now a simple string for the calculator name.
const AIPoweredCalculatorFinderOutputSchema = z.string().describe('The name of the most relevant calculator for the query.');
export type AIPoweredCalculatorFinderOutput = z.infer<typeof AIPoweredCalculatorFinderOutputSchema>;

export async function aiPoweredCalculatorFinder(input: AIPoweredCalculatorFinderInput): Promise<AIPoweredCalculatorFinderOutput> {
  return aiPoweredCalculatorFinderFlow(input);
}

const calculatorList = calculators.map(c => `- ${c.name}: ${c.description}`).join('\n');

const prompt = ai.definePrompt({
  name: 'aiPoweredCalculatorFinderPrompt',
  input: {schema: AIPoweredCalculatorFinderInputSchema},
  // No output schema needed here as we want a raw string.
  prompt: `You are an AI assistant helping users find the right calculator on MegaCalc Hub.

  Given the user's query, find the single most relevant calculator from the list below and return its full name.

  Here is the list of available calculators:
  ${calculatorList}

  User Query: {{{query}}}

  Respond with ONLY the full name of the most appropriate calculator and nothing else.
  `,
});

const aiPoweredCalculatorFinderFlow = ai.defineFlow(
  {
    name: 'aiPoweredCalculatorFinderFlow',
    inputSchema: AIPoweredCalculatorFinderInputSchema,
    outputSchema: AIPoweredCalculatorFinderOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({prompt: prompt.render(input)});
    return text;
  }
);
