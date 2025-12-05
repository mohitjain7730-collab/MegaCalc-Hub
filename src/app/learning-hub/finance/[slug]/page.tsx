import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleContent } from '../articles';
import { ArticleSchemaInjector } from '@/components/article-schema-injector';
import { getAuthorForArticle, getDeterministicDate } from '@/lib/article-authors';
import { formatArticleContent } from '@/lib/article-formatter';
import { ArticleBreadcrumbs } from '@/components/learning-hub/article-breadcrumbs';

// Helper function to convert slug to readable title
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to convert markdown to HTML
function markdownToHtml(markdown: string): string {
  let html = markdown.trim();

  // First, protect code blocks and inline code before processing
  const codeBlocks: string[] = [];
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Convert headers (must be done before paragraph conversion)
  html = html.replace(/^### (.+)$/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>');
  
  // Convert bold text first (must be before italic)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Convert italic text (single asterisks that are not part of double asterisks)
  // Match single * only where it's not preceded or followed by another *
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Process lists - first mark list items
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is a list item
    const listMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      // Process bold/strong in list items
      let itemContent = listMatch[1]
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
      listItems.push(`<li class="ml-6 mb-1">${itemContent}</li>`);
    } else {
      // End current list if exists
      if (inList) {
        processedLines.push('<ul class="list-disc space-y-2 my-4">');
        processedLines.push(...listItems);
        processedLines.push('</ul>');
        inList = false;
        listItems = [];
      }
      
      // Process non-list lines
      if (line) {
        // Already a header or other tag
        if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('</ul') ||
            line.startsWith('<li') || line.startsWith('</li')) {
          processedLines.push(line);
        } else {
          // Regular paragraph
          processedLines.push(`<p class="mb-4 text-muted-foreground leading-7">${line}</p>`);
        }
      }
    }
  }
  
  // Close any remaining list
  if (inList && listItems.length > 0) {
    processedLines.push('<ul class="list-disc space-y-2 my-4">');
    processedLines.push(...listItems);
    processedLines.push('</ul>');
  }
  
  html = processedLines.join('\n');
  
  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });
  
  // Convert inline code (last, after other processing)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  return html;
}

function isHtmlContent(content: string): boolean {
  const sample = content.trim();
  return /<\/?[a-z][\s\S]*>/i.test(sample);
}

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const articleContent = getArticleContent();
  const article = articleContent[slug];
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedDate || undefined,
      authors: article.author ? [article.author] : undefined,
      url: `https://mycalculating.com/learning-hub/finance/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

export default async function FinanceArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const articleContent = getArticleContent();
  const article = articleContent[slug];
  
  if (!article) {
    notFound();
  }

  const title = article.title || slugToTitle(slug);
  
  // Get author information
  const author = getAuthorForArticle(
    article.title,
    article.category || 'Learning hub> Finance',
    article.author
  );
  const publishedDate = article.publishedDate 
    ? new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : getDeterministicDate(article.title);

  // Format article content according to article-generator.ts structure
  const rawContent = isHtmlContent(article.content)
    ? article.content
    : markdownToHtml(article.content);
  
  // Determine breadcrumbs based on category
  const categoryParts = (article.category || 'Learning hub> Finance').split('>').map(p => p.trim());
  
  // Extract category for enhancements (e.g., "finance" from "Learning hub> Finance")
  const categorySlug = categoryParts.length > 1 
    ? categoryParts[1].toLowerCase().replace(/\s+/g, '-')
    : 'finance';
  
  const formatted = formatArticleContent(
    rawContent, 
    author, 
    publishedDate,
    slug, // topic/slug for deterministic enhancements
    categorySlug // category for content selection
  );
  const breadcrumbItems = [
    { label: 'Learning Hub', href: '/learning-hub' },
    { label: 'Finance', href: '/learning-hub/finance' },
  ];
  
  // Add subcategory if exists
  if (categoryParts.length > 2) {
    const subcategory = categoryParts[2];
    if (subcategory === 'savings & investment') {
      breadcrumbItems.push({ label: 'Savings & Investment', href: '/learning-hub/finance/savings-and-investment' });
    } else if (subcategory === 'retirement planning') {
      breadcrumbItems.push({ label: 'Retirement Planning', href: '/learning-hub/finance/retirement-planning' });
    }
  }
  
  breadcrumbItems.push({ label: title, href: '' });

  // Build base URL for the article
  const baseUrl = `https://mycalculating.com/learning-hub/finance/${article.slug}`;

  // Update schema with author role
  const baseSchema = {
    ...article.schema,
    author: {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.role || author.credentials || "Financial Analyst"
    }
  };

  // Create BreadcrumbList schema
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://mycalculating.com${item.href}` : baseUrl
    }))
  };

  // Extract FAQs if they exist
  let faqSchema: any = null;
  if (formatted.hasFaq) {
    const faqMatches = rawContent.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gis);
    const faqs: { q: string; a: string }[] = [];
    for (const match of faqMatches) {
      faqs.push({
        q: match[1].replace(/<[^>]+>/g, '').trim(),
        a: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }
    
    if (faqs.length > 0) {
      faqSchema = {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      };
    }
  }

  // Build final schema with @graph structure
  // Always include Article and BreadcrumbList, conditionally include FAQPage
  const graphItems: any[] = [
    breadcrumbSchema,
    baseSchema
  ];

  if (faqSchema) {
    graphItems.push(faqSchema);
  }

  const finalSchema = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return (
    <>
      <ArticleSchemaInjector schema={finalSchema} />
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/learning-hub/finance/savings-and-investment">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Savings & Investment
              </Link>
            </Button>
            
            {/* Breadcrumbs */}
            <ArticleBreadcrumbs items={breadcrumbItems} />
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
              {title}
            </h1>
          </div>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: formatted.html }}
            />
          </article>
        </div>
      </div>
    </>
  );
}

