import 'server-only';
import type { Article } from '../../../types';
import { getAllLearningArticles } from '@/lib/learning-hub-content';
import { getAuthorForArticle } from '@/lib/article-authors';

// Convert JSON article to Article format
function convertJsonArticleToArticle(jsonArticle: any): Article {
  const publishedDate = new Date().toISOString().split('T')[0];
  
  // Get author for schema
  const author = getAuthorForArticle(
    jsonArticle.title,
    jsonArticle.category || 'Learning hub> Finance',
    jsonArticle.author
  );
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": jsonArticle.title,
    "description": jsonArticle.description,
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "author": {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.role || author.credentials || "Financial Analyst"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mycalculating.com/learning-hub/finance/${jsonArticle.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mycalculating.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mycalculating.com/logo.png"
      }
    }
  };

  return {
    id: jsonArticle.slug,
    title: jsonArticle.title,
    slug: jsonArticle.slug,
    description: jsonArticle.description,
    content: jsonArticle.content,
    schema: schema,
    publishedDate: publishedDate,
    category: jsonArticle.category, // Store category for author determination
    author: author.name, // Store author name
  };
}

// Get JSON articles and filter for finance categories
// NOTE: All articles now load only from JSON files in /content/learning/
// This function is server-only and should only be called from server components
function loadFinanceArticles() {
  const allJsonArticles = getAllLearningArticles();
  
  const savingsArticles: Article[] = allJsonArticles
    .filter(article => article.category === 'Learning hub> Finance> savings & investment')
    .map(convertJsonArticleToArticle);

  const retirementArticles: Article[] = allJsonArticles
    .filter(article => article.category === 'Learning hub> Finance> retirement planning')
    .map(convertJsonArticleToArticle);

  const articleContent: Record<string, Article> = [
    ...savingsArticles,
    ...retirementArticles,
].reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, Article>
);

  return {
    savingsArticles,
    retirementArticles,
    articleContent
  };
}

// Cache the loaded articles
let cachedArticles: ReturnType<typeof loadFinanceArticles> | null = null;

// Export getter functions - these will only execute on the server
export function getFinanceArticles(): Article[] {
  if (!cachedArticles) {
    cachedArticles = loadFinanceArticles();
  }
  return cachedArticles.savingsArticles;
}

export function getRetirementArticlesList(): Article[] {
  if (!cachedArticles) {
    cachedArticles = loadFinanceArticles();
  }
  return cachedArticles.retirementArticles;
}

export function getArticleContent(): Record<string, Article> {
  if (!cachedArticles) {
    cachedArticles = loadFinanceArticles();
  }
  return cachedArticles.articleContent;
}

// Note: Use getter functions (getFinanceArticles, getRetirementArticlesList, getArticleContent)
// instead of constants to ensure server-only execution
