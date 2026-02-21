'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingUp, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Scale, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  totalCapital: z.number().positive('Total capital must be positive'),
  equityValue: z.number().nonnegative('Equity value cannot be negative'),
  costOfEquity: z.number().min(0).max(100),
  costOfDebt: z.number().min(0).max(100),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalStructureOptimizationCalculator() {
  const [result, setResult] = useState<{
    debtValue: number;
    debtRatio: number;
    equityRatio: number;
    wacc: number;
    taxShieldBenefit: number;
    optimizationStatus: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
    scenarioLowerDebt: { wacc: number; diff: number };
    scenarioHigherDebt: { wacc: number; diff: number };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCapital: undefined,
      equityValue: undefined,
      costOfEquity: undefined,
      costOfDebt: undefined,
      taxRate: undefined,
    },
  });

  const getStatus = (debtRatio: number, wacc: number, costOfDebt: number) => {
    // Basic heuristic: check if WACC is effectively lowered by debt
    if (debtRatio > 0.6) return 'High Leverage';
    if (debtRatio < 0.2) return 'Conservative';
    return 'Balanced';
  };

  const calculateWACC = (E: number, D: number, Ke: number, Kd: number, T: number) => {
    const V = E + D;
    if (V === 0) return 0;
    // WACC = (E/V)*Ke + (D/V)*Kd*(1-T)
    return ((E / V) * Ke) + ((D / V) * Kd * (1 - T));
  };

  const calculate = (v: FormValues) => {
    const totalV = v.totalCapital;
    const E = v.equityValue;
    const D = totalV - E;
    const Ke = v.costOfEquity / 100;
    const Kd = v.costOfDebt / 100;
    const T = v.taxRate / 100;

    const currentWACC = calculateWACC(E, D, Ke, Kd, T);
    const taxShieldBenefit = D * Kd * T; // Annual tax saving amount (Interest * Tax Rate)

    // Scenarios: What if Debt ratio changes by +/- 10%?
    // Note: In reality, Ke and Kd would change. We explain this limitation in the guide.
    // For the heuristic, we assume Ke rises slightly with debt (Hamada logic implied) but for this simple tool we might keep it constant or add a small penalty.
    // Let's add a small synthetic penalty to Kd and Ke for the "Higher Debt" scenario to be realistic.
    const riskPremium = 0.005; // 0.5% penalty for higher debt

    // Scenario 1: Lower Debt (-10% of total capital shifted to equity)
    const shiftAmount = totalV * 0.1;
    const D_low = Math.max(0, D - shiftAmount);
    const E_low = totalV - D_low;
    const waccLow = calculateWACC(E_low, D_low, Math.max(0, Ke - riskPremium), Kd, T);

    // Scenario 2: Higher Debt (+10% of total capital shifted to debt)
    const D_high = Math.min(totalV, D + shiftAmount);
    const E_high = totalV - D_high;
    const waccHigh = calculateWACC(E_high, D_high, Ke + riskPremium, Kd + riskPremium, T);

    const debtRatio = (D / totalV) * 100;

    const insights = [];
    if (T > 0 && D > 0) insights.push(`Debt is providing a tax shield, effectively lowering your cost of debt to ${(Kd * (1 - T) * 100).toFixed(2)}%.`);
    if (Kd * (1 - T) < Ke) insights.push('debt is cheaper than equity (after tax), so increasing leverage generally lowers WACC up to a point.');
    if (debtRatio > 50) insights.push('Majority of capital is funded by debt, increasing financial distress risk.');

    const riskFactors = [];
    if (debtRatio > 70) riskFactors.push('Very High Leverage: Risk of bankruptcy or covenant breach is elevated.');
    if (Ke < Kd) riskFactors.push('Unusual: Cost of Equity is lower than Debt. Check your inputs; usually Equity is riskier and more expensive.');

    let recommendation = '';
    if (currentWACC < waccLow && currentWACC < waccHigh) recommendation = 'Current structure appears locally optimal compared to immediate adjacent scenarios.';
    else if (waccHigh < currentWACC) recommendation = 'Consider increasing leverage cautiously. The tax shield benefits may outweigh the added risk costs based on this model.';
    else recommendation = 'Consider de-leveraging. Reducing debt might lower your overall WACC or stability risk.';

    setResult({
      debtValue: D,
      debtRatio,
      equityRatio: (E / totalV) * 100,
      wacc: currentWACC * 100,
      taxShieldBenefit,
      optimizationStatus: getStatus(debtRatio / 100, currentWACC, Kd),
      recommendation,
      insights,
      riskFactors,
      scenarioLowerDebt: { wacc: waccLow * 100, diff: (waccLow - currentWACC) * 100 },
      scenarioHigherDebt: { wacc: waccHigh * 100, diff: (waccHigh - currentWACC) * 100 },
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Capital Calculation inputs
          </CardTitle>
          <CardDescription>
            Enter your current market values and cost of capital components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="totalCapital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Capital (Debt + Equity) ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 1000000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equityValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Market Value of Equity ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 600000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costOfEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Cost of Equity (Ke) %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 12" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costOfDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Cost of Debt (Kd) %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 6" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Corporate Tax Rate %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 21" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Structure
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Optimization Analysis</CardTitle>
                  <CardDescription>Weighted Average Cost of Capital (WACC) Breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-muted/40 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Scale className="h-24 w-24" />
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Current WACC</p>
                  <p className="text-4xl font-extrabold text-primary">{result.wacc.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-2">Blended cost of capital</p>
                </div>

                <div className="p-6 bg-muted/40 rounded-xl border shadow-sm">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Structure Mix</p>
                  <div className="flex items-center justify-center gap-4 mt-1">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{result.debtRatio.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Debt</p>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">{result.equityRatio.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Equity</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Scenarios Table */}
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-4 bg-muted/50 text-sm font-medium text-center">
                  <div>Less Debt (-10%)</div>
                  <div className="text-primary border-b-2 border-primary pb-1">Current</div>
                  <div>More Debt (+10%)</div>
                </div>
                <div className="grid grid-cols-3 p-4 text-center items-center">
                  <div className="space-y-1">
                    <p className="font-bold text-xl">{result.scenarioLowerDebt.wacc.toFixed(2)}%</p>
                    <Badge variant="outline" className={result.scenarioLowerDebt.diff < 0 ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}>
                      {result.scenarioLowerDebt.diff > 0 ? "+" : ""}{result.scenarioLowerDebt.diff.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 bg-primary/5 -my-4 py-8 rounded-lg relative">
                    <p className="font-bold text-2xl text-primary">{result.wacc.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">Your Baseline</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xl">{result.scenarioHigherDebt.wacc.toFixed(2)}%</p>
                    <Badge variant="outline" className={result.scenarioHigherDebt.diff < 0 ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}>
                      {result.scenarioHigherDebt.diff > 0 ? "+" : ""}{result.scenarioHigherDebt.diff.toFixed(2)}%
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 mx-auto max-w-[100px] leading-tight">*Assumes small risk premium increase</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Tax Shield Benefit</p>
                  <p className="text-sm text-muted-foreground mt-1">Expected annual tax savings from interest:</p>
                  <p className="text-lg font-bold">${result.taxShieldBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Leverage Status</p>
                  <Badge className="mt-2" variant={result.optimizationStatus === 'Balanced' ? 'default' : 'secondary'}>
                    {result.optimizationStatus}
                  </Badge>
                </div>
              </div>

              <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Strategic takeaways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
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
                  Risk Assessment
                </CardTitle>
                <CardDescription>Structural vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-green-600">
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    <span>No critical flags detected.</span>
                  </div>
                ) : (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components of Capital Structure and WACC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                Cost of Equity (Ke)
              </h4>
              <p className="text-sm text-muted-foreground">
                The return required by shareholders. This is usually higher than debt because equity holders are paid last in bankruptcy. Calculated via CAPM.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Cost of Debt (Kd)
              </h4>
              <p className="text-sm text-muted-foreground">
                The effective interest rate the company pays on its loans and bonds. This is the pre-tax rate.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Tax Shield
              </h4>
              <p className="text-sm text-muted-foreground">
                Interest payments are tax-deductible, which lowers the effective cost of debt. The formula is <span className="font-mono">Kd * (1 - TaxRate)</span>.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                WACC
              </h4>
              <p className="text-sm text-muted-foreground">
                "Weighted Average Cost of Capital". The minimum return a company must earn on its existing asset base to satisfy its creditors, owners, and other providers of capital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              WACC = (E/V × Ke) + (D/V × Kd × (1 - T))
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Where E=Equity, D=Debt, V=Total Capital, Ke=Cost of Equity, Kd=Cost of Debt, T=Tax Rate.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This maximizes firm value by minimizing the cost of capital, trading off the tax benefits of debt against the increased risk of bankruptcy.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Valuation and structure tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Simple WACC</p>
                      <p className="text-sm text-muted-foreground">Basic calculator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity</p>
                      <p className="text-sm text-muted-foreground">Leverage analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/interest-coverage-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Interest Coverage</p>
                      <p className="text-sm text-muted-foreground">Solvency check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/capm-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">CAPM Calculator</p>
                      <p className="text-sm text-muted-foreground">Calc Cost of Equity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/financial-break-even-npv-zero-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">NPV Break-even</p>
                      <p className="text-sm text-muted-foreground">Project viability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Capital Structure Optimization: The Ultimate Guide to WACC & Leverage" />
        <meta itemProp="description" content="Discover how to balance debt and equity to minimize WACC and maximize firm value. A masterclass on the Trade-off Theory, Tax Shields, and optimal leverage strategies." />
        <meta itemProp="author" content="Corporate Finance Team" />
        <meta itemProp="datePublished" content="2025-11-05" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Capital Structure Optimization: The Art of Funding</h1>
        <p className="text-lg italic text-muted-foreground">Finding the sweet spot between cheap debt and safe equity is arguably the most important job of a CFO. It is not just about funding operations; it is about engineering a cost of capital that gives your firm a competitive advantage. This guide breaks down the mathematics, theories, and practical realities of Capital Structure Optimization.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#basics" className="hover:underline">Capital Structure Basics</a></li>
          <li><a href="#trade-off" className="hover:underline">The Trade-Off Theory: Debt's Double-Edged Sword</a></li>
          <li><a href="#modigliani-miller" className="hover:underline">The Modigliani-Miller Theorem</a></li>
          <li><a href="#tax-shield" className="hover:underline">The Power of the Tax Shield</a></li>
          <li><a href="#optimization-process" className="hover:underline">The Optimization Process</a></li>
          <li><a href="#pecking-order" className="hover:underline">Pecking Order Theory</a></li>
          <li><a href="#real-world" className="hover:underline">Real World Strategy</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8">Capital Structure Basics</h2>
        <p>Every company needs money to operate. This money, or "capital," comes from two main sources:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 bg-muted rounded-lg">
            <strong className="block text-primary text-lg mb-2">1. Debt (Liability)</strong>
            <p>loans, bonds, or notes. You must pay interest regardless of performance. If you fail to pay, you go bankrupt. However, lenders take less risk than owners, so they demand lower returns (interest rates).</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <strong className="block text-primary text-lg mb-2">2. Equity (Ownership)</strong>
            <p>Stocks, retained earnings, or owner investment. You don't <em>have</em> to pay dividends. However, owners take the most risk (they are paid last), so they demand the highest returns.</p>
          </div>
        </div>
        <p><strong>Capital Structure Optimization</strong> is the search for the perfect mix of these two sources. The goal? To minimize the Weighted Average Cost of Capital (WACC). Because firm value is the Present Value of future cash flows discounted at WACC, mathematically, <strong>minimizing WACC maximizes Firm Value.</strong></p>

        <h2 id="trade-off" className="text-2xl font-bold text-foreground pt-8">The Trade-Off Theory: Debt's Double-Edged Sword</h2>
        <p>Why don't companiess fund everything with debt? After all, debt is usually cheaper (e.g., 5% interest vs 10% expected stock return). If you replaced expensive equity with cheap debt, wouldn't your average cost always go down?</p>
        <p className="mt-4">Not quite. The <strong>Static Trade-Off Theory</strong> explains that there are two opposing forces at work:</p>

        <div className="space-y-6 mt-6">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded shrink-0">
              <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Force 1: The Tax Shield Benefit (Lowers WACC)</h3>
              <p className="text-sm text-muted-foreground mt-1">Interest payments are tax-deductible. Dividends to shareholders are not. This means the government effectively subsidizes your debt. For every $1 of interest you pay, you save $0.21 in taxes (at a 21% rate). This makes the "effective" cost of debt even cheaper.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded shrink-0">
              <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Force 2: Financial Distress Costs (Raies WACC)</h3>
              <p className="text-sm text-muted-foreground mt-1">As you add more debt, the risk of bankruptcy (Financial Distress) rises. Lenders notice this and demand higher interest rates. Shareholders notice the higher volatility and demand higher returns. Eventually, these rising costs overwhelm the tax benefit.</p>
            </div>
          </div>
        </div>
        <p className="mt-6 font-medium border-l-4 border-primary pl-4 italic">The "Optimal Capital Structure" is the peak of the curve where the marginal benefit of the tax shield exactly equals the marginal cost of financial distress.</p>

        <h2 id="modigliani-miller" className="text-2xl font-bold text-foreground pt-8">The Modigliani-Miller Theorem</h2>
        <p>No discussion of capital structure is complete without mentioning Nobel laureates Modigliani and Miller (M&M). In 1958, they proposed a shocking theory:</p>

        <h3 className="text-lg font-semibold mt-4">M&M Proposition I (No Taxes)</h3>
        <p><em>"In a perfect market (no taxes, no bankruptcy costs), the value of a firm is unaffected by its capital structure."</em></p>
        <p className="mt-2">They argued that it's like slicing a pizza. Whether you cut it into 4 slices or 8 slices (Debt vs Equity), the amount of pizza (Firm Value) doesn't change. Cheap debt just makes the remaining equity riskier and more expensive, exactly offsetting the benefit.</p>

        <h3 className="text-lg font-semibold mt-4">M&M Proposition II (With Taxes)</h3>
        <p>Later, they added taxes to the model. Because debt interest is tax-deductible, levered firms pay less tax and keep more cash. In this world, <strong>the optimal capital structure is 100% debt.</strong></p>
        <p className="mt-2">Of course, the real world has bankruptcy costs, which M&M ignored. That brings us back to the Trade-Off Theory, which balances the M&M Tax Benefit against Bankruptcy Realities.</p>

        <h2 id="tax-shield" className="text-2xl font-bold text-foreground pt-8">The Power of the Tax Shield</h2>
        <p>The "Interest Tax Shield" is one of the most powerful value-creation tools available to CFOs. It essentially transfers wealth from the government (via lower tax receipts) to the firm's stakeholders.</p>
        <p className="mt-2 font-mono bg-muted p-2 text-sm inline-block rounded">Value of Tax Shield = Debt Amount × Corporate Tax Rate</p>
        <p className="mt-4"><strong>Example:</strong> A company adds $100M in permanent debt at a 21% tax rate. The present value of all future tax savings is simply $100M × 0.21 = $21 Million. The firm's value instantly increases by $21M just by restructuring its financing. This is why Private Equity firms use Leveraged Buyouts (LBOs)—to unlock this tax value.</p>

        <h2 id="optimization-process" className="text-2xl font-bold text-foreground pt-8">The Optimization Process</h2>
        <p>How do you actually find the number? It requires an iterative modeling process (like this calculator performs):</p>
        <ol className="list-decimal ml-6 mt-4 space-y-4">
          <li><strong>Estimate Cost of Equity (Ke) at Zero Debt:</strong> This is the "Unlevered Cost of Equity" based on the business risk alone (Asset Beta).</li>
          <li><strong>Add Debt in Increments:</strong> Model what happens if you move to 10% debt, 20% debt, etc.</li>
          <li><strong>Adjust Cost of Debt (Kd):</strong> At low levels (0-20%), Kd is the risk-free rate + spread. As debt rises (40-60%), the spread widens as credit rating drops (AAA &rarr; BBB &rarr; Junk).</li>
          <li><strong>Adjust Cost of Equity (levered Ke):</strong> As debt rises, the equity becomes riskier because debt holders get paid first. You must increase Ke using the <em>Hamada Equation</em>, which maths out how "Levered Beta" rises with debt.</li>
          <li><strong>Calculate WACC at Each Step:</strong> Plot the curve. The "U-shape" curve will show a minimum point (the nadir). That is your target.</li>
        </ol>

        <h2 id="pecking-order" className="text-2xl font-bold text-foreground pt-8">Pecking Order Theory</h2>
        <p>An alternative view to Trade-Off Theory is the <strong>Pecking Order Theory</strong>. It suggests managers don't target a specific "optimal mix." Instead, they follow the path of least resistance (and least asymmetric information):</p>
        <ul className="list-decimal ml-6 mt-4 space-y-2">
          <li><strong>First Choice: Internal Funds.</strong> Retained earnings are "free" (no transaction costs) and don't require revealing secrets to outside investors.</li>
          <li><strong>Second Choice: Debt.</strong> If internal funds run out, issue debt. It's safer than equity and signals confidence ("we know we can pay this back").</li>
          <li><strong>Last Choice: Equity.</strong> Issuing new stock is a last resort. It signals to the market that the stock might be overvalued or the company is desperate. Stock prices usually drop on the announcement of a secondary offering.</li>
        </ul>
        <p className="mt-4">This theory explains why highly profitable tech companies (Apple, Google) often have low debt—not because they are "optimizing," but because they have so much cash they never needed to borrow.</p>

        <h2 id="real-world" className="text-2xl font-bold text-foreground pt-8">Real World Strategy</h2>
        <p>In practice, CFOs don't just blindly follow the math. They apply strategic overlays:</p>
        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li><strong>Maintenance of Credit Rating:</strong> Many firms target a specific rating (e.g., "Single A") to ensure access to commercial paper markets, even if adding more debt would theoretically lower WACC.</li>
          <li><strong>Competitive Buffer:</strong> Keeping debt low provides a "War Chest." If a recession hits or a competitor attacks, a low-debt firm can borrow massive amounts to counter-attack. A high-debt firm is paralyzed.</li>
          <li><strong>Asset Tangibility:</strong> Firms with tangible assets (Real Estate, Airlines) can sustain much higher debt loads (60-70%) than firms with intangible assets (Software, Consulting) because collateral reduces the lender's risk.</li>
        </ul>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-bold text-lg text-primary mb-2">Final Thought</p>
          <p>Capital Structure Optimization is not a "set it and forget it" number. It is a dynamic target that moves with interest rates, tax laws, and business cycles. The best CFOs constantly stress-test their structure to ensure it remains a competitive advantage rather than a liability.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about WACC and Debt/Equity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does increasing debt always lower WACC?</h4>
              <p className="text-muted-foreground">
                Initially, yes. Debt is cheaper than equity due to lower risk and tax deductibility. However, as debt rises, the cost of both debt and equity rises due to bankruptcy risk. eventually, WACC curves upward.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Cost of Equity?</h4>
              <p className="text-muted-foreground">
                The standard method is CAPM: <code>RiskFreeRate + Beta * (MarketReturn - RiskFreeRate)</code>. Beta measures how volatile your stock is compared to the market.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Pecking Order Theory"?</h4>
              <p className="text-muted-foreground">
                An alternative theory stating companies prefer funding in this order: 1. Internal Cash (cheapest/easiest), 2. Debt, 3. Equity (last resort, signals weakness).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should startups use debt?</h4>
              <p className="text-muted-foreground">
                Generally, no. Startups have unstable cash flows and can't service interest payments. They rely almost entirely on Equity (Venture Capital) despite it being "expensive" in terms of ownership dilution.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a typical Debt Ratio?</h4>
              <p className="text-muted-foreground">
                It varies wildly. Tech companies often have &lt;10% debt. Utilities and Real Estate (REITs) often have &gt;50% debt because their cash flows are stable and asset-backed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does the Tax Rate matter much?</h4>
              <p className="text-muted-foreground">
                Yes. If corporate taxes drop (e.g., from 35% to 21%), the value of the tax shield drops, making debt less attractive relative to equity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if WACC is too high?</h4>
              <p className="text-muted-foreground">
                A high WACC makes it hard to find profitable projects. If your WACC is 15%, you can only invest in projects returning &gt;15%. Lowering WACC to 10% unlocks more growth opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is Market Value or Book Value used?</h4>
              <p className="text-muted-foreground">
                Always use <strong>Market Value</strong> for Equity and Debt when calculating WACC. Book values are historical and don't reflect the current cost of raising new capital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who strictly benefits from this analysis tool?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Target Audience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Treasurers</strong>
                <span className="text-sm text-muted-foreground">To decide whether to raise capital via a bond issuance or a secondary stock offering.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Private Equity Analysts</strong>
                <span className="text-sm text-muted-foreground">To model LBOs (Leveraged Buyouts) and determine how much debt a target company can sustain.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Business Students</strong>
                <span className="text-sm text-muted-foreground">To visualize the relationship between D/E ratios and WACC for case studies.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To understand if taking a bank loan is "cheaper" than giving up equity to a local investor.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Static Assumptions:</strong> This calculator assumes Ke and Kd change only slightly with leverage. In reality, they can spike dramatically if bankruptcy risk appears.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Market Conditions:</strong> Interest rates change daily. A debt issuance plan that works today might fail next month if the Fed raises rates.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Industry Norms:</strong> A "Low" WACC is relative. A tech firm with 8% WACC is high; a utility with 8% is low. always compare to peers.</span>
              </li>
            </ul>
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
          <p>The Capital Structure Optimization Calculator helps visualize the trade-off between debt and equity.</p>
          <p>By finding the lowest WACC, you identify the capital mix that theoretically maximizes shareholder value.</p>
          <p>Use this as a directional guide for long-term financing strategy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
