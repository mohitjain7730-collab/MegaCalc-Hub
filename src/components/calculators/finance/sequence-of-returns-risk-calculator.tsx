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
import { AlertTriangle, Info, Calculator, DollarSign, TrendingUp, TrendingDown, Target, CheckCircle2, Users, Briefcase, FunctionSquare, Landmark, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  initialPortfolio: z.number().min(1, 'Enter initial portfolio'),
  annualWithdrawal: z.number().min(0, 'Enter withdrawal'),
  years: z.number().min(1, 'Enter at least 1 year'),
  badYearReturnPct: z.number(),
  goodYearReturnPct: z.number(),
}).refine((data) => data.annualWithdrawal < data.initialPortfolio || data.annualWithdrawal === 0, {
  message: 'Withdrawal should be less than initial portfolio',
  path: ['annualWithdrawal'],
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Sequence of Returns Risk Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how the order of returns affects a portfolio with withdrawals. Compare bad years first vs good years first—same average return, different outcome.',
      url: 'https://mycalculating.com/category/finance/sequence-of-returns-risk-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function simulate(initial: number, withdrawal: number, returns: number[]): { terminal: number; depletedIn: number | null } {
  let P = initial;
  for (let y = 0; y < returns.length; y++) {
    P = P - withdrawal;
    if (P <= 0) return { terminal: 0, depletedIn: y + 1 };
    P = P * (1 + returns[y] / 100);
  }
  return { terminal: P, depletedIn: null };
}

export default function SequenceOfReturnsRiskCalculator() {
  const [result, setResult] = useState<{
    terminalBadFirst: number;
    terminalGoodFirst: number;
    depletedBadFirst: number | null;
    depletedGoodFirst: number | null;
    difference: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialPortfolio: undefined,
      annualWithdrawal: undefined,
      years: 10,
      badYearReturnPct: -10,
      goodYearReturnPct: 15,
    },
  });

  const calculate = (v: FormValues) => {
    const initial = v.initialPortfolio ?? 0;
    const withdrawal = v.annualWithdrawal ?? 0;
    const years = Math.max(1, Math.floor(v.years ?? 1));
    const rBad = (v.badYearReturnPct ?? 0) / 100;
    const rGood = (v.goodYearReturnPct ?? 0) / 100;
    if (initial <= 0) return null;

    const nBad = Math.floor(years / 2);
    const nGood = years - nBad;
    const returnsBadFirst: number[] = [];
    for (let i = 0; i < nBad; i++) returnsBadFirst.push(v.badYearReturnPct ?? 0);
    for (let i = 0; i < nGood; i++) returnsBadFirst.push(v.goodYearReturnPct ?? 0);
    const returnsGoodFirst: number[] = [];
    for (let i = 0; i < nGood; i++) returnsGoodFirst.push(v.goodYearReturnPct ?? 0);
    for (let i = 0; i < nBad; i++) returnsGoodFirst.push(v.badYearReturnPct ?? 0);

    const outBadFirst = simulate(initial, withdrawal, returnsBadFirst);
    const outGoodFirst = simulate(initial, withdrawal, returnsGoodFirst);
    const terminalBadFirst = outBadFirst.terminal;
    const terminalGoodFirst = outGoodFirst.terminal;
    const depletedBadFirst = outBadFirst.depletedIn;
    const depletedGoodFirst = outGoodFirst.depletedIn;
    const difference = terminalGoodFirst - terminalBadFirst;

    let recommendation = '';
    if (depletedBadFirst != null && depletedGoodFirst == null) {
      recommendation = `Sequence of returns risk: with bad years first, your portfolio is depleted in year ${depletedBadFirst}. With good years first, you still have $${terminalGoodFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })} after ${years} years. The order of returns matters greatly when you withdraw—protect against early bad returns (e.g. with a cash buffer or lower initial withdrawal).`;
    } else if (difference > 0) {
      recommendation = `Good years first leaves you with $${difference.toLocaleString(undefined, { maximumFractionDigits: 0 })} more after ${years} years than bad years first ($${terminalGoodFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs $${terminalBadFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Sequence of returns risk: bad returns early hurt more when you are withdrawing. Consider a withdrawal buffer or reducing withdrawals after a down year.`;
    } else if (difference < 0) {
      recommendation = `Bad years first leaves you with $${Math.abs(difference).toLocaleString(undefined, { maximumFractionDigits: 0 })} more in this scenario. That can happen when good returns early grow the portfolio enough to absorb later bad years. In practice, you cannot control return order—plan for the risk of bad years early.`;
    } else {
      recommendation = `Terminal values are the same for both sequences with these inputs. Vary withdrawal or returns to see the typical sequence-of-returns effect.`;
    }

    const insights: string[] = [];
    insights.push(`Bad years first: ${nBad} year(s) at ${v.badYearReturnPct}%, then ${nGood} at ${v.goodYearReturnPct}%. Terminal: $${terminalBadFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })}${depletedBadFirst != null ? ` (depleted in year ${depletedBadFirst})` : ''}.`);
    insights.push(`Good years first: ${nGood} year(s) at ${v.goodYearReturnPct}%, then ${nBad} at ${v.badYearReturnPct}%. Terminal: $${terminalGoodFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })}${depletedGoodFirst != null ? ` (depleted in year ${depletedGoodFirst})` : ''}.`);
    insights.push(`Difference: $${difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Same average return over the period—only the order differs. When you withdraw each year, bad returns early shrink the base for future growth and can deplete the portfolio faster.`);
    insights.push('Sequence of returns risk is especially relevant in retirement: early bad years can permanently reduce portfolio sustainability. Consider a cash buffer (e.g. 1–2 years of spending) or flexible spending to reduce this risk.');

    return {
      terminalBadFirst,
      terminalGoodFirst,
      depletedBadFirst,
      depletedGoodFirst,
      difference,
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
      <Script id="sequence-of-returns-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Sequence of Returns Risk
          </CardTitle>
          <CardDescription>
            See how the order of returns affects a portfolio with withdrawals. Compare &quot;bad years first&quot; vs &quot;good years first&quot;—same average return, different outcome. Critical for retirement planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <FormField control={form.control} name="initialPortfolio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Portfolio ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 1000000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualWithdrawal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Withdrawal ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="e.g., 40000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="badYearReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bad Year Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={1} placeholder="e.g., -10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goodYearReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Good Year Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={1} placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Sequence of Returns Risk
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
                <TrendingDown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Bad years first vs good years first</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.difference > 0 ? 'destructive' : result.difference < 0 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {result.difference > 0 ? `Good years first wins by $${result.difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : result.difference < 0 ? `Bad years first wins by $${Math.abs(result.difference).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'Same terminal value'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Terminal (Bad First)</p>
                  <p className="text-lg font-bold">${result.terminalBadFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  {result.depletedBadFirst != null && <p className="text-xs text-red-600">Depleted year {result.depletedBadFirst}</p>}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Terminal (Good First)</p>
                  <p className="text-lg font-bold">${result.terminalGoodFirst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  {result.depletedGoodFirst != null && <p className="text-xs text-red-600">Depleted year {result.depletedGoodFirst}</p>}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Difference</p>
                  <p className="text-lg font-bold">{result.difference >= 0 ? '+' : ''}${result.difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Sequence Risk</p>
                  <p className="text-sm">Order of returns matters when withdrawing</p>
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
              <CardDescription>Why sequence of returns matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">When you withdraw each year, bad returns early shrink the portfolio before it can recover; good returns early grow the base for later years. Same average return, different outcome.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Sequence of returns risk is especially important in retirement: the first few years of returns can make or break portfolio sustainability.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">You cannot control the order of returns. Mitigate by holding a cash buffer (1–2 years of spending), reducing withdrawals after a down year, or using a flexible spending rule.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">This calculator uses a simplified two-phase model (bad years then good, or good then bad). Real returns are random; the lesson is that order matters when withdrawing.</span>
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
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Simplified sequence: half the years &quot;bad&quot; and half &quot;good&quot; in two blocks. Real markets have random order; this illustrates the effect.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Withdrawal is assumed fixed each year. In practice, flexible spending (reduce after down years) can reduce sequence risk.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">No inflation adjustment; use real (inflation-adjusted) withdrawal and returns for long horizons if needed.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Pair with the Compounding Loss from Early Withdrawal calculator to see the cost of pulling money out early.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Sequence of Returns Risk
          </CardTitle>
          <CardDescription>Why the order of returns matters when you withdraw</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">Bad years first</h4>
              <p className="text-sm text-muted-foreground mb-3">You withdraw, then the portfolio drops. The smaller base has less chance to recover when good years come later. Can lead to early depletion.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Withdrawals lock in losses when you sell after a down year.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Less capital left to benefit from later good returns.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Classic sequence-of-returns risk: early bear market in retirement.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Mitigate with a cash buffer or lower initial withdrawal rate.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Good years first</h4>
              <p className="text-sm text-muted-foreground mb-3">Portfolio grows early; you withdraw from a larger base. When bad years come later, you have more cushion. Often leads to higher terminal value.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Early growth compounds; withdrawals take a smaller % of a larger portfolio.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Later bad years hurt less when you have more capital.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>You cannot control the order—plan for the worst sequence.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use this calculator to see how much difference order makes.</span>
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
            <p className="font-mono text-sm text-center">Each year: Portfolio = (Portfolio − Withdrawal) × (1 + return)</p>
            <p className="font-mono text-sm text-center">Bad first: half the years at &quot;bad&quot; return, then half at &quot;good&quot; return</p>
            <p className="font-mono text-sm text-center">Good first: half at &quot;good&quot; return, then half at &quot;bad&quot; return</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Withdrawal is taken at the start of each year, then return is applied to the remaining balance. If balance after withdrawal is zero or negative, the portfolio is depleted. Same set of returns, different order—terminal value and depletion risk differ.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The average return over the period is the same for both sequences; only the order changes. When you withdraw, order matters because losses early reduce the base for future growth.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Retirement and withdrawal tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/compounding-loss-from-early-withdrawal-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Compounding Loss from Early Withdrawal</p>
                      <p className="text-sm text-muted-foreground">Cost of pulling money out early</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
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
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return</p>
                      <p className="text-sm text-muted-foreground">Real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Emergency Fund Requirement</p>
                      <p className="text-sm text-muted-foreground">Cash buffer for shocks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Retirement Savings</p>
                      <p className="text-sm text-muted-foreground">Long-term retirement planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/asset-allocation-drift-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Asset Allocation Drift</p>
                      <p className="text-sm text-muted-foreground">Allocation vs target</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Sequence of Returns Risk Calculator: Why Order of Returns Matters" />
        <meta itemProp="description" content="See how the order of returns affects a portfolio with withdrawals. Compare bad years first vs good years first—same average return, different outcome." />
        <meta itemProp="keywords" content="sequence of returns risk, retirement withdrawal, order of returns, portfolio depletion risk" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/sequence-of-returns-risk-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Sequence of Returns Risk: Why the Order of Returns Matters When You Withdraw</h1>
        <p className="text-lg italic text-muted-foreground">When you withdraw from a portfolio each year (e.g. in retirement), the order in which returns occur matters. Bad returns early can deplete the portfolio even if the same average return occurs in a different order. This calculator compares &quot;bad years first&quot; vs &quot;good years first&quot; so you can see the impact.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-sorr" className="hover:underline">What Is Sequence of Returns Risk?</a></li>
          <li><a href="#how-calculated-sorr" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-sorr" className="hover:underline">Why It Matters</a></li>
          <li><a href="#using-sorr" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-sorr" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-sorr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Sequence of Returns Risk?</h2>
        <p>Sequence of returns risk is the risk that the order in which investment returns occur will hurt your outcome when you are taking withdrawals. If you get bad returns early (e.g. a bear market in the first years of retirement), you withdraw from a shrinking portfolio and have less capital left to benefit from later good returns. The same average return in a different order (good years first, then bad) can leave you with much more.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Retirement Context</h3>
        <p>This risk is especially relevant in retirement, when you are no longer adding to the portfolio and instead withdrawing each year. Early bad returns can permanently reduce sustainability; a cash buffer or flexible spending can help mitigate.</p>
        <hr />

        <h2 id="how-calculated-sorr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>We simulate two sequences over the same number of years: (1) bad years first—half the years at the &quot;bad&quot; return, then half at the &quot;good&quot; return; (2) good years first—half at good return, then half at bad. Each year we subtract the withdrawal, then apply the return to the remaining balance. We compare terminal values (or year of depletion if the portfolio runs out).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Withdrawal Timing</h3>
        <p>Withdrawal is taken at the start of each year; then the return is applied. So after a bad year, you have less to withdraw from the next year—and if you keep withdrawing the same amount, you can deplete the portfolio sooner when bad years come first.</p>
        <hr />

        <h2 id="why-it-matters-sorr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>You cannot control the order of returns. Planning for sequence risk means: holding a cash buffer (e.g. 1–2 years of spending) so you do not have to sell in a down year, using a lower initial withdrawal rate, or reducing spending after a bad year. This calculator shows how much difference the order can make so you can stress-test your plan.</p>
        <hr />

        <h2 id="using-sorr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter initial portfolio, annual withdrawal, number of years, and &quot;bad year&quot; and &quot;good year&quot; returns (%). The calculator splits years in half: bad first vs good first. It reports terminal value for each sequence and the difference. If the portfolio is depleted, it shows the year of depletion.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use a conservative &quot;bad&quot; return (e.g. -10% or -20% for a severe down year) and a &quot;good&quot; return (e.g. +10% or +15%). Years = your planning horizon. Withdrawal = annual spending from the portfolio. For inflation-adjusted planning, use real returns and real withdrawal.</p>
        <hr />

        <h2 id="conclusion-sorr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Sequence of returns risk can make or break a retirement plan when you withdraw each year. This calculator shows the impact of bad years first vs good years first so you can see how much order matters. Use it to stress-test your withdrawal rate and to justify holding a cash buffer or using flexible spending.</p>
        <p>Pair it with the Compounding Loss from Early Withdrawal calculator to understand the cost of pulling money out of the market early, and with retirement and emergency fund tools to build a robust plan.</p>
        <p>In summary: sequence of returns risk is the risk that bad returns early (when you are withdrawing) will permanently reduce portfolio sustainability. This calculator shows how much difference the order of returns can make so you can plan for it with a buffer or flexible spending.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about sequence of returns risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is sequence of returns risk?</h4>
            <p className="text-muted-foreground">The risk that the order in which returns occur will hurt your outcome when you are withdrawing. Bad returns early shrink the portfolio before it can recover; good returns early grow the base. Same average return, different terminal value.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does order matter when I withdraw?</h4>
            <p className="text-muted-foreground">When you withdraw each year, you lock in the effect of that year&apos;s return. After a bad year, you have less capital; if you keep withdrawing the same amount, you have less left to benefit from future good years. So bad years first hurt more than good years first.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is it calculated here?</h4>
            <p className="text-muted-foreground">We use two sequences: half the years at a &quot;bad&quot; return and half at a &quot;good&quot; return. Bad first = bad years then good years; good first = good years then bad years. Each year we subtract the withdrawal, then apply the return. We compare terminal values (or year of depletion).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What can I do to reduce sequence risk?</h4>
            <p className="text-muted-foreground">Hold a cash buffer (1–2 years of spending) so you don&apos;t have to sell in a down year; use a lower initial withdrawal rate (e.g. 4% or less); or reduce spending after a bad year. Some retirees use a flexible spending rule tied to portfolio performance.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this apply only to retirement?</h4>
            <p className="text-muted-foreground">It applies whenever you are withdrawing from a portfolio (e.g. retirement, a trust, or a endowment). It is most discussed in retirement because that is when many people switch from accumulating to withdrawing.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my portfolio is depleted?</h4>
            <p className="text-muted-foreground">The calculator shows &quot;depleted in year X&quot; when the portfolio cannot cover the withdrawal. That illustrates the worst case when bad years come first. Use a lower withdrawal or more conservative returns to test sustainability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why use only two return levels (bad and good)?</h4>
            <p className="text-muted-foreground">To keep the model simple and illustrate the effect. Real returns vary every year; the point is that order matters. You can run the calculator with different bad/good values to see how sensitive the result is.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use nominal or real returns?</h4>
            <p className="text-muted-foreground">For long horizons, use real (inflation-adjusted) returns and real withdrawal so you are planning in today&apos;s dollars. For a quick illustration, nominal is fine. Use the Inflation-Adjusted Return calculator to convert nominal to real.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to early withdrawal?</h4>
            <p className="text-muted-foreground">Sequence risk is about the order of returns when you withdraw regularly. Early withdrawal (pulling a lump sum out) loses the future compounding on that amount—see the Compounding Loss from Early Withdrawal calculator. Both concepts matter for retirement and decumulation.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Who should use this calculator?</h4>
            <p className="text-muted-foreground">Anyone planning retirement withdrawals, or already withdrawing, who wants to see how much the order of returns can affect terminal value and depletion risk. Advisors and educators can use it to explain sequence risk to clients.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a &quot;bad&quot; or &quot;good&quot; year?</h4>
            <p className="text-muted-foreground">You enter two return levels: a &quot;bad&quot; year (e.g. -10% or -20% for a down year) and a &quot;good&quot; year (e.g. +10% or +15%). The calculator uses half the years at each level and compares bad-first vs good-first order. Use returns that match your asset mix and stress-test scenario.</p>
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
                <strong className="block text-primary mb-1">Retirees and Near-Retirees</strong>
                <span className="text-sm text-muted-foreground">To see how much the order of returns can affect portfolio sustainability and to stress-test your withdrawal rate.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To illustrate sequence of returns risk and to justify cash buffers or flexible spending rules.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement Planners</strong>
                <span className="text-sm text-muted-foreground">To test whether your nest egg can survive a bad sequence (e.g. bear market in first 5 years of retirement).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Anyone Withdrawing From a Portfolio</strong>
                <span className="text-sm text-muted-foreground">Trusts, endowments, or decumulation phases—whenever you withdraw regularly, order of returns matters.</span>
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
                <span><strong>Two-phase model:</strong> Half years bad, half good, in two blocks. Real returns are random; this illustrates the effect.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Fixed withdrawal:</strong> Assumes same dollar withdrawal each year. Flexible spending is not modeled.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No inflation:</strong> Use real returns and real withdrawal for long-horizon planning if needed.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No taxes:</strong> Does not model tax impact of withdrawals or asset location.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $1M, $50k/year, 10 years, bad -10%, good 15%</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Bad first: 5 years at -10%, then 5 at 15%. Good first: 5 at 15%, then 5 at -10%. Terminal values can differ by hundreds of thousands; bad first may deplete earlier. Run the calculator to see exact numbers.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: 2008-style crash early in retirement</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">A large drop in the first few years of retirement forces withdrawals from a shrunken portfolio. That is sequence risk in practice. A cash buffer lets you avoid selling stocks in a down year.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: Lower withdrawal rate</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">Reducing the annual withdrawal (e.g. from 5% to 4% of initial) often improves survival across bad sequences. Use the calculator to see how much difference a lower withdrawal makes.</p>
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
          <p className="text-muted-foreground">This calculator shows how the order of returns affects a portfolio with fixed annual withdrawals. You enter initial portfolio, annual withdrawal, years, and &quot;bad&quot; and &quot;good&quot; year returns. It compares &quot;bad years first&quot; vs &quot;good years first&quot; and reports terminal value (or year of depletion) for each. Use it to understand sequence of returns risk and to stress-test your retirement withdrawal plan. Pair it with a cash buffer or flexible spending strategy to mitigate this risk.</p>
        </CardContent>
      </Card>
    </div>
  );
}
