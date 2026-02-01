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
import { BarChart3, Info, Calculator, DollarSign, TrendingUp, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield, AlertCircle, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  initialPortfolio: z.number().min(1, 'Enter initial portfolio value'),
  targetPctStocks: z.number().min(0).max(100, 'Enter 0–100'),
  returnStocksPct: z.number(),
  returnBondsPct: z.number(),
  years: z.number().min(1, 'Enter at least 1 year'),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Asset Allocation Drift Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how much your portfolio allocation has drifted from target when you do not rebalance. Enter initial value, target % stocks, returns, and years.',
      url: 'https://mycalculating.com/category/finance/asset-allocation-drift-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function AssetAllocationDriftCalculator() {
  const [result, setResult] = useState<{
    currentPctStocks: number;
    currentPctBonds: number;
    driftStocks: number;
    driftBonds: number;
    portfolioValue: number;
    valueStocks: number;
    valueBonds: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialPortfolio: undefined,
      targetPctStocks: 60,
      returnStocksPct: 8,
      returnBondsPct: 3,
      years: 5,
    },
  });

  const calculate = (v: FormValues) => {
    const initial = v.initialPortfolio ?? 0;
    const targetStocks = (v.targetPctStocks ?? 0) / 100;
    const targetBonds = 1 - targetStocks;
    const rS = (v.returnStocksPct ?? 0) / 100;
    const rB = (v.returnBondsPct ?? 0) / 100;
    const N = Math.max(1, Math.floor(v.years ?? 1));
    if (initial <= 0) return null;

    const V_s0 = initial * targetStocks;
    const V_b0 = initial * targetBonds;
    const valueStocks = V_s0 * Math.pow(1 + rS, N);
    const valueBonds = V_b0 * Math.pow(1 + rB, N);
    const portfolioValue = valueStocks + valueBonds;
    const currentPctStocks = portfolioValue > 0 ? (valueStocks / portfolioValue) * 100 : 0;
    const currentPctBonds = portfolioValue > 0 ? (valueBonds / portfolioValue) * 100 : 0;
    const driftStocks = currentPctStocks - (targetStocks * 100);
    const driftBonds = currentPctBonds - (targetBonds * 100);

    const threshold = 5;
    let recommendation = '';
    if (Math.abs(driftStocks) >= threshold) {
      recommendation = `Your allocation has drifted ${Math.abs(driftStocks).toFixed(1)} percentage points from target. Stocks are now ${currentPctStocks.toFixed(1)}% (target ${(targetStocks * 100).toFixed(0)}%). Consider rebalancing to restore your target allocation and manage risk.`;
    } else {
      recommendation = `Drift is ${Math.abs(driftStocks).toFixed(1)} percentage points—within a typical ${threshold}% band. You may keep current allocation or rebalance to target; either is reasonable.`;
    }

    const insights: string[] = [];
    insights.push(`Target: ${(targetStocks * 100).toFixed(0)}% stocks, ${(targetBonds * 100).toFixed(0)}% bonds. After ${N} year${N !== 1 ? 's' : ''} without rebalancing: ${currentPctStocks.toFixed(1)}% stocks, ${currentPctBonds.toFixed(1)}% bonds.`);
    insights.push(`Drift: stocks ${driftStocks >= 0 ? '+' : ''}${driftStocks.toFixed(1)} pp, bonds ${driftBonds >= 0 ? '+' : ''}${driftBonds.toFixed(1)} pp. Portfolio value: $${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    if (rS > rB) {
      insights.push('Stocks outperformed bonds, so the stock sleeve grew faster and your allocation drifted toward stocks. Rebalancing would sell some stocks and buy bonds to bring you back to target.');
    } else if (rB > rS) {
      insights.push('Bonds outperformed stocks, so the bond sleeve grew faster and your allocation drifted toward bonds. Rebalancing would sell some bonds and buy stocks to restore target.');
    }
    insights.push('This calculator assumes no rebalancing over the period. Use the Rebalancing Frequency Impact calculator to see how different rebalancing schedules affect terminal value.');

    return {
      currentPctStocks,
      currentPctBonds,
      driftStocks,
      driftBonds,
      portfolioValue,
      valueStocks,
      valueBonds,
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
      <Script id="asset-allocation-drift-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Asset Allocation Drift
          </CardTitle>
          <CardDescription>
            See how much your portfolio allocation has drifted from your target when you do not rebalance. Enter initial value, target % in stocks (rest in bonds), and returns over the period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <FormField control={form.control} name="initialPortfolio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Portfolio Value ($)</FormLabel>
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
                    <FormLabel>Years (No Rebalancing)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Allocation Drift
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
                  <CardDescription>Current allocation vs target (no rebalancing)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={Math.abs(result.driftStocks) >= 5 ? 'destructive' : 'default'} className="text-lg px-4 py-2">
                  Drift: {result.driftStocks >= 0 ? '+' : ''}{result.driftStocks.toFixed(1)} pp stocks ({result.currentPctStocks.toFixed(1)}% now vs target)
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Current % Stocks</p>
                  <p className="text-lg font-bold">{result.currentPctStocks.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Current % Bonds</p>
                  <p className="text-lg font-bold">{result.currentPctBonds.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Drift (Stocks)</p>
                  <p className="text-lg font-bold">{result.driftStocks >= 0 ? '+' : ''}{result.driftStocks.toFixed(1)} pp</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Portfolio Value</p>
                  <p className="text-lg font-bold">${result.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
              <CardDescription>Why allocation drifts and when to rebalance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">When you do not rebalance, the asset that performs better becomes a larger share of the portfolio, so your allocation drifts away from your target.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Drift is measured in percentage points (pp). A 60/40 target that becomes 70/30 has a +10 pp drift in stocks.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Many investors rebalance when drift exceeds a band (e.g. 5% or 10%) or on a schedule (e.g. annually). This calculator shows how much drift you have.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">This assumes two assets (stocks and bonds) and constant returns over the period; real returns vary, but the drift mechanism is the same.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">Use the Rebalancing Frequency Impact calculator to see how often to rebalance and the effect on terminal value (rebalancing bonus or cost).</span>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
                Considerations
              </CardTitle>
              <CardDescription>Factors when interpreting drift and rebalancing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Returns are assumed constant over the period; real markets fluctuate, so actual drift will vary.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Rebalancing can trigger taxes in taxable accounts; consider rebalancing in tax-advantaged accounts first.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">This calculator uses two assets (stocks and bonds). For multi-asset portfolios, drift is per asset vs target.</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Use the Rebalancing Frequency Impact calculator to see how often to rebalance and its effect on terminal value.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Allocation Drift
          </CardTitle>
          <CardDescription>Why your allocation moves when you do not rebalance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Target allocation</h4>
              <p className="text-sm text-muted-foreground mb-3">Your intended mix (e.g. 60% stocks, 40% bonds). You start with the portfolio split according to these weights.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Stocks % + bonds % = 100%.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Each sleeve grows at its own return; no rebalancing.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Higher-return asset becomes a larger share over time.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Drift = current % − target % (in percentage points).</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">Rebalancing</h4>
              <p className="text-sm text-muted-foreground mb-3">Selling the overweight asset and buying the underweight one to restore target weights. Reduces drift and can manage risk.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Typical bands: rebalance when drift exceeds 5% or 10%.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Or rebalance on a schedule (e.g. annually, quarterly).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>In taxable accounts, rebalancing can create capital gains.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use Rebalancing Frequency Impact to compare schedules.</span>
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
            <p className="font-mono text-sm text-center">Value stocks = Initial × (target % stocks) × (1 + r_stocks)^years</p>
            <p className="font-mono text-sm text-center">Value bonds = Initial × (target % bonds) × (1 + r_bonds)^years</p>
            <p className="font-mono text-sm text-center">Current % stocks = Value stocks ÷ (Value stocks + Value bonds) × 100</p>
            <p className="font-mono text-sm text-center">Drift stocks = Current % stocks − Target % stocks (percentage points)</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            No rebalancing is applied; each sleeve compounds at its own return. The higher-return sleeve grows faster, so its share of the portfolio increases and allocation drifts.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A common rule of thumb is to rebalance when drift exceeds 5 percentage points (e.g. 60/40 target becomes 65/35 or 55/45). This calculator shows the exact drift for your inputs.
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
            <Link href="/category/finance/rebalancing-frequency-impact-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Rebalancing Frequency Impact</p>
                      <p className="text-sm text-muted-foreground">How often to rebalance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/efficient-frontier-portfolio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Efficient Frontier Portfolio</p>
                      <p className="text-sm text-muted-foreground">Optimal risk/return mix</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/compound-interest-calculator" className="block">
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
            <Link href="/category/finance/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Compound annual growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Inflation-Adjusted Return</p>
                      <p className="text-sm text-muted-foreground">Real return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Portfolio Turnover Ratio</p>
                      <p className="text-sm text-muted-foreground">Trading activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Asset Allocation Drift Calculator: How Much Has Your Portfolio Drifted?" />
        <meta itemProp="description" content="See how much your portfolio allocation has drifted from target when you do not rebalance. Enter initial value, target % stocks, returns, and years." />
        <meta itemProp="keywords" content="asset allocation drift, portfolio drift, rebalancing, target allocation, stocks bonds allocation" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/category/finance/asset-allocation-drift-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Asset Allocation Drift: How Much Has Your Portfolio Drifted From Target?</h1>
        <p className="text-lg italic text-muted-foreground">When you hold a target allocation (e.g. 60% stocks, 40% bonds) and do not rebalance, the asset that performs better becomes a larger share of the portfolio. This calculator shows how much your allocation has drifted in percentage points and the resulting portfolio value.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-drift" className="hover:underline">What Is Allocation Drift?</a></li>
          <li><a href="#how-calculated-drift" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-drift" className="hover:underline">Why It Matters</a></li>
          <li><a href="#using-drift" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-drift" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-drift" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Allocation Drift?</h2>
        <p>Allocation drift is the change in your portfolio&apos;s actual weights compared with your target. If your target is 60% stocks and 40% bonds and you do not rebalance, and stocks outperform bonds, the stock sleeve grows faster and your actual allocation shifts toward stocks (e.g. 70% stocks, 30% bonds). The drift in stocks is +10 percentage points.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Drift Happens</h3>
        <p>Each asset compounds at its own return. The higher-return asset increases in value more, so its share of the total portfolio rises. Without rebalancing, there is no mechanism to bring weights back to target.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Drift</h3>
        <p>Drift is measured in percentage points (pp). Current % stocks − target % stocks = drift in stocks. Positive drift means you are overweight stocks; negative drift means you are underweight stocks (overweight bonds).</p>
        <hr />

        <h2 id="how-calculated-drift" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>Start with initial portfolio value and target weights. Value in stocks = initial × (target % stocks) × (1 + r_stocks)^years. Value in bonds = initial × (target % bonds) × (1 + r_bonds)^years. Total = value stocks + value bonds. Current % stocks = value stocks ÷ total × 100. Drift = current % stocks − target % stocks (in pp).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">No Rebalancing</h3>
        <p>The calculator assumes you do not rebalance over the period. So each sleeve grows independently. For the effect of rebalancing on terminal value, use the Rebalancing Frequency Impact calculator.</p>
        <hr />

        <h2 id="why-it-matters-drift" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Large drift can push your portfolio toward more risk (if stocks drift up) or less return (if bonds drift up). Many investors rebalance when drift exceeds a band (e.g. 5% or 10%) to keep risk and return in line with their plan.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">When to Rebalance</h3>
        <p>Rebalance when drift exceeds your chosen band, or on a schedule (e.g. annually). In taxable accounts, rebalancing can trigger capital gains; consider rebalancing in IRAs or 401(k)s first.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Drift and Risk</h3>
        <p>Large drift toward stocks increases equity risk; large drift toward bonds may reduce expected return. Use this calculator to see how far you have drifted and whether you are still within your risk tolerance before deciding to rebalance.</p>
        <hr />

        <h2 id="using-drift" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter initial portfolio value, target % in stocks (bonds = 100 − stocks), annual return for stocks (%), annual return for bonds (%), and years without rebalancing. The calculator shows current allocation, drift in percentage points, and portfolio value.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use historical or expected returns for the two sleeves. Years = how long you have not rebalanced. For a quick check, use 1 year and your last year&apos;s returns.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity to Return Difference</h3>
        <p>The larger the gap between stock and bond returns, the faster allocation drifts. A 60/40 portfolio with stocks at 10% and bonds at 2% will drift more over 5 years than one with stocks at 6% and bonds at 4%. Use the calculator with different return assumptions to see how drift changes.</p>
        <hr />

        <h2 id="conclusion-drift" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Allocation drift shows how far your portfolio has moved from your target when you do not rebalance. This calculator gives the exact drift in percentage points and the resulting portfolio value. Use it to decide when to rebalance and to understand how returns have shifted your allocation.</p>
        <p>Combine it with the Rebalancing Frequency Impact calculator to see how different rebalancing schedules affect terminal value and to choose a rebalancing strategy that fits your goals and tax situation.</p>
        <p>In summary: allocation drift is the change in your actual weights from target when you do not rebalance. This calculator gives the exact drift in percentage points and portfolio value so you can decide when to rebalance and stay within your risk tolerance.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about allocation drift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is allocation drift?</h4>
            <p className="text-muted-foreground">Allocation drift is how much your actual portfolio weights have moved from your target. If you target 60% stocks and end up with 70% stocks (without rebalancing), drift in stocks is +10 percentage points.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is drift calculated?</h4>
            <p className="text-muted-foreground">Start with initial value and target weights. Grow each sleeve at its return for the given years (no rebalancing). Current % stocks = value stocks ÷ total × 100. Drift = current % stocks − target % stocks (in pp).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does drift happen?</h4>
            <p className="text-muted-foreground">The asset with the higher return grows faster, so its share of the portfolio increases. Without rebalancing, weights drift away from the target.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When should I rebalance?</h4>
            <p className="text-muted-foreground">Many investors rebalance when drift exceeds 5% or 10% (e.g. 60/40 becomes 65/35 or 55/45), or on a schedule (e.g. annually). Use this calculator to see your current drift.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does rebalancing improve returns?</h4>
            <p className="text-muted-foreground">It can go either way. Rebalancing can add a &quot;rebalancing bonus&quot; in certain return patterns (mean reversion) or a &quot;cost&quot; in strong trends. Use the Rebalancing Frequency Impact calculator to compare.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have more than two assets?</h4>
            <p className="text-muted-foreground">This calculator uses two assets (stocks and bonds). For multiple assets, drift is computed per asset: current % − target % for each. The same logic applies.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What return should I use?</h4>
            <p className="text-muted-foreground">Use historical returns for the period you are analyzing, or expected long-term returns for planning. Real returns vary; the calculator shows drift under your assumed returns.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for taxes?</h4>
            <p className="text-muted-foreground">No. The calculator does not model taxes. Rebalancing in taxable accounts can trigger capital gains; consider tax-advantaged accounts for rebalancing when possible.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this relate to Rebalancing Frequency Impact?</h4>
            <p className="text-muted-foreground">This calculator shows how much you have drifted without rebalancing. The Rebalancing Frequency Impact calculator shows how often to rebalance and the effect on terminal value (rebalancing bonus or cost).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Who should use this calculator?</h4>
            <p className="text-muted-foreground">Anyone with a target allocation (e.g. 60/40) who wants to see how much their portfolio has drifted after a period without rebalancing, and to decide whether to rebalance now.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a typical rebalancing band?</h4>
            <p className="text-muted-foreground">Many investors use a 5% or 10% band: rebalance when any asset drifts more than 5 or 10 percentage points from target (e.g. 60/40 becomes 65/35 or 55/45). This calculator shows your exact drift so you can compare with your band.</p>
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
                <strong className="block text-primary mb-1">Long-Term Investors With Target Allocations</strong>
                <span className="text-sm text-muted-foreground">To see how much your 60/40 or similar portfolio has drifted after a few years without rebalancing.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Advisors & Educators</strong>
                <span className="text-sm text-muted-foreground">To show clients the mechanics of drift and when rebalancing may be needed.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement & Taxable Account Holders</strong>
                <span className="text-sm text-muted-foreground">To check drift before deciding to rebalance (and where—e.g. in IRA first to avoid taxes).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">DIY Portfolio Managers</strong>
                <span className="text-sm text-muted-foreground">To quantify drift and compare with a 5% or 10% band before rebalancing.</span>
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
                <span><strong>Two assets:</strong> Assumes stocks and bonds only. For multi-asset, compute drift per asset.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant returns:</strong> Assumes same return each year; real returns vary.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No contributions/withdrawals:</strong> Assumes no new money or withdrawals during the period.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No taxes:</strong> Does not model tax impact of rebalancing.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Bonds = 100 − stocks:</strong> Only two assets; target % bonds is implied. For three or more assets, compute drift per asset separately.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $100k, 60/40, stocks 8%, bonds 3%, 5 years</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Stocks: $60k × 1.08^5 ≈ $88.1k. Bonds: $40k × 1.03^5 ≈ $46.4k. Total ≈ $134.5k. Current % stocks ≈ 65.5%. Drift ≈ +5.5 pp. Consider rebalancing.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: $200k, 50/50, stocks 10%, bonds 2%, 10 years</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Stocks grow much faster. After 10 years, allocation can drift to roughly 70/30. Drift in stocks ≈ +20 pp. Strong case for rebalancing to restore target.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Example: 1 year, similar returns</h5>
                <p className="text-sm text-amber-700/80 dark:text-amber-400">If stocks and bonds have similar returns in a given year, drift is small. Use the calculator with 1 year and your actual returns to check.</p>
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
          <p className="text-muted-foreground">This calculator shows how much your portfolio allocation has drifted from your target when you do not rebalance. You enter initial value, target % stocks (bonds = rest), returns for stocks and bonds, and years. It reports current allocation, drift in percentage points, and portfolio value. Use it to decide when to rebalance and to understand how returns have shifted your allocation. Pair it with the Rebalancing Frequency Impact calculator to see how rebalancing frequency affects terminal value. A common rule is to rebalance when drift exceeds 5% or 10%; this tool gives you the exact drift for your inputs so you can stay within your risk band.</p>
        </CardContent>
      </Card>
    </div>
  );
}
