export interface Calculator {
  id: number;
  name: string;
  description: string;
  slug: string;
  category: string;
  subcategory?: string;
  metaTitle?: string;
  metaDescription?: string;
  faqs?: {
    question: string;
    answer: string;
  }[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  schema: any;
  publishedDate: string;
  category: string;
  author: string;
}
