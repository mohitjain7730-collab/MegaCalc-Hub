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
  currentAge: z.number().min(18).max(80, '18â€“80'),
  retirementAge: z.number().min(50).max(95, '50â€“95'),
  lifeExpectancy: z.number().min(65).max(100, '65â€“100'),
  targetAnnualIncomeToday: z.number().min(0, 'Target income'),
  currentSavings: z.number().min(0).optional(),
  annualContribution: z.number().min(0).optional(),
  expectedReturnPct: z.number(),
  inflationPct: z.number(),
}).refine((d) => d.retirementAge > d.currentAge, { message: 'Retirement age must be after current age', path: ['retirementAge'] })
  .refine((d) => d.lifeExpectancy > d.retirementAge, { message: 'Life expectancy should be after retirement age', path: ['lifeExpectancy'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Retirement Gap Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Find your retirement shortfall or surplus. Enter age, target income, savings, contributions, return and inflationâ€”get required nest egg, projected savings at retirement, gap, and monthly savings needed to close the gap.',
      url: 'https://mycalculating.com/finance/retirement-gap-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function pvAnnuityGrowing(annualPayment: number, realRate: number, years: number): number {
  if (Math.abs(realRate) < 1e-9) return annualPayment * years;
  return annualPayment * (1 - Math.pow(1 + realRate, -years)) / realRate;
}

export default function RetirementGapCalculator() {
  const [result, setResult] = useState<{
    requiredNestEgg: number;
    projectedSavingsAtRetirement: number;
    gap: number;
    isShortfall: boolean;
    monthlySavingsToCloseGap: number | null;
    yearsToRetirement: number;
    yearsInRetirement: number;
    targetIncomeAtRetirement: number;
    interpretation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: 40,
      retirementAge: 65,
      lifeExpectancy: 90,
      targetAnnualIncomeToday: 60000,
      currentSavings: 100000,
      annualContribution: 6000,
      expectedReturnPct: 6,
      inflationPct: 2.5,
    },
  });

  const calculate = (v: FormValues) => {
    const yearsToRetirement = Math.max(0, v.retirementAge - v.currentAge);
    const yearsInRetirement = Math.max(1, v.lifeExpectancy - v.retirementAge);
    const nominalReturn = (v.expectedReturnPct ?? 0) / 100;
    const inflation = (v.inflationPct ?? 0) / 100;
    const realReturn = (1 + nominalReturn) / (1 + inflation) - 1;

    const targetIncomeAtRetirement = v.targetAnnualIncomeToday * Math.pow(1 + inflation, yearsToRetirement);
    const requiredNestEgg = pvAnnuityGrowing(targetIncomeAtRetirement, realReturn, yearsInRetirement);

    const currentSavings = v.currentSavings ?? 0;
    const annualContribution = v.annualContribution ?? 0;
    const contribFv = Math.abs(nominalReturn) < 1e-9
      ? annualContribution * yearsToRetirement
      : annualContribution * (Math.pow(1 + nominalReturn, yearsToRetirement) - 1) / nominalReturn;
    const projectedSavingsAtRetirement = currentSavings * Math.pow(1 + nominalReturn, yearsToRetirement) + contribFv;

    const gap = requiredNestEgg - projectedSavingsAtRetirement;
    const isShortfall = gap > 0;

    let monthlySavingsToCloseGap: number | null = null;
    if (isShortfall && yearsToRetirement > 0 && nominalReturn > 0) {
      const monthlyRate = Math.pow(1 + nominalReturn, 1 / 12) - 1;
      const nMonths = yearsToRetirement * 12;
      if (gap > 0 && Math.abs(monthlyRate) > 1e-9) {
        monthlySavingsToCloseGap = gap * monthlyRate / (Math.pow(1 + monthlyRate, nMonths) - 1);
      }
    }

    let interpretation = '';
    if (isShortfall) {
      interpretation = `You have a retirement shortfall of $${Math.abs(gap).toLocaleString(undefined, { maximumFractionDigits: 0 })}. Your projected savings at retirement ($${projectedSavingsAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}) are below the estimated required nest egg ($${requiredNestEgg.toLocaleString(undefined, { maximumFractionDigits: 0 })}). ${monthlySavingsToCloseGap != null ? `To close the gap, save about $${monthlySavingsToCloseGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month until retirement (in today's dollars, then adjust for inflation).` : ''}`;
    } else {
      interpretation = `You are on track: projected savings at retirement ($${projectedSavingsAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}) exceed the estimated required nest egg ($${requiredNestEgg.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Surplus of about $${Math.abs(gap).toLocaleString(undefined, { maximumFractionDigits: 0 })}. Consider increasing lifestyle in retirement or leaving a legacy.`;
    }

    const insights: string[] = [];
    insights.push(`Required nest egg at retirement (to fund $${targetIncomeAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year in year-1 retirement dollars for ${yearsInRetirement} years at real return ${(realReturn * 100).toFixed(2)}%): $${requiredNestEgg.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    insights.push(`Projected savings at retirement: $${projectedSavingsAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })} (current savings + contributions growing at ${v.expectedReturnPct}%).`);
    insights.push(isShortfall
      ? `Gap (shortfall): $${gap.toLocaleString(undefined, { maximumFractionDigits: 0 })}.${monthlySavingsToCloseGap != null ? ` Additional monthly savings needed (approx.): $${monthlySavingsToCloseGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}.` : ''}`
      : `Surplus: $${Math.abs(gap).toLocaleString(undefined, { maximumFractionDigits: 0 })}. You may be able to retire earlier or spend more in retirement.`);
    insights.push(`Target income at retirement (first year): $${targetIncomeAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })} (today's $${v.targetAnnualIncomeToday.toLocaleString(undefined, { maximumFractionDigits: 0 })} adjusted for ${v.inflationPct}% inflation over ${yearsToRetirement} years).`);

    const considerations: string[] = [];
    considerations.push('Required nest egg assumes you spend the same real amount each year; actual spending may vary (e.g. higher early in retirement).');
    considerations.push('Investment returns and inflation are uncertain; use conservative return and inflation assumptions.');
    considerations.push('Social Security, pensions, or other income reduce the amount you need from savings; subtract them from target income for a more accurate gap.');
    considerations.push('Life expectancy is unknown; planning to 90 or 95 reduces the risk of outliving savings but increases required savings.');
    considerations.push('Monthly savings to close gap are in nominal terms; increase them with inflation each year for a constant real effort.');
    considerations.push('Healthcare and long-term care costs are not modeled; consider a separate reserve or higher target income if needed.');

    return {
      requiredNestEgg,
      projectedSavingsAtRetirement,
      gap,
      isShortfall,
      monthlySavingsToCloseGap,
      yearsToRetirement,
      yearsInRetirement,
      targetIncomeAtRetirement,
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
      <Script id="retirement-gap-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Retirement Gap Calculator
          </CardTitle>
          <CardDescription>
            Find your retirement shortfall or surplus. Enter current age, retirement age, target income, savings, contributions, and return/inflation. Get required nest egg, projected savings at retirement, gap, and monthly savings needed to close the gap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="currentAge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Age</FormLabel>
                    <FormControl>
                      <Input type="number" min={18} max={80} placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="retirementAge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retirement Age</FormLabel>
                    <FormControl>
                      <Input type="number" min={50} max={95} placeholder="e.g., 65" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lifeExpectancy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Life Expectancy (years)</FormLabel>
                    <FormControl>
                      <Input type="number" min={65} max={100} placeholder="e.g., 90" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetAnnualIncomeToday" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Annual Income (today $)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 60000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentSavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Retirement Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualContribution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Contribution ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 6000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expectedReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="inflationPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inflation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.25} placeholder="e.g., 2.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Retirement Gap
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Retirement Gap Result</CardTitle>
                  <CardDescription>Required nest egg vs projected savings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {result.isShortfall ? `Shortfall: $${result.gap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `Surplus: $${Math.abs(result.gap).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Required Nest Egg</p>
                  <p className="text-lg font-bold">${result.requiredNestEgg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Projected Savings</p>
                  <p className="text-lg font-bold">${result.projectedSavingsAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Monthly to Close Gap</p>
                  {result.monthlySavingsToCloseGap != null ? (
                    <p className="text-lg font-bold">${result.monthlySavingsToCloseGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  ) : (
                    <Badge variant="secondary">On track</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-1">Target income (year 1 retirement)</p>
                  <p className="text-2xl font-bold">${result.targetIncomeAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-1">Years in retirement</p>
                  <p className="text-2xl font-bold">{result.yearsInRetirement}</p>
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
          <CardDescription>What each parameter means for the retirement gap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="h-4 w-4" />
                Age &amp; Target Income
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current age, retirement age, and life expectancy set the horizon. Target annual income is how much you want to spend each year in today's dollars; it is inflated to retirement.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Years to retirement = retirement age âˆ’ current age.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Years in retirement = life expectancy âˆ’ retirement age.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                Savings, Contributions &amp; Returns
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current savings and annual contribution are grown at the expected return until retirement. Inflation is used to convert target income to retirement-year dollars and to compute real returns for the nest egg.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Required nest egg = PV of an annuity paying target income (in retirement dollars) for years in retirement at real return.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Real return = (1 + nominal return) / (1 + inflation) âˆ’ 1.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Gap = Required nest egg âˆ’ Projected savings at retirement.</span>
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
              Target income at retirement = Target today Ã— (1 + inflation)^(years to retirement). Required nest egg = Target income at retirement Ã— (1 âˆ’ (1 + real rate)^(âˆ’years in retirement)) / real rate. Projected savings = Current savings Ã— (1 + nominal return)^(years to retirement) + Annual contribution Ã— ((1 + nominal return)^(years to retirement) âˆ’ 1) / nominal return. Gap = Required âˆ’ Projected. Monthly savings to close gap = PMT so that FV of contributions + FV of current savings = required nest egg.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The required nest egg is the present value (at retirement) of a level real annuity: you need enough to pay yourself the target income (in year-1 retirement dollars) each year for the rest of your life, discounted at the real rate of return.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other retirement and planning tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Retirement Savings</p>
                      <p className="text-sm text-muted-foreground">Savings projection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/401k-contribution-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">401(k) Contribution</p>
                      <p className="text-sm text-muted-foreground">Employer plan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Inflation Calculator</p>
                      <p className="text-sm text-muted-foreground">Purchasing power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/annuity-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Annuity Payment</p>
                      <p className="text-sm text-muted-foreground">Annuity math</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/sequence-of-returns-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Sequence of Returns Risk</p>
                      <p className="text-sm text-muted-foreground">Retirement withdrawal risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="Retirement Gap: How to Find and Close Your Shortfall" />
        <meta itemProp="description" content="Calculate your retirement gapâ€”the difference between what you need at retirement and what you are on track to haveâ€”and how much to save each month to close it." />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Retirement Gap: How to Find and Close Your Shortfall</h1>
        <p className="text-lg italic text-muted-foreground">Estimate the nest egg you need, compare it to your projected savings, and learn how much to save each month to close the gap.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-retirement-gap" className="hover:underline">What Is the Retirement Gap?</a></li>
          <li><a href="#how-calculated-gap" className="hover:underline">How the Calculator Works</a></li>
          <li><a href="#required-nest-egg" className="hover:underline">Required Nest Egg</a></li>
          <li><a href="#closing-the-gap" className="hover:underline">Closing the Gap</a></li>
          <li><a href="#increasing-savings-gap" className="hover:underline">Increasing Savings Over Time</a></li>
          <li><a href="#limitations-gap" className="hover:underline">Limitations</a></li>
        </ul>
        <hr />

        <h2 id="what-is-retirement-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is the Retirement Gap?</h2>
        <p>The retirement gap is the difference between the amount of savings you need at retirement (the required nest egg) and the amount you are on track to have (projected savings at retirement). A positive gap is a shortfall: you need to save more, retire later, or plan to spend less. A negative gap is a surplus: you may be able to retire earlier or spend more.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Knowing your gap helps you set a concrete savings target and adjust contributions or retirement age. Without it, you may save too little and run short in retirement, or save more than needed and sacrifice current lifestyle unnecessarily.</p>

        <h2 id="how-calculated-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Calculator Works</h2>
        <p>You enter current age, retirement age, life expectancy, target annual income in today's dollars, current savings, annual contribution, expected investment return, and inflation. The calculator inflates your target income to the first year of retirement, computes the present value of that annuity over your years in retirement (using the real rate of return), and compares that required nest egg to the future value of your current savings plus contributions. The difference is the gap. If there is a shortfall, it estimates the additional monthly savings needed to close it.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Real vs Nominal</h3>
        <p>Required nest egg is in &quot;year-1 retirement dollars&quot;â€”the amount you need at the day you retire to fund a stream of payments that keep pace with inflation. Projected savings are in nominal dollars at retirement. The comparison is consistent because both are in the same (retirement-date) dollar terms.</p>
        <p>If you enter Social Security or pension income, subtract it from your target annual income so the calculator only solves for the gap that must be funded from savings.</p>

        <h2 id="required-nest-egg" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Required Nest Egg</h2>
        <p>The required nest egg is the present value of an annuity that pays your target income (in the first year of retirement) for each year of retirement. The discount rate is the real return: (1 + nominal return) / (1 + inflation) âˆ’ 1. So you need enough money at retirement so that, if you earn the real return each year, you can withdraw the target amount (in real terms) every year for the rest of your life.</p>
        <p>This assumes you spend the same real amount each year; in practice, many people spend more early in retirement (travel, hobbies) and less later. You can add a buffer to your target income to reflect that.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Impact of Assumptions</h3>
        <p>Higher expected return lowers the required nest egg (future dollars are discounted more). Higher inflation raises the target income at retirement and can raise or lower the required nest egg depending on how it affects the real rate. Longer life expectancy increases the required nest egg; earlier retirement does too.</p>
        <p>Use a real return of roughly 3â€“5% (e.g. 6% nominal and 2â€“3% inflation) for a balanced assumption; being too optimistic on return can lead to under-saving.</p>

        <h2 id="closing-the-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Closing the Gap</h2>
        <p>If you have a shortfall, you can close it by saving more (increase monthly or annual contribution), retiring later (more years of contributions and growth), lowering your target income in retirement, or assuming a higher return (use with caution). The calculator's &quot;monthly savings to close gap&quot; is the additional amount to save each month, from now until retirement, so that the future value of those savings (plus your current savings and existing contributions) equals the required nest egg.</p>
        <h3 id="increasing-savings-gap" className="text-xl font-semibold text-foreground mt-6">Increasing Savings Over Time</h3>
        <p>If you cannot save the full &quot;monthly to close gap&quot; today, plan to increase savings with raises or bonuses. Alternatively, retire one or two years later to reduce the shortfall; the calculator lets you test different retirement ages to find a feasible plan.</p>

        <h2 id="limitations-gap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations</h2>
        <p>The model assumes level real spending; many people spend more early in retirement. It does not include Social Security, pensions, or other incomeâ€”subtract those from your target income for a more accurate gap. Returns and inflation are uncertain; use conservative assumptions. Life expectancy is unknown; planning to 90 or 95 reduces longevity risk but increases the required amount. The monthly savings to close the gap are in nominal terms; in practice, increase savings with inflation each year to maintain real effort.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Conclusion</h3>
        <p>The retirement gap calculator gives you a clear target and a concrete action (e.g. save $X per month) to close a shortfall. Review your gap periodically as your savings, contributions, and assumptions change, and adjust your plan accordingly.</p>
        <p>Use the calculator with different retirement ages and target incomes to test &quot;what if&quot; scenarios: retiring earlier, spending more in retirement, or reducing target income to see how the gap and required monthly savings change. Updating your gap annually keeps your plan aligned with reality.</p>
        <p>Combine this tool with a retirement savings calculator and Social Security estimates for a complete picture of your retirement readiness.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about the retirement gap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the retirement gap?</h4>
              <p className="text-muted-foreground">The retirement gap is the difference between the nest egg you need at retirement (to fund your desired income for life) and the amount you are on track to have based on current savings and contributions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How is the required nest egg calculated?</h4>
              <p className="text-muted-foreground">Your target annual income is inflated to the first year of retirement. The required nest egg is the present value of an annuity that pays that amount each year for your years in retirement, discounted at the real rate of return.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the real rate of return?</h4>
              <p className="text-muted-foreground">Real return = (1 + nominal return) / (1 + inflation) âˆ’ 1. It is the return after inflation, used to value a stream of real (inflation-adjusted) income.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should I include Social Security?</h4>
              <p className="text-muted-foreground">Yes. Reduce your target annual income by your expected Social Security (and any pension) so the gap reflects only what you need from savings.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if I have a surplus?</h4>
              <p className="text-muted-foreground">A surplus means you are on track to have more than needed. You might retire earlier, spend more in retirement, or leave a larger legacy. Re-run with a higher target income or earlier retirement to test.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is &quot;monthly savings to close gap&quot; sometimes blank?</h4>
              <p className="text-muted-foreground">It is shown only when there is a shortfall and there are years left until retirement. If you are on track (surplus), no additional savings are needed.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Are the results guaranteed?</h4>
              <p className="text-muted-foreground">No. Returns and inflation are uncertain. Use conservative return and inflation assumptions and revisit your gap regularly.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use the monthly savings number?</h4>
              <p className="text-muted-foreground">It is the additional amount to save each month (in addition to your current annual contribution) so that your total projected savings at retirement equals the required nest egg. Increase this amount with inflation each year for a constant real savings effort.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What life expectancy should I use?</h4>
              <p className="text-muted-foreground">Planning to 90 or 95 reduces the risk of outliving your savings. Use family history and health as a guide; when in doubt, use a longer horizon.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can I retire earlier if I have a surplus?</h4>
              <p className="text-muted-foreground">Yes. Re-run the calculator with an earlier retirement age. If you still have a surplus, you may be able to retire then. If you get a shortfall, you will see how much more you need to save to retire at that age.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I recalculate my gap?</h4>
              <p className="text-muted-foreground">At least annually, or when your income, savings, or goals change. Market returns and contribution changes will shift your projected savings; updating assumptions keeps your plan realistic.</p>
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
              <strong className="block text-primary mb-1">Mid-career savers</strong>
              <span className="text-sm text-muted-foreground">To see if you are on track and how much to save each month to close a shortfall.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Pre-retirees</strong>
              <span className="text-sm text-muted-foreground">To check whether you can retire at your target age or need to work longer or save more.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Financial advisors</strong>
              <span className="text-sm text-muted-foreground">To show clients their gap and the impact of saving more or retiring later.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Anyone planning retirement</strong>
              <span className="text-sm text-muted-foreground">To turn a vague goal into a concrete nest egg and monthly savings target.</span>
            </div>
          </div>
          <hr className="border-border/50" />
          <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Limitations &amp; Accuracy
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Assumes level real spending; actual spending may vary. Does not include Social Security or pensionsâ€”reduce target income by those amounts.</span></li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Returns and inflation are uncertain; use conservative assumptions and revisit regularly.</span></li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Monthly savings to close gap are nominal; increase with inflation each year for constant real effort.</span></li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>Life expectancy is uncertain; use 90 or 95 to reduce longevity risk.</span></li>
          </ul>
          <hr className="border-border/50" />
          <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Landmark className="h-5 w-5 text-green-600" />
            Real-World Examples
          </h4>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">On track</h5>
              <p className="text-sm text-green-700/80 dark:text-green-400">Age 45, retire at 67, $80k target income, $200k savings, $12k/year contribution, 6% return, 2.5% inflation: projected savings can exceed required nest egg, giving a surplus and no need to increase savings.</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Shortfall</h5>
              <p className="text-sm text-blue-700/80 dark:text-blue-400">Same profile but $20k target and only $3k/year contribution: large shortfall. The calculator shows the additional monthly savings needed to close the gap; increasing contribution or retiring later can eliminate it.</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Sensitivity to return and inflation</h5>
              <p className="text-sm text-amber-700/80 dark:text-amber-400">Try 5% vs 7% return and 2% vs 3% inflation; the required nest egg and monthly savings to close the gap can change noticeably. Use a range of assumptions to stress-test your plan.</p>
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
          <p>The Retirement Gap Calculator estimates the nest egg you need at retirement based on your target income and life expectancy, compares it to your projected savings (current savings + contributions grown at your expected return), and reports the gap. If you have a shortfall, it estimates the additional monthly savings needed to close it.</p>
          <p>Use it to set a concrete savings target and to adjust contributions or retirement age. Revisit as your situation and assumptions change.</p>
          <p>Remember to subtract Social Security and pensions from your target income for a more accurate gap from savings alone. Re-run with different retirement ages and returns to stress-test your plan.</p>
          <p>Required nest egg and monthly savings are estimates; actual returns and inflation will differ. Use conservative return and inflation assumptions.</p>
          <p>Review your gap at least annually and after major life or market changes. Combine with Social Security and pension estimates for a full picture.</p>
          <p>If you have a shortfall, increasing monthly savings or retiring later are the main levers to close it.</p>
        </CardContent>
      </Card>
    </div>
  );
}
