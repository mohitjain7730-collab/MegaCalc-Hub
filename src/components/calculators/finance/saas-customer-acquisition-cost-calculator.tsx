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
          <CardDescription>Key components for Customer Acquisition Cost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Sales + Marketing Spend
              </h4>
              <p className="text-sm text-muted-foreground">Total spend on sales and marketing in the period: salaries, programs, tools, ads, events. Use the same period as new customer count.</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <Users className="h-4 w-4" />
                New Customers Acquired
              </h4>
              <p className="text-sm text-muted-foreground">Number of new paying customers acquired in the same period. Exclude trials or non-paying signups if you measure paid CAC.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <UserPlus className="h-4 w-4" />
                Onboarding / Implementation Costs
              </h4>
              <p className="text-sm text-muted-foreground">Optional: cost to onboard or implement for new customers in the period. Adding this gives &quot;adjusted CAC&quot; (fully loaded cost per customer).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula */}
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
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to SaaS Customer Acquisition Cost (CAC)" />
        <meta itemProp="description" content="Expert guide to Customer Acquisition Cost: calculation, interpretation, LTV:CAC ratio, and payback period for SaaS unit economics." />
        <meta itemProp="keywords" content="customer acquisition cost, CAC calculator, SaaS CAC, LTV CAC ratio, payback period" />
        <meta itemProp="datePublished" content="2025-01-30" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS Customer Acquisition Cost (CAC)</h1>
        <p className="text-lg italic text-muted-foreground">Measure the fully loaded cost to acquire one new customer and pair it with LTV and payback for sustainable growth.</p>

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Customer Acquisition Cost?</h2>
        <p>CAC is the total cost to acquire one new customer over a period. It includes sales and marketing spend (and optionally onboarding/implementation costs) divided by the number of new customers acquired in the same period.</p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">CAC Formula</h2>
        <p>CAC = Sales + Marketing Spend / New Customers. Adjusted CAC = (Sales + Marketing + Onboarding) / New Customers. Always use the same period for spend and customer count.</p>

        <h2 id="ltv-cac" className="text-2xl font-bold text-foreground pt-8">LTV:CAC Ratio</h2>
        <p>LTV ÷ CAC indicates return on acquisition. A ratio of 3:1 or higher is typically healthy; below 2:1 suggests CAC is too high or LTV too low. Pair with payback period (months to recover CAC from gross margin).</p>

        <h2 id="conclusion" className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>CAC is a core SaaS metric for unit economics. Track it by channel and segment, align periods, and combine with LTV and payback for a full picture of acquisition efficiency.</p>
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
            <p className="text-muted-foreground">Customer Acquisition Cost (CAC) is the fully loaded cost to acquire one new customer over a period. It is total sales and marketing spend (and optionally onboarding costs) divided by the number of new customers acquired in the same period.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Which costs go into CAC?</h4>
            <p className="text-muted-foreground">Include all sales and marketing costs: people (salaries, commissions), programs (ads, events, content), and tools (CRM, marketing automation). Optionally add implementation/onboarding costs for adjusted CAC.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why align periods?</h4>
            <p className="text-muted-foreground">Spend and new customer count must be from the same period (e.g., same month or quarter). Otherwise CAC can be mis-stated due to timing of spend vs. when deals close.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does CAC connect to LTV?</h4>
            <p className="text-muted-foreground">LTV ÷ CAC gauges return on acquisition. Ratios of 3:1 or higher are typically strong; below 2:1 need improvement. Also track payback period (months to recover CAC from gross margin).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I track CAC?</h4>
            <p className="text-muted-foreground">Track monthly with rolling averages to smooth volatility. Keep cohorts and definitions consistent. Segment by channel and customer type for actionable insights.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Who Should Use This Calculator?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>SaaS founders, CMOs, and finance teams use CAC to measure acquisition efficiency. Pair with LTV and payback period for unit economics. Investors use CAC and LTV:CAC to assess scalability of the business.</p>
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
          <p>The SaaS Customer Acquisition Cost (CAC) Calculator computes CAC and adjusted CAC from sales and marketing spend and new customers. Use the same period for both. Target LTV:CAC ≥ 3:1 and monitor payback period.</p>
        </CardContent>
      </Card>
    </div>
  );
}
