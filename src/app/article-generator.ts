import {
  generateExample,
  getRandomStatistic,
  getOptionalSections,
  generateExpertCommentary,
  getHeadingVariation,
  getRandomizedFAQs,
  getSectionOrder,
} from '@/lib/article-enhancements';

export interface ArticleDetail {
  title: string;
  desc: string;
  intro: string;
  takeaways?: string[];
  contextUS?: string;
  deepDiveTitle?: string;
  deepDiveContent?: string;
  strategyTitle?: string;
  strategySteps?: string[];
  faq?: { q: string; a: string }[];
  // Optional: topic/slug for deterministic enhancements (defaults to title if not provided)
  topic?: string;
  category?: string;
  [key: string]: unknown;
}

const paragraphize = (text: string, className = 'text-muted-foreground leading-7') => {
  return text
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => `<p class="${className}">${segment}</p>`)
    .join('\n');
};

const renderTakeaways = (items?: string[], heading?: string) => {
  if (!items?.length) return '';

  const listItems = items
    .map(
      (item) =>
        `<li class="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm leading-6 text-foreground">${item}</li>`
    )
    .join('\n');

  return `
    <section class="rounded-2xl border border-border bg-background/60 p-6 shadow-sm space-y-4">
      <h3 class="text-xl font-semibold text-foreground">${heading || 'Key Takeaways'}</h3>
      <ul class="space-y-3">${listItems}</ul>
    </section>
  `;
};

const renderContext = (context?: string, heading?: string) => {
  if (!context) return '';

  return `
    <section class="rounded-2xl border-l-4 border-primary/60 bg-primary/5 p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-primary">${heading || 'U.S. Context'}</h3>
      ${paragraphize(context, 'text-sm leading-7 text-primary/90')}
    </section>
  `;
};

const renderDeepDive = (title?: string, content?: string) => {
  if (!content) return '';

  return `
    <section class="rounded-2xl border border-border bg-background/60 p-6 shadow-sm space-y-4">
      ${title ? `<h3 class="text-2xl font-semibold text-foreground">${title}</h3>` : ''}
      <div class="prose prose-slate dark:prose-invert max-w-none space-y-4">
        ${content.trim()}
      </div>
    </section>
  `;
};

const renderStrategy = (title?: string, steps?: string[]) => {
  if (!steps?.length) return '';

  const items = steps
    .map(
      (step, index) =>
        `<li class="flex gap-4"><span class="text-sm font-semibold text-primary">${String(index + 1).padStart(2, '0')}</span><div class="text-muted-foreground leading-7">${step}</div></li>`
    )
    .join('\n');

  return `
    <section class="rounded-2xl border border-border bg-background/60 p-6 shadow-sm space-y-4">
      ${title ? `<h3 class="text-2xl font-semibold text-foreground">${title}</h3>` : ''}
      <ol class="space-y-4">${items}</ol>
    </section>
  `;
};

