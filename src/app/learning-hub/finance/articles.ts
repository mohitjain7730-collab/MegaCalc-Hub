import type { Article } from '../../../types';
import { savingInvestingArticles1 } from './saving-investing-1';
import { savingInvestingArticles2 } from './saving-investing-2';
import { savingInvestingArticles3 } from './saving-investing-3';
import { savingInvestingArticles4 } from './saving-investing-4';
import { savingInvestingArticles5 } from './saving-investing-5';
import { savingInvestingArticles6 } from './saving-investing-6';
import { savingInvestingArticles7 } from './saving-investing-7';
import { savingInvestingArticles8 } from './saving-investing-8';
import { savingInvestingArticles9 } from './saving-investing-9';
import { savingInvestingArticles10 } from './saving-investing-10';
import { savingInvestingArticles11 } from './saving-investing-11';
import { savingInvestingArticles12 } from './saving-investing-12';
import { savingInvestingArticles13 } from './saving-investing-13';
import { savingInvestingArticles14 } from './saving-investing-14';
import { savingInvestingArticles15 } from './saving-investing-15';
import { savingInvestingArticles16 } from './saving-investing-16';
import { savingInvestingArticles17 } from './saving-investing-17';
import { savingInvestingArticles18 } from './saving-investing-18';
import { savingInvestingArticles19 } from './saving-investing-19';
import { savingInvestingArticles20 } from './saving-investing-20';

// Export all finance articles for the listing page
export const FINANCE_ARTICLES: Article[] = [
  ...savingInvestingArticles1,
  ...savingInvestingArticles2,
  ...savingInvestingArticles3,
  ...savingInvestingArticles4,
  ...savingInvestingArticles5,
  ...savingInvestingArticles6,
  ...savingInvestingArticles7,
  ...savingInvestingArticles8,
  ...savingInvestingArticles9,
  ...savingInvestingArticles10,
  ...savingInvestingArticles11,
  ...savingInvestingArticles12,
  ...savingInvestingArticles13,
  ...savingInvestingArticles14,
  ...savingInvestingArticles15,
  ...savingInvestingArticles16,
  ...savingInvestingArticles17,
  ...savingInvestingArticles18,
  ...savingInvestingArticles19,
  ...savingInvestingArticles20,
];

// Export as a key-value map for easy lookup by slug
export const ARTICLE_CONTENT: Record<string, Article> = FINANCE_ARTICLES.reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, Article>
);


