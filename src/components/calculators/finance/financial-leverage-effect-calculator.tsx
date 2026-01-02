'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  roa: z.number().min(-100).max(100, "ROA must be typically between -100 and 100"),
  debtToEquity: z.number().min(0, "Debt-to-Equity cannot be negative"),
  interestRate: z.number().min(0, "Interest rate cannot be negative"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialLeverageEffectCalculator() {
  const [result, setResult] = useState<{
    roe: number;
    leverageEffect: number;
    roeNoDebt: number;
    interpretation: string;
    riskLevel: string;
    efficiency: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roa: undefined,
      debtToEquity: undefined,
      interestRate: undefined,
      taxRate: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // Financial Leverage Effect Formula:
    // ROE = ROA + (D/E) * (ROA - InterestRate * (1 - TaxRate))
    // Note: This is an approximation. A more precise one:
    // ROE = ROA + (ROA - CostOfDebt_AfterTax) * (Debt/Equity)

    // Convert percentages to decimals for calculation
    const roaDec = v.roa / 100;
    const interestDec = v.interestRate / 100;
    const taxDec = v.taxRate / 100;
    const deRatio = v.debtToEquity;

    // After-tax cost of debt
    const costOfDebt = interestDec * (1 - taxDec);

    // Spread
    const spread = roaDec - costOfDebt;

    // Leverage Effect (The boost from debt)
    const levEffect = spread * deRatio;

    // ROE
    const roeDec = roaDec + levEffect;

    // ROE if no debt (which is just ROA, assuming assets are the same, but purely equity financed means ROE = ROA * (1-t) ?? 
    // Actually simpler: Without debt, Equity = Assets. So ROE = Net Income / Equity.
    // If we assume ROA is pre-interest but post-tax for the unlevered firm? 
    // Let's stick to the differential interpretation: leverage effect is ROE - ROA.

    return {
      roe: roeDec * 100,
      leverageEffect: levEffect * 100,
      spread: spread * 100,
      costOfDebt: costOfDebt * 100
    };
  };

  const getRiskLevel = (deRatio: number, spread: number) => {
    // High debt + negative spread = Critical
    if (spread < 0 && deRatio > 0.5) return 'Critical';
    if (spread < 0) return 'High';

    // Positive spread
    if (deRatio > 2.5) return 'Very High';
    if (deRatio > 1.5) return 'High';
    if (deRatio > 0.5) return 'Moderate';
    return 'Low';
  };

  const getEfficiency = (spread: number) => {
    if (spread > 5) return 'Exceptional';
    if (spread > 2) return 'High';
    if (spread > 0) return 'Positive';
    if (spread > -2) return 'Inefficient';
    return 'Destructive';
  };

  const getRecommendation = (spread: number, deRatio: number) => {
    if (spread < 0) return 'Stop borrowing immediately. Your assets generate less return than the cost of your debt. De-leverage now.';
    if (spread > 0 && deRatio < 0.5) return 'You have "Positive Leverage" potential. Consider increasing debt safely to boost ROE, as your assets earn more than your debt costs.';
    if (spread > 0 && deRatio > 2.0) return 'You are benefiting from leverage, but your risk profile is high. Consider paying down some debt to lock in gains and reduce volatility.';
    return 'Maintain current structure. Your leverage is contributing positively to shareholder returns without excessive risk.';
  };

  const getInsights = (spread: number, levEffect: number) => {
    const insights = [];

    if (spread > 0) {
      insights.push('Assets are outperforming debt costs (Positive Spread).');
      insights.push(`Debt is adding ${levEffect.toFixed(2)}% to your ROE.`);
      insights.push('Tax shield is effectively lowering your borrowing cost.');
    } else {
      insights.push('Assets are underperforming debt costs (Negative Spread).');
      insights.push(`Debt is dragging down your ROE by ${Math.abs(levEffect).toFixed(2)}%.`);
      insights.push('Every dollar borrowed destroys shareholder value.');
    }

    if (levEffect > 5) insights.push('Significant value creation through capital structure.');

    return insights;
  };

  const getConsiderations = (deRatio: number, spread: number) => {
    const cons = [];
    if (deRatio > 2.0) cons.push('High debt load increases bankruptcy risk during downturns.');
    if (spread < 1 && spread > 0) cons.push('Spread is thin/marginal; slight rate hikes could turn leverage negative.');
    if (deRatio < 0.1) cons.push('Potential "Lazy Balance Sheet" - underutilized debt capacity.');
    cons.push('Monitor interest rate variability (variable rate risk).');
    cons.push('Ensure cash flows are stable enough to service debt obligations.');
    return cons;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    const risk = getRiskLevel(values.debtToEquity, calc.spread);
    const eff = getEfficiency(calc.spread);

    setResult({
      roe: calc.roe,
      leverageEffect: calc.leverageEffect,
      roeNoDebt: values.roa, // Simplified comparison
      interpretation: calc.spread > 0
        ? 'Positive Leverage: Debt is amplifying your returns.'
        : 'Negative Leverage: Debt is eroding your returns.',
      riskLevel: risk,
      efficiency: eff,
      recommendation: getRecommendation(calc.spread, values.debtToEquity),
      insights: getInsights(calc.spread, calc.leverageEffect),
      considerations: getConsiderations(values.debtToEquity, calc.spread)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Input your Return on Assets (ROA), Capital Structure, and Debt Costs to analyze leverage impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Return on Assets (ROA) %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 8.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtToEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Debt-to-Equity Ratio
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 1.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Interest Rate on Debt %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 6.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <Shield className="h-4 w-4" />
                        Effective Tax Rate %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 25.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Leverage Effect
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Return on Equity (ROE)</CardTitle>
                  <CardDescription>Impact of Financial Leverage on Shareholder Returns</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.roe.toFixed(2)}%</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={result.leverageEffect >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {result.leverageEffect >= 0 ? "+" : ""}{result.leverageEffect.toFixed(2)}% from Leverage
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Risk Level</p>
                  <Badge variant={result.riskLevel === 'Low' || result.riskLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="font-semibold">Leverage Efficiency</p>
                  <Badge variant={result.efficiency === 'Positive' || result.efficiency === 'Exceptional' || result.efficiency === 'High' ? 'default' : 'destructive'}>
                    {result.efficiency}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">ROA (Unlevered)</p>
                  <p className="text-lg font-bold">{result.roeNoDebt.toFixed(2)}%</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Optimization opportunities</CardDescription>
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
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              ROE = ROA + [ (ROA - Cost of Debt) × (Debt / Equity) ]
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Where Cost of Debt = Interest Rate × (1 - Tax Rate)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The formula shows that Return on Equity (ROE) is determined by the Return on Assets (ROA), plus a &quot;kicker&quot; from leverage. This kicker is positive only if your ROA is higher than your after-tax cost of debt.
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
            Explore other capital structure and propertability tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/return-on-equity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">ROE Calculator</p>
                      <p className="text-sm text-muted-foreground">Detailed ROE analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Weighted Cost of Capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity</p>
                      <p className="text-sm text-muted-foreground">Solvency Assessment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Interest Coverage</p>
                      <p className="text-sm text-muted-foreground">Debt serviceability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-leverage-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Operating Leverage</p>
                      <p className="text-sm text-muted-foreground">Fixed vs Variable Costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-assets-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">ROA Calculator</p>
                      <p className="text-sm text-muted-foreground">Asset Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Financial Leverage Effect: Maximizing Returns through Debt" />
        <meta itemProp="description" content="Calculate and understand the Financial Leverage Effect. Learn how debt can effectively multiply your Return on Equity (ROE) when ROA exceeds borrowing costs, and the risks of negative leverage." />
        <meta itemProp="keywords" content="Financial Leverage Effect, ROE formula, Debt to Equity, Leverage Multiplier, Financial Risk, Capital Structure, Modigliani Miller, Tax Shield, Corporate Finance" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-20" />
        <meta itemProp="url" content="/definitive-financial-leverage-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Financial Leverage: The Double-Edged Sword of Finance</h1>
        <p className="text-lg italic text-muted-foreground">Master the mechanics of &quot;Trading on Equity&quot; to amplify shareholder value without additional personal capital investment.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is the Financial Leverage Effect?</a></li>
          <li><a href="#formula" className="hover:underline">The Mechanics: How the Formula Works</a></li>
          <li><a href="#positive-vs-negative" className="hover:underline">Positive vs. Negative Leverage</a></li>
          <li><a href="#tax-shield" className="hover:underline">The Power of the Tax Shield</a></li>
          <li><a href="#risks" className="hover:underline">Strategic Risks and Optimal Capital Structure</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is the Financial Leverage Effect?</h2>
        <p>The **Financial Leverage Effect** measures the impact of using debt (borrowed capital) on the returns available to equity shareholders (ROE). In essence, it answers the question: *Did borrowing money make the owners richer or poorer?*</p>
        <p>When a company can borrow money at a lower interest rate than the return it earns on its investments (ROA), the &quot;spread&quot; or difference creates extra value for the shareholders. This process is often called &quot;Gearing&quot; in the UK or &quot;Trading on Equity&quot; in the US.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Magnifier Analogy</h3>
        <p>Think of leverage as a magnifying glass. If your underlying business is profitable (Positive ROA), leverage magnifies that profitability for shareholders. However, if your business is struggling (Low ROA), leverage magnifies those losses, potentially leading to insolvency.</p>

        <hr />

        {/* FORMULA */}
        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mechanics: How the Formula Works</h2>
        <p>The relationship between Return on Assets (ROA), Return on Equity (ROE), and Leverage is mathematically precise. The formula is:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            {'ROE = ROA + (D/E × (ROA - net_interest_rate))'}
          </p>
        </div>

        <p>Where:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>ROA (Return on Assets):</strong> How efficient the company is at generating profit from its total assets.</li>
          <li><strong>D/E (Debt-to-Equity Ratio):</strong> The multiplier. The higher this number, the more leverage is applied.</li>
          <li><strong>Net Interest Rate:</strong> The cost of borrowing after accounting for tax benefits.</li>
        </ul>

        <p className="mt-4">The term <strong>(ROA - net_interest_rate)</strong> is known as the **Spread**. The entire goal of financial management regarding capital structure is to keep this spread positive.</p>

        <hr />

        {/* POSITIVE VS NEGATIVE */}
        <h2 id="positive-vs-negative" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Positive vs. Negative Leverage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">Positive Leverage</h3>
            <p>Occurs when <strong>ROA &gt; Cost of Debt</strong>.</p>
            <p>Every dollar borrowed is invested to earn more than the interest it costs. The surplus profit flows directly to the equity holders, boosting ROE far above ROA.</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/10">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Negative Leverage</h3>
            <p>Occurs when <strong>ROA &lt; Cost of Debt</strong>.</p>
            <p>The company is borrowing at a higher rate than it can earn. It must dip into sharehoder equity to pay the interest, eroding value. This is a path to bankruptcy.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example Scenario</h3>
        <p>Imagine Company A has an ROA of 10% and borrows money at 5%. If they have $100 in Equity and borrow $100 (D/E = 1):</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>They invest $200 total assets at 10% return = $20 Profit.</li>
          <li>They pay 5% interest on the $100 loan = $5 Interest.</li>
          <li>Net Profit = $15.</li>
          <li><strong>ROE = $15 / $100 Equity = 15%.</strong></li>
        </ul>
        <p>Without the loan, they would have just invested $100 at 10% = $10 Profit = 10% ROE. The leverage created an extra 5% return out of thin air.</p>

        <hr />

        {/* TAX SHIELD */}
        <h2 id="tax-shield" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Power of the Tax Shield</h2>
        <p>One of the primary incentives for corporate borrowing is the **Tax Shield**. In most jurisdictions, interest payments on debt are tax-deductible expenses.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How it Lowers Cost</h3>
        <p>If a company pays 6% interest on a loan but is in a 25% tax bracket:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Nominal Interest Rate: 6%</li>
          <li>Effective Interest Rate = 6% × (1 - 0.25) = <strong>4.5%</strong></li>
        </ul>
        <p>This lowers the &quot;hurdle rate&quot; required for Positive Leverage. The company only needs an ROA above 4.5% (not 6%) to benefit from borrowing.</p>

        <hr />

        {/* RISKS */}
        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Risks and Optimal Capital Structure</h2>
        <p>If leverage is so powerful, why not borrow infinite money? Because risk increases exponentially with debt.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Volatility Trap</h3>
        <p>High leverage increases the volatility of earnings. A small 2% drop in ROA could translate to a 10% or 20% crash in ROE for a highly leveraged firm.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Liquidity Issues</h3>
        <p>Interest payments are fixed obligations. Unlike dividends, which can be cut in bad times, interest <strong>must</strong> be paid. High leverage reduces the margin for error during economic downturns, increasing the probability of financial distress.</p>

        <section className="mt-8 p-6 bg-muted rounded-lg border-l-4 border-primary">
          <h3 className="text-lg font-bold text-primary mb-2">The Golden Rule</h3>
          <p className="italic">&quot;Leverage is great on the way up, but devastating on the way down. The optimal capital structure balances the tax benefits of debt against the rising costs of potential bankruptcy.&quot;</p>
        </section>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers to common questions about Financial Leverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What exactly is the Financial Leverage Effect?</h4>
              <p className="text-muted-foreground">
                It is the phenomenon where the use of fixed-cost debt financing alters the return on equity (ROE) for shareholders. If the return on assets (ROA) is higher than the cost of debt, the effect is positive, boosting ROE. If ROA is lower, it reduces ROE.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does this differ from Operating Leverage?</h4>
              <p className="text-muted-foreground">
                Operating Leverage relates to the mix of fixed vs. variable operational costs (e.g., rent vs. materials). Financial Leverage relates to how the business is funded (Debt vs. Equity). Both forms of leverage increase risk and potential return, but they act on different parts of the income statement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Spread&quot; in financial leverage?</h4>
              <p className="text-muted-foreground">
                The Spread is the difference between the Return on Assets (ROA) and the after-tax Cost of Debt. A positive spread means the company is earning more on its investments than it pays to borrow the money, creating value.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Tax Rate included in the calculation?</h4>
              <p className="text-muted-foreground">
                Because interest expenses are typically tax-deductible, the government effectively subsidizes part of the debt cost. The &quot;real&quot; cost to the company is the interest rate minus the tax savings, which makes leverage more attractive.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a higher Debt-to-Equity ratio always better if the spread is positive?</h4>
              <p className="text-muted-foreground">
                Not necessarily. While it mathematically increases ROE, higher debt increases bankruptcy risk. Lenders may also demand higher interest rates as debt levels rise, which eventually closes the spread and creates negative leverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens when Financial Leverage is negative?</h4>
              <p className="text-muted-foreground">
                When ROA is lower than the cost of debt, the company is losing money on every borrowed dollar. This loss is subtracted from the equity holders returns, meaning ROE will be significantly lower than ROA, and could even turn negative.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret a Leverage Effect of 0?</h4>
              <p className="text-muted-foreground">
                A leverage effect of zero (Neutral Leverage) means the ROA exactly equals the after-tax cost of debt. In this scenario, borrowing money neither helps nor hurts the ROE; the shareholders are earning the exact same return as the business assets themselves.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can this calculator be used for personal investments?</h4>
              <p className="text-muted-foreground">
                Yes. For example, in real estate investing, &quot;ROA&quot; would be your property cap rate, and the &quot;Cost of Debt&quot; is your mortgage rate. If the cap rate is higher than the mortgage, you have positive leverage, boosting your Cash-on-Cash return.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a safe Debt-to-Equity ratio?</h4>
              <p className="text-muted-foreground">
                It varies by industry. Capital-intensive industries like Utilities may sustain 2.0 or higher. Tech companies might stay below 0.5. Generally, a ratio below 1.0 is considered safe, while anything above 2.0 requires careful cash flow monitoring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation impact financial leverage?</h4>
              <p className="text-muted-foreground">
                Unexpected inflation often benefits borrowers (financial leverage) because they pay back debt with &quot;cheaper&quot; dollars, effectively lowering the real cost of debt. However, lenders may anticipate this by raising nominal interest rates.
              </p>
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
          <p>The Financial Leverage Effect Calculator determines how debt impacts shareholder returns.</p>
          <p>It highlights the critical &quot;Spread&quot; between asset returns and borrowing costs.</p>
          <p>Use this tool to optimize capital structure while maintaining a safe margin of safety against interest rate hikes or market downturns.</p>
        </CardContent>
      </Card>
    </div>
  );
}
