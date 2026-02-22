'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, TrendingUp, Info, FunctionSquare, HelpCircle, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  annualDividendPerShare: z.number().min(0).optional(),
  currentSharePrice: z.number().min(0.01).optional(),
  originalCostBasis: z.number().min(0.01).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DividendYieldCalculator() {
  const [result, setResult] = useState<{
    currentYield: number;
    yieldOnCost: number;
    interpretation: string;
    recommendations: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { annualDividendPerShare: undefined, currentSharePrice: undefined, originalCostBasis: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.annualDividendPerShare == null || v.currentSharePrice == null || v.originalCostBasis == null) { setResult(null); return; }
    const currentYield = (v.annualDividendPerShare / v.currentSharePrice) * 100;
    const yieldOnCost = (v.annualDividendPerShare / v.originalCostBasis) * 100;
    const interp = currentYield >= 4 ? 'High current yield—assess payout sustainability and growth.' : currentYield >= 2 ? 'Moderate yield—balance income with growth prospects.' : 'Low yield—may rely more on price appreciation than income.';
    setResult({
      currentYield: Math.round(currentYield * 100) / 100,
      yieldOnCost: Math.round(yieldOnCost * 100) / 100,
      interpretation: interp,
      recommendations: [
        'Compare yield to sector peers and historical averages',
        'Examine payout ratio and dividend growth streak',
        'Diversify income sources across industries',
      ],
      warnings: [
        'A very high yield can indicate distress',
        'Dividends may be reduced or suspended',
        'Taxes and withholding vary by jurisdiction',
      ],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" /> Dividend Yield</CardTitle>
          <CardDescription>Calculate current yield and yield on cost</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="annualDividendPerShare" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Annual Dividend/Share</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 2.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="currentSharePrice" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="originalCostBasis" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Original Cost Basis</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Yield</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Percent className="h-8 w-8 text-primary" /><div><CardTitle>Yield Results</CardTitle><CardDescription>Income rate metrics</CardDescription></div></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Current Yield</div><p className="text-3xl font-bold text-primary">{result.currentYield}%</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Yield on Cost</div><p className="text-3xl font-bold text-green-600">{result.yieldOnCost}%</p></div>
              </div>
              <p className="text-sm">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r, i) => (<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w, i) => (<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Income & valuation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/dividend-reinvestment-drip-calculator" className="text-primary hover:underline">DRIP</Link></h4><p className="text-sm text-muted-foreground">Reinvest dividends.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount streams.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
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
              Current Dividend Yield = (Annual Dividend per Share / Current Share Price) × 100
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Yield on Cost = (Annual Dividend per Share / Original Purchase Price) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current yield reflects the income rate at today's price, while yield on cost shows your personal return based on what you originally paid—a powerful metric for long-term dividend investors.
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
          <CardDescription>What each parameter means for yield calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Annual Dividend per Share</h4>
              <p className="text-sm text-muted-foreground">The total dividend paid per share over one year. For quarterly payers, multiply the quarterly dividend by 4. This is sometimes called the "indicated annual dividend."</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</h4>
              <p className="text-sm text-muted-foreground">Today's market price for one share of the stock. Used to calculate the current yield that new buyers would receive.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Original Cost Basis</h4>
              <p className="text-sm text-muted-foreground">The price you paid per share when you bought the stock. Used to calculate your personal yield on cost, which rises as dividends increase.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Dividend Yield: Understanding Income Returns on Investments</h1>
        <p className="text-lg italic text-muted-foreground">Master the essential metric that measures how much income an investment generates relative to its price, and learn how to use yield strategically in portfolio construction.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-yield" className="hover:underline">What is Dividend Yield?</a></li>
          <li><a href="#current-vs-yoc" className="hover:underline">Current Yield vs. Yield on Cost</a></li>
          <li><a href="#high-yield-trap" className="hover:underline">The High Yield Trap</a></li>
          <li><a href="#yield-strategies" className="hover:underline">Dividend Yield Strategies</a></li>
          <li><a href="#industry-benchmarks" className="hover:underline">Industry Yield Benchmarks</a></li>
          <li><a href="#yield-and-growth" className="hover:underline">Yield vs. Dividend Growth</a></li>
        </ul>
        <hr />

        <h2 id="what-is-yield" className="text-2xl font-bold text-foreground pt-8">What is Dividend Yield?</h2>
        <p>Dividend yield is a financial ratio that shows how much a company pays out in dividends each year relative to its stock price. Expressed as a percentage, it tells investors what return they can expect from dividends alone, excluding any capital gains from price appreciation.</p>

        <p className="mt-4">The formula is straightforward: take the annual dividend per share and divide it by the current share price, then multiply by 100 to express it as a percentage. For example, a stock paying $2 in annual dividends trading at $50 has a 4% dividend yield ($2 ÷ $50 = 0.04 = 4%).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Dividend Yield Matters</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Income Planning:</strong> Helps retirees and income investors calculate expected cash flow from their portfolios.</li>
          <li><strong>Valuation Signal:</strong> A significantly higher yield than peers may indicate undervaluation—or trouble ahead.</li>
          <li><strong>Comparison Tool:</strong> Enables apples-to-apples comparison between different income investments.</li>
          <li><strong>Total Return Component:</strong> Along with price appreciation, yield contributes to total investment returns.</li>
        </ul>
        <hr />

        <h2 id="current-vs-yoc" className="text-2xl font-bold text-foreground pt-8">Current Yield vs. Yield on Cost</h2>
        <p>These two yield metrics serve different purposes and tell different stories about your investment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Current Yield</h3>
        <p>Current yield reflects what a new investor would receive if buying the stock today. It's the standard yield quoted on financial websites and fluctuates daily as the stock price moves. If the stock price rises and the dividend stays constant, current yield falls—and vice versa.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Yield on Cost (YoC)</h3>
        <p>Yield on cost is a personal metric based on your original purchase price. If you bought a stock at $30 that now trades at $60 and pays a $2.40 annual dividend, the current yield is 4% ($2.40/$60), but YOUR yield on cost is 8% ($2.40/$30). This metric grows over time as companies raise dividends, making it a powerful measure of long-term income investing success.</p>

        <p className="mt-4">Consider an investor who bought Coca-Cola stock 20 years ago at $20 per share. With current annual dividends around $1.84 per share, their yield on cost would be 9.2%—far exceeding current market yields—demonstrating the long-term power of dividend growth investing.</p>
        <hr />

        <h2 id="high-yield-trap" className="text-2xl font-bold text-foreground pt-8">The High Yield Trap</h2>
        <p>A common mistake among novice income investors is chasing the highest yields without investigating why they're so high. An abnormally elevated yield is often a warning sign, not an opportunity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Yields Become Unusually High</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Falling Stock Price:</strong> If earnings deteriorate and the stock drops 50%, yield mathematically doubles—but a dividend cut may be imminent.</li>
          <li><strong>Unsustainable Payout:</strong> Companies paying out more than they earn can't maintain dividends indefinitely.</li>
          <li><strong>Sector Distress:</strong> Entire industries sometimes face structural decline (e.g., legacy retail, traditional energy).</li>
          <li><strong>Special Circumstances:</strong> One-time distributions can inflate trailing yield calculations.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Red Flags to Watch</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Yield significantly above sector average (e.g., 8% when peers average 3%)</li>
          <li>Payout ratio exceeding 80% for most sectors (higher for REITs is normal)</li>
          <li>Declining earnings or negative free cash flow</li>
          <li>Rising debt levels with no clear path to reduction</li>
          <li>History of dividend cuts or freezes</li>
        </ul>
        <hr />

        <h2 id="yield-strategies" className="text-2xl font-bold text-foreground pt-8">Dividend Yield Strategies</h2>
        <p>Different investors use yield in different ways depending on their goals and time horizons.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">High Yield Income Strategy</h3>
        <p>Focus on above-average yields (4-6%+) for maximum current income. Common among retirees needing cash flow. Sectors include utilities, REITs, telecoms, and MLPs. Risk: less growth potential and higher chance of dividend cuts.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Dividend Growth Strategy</h3>
        <p>Prioritize companies with strong dividend growth rates (8-12% annually) even if current yields are modest (1.5-3%). The premise: today's 2% yield becomes 4% yield on cost in ~7 years if dividends grow 10% annually. Focuses on companies like Apple, Microsoft, and Visa that have strong earnings growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Balanced Yield Approach</h3>
        <p>Seek moderate yields (3-4%) combined with moderate growth (5-8%). This "sweet spot" balances current income with future growth. Classic examples include Johnson & Johnson, PepsiCo, and Procter & Gamble.</p>
        <hr />

        <h2 id="industry-benchmarks" className="text-2xl font-bold text-foreground pt-8">Industry Yield Benchmarks</h2>
        <p>Dividend yields vary significantly by sector due to different capital requirements, growth profiles, and payout traditions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Typical Yield Ranges by Sector</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Utilities:</strong> 3-4% — Regulated earnings and stable cash flows support higher payouts.</li>
          <li><strong>REITs:</strong> 4-6% — Required to distribute 90% of taxable income.</li>
          <li><strong>Consumer Staples:</strong> 2.5-3.5% — Steady demand supports reliable dividends.</li>
          <li><strong>Healthcare:</strong> 1.5-3% — Balance between dividends and R&D investment.</li>
          <li><strong>Technology:</strong> 0.5-1.5% — Growth-oriented, often minimal dividends.</li>
          <li><strong>Financials:</strong> 2-4% — Banks and insurers historically strong dividend payers.</li>
        </ul>

        <p className="mt-4">Always compare a stock's yield to its sector peers rather than the market as a whole. A 3% yield is exceptional for tech but below average for utilities.</p>
        <hr />

        <h2 id="yield-and-growth" className="text-2xl font-bold text-foreground pt-8">Yield vs. Dividend Growth</h2>
        <p>One of the most important concepts in income investing is the tradeoff between current yield and dividend growth potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Power of Growth</h3>
        <p>A 2% yield growing at 10% annually will produce more cumulative income over 20 years than a static 5% yield. This is counterintuitive but mathematical: the growing dividend eventually surpasses the static one and keeps climbing.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Match Strategy to Time Horizon</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Short-term (0-5 years):</strong> Higher current yield may make more sense if you need income now.</li>
          <li><strong>Medium-term (5-15 years):</strong> Balanced approach captures both current income and growth benefits.</li>
          <li><strong>Long-term (15+ years):</strong> Dividend growth becomes increasingly powerful through compounding.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Dividend yield is a fundamental metric for income-focused investors, providing a snapshot of the income return on investment at any given price point. Understanding both current yield and yield on cost helps investors evaluate opportunities and track long-term success.</p>
        <p className="mt-4">The most successful dividend investors look beyond yield alone, considering dividend growth rates, payout sustainability, business quality, and valuation. Whether you prioritize high current income or growing future income depends on your personal financial goals and time horizon.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about dividend yield</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is dividend yield and how is it calculated?</h4>
            <p className="text-muted-foreground">
              Dividend yield is a financial ratio that shows the annual dividend income as a percentage of the stock price. The formula is: Annual Dividend per Share ÷ Current Share Price × 100. For example, a stock paying $3 annually trading at $60 has a 5% yield. This metric helps investors compare income potential across different investments and understand what cash return to expect from dividends alone.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is yield on cost and why does it matter?</h4>
            <p className="text-muted-foreground">
              Yield on cost (YoC) calculates your dividend yield based on your original purchase price rather than the current market price. If your cost basis is $40 and annual dividends are $2.40, your YoC is 6% even if current yield is only 3% (at $80 share price). This metric matters because it shows the true income return on your actual investment and demonstrates how dividend growth compounds your personal yield over time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is a higher dividend yield always better?</h4>
            <p className="text-muted-foreground">
              No, and this is a critical concept for dividend investors. Abnormally high yields often signal distress—perhaps the stock price has crashed due to deteriorating fundamentals, and a dividend cut may be imminent. A yield well above sector peers (e.g., 10% when similar companies pay 3%) warrants investigation. Look at payout ratio, earnings trends, debt levels, and dividend history before chasing high yields.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why does dividend yield change over time?</h4>
            <p className="text-muted-foreground">
              Dividend yield changes whenever the stock price moves or the dividend amount changes. If a stock rises from $50 to $60 while maintaining a $2 dividend, yield falls from 4% to 3.3%. Conversely, if a company raises its dividend from $2 to $2.20, yield increases. This dynamic relationship means investors should focus on both the yield AND the factors driving price and dividend changes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do special dividends affect yield calculations?</h4>
            <p className="text-muted-foreground">
              Special (one-time) dividends can distort trailing twelve-month yield calculations by making them appear higher than sustainable. When evaluating yield, focus on the "indicated annual dividend" or "forward yield," which projects regular dividends into the future. Special dividends are typically excluded from these calculations since they're not recurring income you can depend on.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does inflation affect dividend income?</h4>
            <p className="text-muted-foreground">
              Inflation erodes the purchasing power of fixed income, including dividends. A 3% yield loses real value if inflation runs 4%. This is why dividend growth is crucial—companies that consistently raise dividends above the inflation rate help preserve and grow your real purchasing power. Dividend Aristocrats (25+ years of consecutive increases) have historically grown dividends faster than inflation.
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
          <p>The Dividend Yield Calculator computes both current yield and yield on cost, helping investors understand income returns on their investments.</p>
          <p>Current yield shows what new buyers would receive, while yield on cost reveals your personal return based on your purchase price.</p>
          <p>Use this tool to compare income opportunities, track your growing yield on cost over time, and make informed dividend investment decisions.</p>
        </CardContent>
      </Card>
    </div>
  );
}


