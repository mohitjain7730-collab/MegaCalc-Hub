'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingUp, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Timer, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  initialInvestment: z.number().positive('Investment must be positive'),
  discountRate: z.number().min(0, 'Rate cannot be negative').max(100, 'Rate cannot exceed 100%'),
  years: z.number().int().min(1, 'Duration must be at least 1 year').max(100, 'Duration cannot exceed 100 years'),

  // Optional inputs for granular analysis
  unitPrice: z.number().min(0).optional(),
  variableCost: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialBreakEvenNPVZeroCalculator() {
  const [result, setResult] = useState<{
    requiredOCF: number; // Operating Cash Flow
    requiredSalesUnits: number | null;
    requiredSalesRevenue: number | null;
    annuityFactor: number;
    viabilityStatus: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      discountRate: undefined,
      years: undefined,
      unitPrice: undefined,
      variableCost: undefined,
      fixedCosts: undefined,
      taxRate: undefined,
    },
  });

  const getViabilityStatus = (ocf: number, investment: number) => {
    const ratio = ocf / investment;
    if (ratio > 0.5) return 'Aggressive Target'; // Needs huge cash flow relative to investment
    if (ratio > 0.2) return 'Moderate Target';
    return 'Achievable Target';
  };

  const calculate = (v: FormValues) => {
    const r = v.discountRate / 100;
    const n = v.years;

    // Calculate Annuity Factor: (1 - (1+r)^-n) / r
    let annuityFactor = n; // Default for 0% rate
    if (r > 0) {
      annuityFactor = (1 - Math.pow(1 + r, -n)) / r;
    }

    // Required OCF to set NPV = 0
    // NPV = (OCF * Factor) - Investment = 0  =>  OCF = Investment / Factor
    const requiredOCF = v.initialInvestment / annuityFactor;

    // Calculate Unit Sales if inputs are provided
    let requiredSalesUnits: number | null = null;
    let requiredSalesRevenue: number | null = null;

    if (v.unitPrice !== undefined && v.variableCost !== undefined && v.fixedCosts !== undefined) {
      const p = v.unitPrice;
      const vc = v.variableCost;
      const fc = v.fixedCosts;
      const t = (v.taxRate || 0) / 100;

      // OCF = [(P - VC)*Q - FC]*(1-T) + Depreciation*T
      // We assume Depreciation = InitialInvestment / Years (Straight Line) for simplicity unless we ask for it separately.
      // Let's use simplified OCF = [(P - VC)*Q - FC] if T=0 to avoid confusion, or include depreciation tax shield if T>0.

      const dep = v.initialInvestment / v.years;
      const contributionMargin = p - vc;

      if (contributionMargin > 0) {
        // Solving for Q:
        // OCF = ((contributionMargin * Q) - fc) * (1 - t) + (dep * t);
        // OCF - (dep * t) = ((contributionMargin * Q) - fc) * (1 - t)
        // (OCF - dep * t) / (1 - t) = (contributionMargin * Q) - fc
        // ((OCF - dep * t) / (1 - t)) + fc = contributionMargin * Q
        // Q = [ ((OCF - dep * t) / (1 - t)) + fc ] / contributionMargin

        if (t === 1) {
          // Edge case t=100%
          requiredSalesUnits = null;
        } else {
          const term1 = (requiredOCF - (dep * t)) / (1 - t);
          const num = term1 + fc;
          requiredSalesUnits = num / contributionMargin;
          requiredSalesRevenue = requiredSalesUnits * p;
        }
      }
    }

    const insights = [];
    if (v.years < 3) insights.push('Short project duration significantly increases the annual cash flow required to break even.');
    if (v.discountRate > 15) insights.push('High discount rate reflects high risk, raising the hurdle for profitability.');
    if (requiredSalesUnits && requiredSalesUnits > 1000000) insights.push('The required sales volume is extremely high; verify market capacity.');

    const riskFactors = [];
    if (v.discountRate < 5 && v.years > 10) riskFactors.push('Low discount rate over long term may underestimate inflation risk.');
    if (requiredSalesUnits && requiredSalesUnits < 0) riskFactors.push('Negative sales quantity calculated. Check if Unit Price > Variable Cost.');

    let recommendation = 'Monitor annual cash flows closely. Failing to meet this target results in value destruction.';
    if (requiredOCF > v.initialInvestment * 0.3) recommendation = 'High risk: Project requires recovering >30% of investment annually to break even.';
    else recommendation = 'Lower risk: Reasonable annual cash flow targets relative to upfront cost.';

    setResult({
      requiredOCF,
      requiredSalesUnits,
      requiredSalesRevenue,
      annuityFactor,
      viabilityStatus: getViabilityStatus(requiredOCF, v.initialInvestment),
      recommendation,
      insights,
      riskFactors,
    });
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
            Enter the core financial details of your project investment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="initialInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Initial Investment ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 500000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Discount Rate (WACC) %
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Project Duration (Years)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Advanced: Sales Volume Break-even (Optional)</h4>
                  <Badge variant="outline" className="text-xs">Granular Analysis</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Unit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 50" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variableCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variable Cost ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fixedCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Costs ($/yr)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 20000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 21" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Financial Break-even
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Break-even Analysis Results</CardTitle>
                  <CardDescription>Targets required to achieve NPV = 0</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-muted/40 rounded-xl border border-primary/20 shadow-sm">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Required Annual Cash Flow (OCF)</p>
                  <p className="text-4xl font-extrabold text-primary">${result.requiredOCF.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">Per year for {form.getValues('years')} years</p>
                </div>

                {result.requiredSalesUnits !== null ? (
                  <div className="p-6 bg-muted/40 rounded-xl border shadow-sm">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Required Annual Sales Volume</p>
                    <p className="text-4xl font-extrabold text-foreground">{result.requiredSalesUnits.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xl font-normal text-muted-foreground">units</span></p>
                    <p className="text-xs text-muted-foreground mt-2">To generate the required OCF</p>
                  </div>
                ) : (
                  <div className="p-6 bg-muted/20 rounded-xl border border-dashed flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Enter Price & Costs to see Unit Volume requirement</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Viability Status</p>
                  <Badge variant={result.viabilityStatus === 'Achievable Target' ? 'default' : 'secondary'}>
                    {result.viabilityStatus}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FunctionSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">PV Annuity Factor</p>
                  <p className="mt-1 font-mono">{result.annuityFactor.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Total Revenue Target</p>
                  <p className="mt-1 font-bold">{result.requiredSalesRevenue ? `$${result.requiredSalesRevenue.toLocaleString()}` : '-'}</p>
                </div>
              </div>

              <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
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
                <CardDescription>Interpretation of your parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
                {result.insights.length === 0 && <p className="text-sm text-muted-foreground">No specific outliers detected in your inputs.</p>}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Potential pitfalls to watch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-green-600">
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    <span>Parameters look standard.</span>
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
            Define the variables used in Financial Break-even Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Initial Investment
              </h4>
              <p className="text-sm text-muted-foreground">
                The total upfront cost to start the project. This is the negative cash flow at Year 0 that must be "paid back" by future inflows.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Discount Rate (WACC)
              </h4>
              <p className="text-sm text-muted-foreground">
                The required rate of return or the cost of capital. It represents the opportunity cost of investing here versus elsewhere.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FunctionSquare className="h-4 w-4 text-primary" />
                PV Annuity Factor
              </h4>
              <p className="text-sm text-muted-foreground">
                A multiplier that converts a stream of future equal payments into a single specific Present Value. Calculated based on rate and years.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Operating Cash Flow (OCF)
              </h4>
              <p className="text-sm text-muted-foreground">
                The cash generated by the project operations annually. This is NOT just Net Income; it includes depreciation tax shields.
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
              Required OCF = Initial Investment / PV Annuity Factor
            </p>
            <p className="font-mono text-sm text-center mt-2">
              PV Annuity Factor = (1 - (1 + r)^-n) / r
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This formula derives the annual cash flow needed such that its discounted sum exactly equals the initial investment, resulting in a Net Present Value (NPV) of zero.
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
            Capital budgeting tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/npv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">NPV Calculator</p>
                      <p className="text-sm text-muted-foreground">Net Present Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/internal-rate-of-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">IRR Calculator</p>
                      <p className="text-sm text-muted-foreground">Internal Rate of Return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/project-irr-vs-wacc-comparison-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">IRR vs WACC</p>
                      <p className="text-sm text-muted-foreground">Profitability threshold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/payback-period-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Payback Period</p>
                      <p className="text-sm text-muted-foreground">Time to recover cost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cogs-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">COGS Estimator</p>
                      <p className="text-sm text-muted-foreground">Cost analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/profit-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Overall profitability</p>
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
        <meta itemProp="headline" content="Financial Break-even Analysis (NPV=0): The Complete Guide" />
        <meta itemProp="description" content="Master Financial Break-even Analysis. Learn why NPV=0 is the true hurdle rate for investment viability, distinct from simple accounting profit. A deep dive for CFOs and investors." />
        <meta itemProp="author" content="Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-12" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Financial Break-even Analysis: The True Bar for Value Creation</h1>
        <p className="text-lg italic text-muted-foreground">Most businesses focus on "Accounting Break-even"—the point where they stop losing money on paper. But for smart investors and CFOs, that bar is too low. The real question is: "When do we start creating economic value?" This guide explores Financial Break-even (NPV=0), the Gold Standard for capital budgeting.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Financial Break-even?</a></li>
          <li><a href="#accounting-vs-financial" className="hover:underline">The Critical Difference: Accounting vs. Financial Break-even</a></li>
          <li><a href="#the-math" className="hover:underline">The Mathematics of Value</a></li>
          <li><a href="#discount-rate" className="hover:underline">The Discount Rate: The Invisible Lever</a></li>
          <li><a href="#step-by-step" className="hover:underline">Step-by-Step Calculation Guide</a></li>
          <li><a href="#strategic-implications" className="hover:underline">Strategic Implications for Managers</a></li>
          <li><a href="#risks" className="hover:underline">Risks and Limitations</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Financial Break-even?</h2>
        <p>The <strong>Financial Break-even point</strong> is defined as the level of annual Operating Cash Flow (OCF) or sales volume required for a project to achieve a <strong>Net Present Value (NPV) of exactly zero</strong>.</p>
        <p className="mt-4">In lay terms, it is the performance level where a project exactly earns its keep. It covers:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>All operating expenses (COGS, SG&A).</li>
          <li>All taxes.</li>
          <li>The return of the original capital investment.</li>
          <li><strong>Crucially:</strong> The required return on that capital (interest to lenders and expected returns to shareholders).</li>
        </ul>
        <p className="mt-4">If a project performs below the Financial Break-even point but above the Accounting Break-even point, it is technically "profitable" in accounting terms (Net Income &gt; 0), but it is <strong>destroying shareholder value</strong> because it is earning less than the cost of capital. This distinction is the single most important concept in modern corporate finance.</p>

        <h2 id="accounting-vs-financial" className="text-2xl font-bold text-foreground pt-8">The Critical Difference: Accounting vs. Financial Break-even</h2>
        <p>To fully grasp the power of this tool, we must contrast it with its simpler cousin, Accounting Break-even.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="p-6 border rounded-xl bg-card shadow-sm">
            <h3 className="font-bold text-xl text-primary mb-4">Accounting Break-even</h3>
            <p className="text-sm font-semibold uppercase text-muted-foreground mb-2">The Formula</p>
            <p className="font-mono text-sm bg-muted p-2 rounded mb-4">Net Income = 0</p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Covers historical costs.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Includes depreciation as an expense.</span></li>
              <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-red-500 shrink-0" /> <span><strong>Ignores</strong> the timing of cash flows.</span></li>
              <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-red-500 shrink-0" /> <span><strong>Ignores</strong> the opportunity cost of capital (investors' expected return).</span></li>
            </ul>
            <p className="mt-4 text-sm italic">"We didn't lose money this year."</p>
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm border-primary/20">
            <h3 className="font-bold text-xl text-primary mb-4">Financial Break-even</h3>
            <p className="text-sm font-semibold uppercase text-muted-foreground mb-2">The Formula</p>
            <p className="font-mono text-sm bg-muted p-2 rounded mb-4">NPV = 0</p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Covers future cash flows.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Treats capital as a cost (Discount Rate).</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span><strong>Accounts</strong> for Time Value of Money ($1 today &gt; $1 in 5 years).</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>ensures investors get their required % return.</span></li>
            </ul>
            <p className="mt-4 text-sm italic">"We earned exactly the 10% return our investors demanded."</p>
          </div>
        </div>

        <h2 id="the-math" className="text-2xl font-bold text-foreground pt-8">The Mathematics of Value</h2>
        <p>The core equation revolves around the <strong>Present Value Annuity Factor</strong>. Since we are solving for a required operational level that remains roughly constant (an annuity) to cover the upfront investment, we use:</p>
        <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
          Investment = OCF × [ (1 - (1+r)^-n) / r ]
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Where <strong>r</strong> is the WACC and <strong>n</strong> is the project life.</p>
        <p className="mt-4">Rearranging this, we get the required Operating Cash Flow:</p>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg font-bold text-lg text-center text-primary">
          Required OCF = Investment / Annuity Factor
        </div>

        <h2 id="discount-rate" className="text-2xl font-bold text-foreground pt-8">The Discount Rate: The Invisible Lever</h2>
        <p>The Discount Rate (WACC) drives this entire calculation. A higher risk project demands a higher discount rate. As the rate rises, the "Annuity Factor" gets smaller, which means the <strong>Required OCF</strong> must get larger.</p>
        <p className="mt-2">This quantifies risk. A safe utility project might only need to earn $110/year on a $1000 investment. A risky biotech startup might need to earn $400/year on the same investment to break even financially, because the investors demand a 30% return.</p>

        <h2 id="step-by-step" className="text-2xl font-bold text-foreground pt-8">Step-by-Step Calculation Guide</h2>
        <ol className="list-decimal ml-6 mt-4 space-y-4">
          <li><strong>Determine Initial Investment:</strong> Sum all upfront costs (Equipment + R&D + Marketing launch).</li>
          <li><strong>Establish WACC:</strong> Calculate your weighted average cost of capital. This is your hurdle rate.</li>
          <li><strong>Calculate Annuity Factor:</strong> Use the WACC and project duration (n).</li>
          <li><strong>Find Required OCF:</strong> Divide Investment by the Factor. This is your "rent" you must pay to the capital providers every year.</li>
          <li><strong>Convert to Units (Optional):</strong> If you know your per-unit contribution margin (Price - Variable Cost), divide the Required OCF by the margin to see how many widgets you must sell.</li>
        </ol>

        <h2 id="strategic-implications" className="text-2xl font-bold text-foreground pt-8">Strategic Implications for Managers</h2>
        <p>Using this tool changes behavior:</p>
        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li><strong>Pricing Power:</strong> It forces you to consider if your price point can support the required volume.</li>
          <li><strong>Cost Control:</strong> If the required sales volume is impossible (e.g., exceeds total market size), you MUST reduce specific Fixed Costs or the Initial Investment to make the project viable.</li>
          <li><strong>Project Duration:</strong> It highlights the value of longevity. Extending a project's life from 5 to 10 years dramatically lowers the annual break-even requirement.</li>
        </ul>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-bold text-lg text-primary mb-2">Final Thought</p>
          <p>Financial Break-even is the "sanity check" for capitalism. It prevents capital from being wasted on projects that look profitable but actually return less than a safe alternative investment.</p>
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
            Common questions about Financial vs. Accounting Break-even
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Financial Break-even higher?</h4>
              <p className="text-muted-foreground">
                Because it includes the "cost of capital" as a real expense. Accounting break-even only looks at explicit costs (invoices you pay). Financial break-even looks at implicit costs (the return investors could have earned elsewhere).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does this include Depreciation?</h4>
              <p className="text-muted-foreground">
                In the OCF calculation, Depreciation is added back because it is a non-cash expense. However, it affects the tax calculation. Our formula calculates the <em>Cash Flow</em> needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Payback Period" for this?</h4>
              <p className="text-muted-foreground">
                At Financial Break-even, the "Discounted Payback Period" is exactly equal to the Project Life. The simple Payback Period will be shorter.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if my tax rate is 0%?</h4>
              <p className="text-muted-foreground">
                Then the tax shield benefit disappears working in your favor (from depreciation), but the tax burden on profits also disappears. The calculation simplifies significantly to just covering the investment cost.
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
                <strong className="block text-primary mb-1">CFOs & Finance Managers</strong>
                <span className="text-sm text-muted-foreground">To set minimum sales targets for new product launches that ensure shareholder value is preserved.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Entrepreneurs</strong>
                <span className="text-sm text-muted-foreground">To check if their "napkin math" business idea is actually viable when the cost of money is factored in.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investment Analysts</strong>
                <span className="text-sm text-muted-foreground">To reverse-engineer the market's expectations for a company's future cash flows based on its current stock price.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Project Managers</strong>
                <span className="text-sm text-muted-foreground">To understand the "hurdle" they must clear to justify their budget requests.</span>
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
                <span><strong>Constant Cash Flow Assumption:</strong> This tool assumes uniform annual cash flows. Real projects often have ramp-up periods where cash flow is lower.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Discount Rate Sensitivity:</strong> A small change in the estimated WACC can radically change the output. Always run a sensitivity analysis.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ignoring Optionality:</strong> This calc doesn't account for the "option" to expand, abandon, or pause the project, which might add value beyond the simple cash flows.</span>
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
          <p>The Financial Break-even (NPV=0) Calculator goes beyond simple accounting to find the true hurdle rate for value creation.</p>
          <p>It integrates the Time Value of Money directly into your sales targets.</p>
          <p>Use it to set robust, defensible financial goals for any capital investment.</p>
        </CardContent>
      </Card>
    </div>
  );
}
