'server-only';

import type { Author } from './article-authors';
import {
  generateExample,
  getRandomStatistic,
  getOptionalSections,
  generateExpertCommentary,
  getHeadingVariation,
  getRandomizedFAQs,
  getSectionOrder,
  applyNaturalImperfectionsToText,
} from './article-enhancements';
import { generateSectionOrder as getVariabilitySectionOrder } from './content-variability-engine';

export interface FormattedArticleContent {
  html: string;
  hasTakeaways: boolean;
  hasFaq: boolean;
}

/**
 * Formats article content according to article-generator.ts structure
 * Extracts and formats Key Takeaways, FAQs, and other sections
 * Now includes dynamic enhancements for uniqueness
 */
export function formatArticleContent(
  rawContent: string,
  author: Author,
  publishedDate: string,
  topic?: string,
  category?: string
): FormattedArticleContent {
  let html = rawContent.trim();
  
  // Extract Key Takeaways if they exist
  const takeawaysMatch = html.match(/<h2[^>]*>Key Takeaways<\/h2>\s*<ul[^>]*>(.*?)<\/ul>/is);
  let takeaways: string[] = [];
  let hasTakeaways = false;
  
  if (takeawaysMatch) {
    const takeawaysHtml = takeawaysMatch[1];
    const liMatches = takeawaysHtml.matchAll(/<li[^>]*>(.*?)<\/li>/gis);
    takeaways = Array.from(liMatches).map(match => {
      // Clean HTML from list items, keep only text and basic formatting
      return match[1]
        .replace(/<[^>]+>/g, '')
        .trim();
    });
    hasTakeaways = takeaways.length > 0;
    
    // Remove the original Key Takeaways section
    html = html.replace(/<h2[^>]*>Key Takeaways<\/h2>\s*<ul[^>]*>.*?<\/ul>/is, '');
  }
  
  // Extract FAQs if they exist
  const faqMatch = html.match(/<h2[^>]*>Frequently Asked Questions<\/h2>(.*?)(?=<h2|$)/is);
  let faqs: { q: string; a: string }[] = [];
  let hasFaq = false;
  
  if (faqMatch) {
    const faqContent = faqMatch[1];
    // Try to match FAQ patterns
    const qMatches = faqContent.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gis);
    for (const match of qMatches) {
      faqs.push({
        q: match[1].replace(/<[^>]+>/g, '').trim(),
        a: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }
    hasFaq = faqs.length > 0;
    
    // Remove the original FAQ section
    html = html.replace(/<h2[^>]*>Frequently Asked Questions<\/h2>.*?(?=<h2|$)/is, '');
  }

  // ============================================================================
  // ENHANCEMENT SYSTEM: Dynamic content generation for uniqueness
  // ============================================================================
  // Get topic for deterministic enhancements (use provided topic or derive from content)
  const articleTopic = topic || (rawContent.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1] || 'article').toLowerCase();
  const articleCategory = category || 'general';

  // Generate enhancement content with error handling
  let example = 'This example demonstrates how the topic applies in real-world scenarios.';
  let statistic: string | null = null;
  let optionalSection = { type: null as 'common-mistake' | 'expert-insight' | 'pro-tip' | null, content: '' };
  let expertCommentary = 'This topic is important for understanding key concepts.';
  let randomizedFAQs = faqs;
  let takeawaysHeading = 'Key Takeaways';
  let faqHeading = 'Frequently Asked Questions';
  let exampleHeading = 'Example Scenario';
  let statHeading = 'Quick Stat';
  let sectionOrder: ReturnType<typeof getVariabilitySectionOrder> = { 
    takeawaysPosition: 'middle' as const, 
    examplePosition: 'middle' as const, 
    statPosition: 'middle' as const, 
    faqPosition: 'after-main' as const, 
    expertCommentaryPosition: 'after-main' as const,
    optionalSectionPosition: 'after-main' as const
  };

  try {
    example = generateExample(articleTopic, articleCategory);
    statistic = getRandomStatistic(articleTopic, articleCategory);
    optionalSection = getOptionalSections(articleTopic, articleCategory);
    expertCommentary = generateExpertCommentary(articleTopic, articleCategory);
    randomizedFAQs = getRandomizedFAQs(articleTopic, faqs);
    takeawaysHeading = getHeadingVariation(articleTopic, 'Key Takeaways');
    faqHeading = getHeadingVariation(articleTopic, 'Frequently Asked Questions');
    exampleHeading = getHeadingVariation(articleTopic, 'Example Scenario');
    statHeading = getHeadingVariation(articleTopic, 'Quick Stat');
    
    // Determine section order using Variability Engine
    sectionOrder = getVariabilitySectionOrder(articleTopic);
  } catch (error) {
    console.error('Error generating article enhancements:', error);
    // Use fallback values defined above
  }
  
  // Construct Author Byline (Top)
  const roleText = author.role || author.credentials || '';
  const byline = `
    <div class="flex items-center text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100 not-prose">
      <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg mr-3">
        ${author.name.charAt(0)}
      </div>
      <div>
        <span class="block font-bold text-slate-900">${author.name}</span>
        ${roleText ? `<span class="block text-xs font-medium text-blue-600 uppercase tracking-wide">${roleText}</span>` : ''}
        <span class="block text-xs text-gray-500 mt-1">${publishedDate}</span>
      </div>
    </div>
  `;
  
  // Format Key Takeaways section if found (with heading variation)
  const takeawaysSection = hasTakeaways ? `
    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
      <h3 class="text-blue-900 font-bold text-lg mb-3 flex items-center">
        <span class="text-2xl mr-2">💡</span> ${takeawaysHeading}
      </h3>
      <ul class="space-y-2">
        ${takeaways.map(t => `<li class="flex items-start"><span class="text-blue-500 mr-2">•</span><span>${t}</span></li>`).join('')}
      </ul>
    </div>
  ` : '';

  // Generate dynamic sections with natural imperfections applied
  const imperfectExample = applyNaturalImperfectionsToText(example, articleTopic);
  const exampleSection = `
    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
      <h3 class="text-blue-900 font-bold text-lg mb-3">${exampleHeading}</h3>
      <p class="text-slate-700 leading-7">${imperfectExample}</p>
    </div>
  `;

  const imperfectStatistic = statistic ? applyNaturalImperfectionsToText(statistic, articleTopic) : null;
  const statSection = imperfectStatistic ? `
    <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm my-8">
      <h3 class="text-purple-900 font-bold text-lg mb-3">${statHeading}</h3>
      <p class="text-slate-700 leading-7 font-medium">${imperfectStatistic}</p>
    </div>
  ` : '';

  const imperfectCommentary = applyNaturalImperfectionsToText(expertCommentary, articleTopic);
  const expertCommentarySection = `
    <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm my-8 italic">
      <p class="text-slate-700 leading-7">${imperfectCommentary}</p>
    </div>
  `;

  // Optional section (Common Mistake, Expert Insight, or Pro Tip)
  let optionalSectionHtml = '';
  if (optionalSection.type && optionalSection.content) {
    let optionalHeading = '';
    let bgColor = '';
    let textColor = '';
    
    if (optionalSection.type === 'common-mistake') {
      optionalHeading = getHeadingVariation(articleTopic, 'Common Mistake');
      bgColor = 'bg-red-50 border-red-500';
      textColor = 'text-red-900';
    } else if (optionalSection.type === 'expert-insight') {
      optionalHeading = getHeadingVariation(articleTopic, 'Expert Insight');
      bgColor = 'bg-green-50 border-green-500';
      textColor = 'text-green-900';
    } else if (optionalSection.type === 'pro-tip') {
      optionalHeading = getHeadingVariation(articleTopic, 'Pro Tip');
      bgColor = 'bg-blue-50 border-blue-500';
      textColor = 'text-blue-900';
    }
    
    // Apply natural imperfections to optional section content
    const imperfectContent = applyNaturalImperfectionsToText(optionalSection.content, articleTopic);
    
    optionalSectionHtml = `
      <div class="${bgColor} border-l-4 p-6 rounded-r-lg shadow-sm my-8">
        <h3 class="${textColor} font-bold text-lg mb-3">${optionalHeading}</h3>
        <p class="text-slate-700 leading-7">${imperfectContent}</p>
      </div>
    `;
  }
  
  // Format FAQ section if found (with randomized FAQs and heading variation)
  const faqSection = randomizedFAQs.length > 0 ? `
    <div class="prose prose-slate max-w-none pt-4">
      <h3 class="text-2xl font-bold text-slate-900">${faqHeading}</h3>
      <dl class="space-y-6 mt-4">
        ${randomizedFAQs.map(item => `
          <div>
            <dt class="font-bold text-slate-900 text-lg">? ${item.q}</dt>
            <dd class="mt-2 text-slate-600 pl-4 border-l-2 border-gray-200">${item.a}</dd>
          </div>
        `).join('')}
      </dl>
    </div>
  ` : '';
  
  // Construct Author Bio (Bottom)
  const authorSection = `
    <div class="mt-12 pt-8 border-t border-gray-200 bg-gray-50 rounded-xl p-6">
      <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">About the Author</h3>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 font-serif font-bold text-xl shadow-sm">
          ${author.name.charAt(0)}
        </div>
        <div>
          <p class="font-bold text-slate-900 text-lg">${author.name}</p>
          ${roleText ? `<p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">${roleText}</p>` : ''}
          <p class="text-slate-600 mt-1 leading-relaxed text-sm">${author.bio}</p>
        </div>
      </div>
    </div>
  `;
  
  // Clean up and format the main content
  // Ensure proper spacing and formatting
  html = html
    .replace(/<h2/g, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4"')
    .replace(/<h3/g, '<h3 class="text-xl font-bold text-slate-800 mt-6 mb-3"')
    .replace(/<p(?![^>]*class)/g, '<p class="text-slate-700 leading-relaxed mb-4"')
    .replace(/<ul(?![^>]*class)/g, '<ul class="list-disc pl-5 space-y-2 mb-4"')
    .replace(/<ol(?![^>]*class)/g, '<ol class="list-decimal pl-5 space-y-2 mb-4"')
    .replace(/<li(?![^>]*class)/g, '<li class="text-slate-700"')
    .replace(/<strong(?![^>]*class)/g, '<strong class="font-semibold text-slate-900"')
    .replace(/<em(?![^>]*class)/g, '<em class="italic"');
  
  // Build sections array for flexible ordering
  const sections: string[] = [];
  let exampleInserted = false;
  let statInserted = false;
  
  sections.push(byline);
  
  // Insert example early if that's the position
  if (sectionOrder.examplePosition === 'early' && !exampleInserted) {
    sections.push(exampleSection);
    exampleInserted = true;
  }
  
  sections.push(takeawaysSection);
  
  // Insert stat early if that's the position
  if (sectionOrder.statPosition === 'early' && !statInserted && statistic) {
    sections.push(statSection);
    statInserted = true;
  }
  
  // Main content
  sections.push(`
    <div class="prose prose-slate max-w-none">
      ${html}
    </div>
  `);
  
  // Insert expert commentary after main content if that's the position
  if (sectionOrder.expertCommentaryPosition === 'after-main') {
    sections.push(expertCommentarySection);
  }
  
  // Insert example middle if that's the position
  if (sectionOrder.examplePosition === 'middle' && !exampleInserted) {
    sections.push(exampleSection);
    exampleInserted = true;
  }
  
  // Insert stat middle if that's the position
  if (sectionOrder.statPosition === 'middle' && !statInserted && statistic) {
    sections.push(statSection);
    statInserted = true;
  }
  
  // Optional section - position based on variability engine
  if (optionalSectionHtml && sectionOrder.optionalSectionPosition === 'after-main') {
    sections.push(optionalSectionHtml);
  }
  
  // Insert example late if that's the position (or if not yet inserted)
  if ((sectionOrder.examplePosition === 'late' || !exampleInserted) && !exampleInserted) {
    sections.push(exampleSection);
    exampleInserted = true;
  }
  
  // Insert stat late if that's the position (or if not yet inserted)
  if ((sectionOrder.statPosition === 'late' || !statInserted) && !statInserted && statistic) {
    sections.push(statSection);
    statInserted = true;
  }
  
  // Expert commentary before FAQ if that's the position
  if (sectionOrder.expertCommentaryPosition === 'before-faq') {
    sections.push(expertCommentarySection);
  }
  
  // Optional section before FAQ if that's the position
  if (optionalSectionHtml && sectionOrder.optionalSectionPosition === 'before-faq') {
    sections.push(optionalSectionHtml);
  }
  
  // FAQs - position based on sectionOrder
  if (sectionOrder.faqPosition === 'after-main' && faqSection) {
    sections.push(faqSection);
  }
  
  sections.push(authorSection);
  
  // Optional section near bottom if that's the position
  if (optionalSectionHtml && sectionOrder.optionalSectionPosition === 'near-bottom') {
    sections.push(optionalSectionHtml);
  }
  
  // FAQs near bottom if that's the preference
  if (sectionOrder.faqPosition === 'near-bottom' && faqSection) {
    sections.push(faqSection);
  }
  
  // Disclaimer (always last)
  sections.push(`
    <div class="text-xs text-gray-400 border-t pt-6 mt-12 italic">
      This content is for educational purposes only and does not constitute financial or medical advice. Market data, tax laws, and medical information are subject to change. Consult a certified professional before making investment or health decisions.
    </div>
  `);

  // Wrap everything in the proper structure
  const formattedHtml = `
    <div class="space-y-8 text-slate-800 leading-relaxed">
      ${sections.filter(Boolean).join('\n')}
    </div>
  `;
  
  return {
    html: formattedHtml,
    hasTakeaways,
    hasFaq
  };
}

