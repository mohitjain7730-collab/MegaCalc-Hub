'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Info, Calculator, TrendingUp, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  costBasis: z.number().min(0, 'Enter cost basis'),
  salePrice: z.number().min(0, 'Enter sale price'),
  shortTermRatePct: z.number().min(0).max(100, 'Enter 0â€“100'),
  longTermRatePct: z.number().min(0).max(100, 'Enter 0â€“100'),
}).refine((data) => data.salePrice > 0 || data.costBasis > 0, {
  message: 'Enter cost basis and sale price',
  path: ['salePrice'],
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Long-Term vs Short-Term Capital Gain Comparison Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Compare after-tax proceeds from selling an asset as long-term vs short-term capital gain. See how much more you keep with long-term rates.',
      url: 'https://mycalculating.com/finance/long-term-vs-short-term-capital-gain-comparison-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function LongTermVsShortTermCapitalGainComparisonCalculator() {
  const [result, setResult] = useState<{
    gain: number;
    taxShortTerm: number;
    taxLongTerm: number;
    afterTaxShortTerm: number;
    afterTaxLongTerm: number;
    benefitOfLongTerm: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costBasis: undefined,
      salePrice: undefined,
      shortTermRatePct: 32,
      longTermRatePct: 15,
    },
  });

  const calculate = (v: FormValues) => {
    const basis = v.costBasis ?? 0;
    const sale = v.salePrice ?? 0;
    const gain = sale - basis;
    const shortRate = (v.shortTermRatePct ?? 0) / 100;
    const longRate = (v.longTermRatePct ?? 0) / 100;
    if (sale <= 0 && basis <= 0) return null;

    const taxShortTerm = gain > 0 ? gain * shortRate : 0;
    const taxLongTerm = gain > 0 ? gain * longRate : 0;
    const afterTaxShortTerm = gain - taxShortTerm;
    const afterTaxLongTerm = gain - taxLongTerm;
    const benefitOfLongTerm = afterTaxLongTerm - afterTaxShortTerm;

    let recommendation = '';
    if (gain <= 0) {
      recommendation = `You have a capital loss of $${Math.abs(gain).toLocaleString(undefined, { maximumFractionDigits: 0 })}. Losses can offset gains; consult a tax advisor. This calculator compares tax on gainsâ€”when there is a gain, long-term rates usually save you money.`;
    } else {
      recommendation = `Long-term treatment saves you $${benefitOfLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} in tax (you keep $${afterTaxLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs $${afterTaxShortTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} if short-term). If you are close to the long-term holding period (e.g. 1 year), consider waiting to qualify for long-term rates.`;
    }

    const insights: string[] = [];
    insights.push(`Capital gain = Sale price âˆ’ Cost basis = $${gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    if (gain > 0) {
      insights.push(`Short-term tax at ${v.shortTermRatePct}%: $${taxShortTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}. After-tax (short-term): $${afterTaxShortTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
      insights.push(`Long-term tax at ${v.longTermRatePct}%: $${taxLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}. After-tax (long-term): $${afterTaxLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
      insights.push(`Benefit of long-term: $${benefitOfLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${((benefitOfLongTerm / gain) * 100).toFixed(0)}% of the gain). Long-term rates are typically lower than ordinary income ratesâ€”holding until you qualify can save significant tax.`);
    } else {
      insights.push('No gainâ€”capital loss. Losses may offset gains or income (subject to limits); this calculator focuses on comparing tax when you have a gain.');
    }

    return {
      gain,
      taxShortTerm,
      taxLongTerm,
      afterTaxShortTerm,
      afterTaxLongTerm,
      benefitOfLongTerm,
      recommendation,
      insights,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      <Script id="long-term-vs-short-term-capital-gain-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Long-Term vs Short-Term Capital Gain Comparison
          </CardTitle>
          <CardDescription>
            Compare after-tax proceeds from selling an asset as a long-term vs short-term capital gain. Enter cost basis, sale price, and your short-term (ordinary income) and long-term capital gain tax rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="costBasis" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Basis ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shortTermRatePct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short-Term Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} placeholder="e.g., 32" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="longTermRatePct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long-Term Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Compare Long-Term vs Short-Term
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>After-tax proceeds: short-term vs long-term</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.gain > 0 && result.benefitOfLongTerm > 0 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {result.gain > 0 ? `Long-term saves $${result.benefitOfLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `Capital loss $${Math.abs(result.gain).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Capital Gain</p>
                  <p className="text-lg font-bold">${result.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">After-Tax (Short-Term)</p>
                  <p className="text-lg font-bold">${result.afterTaxShortTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">After-Tax (Long-Term)</p>
                  <p className="text-lg font-bold">${result.afterTaxLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Benefit of Long-Term</p>
                  <p className="text-lg font-bold">${result.benefitOfLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">Insights</h4>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Target className="h-6 w-6" />
                Key Takeaways
              </CardTitle>
              <CardDescription>Why long-term vs short-term matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">In many jurisdictions, long-term capital gains (e.g. holding &gt;1 year) are taxed at lower rates than short-term gains (taxed as ordinary income). The same gain can result in very different after-tax proceeds.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Benefit of long-term = (After-tax long-term) âˆ’ (After-tax short-term). The higher your ordinary income rate and the lower the long-term rate, the larger the benefit of waiting to qualify for long-term.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">If you are close to the long-term holding period (e.g. 1 year from purchase), delaying the sale by a short time can save a significant amount in tax. Weigh that against market risk (price could fall).</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Use your marginal tax rate for short-term (ordinary income) and your applicable long-term capital gain rate (e.g. 0%, 15%, or 20% federally in the US). State and local taxes may applyâ€”add them to get total rate.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations
              </CardTitle>
              <CardDescription>Limitations and tax nuances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">This calculator uses a single rate for short-term and long-term. In practice, marginal rates and brackets (e.g. 0%, 15%, 20% long-term) depend on incomeâ€”use your effective rate for the gain.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">State and local capital gain taxes may apply. Add them to your federal rate for a total rate, or run the calculator with federal-only and state-only separately.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Net investment income tax (NIIT) and other surtaxes can apply. This tool does not model thoseâ€”use your all-in rate if you know it.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Capital losses can offset gains; this calculator does not model loss carryforward or loss harvesting. For complex situations, consult a tax advisor.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Long-Term vs Short-Term Capital Gains
          </CardTitle>
          <CardDescription>How holding period affects tax</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">Short-term capital gain</h4>
              <p className="text-sm text-muted-foreground mb-3">Gain on an asset held one year or less. Typically taxed as ordinary income at your marginal rate (e.g. 22%, 32%, 37% federally).</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Higher tax rate in most cases.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Same rate as wages, interest, short-term investment income.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>If you sell before the long-term threshold, you pay short-term rates.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Use marginal ordinary income rate for comparison.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Long-term capital gain</h4>
              <p className="text-sm text-muted-foreground mb-3">Gain on an asset held more than one year (in the US). Taxed at preferential long-term rates (e.g. 0%, 15%, 20% federally).</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Lower tax rateâ€”you keep more of the gain.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Holding period typically &gt;1 year from purchase (or last add).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>If you are close to 1 year, waiting can save significant tax.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use your applicable long-term rate (0%, 15%, or 20% federal).</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">Capital gain = Sale price âˆ’ Cost basis</p>
            <p className="font-mono text-sm text-center">Tax (short-term) = Gain Ã— Short-term rate</p>
            <p className="font-mono text-sm text-center">Tax (long-term) = Gain Ã— Long-term rate</p>
            <p className="font-mono text-sm text-center">After-tax = Gain âˆ’ Tax. Benefit of long-term = After-tax (long-term) âˆ’ After-tax (short-term)</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Short-term gains are taxed as ordinary income; long-term gains at preferential rates. The same dollar gain produces different after-tax amounts depending on which rate applies. This calculator shows the exact difference for your gain and rates.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            If you have a loss, no tax is due on the loss (and losses may offset gains or income subject to rules). The comparison is most useful when you have a gain and are deciding whether to sell now (short-term) or wait to qualify for long-term.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Tax and investment tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/tax-drag-on-investment-returns-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Tax Drag on Investment Returns</p>
                      <p className="text-sm text-muted-foreground">How taxes reduce returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/capital-gain-loss-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Capital Gain/Loss</p>
                      <p className="text-sm text-muted-foreground">Gain or loss on sale</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/tax-equivalent-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Tax-Equivalent Yield</p>
                      <p className="text-sm text-muted-foreground">After-tax yield comparison</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return</p>
                      <p className="text-sm text-muted-foreground">Real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/break-even-stock-sale-price-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Break-Even Stock Sale Price</p>
                      <p className="text-sm text-muted-foreground">Price to cover costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Long-Term vs Short-Term Capital Gain Comparison Calculator" />
        <meta itemProp="description" content="Compare after-tax proceeds from selling an asset as long-term vs short-term capital gain. See how much more you keep with long-term rates." />
        <meta itemProp="keywords" content="long-term capital gain, short-term capital gain, capital gain tax comparison, after-tax proceeds" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/long-term-vs-short-term-capital-gain-comparison-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Long-Term vs Short-Term Capital Gain: Compare After-Tax Proceeds</h1>
        <p className="text-lg italic text-muted-foreground">When you sell an investment, the tax you pay depends on how long you held it. Short-term gains are typically taxed as ordinary income; long-term gains at lower preferential rates. This calculator compares after-tax proceeds so you can see how much you save by qualifying for long-term treatment.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-lt-st" className="hover:underline">What Are Long-Term vs Short-Term Gains?</a></li>
          <li><a href="#how-calculated-lt-st" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-lt-st" className="hover:underline">Why It Matters</a></li>
          <li><a href="#using-lt-st" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-lt-st" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-lt-st" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Are Long-Term vs Short-Term Gains?</h2>
        <p>Capital gain = sale price minus cost basis. If you held the asset one year or less, the gain is short-term and usually taxed as ordinary income. If you held more than one year, the gain is long-term and taxed at preferential rates (e.g. 0%, 15%, or 20% federally in the US). The same dollar gain can produce very different after-tax amounts.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Holding Period</h3>
        <p>In the US, long-term typically means more than one year from the date of purchase (or from the date of each lot if you have multiple purchases). State rules may differ. This calculator does not determine your holding periodâ€”it compares the tax outcome if your gain is taxed as short-term vs long-term at the rates you enter.</p>
        <hr />

        <h2 id="how-calculated-lt-st" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Gain = Sale price âˆ’ Cost basis. Tax (short-term) = Gain Ã— Short-term rate. Tax (long-term) = Gain Ã— Long-term rate. After-tax short-term = Gain âˆ’ Tax (short-term). After-tax long-term = Gain âˆ’ Tax (long-term). Benefit of long-term = After-tax long-term âˆ’ After-tax short-term.</p>
        <hr />

        <h2 id="why-it-matters-lt-st" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>If you are close to the long-term holding period, waiting to sell can save a significant amount in tax. The benefit depends on the size of the gain and the spread between your short-term and long-term rates. Use this calculator to see the exact dollar benefit and to decide whether to delay the sale (weighing tax savings against market risk).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Weighing Tax vs Market Risk</h3>
        <p>If you are a few weeks from the long-term date, the tax savings of waiting can be large. But if the market drops in the meantime, you could lose more than you save in tax. There is no one-size-fits-all answerâ€”use this calculator to see the dollar benefit of long-term treatment and then decide based on your risk tolerance and view of the asset.</p>
        <hr />

        <h2 id="using-lt-st" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter cost basis (what you paid, adjusted for splits and return of capital if needed), sale price (or expected sale price), your marginal tax rate for ordinary income (short-term rate), and your applicable long-term capital gain rate. The calculator shows gain, tax under each treatment, after-tax proceeds, and the benefit of long-term.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use your top marginal rate for short-term (e.g. 22%, 32%, 37% federal). For long-term, use 0%, 15%, or 20% depending on your income. Add state tax if applicable. For NIIT or other surtaxes, include them in the rate or run separate scenarios.</p>
        <hr />

        <h2 id="conclusion-lt-st" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Long-term capital gains are typically taxed at lower rates than short-term gains. This calculator shows the exact after-tax difference for your gain and rates. Use it to see how much you save by qualifying for long-term treatment and to decide whether to wait to sell when you are close to the holding-period threshold.</p>
        <p>Pair it with the Tax Drag on Investment Returns calculator to see how taxes affect ongoing returns in taxable accounts, and with capital gain/loss tools for full gain/loss reporting.</p>
        <p>In summary: long-term capital gains are typically taxed at lower rates than short-term gains. This calculator shows the exact after-tax difference for your gain and rates so you can decide whether to wait to qualify for long-term treatment.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about long-term vs short-term capital gains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the difference between long-term and short-term capital gain?</h4>
            <p className="text-muted-foreground">Short-term = gain on an asset held one year or less, typically taxed as ordinary income. Long-term = gain on an asset held more than one year, taxed at preferential rates (e.g. 0%, 15%, 20% federal). The same gain produces different after-tax amounts.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is the benefit of long-term calculated?</h4>
            <p className="text-muted-foreground">Benefit = (After-tax long-term) âˆ’ (After-tax short-term). That is the extra amount you keep by having the gain taxed at the long-term rate instead of the short-term rate.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What rate should I use for short-term?</h4>
            <p className="text-muted-foreground">Your marginal tax rate for ordinary income (federal and state if you include state tax). Short-term gains are taxed like wages and interest.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What rate should I use for long-term?</h4>
            <p className="text-muted-foreground">Your applicable long-term capital gain rate (e.g. 0%, 15%, or 20% federal in the US, depending on income). Add state long-term rate if applicable.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have a loss?</h4>
            <p className="text-muted-foreground">This calculator compares tax on gains. If sale price &lt; cost basis, you have a capital loss; no tax on the loss (losses may offset gains or income subject to rules). Enter the numbers and the result will show the loss; the comparison is most useful when you have a gain.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this include state tax?</h4>
            <p className="text-muted-foreground">Only if you add it to the rate. Enter your combined federal + state rate for short-term and long-term, or run federal-only and state-only separately.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is cost basis?</h4>
            <p className="text-muted-foreground">What you paid for the asset (plus certain adjustments like commissions, reinvested dividends for some accounts). Sale price âˆ’ Cost basis = Capital gain (or loss).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I wait to sell to get long-term rates?</h4>
            <p className="text-muted-foreground">If you are close to the long-term holding period (e.g. a few weeks away), use this calculator to see the tax savings. Weigh that against the risk that the price could fall before you sell. There is no one-size-fits-all answer.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to tax drag?</h4>
            <p className="text-muted-foreground">This calculator compares one-time tax on a sale (long-term vs short-term). Tax drag is the ongoing reduction in return from taxes on dividends and realized gains in a taxable account. Use the Tax Drag on Investment Returns calculator for that.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Who should use this calculator?</h4>
            <p className="text-muted-foreground">Anyone selling (or planning to sell) an investment who wants to see how much more they keep if the gain is taxed as long-term vs short-term, and whether it is worth waiting to qualify for long-term rates.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have multiple lots?</h4>
            <p className="text-muted-foreground">Each lot has its own cost basis and holding period. Run the calculator for each lot (or for an average lot) to see the benefit of long-term treatment. When you sell, you can choose which lots to sell (e.g. specific ID) to minimize tax.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors Planning to Sell</strong>
                <span className="text-sm text-muted-foreground">To see how much more you keep if you wait to qualify for long-term capital gain rates vs selling now (short-term).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Tax Planners & Advisors</strong>
                <span className="text-sm text-muted-foreground">To show clients the dollar benefit of long-term treatment and to support timing decisions.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Stock & Fund Sellers</strong>
                <span className="text-sm text-muted-foreground">To compare after-tax proceeds under your short-term vs long-term rate before selling.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Anyone Near the 1-Year Mark</strong>
                <span className="text-sm text-muted-foreground">To quantify the tax savings of waiting a short time to qualify for long-term rates.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Single rate:</strong> Uses one rate per treatment; actual brackets and NIIT can make effective rate different.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No state/local:</strong> Add state and local rates to your inputs if you want total tax.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No loss offset:</strong> Does not model loss carryforward or loss harvesting.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>US-centric:</strong> Long-term threshold (e.g. 1 year) and rates are US; other countries have different rules.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $10k cost, $15k sale, 32% short-term, 15% long-term</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Gain = $5,000. Short-term tax = $1,600, after-tax = $3,400. Long-term tax = $750, after-tax = $4,250. Benefit of long-term = $850 (17% of the gain).</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: Large gain, high ordinary rate</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">$50k gain at 37% short-term vs 20% long-term: short-term tax = $18,500, long-term = $10,000. Benefit of long-term = $8,500. Waiting to qualify can save a large amount on big gains.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: Near 1-year holding period</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">If you are 2 months from the long-term date, use this calculator with your expected sale price and rates. Weigh the tax savings of waiting against the risk that the price drops in the meantime.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
          <CardDescription>Quick recap</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This calculator compares after-tax proceeds from selling an asset as a long-term vs short-term capital gain. You enter cost basis, sale price, short-term tax rate (ordinary income rate), and long-term capital gain rate. It shows the gain, tax under each treatment, after-tax amounts, and the benefit of long-term. Use it to see how much you save by qualifying for long-term rates and to decide whether to wait to sell when you are close to the holding-period threshold. Pair it with the Tax Drag on Investment Returns calculator for ongoing tax impact in taxable accounts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
