'use client';

interface EmbedWidgetProps {
  categorySlug: string;
  calculatorSlug: string;
}

export function EmbedWidget({ categorySlug, calculatorSlug }: EmbedWidgetProps) {
  const embedCode = `<div style="max-width: 600px; margin: 0 auto;">
  <iframe 
    src="https://mycalculating.com/category/${categorySlug}/${calculatorSlug}?embed=true" 
    width="100%" 
    height="600" 
    style="border:1px solid #ccc; border-radius:8px;" 
    loading="lazy" 
    title="${calculatorSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Calculator by MyCalculating.com"
  ></iframe>
  <p style="text-align:center; font-size:12px; margin-top:4px;">
    <a href="https://mycalculating.com/category/${categorySlug}/${calculatorSlug}" target="_blank" rel="noopener">
      Use full version on <strong>MyCalculating.com</strong>
    </a>
  </p>
</div>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="mt-12 p-6 bg-muted/50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Embed This Calculator</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add this calculator to your website or blog using the embed code below:
      </p>
      <div className="bg-background p-4 rounded border font-mono text-sm overflow-x-auto">
        <code>
          {embedCode}
        </code>
      </div>
      <div className="mt-4 flex gap-2">
        <button 
          onClick={handleCopyCode}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Copy Embed Code
        </button>
        <a 
          href={`/category/${categorySlug}/${calculatorSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
        >
          Open in New Tab
        </a>
      </div>
    </div>
  );
}