'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Divide, DollarSign, Hash, Info, FunctionSquare, HelpCircle, Shield, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  currentShares: z.number().min(1).optional(),
  currentPrice: z.number().min(0.01).optional(),
  splitNumerator: z.number().min(1).optional(),
  splitDenominator: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StockSplitImpactCalculator() {
  const [result, setResult] = useState<{
    newShares: number;
    newPrice: number;
    marketValueBefore: number;
    marketValueAfter: number;
    interpretation: string;
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentShares: undefined, currentPrice: undefined, splitNumerator: undefined, splitDenominator: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.currentShares == null || v.currentPrice == null || v.splitNumerator == null || v.splitDenominator == null) { setResult(null); return; }
    const ratio = v.splitNumerator / v.splitDenominator; // e.g., 2-for-1 => 2
    const newShares = v.currentShares * ratio;
    const newPrice = v.currentPrice / ratio;
    const mvBefore = v.currentShares * v.currentPrice;
    const mvAfter = newShares * newPrice;
    setResult({ newShares, newPrice, marketValueBefore: mvBefore, marketValueAfter: mvAfter, interpretation: 'Stock splits and reverse splits preserve total market value (ignoring frictions). Price and share count adjust inversely.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Divide className="h-5 w-5" /> Stock Split / Reverse Split Impact</CardTitle><CardDescription>See how shares and price change under a split</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="currentShares" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Current Shares</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="splitNumerator" render={({ field }) => (
                  <FormItem><FormLabel>Split Numerator</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="splitDenominator" render={({ field }) => (
                  <FormItem><FormLabel>Split Denominator</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Impact</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Split Result</CardTitle><CardDescription>Share count and price adjustment</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">New Shares</div><p className="text-3xl font-bold text-primary">{result.newShares.toLocaleString()}</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">New Price</div><p className="text-3xl font-bold text-green-600">${result.newPrice.toLocaleString()}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Market Value Before</p><p className="text-xl font-semibold">${result.marketValueBefore.toLocaleString()}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Market Value After</p><p className="text-xl font-semibold">${result.marketValueAfter.toLocaleString()}</p></div>
              </div>
              <p className="text-sm mt-4">{result.interpretation}</p>
            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key considerations for split impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Total market value remains unchanged after the split</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Your ownership percentage of the company stays identical</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Per-share metrics (EPS, dividends) adjust proportionally</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Important factors to consider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Reverse splits often signal financial distress or delisting risk</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Fractional shares may be cashed out at unfavorable prices</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Options contracts need adjustment—verify with your broker</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Valuation & returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/earnings-per-share-calculator" className="text-primary hover:underline">Earnings per Share</Link></h4><p className="text-sm text-muted-foreground">EPS context for splits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/price-to-earnings-ratio-calculator" className="text-primary hover:underline">P/E Ratio</Link></h4><p className="text-sm text-muted-foreground">Valuation multiple.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate per price.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Split Ratio = Numerator / Denominator
            </p>
            <p className="font-mono text-sm text-center mt-2">
              New Shares = Current Shares × Split Ratio
            </p>
            <p className="font-mono text-sm text-center mt-2">
              New Price = Current Price / Split Ratio
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            For a 2-for-1 split (ratio = 2), you receive 2 shares for every 1 share owned, and the price halves. For a 1-for-10 reverse split (ratio = 0.1), you receive 1 share for every 10 shares owned, and the price increases 10x.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means for split calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Hash className="h-4 w-4" /> Current Shares</h4>
              <p className="text-sm text-muted-foreground">The number of shares you currently own before the split. This determines how many shares you'll have after the split.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</h4>
              <p className="text-sm text-muted-foreground">Today's market price per share before the split. Used to calculate the post-split price and verify market value is preserved.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Divide className="h-4 w-4" /> Split Numerator</h4>
              <p className="text-sm text-muted-foreground">The "shares you receive" part of the ratio. For a 3-for-1 split, the numerator is 3. For a 1-for-5 reverse split, the numerator is 1.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Divide className="h-4 w-4" /> Split Denominator</h4>
              <p className="text-sm text-muted-foreground">The "shares you give" part of the ratio. For a 3-for-1 split, the denominator is 1. For a 1-for-5 reverse split, the denominator is 5.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Stock Splits and Reverse Splits: How They Work and What They Mean</h1>
        <p className="text-lg italic text-muted-foreground">Understand how stock splits affect your shares, price, and portfolio value—and why companies use them strategically.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-split" className="hover:underline">What is a Stock Split?</a></li>
          <li><a href="#forward-splits" className="hover:underline">Forward Splits Explained</a></li>
          <li><a href="#reverse-splits" className="hover:underline">Reverse Splits and Their Implications</a></li>
          <li><a href="#why-splits" className="hover:underline">Why Companies Split Their Stock</a></li>
          <li><a href="#impact" className="hover:underline">Impact on Investors and Metrics</a></li>
          <li><a href="#historical" className="hover:underline">Famous Stock Splits in History</a></li>
        </ul>
        <hr />

        <h2 id="what-is-split" className="text-2xl font-bold text-foreground pt-8">What is a Stock Split?</h2>
        <p>A stock split is a corporate action that increases or decreases the number of a company's outstanding shares while proportionally adjusting the stock price. The total market capitalization—and thus your total investment value—remains unchanged.</p>

        <p className="mt-4">Think of it like exchanging a $20 bill for two $10 bills: you have more units, but the same total value. Stock splits are primarily cosmetic from a valuation standpoint, but they can have meaningful psychological and liquidity effects in the market.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Value Preservation:</strong> Total market value doesn't change (ignoring frictions).</li>
          <li><strong>Proportional Adjustment:</strong> Shares increase, price decreases (or vice versa) by the same ratio.</li>
          <li><strong>No Dilution:</strong> Your ownership percentage of the company remains constant.</li>
          <li><strong>Metric Adjustment:</strong> Per-share metrics (EPS, dividends) adjust proportionally.</li>
        </ul>
        <hr />

        <h2 id="forward-splits" className="text-2xl font-bold text-foreground pt-8">Forward Splits Explained</h2>
        <p>A forward split increases the number of shares outstanding while reducing the price per share. Common ratios include 2-for-1, 3-for-1, and 4-for-1.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How a 2-for-1 Split Works</h3>
        <p>If you own 100 shares of a stock trading at $200, after a 2-for-1 split:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>You now own 200 shares (100 × 2)</li>
          <li>The price per share is $100 ($200 ÷ 2)</li>
          <li>Your total value remains $20,000 (200 × $100 = 100 × $200)</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Psychology of Forward Splits</h3>
        <p>Although splits don't change fundamental value, they can make stocks feel more accessible. A $3,000 stock may seem "expensive" to retail investors, even though buying one share is equivalent to buying 30 shares at $100 each. Companies often split to keep their stock in a "comfortable" trading range.</p>
        <hr />

        <h2 id="reverse-splits" className="text-2xl font-bold text-foreground pt-8">Reverse Splits and Their Implications</h2>
        <p>A reverse split consolidates shares, reducing the share count while increasing the price per share. Common ratios include 1-for-5, 1-for-10, and 1-for-20.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Reverse Splits Often Signal Trouble</h3>
        <p>While forward splits are typically associated with success (the stock has risen enough to warrant splitting), reverse splits often indicate problems:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Delisting Prevention:</strong> Stock exchanges require minimum prices (e.g., $1 for NASDAQ). A reverse split can bring a stock above this threshold and avoid delisting.</li>
          <li><strong>Institutional Requirements:</strong> Many institutions can't hold "penny stocks." Raising the price may attract institutional investors.</li>
          <li><strong>Image Improvement:</strong> Companies may reverse split to shed the perception of being a low-quality, low-price stock.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Historical Performance After Reverse Splits</h3>
        <p>Research shows stocks that undergo reverse splits frequently underperform in the following years, as the underlying problems that caused the low stock price often persist. However, this isn't universal—some companies successfully turn around after a reverse split.</p>
        <hr />

        <h2 id="why-splits" className="text-2xl font-bold text-foreground pt-8">Why Companies Split Their Stock</h2>
        <p>Companies choose to split for various strategic and practical reasons, though the fundamental value isn't affected.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Reasons for Forward Splits</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Improved Liquidity:</strong> More shares at a lower price can increase trading volume and reduce bid-ask spreads.</li>
          <li><strong>Retail Accessibility:</strong> Lower prices make it easier for small investors to buy full shares.</li>
          <li><strong>Price Psychology:</strong> Some investors prefer stocks in "normal" price ranges ($20-$200).</li>
          <li><strong>Index Considerations:</strong> Price-weighted indices like the Dow Jones are affected by stock prices.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Reasons for Reverse Splits</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Exchange Compliance:</strong> Meeting minimum price requirements to stay listed.</li>
          <li><strong>Perception Management:</strong> Avoiding the "penny stock" stigma.</li>
          <li><strong>Merger Preparation:</strong> Adjusting share price for merger exchange ratios.</li>
        </ul>
        <hr />

        <h2 id="impact" className="text-2xl font-bold text-foreground pt-8">Impact on Investors and Metrics</h2>
        <p>While total value doesn't change, several per-share metrics and practical considerations are affected by splits.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Per-Share Metrics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Earnings Per Share (EPS):</strong> Adjusted inversely with the split ratio.</li>
          <li><strong>Dividends Per Share:</strong> Adjusted proportionally so total dividend income is unchanged.</li>
          <li><strong>Book Value Per Share:</strong> Also adjusts proportionally.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Tax Implications</h3>
        <p>Stock splits are generally not taxable events. Your cost basis is simply divided among the new shares. For example, if you paid $50 for one share that then splits 2-for-1, your new cost basis is $25 per share for two shares.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Options and Derivatives</h3>
        <p>Options contracts are adjusted following splits. A call option for 100 shares at $100 strike becomes a call for 200 shares at $50 strike after a 2-for-1 split. Contact your broker to confirm adjustments are handled correctly.</p>
        <hr />

        <h2 id="historical" className="text-2xl font-bold text-foreground pt-8">Famous Stock Splits in History</h2>
        <p>Some of the world's most successful companies have split their stock multiple times as their share prices climbed.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Notable Examples</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Apple (AAPL):</strong> Has split five times since its 1980 IPO, including a 4-for-1 in 2020. One original share would now be 224 shares.</li>
          <li><strong>Tesla (TSLA):</strong> Executed a 5-for-1 split in 2020 and a 3-for-1 in 2022.</li>
          <li><strong>Amazon (AMZN):</strong> Split 20-for-1 in 2022, its first split since 1999.</li>
          <li><strong>Berkshire Hathaway (BRK.A):</strong> Famously has never split its Class A shares, which trade above $500,000.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Stock splits are primarily cosmetic events that don't change a company's fundamental value or your ownership stake. Forward splits are often signs of success, while reverse splits frequently (though not always) indicate challenges.</p>
        <p className="mt-4">Understanding how splits work helps you interpret announcements correctly, verify that your account adjustments are accurate, and avoid the misconception that a lower post-split price represents a buying opportunity by itself.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about stock splits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do companies split their stock?</h4>
            <p className="text-muted-foreground">
              Companies split stock primarily to improve liquidity and accessibility. When share prices climb into the hundreds or thousands of dollars, some retail investors may be deterred from buying. A split lowers the per-share price, making the stock feel more "affordable" (though total value required to own the same stake remains unchanged). Splits can also increase trading volume and reduce bid-ask spreads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is a reverse split and why would a company do one?</h4>
            <p className="text-muted-foreground">
              A reverse split consolidates shares, reducing the count while increasing the price per share. Companies typically pursue reverse splits to avoid being delisted from exchanges (which require minimum share prices), to meet institutional investment criteria that exclude penny stocks, or to improve their public perception. Historically, reverse splits often (but not always) signal financial distress.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does a stock split change the company's market value?</h4>
            <p className="text-muted-foreground">
              No. A stock split is a zero-sum event for valuation. If shares double through a 2-for-1 split, the price halves, leaving total market capitalization unchanged. Your total investment value and ownership percentage of the company remain exactly the same. Think of it like cutting a pizza into more slices—the total amount of pizza hasn't changed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How are fractional shares handled in a stock split?</h4>
            <p className="text-muted-foreground">
              Policies vary by broker and company. Some brokers round fractional shares down to whole shares and pay cash for the fractional portion. Others allow you to retain fractional shares. For reverse splits that would leave you with less than one share, you typically receive cash equivalent to the fractional share's value. Check with your broker before a split to understand their specific handling.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock splits affect dividends?</h4>
            <p className="text-muted-foreground">
              Per-share dividends are adjusted proportionally after a split, so your total dividend income remains unchanged. If you received $1 per share before a 2-for-1 split, you'll receive $0.50 per share afterward—but you now own twice as many shares. The company's total dividend payout doesn't change due to the split itself.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Are stock splits taxable events?</h4>
            <p className="text-muted-foreground">
              No, stock splits are not taxable events in most jurisdictions. Your cost basis is simply reallocated among the new shares. If you paid $100 for one share that splits 2-for-1, your new cost basis is $50 per share for each of your two shares. Taxes are only triggered when you eventually sell shares, at which point your gains or losses are calculated from the adjusted cost basis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Stock Split Impact Calculator shows how forward and reverse splits affect your share count, price per share, and total market value.</p>
          <p>While share count and price adjust inversely, your total investment value and ownership percentage of the company remain unchanged after a split.</p>
          <p>Use this tool to verify expected post-split positions, understand split mechanics, and appreciate why splits are cosmetic events that don't change fundamental value.</p>
        </CardContent>
      </Card>
    </div>
  );
}