const renderFaq = (faq?: { q: string; a: string }[], heading?: string) => {
  if (!faq?.length) return '';

  const items = faq
    .map(
      ({ q, a }) => `
        <div class="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-2">
          <p class="font-semibold text-foreground">${q}</p>
          <p class="text-sm leading-6 text-muted-foreground">${a}</p>
        </div>
      `
    )
    .join('\n');

  return `
    <section class="space-y-4">
      <h3 class="text-2xl font-semibold text-foreground">${heading || 'FAQs'}</h3>
      <div class="space-y-3">${items}</div>
    </section>
  `;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

export const generateFullArticleHTML = (detail: ArticleDetail) => {
  // Get topic/slug for deterministic enhancements (use provided topic or fallback to title)
  const topic = detail.topic || detail.title;
  const category = detail.category || 'general';

  // Generate enhancement content
  const example = generateExample(topic, category);
  const statistic = getRandomStatistic(topic, category);
  const optionalSection = getOptionalSections(topic, category);
  const expertCommentary = generateExpertCommentary(topic, category);
  
  // Get randomized FAQs (3-7 random FAQs from available list)
  const randomizedFAQs = getRandomizedFAQs(topic, detail.faq || []);

  // Get heading variations
  const takeawaysHeading = getHeadingVariation(topic, 'Key Takeaways');
  const contextHeading = getHeadingVariation(topic, 'U.S. Context');
  const faqHeading = getHeadingVariation(topic, 'FAQs');
  const exampleHeading = getHeadingVariation(topic, 'Example Scenario');
  const statHeading = getHeadingVariation(topic, 'Quick Stat');

  // Determine section order
  const sectionOrder = getSectionOrder(topic, 5);

  const sections: string[] = [];

  sections.push(`
    <section class="rounded-3xl border border-border bg-background/70 p-6 shadow-sm space-y-4">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">Guide Overview</p>
      <p class="text-base leading-7 text-muted-foreground">${detail.desc}</p>
    </section>
  `);

  sections.push(`
    <section class="space-y-4">
      ${paragraphize(detail.intro)}
    </section>
  `);

  // Insert example early if that's the position
  if (sectionOrder.examplePosition === 'early') {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-blue-900 mb-3">${exampleHeading}</h3>
        <p class="text-foreground leading-7">${example}</p>
      </section>
    `);
  }

  sections.push(renderTakeaways(detail.takeaways, takeawaysHeading));

  // Insert stat early if that's the position
  if (sectionOrder.statPosition === 'early' && statistic) {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-purple-500 bg-purple-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-purple-900 mb-3">${statHeading}</h3>
        <p class="text-foreground leading-7 font-medium">${statistic}</p>
      </section>
    `);
  }

  sections.push(renderContext(detail.contextUS, contextHeading));

  // Insert expert commentary after context if position matches
  sections.push(`
    <section class="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-6 shadow-sm italic">
      <p class="text-foreground leading-7">${expertCommentary}</p>
    </section>
  `);

  sections.push(renderDeepDive(detail.deepDiveTitle, detail.deepDiveContent));
  sections.push(renderStrategy(detail.strategyTitle, detail.strategySteps));

  // Insert example middle if that's the position
  if (sectionOrder.examplePosition === 'middle') {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-blue-900 mb-3">${exampleHeading}</h3>
        <p class="text-foreground leading-7">${example}</p>
      </section>
    `);
  }

  // Insert stat middle if that's the position
  if (sectionOrder.statPosition === 'middle' && statistic) {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-purple-500 bg-purple-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-purple-900 mb-3">${statHeading}</h3>
        <p class="text-foreground leading-7 font-medium">${statistic}</p>
      </section>
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
      <section class="rounded-2xl border-l-4 ${bgColor} p-6 shadow-sm">
        <h3 class="text-xl font-semibold ${textColor} mb-3">${optionalHeading}</h3>
        <p class="text-foreground leading-7">${optionalSection.content}</p>
      </section>
    `);
  }

  // Insert example late if that's the position
  if (sectionOrder.examplePosition === 'late') {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-blue-900 mb-3">${exampleHeading}</h3>
        <p class="text-foreground leading-7">${example}</p>
      </section>
    `);
  }

  // Insert stat late if that's the position
  if (sectionOrder.statPosition === 'late' && statistic) {
    sections.push(`
      <section class="rounded-2xl border-l-4 border-purple-500 bg-purple-50 p-6 shadow-sm">
        <h3 class="text-xl font-semibold text-purple-900 mb-3">${statHeading}</h3>
        <p class="text-foreground leading-7 font-medium">${statistic}</p>
      </section>
    `);
  }

  // FAQs - position based on sectionOrder
  if (sectionOrder.faqPosition === 'after-main') {
    sections.push(renderFaq(randomizedFAQs, faqHeading));
  }

  // If FAQs should be near bottom, they'll be added after all other content
  // For this simpler template, we'll add them here if near-bottom
  if (sectionOrder.faqPosition === 'near-bottom') {
    sections.push(renderFaq(randomizedFAQs, faqHeading));
  }

  return sections.filter(Boolean).join('\n');
};


