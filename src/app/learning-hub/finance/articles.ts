import type { Article } from '@/types';
import { savingInvestingArticles } from './saving-investing';
import { savingInvestingArticles2 } from './saving-investing-2';

const financeArticles: Article[] = [
  ...savingInvestingArticles,
  ...savingInvestingArticles2,
];

export const FINANCE_ARTICLES = financeArticles;

export const ARTICLE_CONTENT = financeArticles.reduce<Record<string, Article>>(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {}
);


