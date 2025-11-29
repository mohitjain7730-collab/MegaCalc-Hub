import type { Article } from '../../../../types';
import { nutritionArticles } from './nutrition1';
import { nutritionArticlesPart2 } from './nutrition2';
import { nutritionArticlesPart3 } from './nutrition3';
import { nutritionArticlesPart4 } from './nutrition4';
import { nutritionArticlesPart5 } from './nutrition5';
import type { Article as HealthArticle } from '../article';
import { getAuthorForArticle } from '../article';

// Helper function to convert health Article to standard Article format
function convertHealthArticleToStandard(healthArticle: HealthArticle): Article {
  // Generate slug from title
  const slug = healthArticle.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Generate description from intro
  const description = healthArticle.content.intro.substring(0, 160).trim() + '...';

  // Convert content to HTML
  const htmlContent = convertContentToHTML(healthArticle);

  // Generate schema
  const author = getAuthorForArticle(healthArticle.id);
  const publishedDate = new Date().toISOString().split('T')[0]; // Use current date or generate deterministically

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": healthArticle.title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author.name
    },
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mycalculating.com/learning-hub/health/nutrition-diet/${slug}`
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

  // Add FAQ schema if FAQs exist
  let finalSchema = schema;
  if (healthArticle.content.faq && healthArticle.content.faq.length > 0) {
    finalSchema = {
      "@context": "https://schema.org",
      "@graph": [
        schema,
        {
          "@type": "FAQPage",
          "mainEntity": healthArticle.content.faq.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a
            }
          }))
        }
      ]
    };
  }

  return {
    id: slug,
    title: healthArticle.title,
    slug: slug,
    description: description,
    content: htmlContent,
    schema: finalSchema,
    author: author.name,
    publishedDate: publishedDate,
  };
}

// Convert health article content structure to HTML
function convertContentToHTML(healthArticle: HealthArticle): string {
  const { content } = healthArticle;
  const author = getAuthorForArticle(healthArticle.id);
  let html = '';

  // Article Header with Author Info (title is rendered separately in page component)
  html += `<header class="mb-10">`;
  html += `<div class="flex items-center space-x-3 mb-6">`;
  html += `<div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">${author.name.charAt(0)}</div>`;
  html += `<div>`;
  html += `<div class="font-semibold text-slate-900">${author.name}, ${author.credentials}</div>`;
  html += `<div class="text-sm text-slate-500">Evidence Based • ${healthArticle.readTime}</div>`;
  html += `</div>`;
  html += `</div>`;
  html += `<p class="text-xl text-slate-600 leading-relaxed border-l-4 border-emerald-500 pl-4 italic">${content.intro}</p>`;
  html += `</header>`;

  // Key Takeaways Box
  if (content.keyTakeaways && content.keyTakeaways.length > 0) {
    html += `<div class="bg-slate-50 rounded-2xl p-6 sm:p-8 mb-10 border border-slate-100">`;
    html += `<div class="flex items-center space-x-2 mb-4 text-emerald-700 font-bold uppercase tracking-wider text-sm">`;
    html += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
    html += `<span>Key Takeaways</span>`;
    html += `</div>`;
    html += `<ul class="space-y-3">`;
    content.keyTakeaways.forEach((point, idx) => {
      html += `<li class="flex items-start">`;
      html += `<span class="mr-3 text-emerald-500 font-bold">•</span>`;
      html += `<span class="text-slate-800 leading-relaxed font-medium">${point}</span>`;
      html += `</li>`;
    });
    html += `</ul>`;
    html += `</div>`;
  }

  // Why It Matters
  if (content.whyItMatters) {
    html += `<section class="mb-12">`;
    html += `<h2 class="text-2xl font-bold text-slate-900 mb-4">Why It Matters (US Context)</h2>`;
    html += `<p class="text-lg text-slate-700 leading-relaxed">${content.whyItMatters}</p>`;
    html += `</section>`;
  }

  // Detailed Sections
  if (content.sections && content.sections.length > 0) {
    html += `<div class="space-y-10 mb-12">`;
    content.sections.forEach((section, idx) => {
      html += `<section>`;
      html += `<h2 class="text-2xl font-bold text-slate-900 mb-4">${section.title}</h2>`;
      html += `<p class="text-lg text-slate-700 leading-relaxed">${section.body}</p>`;
      html += `</section>`;
    });
    html += `</div>`;
  }

  // Workflow Steps
  if (content.workflow && content.workflow.length > 0) {
    html += `<section class="mb-12">`;
    html += `<h2 class="text-2xl font-bold text-slate-900 mb-6">Actionable Workflow</h2>`;
    html += `<div class="space-y-4">`;
    content.workflow.forEach(step => {
      html += `<div class="flex items-start">`;
      html += `<div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mt-1 mr-4">${step.step}</div>`;
      html += `<div class="bg-white border border-slate-200 rounded-xl p-5 w-full shadow-sm">`;
      html += `<h3 class="font-bold text-slate-900 mb-1">${step.title}</h3>`;
      html += `<p class="text-slate-600">${step.desc}</p>`;
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</section>`;
  }

  // FAQ
  if (content.faq && content.faq.length > 0) {
    html += `<section class="mb-12">`;
    html += `<h2 class="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>`;
    html += `<div class="space-y-6 divide-y divide-slate-100">`;
    content.faq.forEach((item, idx) => {
      html += `<div class="pt-6 ${idx === 0 ? '' : ''}">`;
      html += `<p class="font-bold text-emerald-800 mb-2 flex items-start">`;
      html += `<span class="mr-2 text-emerald-400">?</span>`;
      html += `${item.q}`;
      html += `</p>`;
      html += `<p class="text-slate-700 pl-6 leading-relaxed">${item.a}</p>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</section>`;
  }

  // Author Footer
  html += `<footer class="border-t border-slate-200 pt-8 mt-12">`;
  html += `<div class="flex items-start space-x-4">`;
  html += `<div class="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">${author.name.charAt(0)}</div>`;
  html += `<div>`;
  html += `<div class="font-bold text-slate-900 text-lg">${author.name}, ${author.credentials}</div>`;
  html += `<p class="text-slate-600 mt-2 leading-relaxed">${author.bio}</p>`;
  html += `</div>`;
  html += `</div>`;
  html += `</footer>`;

  return html;
}

// Import all nutrition articles
const allNutritionArticles = [
  ...nutritionArticles,
  ...nutritionArticlesPart2,
  ...nutritionArticlesPart3,
  ...nutritionArticlesPart4,
  ...nutritionArticlesPart5,
];

// Convert all articles to standard format
export const NUTRITION_ARTICLES: Article[] = allNutritionArticles.map(convertHealthArticleToStandard);

// Export as a key-value map for easy lookup by slug
export const ARTICLE_CONTENT: Record<string, Article> = NUTRITION_ARTICLES.reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, Article>
);

