
import {
  generateExample,
  getRandomStatistic,
  getOptionalSections,
  generateExpertCommentary,
  getHeadingVariation,
  getRandomizedFAQs,
  getSectionOrder,
  type SectionOrder
} from '@/lib/article-enhancements';

export interface ArticleDetail {
  title: string;
  desc: string;
  // Optional sections allow for different article structures (Listicles, Definitions, etc.)
  intro?: string;
  takeaways?: string[];
  contextUS?: string; 
  deepDiveTitle?: string;
  deepDiveContent?: string;
  strategyTitle?: string;
  strategySteps?: string[];
  faq?: { q: string; a: string }[];
  // Metadata for SEO & EEAT
  author?: string;
  authorBio?: string;
  publishedDate?: string;
  // Escape hatch for fully custom HTML articles
  contentBody?: string;
  // Optional: topic/slug for deterministic enhancements (defaults to title if not provided)
  topic?: string;
  category?: string;
}

// --- Author Database for Automated Assignment ---
const AUTHORS = [
  { 
    name: "Sarah Jenkins, CFA", 
    bio: "Sarah is a Chartered Financial Analyst with over 12 years of experience in wealth management. She specializes in cash flow planning for homeowners and small business owners." 
  },
  { 
    name: "Michael Ross, CFP", 
    bio: "Michael is a Certified Financial Planner specializing in tax-efficient investing strategies for high-net-worth individuals. He is a frequent contributor to major financial publications." 
  },
  { 
    name: "Emily Carter", 
    bio: "Emily is a personal finance journalist whose work focuses on behavioral economics and overcoming financial anxiety. She advocates for automated, rules-based investing." 
  },
  { 
    name: "David Thompson, CPA", 
    bio: "David is a Certified Public Accountant with a decade of experience. He specializes in helping families optimize their tax liabilities through HSAs, FSAs, and medical deductions." 
  },
  { 
    name: "Jessica Martinez", 
    bio: "Jessica is an investment strategist with a focus on portfolio construction and tax optimization. She advises clients on how to minimize tax drag in taxable brokerage accounts." 
  },
  { 
    name: "Robert Hughes", 
    bio: "Robert is a real estate investor and consumer advocate who teaches others how to break the cycle of car debt payments. He believes in buying depreciating assets with cash." 
  },
  { 
    name: "Christopher Baker", 
    bio: "Christopher is a former hedge fund analyst turned financial educator. He specializes in risk management and building 'All-Weather' portfolios that survive economic shocks." 
  },
  { 
    name: "Jennifer Wu", 
    bio: "Jennifer is a family finance expert who helps households navigate the transition to single-income living. She focuses on estate planning, insurance, and budget optimization." 
  },
  { 
    name: "Daniel Evans", 
    bio: "Daniel is a retirement transition specialist helping clients navigate the critical 5 years before and after retirement. He focuses on income preservation and sequence of returns risk." 
  },
  { 
    name: "Amanda Lee", 
    bio: "Amanda is a behavioral finance expert who teaches resilience in uncertain economies. She focuses on emergency preparedness and career financial planning." 
  }
];

// Helper to assign a consistent author based on title hash
const getDeterministicAuthor = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AUTHORS.length;
  return AUTHORS[index];
};

// Helper to assign a date between Sept 1 2025 and Nov 25 2025
const getDeterministicDate = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Range approx 85 days
  const daysOffset = Math.abs(hash) % 85; 
  const baseDate = new Date('2025-09-01');
  baseDate.setDate(baseDate.getDate() + daysOffset);
  
  return baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- Schema Generator ---
