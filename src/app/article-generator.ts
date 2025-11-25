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

const renderTakeaways = (items?: string[]) => {
  if (!items?.length) return '';

  const listItems = items
    .map(
      (item) =>
        `<li class="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm leading-6 text-foreground">${item}</li>`
    )
    .join('\n');

  return `
    <section class="rounded-2xl border border-border bg-background/60 p-6 shadow-sm space-y-4">
      <h3 class="text-xl font-semibold text-foreground">Key Takeaways</h3>
      <ul class="space-y-3">${listItems}</ul>
    </section>
  `;
};

const renderContext = (context?: string) => {
  if (!context) return '';

  return `
    <section class="rounded-2xl border-l-4 border-primary/60 bg-primary/5 p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-primary">U.S. Context</h3>
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

const renderFaq = (faq?: { q: string; a: string }[]) => {
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
      <h3 class="text-2xl font-semibold text-foreground">FAQs</h3>
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

  sections.push(renderTakeaways(detail.takeaways));
  sections.push(renderContext(detail.contextUS));
  sections.push(renderDeepDive(detail.deepDiveTitle, detail.deepDiveContent));
  sections.push(renderStrategy(detail.strategyTitle, detail.strategySteps));
  sections.push(renderFaq(detail.faq));

  return sections.filter(Boolean).join('\n');
};


