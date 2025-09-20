
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { aiPoweredCalculatorFinder } from '@/ai/flows/ai-powered-calculator-finder';
import { categories } from '@/lib/categories';

const QuerySchema = z.object({
  query: z.string().min(5, 'Please describe what you want to calculate in more detail.'),
});

export type State = {
  message?: string | null;
};

export async function findCategory(prevState: State, formData: FormData): Promise<State> {
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
    const result = await aiPoweredCalculatorFinder({ query });
    const categoryName = result.category;

    const foundCategory = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (foundCategory) {
      redirect(`/category/${foundCategory.slug}`);
    } else {
      return {
        message: `Our AI suggested "${categoryName}," but we couldn't find a direct match. Please try a different search.`,
      };
    }
  } catch (error) {
    console.error('AI Calculator Finder Error:', error);
    return { message: 'An unexpected error occurred while searching. Please try again later.' };
  }
}
