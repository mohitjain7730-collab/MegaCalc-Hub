export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  schema?: any; // JSON-LD schema for SEO
  author?: string;
  publishedDate?: string;
  category?: string; // Category for author determination
}


