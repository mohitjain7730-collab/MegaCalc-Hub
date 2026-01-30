'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, UserPlus, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  salesMarketingSpend: z.number().min(0),
  newCustomers: z.number().positive(),
  onboardingCosts: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SaaSCustomerAcquisitionCostCalculator() {
  const [result, setResult] = useState<{
    cac: number;
    adjustedCac: number;
    interpretation: string;
    efficiencyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesMarketingSpend: undefined,
      newCustomers: undefined,
      onboardingCosts: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const cac = v.newCustomers > 0 ? v.salesMarketingSpend / v.newCustomers : 0;
    const onboarding = v.onboardingCosts ?? 0;
    const adjustedCac = v.newCustomers > 0 ? (v.salesMarketingSpend + onboarding) / v.newCustomers : 0;
    return { cac, adjustedCac };
  };

  const interpret = (adjustedCac: number) => {
    if (adjustedCac <= 300) return 'Excellent CAC - highly efficient acquisition. Strong unit economics and scalable channels.';
    if (adjustedCac <= 500) return 'Good CAC - efficient acquisition. Compare against LTV and payback for full picture.';
    if (adjustedCac <= 800) return 'Moderate CAC - acceptable but room for improvement. Optimize channel mix and targeting.';
    if (adjustedCac <= 1200) return 'High CAC - acquisition efficiency needs attention. Reassess targeting and onboarding costs.';
    return 'Very high CAC - unsustainable for most SaaS. Urgent need to improve channel efficiency and reduce cost per customer.';
  };

  const getEfficiencyLevel = (adjustedCac: number) => {
    if (adjustedCac <= 300) return 'Excellent';
    if (adjustedCac <= 500) return 'Good';
    if (adjustedCac <= 800) return 'Moderate';
    if (adjustedCac <= 1200) return 'High';
    return 'Very High';
  };

  const getRecommendation = (adjustedCac: number) => {
    if (adjustedCac <= 300) return 'Maintain and scale efficient channels. Pair CAC with LTV (target LTV:CAC ≥ 3:1) and payback period.';
    if (adjustedCac <= 500) return 'Continue optimizing. Track CAC by channel and segment. Focus on channels with shorter payback.';
    if (adjustedCac <= 800) return 'Improve targeting and channel mix. Streamline onboarding to reduce adjusted CAC. Monitor LTV:CAC ratio.';
    if (adjustedCac <= 1200) return 'Reassess sales and marketing spend. Prioritize high-converting channels and reduce waste.';
    return 'Critical - revisit acquisition strategy. Consider pricing, positioning, and channel efficiency. Aim for LTV:CAC ≥ 3:1.';
  };

  const getStrength = (adjustedCac: number) => {
    if (adjustedCac <= 300) return 'Very Strong';
    if (adjustedCac <= 500) return 'Strong';
    if (adjustedCac <= 800) return 'Moderate';
    if (adjustedCac <= 1200) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (cac: number, adjustedCac: number, newCustomers: number) => {
    const insights = [];
    if (adjustedCac <= 500) {
      insights.push('Acquisition efficiency is strong');
      insights.push('Suitable for scaling if LTV:CAC and payback are healthy');
      insights.push('Track CAC by channel to double down on winners');
    } else {
      insights.push('Cost per customer is elevated - optimize channels and targeting');
      insights.push('Compare CAC to LTV (target LTV:CAC ≥ 3:1)');
      insights.push('Shorten payback period where possible');
    }
    if (adjustedCac !== cac && adjustedCac > 0) {
      insights.push(`Onboarding adds $${(adjustedCac - cac).toFixed(2)} per customer to CAC`);
    }
    insights.push(`Total acquisition cost for period: $${(adjustedCac * newCustomers).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    return insights;
  };

  const getConsiderations = () => {
    return [
      'Use same period for spend and new customers to avoid mis-stating CAC',
      'Include all sales and marketing costs: people, programs, tools, ads',
      'Optionally add implementation/onboarding costs for adjusted CAC',
      'CAC varies by segment and channel - segment analysis is valuable',
      'Pair CAC with LTV and payback period for full unit economics',
    ];
  };

  const onSubmit = (values: FormValues) => {
    const { cac, adjustedCac } = calculate(values);
    setResult({
      cac,
      adjustedCac,
      interpretation: interpret(adjustedCac),
      efficiencyLevel: getEfficiencyLevel(adjustedCac),
      recommendation: getRecommendation(adjustedCac),
      strength: getStrength(adjustedCac),
      insights: getInsights(cac, adjustedCac, values.newCustomers),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Acquisition Parameters
          </CardTitle>
          <CardDescription>
            Enter sales and marketing spend and new customers acquired in the same period to calculate CAC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="salesMarketingSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Sales + Marketing Spend ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50000"
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
                  name="newCustomers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        New Customers Acquired
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="onboardingCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Onboarding / Implementation Costs ($) - Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
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
                Calculate CAC
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <UserPlus className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Customer Acquisition Cost (CAC)</CardTitle>
                  <CardDescription>Cost to acquire one new customer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.adjustedCac.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.cac !== result.adjustedCac && (
                    <>Base CAC: ${result.cac.toFixed(2)} (with onboarding: ${result.adjustedCac.toFixed(2)})</>
                  )}
                  {result.cac === result.adjustedCac && <>Per new customer</>}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Efficiency Level</p>
                  <Badge variant={result.efficiencyLevel === 'Excellent' || result.efficiencyLevel === 'Good' ? 'default' : result.efficiencyLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.efficiencyLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Base CAC</p>
                  <p className="text-lg font-bold">${result.cac.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Adjusted CAC</p>
                  <p className="text-lg font-bold">${result.adjustedCac.toFixed(2)}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
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

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>Key components required for the Customer Acquisition Cost calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Sales + Marketing Spend
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total spend on sales and marketing in the period. Use the same period as new customer count to avoid mis-stating CAC.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Salaries, commissions, and benefits (sales &amp; marketing)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Advertising, events, content, and programs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Tools: CRM, marketing automation, analytics</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude R&amp;D and G&amp;A; include only acquisition-related spend</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <Users className="h-4 w-4" />
                New Customers Acquired
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Number of new paying customers acquired in the same period as the spend. Consistency in definition is critical.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Count customers who became paying in the period</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Exclude trials or free users unless measuring blended CAC</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use same period as sales and marketing spend</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Segment by channel or cohort for deeper analysis</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <UserPlus className="h-4 w-4" />
                Onboarding / Implementation Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Optional: cost to onboard or implement for new customers in the period. Adding this gives &quot;adjusted CAC&quot; (fully loaded cost per customer).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Implementation and onboarding labor</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Training and enablement for new customers</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>One-time setup or migration costs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Use only costs attributable to new customers in the period</span>
                </li>
              </ul>
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
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              CAC = Sales + Marketing Spend / New Customers
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Adjusted CAC = (Sales + Marketing Spend + Onboarding Costs) / New Customers
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Use the same period for spend and new customers. Pair CAC with LTV (target LTV:CAC ≥ 3:1) and payback period for full unit economics.</p>
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
            Explore other SaaS and acquisition analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/ltv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">LTV Calculator</p>
                      <p className="text-sm text-muted-foreground">Lifetime value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/payback-period-customer-acquisition-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Payback Period (CAC)</p>
                      <p className="text-sm text-muted-foreground">Months to recover CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-net-revenue-retention-nrr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS NRR Calculator</p>
                      <p className="text-sm text-muted-foreground">Net revenue retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/burn-multiple-efficiency-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Burn Multiple</p>
                      <p className="text-sm text-muted-foreground">Efficiency metric</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">With revenue growth</p>
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
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to SaaS Customer Acquisition Cost (CAC): Calculation, Interpretation, and Unit Economics" />
        <meta itemProp="description" content="An expert guide detailing the Customer Acquisition Cost (CAC) formula, its primary role in measuring acquisition efficiency, interpreting ideal thresholds and benchmarks, the LTV:CAC ratio and payback period, and why investors use CAC to assess scalability and sustainability of SaaS growth." />
        <meta itemProp="keywords" content="customer acquisition cost formula, CAC calculator, SaaS CAC, LTV CAC ratio, payback period, acquisition efficiency, cost per customer, sales and marketing spend, adjusted CAC, unit economics" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-cac-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS Customer Acquisition Cost (CAC): Measuring Acquisition Efficiency</h1>
        <p className="text-lg italic text-muted-foreground">Master the fully loaded cost to acquire one new customer and pair it with <strong className="font-semibold text-foreground">LTV</strong> and <strong className="font-semibold text-foreground">payback</strong> for sustainable, scalable growth.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#cac-definition" className="hover:underline">Customer Acquisition Cost: Definition and Core Purpose</a></li>
          <li><a href="#cac-formula" className="hover:underline">The CAC Formula and Components</a></li>
          <li><a href="#cac-interpretation" className="hover:underline">Interpreting CAC and Ideal Thresholds</a></li>
          <li><a href="#cac-ltv" className="hover:underline">LTV:CAC Ratio and Payback Period</a></li>
          <li><a href="#cac-applications" className="hover:underline">Role in Unit Economics and Investor Reporting</a></li>
        </ul>
        <hr />

        {/* CUSTOMER ACQUISITION COST: DEFINITION AND CORE PURPOSE */}
        <h2 id="cac-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Customer Acquisition Cost: Definition and Core Purpose</h2>
        <p><strong className="font-semibold text-foreground">Customer Acquisition Cost (CAC)</strong> is the fully loaded cost to acquire one new customer over a period. It answers: &quot;How much did we spend on sales and marketing (and optionally onboarding) to win one new paying customer?&quot; CAC is a foundational SaaS metric for unit economics and is reported alongside LTV and payback to assess whether growth is scalable and sustainable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Period Alignment Matters</h3>
        <p>Spend and new customer count must be from the same period (e.g. same month or quarter). Otherwise CAC can be mis-stated: spend in one period may drive customers that close in the next. Aligning periods gives an accurate cost per acquired customer.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Acquisition Efficiency</h3>
        <p>CAC is a core SaaS metric for unit economics. It indicates how efficiently you convert sales and marketing spend into paying customers. Investors and boards use CAC alongside LTV and payback to assess scalability and sustainability of growth.</p>

        <hr />

        {/* THE CAC FORMULA AND COMPONENTS */}
        <h2 id="cac-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The CAC Formula and Components</h2>
        <p>CAC is calculated by dividing total sales and marketing spend (and optionally onboarding costs) by the number of new customers acquired in the same period.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'CAC = Sales + Marketing Spend / New Customers'}
          </p>
          <p className="font-mono text-lg mt-2">
            {'Adjusted CAC = (Sales + Marketing Spend + Onboarding Costs) / New Customers'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Sales and Marketing Spend</h3>
        <p>Include all costs directly tied to acquiring customers:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Salaries, commissions, and benefits for sales and marketing teams.</li>
          <li>Advertising, events, content, and demand-generation programs.</li>
          <li>Tools: CRM, marketing automation, analytics, and other acquisition-related software.</li>
          <li>Exclude R&amp;D and general &amp; administrative (G&amp;A) costs; include only acquisition-related spend.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining New Customers and Onboarding</h3>
        <p>New customers are paying customers acquired in the period. Exclude trials or free users unless you are measuring blended CAC. Onboarding/implementation costs (optional) are costs to activate new customers in the period; adding them gives adjusted CAC (fully loaded cost per customer).</p>

        <hr />

        {/* INTERPRETING CAC AND IDEAL THRESHOLDS */}
        <h2 id="cac-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting CAC and Ideal Thresholds</h2>
        <p>CAC is expressed in currency per customer (e.g. $500 per customer). Lower CAC is generally better, but interpretation depends on LTV, payback, and segment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">General Interpretation Guidelines</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">CAC &lt; $300–500 (typical SaaS):</strong> Often efficient acquisition. Compare against LTV and payback to confirm unit economics.</li>
          <li><strong className="font-semibold">CAC $500–800:</strong> Acceptable but room for improvement. Optimize channel mix and targeting.</li>
          <li><strong className="font-semibold">CAC &gt; $800–1200:</strong> High for many SaaS segments. Reassess targeting, channel efficiency, and onboarding costs.</li>
        </ul>
        <p className="mt-4">Benchmarks vary by segment (e.g. SMB vs enterprise), sales motion (inbound vs outbound), and geography. Track <strong className="font-semibold text-foreground">CAC by channel and segment</strong> for actionable insights. Enterprise and high-touch motions often have higher CAC but can be sustainable when LTV and payback are strong.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Danger of CAC in Isolation</h3>
        <p><strong className="font-semibold text-foreground">CAC alone</strong> does not indicate whether acquisition is sustainable. A low CAC with low LTV or long payback can be worse than a higher CAC with strong LTV and short payback. Always pair CAC with the <strong className="font-semibold text-foreground">LTV:CAC ratio</strong> and <strong className="font-semibold text-foreground">payback period</strong> for a complete picture of unit economics.</p>

        <hr />

        {/* LTV:CAC RATIO AND PAYBACK PERIOD */}
        <h2 id="cac-ltv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">LTV:CAC Ratio and Payback Period</h2>
        <p><strong className="font-semibold text-foreground">LTV ÷ CAC</strong> indicates return on acquisition. A ratio of <strong className="font-semibold text-foreground">3:1 or higher</strong> is typically healthy; below 2:1 suggests CAC is too high or LTV too low (or both). Investors and boards use the LTV:CAC ratio to assess whether growth can scale efficiently.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The 3:1 Rule</h3>
        <p>Many SaaS companies target <strong className="font-semibold text-foreground">LTV:CAC ≥ 3:1</strong>. This provides margin for payback, retention risk, and growth reinvestment. Ratios below 2:1 often need improvement through higher LTV (e.g. expansion, retention) or lower CAC (e.g. channel mix, targeting, onboarding). The 3:1 rule is a widely cited benchmark for efficient acquisition.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Payback Period</h3>
        <p>Payback period is the number of months of gross margin required to recover CAC. Shorter payback (e.g. &lt; 18–24 months for many SaaS) improves cash flow and reduces risk. Pair with LTV:CAC for a full picture of acquisition efficiency.</p>

        <hr />

        {/* ROLE IN UNIT ECONOMICS AND INVESTOR REPORTING */}
        <h2 id="cac-applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Unit Economics and Investor Reporting</h2>
        <p>CAC is a standard metric in SaaS investor updates and board decks. It is reported alongside LTV, payback, and NRR to assess scalability and sustainability of growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Segment and Channel Analysis</h3>
        <p>Calculate CAC by channel (e.g. inbound vs outbound, paid vs organic) and segment (e.g. SMB vs enterprise) to identify the most efficient acquisition paths and double down on winners.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Trend and Consistency</h3>
        <p>Track CAC monthly or quarterly with rolling averages to smooth volatility. Keep cohort and definition consistent (e.g. paid customers only, same period alignment) for comparable trends over time.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p><strong className="font-semibold text-foreground">Customer Acquisition Cost</strong> is the core metric for measuring the cost to acquire one new customer. Use the same period for spend and new customers; optionally add onboarding costs for <strong className="font-semibold text-foreground">adjusted CAC</strong>. Pair CAC with LTV (target <strong className="font-semibold text-foreground">LTV:CAC ≥ 3:1</strong>) and payback period for full unit economics. Track by channel and segment for actionable insights.</p>
        <p>Report CAC alongside NRR, LTV, and payback in investor and board materials. When CAC is efficient and LTV:CAC is strong, growth is scalable and sustainable. When CAC is high or payback is long, focus on channel optimization, targeting, and retention before scaling spend.</p>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about Customer Acquisition Cost (CAC)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is CAC?</h4>
            <p className="text-muted-foreground">Customer Acquisition Cost (CAC) is the fully loaded cost to acquire one new customer over a period. It is total sales and marketing spend (and optionally onboarding costs) divided by the number of new customers acquired in the same period. Use the same period for spend and customer count to avoid mis-stating CAC.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Which costs go into CAC?</h4>
            <p className="text-muted-foreground">Include all sales and marketing costs: people (salaries, commissions, benefits), programs (ads, events, content), and tools (CRM, marketing automation, analytics). Exclude R&amp;D and G&amp;A. Optionally add implementation/onboarding costs for adjusted CAC (fully loaded cost per customer).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why align periods?</h4>
            <p className="text-muted-foreground">Spend and new customer count must be from the same period (e.g., same month or quarter). Otherwise CAC can be mis-stated: spend in one period may drive customers that close in the next. Aligning periods gives an accurate cost per acquired customer.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does CAC connect to LTV?</h4>
            <p className="text-muted-foreground">LTV ÷ CAC gauges return on acquisition. Ratios of 3:1 or higher are typically strong; below 2:1 need improvement. Also track payback period (months to recover CAC from gross margin). CAC alone does not indicate sustainability—pair with LTV and payback for full unit economics.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I track CAC?</h4>
            <p className="text-muted-foreground">Track monthly or quarterly with rolling averages to smooth volatility. Keep cohort and definition consistent (e.g., paid customers only, same period alignment). Segment by channel and customer type for actionable insights.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is adjusted CAC?</h4>
            <p className="text-muted-foreground">Adjusted CAC includes onboarding/implementation costs in addition to sales and marketing spend. It represents the fully loaded cost to acquire and activate one new customer. Use it when onboarding is a meaningful part of the acquisition process.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include free trials or only paid customers?</h4>
            <p className="text-muted-foreground">For &quot;paid CAC,&quot; count only customers who became paying in the period. For &quot;blended CAC,&quot; you may include trials or free users if that aligns with your business model. Be consistent in definition and document it for comparability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I improve CAC?</h4>
            <p className="text-muted-foreground">Improve CAC by optimizing channel mix (shift to higher-converting channels), improving targeting (reduce waste), streamlining onboarding (reduce adjusted CAC), and increasing conversion (more customers per dollar of spend). Segment CAC by channel to double down on winners.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good payback period?</h4>
            <p className="text-muted-foreground">Payback period is months of gross margin to recover CAC. For many SaaS companies, payback under 18–24 months is considered healthy. Shorter payback improves cash flow and reduces risk. Pair with LTV:CAC for full unit economics.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do investors care about CAC?</h4>
            <p className="text-muted-foreground">Investors use CAC alongside LTV and payback to assess whether growth is scalable and sustainable. High CAC with low LTV or long payback suggests inefficient acquisition. Strong LTV:CAC and short payback support efficient scaling and often command premium valuations.</p>
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
                <strong className="block text-primary mb-1">SaaS Founders &amp; CMOs</strong>
                <span className="text-sm text-muted-foreground">To measure acquisition efficiency and set targets for CAC, LTV:CAC, and payback. Use the same period for spend and new customers.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Finance &amp; RevOps Teams</strong>
                <span className="text-sm text-muted-foreground">To report CAC and adjusted CAC to the board and investors and track trends by channel and segment.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors &amp; Analysts</strong>
                <span className="text-sm text-muted-foreground">To assess acquisition efficiency and scalability. Pair CAC with LTV and payback for full unit economics.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Board Members</strong>
                <span className="text-sm text-muted-foreground">To monitor CAC trends and LTV:CAC ratio and make informed decisions on sales and marketing investment.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations &amp; Accuracy Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Period alignment:</strong> Spend and new customer count must be from the same period. Misalignment (e.g., quarterly spend vs. monthly customers) can mis-state CAC.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Definition of &quot;customer&quot;:</strong> Be consistent: paid only vs. trials, new logo vs. expansion. Document definition for comparability across periods and segments.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Seasonal and one-time effects:</strong> Large campaigns or one-time spend can skew a single period. Use rolling averages or trailing periods for smoother trends.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Efficient Inbound SaaS ($400 CAC)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A product-led SaaS spends $40K on sales and marketing in a month and acquires 100 new paying customers. CAC = $400. With LTV of $1,500, LTV:CAC = 3.75:1 and payback under 12 months. Acquisition is efficient and scalable.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: High-Touch Enterprise ($1,200 CAC)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  An enterprise SaaS spends $120K in a quarter and acquires 100 new customers. CAC = $1,200. If LTV is $6,000+, LTV:CAC is still 5:1 and payback may be acceptable. High CAC can be sustainable when LTV is high and payback is reasonable; always pair CAC with LTV and payback.</p>
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
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The SaaS Customer Acquisition Cost (CAC) Calculator computes CAC and adjusted CAC from sales and marketing spend and new customers. Use the same period for both; optionally add onboarding costs for adjusted CAC.</p>
          <p>Target LTV:CAC ≥ 3:1 and monitor payback period. Track CAC by channel and segment for actionable insights. Pair with NRR and LTV for a complete view of SaaS unit economics.</p>
        </CardContent>
      </Card>
    </div>
  );
}
