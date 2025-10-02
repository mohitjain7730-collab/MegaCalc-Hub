
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
    description: 'Learn about the power of disciplined investing through SIPs, how they work, and their benefits like rupee cost averaging and compounding.',
    calculatorSlug: 'sip-calculator',
    category: 'finance',
  },
];
