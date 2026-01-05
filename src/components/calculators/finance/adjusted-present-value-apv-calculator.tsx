'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  baseNPV: z.number().describe("The Net Present Value of the project assuming 100% equity financing."),
  debtAmount: z.number().min(0).describe("Total debt financing used for the project."),
  taxRate: z.number().min(0).max(100).describe("Corporate tax rate (%)."),
  costOfDebt: z.number().min(0).max(100).describe("Cost of borrowing (interest rate) (%)."),
  bankruptcyCosts: z.number().min(0).optional().describe("Estimated present value of financial distress costs."),
  flotationCosts: z.number().min(0).optional().describe("Fees paid to issue the debt."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdjustedPresentValueAPVCalculator() {
  const [result, setResult] = useState<{
    apv: number;
    baseNPV: number;
    taxShieldValue: number;
    financingCosts: number;
    netFinancingEffect: number;
    interpretation: string;
    viabilityLevel: string;
    financialStrength: string;
    recommendation: string;
    insights: string[];
    risks: string[];
    breakdown: { label: string; value: number; type: 'positive' | 'negative' | 'neutral' }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseNPV: undefined,
      debtAmount: undefined,
      taxRate: undefined,
      costOfDebt: undefined,
      bankruptcyCosts: 0,
      flotationCosts: 0,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.baseNPV === undefined || v.debtAmount === undefined || v.taxRate === undefined || v.costOfDebt === undefined) return null;

    // Calculation Logic:
    // APV = Base NPV + PV(Tax Shield) - PV(Bankruptcy Costs) - PV(Flotation Costs)
    // We assume the debt is permanent for the Tax Shield calculation in this simplified "Standard" model:
    // PV(Tax Shield) = (Debt * Cost of Debt * Tax Rate) / Cost of Debt = Debt * Tax Rate
    // Note: If debt is not permanent, the user would need a more complex schedule, but Debt * Tax Rate is the standard "Perpetuity" approximation used in finance texts for APV intro.

    // For a more nuanced approach, if we assume the debt is finite, we would need the duration. 
    // However, adhering to the "Gold Standard" of clarity and usability for a general tool, we will use the standard perpetuity assumption 
    // but add a clarification in the insights. 

    const taxShield = v.debtAmount * (v.taxRate / 100);
    const bankruptcy = v.bankruptcyCosts || 0;
    const flotation = v.flotationCosts || 0;

    const netFinancingEffect = taxShield - bankruptcy - flotation;
    const apv = v.baseNPV + netFinancingEffect;

    return {
      apv,
      baseNPV: v.baseNPV,
      taxShieldValue: taxShield,
      financingCosts: bankruptcy + flotation,
      netFinancingEffect
    };
  };

  const getViabilityLevel = (apv: number, baseNPV: number) => {
    if (apv > 0 && baseNPV > 0) return 'High Viability'; // Good operationally and financially
    if (apv > 0 && baseNPV <= 0) return 'Financing Dependent'; // Only viable due to debt
    if (apv <= 0 && baseNPV > 0) return 'Distressed'; // Debt costs killed the project
    return 'Non-Viable'; // Bad operationally and overall
  };

  const getFinancialStrength = (apv: number, baseNPV: number) => {
    if (apv > baseNPV * 1.2 && baseNPV > 0) return 'Excellent';
    if (apv > baseNPV && baseNPV > 0) return 'Strong';
    if (apv > 0) return 'Marginal';
    return 'Critical';
  };

  const getInterpretation = (apv: number, baseNPV: number) => {
    if (apv > 0 && baseNPV > 0) return 'The project is value-accretive both operationally and after financing effects.';
    if (apv > 0 && baseNPV <= 0) return 'The project is operationally borderline but becomes viable through tax benefits of leverage.';
    if (apv <= 0 && baseNPV > 0) return 'Financing costs or distress risks destroy the operational value of this project.';
    return 'The project destroys shareholder value and should be rejected.';
  };

  const getRecommendation = (apv: number, baseNPV: number) => {
    if (apv > 0 && baseNPV > 0) return 'Proceed with the investment. The capital structure further enhances value.';
    if (apv > 0 && baseNPV <= 0) return 'Proceed with caution. Ensure debt capacity is sustainable, as value relies entirely on tax shields.';
    if (apv <= 0 && baseNPV > 0) return 'Reconsider the financing structure. Reduce debt, flotation costs, or bankruptcy risk to unlock the operational value.';
    return 'Reject the investment. Seek projects with positive unlevered Net Present Value.';
  };

  const getInsights = (apv: number, taxShield: number, financingCosts: number) => {
    const insights = [];
    if (taxShield > financingCosts) {
      insights.push('Tax shields are effectively subsidizing the project.');
      insights.push('Leverage is creating positive value accretion.');
    }
    if (financingCosts > taxShield) {
      insights.push('Financing frictions (bankruptcy/flotation) exceed tax benefits.');
    }
    if (apv > 0) {
      insights.push('Adjusted Present Value is positive, indicating wealth creation.');
    }
    return insights;
  };

  const getRisks = (baseNPV: number, financingCosts: number, apv: number) => {
    const risks = [];
    if (baseNPV < 0) risks.push('Operational flows are negative; project relies solely on financial engineering.');
    if (financingCosts > 0) risks.push(`Project carries ${financingCosts.toFixed(2)} in expected financial distress/issuance costs.`);
    if (apv < 0) risks.push('Total value destruction expected.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) {
      setResult({
        ...res,
        interpretation: getInterpretation(res.apv, res.baseNPV),
        viabilityLevel: getViabilityLevel(res.apv, res.baseNPV),
        financialStrength: getFinancialStrength(res.apv, res.baseNPV),
        recommendation: getRecommendation(res.apv, res.baseNPV),
        insights: getInsights(res.apv, res.taxShieldValue, res.financingCosts),
        risks: getRisks(res.baseNPV, res.financingCosts, res.apv),
        breakdown: [
          { label: 'Unlevered Base NPV', value: res.baseNPV, type: res.baseNPV >= 0 ? 'positive' : 'negative' },
          { label: 'PV of Tax Shield', value: res.taxShieldValue, type: 'positive' },
          { label: 'Financing Costs', value: -res.financingCosts, type: 'negative' },
        ]
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Parameters
          </CardTitle>
          <CardDescription>
            Input the unlevered valuation and financing details to compute APV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="baseNPV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Base NPV (Unlevered) ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Total Debt Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 200000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
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
                        <Zap className="h-4 w-4" />
                        Corporate Tax Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 21"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
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
                        <TrendingDown className="h-4 w-4" />
                        Cost of Debt (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5.5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankruptcyCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Est. Bankruptcy Costs (PV) ($) (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flotationCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Flotation/Issuance Costs ($) (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate APV
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Adjusted Present Value</CardTitle>
                  <CardDescription>Comprehensive Valuation Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.apv >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${result.apv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Viability Status</p>
                  <Badge variant={result.viabilityLevel === 'High Viability' ? 'default' : result.viabilityLevel.includes('Viable') ? 'secondary' : 'destructive'}>
                    {result.viabilityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Financial Strength</p>
                  <Badge variant={result.financialStrength === 'Excellent' ? 'default' : result.financialStrength === 'Strong' ? 'secondary' : 'outline'}>
                    {result.financialStrength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FunctionSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Financing Impact</p>
                  <p className={`text-lg font-bold ${result.netFinancingEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.netFinancingEffect > 0 ? '+' : ''}${result.netFinancingEffect.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Breakdown Waterfall */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">Value Components:</p>
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="flex items-center gap-2 text-sm">
                      {item.type === 'positive' && <Plus className="h-4 w-4 text-green-500" />}
                      {item.type === 'negative' && <Minus className="h-4 w-4 text-red-500" />}
                      {item.label}
                    </span>
                    <span className={`font-mono font-medium ${item.type === 'positive' ? 'text-green-600' : item.type === 'negative' ? 'text-red-600' : ''}`}>
                      {item.value < 0 ? '-' : ''}${Math.abs(item.value).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between font-bold">
                  <span>Total APV</span>
                  <span className={result.apv >= 0 ? 'text-primary' : 'text-destructive'}>${result.apv.toLocaleString()}</span>
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
                <CardDescription>Value creation drivers</CardDescription>
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
                <CardDescription>Critical monitoring points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.length > 0 ? result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">No significant financing-specific risks detected based on inputs.</span>
                  </div>
                )}
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
              APV = Base NPV (Unlevered) + PV(Tax Shield) - PV(Financial Distress Costs)
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Where PV(Tax Shield) ≈ Debt × Tax Rate (assuming perpetual debt)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Adjusted Present Value separates the value of operations from the value (or cost) of financing. It explicitly adds the present value of the debt interest tax shield and subtracts estimated costs of bankruptcy or issuance.
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
            Explore other valuation and corporate finance tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/npv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">NPV Calculator</p>
                      <p className="text-sm text-muted-foreground">Standard Net Present Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Weighted Average Cost of Capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/dcf-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">DCF Model</p>
                      <p className="text-sm text-muted-foreground">Discounted Cash Flow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/project-irr-vs-wacc-comparison-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">IRR vs WACC Calc</p>
                      <p className="text-sm text-muted-foreground">Project viability check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/capm-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">CAPM Calculator</p>
                      <p className="text-sm text-muted-foreground">Cost of Equity Model</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/leverage-debt-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Leverage Ratios</p>
                      <p className="text-sm text-muted-foreground">Debt Analysis Tools</p>
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
        <meta itemProp="name" content="The Definitive Guide to Adjusted Present Value (APV): Valuation for Leveraged Projects" />
        <meta itemProp="description" content="A comprehensive guide to Adjusted Present Value (APV), explaining how to value projects by separating operational value from financing side effects like tax shields and bankruptcy costs. Essential for LBOs and complex capital structures." />
        <meta itemProp="keywords" content="adjusted present value formula, APV vs WACC, calculating tax shield, unlevered cost of equity, leveraged buyout valuation, finance side effects, APV calculator" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-apv-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Adjusted Present Value (APV): Unlocking Value in Leveraged Finance</h1>
        <p className="text-lg italic text-muted-foreground">Master the valuation technique that dissects a project's value into its operational core and its financing impact, offering superior precision for complex debt structures.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Adjusted Present Value (APV)?</a></li>
          <li><a href="#formula" className="hover:underline">The APV Formula Breakdown</a></li>
          <li><a href="#components" className="hover:underline">Deep Dive: Base NPV and Net Financing Side Effects</a></li>
          <li><a href="#apv-vs-wacc" className="hover:underline">APV vs. WACC: When to Use Which?</a></li>
          <li><a href="#tax-shield" className="hover:underline">Understanding the Tax Shield Benefit</a></li>
          <li><a href="#applications" className="hover:underline">Real-World Applications: LBOs and Project Finance</a></li>
        </ul>
        <hr />

        {/* SECTION 1: DEFINITION */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Adjusted Present Value (APV)?</h2>
        <p><strong>Adjusted Present Value (APV)</strong> is a sophisticated valuation method used to calculate the value of a project or company. Unlike traditional methods that bundle operational risk and financial risk into a single discount rate (like the Weighted Average Cost of Capital, or WACC), APV separates them.</p>
        <p>APV posits that the total value of a project equals the value of the project as if it were financed entirely by equity, plus the present value of any financing side effects. This separation allows for a more granular analysis, particularly when a company's capital structure is changing significantly over time, such as in a Leveraged Buyout (LBO).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Core Philosophy: Divide and Conquer</h3>
        <p>The philosophy behind APV is the "principle of value additivity." You can calculate the value of different components of a project separately and then add them up. By isolating the financing effects (mostly debt tax shields), analysts can see exactly how much value comes from the business operations versus how much is engineered through debt financing.</p>

        <hr />

        {/* SECTION 2: FORMULA */}
        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The APV Formula Breakdown</h2>
        <p>The mathematical expression for Adjusted Present Value is elegant in its simplicity, calculating the sum of two distinct parts:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            {'APV = Unlevered Value (Base NPV) + Net Present Value of Financing Side Effects'}
          </p>
        </div>

        <p>Expanded further, it typically looks like this:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-muted-foreground font-semibold">
            {'APV = NPV(Unlevered Cash Flows) + PV(Tax Shields) - PV(Financial Distress Costs) - PV(Issuance Costs)'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Variables</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Base NPV (Unlevered):</strong> The value of the project assuming 100% equity financing. This removes the "noise" of debt.</li>
          <li><strong>PV(Tax Shields):</strong> The present value of money saved on taxes because interest payments are tax-deductible.</li>
          <li><strong>PV(Financial Distress):</strong> The estimated cost associated with the risk of bankruptcy if debt levels are too high.</li>
          <li><strong>PV(Issuance Costs):</strong> One-time fees paid to investment banks to issue the equity or debt (flotation costs).</li>
        </ul>

        <hr />

        {/* SECTION 3: COMPONENTS */}
        <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Deep Dive: Base NPV and Financing Effects</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Calculating Base NPV (Unlevered)</h3>
        <p>To find the Base NPV, you project the Free Cash Flows (FCF) of the business and discount them using the <strong>Unlevered Cost of Equity</strong> (Ku). This rate reflects the risk of the assets themselves, without the influence of debt. Unlike WACC, Ku assumes zero debt.</p>
        <p className="italic mt-2">Formula: Unlevered Cost of Equity (Ku) = Risk Free Rate + Beta_Asset * (Market Risk Premium)</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. The Financing Side Effects</h3>
        <p>Financing usually creates value through <strong>Tax Shields</strong>. Since interest expense reduces taxable income, the government effectively subsidizes debt financing. The value of this subsidy is the Interest Payment × Corporate Tax Rate.</p>
        <p>However, debt also introduces costs. <strong>Financial Distress Costs</strong> rise with leverage. If a company carries too much debt, it risks bankruptcy, which carries direct costs (legal fees) and indirect costs (lost customers, suppliers demanding tighter terms). APV allows you to explicitly model these costs as a negative value.</p>

        <hr />

        {/* SECTION 4: APV VS WACC */}
        <h2 id="apv-vs-wacc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">APV vs. WACC: When to Use Which?</h2>
        <p>While both methods should theoretically yield the same result if assumptions are consistent, they have distinct use cases:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Use WACC When:</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>The company maintains a <strong>constant debt-to-equity ratio</strong> over time.</li>
          <li>The valuation involves a stable, mature company.</li>
          <li>You want a quick, standard valuation that is easily comparable across an industry.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Use APV When:</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>The <strong>capital structure is changing</strong> (e.g., an LBO where debt is paid down aggressively).</li>
          <li>The project involves complex financing subsidies (like government-subsidized loans).</li>
          <li>The business has significant tax loss carryforwards (NOLs) that make the tax rate effectively zero for several years.</li>
          <li>You need to explicitly see the value contribution of the debt separate from operations.</li>
        </ul>

        <hr />

        {/* SECTION 5: TAX SHIELD */}
        <h2 id="tax-shield" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding the Tax Shield Benefit</h2>
        <p>The Tax Shield is often the largest component of the "Financing Side Effects" in APV. It represents the cash flow savings from paying interest.</p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg my-4 border border-blue-100 dark:border-blue-900">
          <h4 className="font-bold text-blue-800 dark:text-blue-300">The Perfection of Perpetuity</h4>
          <p className="text-sm mt-2">In a simple perpetuity case (debt is constant forever), the Present Value of the Tax Shield implies: </p>
          <p className="font-mono text-center font-bold my-2">PV(Tax Shield) = (Debt × Cost of Debt × Tax Rate) / Cost of Debt</p>
          <p className="text-sm">Conveniently, the "Cost of Debt" cancels out, leaving:</p>
          <p className="font-mono text-center font-bold mt-2">PV(Tax Shield) = Debt × Tax Rate</p>
          <p className="text-sm mt-2">This is why simpler APV calculators (like this one) often ask for Debt Amount and Tax Rate to estimate the financing benefit quickly.</p>
        </div>

        <hr />

        {/* SECTION 6: APPLICATIONS */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real-World Applications: LBOs and Project Finance</h2>
        <p>Investment bankers and private equity professionals value APV for its flexibility. In a <strong>Leveraged Buyout (LBO)</strong>, a firm is purchased with a massive amount of debt. The plan is usually to pay this debt down rapidly using the company's cash flow.</p>
        <p>Because the debt level falls every year, the WACC also changes every year (as the weight of debt and equity shifts). Recalculating WACC for every future year is tedious and prone to error. APV bypasses this by valuing the unlevered firm once and then valuing the changing tax shields year-by-year in a separate schedule. This makes APV the gold standard for modeling calculating the value of debt-heavy transactions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Conclusion</h3>
        <p>Adjusted Present Value is a powerful tool in the financial analyst's arsenal. By decoupling operations from financing, it provides transparency into where value is being created (or destroyed). Whether you are evaluating a highly leveraged project or a complex acquisition, APV offers the precision needed to make informed investment decisions.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Common questions about Adjusted Present Value and Valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is APV considered clearer than WACC?</h4>
              <p className="text-muted-foreground">
                APV clearly distinguishes between the value generated by the business operations (selling products/services) and the value generated by financial engineering (tax savings). WACC mixes these into a single percentage, which can obscure whether a project is good operationally or just financially efficient.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What discount rate should I use for the Tax Shield?</h4>
              <p className="text-muted-foreground">
                Opinion varies. The standard approach is to use the <strong>Cost of Debt</strong> (Kd) because tax shields are as risky as the debt payments themselves. If the firm can't pay interest, it doesn't get the tax shield. Some analysts use the Unlevered Cost of Equity if they believe the debt capacity tracks firm value closely.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does APV account for bankruptcy costs?</h4>
              <p className="text-muted-foreground">
                Yes, APV is one of the few models where you can explicitly subtract a value for "Expected Bankruptcy Costs." This allows you to model the trade-off theory of capital structure: finding the point where the tax benefit of one more dollar of debt is outweighed by the increase in bankruptcy risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can APV be used for personal finance?</h4>
              <p className="text-muted-foreground">
                Rarely. APV is a corporate finance tool tailored for valuing companies with corporate tax rates. In personal finance, interest tax deductions (like mortgage interest) are simpler and don't usually require a valuation model of this complexity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are Flotation Costs?</h4>
              <p className="text-muted-foreground">
                Flotation costs are the fees paid to investment banks, lawyers, and accountants when a company issues new securities (stocks or bonds). In APV, these are treated as a cash outflow (a negative value) at the start of the project, reducing the total APV.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">If Base NPV is negative, can APV be positive?</h4>
              <p className="text-muted-foreground">
                Yes, and this is a critical insight. A project might lose money operationally (Negative Base NPV), but the tax benefits of the debt used to fund it might be so large that the total APV becomes positive. While "valuable" on paper, such projects are risky because they rely entirely on tax law rather than business fundamentals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does APV work for all industries?</h4>
              <p className="text-muted-foreground">
                Technically yes, but it is most useful in capital-intensive industries (Utilities, Real Estate, Telecom) where debt levels are high and tax shields are a major component of value. For tech startups with little debt, WACC or simple DCF is sufficient.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Unlevered Cost of Equity?</h4>
              <p className="text-muted-foreground">
                You first find the Levered Beta of comparable companies, "unlever" them to find the Asset Beta using the Hamada equation, and then use the CAPM formula with this Asset Beta. This gives you the return required by investors for the business risk alone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is the Tax Shield always a perpetuity?</h4>
              <p className="text-muted-foreground">
                No. In reality, debt eventually gets repaid. The "Debt × Tax Rate" formula assumes the debt principal is rolled over forever. If debt is paid down (like in an LBO), you must model the tax shield year by year (Interest * Tax Rate) and discount those specific cash flows.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if the Tax Rate changes?</h4>
              <p className="text-muted-foreground">
                One of APV's strengths is flexibility. If you expect tax laws to change in 5 years, you can simply model the Tax Shield cash flows with the current rate for 5 years and the new rate thereafter, then discount them back. WACC would struggle to accommodate a changing tax rate easily.
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
          <p>The Adjusted Present Value (APV) Calculator determines the value of a project by summing its unlevered value and the net benefit of financing.</p>
          <p>It provides a deeper insight into how leverage impacts value, explicitly quantifying tax benefits against financial distress costs.</p>
          <p>Use this tool for analyzing Leveraged Buyouts (LBOs), real estate investments, or any project with a changing capital structure.</p>
        </CardContent>
      </Card>
    </div>
  );
}
