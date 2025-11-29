export interface Section {
  title: string;
  body: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ArticleContent {
  intro: string;
  keyTakeaways: string[];
  whyItMatters: string;
  sections: Section[];
  workflow: WorkflowStep[];
  faq: FAQItem[];
}

export interface Article {
  id: number;
  categoryId: number;
  title: string;
  readTime: string;
  content: ArticleContent;
}

export interface Author {
  name: string;
  credentials: string;
  bio: string;
}

export const authors: Author[] = [
  { name: 'Dr. Marcus Thorne', credentials: 'MD, Endocrinology', bio: 'Dr. Thorne is a board-certified endocrinologist specializing in metabolic disorders and nutritional biochemistry with over 15 years of clinical practice in Boston.' },
  { name: 'Sarah Jenkins', credentials: 'MS, RD, CSSD', bio: 'Sarah is a Registered Dietitian and Board Certified Specialist in Sports Dietetics. She consults for Olympic athletes and focuses on performance nutrition.' },
  { name: 'Dr. Emily Carter', credentials: 'PhD, Nutritional Science', bio: 'With a PhD from Stanford, Dr. Carter researchers the impact of micronutrients on cognitive longevity and has published over 30 peer-reviewed papers.' },
  { name: 'James Wilson', credentials: 'MSc, Clinical Nutrition', bio: 'James specializes in gut health and autoimmune dietary protocols. He runs a private practice in Seattle helping patients navigate food sensitivities.' },
  { name: 'Dr. Linda Wei', credentials: 'MD, MPH', bio: 'Dr. Wei combines internal medicine with public health policy. She advocates for evidence-based dietary guidelines to combat chronic disease.' },
  { name: 'Robert H. Davidson', credentials: 'RDN, LDN', bio: 'Robert is a clinical dietitian at a major teaching hospital in Chicago, focusing on cardiac rehabilitation and plant-centric diets.' },
  { name: 'Jessica Miller', credentials: 'FNP-BC, Holistic Health', bio: 'Jessica is a Family Nurse Practitioner who integrates functional medicine principles with conventional care to treat metabolic syndrome.' },
  { name: 'Dr. Alan Grant', credentials: 'PhD, Exercise Physiology', bio: 'Dr. Grant studies the intersection of exercise metabolism and fueling strategies. He is a professor at a leading research university.' },
  { name: 'Maria Gonzalez', credentials: 'MS, Integrative Nutrition', bio: 'Maria is a nutritionist and author specializing in the Mediterranean diet and its effects on longevity and inflammation.' },
  { name: 'David Kim', credentials: 'PharmD, CNS', bio: 'Dr. Kim is a pharmacist and Certified Nutrition Specialist who focuses on nutrient-drug interactions and personalized supplementation protocols.' }
];

export const getAuthorForArticle = (id: number): Author => authors[id % authors.length];
