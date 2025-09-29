
export interface Article {
  title: string;
  slug: string;
  description: string;
  calculatorSlug: string;
  category: string;
}

export const articles: Article[] = [
  {
    title: 'What is a Systematic Investment Plan (SIP)?',
    slug: 'what-is-sip',
    description: 'Learn about disciplined investing, rupee cost averaging, and the power of compounding with SIPs.',
    calculatorSlug: 'sip-calculator',
    category: 'finance',
  },
  {
    title: 'Understanding Loans and EMIs',
    slug: 'understanding-emi',
    description: 'Demystify loan amortization schedules and how your Equated Monthly Installments are calculated.',
    calculatorSlug: 'loan-emi-calculator',
    category: 'finance',
  },
  {
    title: 'How to Plan for Retirement',
    slug: 'planning-for-retirement',
    description: 'A guide to estimating your retirement corpus and creating a savings plan to reach your financial goals.',
    calculatorSlug: 'retirement-savings-calculator',
    category: 'finance',
  },
  {
    title: 'The Power of Compound Interest',
    slug: 'power-of-compound-interest',
    description: 'Explore the magic of "interest on interest" and how it can dramatically accelerate your wealth accumulation over time.',
    calculatorSlug: 'compound-interest-calculator',
    category: 'finance',
  },
  {
    title: 'Maximizing Your 401(k)',
    slug: 'maximizing-401k',
    description: 'Understand employer matching, contribution limits, and investment growth to make the most of your 401(k) plan.',
    calculatorSlug: '401k-contribution-calculator',
    category: 'finance',
  },
];
