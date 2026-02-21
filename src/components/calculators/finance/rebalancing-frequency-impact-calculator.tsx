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
import { BarChart3, Info, Calculator, DollarSign, TrendingUp, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield, AlertCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const frequencyOptions = ['annual', 'semi-annual', 'quarterly', 'monthly'] as const;
const periodsPerYear: Record<string, number> = { annual: 1, 'semi-annual': 2, quarterly: 4, monthly: 12 };

const formSchema = z.object({
  initialAmount: z.number().min(1, 'Enter initial amount'),
  targetPctStocks: z.number().min(0).max(100, 'Enter 0–100'),
  returnStocksPct: z.number(),
  returnBondsPct: z.number(),
  years: z.number().min(1, 'Enter at least 1 year'),
  frequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly']),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Rebalancing Frequency Impact Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Compare terminal value with rebalancing (annual, semi-annual, quarterly, monthly) vs without rebalancing. See the impact of rebalancing frequency on portfolio value.',
      url: 'https://mycalculating.com/category/finance/rebalancing-frequency-impact-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function RebalancingFrequencyImpactCalculator() {
  const [result, setResult] = useState<{
    terminalValueRebalanced: number;
    terminalValueNoRebal: number;
    difference: number;
    cagrRebalanced: number;
    cagrNoRebal: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialAmount: undefined,
      targetPctStocks: 60,
      returnStocksPct: 8,
      returnBondsPct: 3,
      years: 10,
      frequency: 'annual',
    },
  });

  const calculate = (v: FormValues) => {
    const initial = v.initialAmount ?? 0;
    const targetStocks = (v.targetPctStocks ?? 0) / 100;
    const targetBonds = 1 - targetStocks;
    const rS = (v.returnStocksPct ?? 0) / 100;
    const rB = (v.returnBondsPct ?? 0) / 100;
    const years = Math.max(1, Math.floor(v.years ?? 1));
    const freq = v.frequency ?? 'annual';
    const periodsInYear = periodsPerYear[freq] ?? 1;
    if (initial <= 0) return null;

    const totalPeriods = years * periodsInYear;
    const periodReturnStocks = Math.pow(1 + rS, 1 / periodsInYear) - 1;
    const periodReturnBonds = Math.pow(1 + rB, 1 / periodsInYear) - 1;

    let V_s = initial * targetStocks;
    let V_b = initial * targetBonds;
    for (let i = 0; i < totalPeriods; i++) {
      V_s *= 1 + periodReturnStocks;
      V_b *= 1 + periodReturnBonds;
      const total = V_s + V_b;
      V_s = total * targetStocks;
      V_b = total * targetBonds;
    }
    const terminalValueRebalanced = V_s + V_b;

    V_s = initial * targetStocks;
    V_b = initial * targetBonds;
    for (let i = 0; i < totalPeriods; i++) {
      V_s *= 1 + periodReturnStocks;
      V_b *= 1 + periodReturnBonds;
    }
    const terminalValueNoRebal = V_s + V_b;

    const difference = terminalValueRebalanced - terminalValueNoRebal;
    const cagrRebalanced = initial > 0 ? (Math.pow(terminalValueRebalanced / initial, 1 / years) - 1) * 100 : 0;
    const cagrNoRebal = initial > 0 ? (Math.pow(terminalValueNoRebal / initial, 1 / years) - 1) * 100 : 0;

    let recommendation = '';
    if (difference > 0) {
      recommendation = `Rebalancing ${freq} adds $${Math.abs(difference).toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${years} years (rebalancing bonus). Terminal value with rebalancing: $${terminalValueRebalanced.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs $${terminalValueNoRebal.toLocaleString(undefined, { maximumFractionDigits: 0 })} without.`;
    } else if (difference < 0) {
      recommendation = `Without rebalancing you end up with $${Math.abs(difference).toLocaleString(undefined, { maximumFractionDigits: 0 })} more over ${years} years (rebalancing cost). Stocks outperformed; letting the winner run increased value. Terminal with rebalancing: $${terminalValueRebalanced.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs $${terminalValueNoRebal.toLocaleString(undefined, { maximumFractionDigits: 0 })} without.`;
    } else {
      recommendation = `Terminal values are the same. Rebalancing frequency did not change the outcome for these returns and horizon.`;
    }

    const insights: string[] = [];
    insights.push(`With ${freq} rebalancing: terminal value $${terminalValueRebalanced.toLocaleString(undefined, { maximumFractionDigits: 0 })} (CAGR ${cagrRebalanced.toFixed(2)}%). Without rebalancing: $${terminalValueNoRebal.toLocaleString(undefined, { maximumFractionDigits: 0 })} (CAGR ${cagrNoRebal.toFixed(2)}%).`);
    insights.push(`Difference: ${difference >= 0 ? '+' : ''}$${difference.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${((difference / terminalValueNoRebal) * 100).toFixed(2)}% of no-rebalance value).`);
    if (rS > rB && difference < 0) {
      insights.push('Stocks outperformed bonds; not rebalancing let the stock sleeve grow and increased terminal value. Rebalancing sold winners (stocks) and bought bonds, reducing growth in this scenario.');
    } else if (rB > rS && difference > 0) {
      insights.push('Bonds outperformed stocks; rebalancing sold bonds and bought stocks, capturing more of the bond gains and then benefiting from stock growth in later periods.');
    } else if (difference > 0) {
      insights.push('Rebalancing added value (rebalancing bonus). This can happen when returns mean-revert or when the lower-return asset is bought after dips.');
    }
    insights.push(`Frequency: ${freq} means ${periodsInYear} rebalance(s) per year. More frequent rebalancing can slightly change the result; try different frequencies to compare.`);

    return {
      terminalValueRebalanced,
      terminalValueNoRebal,
      difference,
      cagrRebalanced,
      cagrNoRebal,
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
      <Script id="rebalancing-frequency-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rebalancing Frequency Impact
          </CardTitle>
          <CardDescription>
            Compare terminal value with rebalancing (annual, semi-annual, quarterly, or monthly) vs without rebalancing. See how rebalancing frequency affects portfolio value over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <FormField control={form.control} name="initialAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Portfolio ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetPctStocks" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target % Stocks</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={5} placeholder="e.g., 60" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="returnStocksPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stocks Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="returnBondsPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonds Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
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
              </div>
              <FormField control={form.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rebalancing Frequency</FormLabel>
                  <FormControl>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field} value={field.value} onChange={e => field.onChange(e.target.value as FormValues['frequency'])}>
                      {frequencyOptions.map((f) => (
                        <option key={f} value={f}>{f === 'semi-annual' ? 'Semi-annual' : f.charAt(0).toUpperCase() + f.slice(1)}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Rebalancing Impact
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
                  <CardTitle>Result</CardTitle>
                  <CardDescription>With rebalancing vs without rebalancing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={result.difference >= 0 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {result.difference >= 0 ? 'Rebalancing bonus' : 'No rebalance ahead'} {result.difference >= 0 ? '+' : ''}${result.difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Terminal (Rebalanced)</p>
                  <p className="text-lg font-bold">${result.terminalValueRebalanced.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">CAGR {result.cagrRebalanced.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Terminal (No Rebalance)</p>
                  <p className="text-lg font-bold">${result.terminalValueNoRebal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">CAGR {result.cagrNoRebal.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Difference</p>
                  <p className="text-lg font-bold">{result.difference >= 0 ? '+' : ''}${result.difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">% of No-Rebal Value</p>
                  <p className="text-lg font-bold">{result.terminalValueNoRebal > 0 ? ((result.difference / result.terminalValueNoRebal) * 100).toFixed(2) : '0'}%</p>
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
              <CardDescription>How rebalancing frequency affects terminal value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Rebalancing can add value (rebalancing bonus) when returns mean-revert or when the underperforming asset rebounds; it can reduce value (rebalancing cost) when the winning asset keeps winning.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">More frequent rebalancing (e.g. monthly vs annual) keeps allocation closer to target but may increase transaction costs and taxes; this calculator ignores costs.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">With constant returns, the &quot;winner&quot; (higher-return asset) grows faster when you do not rebalance, so no-rebalance terminal value can exceed rebalanced value when stocks outperform bonds.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Use this calculator to compare rebalancing schedules and to see the dollar impact. Pair with the Asset Allocation Drift calculator to see how much you have drifted without rebalancing.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations
              </CardTitle>
              <CardDescription>Limitations when interpreting rebalancing impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Constant returns are assumed; real markets are volatile. The rebalancing bonus or cost in practice will differ.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Transaction costs and taxes are not modeled. More frequent rebalancing can increase costs; rebalancing in tax-advantaged accounts reduces tax impact.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Two assets (stocks and bonds) only. For multi-asset portfolios, the impact of rebalancing frequency can be more complex.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Rebalancing is still often done for risk control (keeping allocation near target), not only for return; this calculator focuses on terminal value.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Rebalancing Frequency Impact
          </CardTitle>
          <CardDescription>How often you rebalance and its effect on terminal value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">With rebalancing</h4>
              <p className="text-sm text-muted-foreground mb-3">At each rebalance date you restore target weights: sell the overweight asset and buy the underweight one. Allocation stays near target.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Annual = 1× per year; semi-annual = 2×; quarterly = 4×; monthly = 12×.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Can add value when returns mean-revert (rebalancing bonus).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Can reduce value when the winner keeps winning (rebalancing cost).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Keeps risk in line with target allocation.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Without rebalancing</h4>
              <p className="text-sm text-muted-foreground mb-3">You never rebalance; each sleeve compounds at its own return. The higher-return asset becomes a larger share over time (allocation drift).</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>When stocks outperform, no-rebalance portfolio becomes stock-heavy.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Terminal value can be higher or lower than with rebalancing.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use Asset Allocation Drift to see how much you have drifted.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>No transaction costs from rebalancing; but risk drifts with allocation.</span>
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
            <p className="font-mono text-sm text-center">Period return = (1 + annual return)^(1 / periods per year) − 1</p>
            <p className="font-mono text-sm text-center">Each period: grow both sleeves, then (if rebalancing) set V_stocks = total × target % stocks, V_bonds = total × target % bonds</p>
            <p className="font-mono text-sm text-center">CAGR = (Terminal / Initial)^(1 / years) − 1</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The simulation runs period by period. With rebalancing, after each period we reset weights to target. Without rebalancing, we only compound. Difference = terminal (rebalanced) − terminal (no rebalance).
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            With constant expected returns, when stocks outperform bonds, not rebalancing often leads to higher terminal value because you keep more in the higher-return asset. When bonds outperform or returns mean-revert, rebalancing can add value.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Portfolio and allocation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/asset-allocation-drift-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Asset Allocation Drift</p>
                      <p className="text-sm text-muted-foreground">How much you have drifted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/efficient-frontier-portfolio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Efficient Frontier Portfolio</p>
                      <p className="text-sm text-muted-foreground">Optimal risk/return mix</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Compound annual growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/portfolio-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Portfolio Turnover Ratio</p>
                      <p className="text-sm text-muted-foreground">Trading activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return</p>
                      <p className="text-sm text-muted-foreground">Real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Rebalancing Frequency Impact Calculator: How Often to Rebalance" />
        <meta itemProp="description" content="Compare terminal value with rebalancing (annual, semi-annual, quarterly, monthly) vs without rebalancing. See the impact of rebalancing frequency on portfolio value." />
        <meta itemProp="keywords" content="rebalancing frequency, rebalancing bonus, portfolio rebalancing, asset allocation rebalance" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/rebalancing-frequency-impact-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Rebalancing Frequency Impact: How Often to Rebalance and Its Effect on Terminal Value</h1>
        <p className="text-lg italic text-muted-foreground">Rebalancing keeps your portfolio near your target allocation. This calculator compares terminal value when you rebalance at different frequencies (annual, semi-annual, quarterly, monthly) versus when you never rebalance. See whether rebalancing adds value (rebalancing bonus) or reduces it (rebalancing cost) for your assumed returns.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-rebal-freq" className="hover:underline">What Is Rebalancing Frequency Impact?</a></li>
          <li><a href="#how-calculated-rebal-freq" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-rebal-freq" className="hover:underline">Why It Matters</a></li>
          <li><a href="#using-rebal-freq" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-rebal-freq" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-rebal-freq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Rebalancing Frequency Impact?</h2>
        <p>Rebalancing frequency is how often you restore your portfolio to target weights (e.g. 60% stocks, 40% bonds). The impact is the difference in terminal value between rebalancing at that frequency and never rebalancing. When rebalancing adds value, it is often called a rebalancing bonus; when it reduces value, a rebalancing cost.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Rebalancing Bonus vs Cost</h3>
        <p>With constant expected returns, if stocks outperform bonds, not rebalancing lets the stock sleeve grow and often produces a higher terminal value (rebalancing cost). If returns mean-revert or bonds outperform in some periods, rebalancing can add value (rebalancing bonus). This calculator shows the dollar difference for your inputs.</p>
        <hr />

        <h2 id="how-calculated-rebal-freq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>We simulate two strategies over the same period: (1) rebalance at the chosen frequency—after each period, grow both sleeves at their period returns, then reset weights to target; (2) never rebalance—grow both sleeves, never reset. Terminal value (1) minus terminal value (2) = impact. Period return = (1 + annual return)^(1/periods per year) − 1.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Frequency</h3>
        <p>Annual = 1 rebalance per year; semi-annual = 2; quarterly = 4; monthly = 12. More frequent rebalancing keeps allocation closer to target but is not always better for return; the outcome depends on the return path.</p>
        <hr />

        <h2 id="why-it-matters-rebal-freq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Investors rebalance to control risk (keep allocation near target) and sometimes to capture a rebalancing bonus. This calculator helps you see the dollar impact of your rebalancing frequency and compare with no rebalancing. Transaction costs and taxes are not included; in practice, more frequent rebalancing can increase costs.</p>
        <hr />

        <h2 id="using-rebal-freq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter initial portfolio, target % stocks (bonds = rest), annual return for stocks and bonds, years, and rebalancing frequency. The calculator shows terminal value with rebalancing, terminal value without rebalancing, the difference, and CAGRs for both.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use expected or historical returns. Try different frequencies to see how the impact changes. Remember: constant returns are assumed; real outcomes will vary.</p>
        <hr />

        <h2 id="conclusion-rebal-freq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Rebalancing frequency affects terminal value; the sign and size of the impact depend on returns and horizon. This calculator gives the exact difference for your inputs. Use it with the Asset Allocation Drift calculator to see how much you have drifted and whether rebalancing is worth it for return and risk control.</p>
        <p>Even when rebalancing reduces terminal value in a constant-return scenario, many investors still rebalance to keep risk in line with their target allocation.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about rebalancing frequency impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is rebalancing frequency impact?</h4>
            <p className="text-muted-foreground">The difference in terminal value between rebalancing at a given frequency (e.g. annually) and never rebalancing. Positive = rebalancing bonus; negative = rebalancing cost.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is it calculated?</h4>
            <p className="text-muted-foreground">We simulate period by period. With rebalancing: after each period we reset weights to target. Without: we only compound. Compare terminal values; difference = impact.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When does rebalancing add value?</h4>
            <p className="text-muted-foreground">When returns mean-revert or when the underperforming asset rebounds. Rebalancing sells winners and buys losers, which can add value in mean-reverting markets.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When does rebalancing reduce value?</h4>
            <p className="text-muted-foreground">When the higher-return asset keeps outperforming (e.g. stocks beat bonds every period). Not rebalancing keeps more in the winner and can yield higher terminal value.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does more frequent rebalancing always help?</h4>
            <p className="text-muted-foreground">No. With constant returns, the outcome depends on which asset wins. More frequent rebalancing keeps allocation closer to target but can increase transaction costs and taxes; this calculator does not model costs.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What return should I use?</h4>
            <p className="text-muted-foreground">Use expected long-term returns or historical averages. Real returns vary; the calculator shows the impact under your assumed constant returns.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Are transaction costs and taxes included?</h4>
            <p className="text-muted-foreground">No. More frequent rebalancing can increase trading and tax costs. Consider rebalancing in tax-advantaged accounts first and using a band or schedule that limits turnover.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to Asset Allocation Drift?</h4>
            <p className="text-muted-foreground">Asset Allocation Drift shows how much your allocation has moved when you do not rebalance. This calculator shows the dollar impact of rebalancing (or not) on terminal value. Use both to decide when and how often to rebalance.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why rebalance if it can reduce return?</h4>
            <p className="text-muted-foreground">Many investors rebalance for risk control: to keep allocation near target and avoid becoming too concentrated in the winning asset. Return impact is one factor; risk control is another.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Who should use this calculator?</h4>
            <p className="text-muted-foreground">Anyone with a target allocation who wants to see how rebalancing frequency affects terminal value compared with never rebalancing, and to compare annual vs semi-annual vs quarterly vs monthly rebalancing.</p>
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
                <strong className="block text-primary mb-1">Investors With Target Allocations</strong>
                <span className="text-sm text-muted-foreground">To see how rebalancing frequency (annual, quarterly, etc.) affects terminal value vs not rebalancing.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To show clients the rebalancing bonus or cost and the effect of different frequencies.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">DIY Portfolio Managers</strong>
                <span className="text-sm text-muted-foreground">To choose a rebalancing schedule (e.g. annual vs quarterly) based on expected impact and cost.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement & Long-Term Savers</strong>
                <span className="text-sm text-muted-foreground">To understand whether rebalancing adds or subtracts value over your horizon and to pair with Asset Allocation Drift.</span>
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
                <span><strong>Constant returns:</strong> Assumes same return each period; real returns vary.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No costs:</strong> Transaction costs and taxes not included; more frequent rebalancing can increase both.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Two assets:</strong> Stocks and bonds only; multi-asset rebalancing can have different dynamics.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No contributions/withdrawals:</strong> Assumes no new money or withdrawals during the period.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: Stocks 8%, bonds 3%, 10 years, annual rebalancing</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Stocks outperform; often no-rebalance terminal value is higher (rebalancing cost). Rebalancing sold stocks and bought bonds, reducing growth. Use the calculator to see the exact difference for your initial amount.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: Similar returns or mean reversion</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">When the two assets have similar returns or when returns mean-revert, rebalancing can add value (rebalancing bonus). The calculator shows the impact for your inputs.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: Monthly vs annual rebalancing</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">With constant returns, monthly vs annual rebalancing often gives similar terminal value; the main difference may be transaction costs in practice. Use the calculator to compare frequencies.</p>
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
          <p className="text-muted-foreground">This calculator compares terminal value when you rebalance at a chosen frequency (annual, semi-annual, quarterly, monthly) versus when you never rebalance. You enter initial amount, target % stocks, returns for stocks and bonds, years, and frequency. It reports terminal value for both strategies, the difference (rebalancing bonus or cost), and CAGRs. Use it to see how rebalancing frequency affects outcome and to pair with the Asset Allocation Drift calculator for a full picture of allocation and rebalancing.</p>
        </CardContent>
      </Card>
    </div>
  );
}
