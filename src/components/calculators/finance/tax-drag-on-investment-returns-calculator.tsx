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
  nominalReturnPct: z.number(),
  dividendYieldPct: z.number().min(0).max(100, 'Enter 0â€“100'),
  taxRateDividendsPct: z.number().min(0).max(100, 'Enter 0â€“100'),
  taxRateCapGainsPct: z.number().min(0).max(100, 'Enter 0â€“100'),
  years: z.number().min(0).optional(),
  initialAmount: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Tax Drag on Investment Returns Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how taxes reduce your investment return. Enter nominal return, dividend yield, and tax rates on dividends and capital gainsâ€”get after-tax return and optional FV impact.',
      url: 'https://mycalculating.com/finance/tax-drag-on-investment-returns-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function TaxDragOnInvestmentReturnsCalculator() {
  const [result, setResult] = useState<{
    taxDragPct: number;
    afterTaxReturnPct: number;
    fvNominal: number | null;
    fvAfterTax: number | null;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalReturnPct: 7,
      dividendYieldPct: 2,
      taxRateDividendsPct: 20,
      taxRateCapGainsPct: 15,
      years: undefined,
      initialAmount: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const nominal = (v.nominalReturnPct ?? 0) / 100;
    const divYield = (v.dividendYieldPct ?? 0) / 100;
    const taxDiv = (v.taxRateDividendsPct ?? 0) / 100;
    const taxCG = (v.taxRateCapGainsPct ?? 0) / 100;
    const capGainComponent = Math.max(0, nominal - divYield);
    const taxDragDecimal = divYield * taxDiv + capGainComponent * taxCG;
    const taxDragPct = taxDragDecimal * 100;
    const afterTaxReturnPct = (nominal - taxDragDecimal) * 100;

    const years = v.years != null && v.years > 0 ? Math.floor(v.years) : null;
    const initial = v.initialAmount != null && v.initialAmount > 0 ? v.initialAmount : null;
    let fvNominal: number | null = null;
    let fvAfterTax: number | null = null;
    if (years != null && years > 0) {
      const amt = initial ?? 10000;
      fvNominal = amt * Math.pow(1 + nominal, years);
      fvAfterTax = amt * Math.pow(1 + (nominal - taxDragDecimal), years);
    }

    let recommendation = '';
    recommendation = `A ${v.nominalReturnPct}% nominal return with ${v.dividendYieldPct}% dividend yield and your tax rates gives an annual tax drag of ${taxDragPct.toFixed(2)}% and an after-tax return of ${afterTaxReturnPct.toFixed(2)}%. Taxes reduce your effective return by ${taxDragPct.toFixed(2)} percentage points per year. Consider tax-advantaged accounts (IRA, 401k) or tax-efficient investments to reduce drag.`;
    if (fvNominal != null && fvAfterTax != null && initial != null) {
      const diff = fvNominal - fvAfterTax;
      recommendation += ` Over ${years} years on $${initial.toLocaleString(undefined, { maximumFractionDigits: 0 })}, tax drag costs you about $${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })} in future value ($${fvNominal.toLocaleString(undefined, { maximumFractionDigits: 0 })} nominal vs $${fvAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })} after-tax).`;
    }

    const insights: string[] = [];
    insights.push(`Tax drag = (Dividend yield Ã— Tax on dividends) + (Capital gain component Ã— Tax on cap gains) = ${taxDragPct.toFixed(2)}% per year.`);
    insights.push(`After-tax return = Nominal return âˆ’ Tax drag = ${afterTaxReturnPct.toFixed(2)}%. Your portfolio grows at this rate after taxes in a taxable account.`);
    if (fvNominal != null && fvAfterTax != null) {
      const diff = fvNominal - fvAfterTax;
      insights.push(`Over ${years} years: nominal FV â‰ˆ $${fvNominal.toLocaleString(undefined, { maximumFractionDigits: 0 })}, after-tax FV â‰ˆ $${fvAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Tax drag cost â‰ˆ $${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    }
    insights.push('Higher dividend yield and higher tax rates increase drag. Tax-advantaged accounts (IRA, 401k) avoid this drag; use taxable accounts for tax-efficient holdings when possible.');

    return {
      taxDragPct,
      afterTaxReturnPct,
      fvNominal,
      fvAfterTax,
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
      <Script id="tax-drag-on-investment-returns-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tax Drag on Investment Returns
          </CardTitle>
          <CardDescription>
            See how taxes reduce your investment return. Enter nominal return, dividend yield, and tax rates on dividends and capital gains. Get after-tax return and optional future value impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="nominalReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dividendYieldPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dividend Yield (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={0.5} placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="taxRateDividendsPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate on Dividends (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="taxRateCapGainsPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate on Capital Gains (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years (optional, for FV)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="initialAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Amount $ (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value !== '' ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Tax Drag
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
                  <CardDescription>Tax drag and after-tax return</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Tax drag: {result.taxDragPct.toFixed(2)}% per year â†’ After-tax return: {result.afterTaxReturnPct.toFixed(2)}%
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Tax Drag (%)</p>
                  <p className="text-lg font-bold">{result.taxDragPct.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Per year</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">After-Tax Return (%)</p>
                  <p className="text-lg font-bold">{result.afterTaxReturnPct.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Effective growth rate</p>
                </div>
                {result.fvNominal != null && result.fvAfterTax != null && (
                  <>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                      <p className="font-semibold">FV (Nominal)</p>
                      <p className="text-lg font-bold">${result.fvNominal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="font-semibold">FV (After-Tax)</p>
                      <p className="text-lg font-bold">${result.fvAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </>
                )}
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
              <CardDescription>Why tax drag matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Tax drag is the reduction in your return due to taxes on dividends and (when realized) capital gains. In a taxable account, you don&apos;t keep the full nominal returnâ€”you keep the after-tax return.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Tax drag â‰ˆ (Dividend yield Ã— Tax on dividends) + (Capital gain component Ã— Tax on cap gains). Dividends are often taxed yearly; capital gains when realized (this calculator assumes annual realization for simplicity).</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Higher dividend yield and higher tax rates increase drag. Tax-advantaged accounts (IRA, 401k) have no tax drag on growth until withdrawal. Use taxable accounts for tax-efficient holdings (e.g. growth stocks, index funds with low turnover).</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Over long horizons, even a 1% annual tax drag compounds into a large difference in future value. Use this calculator to see the dollar impact and to justify holding bonds in tax-advantaged and equities in taxable (or vice versa depending on your tax rates).</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations
              </CardTitle>
              <CardDescription>Limitations of the model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Capital gains are assumed realized annually for the drag calculation. In practice, unrealized gains are not taxed until sale; the drag may be lower if you hold for a long time.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Qualified dividends may be taxed at long-term capital gain rates; use that rate for dividend tax if applicable. Non-qualified dividends taxed as ordinary incomeâ€”use your ordinary rate.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">State and local taxes may apply; add them to your federal rate for total tax drag. This calculator does not model NIIT or other surtaxes.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Pair with the Long-Term vs Short-Term Capital Gain Comparison calculator for one-time sale tax, and with tax-equivalent yield for bond vs taxable comparison.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Tax Drag
          </CardTitle>
          <CardDescription>How taxes reduce your effective return</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Nominal return</h4>
              <p className="text-sm text-muted-foreground mb-3">The stated or headline return (e.g. 7% per year). Before taxes. In a taxable account, you don&apos;t keep all of itâ€”dividends and realized gains are taxed.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>What you see in performance reports and fund fact sheets.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Taxable accounts: nominal return is reduced by tax drag.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Tax-advantaged (IRA, 401k): no drag until withdrawal.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use after-tax return for taxable account planning.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Tax drag</h4>
              <p className="text-sm text-muted-foreground mb-3">The percentage points of return lost to taxes each year. Tax drag = (Dividend yield Ã— Tax on dividends) + (Capital gain component Ã— Tax on cap gains). After-tax return = Nominal âˆ’ Tax drag.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Higher dividend yield â†’ more taxed yearly â†’ higher drag.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Higher tax rates â†’ higher drag.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Over decades, drag compounds into a large FV difference.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Reduce drag: tax-advantaged accounts, tax-efficient funds.</span>
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
            <p className="font-mono text-sm text-center">Tax drag = (Dividend yield Ã— Tax rate on dividends) + (Capital gain component Ã— Tax rate on cap gains)</p>
            <p className="font-mono text-sm text-center">Capital gain component = max(0, Nominal return âˆ’ Dividend yield)</p>
            <p className="font-mono text-sm text-center">After-tax return = Nominal return âˆ’ Tax drag</p>
            <p className="font-mono text-sm text-center">FV after-tax = Initial Ã— (1 + After-tax return)^years</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dividends are assumed taxed each year at your dividend tax rate. The remainder of the return (capital gain component) is assumed taxed at your capital gain rateâ€”in practice, unrealized gains are not taxed until sale, so this is a simplified annual drag.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Over long horizons, the after-tax return compounds; the difference between nominal and after-tax FV grows. Use this calculator to see the dollar impact of tax drag and to compare taxable vs tax-advantaged placement.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Tax and return tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/long-term-vs-short-term-capital-gain-comparison-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Long-Term vs Short-Term Capital Gain</p>
                      <p className="text-sm text-muted-foreground">Compare after-tax on sale</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tax-equivalent-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Tax-Equivalent Yield</p>
                      <p className="text-sm text-muted-foreground">After-tax yield comparison</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return</p>
                      <p className="text-sm text-muted-foreground">Real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
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
            <Link href="/capital-gain-loss-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Capital Gain/Loss</p>
                      <p className="text-sm text-muted-foreground">Gain or loss on sale</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Compound annual growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Tax Drag on Investment Returns Calculator" />
        <meta itemProp="description" content="See how taxes reduce your investment return. Enter nominal return, dividend yield, and tax ratesâ€”get after-tax return and optional FV impact." />
        <meta itemProp="keywords" content="tax drag, after-tax return, investment tax, dividend tax, capital gain tax" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/tax-drag-on-investment-returns-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Tax Drag on Investment Returns: How Taxes Reduce Your Effective Return</h1>
        <p className="text-lg italic text-muted-foreground">In a taxable account, you don&apos;t keep the full nominal returnâ€”you pay tax on dividends and, when realized, on capital gains. Tax drag is the reduction in your return due to those taxes. This calculator shows your annual tax drag and after-tax return, and optionally the future value impact over time.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-tax-drag" className="hover:underline">What Is Tax Drag?</a></li>
          <li><a href="#how-calculated-tax-drag" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-tax-drag" className="hover:underline">Why It Matters</a></li>
          <li><a href="#using-tax-drag" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-tax-drag" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-tax-drag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Tax Drag?</h2>
        <p>Tax drag is the percentage of your return that is lost to taxes each year. In a taxable account, dividends are typically taxed when paid, and capital gains when realized. So your effective (after-tax) return is lower than the nominal (pre-tax) return. The difference is the tax drag.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Dividends vs Capital Gains</h3>
        <p>Dividends are usually taxed in the year received (at ordinary or qualified dividend rates). Capital gains are taxed when you sell. This calculator uses a simplified model: it applies the capital gain tax rate to the &quot;capital gain component&quot; of return (nominal return minus dividend yield) each year to approximate annual drag. In reality, unrealized gains are not taxed until sale.</p>
        <hr />

        <h2 id="how-calculated-tax-drag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Tax drag = (Dividend yield Ã— Tax rate on dividends) + (Capital gain component Ã— Tax rate on capital gains). Capital gain component = max(0, Nominal return âˆ’ Dividend yield). After-tax return = Nominal return âˆ’ Tax drag. If you enter years and initial amount, FV after-tax = Initial Ã— (1 + After-tax return)^years.</p>
        <hr />

        <h2 id="why-it-matters-tax-drag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Over long horizons, even a 1% annual tax drag compounds into a large difference in future value. Holding tax-inefficient investments (e.g. high-dividend, high-turnover) in taxable accounts increases drag. Use tax-advantaged accounts (IRA, 401k) for bonds and high-dividend stocks when possible, and taxable for tax-efficient growth.</p>
        <hr />

        <h2 id="using-tax-drag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter nominal return (%), dividend yield (%), tax rate on dividends (%), and tax rate on capital gains (%). Optionally enter years and initial amount to see FV with and without tax drag. Use your marginal rates (federal + state if applicable). For qualified dividends, use your long-term capital gain rate for dividend tax.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Nominal return = expected total return (e.g. 7% for a diversified portfolio). Dividend yield = annual dividend yield (e.g. 2%). Tax on dividends = your rate on dividend income (ordinary or qualified). Tax on cap gains = your long-term capital gain rate. Add state tax to both if you want total drag.</p>
        <hr />

        <h2 id="conclusion-tax-drag" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Tax drag reduces your effective return in taxable accounts. This calculator shows the annual drag and after-tax return, and optionally the future value impact. Use it to see how much taxes cost you over time and to justify tax-advantaged account placement and tax-efficient fund selection.</p>
        <p>Pair it with the Long-Term vs Short-Term Capital Gain Comparison calculator for one-time sale tax, and with tax-equivalent yield for bond comparisons.</p>
        <p>In summary: tax drag reduces your effective return in taxable accounts. This calculator shows the annual drag and after-tax return, and optionally the future value impact, so you can see how much taxes cost you over time and justify tax-advantaged placement.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about tax drag</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is tax drag?</h4>
            <p className="text-muted-foreground">The reduction in your investment return due to taxes on dividends and capital gains. Tax drag (in percentage points) is the amount by which your after-tax return is lower than your nominal return each year.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is it calculated?</h4>
            <p className="text-muted-foreground">Tax drag = (Dividend yield Ã— Tax on dividends) + (Capital gain component Ã— Tax on cap gains). Capital gain component = nominal return âˆ’ dividend yield (if positive). After-tax return = Nominal âˆ’ Tax drag.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why use capital gain tax for the growth part?</h4>
            <p className="text-muted-foreground">The part of return that is not dividends is assumed to be capital appreciation. When realized (we assume annually for simplicity), it is taxed at the capital gain rate. In practice, unrealized gains are not taxed until saleâ€”this calculator gives an approximate annual drag.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my dividends are qualified?</h4>
            <p className="text-muted-foreground">Qualified dividends are taxed at long-term capital gain rates. Use your long-term cap gain rate for &quot;tax rate on dividends&quot; in that case. Non-qualified dividends use your ordinary income rate.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this apply to IRA and 401(k)?</h4>
            <p className="text-muted-foreground">No. In tax-advantaged accounts, growth is not taxed until withdrawal. Tax drag applies to taxable accounts. Use this calculator to see the cost of holding the same investment in a taxable account vs tax-advantaged.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What rate should I use for dividends?</h4>
            <p className="text-muted-foreground">Your marginal tax rate on dividend incomeâ€”ordinary rate for non-qualified dividends, or long-term capital gain rate (0%, 15%, 20%) for qualified dividends. Add state tax if applicable.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does tax drag compound?</h4>
            <p className="text-muted-foreground">Each year you earn the after-tax return, not the nominal return. So FV after-tax = Initial Ã— (1 + after-tax return)^years. The gap between nominal FV and after-tax FV grows with time.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I reduce tax drag?</h4>
            <p className="text-muted-foreground">Hold tax-inefficient investments (bonds, high-dividend stocks) in IRA/401k when possible. Use taxable accounts for tax-efficient holdings (growth stocks, index funds with low turnover and low dividends). Tax-loss harvesting can also help.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to long-term vs short-term capital gain?</h4>
            <p className="text-muted-foreground">Tax drag is about ongoing taxes on returns (dividends and assumed annual realization of gains). Long-term vs short-term is about the one-time tax when you sell. Use both: tax drag for multi-year impact in taxable accounts; long-term vs short-term for sale timing.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Who should use this calculator?</h4>
            <p className="text-muted-foreground">Anyone with taxable investments who wants to see how much taxes reduce their effective return and future value. Advisors and educators can use it to show the benefit of tax-advantaged accounts and tax-efficient placement.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my dividend yield is higher than my nominal return?</h4>
            <p className="text-muted-foreground">Then the capital gain component is zero (we use max(0, nominal âˆ’ dividend yield)). Tax drag = dividend yield Ã— tax on dividends only. That can happen in high-dividend, low-growth scenarios (e.g. some bond funds or REITs).</p>
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
                <strong className="block text-primary mb-1">Taxable Account Investors</strong>
                <span className="text-sm text-muted-foreground">To see how much taxes reduce your effective return and FV over time.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To show clients the benefit of tax-advantaged accounts and tax-efficient fund placement.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Asset Location Planners</strong>
                <span className="text-sm text-muted-foreground">To compare drag for different investments and to decide what to hold in taxable vs IRA/401k.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement & Long-Term Savers</strong>
                <span className="text-sm text-muted-foreground">To quantify the cost of holding the same investment in taxable vs tax-advantaged over decades.</span>
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
                <span><strong>Annual realization:</strong> Capital gain component is assumed taxed annually; unrealized gains are not taxed until sale, so actual drag may be lower for buy-and-hold.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant rates:</strong> Assumes same return and tax rates each year; actual rates and returns vary.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No state/NIIT:</strong> Add state tax and NIIT to your rates for total drag if applicable.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Single investment:</strong> For a portfolio, use a weighted average nominal return and dividend yield, and your blended tax rates.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: 7% nominal, 2% dividend, 20% div tax, 15% CG tax</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Tax drag = 2%Ã—20% + 5%Ã—15% = 0.4% + 0.75% = 1.15%. After-tax return = 5.85%. Over 20 years on $100k, nominal FV â‰ˆ $387k, after-tax â‰ˆ $312kâ€”tax drag costs about $75k.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: High dividend, high tax</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">4% nominal, 3% dividend, 32% div tax, 20% CG tax: drag = 3%Ã—32% + 1%Ã—20% = 1.16%. After-tax return = 2.84%. High-dividend in taxable with high rates creates large drag.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: Growth stock, low dividend</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">10% nominal, 0.5% dividend, 20% div tax, 15% CG tax: drag = 0.1% + 1.43% = 1.53%. After-tax = 8.47%. Low dividend reduces dragâ€”tax-efficient for taxable accounts.</p>
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
          <p className="text-muted-foreground">This calculator shows how taxes reduce your investment return (tax drag) and your after-tax return. You enter nominal return, dividend yield, tax rate on dividends, and tax rate on capital gains; optionally years and initial amount to see FV impact. Use it to see the dollar cost of tax drag over time and to justify tax-advantaged account placement and tax-efficient fund selection. Pair it with the Long-Term vs Short-Term Capital Gain Comparison calculator for one-time sale tax.</p>
        </CardContent>
      </Card>
    </div>
  );
}
