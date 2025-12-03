import fs from 'fs';
import path from 'path';

export interface LearningContentArticle {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
}

const learningContentDir = path.join(process.cwd(), 'content', 'learning');

export function getAllLearningArticles(): LearningContentArticle[] {
  if (!fs.existsSync(learningContentDir)) {
    return [];
  }

  const files = fs.readdirSync(learningContentDir).filter((file) => file.endsWith('.json'));

  return files
    .map((file) => {
      const filePath = path.join(learningContentDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      try {
        const parsed = JSON.parse(raw) as LearningContentArticle;
        return parsed.slug ? parsed : null;
      } catch {
        return null;
      }
    })
    .filter((article): article is LearningContentArticle => article !== null);
}

export function getLearningArticleBySlug(slug: string): LearningContentArticle | undefined {
  return getAllLearningArticles().find((article) => article.slug === slug);
}


