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
import { Clock, Info, Calculator, DollarSign, TrendingUp, Calendar, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield, BarChart3, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  lumpSum: z.number().min(1, 'Enter lump sum amount'),
  annualReturnPct: z.number().min(0).max(100, 'Enter 0â€“100'),
  totalYears: z.number().min(1, 'Enter total years'),
  delayYears: z.number().min(0, 'Enter delay in years'),
}).refine((data) => data.delayYears < data.totalYears, {
  message: 'Delay must be less than total years',
  path: ['delayYears'],
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Investment Delay Cost Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate the dollar cost of delaying a lump-sum investment by X years. Same lump sum, same end dateâ€”compare FV if you invest now vs if you invest after the delay.',
      url: 'https://mycalculating.com/finance/investment-delay-cost-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function InvestmentDelayCostCalculator() {
  const [result, setResult] = useState<{
    fvInvestNow: number;
    fvInvestAfterDelay: number;
    costOfDelay: number;
    costAsPctOfFvNow: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lumpSum: undefined,
      annualReturnPct: 7,
      totalYears: undefined,
      delayYears: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const P = v.lumpSum ?? 0;
    const r = (v.annualReturnPct ?? 0) / 100;
    const T = Math.max(1, Math.floor(v.totalYears ?? 1));
    const D = Math.max(0, Math.min(v.delayYears ?? 0, T - 1));
    if (P <= 0 || T <= 0) return null;

    const fvInvestNow = P * Math.pow(1 + r, T);
    const fvInvestAfterDelay = P * Math.pow(1 + r, T - D);
    const costOfDelay = fvInvestNow - fvInvestAfterDelay;
    const costAsPctOfFvNow = fvInvestNow > 0 ? (costOfDelay / fvInvestNow) * 100 : 0;

    let recommendation = '';
    recommendation = `Delaying your $${P.toLocaleString(undefined, { maximumFractionDigits: 0 })} investment by ${D} year${D !== 1 ? 's' : ''} costs you $${costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} at year ${T} (${costAsPctOfFvNow.toFixed(1)}% of what you'd have if you invested now). Invest the lump sum as soon as you can.`;

    const insights: string[] = [];
    insights.push(`If you invest now: $${P.toLocaleString(undefined, { maximumFractionDigits: 0 })} grows to $${fvInvestNow.toLocaleString(undefined, { maximumFractionDigits: 0 })} in ${T} years at ${v.annualReturnPct}% annual return.`);
    insights.push(`If you delay ${D} year${D !== 1 ? 's' : ''}: you invest at year ${D}, so your money grows for ${T - D} years â†’ $${fvInvestAfterDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} at year ${T}.`);
    insights.push(`Cost of delay: $${costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${costAsPctOfFvNow.toFixed(1)}% less than investing now).`);
    if (r > 0) {
      insights.push(`Higher return rates increase the cost of delay because you lose more compound growth over the delay period.`);
    }

    return {
      fvInvestNow,
      fvInvestAfterDelay,
      costOfDelay,
      costAsPctOfFvNow,
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
      <Script id="investment-delay-cost-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Investment Delay Cost
          </CardTitle>
          <CardDescription>
            You have a lump sum to invest. Compare future value if you invest it now vs if you delay investing by a number of years. Same lump sum, same end dateâ€”see the dollar cost of waiting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="lumpSum" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lump Sum to Invest ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={0.5} placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Years (Investment Horizon)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="delayYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (Years Before Investing)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Investment Delay Cost
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
                  <CardDescription>Invest now vs invest after delay</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Cost of delay: ${result.costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({result.costAsPctOfFvNow.toFixed(1)}% less)
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">FV If You Invest Now</p>
                  <p className="text-lg font-bold">${result.fvInvestNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">FV If You Delay</p>
                  <p className="text-lg font-bold">${result.fvInvestAfterDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Cost of Delay</p>
                  <p className="text-lg font-bold">${result.costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
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
              <CardDescription>Why delaying a lump-sum investment costs money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Investing now gives every dollar the full horizon to compound; delaying shortens the time in the market and reduces FV.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">The cost of delay is the difference between FV if you invest at year 0 vs FV if you invest at year D (same end date).</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Higher expected return and longer delay both increase the dollar cost of waiting.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">This calculator assumes a constant return; real markets vary, but the structural cost of delay (less time in market) still applies.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations When Delaying
              </CardTitle>
              <CardDescription>Factors to weigh before postponing a lump-sum investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Expected return is uncertain; real markets fluctuateâ€”the dollar cost shown is under a constant-return assumption.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Tax timing (e.g. waiting for a new tax year to contribute to an IRA) may justify a short delay; this tool shows the cost of that wait.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">If you need the lump sum for emergencies, do not invest it; the calculator assumes you will invest the full amount either now or after D years.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Compare with &quot;Cost of Delaying Savings by 1 Year&quot; for monthly savings delay, or SIP vs Lump Sum for spreading the lump sum over time.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Investment Delay Cost
          </CardTitle>
          <CardDescription>Same lump sum, same end dateâ€”only the start of investing differs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Invest now</h4>
              <p className="text-sm text-muted-foreground mb-3">You put the full lump sum in at year 0. Every dollar compounds for the full number of years (e.g. 20 years). Future value = P Ã— (1 + r)^T.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Maximum time in the market for the full amount.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Best when you have the lump sum and no need to wait.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>FV is highest for a given return and horizon.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use when you have a windfall, bonus, or sale proceeds to invest.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>No withdrawals or additions during the horizon; single lump sum only.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">Delay investing</h4>
              <p className="text-sm text-muted-foreground mb-3">You wait D years, then invest the same lump sum. It only grows for (T âˆ’ D) years. Future value = P Ã— (1 + r)^(Tâˆ’D). The cost of delay = FV(now) âˆ’ FV(delayed).</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Less time in the market â†’ lower FV at the same end date.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Cost rises with higher return and longer delay.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Sometimes delay is unavoidable (e.g. waiting for tax year); this tool shows the cost.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Delay of 0 means invest now; cost of delay = 0.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Cost as % of FV(now) shows how much of your potential end wealth you give up.</span>
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
            <p className="font-mono text-sm text-center">FV if invest now = Lump Sum Ã— (1 + annual return)^(total years)</p>
            <p className="font-mono text-sm text-center">FV if invest after delay = Lump Sum Ã— (1 + annual return)^(total years âˆ’ delay years)</p>
            <p className="font-mono text-sm text-center">Cost of delay = FV(now) âˆ’ FV(after delay)</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Same lump sum and same end date (total years). The only difference is how many years the money is invested: full horizon if you invest now, or (total years âˆ’ delay years) if you invest after the delay.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The cost as a percentage of FV(now) tells you how much of your potential future wealth you give up by delaying. For example, a 20% cost means you end up with 80% of what you would have had if you had invested today.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Investment and time-value tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/cost-of-delaying-savings-by-1-year-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cost of Delaying Savings by 1 Year</p>
                      <p className="text-sm text-muted-foreground">Fixed 1-year delay</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/sip-vs-lump-sum-return-difference-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SIP vs Lump Sum Return Difference</p>
                      <p className="text-sm text-muted-foreground">Lump sum vs monthly SIP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return (Real Return)</p>
                      <p className="text-sm text-muted-foreground">Nominal to real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Cost of Delay (Investing Late)</p>
                      <p className="text-sm text-muted-foreground">Variable delay, catch-up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/expense-reduction-vs-income-increase-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Expense Reduction vs Income Increase</p>
                      <p className="text-sm text-muted-foreground">Same savings, two paths</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Investment Delay Cost: How Much You Lose by Waiting to Invest a Lump Sum" />
        <meta itemProp="description" content="Calculate the dollar cost of delaying a lump-sum investment by X years. Same lump sum, same end dateâ€”compare FV if you invest now vs after the delay." />
        <meta itemProp="keywords" content="investment delay cost, cost of waiting to invest, lump sum delay, time in market, future value comparison" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/investment-delay-cost-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Investment Delay Cost: How Much You Lose by Waiting to Invest a Lump Sum</h1>
        <p className="text-lg italic text-muted-foreground">You have a lump sum to invest. If you invest it now, it compounds for the full horizon. If you delay investing by a number of years, the same amount compounds for fewer years and you end up with less at the same end date. This calculator shows the exact dollar and percentage cost of that delay.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-inv-delay" className="hover:underline">What Is Investment Delay Cost?</a></li>
          <li><a href="#how-calculated-inv-delay" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-inv-delay" className="hover:underline">Why It Matters</a></li>
          <li><a href="#applications-inv-delay" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-inv-delay" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-inv-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Investment Delay Cost?</h2>
        <p>Investment delay cost is the difference in future value at a given end date if you invest a lump sum today versus if you invest the same lump sum after a delay. Same amount, same expected return, same end dateâ€”only the number of years in the market differs.</p>
        <p>It answers the question: &quot;If I have $X to invest and I wait D years before investing it, how much less will I have at my target date compared with investing today?&quot; The answer is a dollar amount and a percentage of what you would have had if you had invested now.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Invest Now vs Invest After Delay</h3>
        <p>If you invest now, every dollar compounds for the full horizon (e.g. 20 years). If you delay by 3 years, you invest at year 3 and the money only grows for 17 years by year 20. The cost of delay is the FV you give up by not having the money in the market for those 3 years.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Same End Date</h3>
        <p>We compare both strategies to the same end date (total years). So &quot;invest now&quot; means FV at year T; &quot;invest after D years&quot; means you invest at year D and hold until year T, so growth period is T âˆ’ D years. The cost of delay = FV(now) âˆ’ FV(after delay).</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Invest now:</strong> FV = P Ã— (1 + r)^T.</li>
          <li><strong>Invest after D years:</strong> FV = P Ã— (1 + r)^(T âˆ’ D).</li>
        </ul>
        <hr />

        <h2 id="how-calculated-inv-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>FV if invest now = Lump Sum Ã— (1 + annual return)^(total years). FV if invest after delay = Lump Sum Ã— (1 + annual return)^(total years âˆ’ delay years). Cost of delay = FV(now) âˆ’ FV(after delay). Cost as % of FV(now) = (Cost Ã· FV(now)) Ã— 100.</p>
        <p>All inputs are required: lump sum (dollars), expected annual return (as a percentage, e.g. 7 for 7%), total years (your investment horizon from today to the end date), and delay years (how many years you wait before investing the lump sum). Delay must be less than total years.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Algebraic Form</h3>
        <p>Cost of delay = P Ã— (1 + r)^T âˆ’ P Ã— (1 + r)^(Tâˆ’D) = P Ã— (1 + r)^(Tâˆ’D) Ã— [(1 + r)^D âˆ’ 1]. So the cost is the FV you would have at year (Tâˆ’D) multiplied by the factor [(1 + r)^D âˆ’ 1], which is the growth you give up over the D years of delay.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Cost of delay = FV(now) âˆ’ FV(after delay)</p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Higher Return Increases the Cost</h3>
        <p>The higher the expected return, the more each year of delay costs because compound growth is lost. A 3-year delay at 7% costs more in dollar terms than the same delay at 3%. The calculator shows the exact cost for your return and horizon.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Longer Delay Increases the Cost</h3>
        <p>Each extra year of delay means one fewer year of compounding. So a 5-year delay costs more than a 3-year delay (same lump sum and return) because you give up two more years of growth. The cost grows non-linearly: the difference between a 1-year and 2-year delay is smaller than the difference between a 4-year and 5-year delay at the same return.</p>
        <hr />

        <h2 id="why-it-matters-inv-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Seeing the dollar cost of delay can motivate you to invest a lump sum as soon as you can (e.g. bonus, inheritance, sale proceeds) rather than holding cash or waiting. Even a 1- or 2-year delay can cost a meaningful amount over long horizons.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">When Delay Is Unavoidable</h3>
        <p>Sometimes you must wait (e.g. waiting for a tax-advantaged contribution window, or for funds to clear). This calculator still helps: it shows the cost of that wait so you can plan or minimize delay where possible.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Lump Sum Only</h3>
        <p>This tool is for a single lump sum. If you are deciding between investing a lump sum now vs spreading it over time (SIP), use the SIP vs Lump Sum Return Difference calculator instead.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Delay vs &quot;Cost of Delaying Savings by 1 Year&quot;</h3>
        <p>That calculator fixes the delay at 1 year and compares starting monthly savings (annuity) now vs in 1 year. This calculator is for a lump sum and lets you set any delay in years; it compares investing the full lump sum now vs investing it after D years to the same end date. Use this one when you have or will have a single lump sum (bonus, inheritance, sale).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting the Cost of Delay</h3>
        <p>The dollar cost is the amount you would have had at the end date if you had invested now, minus what you will have if you invest after the delay. The percentage cost (cost Ã· FV if invest now) shows how much of that potential end wealth you give up. A 15â€“25% cost over a few years of delay is common at 6â€“8% return; over longer delays the percentage can rise sharply.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Delay vs Dollar-Cost Averaging (DCA)</h3>
        <p>If you are considering spreading a lump sum over many months (DCA) instead of investing it all now, that is a different trade-off: you are trading potential upside from earlier full investment for reduced timing risk. This calculator does not model DCA; it compares &quot;invest full lump sum now&quot; vs &quot;invest full lump sum after D years.&quot; For DCA vs lump sum, use the SIP vs Lump Sum Return Difference calculator.</p>
        <hr />

        <h2 id="applications-inv-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter lump sum ($), expected annual return (%), total years (investment horizon), and delay (years before you invest). The calculator shows FV if you invest now, FV if you invest after the delay, and the cost of delay in dollars and as a percentage of FV(now).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use a long-term expected return (e.g. 6â€“8% for a diversified portfolio). Total years = end date from today (e.g. 20 for retirement in 20 years). Delay = years you wait before investing the lump sum; it must be less than total years.</p>
        <p>Lump sum is the one-time amount you will invest (e.g. bonus, inheritance, sale proceeds). Enter it in today&apos;s dollars. The calculator assumes you invest the full amount either at year 0 (invest now) or at year D (invest after delay); no partial investments or DCA within the delay period.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Typical Use Cases</h3>
        <p>Use this calculator when you receive or expect a lump sum (bonus, inheritance, sale of asset, tax refund) and want to see the cost of waiting 1, 3, 5, or more years before investing. It also helps when you are deciding whether to invest a windfall immediately or delay (e.g. for tax reasons); you can see the dollar cost of that delay.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity to Return and Delay</h3>
        <p>The cost of delay is highly sensitive to both expected return and the length of delay. A 1-year delay at 5% return costs less in percentage terms than the same delay at 10% return, because compound growth is steeper at higher rates. Similarly, a 5-year delay costs much more than a 1-year delay for the same return. Run the calculator with different return and delay inputs to see how the cost changes.</p>
        <hr />

        <h2 id="conclusion-inv-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Investment delay cost is the future value you give up by waiting to invest a lump sum. Same amount, same return, same end dateâ€”investing now gives the most time in the market and the highest FV; delaying shortens the growth period and reduces FV. This calculator gives the exact dollar and percentage cost for your inputs.</p>
        <p>Use it to see how much a 1-, 3-, or 5-year delay costs, and to motivate investing windfalls and lump sums as soon as you can. The cost rises with higher expected return and longer delay.</p>
        <p>When delay is unavoidable (e.g. waiting for a tax-advantaged window or for funds to clear), the calculator still helps by quantifying the cost of that wait. Use the result to prioritize investing as soon as it is practical and to avoid unnecessary postponement when you have the lump sum available.</p>
        <p>In summary: investment delay cost is the future value you give up by waiting. The calculator makes that cost visible in dollars and as a percentage so you can make informed decisions about when to invest a lump sum.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about investment delay cost</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is investment delay cost?</h4>
            <p className="text-muted-foreground">It is the difference in future value at a given end date if you invest a lump sum today versus if you invest the same lump sum after a delay. Same amount, same return, same end dateâ€”only the number of years in the market differs. The cost is the FV you give up by waiting.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is it calculated?</h4>
            <p className="text-muted-foreground">FV if invest now = P Ã— (1 + r)^T. FV if invest after D years = P Ã— (1 + r)^(T âˆ’ D). Cost of delay = FV(now) âˆ’ FV(after delay). So you need lump sum, annual return, total years (horizon), and delay years (less than total years).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does delay cost money?</h4>
            <p className="text-muted-foreground">Because every year you wait, the money is not in the market earning return. Compound growth is lost. The same lump sum invested later has fewer years to grow, so FV at the same end date is lower.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if delay is 0?</h4>
            <p className="text-muted-foreground">If delay is 0, you invest now. FV(now) = FV(after delay), so cost of delay = 0. Use delay = 0 to confirm or to compare against a positive delay.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this differ from &quot;Cost of Delaying Savings by 1 Year&quot;?</h4>
            <p className="text-muted-foreground">That calculator fixes the delay at 1 year and compares starting monthly savings now vs in 1 year (annuity). This calculator is for a lump sum and lets you set any delay in years; it compares investing the lump sum now vs investing it after D years.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What return rate should I use?</h4>
            <p className="text-muted-foreground">Use a long-term expected return for your asset mix (e.g. 6â€“8% for a diversified equity portfolio). The cost of delay is sensitive to the return: higher return means a higher dollar cost for the same delay.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for inflation?</h4>
            <p className="text-muted-foreground">The calculator uses nominal (before-inflation) return. If you use a real (inflation-adjusted) return, the FVs are in today&apos;s dollars. Either way, the percentage cost of delay is similar. For real return, use the Inflation-Adjusted Return calculator to convert nominal to real.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have a lump sum but am nervous about timing?</h4>
            <p className="text-muted-foreground">You can still use this tool to see the cost of waiting. Spreading the lump sum over time (SIP/DCA) is a different questionâ€”see SIP vs Lump Sum Return Difference. This calculator assumes you either invest the full amount now or invest the full amount after D years.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is &quot;total years&quot; required?</h4>
            <p className="text-muted-foreground">So we have a common end date. &quot;Invest now&quot; means FV at year T; &quot;invest after D years&quot; means you invest at year D and hold until year T. Without a fixed end date, we couldn&apos;t compare the two strategies fairly.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When should I use this calculator?</h4>
            <p className="text-muted-foreground">When you have or will have a lump sum (bonus, inheritance, sale, tax refund) and want to see how much delaying the investment by X years costs at your target horizon. It helps you decide to invest sooner rather than later.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for monthly savings instead of a lump sum?</h4>
            <p className="text-muted-foreground">No. This calculator is for a single lump sum invested once (now or after D years). For monthly or periodic savings and the cost of delaying when you start those contributions, use the Cost of Delaying Savings by 1 Year calculator or the Cost of Delay (Investing Late) calculator.</p>
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
                <strong className="block text-primary mb-1">People With a Lump Sum to Invest</strong>
                <span className="text-sm text-muted-foreground">To see the dollar cost of delaying the investment by 1, 3, 5, or more years so you can invest sooner.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Windfall Recipients (Bonus, Inheritance, Sale)</strong>
                <span className="text-sm text-muted-foreground">To quantify the cost of waiting to invest and to motivate putting the lump sum to work as soon as practical.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To show clients the exact cost of delaying a lump-sum investment and to reinforce &quot;time in market&quot;.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement & Tax-Advantaged Savers</strong>
                <span className="text-sm text-muted-foreground">To see the cost of waiting until next year to contribute a lump sum (e.g. IRA, 401k) when you have the cash now.</span>
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
                <span><strong>Constant return:</strong> Assumes the same return every year. Real returns vary; the cost of delay in dollar terms will vary with actual performance.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Lump sum only:</strong> For comparing lump sum now vs spreading over time (SIP), use the SIP vs Lump Sum Return Difference calculator.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No taxes:</strong> Does not model taxes on gains or tax-advantaged accounts; use pre- or after-tax return as appropriate for your case.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Single lump sum:</strong> Assumes you invest the full amount at once (now or after delay). For periodic contributions, use Cost of Delaying Savings by 1 Year or Cost of Delay (Investing Late) instead.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation:</strong> FVs are in nominal dollars unless you use a real (inflation-adjusted) return. For real dollars, convert nominal return to real with the Inflation-Adjusted Return calculator and use that as your expected return.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $50,000 lump sum, 7% return, 20 years, 3-year delay</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Invest now: FV â‰ˆ $193,500. Invest after 3 years: FV â‰ˆ $158,000. Cost of delay â‰ˆ $35,500 (about 18% less). Delaying 3 years costs you roughly $35k at year 20.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: $20,000 lump sum, 6% return, 10 years, 1-year delay</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Invest now: FV â‰ˆ $35,800. Invest after 1 year: FV â‰ˆ $33,800. Cost of delay â‰ˆ $2,000 (about 5.6% less). Even a 1-year delay has a measurable cost.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: $100,000 lump sum, 8% return, 25 years, 5-year delay</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">Invest now: FV â‰ˆ $685,000. Invest after 5 years: FV â‰ˆ $466,000. Cost of delay â‰ˆ $219,000 (about 32% less). A 5-year delay on a large lump sum at a high return costs a very large amount.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h5 className="font-semibold text-foreground mb-1">Takeaway</h5>
                <p className="text-sm text-muted-foreground">The cost of delay grows with lump sum size, expected return, and length of delay. Even modest delays (1â€“2 years) can cost tens of thousands of dollars over long horizons. Use the calculator to quantify the cost before postponing a lump-sum investment.</p>
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
          <p className="text-muted-foreground">This calculator shows the dollar cost of delaying a lump-sum investment by X years. You enter lump sum, expected annual return, total years (horizon), and delay years. It compares FV if you invest now vs FV if you invest after the delay (same end date) and reports the cost of delay in dollars and as a percentage. Use it to see how much waiting costs and to motivate investing windfalls and lump sums as soon as you can. When delay is unavoidable, the result still helps you quantify the cost of that wait.</p>
        </CardContent>
      </Card>
    </div>
  );
}
