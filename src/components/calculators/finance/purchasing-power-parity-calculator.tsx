'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Globe, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  priceDomestic: z.number().min(0).optional(),
  priceForeign: z.number().min(0).optional(),
  spotRate: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchasingPowerParityCalculator() {
  const [result, setResult] = useState<{ impliedRate: number; mispricingPct: number; interp: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { priceDomestic: undefined as unknown as number, priceForeign: undefined as unknown as number, spotRate: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.priceDomestic === undefined || v.priceForeign === undefined || v.spotRate === undefined || v.priceForeign === 0) { setResult(null); return; }
    const implied = v.priceDomestic / v.priceForeign;
    const mis = ((v.spotRate - implied) / implied) * 100;
    const interp = Math.abs(mis) < 1e-6 ? 'At parity: prices imply current spot.' : mis > 0 ? 'Spot above PPP implied rate (domestic overvalued vs foreign).' : 'Spot below PPP implied rate (domestic undervalued).';
    setResult({ impliedRate: implied, mispricingPct: mis, interp, suggestions: ['Use standardized baskets for better PPP comparisons.', 'Beware of taxes, tariffs, and non-tradables that distort PPP.', 'For long-run analysis, compare CPI levels rather than a single good.', 'Use logarithms for growth-rate PPP (relative PPP).'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.0001" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Purchasing Power Parity (PPP) Calculator</CardTitle>
          <CardDescription>Compute PPP-implied exchange rate and mispricing versus spot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="priceDomestic" render={({ field }) => (<FormItem><FormLabel>Price Domestic (in domestic currency)</FormLabel><FormControl>{num('e.g., 5.00', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="priceForeign" render={({ field }) => (<FormItem><FormLabel>Price Foreign (in foreign currency)</FormLabel><FormControl>{num('e.g., 3.50', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="spotRate" render={({ field }) => (<FormItem><FormLabel>Spot Rate (domestic per 1 foreign)</FormLabel><FormControl>{num('e.g., 1.1200', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>PPP comparison</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">PPP-Implied Rate</p><p className="text-2xl font-bold">{result.impliedRate.toFixed(6)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Mispricing vs Spot</p><p className={`text-2xl font-bold ${result.mispricingPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.mispricingPct.toFixed(3)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Valuation analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Large mispricing signals potential long-term mean reversion</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Short-term deviations from PPP can persist for years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>FX and inflation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4><p className="text-sm text-muted-foreground">Context for price levels.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward rate parity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">Currency Exchange</a></h4><p className="text-sm text-muted-foreground">Spot conversions for PPP compare.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-forward-points-calculator" className="text-primary hover:underline">Currency Forward Points</a></h4><p className="text-sm text-muted-foreground">Premium/discount vs spot.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              PPP Rate = Price (Domestic) / Price (Foreign)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The exchange rate implied by price levels of identical goods across countries.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Domestic Price</h4>
              <p className="text-sm text-muted-foreground">Price of the good in domestic currency.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Foreign Price</h4>
              <p className="text-sm text-muted-foreground">Price of the same good in foreign currency.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Spot Rate</h4>
              <p className="text-sm text-muted-foreground">Current market exchange rate for comparison.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Purchasing Power Parity (PPP)</h1>
          <meta itemProp="description" content="Understand Purchasing Power Parity (PPP) and how it determines long-term exchange rates. Compare price levels across countries to identify overvalued or undervalued currencies." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Purchasing Power Parity, PPP, Big Mac Index, Exchange Rates, Currency Valuation, Inflation, Law of One Price, Arbitrage" />

          <p className="text-lg italic text-muted-foreground">Why does a coffee cost $2 in one country and $5 in another? PPP explains how price levels and exchange rates interact over the long run.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Purchasing Power Parity?</h2>
          <p>Purchasing Power Parity (PPP) is an economic theory that states residents of one country should be able to buy the same amount of goods and services for the same amount of money as residents of another country, once you exchange their currencies.</p>
          <p>This is based on the "Law of One Price": in the absence of friction (transport costs, taxes), a widget should cost the same everywhere. If it doesn't, arbitrageurs would buy low and sell high until prices equalized.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The "Big Mac Index" Concept</h2>
          <p>The Economist's famous Big Mac Index is a practical application of PPP. It compares the price of a McDonald's Big Mac across countries. If a Big Mac is cheaper in Japan than in the US (in dollar terms), the Yen is considered "undervalued" relative to the Dollar.</p>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>While PPP rarely holds perfectly in the short term due to trade barriers and non-tradable service costs (like rent and labor), it is a powerful magnet for long-term exchange rate trends. Currencies that are significantly undervalued by PPP tend to appreciate over time.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Expert answers on global pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is PPP?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Purchasing Power Parity (PPP) is the theory that exchange rates should adjust so that a basket of goods has the same real price in different countries.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How is it calculated?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">PPP Rate = Cost of Good (Domestic Currency) / Cost of Good (Foreign Currency). This gives you the "fair value" exchange rate implied by the price difference.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why doesn't PPP hold perfectly?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Three main reasons: 1. Transportation costs (it costs money to move goods). 2. Taxes/Tariffs (governments distort prices). 3. Non-tradables (you can't arbitrage a haircut or an apartment rental across borders).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the Big Mac Index?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">A lighthearted but effective measure of PPP created by The Economist. It uses a Big Mac burger as the "basket of goods" because it is standardized and available globally.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is Relative vs. Absolute PPP?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Absolute PPP compares price levels at a single point in time. Relative PPP compares rates of inflation over time (i.e., the country with higher inflation should see its currency depreciate).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is PPP good for trading?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Not for short-term trading. Currencies can remain "mispriced" relative to PPP for years (e.g., the Swiss Franc is famously overvalued for decades). It works best as a 5-10 year valuation anchor.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the Balassa-Samuelson Effect?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It explains why prices are generally higher in rich countries. High productivity in tradable sectors (manufacturing) raises wages in the whole economy, making non-tradables (services) more expensive, leading to higher overall price levels.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does inflation impact PPP?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">High domestic inflation forces the currency to weaken to maintain legal parity. If prices double but the exchange rate stays the same, domestic goods become unsellable abroad.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is "Mean Reversion" in this context?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">The tendency for exchange rates to eventually move back towards their PPP fair value after deviating. Research suggests the "half-life" of this reversion can be 3-5 years.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What goods should be in the basket?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Ideally, a broad basket of tradable goods similar to the CPI. Using a single good (like an iPad or Big Mac) is simpler but prone to specific supply chain quirks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Purchasing Power Parity (PPP) Calculator accurately identifies long-term currency mispricing by comparing price levels of identical goods across borders. It provides an essential benchmark for valuing currencies beyond short-term market noise.</p></CardContent>
      </Card>
    </div>
  );
}


