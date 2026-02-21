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
import { DollarSign, Info, Calculator, TrendingUp, Target, CheckCircle2, Users, Briefcase, FunctionSquare, Landmark, Shield, AlertCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  initialInvestment: z.number().min(0.01, 'Enter initial investment'),
  monthlyContribution: z.number().min(0).optional(),
  sharePrice: z.number().min(0.01, 'Enter share price'),
  annualDividendYieldPct: z.number().min(0).max(50, '0–50%'),
  dividendGrowthRatePct: z.number().min(-10).max(30, 'Typically -10 to 30%'),
  priceAppreciationPct: z.number().min(-20).max(50, 'Annual price growth'),
  dividendFrequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  years: z.number().min(1).max(50),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Dividend Reinvestment Growth Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Project long-term portfolio growth with dividend reinvestment (DRIP). Enter initial investment, contributions, yield, dividend growth rate, and price appreciation—get future value, total dividends, shares accumulated, and effective CAGR.',
      url: 'https://mycalculating.com/category/finance/dividend-reinvestment-growth-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function frequencyPerYear(f: FormValues['dividendFrequency']) {
  return f === 'monthly' ? 12 : f === 'quarterly' ? 4 : f === 'semiannual' ? 2 : 1;
}

export default function DividendReinvestmentGrowthCalculator() {
  const [result, setResult] = useState<{
    futureValue: number;
    totalContributions: number;
    totalDividendsReceived: number;
    sharesAccumulated: number;
    valueFromAppreciation: number;
    valueFromReinvestedDividends: number;
    effectiveCagrPct: number;
    interpretation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: 10000,
      monthlyContribution: 100,
      sharePrice: 50,
      annualDividendYieldPct: 3,
      dividendGrowthRatePct: 5,
      priceAppreciationPct: 6,
      dividendFrequency: 'quarterly',
      years: 20,
    },
  });

  const calculate = (v: FormValues) => {
    const freq = frequencyPerYear(v.dividendFrequency);
    const periodsPerYear = 12;
    const totalPeriods = Math.floor(v.years * periodsPerYear);
    const divPerPeriod = (v.annualDividendYieldPct / 100) / freq;
    const divGrowthPerYear = 1 + (v.dividendGrowthRatePct / 100);
    const priceGrowthPerMonth = Math.pow(1 + v.priceAppreciationPct / 100, 1 / 12);

    let shares = (v.initialInvestment ?? 0) / v.sharePrice;
    let price = v.sharePrice;
    let totalContrib = v.initialInvestment ?? 0;
    let totalDivReceived = 0;
    const monthsBetweenDiv = 12 / freq;
    let nextDivMonth = monthsBetweenDiv;

    for (let m = 1; m <= totalPeriods; m++) {
      if (v.monthlyContribution && v.monthlyContribution > 0) {
        const newShares = v.monthlyContribution / price;
        shares += newShares;
        totalContrib += v.monthlyContribution;
      }
      if (m >= nextDivMonth && Math.abs(nextDivMonth - m) < 0.5) {
        const yearsElapsed = m / 12;
        const divYieldThisPeriod = divPerPeriod * Math.pow(divGrowthPerYear, Math.floor(yearsElapsed));
        const divCash = shares * price * divYieldThisPeriod;
        totalDivReceived += divCash;
        shares += divCash / price;
        nextDivMonth += monthsBetweenDiv;
      }
      price *= priceGrowthPerMonth;
    }

    const futureValue = shares * price;
    const valueFromContribGrowth = totalContrib * Math.pow(1 + v.priceAppreciationPct / 100, v.years);
    const valueFromReinvestedDividends = Math.max(0, futureValue - valueFromContribGrowth);
    const effectiveCagrPct = v.initialInvestment > 0
      ? (Math.pow(futureValue / v.initialInvestment, 1 / v.years) - 1) * 100
      : 0;

    let interpretation = '';
    if (valueFromReinvestedDividends > futureValue * 0.2) {
      interpretation = `Reinvested dividends contributed significantly to growth: about ${(valueFromReinvestedDividends / futureValue * 100).toFixed(0)}% of your final portfolio value comes from dividend reinvestment, on top of price appreciation and contributions.`;
    } else {
      interpretation = `Final portfolio value is driven largely by contributions and price appreciation. Dividend reinvestment adds incremental growth; over longer horizons or with higher yields, its share of total value increases.`;
    }

    const insights: string[] = [];
    insights.push(`Future value after ${v.years} years: $${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Total you contributed: $${totalContrib.toLocaleString(undefined, { maximumFractionDigits: 0 })}; total dividends received and reinvested: $${totalDivReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    insights.push(`Shares accumulated: ${shares.toFixed(2)}. Value attributable to reinvested dividends (vs contributions + appreciation): ~$${valueFromReinvestedDividends.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    insights.push(`Effective CAGR on initial investment: ${effectiveCagrPct.toFixed(2)}%. This blends price appreciation (${v.priceAppreciationPct}%), dividend yield (${v.annualDividendYieldPct}%), dividend growth (${v.dividendGrowthRatePct}%), and recurring contributions.`);
    insights.push(`Dividend frequency (${v.dividendFrequency}) affects how often dividends compound; more frequent reinvestment can slightly boost long-term value compared to annual payouts.`);

    const considerations: string[] = [];
    considerations.push('Dividend yield and growth rates are not guaranteed; companies can cut or freeze dividends.');
    considerations.push('Share price appreciation is assumed constant; real markets are volatile.');
    considerations.push('Taxes on dividends (in taxable accounts) reduce reinvestable amount unless held in tax-advantaged accounts.');
    considerations.push('Reinvestment assumes fractional shares or full-share reinvestment; rounding and fees can create small differences from model.');
    considerations.push('Compare results to a no-DRIP scenario to see the incremental benefit of reinvestment.');
    considerations.push('Brokerage or plan fees and fractional-share rounding can create small differences from the model in practice.');

    return {
      futureValue,
      totalContributions: totalContrib,
      totalDividendsReceived: totalDivReceived,
      sharesAccumulated: shares,
      valueFromAppreciation: valueFromContribGrowth,
      valueFromReinvestedDividends,
      effectiveCagrPct,
      interpretation,
      insights,
      considerations,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      <Script id="dividend-reinvestment-growth-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dividend Reinvestment Growth Calculator
          </CardTitle>
          <CardDescription>
            Project long-term portfolio growth with dividend reinvestment (DRIP). Enter initial investment, contributions, dividend yield, dividend growth rate, and price appreciation. Get future value, total dividends received, shares accumulated, and effective CAGR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Investment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step={100} min={0.01} placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Contribution ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step={10} min={0} placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sharePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Share Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.01} min={0.01} placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualDividendYieldPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Dividend Yield (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} min={0} max={50} placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dividendGrowthRatePct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dividend Growth Rate (%/year)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priceAppreciationPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Price Appreciation (%/year)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dividendFrequency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dividend Frequency</FormLabel>
                    <FormControl>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...field} onChange={e => field.onChange(e.target.value as FormValues['dividendFrequency'])}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semiannual">Semiannual</option>
                        <option value="annual">Annual</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={50} placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Growth with DRIP
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Projected Portfolio Value</CardTitle>
                  <CardDescription>Dividend reinvestment growth results</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Total Contributions</p>
                  <p className="text-lg font-bold">${result.totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Total Dividends Reinvested</p>
                  <p className="text-lg font-bold">${result.totalDividendsReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Effective CAGR</p>
                  <Badge variant="secondary" className="text-base">{result.effectiveCagrPct.toFixed(2)}%</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-1">Shares accumulated</p>
                  <p className="text-2xl font-bold">{result.sharesAccumulated.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-1">Value from reinvested dividends</p>
                  <p className="text-2xl font-bold">${result.valueFromReinvestedDividends.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{result.interpretation}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Considerations
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  {result.considerations.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{c}</span>
                    </div>
                  ))}
                </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means for dividend reinvestment growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Initial Investment &amp; Monthly Contribution
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Money you put in at the start and each month; all is used to buy shares at the current (growing) price.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Initial investment buys shares at the starting share price.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Monthly contribution adds new shares each period at the then-current price.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                Dividend Yield, Growth &amp; Price Appreciation
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Yield is the annual dividend as a percentage of share price; growth is how fast that dividend increases each year; appreciation is assumed annual share price growth.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Dividend frequency (monthly/quarterly/semiannual/annual) sets how often dividends are paid and reinvested.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Higher yield and growth increase the impact of reinvestment over time.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Years: the time horizon over which dividends and price appreciation compound.</span>
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
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm">
              Period-by-period: Dividends = Shares × Price × (Annual Yield / Frequency). Reinvested dividends buy new shares at current price. Share price grows by (1 + Appreciation)^(1/12) each month. Dividend per period grows by (1 + Dividend Growth Rate)^(years elapsed) annually.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Future value = shares accumulated × final share price. Effective CAGR = (Future Value / Initial Investment)^(1/Years) − 1. Value from reinvested dividends is estimated as the difference between total future value and the growth of contributions alone at the price appreciation rate.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other dividend and growth tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/dividend-reinvestment-drip-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Dividend Reinvestment (DRIP)</p>
                      <p className="text-sm text-muted-foreground">DRIP simulation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/dividend-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Dividend Yield</p>
                      <p className="text-sm text-muted-foreground">Yield from price and dividend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth without dividends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/tax-drag-on-investment-returns-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Tax Drag on Returns</p>
                      <p className="text-sm text-muted-foreground">After-tax return impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Compound annual growth rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Retirement Savings</p>
                      <p className="text-sm text-muted-foreground">Retirement projection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="Dividend Reinvestment Growth: How DRIP Compounds Over Time" />
        <meta itemProp="description" content="Guide to projecting portfolio growth with dividend reinvestment: yield, dividend growth rate, price appreciation, and the long-term impact of DRIP on wealth." />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Dividend Reinvestment Growth: How DRIP Compounds Over Time</h1>
        <p className="text-lg italic text-muted-foreground">Use dividend reinvestment (DRIP) to turn income into growth: see how yield, dividend growth, and price appreciation combine over many years.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-drip-growth" className="hover:underline">What Is Dividend Reinvestment Growth?</a></li>
          <li><a href="#how-calculated-drip" className="hover:underline">How the Calculator Works</a></li>
          <li><a href="#inputs-drip" className="hover:underline">Inputs and Assumptions</a></li>
          <li><a href="#when-drip-helps" className="hover:underline">When DRIP Matters Most</a></li>
          <li><a href="#tax-vs-taxable-drip" className="hover:underline">Tax-Advantaged vs Taxable</a></li>
          <li><a href="#limitations-drip" className="hover:underline">Limitations</a></li>
        </ul>
        <hr />

        <h2 id="what-is-drip-growth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Dividend Reinvestment Growth?</h2>
        <p>Dividend reinvestment (DRIP) means using cash dividends to buy more shares instead of taking the cash. Over time, those new shares pay their own dividends, which buy more shares, so growth compounds. This calculator projects that compounding: you enter initial investment, optional monthly contributions, share price, dividend yield, dividend growth rate, and share price appreciation.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Without reinvestment, dividends are just income. With reinvestment, they become growth. In tax-advantaged accounts (IRA, 401k), all dividends can be reinvested without current tax, maximizing the effect. In taxable accounts, taxes on dividends reduce the amount reinvested.</p>

        <h2 id="how-calculated-drip" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Calculator Works</h2>
        <p>The model steps through time month by month. Each period it applies your monthly contribution (if any), then on dividend dates it computes dividends as shares × price × (annual yield / frequency), grows that yield by your dividend growth rate for the elapsed years, reinvests the cash into new shares at the current price, and then grows the share price by your assumed annual appreciation. Final value is shares × price at the end.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Effective CAGR</h3>
        <p>The effective CAGR is the single annual rate that would turn your initial investment into the projected future value over the same number of years. It blends price appreciation, dividend income, dividend growth, and the impact of recurring contributions.</p>

        <h2 id="inputs-drip" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Inputs and Assumptions</h2>
        <p>Initial investment and monthly contribution are in dollars. Share price is the starting price; it grows at your entered appreciation rate. Annual dividend yield is the current dividend as a percentage of share price; it increases each year by your dividend growth rate. Dividend frequency (monthly, quarterly, semiannual, annual) determines how often dividends are paid and reinvested.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Realistic Ranges</h3>
        <p>Typical dividend yields for large-cap dividend payers are 2–5%; dividend growth might be 3–8% per year. Price appreciation is highly variable; long-term equity returns have often been in the mid-single digits. Use conservative assumptions to avoid overstating future wealth.</p>
        <p>If you are modeling a specific stock or fund, use its current yield and historical dividend growth rate; for price appreciation, use a long-term market assumption (e.g. 5–7%) unless you have a strong view.</p>

        <h2 id="when-drip-helps" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When DRIP Matters Most</h2>
        <p>DRIP has the largest impact when the horizon is long, the yield is meaningful, and the dividend grows over time. High-growth, low-yield names get less benefit from reinvestment; stable, higher-yield names benefit more. Combining DRIP with regular contributions further increases ending wealth.</p>
        <h3 id="tax-vs-taxable-drip" className="text-xl font-semibold text-foreground mt-6">Tax-Advantaged vs Taxable</h3>
        <p>In an IRA or 401(k), dividends are not taxed until withdrawal, so 100% of each dividend is reinvested. In a taxable account, qualified dividends may be taxed at 0%, 15%, or 20% (plus possible state tax), so the amount reinvested is lower. The calculator does not model taxes; for taxable accounts, mentally reduce the effective yield or ending value to reflect after-tax reinvestment.</p>

        <h2 id="limitations-drip" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations</h2>
        <p>Yields and growth rates are not guaranteed; companies can cut dividends. Price appreciation is assumed constant; real returns are volatile. The calculator does not include taxes (which reduce reinvestable dividends in taxable accounts), trading fees, or fractional-share rounding. Use the result as a projection, not a promise.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Comparing to No-DRIP</h3>
        <p>To see the benefit of reinvestment, run the same inputs with dividend yield set to zero (or compare to a simple compound-growth model with no dividends). The difference in future value shows how much DRIP and dividend growth added. For high-yield, long-horizon scenarios, that difference can be substantial.</p>
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Dividend reinvestment growth combines yield, dividend growth, and price appreciation into a single projection. Use conservative assumptions and treat the output as a planning guide. In tax-advantaged accounts, DRIP is especially powerful because all dividends compound without current tax.</p>
        <p>Run the calculator with different yield and growth assumptions to see how sensitive your ending value is. Compare high-yield versus low-yield scenarios, and long versus short horizons, to understand where DRIP adds the most value.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about dividend reinvestment growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is dividend reinvestment (DRIP)?</h4>
              <p className="text-muted-foreground">DRIP is using dividend cash to buy more shares instead of taking the cash. Over time, new shares pay dividends too, so growth compounds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does dividend growth rate affect the result?</h4>
              <p className="text-muted-foreground">A higher dividend growth rate increases the dollar amount of dividends over time, so more is reinvested and the ending value is higher.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is share price appreciation separate from yield?</h4>
              <p className="text-muted-foreground">Total return = price appreciation + dividend income. The calculator models both: appreciation grows the value of each share; yield plus growth determines dividend cash to reinvest.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does dividend frequency matter?</h4>
              <p className="text-muted-foreground">Yes. More frequent payouts mean more frequent reinvestment and slightly better compounding over long periods compared to annual dividends.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is the result guaranteed?</h4>
              <p className="text-muted-foreground">No. Dividends can be cut, and share prices can fall. The calculator is a projection based on your inputs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do taxes affect DRIP?</h4>
              <p className="text-muted-foreground">In taxable accounts, dividends are often taxed, so the amount reinvested is less. In IRAs and 401(k)s, dividends can be reinvested without current tax.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;value from reinvested dividends&quot;?</h4>
              <p className="text-muted-foreground">It is the part of your final portfolio value that comes from reinvesting dividends (and their growth) rather than from your contributions plus price appreciation alone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use this for ETFs or funds?</h4>
              <p className="text-muted-foreground">Yes, if you use the fund’s yield, an assumed dividend growth rate, and an assumed price appreciation. Many ETFs have lower yields and different growth than individual stocks.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is effective CAGR?</h4>
              <p className="text-muted-foreground">It is the compound annual growth rate that would turn your initial investment into the projected future value over the same number of years.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does this differ from the DRIP calculator?</h4>
              <p className="text-muted-foreground">This calculator focuses on long-term growth with dividend growth rate and explicit price appreciation, and reports value from reinvested dividends and effective CAGR. The other DRIP tool is a general DRIP simulator; both are complementary.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if I stop contributing mid-way?</h4>
              <p className="text-muted-foreground">Re-run the calculator with a shorter &quot;years&quot; and no (or lower) monthly contribution to see the impact. Ending value will be lower; the tool is flexible for scenario analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Who should use it and when</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            Who Should Use This Calculator?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Long-term dividend investors</strong>
              <span className="text-sm text-muted-foreground">To see how much DRIP and dividend growth can add to portfolio value over 10–30 years.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Retirement savers</strong>
              <span className="text-sm text-muted-foreground">To project growth of dividend-paying holdings in IRAs or 401(k)s with reinvestment.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Income-focused investors</strong>
              <span className="text-sm text-muted-foreground">To compare taking dividends in cash vs reinvesting for future income.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Financial educators</strong>
              <span className="text-sm text-muted-foreground">To illustrate compounding from dividend reinvestment and growth.</span>
            </div>
          </div>
          <hr className="border-border/50" />
          <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Limitations &amp; Accuracy
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Dividend and price assumptions are not guaranteed; companies can cut dividends and prices can fall.</span></li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Taxes in taxable accounts reduce reinvestable dividends; the calculator does not model tax.</span></li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Constant growth rates are simplifications; real dividends and prices vary year to year.</span></li>
          </ul>
          <hr className="border-border/50" />
          <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Landmark className="h-5 w-5 text-green-600" />
            Real-World Examples
          </h4>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">High-yield, moderate growth</h5>
              <p className="text-sm text-green-700/80 dark:text-green-400">A 4% yield with 5% dividend growth and 5% price appreciation over 25 years can produce a large share of final value from reinvested dividends, especially with monthly contributions.</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Low yield, high appreciation</h5>
              <p className="text-sm text-blue-700/80 dark:text-blue-400">With 1% yield and 8% price growth, most of the ending value comes from appreciation and contributions; DRIP still adds incremental growth over decades.</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Quarterly vs annual frequency</h5>
              <p className="text-sm text-amber-700/80 dark:text-amber-400">Quarterly dividends reinvest more often than annual; over 20+ years the difference in ending value can be meaningful for high-yield names.</p>
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
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Dividend Reinvestment Growth Calculator projects portfolio value when you reinvest dividends and optionally add monthly contributions. It uses dividend yield, dividend growth rate, and share price appreciation to estimate future value, total dividends received, shares accumulated, and effective CAGR.</p>
          <p>Use it to see how much of your long-term growth can come from DRIP and to compare strategies (e.g. reinvest vs take cash).</p>
          <p>For tax-advantaged accounts, use the full yield; for taxable accounts, consider reducing the effective yield to reflect taxes on dividends.</p>
          <p>Re-run with different yield and growth assumptions to see sensitivity; all projections assume constant rates.</p>
          <p>All projections assume constant yield, growth, and appreciation; real outcomes will vary. Use this tool alongside the standard DRIP calculator for full scenario analysis.</p>
        </CardContent>
      </Card>
    </div>
  );
}
