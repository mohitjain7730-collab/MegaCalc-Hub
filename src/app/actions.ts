
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { aiPoweredCalculatorFinder } from '@/ai/flows/ai-powered-calculator-finder';
import { calculators } from '@/lib/calculators';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { initializeFirebase } from '@/firebase';

const QuerySchema = z.object({
  query: z.string().min(5, 'Please describe what you want to calculate in more detail.'),
});

export type State = {
  message?: string | null;
};

export async function findCalculator(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = QuerySchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.query?.[0],
    };
  }

  const { query } = validatedFields.data;

  try {
    const { analytics } = initializeFirebase();
    if (analytics) {
        logEvent(analytics, 'search', { search_term: query });
    }
  } catch (e) {
    console.error('Firebase Analytics Error', e);
  }

  try {
    // The AI flow now returns a simple string.
    const calculatorName = await aiPoweredCalculatorFinder({ query });

    if (!calculatorName || typeof calculatorName !== 'string') {
        return { message: 'Our AI could not find a matching calculator. Please try rephrasing your search.' };
    }
    
    // Perform a case-insensitive search for the calculator name.
    const foundCalculator = calculators.find(
      (c) => c.name.toLowerCase() === calculatorName.trim().toLowerCase()
    );

    if (foundCalculator) {
      redirect(`/category/${foundCalculator.category}/${foundCalculator.slug}`);
    } else {
      console.warn(`AI suggested calculator "${calculatorName}", but no match was found.`);
      return {
        message: `Our AI suggested a calculator, but we couldn't find a direct match. Please try a different search.`,
      };
    }
  } catch (error) {
    console.error('AI Calculator Finder Error:', error);
    return { message: 'An unexpected error occurred while searching. Please try again later.' };
  }
}
