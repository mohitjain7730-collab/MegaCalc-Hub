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
import { TrendingUp, Info, Calculator, DollarSign, BarChart3, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  nominalReturnPct: z.number().min(-100).max(200, 'Enter nominal return %'),
  inflationPct: z.number().min(-50).max(100, 'Enter inflation %'),
  years: z.number().min(0).max(100).optional(),
  initialAmount: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Inflation-Adjusted Return Calculator (Real Return)',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Convert nominal (stated) return to real (inflation-adjusted) return. See purchasing power growth and optional future value in today\'s dollars.',
      url: 'https://mycalculating.com/category/finance/inflation-adjusted-return-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function InflationAdjustedReturnCalculator() {
  const [result, setResult] = useState<{
    realReturnPct: number;
    purchasingPowerGrowthPct: number;
    fvNominal: number | null;
    fvReal: number | null;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalReturnPct: undefined,
      inflationPct: undefined,
      years: undefined,
      initialAmount: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const nominal = (v.nominalReturnPct ?? 0) / 100;
    const inflation = (v.inflationPct ?? 0) / 100;
    const years = v.years != null && v.years > 0 ? Math.floor(v.years) : null;
    const initial = v.initialAmount != null && v.initialAmount > 0 ? v.initialAmount : null;
    if (v.nominalReturnPct == null) return null;

    const realReturn = (1 + nominal) / (1 + inflation) - 1;
    const realReturnPct = realReturn * 100;
    const purchasingPowerGrowthPct = realReturnPct;

    let fvNominal: number | null = null;
    let fvReal: number | null = null;
    if (years != null && years > 0) {
      fvNominal = initial != null && initial > 0 ? initial * Math.pow(1 + nominal, years) : Math.pow(1 + nominal, years) * 100;
      fvReal = initial != null && initial > 0 ? initial * Math.pow(1 + realReturn, years) : Math.pow(1 + realReturn, years) * 100;
      if (initial == null) {
        fvNominal = 100 * Math.pow(1 + nominal, years);
        fvReal = 100 * Math.pow(1 + realReturn, years);
      }
    }

    let recommendation = '';
    recommendation = `A ${v.nominalReturnPct}% nominal return with ${v.inflationPct}% inflation gives a real (inflation-adjusted) return of ${realReturnPct.toFixed(2)}%. Your purchasing power grows at ${realReturnPct.toFixed(2)}% per year, not ${v.nominalReturnPct}%.`;
    if (realReturnPct < 0) {
      recommendation += ' Negative real return means your money loses purchasing power over time.';
    }

    const insights: string[] = [];
    insights.push(`Real return = (1 + nominal) ÷ (1 + inflation) − 1 = ${realReturnPct.toFixed(2)}%.`);
    insights.push(`Purchasing power growth = real return = ${realReturnPct.toFixed(2)}% per year.`);
    if (years != null && years > 0 && fvNominal != null && fvReal != null) {
      const startVal = initial ?? 100;
      insights.push(`After ${years} years: $${startVal} grows to $${fvNominal.toFixed(0)} in nominal terms but only $${fvReal.toFixed(0)} in today's purchasing power (real terms).`);
      if (inflation > 0) {
        insights.push(`Inflation of ${v.inflationPct}% per year erodes the nominal gain; the real amount is what matters for buying power.`);
      }
    }

    return {
      realReturnPct,
      purchasingPowerGrowthPct: realReturnPct,
      fvNominal,
      fvReal,
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
      <Script id="inflation-adjusted-return-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inflation-Adjusted Return (Real Return)
          </CardTitle>
          <CardDescription>
            Convert nominal (stated) return to real (inflation-adjusted) return. Enter nominal return %, inflation %, and optionally years and initial amount to see future value in today&apos;s dollars.
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
                      <Input type="number" step={0.1} placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="inflationPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inflation Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.1} placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) !== undefined && e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="initialAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Amount $ (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) !== undefined && e.target.value !== '' ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Real Return
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
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Real (inflation-adjusted) return</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.realReturnPct >= 0 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                  Real return: {result.realReturnPct.toFixed(2)}% per year
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Real Return</p>
                  <p className="text-lg font-bold">{result.realReturnPct.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Purchasing power growth</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Purchasing Power Growth</p>
                  <p className="text-lg font-bold">{result.purchasingPowerGrowthPct.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Per year (same as real return)</p>
                </div>
                {result.fvNominal != null && result.fvReal != null && (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold">FV in Today&apos;s $</p>
                    <p className="text-lg font-bold">${result.fvReal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground">Nominal FV: ${result.fvNominal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
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
              <CardDescription>Why real return matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Nominal return is the stated return (e.g. 7%); real return is after inflation and shows true purchasing power growth.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Formula: Real return = (1 + nominal) ÷ (1 + inflation) − 1. Approximate: real ≈ nominal − inflation when both are small.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">When inflation is high, real return can be much lower than nominal or even negative—your money grows in dollars but loses purchasing power.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Use real return to compare investments and to plan retirement or long-term goals in today&apos;s dollars.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations When Using Real Return
              </CardTitle>
              <CardDescription>Factors to keep in mind when interpreting inflation-adjusted returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Nominal and inflation rates are assumed constant; in reality both vary from year to year—use long-term averages for planning.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Personal inflation (e.g. healthcare, housing) may differ from headline CPI; adjust the inflation input if your spending basket is different.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Real return does not include taxes; for after-tax real return, use after-tax nominal return in the formula.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">When inflation is high or volatile, the approximation real ≈ nominal − inflation can be inaccurate; use the exact formula.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Inflation-Adjusted Return (Real Return)
          </CardTitle>
          <CardDescription>Nominal vs real return and purchasing power</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Nominal return</h4>
              <p className="text-sm text-muted-foreground mb-3">The stated or headline return (e.g. 7% per year). It does not account for inflation. Your balance grows at the nominal rate, but prices may also rise.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>What you see in account statements and most performance reports.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Does not reflect how much more (or less) you can buy with the money.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use for raw growth; use real return for purchasing power.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>FV in nominal terms = P × (1 + nominal)^n.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Real return (inflation-adjusted)</h4>
              <p className="text-sm text-muted-foreground mb-3">The return after adjusting for inflation. It measures how much your purchasing power grows. Real return = (1 + nominal) ÷ (1 + inflation) − 1.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Shows true growth in buying power (today&apos;s dollars).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>When inflation &gt; nominal return, real return is negative.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use for retirement and long-term planning in today&apos;s dollars.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>FV in real terms = P × (1 + real)^n (today&apos;s purchasing power).</span>
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
            <p className="font-mono text-sm text-center">Real return = (1 + nominal return) ÷ (1 + inflation rate) − 1</p>
            <p className="font-mono text-sm text-center">Purchasing power growth = real return (same)</p>
            <p className="font-mono text-sm text-center">FV in real terms = Initial × (1 + real return)^years</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The exact formula divides (1 + nominal) by (1 + inflation); the approximation real ≈ nominal − inflation works when both rates are small. Real return is the growth rate of purchasing power.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            When both nominal and inflation are expressed as decimals (e.g. 0.07 and 0.03), real return = (1.07 ÷ 1.03) − 1 ≈ 0.0388, or 3.88%. Multiply by 100 for percentage. For negative nominal or deflation, the same formula applies.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Return and inflation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/investment-delay-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Investment Delay Cost</p>
                      <p className="text-sm text-muted-foreground">Cost of waiting to invest</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/breakeven-inflation-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Breakeven Inflation Rate</p>
                      <p className="text-sm text-muted-foreground">TIPS vs nominal bonds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cost-of-delaying-savings-by-1-year-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Cost of Delaying Savings by 1 Year</p>
                      <p className="text-sm text-muted-foreground">Impact of 1-year wait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sip-vs-lump-sum-return-difference-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">SIP vs Lump Sum Return Difference</p>
                      <p className="text-sm text-muted-foreground">Lump sum vs SIP FV</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Compound annual growth rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Inflation-Adjusted Return Calculator (Real Return): Nominal to Real Return" />
        <meta itemProp="description" content="Convert nominal return to real (inflation-adjusted) return. See purchasing power growth and future value in today's dollars." />
        <meta itemProp="keywords" content="inflation-adjusted return, real return calculator, nominal vs real return, purchasing power, inflation adjustment" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/category/finance/inflation-adjusted-return-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Inflation-Adjusted Return Calculator (Real Return): Nominal to Real Return</h1>
        <p className="text-lg italic text-muted-foreground">Nominal return is the stated return (e.g. 7%); real return is the return after inflation and shows how much your purchasing power actually grows. This calculator converts nominal to real return and, optionally, shows future value in today&apos;s dollars.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-real-return" className="hover:underline">What Is Real (Inflation-Adjusted) Return?</a></li>
          <li><a href="#how-calculated-real-return" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-real-return" className="hover:underline">Why It Matters</a></li>
          <li><a href="#applications-real-return" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-real-return" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Real (Inflation-Adjusted) Return?</h2>
        <p>Real return is the return on an investment after adjusting for inflation. It measures how much your purchasing power grows—how much more (or less) you can buy with your money over time. Nominal return ignores inflation; real return does not.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Nominal vs Real</h3>
        <p>Nominal return is the headline number (e.g. 7% per year). If inflation is 3%, your money grows 7% in dollar terms but prices rise 3%, so your purchasing power grows at roughly 4% per year—that 4% is the real return (approximately; the exact formula is below).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Purchasing Power</h3>
        <p>Real return = purchasing power growth. When real return is negative (inflation &gt; nominal return), your balance may go up in dollars but you can buy less with it. Use real return to plan retirement and long-term goals in today&apos;s dollars.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Nominal 7%, inflation 3%:</strong> Real return ≈ 3.9% (exact: (1.07/1.03) − 1).</li>
          <li><strong>Nominal 5%, inflation 6%:</strong> Real return is negative—purchasing power shrinks.</li>
        </ul>
        <hr />

        <h2 id="how-calculated-real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Real return = (1 + nominal return) ÷ (1 + inflation rate) − 1. Express as a percentage by multiplying by 100. The approximation real ≈ nominal − inflation works when both rates are small (e.g. under 10%); for larger rates use the exact formula.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Divide by (1 + Inflation)</h3>
        <p>Because inflation compounds: if prices rise 3% per year, a dollar next year buys 1 ÷ 1.03 ≈ 0.97 of what it buys today. So nominal growth (1 + nominal) must be deflated by (1 + inflation) to get growth in purchasing power. That gives (1 + nominal) ÷ (1 + inflation) − 1 = real return.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Real return = (1 + nominal) ÷ (1 + inflation) − 1</p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Future Value in Today&apos;s Dollars</h3>
        <p>FV in nominal terms = P × (1 + nominal)^n. FV in real terms (today&apos;s purchasing power) = P × (1 + real)^n. When you enter years and optional initial amount, the calculator shows both nominal FV and real FV so you can see how much inflation erodes the nominal gain.</p>
        <hr />

        <h2 id="why-it-matters-real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Planning in nominal terms can overstate how much you will have in buying power. A 7% nominal return with 3% inflation gives only about 4% real growth; over 30 years that difference is large. Use real return for retirement and long-term goals.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Comparing Investments</h3>
        <p>When comparing two investments, compare real returns if they have different inflation assumptions, or use the same inflation for both. Real return levels the playing field.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Negative Real Return</h3>
        <p>When inflation exceeds nominal return, real return is negative. Your money loses purchasing power (e.g. cash in a low-yield account during high inflation). This calculator shows when that happens.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Approximation vs Exact Formula</h3>
        <p>The approximation real ≈ nominal − inflation is easy to remember and works when both rates are small (e.g. under 10%). For 7% nominal and 3% inflation, approximation gives 4%; exact (1.07 ÷ 1.03) − 1 ≈ 3.88%. For higher rates or precision, always use the exact formula.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">When the Approximation Fails</h3>
        <p>When nominal or inflation (or both) are large (e.g. 15% nominal, 10% inflation), the approximation real ≈ nominal − inflation = 5% is noticeably off. The exact (1.15 ÷ 1.10) − 1 ≈ 4.55%. For high-inflation regimes or volatile periods, always use the exact formula to avoid overstating real return.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Using Real Return in Portfolio Planning</h3>
        <p>When building a retirement or long-term plan, project future wealth in real (today&apos;s) dollars so you know how much purchasing power you will have. Use expected nominal return and expected inflation to get real return, then compound with (1 + real)^n. This avoids the common mistake of assuming a 7% nominal return means 7% growth in buying power—with 3% inflation it is only about 4% real.</p>
        <hr />

        <h2 id="applications-real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter nominal return (%), inflation rate (%), and optionally years and initial amount. The calculator shows real return (%), purchasing power growth (same as real return), and if years/amount are provided, future value in nominal and real (today&apos;s dollar) terms.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use the nominal return you expect (e.g. 6–8% for equities) and an inflation assumption (e.g. 2–3% long-term). For historical real return, use historical nominal and inflation. Years and initial amount are optional for FV in today&apos;s dollars.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Typical Use Cases</h3>
        <p>Use this calculator when planning retirement or long-term goals in today&apos;s dollars, when comparing investments that assume different inflation, or when assessing whether a low-yield savings account is losing purchasing power (negative real return). It is also useful for converting historical nominal returns to real returns for backtests.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity to Inflation</h3>
        <p>Real return is very sensitive to the inflation assumption. A 7% nominal return with 2% inflation gives about 4.9% real; with 4% inflation it gives about 2.9% real. Over long horizons that difference compounds: use a range of inflation assumptions (e.g. 2%, 3%, 4%) to see how your real FV and purchasing power change.</p>
        <hr />

        <h2 id="conclusion-real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Inflation-adjusted (real) return shows how much your purchasing power grows after inflation. It is (1 + nominal) ÷ (1 + inflation) − 1. Use it to convert nominal returns to real, to plan in today&apos;s dollars, and to compare investments fairly.</p>
        <p>This calculator gives the exact real return for your nominal and inflation inputs and, with optional years and amount, future value in nominal and real terms. Use real return for retirement and long-term planning so you don&apos;t overstate your future buying power.</p>
        <p>When inflation is high or uncertain, the exact formula matters more than the simple subtraction. Bookmark this tool to quickly convert any nominal return and inflation assumption to real return and to see FV in today&apos;s dollars for your planning horizon.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about inflation-adjusted (real) return</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is real return?</h4>
            <p className="text-muted-foreground">Real return is the return on an investment after adjusting for inflation. It measures purchasing power growth. Formula: (1 + nominal) ÷ (1 + inflation) − 1. When inflation is zero, real return = nominal return.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the difference between nominal and real return?</h4>
            <p className="text-muted-foreground">Nominal return is the stated return (e.g. 7%); it does not account for inflation. Real return is after inflation and shows how much your buying power grows. If nominal is 7% and inflation is 3%, real return is about 3.9%.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why not just subtract inflation from nominal return?</h4>
            <p className="text-muted-foreground">The approximation real ≈ nominal − inflation works when both rates are small. The exact formula is (1 + nominal) ÷ (1 + inflation) − 1 because returns compound. For 7% nominal and 3% inflation, exact real = 3.88%; approximation gives 4%.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When is real return negative?</h4>
            <p className="text-muted-foreground">When inflation is higher than nominal return. For example, 5% nominal and 6% inflation gives negative real return—your money grows in dollars but loses purchasing power. Cash in a low-yield account during high inflation often has negative real return.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What inflation rate should I use?</h4>
            <p className="text-muted-foreground">Use a long-term expected inflation rate (e.g. 2–3% in many developed markets) or historical average. For retirement planning, 2.5–3% is common. You can also use current inflation for a snapshot.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is &quot;FV in today&apos;s dollars&quot;?</h4>
            <p className="text-muted-foreground">Future value in real terms—how much purchasing power you will have. FV real = P × (1 + real return)^n. It answers: &quot;How much will my money be worth in today&apos;s buying power?&quot; Nominal FV is the dollar amount; real FV is the purchasing-power equivalent.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this work for negative nominal return or deflation?</h4>
            <p className="text-muted-foreground">Yes. The formula (1 + nominal) ÷ (1 + inflation) − 1 works for any nominal and inflation. If inflation is negative (deflation), real return can be higher than nominal. Enter negative rates as negative numbers (e.g. −2 for −2%).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why use real return for retirement planning?</h4>
            <p className="text-muted-foreground">Because you care about buying power, not just dollar balance. A $2M nest egg in 30 years with 3% inflation has much less purchasing power than $2M today. Planning in real terms (today&apos;s dollars) avoids overstating how much you will have.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I get historical real return?</h4>
            <p className="text-muted-foreground">Use historical nominal return (e.g. S&P 500 return) and historical inflation (e.g. CPI). Plug both into the formula. Many sources publish historical real returns for stocks and bonds.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Is real return the same as after-tax return?</h4>
            <p className="text-muted-foreground">No. Real return adjusts for inflation only. After-tax return adjusts for taxes. For a full picture you can compute real after-tax return: use after-tax nominal return and inflation in the real return formula.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When should I use the exact formula instead of nominal − inflation?</h4>
            <p className="text-muted-foreground">Use the exact formula whenever nominal or inflation is above roughly 5–10%, or when you need precise numbers for planning. The approximation real ≈ nominal − inflation is fine for quick mental math when both rates are small (e.g. 3% and 2%).</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & Retirement Planners</strong>
                <span className="text-sm text-muted-foreground">To convert nominal return to real return and to plan in today&apos;s dollars so you don&apos;t overstate future buying power.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Anyone Comparing Investments</strong>
                <span className="text-sm text-muted-foreground">To level the playing field by comparing real returns when inflation matters (e.g. bonds vs stocks, or different time periods).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To show clients the difference between nominal and real return and how inflation erodes nominal gains.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Savings & Cash Holders</strong>
                <span className="text-sm text-muted-foreground">To see when low nominal return (e.g. savings account) plus inflation gives negative real return—losing purchasing power.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant rates:</strong> Assumes the same nominal return and inflation every year. Real rates vary; use for planning, not exact prediction.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation measure:</strong> Use CPI or your preferred inflation measure; personal inflation may differ (e.g. healthcare, housing).</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No taxes:</strong> Real return here is inflation-adjusted only; after-tax real return requires applying taxes to nominal first.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Single inflation rate:</strong> Assumes the same inflation every year. For multi-period planning with varying inflation, use year-by-year or average inflation.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Geographic and time period:</strong> Use inflation data that matches your currency and planning horizon (e.g. US CPI for US dollar planning). Historical real returns vary by country and period.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: 7% nominal, 3% inflation</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Real return = (1.07 ÷ 1.03) − 1 ≈ 3.88%. So your purchasing power grows at about 3.9% per year, not 7%. Over 20 years, $100 grows to $387 nominal but only $211 in today&apos;s dollars (real).</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: 4% nominal (savings), 5% inflation</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Real return = (1.04 ÷ 1.05) − 1 ≈ −0.95%. Negative real return—your money loses purchasing power even though the balance grows. You need higher nominal return to keep up with inflation.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: 10% nominal, 2% inflation (high-growth scenario)</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">Real return = (1.10 ÷ 1.02) − 1 ≈ 7.84%. Purchasing power grows at about 7.8% per year. Over 20 years, $100 grows to $673 nominal but only $452 in today&apos;s dollars (real terms).</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h5 className="font-semibold text-foreground mb-1">Takeaway</h5>
                <p className="text-sm text-muted-foreground">Always convert nominal returns to real when planning in today&apos;s dollars. A 7% nominal return with 3% inflation is only about 4% real—over decades that gap compounds. Use this calculator to set realistic expectations for purchasing power growth.</p>
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
          <p className="text-muted-foreground">This calculator converts nominal (stated) return to real (inflation-adjusted) return using the formula (1 + nominal) ÷ (1 + inflation) − 1. You enter nominal return %, inflation %, and optionally years and initial amount to see future value in nominal and real (today&apos;s dollar) terms. Real return is your purchasing power growth; use it for retirement and long-term planning so you don&apos;t overstate future buying power.</p>
        </CardContent>
      </Card>
    </div>
  );
}
