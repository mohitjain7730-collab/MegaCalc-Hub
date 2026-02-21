'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Percent, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  beginningARR: z.number().positive(),
  expansionRevenue: z.number().min(0),
  contractionRevenue: z.number().min(0),
  churnRevenue: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function SaaSNetRevenueRetentionNrrCalculator() {
  const [result, setResult] = useState<{
    nrr: number;
    endingARR: number;
    netRevenueChange: number;
    interpretation: string;
    nrrLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beginningARR: undefined,
      expansionRevenue: undefined,
      contractionRevenue: undefined,
      churnRevenue: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const endingARR = v.beginningARR + v.expansionRevenue - v.contractionRevenue - v.churnRevenue;
    const netRevenueChange = endingARR - v.beginningARR;
    const nrr = v.beginningARR > 0 ? (endingARR / v.beginningARR) * 100 : 0;
    return { nrr, endingARR, netRevenueChange };
  };

  const interpret = (nrr: number) => {
    if (nrr >= 120) return 'Exceptional net revenue retention - strong expansion and low churn driving outstanding growth from existing customers.';
    if (nrr >= 110) return 'Excellent NRR - expansion revenue significantly outweighs churn and contraction. Best-in-class SaaS metric.';
    if (nrr >= 100) return 'Good NRR - revenue from existing customers is stable or growing. Expansion is offsetting churn.';
    if (nrr >= 90) return 'Moderate NRR - some net revenue loss from existing cohort. Focus on expansion and reducing churn.';
    if (nrr >= 80) return 'Weak NRR - meaningful revenue erosion. Urgent need to improve retention and expansion.';
    return 'Critical NRR - severe revenue loss from existing customers. Immediate action required on churn and contraction.';
  };

  const getNrrLevel = (nrr: number) => {
    if (nrr >= 120) return 'Exceptional';
    if (nrr >= 110) return 'Excellent';
    if (nrr >= 100) return 'Good';
    if (nrr >= 90) return 'Moderate';
    if (nrr >= 80) return 'Weak';
    return 'Critical';
  };

  const getRecommendation = (nrr: number) => {
    if (nrr >= 120) return 'Maintain expansion playbooks and customer success. Consider pricing and packaging optimization for further upside.';
    if (nrr >= 110) return 'Continue focus on upsell, cross-sell, and retention. Benchmark against best-in-class (120%+).';
    if (nrr >= 100) return 'Prioritize expansion revenue and reduce contraction. Improve onboarding and success touchpoints.';
    if (nrr >= 90) return 'Urgent focus on churn reduction and expansion. Review pricing, product fit, and customer health.';
    if (nrr >= 80) return 'Critical retention and expansion initiatives required. Conduct churn analysis and customer interviews.';
    return 'Emergency retention focus. Address product-market fit, pricing, and customer success before scaling acquisition.';
  };

  const getStrength = (nrr: number) => {
    if (nrr >= 120) return 'Very Strong';
    if (nrr >= 110) return 'Strong';
    if (nrr >= 100) return 'Moderate';
    if (nrr >= 90) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (nrr: number, netRevenueChange: number, beginningARR: number) => {
    const insights = [];
    if (nrr >= 110) {
      insights.push('Expansion revenue is driving growth from existing customers');
      insights.push('Strong indicator of product stickiness and land-and-expand motion');
      insights.push('Investors highly value NRR above 110%');
    } else if (nrr >= 100) {
      insights.push('Existing customer base is revenue-stable or slightly growing');
      insights.push('Opportunity to improve through upsell and churn reduction');
      insights.push('Monitor contraction and churn drivers by segment');
    } else {
      insights.push('Net revenue loss from existing cohort - address churn and contraction');
      insights.push('Improve customer success and health monitoring');
      insights.push('Consider pricing and packaging to reduce downgrades');
    }
    if (beginningARR > 0 && netRevenueChange !== 0) {
      insights.push(`Net revenue change from existing customers: ${netRevenueChange >= 0 ? '+' : ''}$${netRevenueChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }
    return insights;
  };

  const getConsiderations = () => {
    return [
      'NRR excludes new customer revenue - measures only existing cohort',
      'Expansion includes upsell, cross-sell, and price increases',
      'Contraction includes downgrades and partial cancellations',
      'Churn is full customer cancellations',
      'Best-in-class SaaS often targets 110%+ NRR',
    ];
  };

  const onSubmit = (values: FormValues) => {
    const { nrr, endingARR, netRevenueChange } = calculate(values);
    setResult({
      nrr,
      endingARR,
      netRevenueChange,
      interpretation: interpret(nrr),
      nrrLevel: getNrrLevel(nrr),
      recommendation: getRecommendation(nrr),
      strength: getStrength(nrr),
      insights: getInsights(nrr, netRevenueChange, values.beginningARR),
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
            Revenue Retention Parameters
          </CardTitle>
          <CardDescription>
            Enter beginning ARR and revenue changes (expansion, contraction, churn) to calculate Net Revenue Retention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="beginningARR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Beginning ARR ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1000000"
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
                  name="expansionRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Expansion Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 150000"
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
                  name="contractionRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-amber-600" />
                        Contraction Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 30000"
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
                  name="churnRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Churn Revenue ($)
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
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate NRR
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
                <Repeat className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Net Revenue Retention (NRR)</CardTitle>
                  <CardDescription>Existing cohort revenue retention rate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.nrr.toFixed(1)}%</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">NRR Level</p>
                  <Badge variant={result.nrrLevel === 'Exceptional' || result.nrrLevel === 'Excellent' ? 'default' : result.nrrLevel === 'Good' ? 'secondary' : result.nrrLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.nrrLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Ending ARR</p>
                  <p className="text-lg font-bold">${result.endingARR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Net Revenue Change</p>
                  <p className={`text-lg font-bold ${result.netRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.netRevenueChange >= 0 ? '+' : ''}${result.netRevenueChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
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
          <CardDescription>Key components required for the Net Revenue Retention calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Beginning ARR
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Annual Recurring Revenue from the existing customer cohort at the start of the period. Excludes any revenue from customers acquired after the period start.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Snapshot of ARR from cohort at period start</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Same cohort tracked through the period</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Typically monthly or quarterly comparison</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude new logo ARR for pure retention view</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-4 w-4" />
                Expansion Revenue
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Additional ARR from existing customers during the period: upsell, cross-sell, and price increases.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Upsell (higher tier or more seats)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Cross-sell (new products or modules)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Price increases and list-price changes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Usage-based expansion (consumption growth)</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingDown className="h-4 w-4" />
                Contraction Revenue
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ARR lost from existing customers who downgraded or reduced commitment but did not fully churn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Plan downgrades (e.g. enterprise to team)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Seat or usage reductions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Partial cancellations (e.g. one product only)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Price concessions or discounts applied</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Churn Revenue
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ARR lost from existing customers who fully cancelled or did not renew during the period.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Full contract cancellation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Non-renewal at end of term</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Bankruptcy or company closure</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Report as ARR at time of churn (not remaining value)</span>
                </li>
              </ul>
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
              Ending ARR = Beginning ARR + Expansion - Contraction - Churn
            </p>
            <p className="font-mono text-sm text-center mt-2">
              NRR (%) = (Ending ARR / Beginning ARR) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground">NRR above 100% means expansion from existing customers exceeds churn and contraction. Best-in-class SaaS often targets 110%+.</p>
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
            Explore other SaaS and retention analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/saas-customer-acquisition-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Calculator</p>
                      <p className="text-sm text-muted-foreground">Customer acquisition cost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/ltv-calculator" className="block">
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
            <Link href="/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/payback-period-customer-acquisition-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Payback Period (CAC)</p>
                      <p className="text-sm text-muted-foreground">Months to recover CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/mrr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">MRR Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/arr-growth-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">ARR Growth Calculator</p>
                      <p className="text-sm text-muted-foreground">Annual recurring revenue growth</p>
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
        <meta itemProp="name" content="The Definitive Guide to SaaS Net Revenue Retention (NRR): Calculation, Interpretation, and Benchmarks" />
        <meta itemProp="description" content="An expert guide detailing the Net Revenue Retention (NRR) formula, its role in measuring revenue from existing customers, interpreting ideal thresholds (110%+), NRR vs. Gross Revenue Retention (GRR), and why investors and boards use NRR to assess product stickiness and land-and-expand success." />
        <meta itemProp="keywords" content="net revenue retention formula, NRR calculator, SaaS NRR, expansion revenue, churn and contraction, ARR retention, GRR vs NRR, net dollar retention NDR, land and expand, revenue retention rate, best-in-class NRR" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-nrr-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS Net Revenue Retention (NRR): Measuring Growth from Existing Customers</h1>
        <p className="text-lg italic text-muted-foreground">Master the metric that measures how much revenue you retain and expand from an existing customer cohort—and why best-in-class SaaS targets <strong className="font-semibold text-foreground">110%+ NRR</strong>.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#nrr-definition" className="hover:underline">Net Revenue Retention: Definition and Core Purpose</a></li>
          <li><a href="#nrr-formula" className="hover:underline">The NRR Formula and Components</a></li>
          <li><a href="#nrr-interpretation" className="hover:underline">Interpreting NRR and Ideal Thresholds</a></li>
          <li><a href="#nrr-vs-grr" className="hover:underline">NRR vs. Gross Revenue Retention (GRR)</a></li>
          <li><a href="#nrr-applications" className="hover:underline">Role in Investor and Board Reporting</a></li>
        </ul>
        <hr />

        {/* NRR: DEFINITION AND CORE PURPOSE */}
        <h2 id="nrr-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Revenue Retention: Definition and Core Purpose</h2>
        <p><strong className="font-semibold text-foreground">Net Revenue Retention (NRR)</strong>, sometimes called <strong className="font-semibold text-foreground">Net Dollar Retention (NDR)</strong>, measures how much revenue you retain and expand from an existing customer cohort over a period. It answers: &quot;From the ARR we had at the start of the period from this cohort, how much do we have at the end—after expansion, contraction, and churn?&quot; NRR is one of the most important SaaS metrics for investors and boards because it signals whether growth is durable and efficient.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why NRR Excludes New Customers</h3>
        <p>NRR deliberately excludes revenue from new customers acquired during the period. It isolates the performance of your existing base: retention, expansion, and contraction. New logo ARR is tracked separately (e.g. in new ARR or pipeline). Combining NRR with new ARR gives total ARR growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Product Stickiness and Land-and-Expand</h3>
        <p>High NRR indicates that existing customers are not only staying but spending more—through upsell, cross-sell, or price increases. It is a vital metric for investors, board reporting, and strategic planning because it signals sustainable growth from the current customer base.</p>

        <hr />

        {/* THE NRR FORMULA AND COMPONENTS */}
        <h2 id="nrr-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The NRR Formula and Components</h2>
        <p>NRR is calculated by comparing ending ARR from the cohort to beginning ARR, where ending ARR reflects expansion (add) and contraction and churn (subtract).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'Ending ARR = Beginning ARR + Expansion - Contraction - Churn'}
          </p>
          <p className="font-mono text-lg mt-2">
            {'NRR (%) = (Ending ARR / Beginning ARR) × 100'}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Expansion Revenue</h3>
        <p>Expansion is any increase in ARR from existing customers during the period:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Upsell: higher tier, more seats, or more usage.</li>
          <li>Cross-sell: new products or modules.</li>
          <li>Price increases: list-price or contract price changes.</li>
          <li>Usage-based expansion: consumption growth within the same contract.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Contraction and Churn</h3>
        <p>Contraction is ARR lost from downgrades or partial cancellations (customer still active). Churn is ARR lost from customers who fully cancelled or did not renew. Both are measured in ARR terms (e.g. the annualized value of the lost revenue at the time it was lost).</p>

        <hr />

        {/* INTERPRETING NRR AND IDEAL THRESHOLDS */}
        <h2 id="nrr-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting NRR and Ideal Thresholds</h2>
        <p>NRR is expressed as a percentage. A result of 110% means that from the beginning cohort ARR, you ended the period with 110% of that amount from the same cohort—i.e. net expansion of 10%.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">General Interpretation Guidelines</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">NRR = 100%:</strong> You retained all cohort revenue; expansion exactly offset contraction and churn. No net growth from existing customers.</li>
          <li><strong className="font-semibold">NRR &gt; 100%:</strong> Expansion from existing customers exceeds churn and contraction. Best-in-class SaaS often targets 110%+; above 120% is exceptional.</li>
          <li><strong className="font-semibold">NRR &lt; 100%:</strong> Net revenue loss from the cohort. Churn and contraction outweigh expansion. Focus on retention and expansion is critical.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The 110% Benchmark (Best-in-Class NRR)</h3>
        <p>Many top SaaS companies report <strong className="font-semibold text-foreground">NRR of 110% or higher</strong>. This indicates a strong land-and-expand motion: customers expand over time, reducing reliance on new acquisition for growth. Investors use NRR to assess product-market fit and the durability of revenue. Companies with NRR above 120% are often considered exceptional; those below 100% are losing net revenue from the existing cohort and should prioritize retention and expansion before scaling acquisition.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When NRR Is Low</h3>
        <p>NRR below 100% suggests that existing customers are contracting or churning faster than you are expanding. Before scaling acquisition, address churn drivers, onboarding, customer success, and pricing to improve NRR.</p>

        <hr />

        {/* NRR VS. GROSS REVENUE RETENTION (GRR) */}
        <h2 id="nrr-vs-grr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">NRR vs. Gross Revenue Retention (GRR)</h2>
        <p><strong className="font-semibold text-foreground">Gross Revenue Retention (GRR)</strong> measures retention only: it subtracts churn and contraction from beginning ARR but does not add expansion. So GRR is always ≤ 100%. NRR adds expansion revenue on top of the same base, which is why NRR can exceed 100% and is the preferred metric for growth-quality assessment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The GRR Formula</h3>
        <p>GRR = (Beginning ARR - Contraction - Churn) / Beginning ARR × 100. It answers: &quot;What share of cohort ARR did we retain?&quot; <strong className="font-semibold text-foreground">NRR</strong> adds expansion on top, so NRR can exceed 100% when expansion outweighs churn and contraction. Use GRR when you want to focus purely on minimizing downgrades and churn; use NRR when you want the full picture including upsell and cross-sell.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Use Each</h3>
        <p>Use GRR to focus purely on retention (minimizing downgrades and churn). Use NRR to capture the full picture: retention plus expansion. Investors and boards typically emphasize NRR because it reflects both retention and land-and-expand success.</p>

        <hr />

        {/* ROLE IN INVESTOR AND BOARD REPORTING */}
        <h2 id="nrr-applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Investor and Board Reporting</h2>
        <p>NRR is a standard metric in SaaS investor updates and board decks. It signals whether growth is coming from existing customers as well as new ones.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Valuation and Efficiency</h3>
        <p>High NRR reduces the need to acquire new customers to hit growth targets. It supports efficient growth and often correlates with stronger unit economics (e.g. LTV:CAC, payback). Investors may apply premium multiples to companies with best-in-class NRR.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Segment and Cohort Analysis</h3>
        <p>Calculate NRR by segment (e.g. SMB vs enterprise), product line, or cohort (e.g. by year of acquisition) to identify where retention and expansion are strongest and where to invest in customer success and product.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p><strong className="font-semibold text-foreground">Net Revenue Retention</strong> is the core metric for measuring revenue retained and expanded from an existing customer cohort. It excludes new customer revenue and combines expansion with contraction and churn. A target of <strong className="font-semibold text-foreground">110%+</strong> is common for best-in-class SaaS; above 120% is exceptional; below 100% indicates net revenue loss from the cohort and should trigger a focus on retention and expansion before scaling acquisition.</p>
        <p>Track NRR consistently by segment and cohort, report it alongside new ARR and CAC in investor and board materials, and use it to prioritize customer success, expansion playbooks, and churn reduction. When NRR is strong, growth is more efficient and sustainable.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about Net Revenue Retention (NRR)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is Net Revenue Retention (NRR)?</h4>
            <p className="text-muted-foreground">NRR measures how much revenue you retain and expand from an existing customer cohort over a period. It is (Ending ARR / Beginning ARR) × 100, where Ending ARR = Beginning ARR + Expansion - Contraction - Churn. It excludes new customer revenue and isolates the performance of your existing base.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good NRR?</h4>
            <p className="text-muted-foreground">Best-in-class SaaS often targets 110%+ NRR. Above 120% is exceptional. NRR of 100% means you retained all revenue from the cohort (expansion offset churn and contraction). Below 100% means net revenue loss from existing customers and should trigger focus on retention and expansion.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the difference between NRR and GRR?</h4>
            <p className="text-muted-foreground">Gross Revenue Retention (GRR) only subtracts churn and contraction from beginning ARR; it does not add expansion. So GRR is always ≤ 100%. NRR adds expansion, so NRR can exceed 100% when expansion outweighs churn and contraction. Use GRR for pure retention; use NRR for retention plus expansion.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does NRR matter to investors?</h4>
            <p className="text-muted-foreground">High NRR indicates strong product-market fit, land-and-expand motion, and that growth can come from existing customers as well as new sales. It reduces reliance on new acquisition and supports efficient growth. Investors often use NRR to assess the durability and quality of revenue.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I improve NRR?</h4>
            <p className="text-muted-foreground">Focus on expansion (upsell, cross-sell, price increases), reducing churn (onboarding, success, product fit), and minimizing contraction (downgrades, seat reductions). Customer success, usage-based expansion, and packaging play key roles. Segment NRR by cohort and product to find improvement levers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What period should I use for NRR?</h4>
            <p className="text-muted-foreground">NRR is typically calculated monthly or quarterly. Use a consistent period (e.g. trailing 12 months or quarter-over-quarter) and align beginning ARR and ending ARR to the same cohort definition so expansion, contraction, and churn are measured correctly.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should expansion include price increases?</h4>
            <p className="text-muted-foreground">Yes. Expansion revenue includes upsell, cross-sell, and price increases (list-price or contract price) from existing customers. Some companies report NRR with and without price increases to separate organic expansion from pricing. Be consistent in definition for comparability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I handle multi-year contracts?</h4>
            <p className="text-muted-foreground">ARR is typically recognized as the annualized value of the contract (total contract value / years). Churn is the ARR lost when a customer cancels or does not renew. Contraction is ARR lost from downgrades or partial cancellations. Use the same ARR definition for beginning and ending ARR.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can NRR be calculated by segment?</h4>
            <p className="text-muted-foreground">Yes. Calculate NRR by segment (e.g. SMB vs enterprise), product line, or cohort (e.g. by year of acquisition) to identify where retention and expansion are strongest and where to invest in customer success, product, or pricing.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my NRR is below 100%?</h4>
            <p className="text-muted-foreground">NRR below 100% means churn and contraction from the cohort exceed expansion. Before scaling acquisition, address churn drivers (onboarding, success, product fit), reduce contraction (packaging, pricing), and invest in expansion (upsell, cross-sell). Improving NRR often has a larger impact on growth than adding new customers at high CAC.</p>
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
                <strong className="block text-primary mb-1">SaaS Founders &amp; CFOs</strong>
                <span className="text-sm text-muted-foreground">To track retention and expansion from existing customers and report NRR to the board and investors.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Revenue &amp; Customer Success Leaders</strong>
                <span className="text-sm text-muted-foreground">To set targets for expansion and churn and measure the impact of upsell, cross-sell, and retention initiatives.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors &amp; Analysts</strong>
                <span className="text-sm text-muted-foreground">To assess product stickiness and growth quality and compare portfolio companies to best-in-class benchmarks (110%+).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Board Members</strong>
                <span className="text-sm text-muted-foreground">To monitor retention and expansion metrics and make informed decisions on where to invest in product and customer success.</span>
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
                <span><strong>Cohort definition:</strong> Beginning ARR must be from a clearly defined cohort (e.g. all customers as of period start). New customers acquired during the period are excluded from NRR.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Expansion vs. new:</strong> Ensure expansion revenue is only from existing cohort customers (upsell, cross-sell, price increases). Revenue from new logos should not be included.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Seasonal and one-time effects:</strong> Large one-time churn or expansion can skew a single period. Use trailing or annual NRR for smoother trends.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Best-in-Class SaaS (120%+ NRR)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A B2B SaaS with strong land-and-expand sees 120% NRR: expansion from upsell and cross-sell far outweighs churn and contraction. Growth from existing customers reduces reliance on new acquisition and supports efficient scaling. Investors value this highly.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Early-Stage with High Churn (85% NRR)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  An early-stage company with 85% NRR is losing net revenue from the existing cohort. Before scaling sales, they focus on onboarding, customer success, and product fit to reduce churn and increase expansion. Improving NRR to 100%+ often has a larger impact on growth than adding new customers at high CAC.
                </p>
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
          <p>The SaaS Net Revenue Retention (NRR) Calculator computes NRR from beginning ARR, expansion, contraction, and churn. NRR above 100% means expansion from existing customers exceeds churn and contraction; target 110%+ for best-in-class performance.</p>
          <p>NRR excludes new customer revenue and is a core metric for investors and boards. Pair NRR with new ARR and CAC for a complete view of SaaS unit economics and growth.</p>
        </CardContent>
      </Card>
    </div>
  );
}
