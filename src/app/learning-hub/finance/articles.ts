import { savingInvestingArticles1 } from './saving-investing-1';
import type { Article } from '../../../types';

// Export all finance articles for the listing page
export const FINANCE_ARTICLES: Article[] = [
  ...savingInvestingArticles1,
];

// Export as a key-value map for easy lookup by slug
export const ARTICLE_CONTENT: Record<string, Article> = FINANCE_ARTICLES.reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, Article>
);