export const generateArticleSchema = (detail: ArticleDetail, slug: string) => {
  const authorData = detail.author 
    ? { name: detail.author } 
    : getDeterministicAuthor(detail.title);
  
  const dateStr = detail.publishedDate || getDeterministicDate(detail.title);
  
  // Convert friendly date string back to ISO for schema if possible, or use generic ISO
  const isoDate = new Date(dateStr).toISOString().split('T')[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": detail.title,
    "description": detail.desc,
    "author": {
      "@type": "Person",
      "name": authorData.name
    },
    "datePublished": isoDate,
    "dateModified": isoDate, // Assuming static
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mycalculating.com/learning-hub/finance/${slug}`
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

  // If FAQs exist, add FAQPage schema
  if (detail.faq && detail.faq.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        schema,
        {
          "@type": "FAQPage",
          "mainEntity": detail.faq.map(f => ({
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

  return schema;
};

// --- HTML Generator ---
export const generateFullArticleHTML = (detail: ArticleDetail): string => {
  
  // Determine Author & Date (Use manual if provided, otherwise auto-assign)
  let authorData;
  if (detail.author) {
    const authorName = detail.author;
    // If author is provided, try to find their bio in AUTHORS array (case-insensitive)
    const foundAuthor = AUTHORS.find(a => a.name.toLowerCase() === authorName.toLowerCase());
    authorData = {
      name: authorName,
      bio: detail.authorBio || foundAuthor?.bio || getDeterministicAuthor(detail.title).bio
    };
  } else {
    authorData = getDeterministicAuthor(detail.title);
  }
    
  const dateStr = detail.publishedDate || getDeterministicDate(detail.title);

  // If a custom body is provided, use it directly (useful for unique formats)
  if (detail.contentBody) {
    return `<div class="space-y-8 text-slate-800 leading-relaxed">${detail.contentBody}</div>`;
  }

  // ============================================================================
  // ENHANCEMENT SYSTEM: Dynamic content generation for uniqueness
  // ============================================================================
  // All enhancements use deterministic randomization based on topic/slug hash
  // This ensures consistent output per article while maintaining uniqueness across articles
  
  // Get topic/slug for deterministic enhancements (use provided topic or fallback to title)
  const topic = detail.topic || detail.title;
  const category = detail.category || 'finance';

  // 1. Generate dynamic example/case study (NEW: Section 1 requirement)
  const example = generateExample(topic, category);
  
  // 2. Get random statistic from statistics.json (NEW: Section 2 requirement)
  const statistic = getRandomStatistic(topic, category);
  
  // 5. Get optional micro-section (Common Mistake or Expert Insight) (NEW: Section 5 requirement)
  const optionalSection = getOptionalSections(topic, category);
  
  // 6. Generate expert commentary for middle of article (NEW: Section 6 requirement)
  const expertCommentary = generateExpertCommentary(topic, category);
  
  // 3. Get randomized FAQs (3-7 random FAQs from available list) (NEW: Section 3 requirement)
  const randomizedFAQs = getRandomizedFAQs(topic, detail.faq || []);

  // 4. Get heading variations (NEW: Section 4 requirement)
  const takeawaysHeading = getHeadingVariation(topic, 'Key Takeaways');
  const contextHeading = getHeadingVariation(topic, 'Why It Matters');
  const faqHeading = getHeadingVariation(topic, 'Frequently Asked Questions');
  const exampleHeading = getHeadingVariation(topic, 'Example Scenario');
  const statHeading = getHeadingVariation(topic, 'Quick Stat');
  
  // 7. Determine section order based on topic hash (NEW: Section 7 requirement)
  const mainContentSections: string[] = [];
  let expertCommentaryInserted = false;
  
  // Count main content sections for expert commentary positioning
  if (detail.contextUS) mainContentSections.push('context');
  if (detail.deepDiveTitle && detail.deepDiveContent) mainContentSections.push('deepdive');
  if (detail.strategyTitle && detail.strategySteps?.length) mainContentSections.push('strategy');
  
  const sectionOrder = getSectionOrder(topic, mainContentSections.length);
  const expertCommentaryPosition = Math.min(sectionOrder.expertCommentaryIndex, mainContentSections.length - 1);

  // Construct Author Byline (Top)
  const byline = `
    <div class="flex items-center text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100 not-prose">
      <div class="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-lg mr-3">
        ${authorData.name.charAt(0)}
      </div>
      <div>
        <span class="block font-bold text-slate-900">${authorData.name}</span>
      </div>
    </div>
  `;

  // Construct Author Bio (Bottom)
  const authorSection = `
    <div class="mt-12 pt-8 border-t border-gray-200 bg-gray-50 rounded-xl p-6">
      <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">About the Author</h3>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 font-serif font-bold text-xl shadow-sm">
          ${authorData.name.charAt(0)}
        </div>
        <div>
          <p class="font-bold text-slate-900 text-lg">${authorData.name}</p>
          <p class="text-slate-600 mt-1 leading-relaxed text-sm">${authorData.bio}</p>
        </div>
      </div>
    </div>
  `;

  // Build sections array for flexible ordering
  const sections: string[] = [];

  // Always include byline first
  sections.push(byline);

  // Intro Section
  if (detail.intro) {
    sections.push(`
      <div class="text-lg md:text-xl text-slate-600 font-medium">
        <p>${detail.intro}</p>
      </div>
    `);
  }

  // Key Takeaways with variation
  if (detail.takeaways && detail.takeaways.length > 0) {
    sections.push(`
      <div class="bg-brand-50 border-l-4 border-brand-500 p-6 rounded-r-lg shadow-sm my-8">
        <h3 class="text-brand-900 font-bold text-lg mb-3 flex items-center">
          <span class="text-2xl mr-2">💡</span> ${takeawaysHeading}
        </h3>
        <ul class="space-y-2">
          ${detail.takeaways.map(t => `<li class="flex items-start"><span class="text-brand-500 mr-2">•</span><span>${t}</span></li>`).join('')}
        </ul>
      </div>
    `);
  }

  // Insert Example Scenario based on position (early, middle, or late)
  let exampleInserted = false;
  let statInserted = false;
  let sectionIndex = 0;

  // Helper to insert example at right position
  const shouldInsertExample = (pos: 'early' | 'middle' | 'late', currentIndex: number, totalSections: number) => {
    if (pos === 'early') return currentIndex <= Math.floor(totalSections * 0.33);
    if (pos === 'middle') return currentIndex > Math.floor(totalSections * 0.33) && currentIndex <= Math.floor(totalSections * 0.66);
    return currentIndex > Math.floor(totalSections * 0.66);
  };

  // Helper to insert stat at right position
  const shouldInsertStat = (pos: 'early' | 'middle' | 'late', currentIndex: number, totalSections: number) => {
    if (pos === 'early') return currentIndex <= Math.floor(totalSections * 0.33);
    if (pos === 'middle') return currentIndex > Math.floor(totalSections * 0.33) && currentIndex <= Math.floor(totalSections * 0.66);
    return currentIndex > Math.floor(totalSections * 0.66);
  };

  // Context US Section
  if (detail.contextUS) {
    // Check if we should insert example or stat before this section
    if (!exampleInserted && shouldInsertExample(sectionOrder.examplePosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-blue-900 font-bold text-lg mb-3">${exampleHeading}</h3>
          <p class="text-slate-700 leading-7">${example}</p>
        </div>
      `);
      exampleInserted = true;
    }
    
    if (!statInserted && statistic && shouldInsertStat(sectionOrder.statPosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-purple-900 font-bold text-lg mb-3">${statHeading}</h3>
          <p class="text-slate-700 leading-7 font-medium">${statistic}</p>
        </div>
      `);
      statInserted = true;
    }

    sections.push(`
      <div class="prose prose-slate max-w-none">
        <h3 class="text-2xl font-bold text-slate-900">${contextHeading}</h3>
        <p>${detail.contextUS}</p>
      </div>
    `);
    sectionIndex++;

    // Insert expert commentary after context if position matches
    if (!expertCommentaryInserted && sectionIndex - 1 === expertCommentaryPosition) {
      sections.push(`
        <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm my-8 italic">
          <p class="text-slate-700 leading-7">${expertCommentary}</p>
        </div>
      `);
      expertCommentaryInserted = true;
    }
  }

  // Deep Dive Section
  if (detail.deepDiveTitle && detail.deepDiveContent) {
    // Check if we should insert example or stat before this section
    if (!exampleInserted && shouldInsertExample(sectionOrder.examplePosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-blue-900 font-bold text-lg mb-3">${exampleHeading}</h3>
          <p class="text-slate-700 leading-7">${example}</p>
        </div>
      `);
      exampleInserted = true;
    }
    
    if (!statInserted && statistic && shouldInsertStat(sectionOrder.statPosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-purple-900 font-bold text-lg mb-3">${statHeading}</h3>
          <p class="text-slate-700 leading-7 font-medium">${statistic}</p>
        </div>
      `);
      statInserted = true;
    }

    sections.push(`
      <div class="prose prose-slate max-w-none">
        <h2 class="text-2xl font-bold text-slate-900">${detail.deepDiveTitle}</h2>
        ${detail.deepDiveContent}
      </div>
    `);
    sectionIndex++;

    // Insert expert commentary after deep dive if position matches
    if (!expertCommentaryInserted && sectionIndex - 1 === expertCommentaryPosition) {
      sections.push(`
        <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm my-8 italic">
          <p class="text-slate-700 leading-7">${expertCommentary}</p>
        </div>
      `);
      expertCommentaryInserted = true;
    }
  }

  // Strategy/Practical Section
  if (detail.strategyTitle && detail.strategySteps && detail.strategySteps.length > 0) {
    // Check if we should insert example or stat before this section
    if (!exampleInserted && shouldInsertExample(sectionOrder.examplePosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-blue-900 font-bold text-lg mb-3">${exampleHeading}</h3>
          <p class="text-slate-700 leading-7">${example}</p>
        </div>
      `);
      exampleInserted = true;
    }
    
    if (!statInserted && statistic && shouldInsertStat(sectionOrder.statPosition, sectionIndex, 5)) {
      sections.push(`
        <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm my-8">
          <h3 class="text-purple-900 font-bold text-lg mb-3">${statHeading}</h3>
          <p class="text-slate-700 leading-7 font-medium">${statistic}</p>
        </div>
      `);
      statInserted = true;
    }

    sections.push(`
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">${detail.strategyTitle}</h2>
        <div class="space-y-4">
          ${detail.strategySteps.map((step, idx) => `
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                ${idx + 1}
              </div>
              <div>
                <p class="text-slate-700">${step}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `);
    sectionIndex++;

    // Insert expert commentary after strategy if position matches
    if (!expertCommentaryInserted && sectionIndex - 1 === expertCommentaryPosition) {
      sections.push(`
        <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm my-8 italic">
          <p class="text-slate-700 leading-7">${expertCommentary}</p>
        </div>
      `);
      expertCommentaryInserted = true;
    }
  }

  // Insert remaining example/stat if not yet inserted
  if (!exampleInserted) {
    sections.push(`
      <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm my-8">
        <h3 class="text-blue-900 font-bold text-lg mb-3">${exampleHeading}</h3>
        <p class="text-slate-700 leading-7">${example}</p>
      </div>
    `);
  }
  
  if (!statInserted && statistic) {
    sections.push(`
      <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm my-8">
        <h3 class="text-purple-900 font-bold text-lg mb-3">${statHeading}</h3>
        <p class="text-slate-700 leading-7 font-medium">${statistic}</p>
      </div>
    `);
  }

  // Insert expert commentary if not yet inserted
  if (!expertCommentaryInserted) {
    sections.push(`
      <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm my-8 italic">
        <p class="text-slate-700 leading-7">${expertCommentary}</p>
      </div>
    `);
  }

  // Optional Section (Common Mistake or Expert Insight)
  if (optionalSection.type && optionalSection.content) {
    const optionalHeading = optionalSection.type === 'common-mistake' 
      ? getHeadingVariation(topic, 'Common Mistake')
      : getHeadingVariation(topic, 'Expert Insight');
    
    const bgColor = optionalSection.type === 'common-mistake' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';
    const textColor = optionalSection.type === 'common-mistake' ? 'text-red-900' : 'text-green-900';
    
    sections.push(`
      <div class="${bgColor} border-l-4 p-6 rounded-r-lg shadow-sm my-8">
        <h3 class="${textColor} font-bold text-lg mb-3">${optionalHeading}</h3>
        <p class="text-slate-700 leading-7">${optionalSection.content}</p>
      </div>
    `);
  }

  // FAQs - position based on sectionOrder (after-main or near-bottom)
  // If after-main, insert before author section. If near-bottom, insert after author section.
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

  // Insert FAQs based on position preference
  if (sectionOrder.faqPosition === 'after-main' && faqSection) {
    sections.push(faqSection);
  }

  // Author Section (always before disclaimer)
  sections.push(authorSection);

  // Insert FAQs near bottom if that's the preference
  if (sectionOrder.faqPosition === 'near-bottom' && faqSection) {
    sections.push(faqSection);
  }

  // Disclaimer (always last)
  sections.push(`
    <div class="text-xs text-gray-400 border-t pt-6 mt-12 italic">
      This content is for educational purposes only and does not constitute financial advice. Market data and tax laws are subject to change. Consult a certified professional before making investment decisions.
    </div>
  `);

  // Return all sections joined
  return `
    <div class="space-y-8 text-slate-800 leading-relaxed">
      ${sections.join('\n')}
    </div>
  `;
};

// Helper to generate a slug from a title
export const slugify = (text: string) => 
  text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
