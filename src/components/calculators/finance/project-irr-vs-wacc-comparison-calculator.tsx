'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowRightLeft, PieChart, LineChart, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  projectIRR: z.number().min(-100).max(1000),
  companyWACC: z.number().min(0).max(100),
  initialInvestment: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectIRRVsWACCComparisonCalculator() {
  const [result, setResult] = useState<{
    spread: number;
    decision: string;
    valueCreationStatus: string;
    evaEstimate: number | null;
    recommendation: string;
    strength: string;
    insights: string[];
    risks: string[];
    hurdleRateCheck: { safe: boolean; buffer: number };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectIRR: undefined,
      companyWACC: undefined,
      initialInvestment: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const spread = v.projectIRR - v.companyWACC;
    let evaEstimate = null;

    if (v.initialInvestment) {
      // simplified EVA estimate for one period or perpetuity proxy
      evaEstimate = v.initialInvestment * (spread / 100);
    }

    return { spread, evaEstimate };
  };

  const interpret = (spread: number) => {
    if (spread >= 5) return 'Strongly Value Accretive';
    if (spread >= 2) return 'Value Accretive';
    if (spread > 0) return 'Marginal Value Creation';
    if (spread === 0) return 'Value Neutral (Break-even)';
    if (spread > -2) return 'Marginal Value Destruction';
    return 'Value Destructive';
  };

  const getDecision = (spread: number) => {
    if (spread >= 2) return 'STRONG ACCEPT';
    if (spread > 0) return 'ACCEPT';
    if (spread === 0) return 'NEUTRAL';
    if (spread > -2) return 'REJECT (MARGINAL)';
    return 'STRONG REJECT';
  };

  const getRecommendation = (spread: number) => {
    if (spread >= 5) return 'Greenlight this project immediately. The returns significantly exceed the cost of capital, providing a substantial safety buffer against market volatility.';
    if (spread >= 2) return 'Proceed with the project. It creates solid shareholder value and clears the hurdle rate comfortably, allowing for minor execution errors.';
    if (spread > 0) return 'Proceed with caution. The project is profitable but offers a thin margin of error. Ensure cash flow forecasts are highly accurate.';
    if (spread === 0) return 'Re-evaluate. The project purely covers its costs but generates no economic profit. Only proceed if there are strategic, non-financial benefits (e.g., blocking a competitor).';
    if (spread > -2) return 'Hold or restructure. The returns do not justify the capital cost. Look for ways to reduce the initial investment or boost early cash flows to improve IRR.';
    return 'Reject the project. It significantly destroys shareholder value. Allocating capital here would be contrary to fiduciary duty unless it is a regulatory requirement.';
  };

  const getStrength = (spread: number) => {
    if (spread >= 5) return 'Excellent';
    if (spread >= 2) return 'Good';
    if (spread > 0) return 'Marginal';
    if (spread > -2) return 'Weak';
    return 'Poor';
  };

  const getInsights = (spread: number, irr: number, wacc: number) => {
    const insights = [];
    if (spread > 0) {
      insights.push(`Generates ${spread.toFixed(2)}% excess return above the cost of funding`);
      insights.push('Contributes positively to shareholder wealth (Economic Value Added)');
      if (spread < 2) insights.push('Sensitivity analysis recommended due to thin spread');
    } else {
      insights.push(`Fails to cover the ${wacc}% cost of capital by ${Math.abs(spread).toFixed(2)}%`);
      insights.push('Destroys shareholder value relative to opportunity cost');
      insights.push('Suggests capital would be better employed elsewhere');
    }

    if (irr > 25) insights.push('Very High IRR: Check if reinvestment assumption (MIRR) is realistic');
    if (wacc > 12) insights.push('High WACC: Capital is expensive; only high-yield projects are viable');

    return insights;
  };

  const getRisks = (spread: number) => {
    const risks = [];
    risks.push('Project Risk Premium: Does this project have higher risk than the company average?');
    risks.push('Reinvestment Assumption: IRR assumes interim cash flows are reinvested at the IRR rate.');

    if (spread < 3 && spread > 0) {
      risks.push('Hurdle Rate Sensitivity: A small rise in interest rates could make NPV negative.');
    }

    risks.push('Scale Ignorance: IRR ignores the absolute size of the profit (vs NPV).');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const { spread, evaEstimate } = calculate(values);

    setResult({
      spread,
      decision: getDecision(spread),
      valueCreationStatus: interpret(spread),
      evaEstimate,
      recommendation: getRecommendation(spread),
      strength: getStrength(spread),
      insights: getInsights(spread, values.projectIRR, values.companyWACC),
      risks: getRisks(spread),
      hurdleRateCheck: { safe: spread > 2, buffer: spread }
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Comparison Parameters
          </CardTitle>
          <CardDescription>
            Input the Project's internal return and the Company's cost of capital to assess viability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="projectIRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Project IRR (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 15.5"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyWACC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Company WACC (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 10.0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Initial Investment (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g. 500000"
                          {...field}
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
                Analyze Project Viability
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
                <ArrowRightLeft className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Decision Analysis</CardTitle>
                  <CardDescription>Capital Budgeting Assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-muted mb-4">
                  <span className={`font-bold tracking-wider ${result.decision.includes('ACCEPT') ? 'text-green-600' : result.decision.includes('REJECT') ? 'text-red-600' : 'text-amber-600'}`}>
                    {result.decision}
                  </span>
                </div>
                <p className="text-4xl font-bold text-primary mb-1">
                  {result.spread > 0 ? '+' : ''}{result.spread.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Net Spread (IRR - WACC)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-sm">Viability Strength</p>
                  <Badge className="mt-1" variant={['Excellent', 'Good'].includes(result.strength) ? 'default' : result.strength === 'Marginal' ? 'outline' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm">Value Creation Status</p>
                  <p className={`font-medium mt-1 ${result.spread >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {result.valueCreationStatus}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-sm">Est. Economic Value</p>
                  <p className={`font-bold text-lg mt-1 ${result.spread >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {result.evaEstimate !== null
                      ? `$${Math.abs(result.evaEstimate).toLocaleString()}`
                      : 'N/A'}
                    <span className="text-xs font-normal text-muted-foreground block">
                      {result.evaEstimate !== null ? (result.evaEstimate >= 0 ? '(Added)' : '(Destroyed)') : 'Inv. Needed'}
                    </span>
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Key Takeaways
                </CardTitle>
                <CardDescription>Why this result matters</CardDescription>
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

            <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Assumptions to challenge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            The two critical variables in capital budgeting decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
                Project IRR (Internal Rate of Return)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The expected annual growth rate that the investment is projected to generate. It is the "yield" of the project.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Derived from forecasted cash flows</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Higher is better (more profitable)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/10 rounded-lg border border-slate-100 dark:border-slate-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <PieChart className="h-4 w-4" />
                Company WACC (Weighted Average Cost of Capital)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The average rate a company pays to finance its assets, weighted by the proportion of debt and equity. It acts as the "Hurdle Rate".
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <span>Represents the broad opportunity cost</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <span>Lower is better (cheaper funding)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto text-center">
            <p className="font-mono text-sm mb-2">
              <strong>Spread</strong> = Project IRR (%) - Company WACC (%)
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              IF Spread &gt; 0 THEN Value Creation (Accept) <br />
              IF Spread &lt; 0 THEN Value Destruction (Reject)
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The fundamental logic is that a company should only invest in projects that return more than the cost of obtaining the capital to fund them. The positive difference represents the net wealth added to the company.
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
            Explore other capital budgeting and valuation tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Calculate cost of capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/npv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">NPV Calculator</p>
                      <p className="text-sm text-muted-foreground">Net Present Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/roi-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/payback-period-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Payback Period</p>
                      <p className="text-sm text-muted-foreground">Time to recover cost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/capital-budgeting-risk-standard-deviation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Capital Budgeting Risk</p>
                      <p className="text-sm text-muted-foreground">Risk (Sigma) analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/accounting-rate-of-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium">ARR Calculator</p>
                      <p className="text-sm text-muted-foreground">Accounting Return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO Metadata */}
        <meta itemProp="headline" content="Project IRR vs WACC: The Ultimate Guide to Investment Decisions" />
        <meta itemProp="description" content="Master the vital comparison between IRR and WACC. Learn why the spread drives shareholder value, uncover the reinvestment rate fallacy, and understand how to manage risk adjustments." />
        <meta itemProp="datePublished" content="2025-10-30" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Investment Decisions: The IRR vs. WACC Comparison Guide</h1>
        <p className="text-lg italic text-muted-foreground mb-6">
          The difference between a project's return and its cost of funding is the most important metric in corporate finance. It tells you if you are building a kingdom or digging a grave for your capital.
        </p>

        {/* Table of Contents */}
        <div className="bg-muted/30 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">In This Comprehensive Guide</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary">
            <li><a href="#core-concept" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> The Core Concept Defined</a></li>
            <li><a href="#understanding-irr" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Deep Dive: IRR Capabilities & Flaws</a></li>
            <li><a href="#understanding-wacc" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Deep Dive: WACC Mechanics</a></li>
            <li><a href="#decision-framework" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> The "Hurdle Rate" Framework</a></li>
            <li><a href="#agency-problem" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> The Agency Problem</a></li>
            <li><a href="#eva-connection" className="hover:underline flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> The EVA Connection (Economic Profit)</a></li>
          </ul>
        </div>

        <h2 id="core-concept" className="text-2xl font-bold text-foreground">The Core Concept: Value Creation vs. Value Destruction</h2>
        <p>
          Corporate finance boils down to one simple rule: <strong>Do not invest money at 5% if it costs you 10% to get that money.</strong>
        </p>
        <p>
          This comparison is the financial version of "buy low, sell high." You "buy" capital from investors (paying them WACC) and "sell" that capital to projects (earning IRR).
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Value Creation (IRR &gt; WACC):</strong> The project earns more than the financiers demand. The surplus belongs to the shareholders. This causes the stock price to rise.</li>
          <li><strong>Value Destruction (IRR &lt; WACC):</strong> The project earns less than the financiers demand. The company is effectively subsidizing the project from its own equity. This causes the stock price to fall.</li>
        </ul>

        <h2 id="understanding-irr" className="text-2xl font-bold text-foreground mt-8">Deep Dive: IRR Capabilities & Flaws</h2>
        <p>
          The <strong>Internal Rate of Return (IRR)</strong> is the annualized effective compounded return rate. It is mathematically defined as the discount rate that sets the Net Present Value (NPV) of all cash flows to zero.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Reinvestment Rate Fallacy</h3>
        <p>
          This is the most dangerous misunderstanding in finance. The IRR calculation mathematically assumes that <strong>all interim cash flows are reinvested at the IRR rate</strong>.
        </p>
        <p>
          <em>Example:</em> You have a crypto project with an IRR of 200%. The formula assumes that when you receive cash in Year 1, you can immediately reinvest it in another project also paying 200%. In reality, you might only be able to reinvest it in a bank account paying 5%. Use <strong>MIRR (Modified Internal Rate of Return)</strong> for a more realistic picture in high-IRR scenarios.
        </p>

        <h2 id="understanding-wacc" className="text-2xl font-bold text-foreground mt-8">Deep Dive: WACC Mechanics</h2>
        <p>
          The <strong>Weighted Average Cost of Capital (WACC)</strong> is not just a "bank rate." It is a blend of:
        </p>
        <ol className="list-decimal ml-6 space-y-3 mt-4">
          <li><strong>Cost of Debt (Kd):</strong> The interest rate on bonds/loans. (Tax-deductible, so it's cheaper).</li>
          <li><strong>Cost of Equity (Ke):</strong> The return shareholders expect. This is invisible but expensive. It is calculated using models like CAPM (Capital Asset Pricing Model).</li>
        </ol>
        <div className="my-6 p-4 bg-muted border rounded-lg">
          <p className="font-semibold text-center italic">
            "Equity is riskier than debt, so shareholders demand a higher return than the bank. Using only the bank rate as your hurdle will lead to bad investments."
          </p>
        </div>

        <h2 id="decision-framework" className="text-2xl font-bold text-foreground mt-8">The "Hurdle Rate" Framework</h2>
        <p>
          Most companies do not use the raw WACC as their hurdle rate. They add a <strong>Risk Premium</strong>.
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2 border">Project Type</th>
                <th className="p-2 border">Risk Level</th>
                <th className="p-2 border">Hurdle Rate Used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">Replacement (Maintenance)</td>
                <td className="p-2 border">Low</td>
                <td className="p-2 border">WACC (e.g., 8%)</td>
              </tr>
              <tr>
                <td className="p-2 border">New Product / Expansion</td>
                <td className="p-2 border">Medium</td>
                <td className="p-2 border">WACC + 2% (e.g., 10%)</td>
              </tr>
              <tr>
                <td className="p-2 border">R&D / New Market</td>
                <td className="p-2 border">High</td>
                <td className="p-2 border">WACC + 5% to 10% (e.g., 15-18%)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This prevents the "Average Risk Fallacy," where a risky project looks good only because it is being compared to a low-risk WACC.
        </p>

        <h2 id="agency-problem" className="text-2xl font-bold text-foreground mt-8">The Agency Problem</h2>
        <p>
          Why do managers sometimes pick projects with slightly lower value?
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>IRR Preference:</strong> Managers love percentages. It is easier to say "This project yields 25%" than "This project adds $400,000 to NPV."</li>
          <li><strong>Short-Termism:</strong> A project with a quick payback might have a high IRR but low total value. Managers might prefer this to boost their quarterly bonus, even if a long-term project (lower IRR, massive NPV) would be better for the company in 10 years.</li>
        </ul>

        <h2 id="eva-connection" className="text-2xl font-bold text-foreground mt-8">The Economic Value Added (EVA) Connection</h2>
        <p>
          The gap between IRR and WACC is the spread. When you multiply this spread by the capital invested, you get <strong>Economic Profit</strong> (similar to EVA).
        </p>
        <p className="font-mono bg-muted p-2 rounded mt-2 mb-4 w-fit">
          Economic Profit = Invested Capital × (ROIC - WACC)
        </p>
        <p>
          This is the truest measure of performance. A company can have growing accounting profits (Net Income) but be destroying economic value if they are pouring massive amounts of capital into low-return projects to achieve that growth.
        </p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Detailed answers to common capital budgeting dilemmas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Can I accept a project where IRR &lt; WACC?</h4>
              <p className="text-muted-foreground text-sm">
                Strictly speaking, no. However, exceptions exist for <strong>Strategic Projects</strong>. For example, a "Loss Leader" project might just break even (IRR = 0%), but it locks customers into your ecosystem where they buy high-margin products later. Also, regulatory or safety projects (updating fire sprinklers) must be done regardless of IRR to avoid shutting down.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What is the "Crossover Rate"?</h4>
              <p className="text-muted-foreground text-sm">
                When comparing two mutually exclusive projects, the Crossover Rate is the discount rate at which their NPVs are identical. If WACC is below this rate, Project A might be better; if above, Project B might be superior. It highlights potential conflicts between NPV and IRR rankings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Why does Wall Street hate Negative Spreads?</h4>
              <p className="text-muted-foreground text-sm">
                If a company consistently invests at an IRR of 5% while its WACC is 8%, it is mathematically shrinking. Institutional investors will sell the stock, reasoning they could take their money out and invest it elsewhere (the opportunity cost) for a better return.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">How do interest rate hikes affect this?</h4>
              <p className="text-muted-foreground text-sm">
                When the central bank raises rates, the "Risk-Free Rate" goes up. This raises both the Cost of Debt (interest payments) and Cost of Equity. Your WACC jumps from 8% to 10%. Suddenly, projects that were barely viable (IRR 9%) are now destroyers of value and must be cancelled.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What is "Divisional WACC"?</h4>
              <p className="text-muted-foreground text-sm">
                A conglomerate like GE or Siemens cannot use one WACC for everything. Their Financial Services division (high leverage) has a different risk profile than their Industrial Manufacturing division. Using a single WACC would result in the risky division getting all the budget (because it has high IRRs) while safe, steady divisions are starved of capital.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Does using debt lower WACC?</h4>
              <p className="text-muted-foreground text-sm">
                Usually, yes, because interest is tax-deductible and debt is safer than equity. However, if you take on <em>too much</em> debt, bankruptcy risk spikes. Lenders demand higher rates, and shareholders panic, causing WACC to shoot up. There is an "Optimal Capital Structure" where WACC is minimized.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Is IRR better than NPV?</h4>
              <p className="text-muted-foreground text-sm">
                No. NPV is theoretically superior because it measures absolute wealth creation in dollars. IRR is a relative measure (%) and can give multiple answers for non-conventional cash flows (negative-positive-negative). However, business people prefer IRR because "25% return" is intuitive.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What if IRR is extremely high (e.g., 1000%)?</h4>
              <p className="text-muted-foreground text-sm">
                This usually happens with small projects that pay back instantly. While nice, check the <strong>Scale</strong>. A 1000% return on a $100 lemonade stand helps you less than a 15% return on a $100M factory. Do not be seduced by the percentage; look at the dollars (NPV).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">How often should WACC be recalculated?</h4>
              <p className="text-muted-foreground text-sm">
                At least annually, or whenever there is a major shift in interest rates, corporate tax rates, or the company's stock volatility (Beta). Using a stale WACC from 2 years ago (when rates were lower) is a recipe for disaster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Does this calculate MIRR?</h4>
              <p className="text-muted-foreground text-sm">
                This specific tool compares standard IRR to WACC. Calculating MIRR requires inputting detailed cash flows year-by-year and a specific reinvestment rate, which is beyond the scope of this single-input comparison tool.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who benefits most from this analysis?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Corporate Finance (FP&A)</strong>
                <span className="text-sm text-muted-foreground">To filter hundreds of capital requests down to the few that truly add value.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Executives</strong>
                <span className="text-sm text-muted-foreground">To defend capital allocation decisions to the Board of Directors.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Private Equity Analysts</strong>
                <span className="text-sm text-muted-foreground">To assess if a portfolio company is deploying its cash efficiently or wasting it.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">MBA Students</strong>
                <span className="text-sm text-muted-foreground">To visualize the "Hurdle Rate" concept and the interaction between risk (WACC) and return (IRR).</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The Tech Startup (High Risk, High Reward)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>IRR: 40% | WACC: 25%</strong><br />
                  Even though the cost of capital is massive (VC money is expensive), the project returns 40%. The spread is +15%. <br />
                  <em>Verdict:</em> <strong>Accept.</strong> The massive value creation justifies the expensive funding.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Case B: The "Safe" Bet Gone Wrong</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  <strong>IRR: 6% | WACC: 8%</strong><br />
                  A utility company builds a new plant. It feels safe, but inflation drove construction costs up, lowering IRR to 6%. <br />
                  <em>Verdict:</em> <strong>Reject.</strong> The company is losing 2% per year on every dollar invested. It would be better off buying back its own shares.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Project IRR vs WACC Calculator is the primary litmus test for corporate value creation.</p>
          <p>It ensures that capital is allocated only to opportunities that generate returns superior to their cost of financing.</p>
          <p>Use this tool to enforce financial discipline and maximize long-term shareholder wealth.</p>
        </CardContent>
      </Card>
    </div>
  );
}
