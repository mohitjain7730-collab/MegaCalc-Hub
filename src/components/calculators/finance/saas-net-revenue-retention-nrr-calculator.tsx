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
          <CardDescription>Key components for Net Revenue Retention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Beginning ARR
              </h4>
              <p className="text-sm text-muted-foreground">Annual Recurring Revenue from the existing customer cohort at the start of the period. Excludes new customers.</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-4 w-4" />
                Expansion Revenue
              </h4>
              <p className="text-sm text-muted-foreground">Upsell, cross-sell, and price increases from existing customers during the period.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingDown className="h-4 w-4" />
                Contraction Revenue
              </h4>
              <p className="text-sm text-muted-foreground">Downgrades, partial cancellations, and seat reductions from existing customers.</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Churn Revenue
              </h4>
              <p className="text-sm text-muted-foreground">ARR lost from customers who fully cancelled during the period.</p>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/saas-customer-acquisition-cost-calculator" className="block">
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
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
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
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to SaaS Net Revenue Retention (NRR)" />
        <meta itemProp="description" content="Expert guide to Net Revenue Retention: calculation, interpretation, and why NRR is a key SaaS metric for investors and growth." />
        <meta itemProp="keywords" content="net revenue retention, NRR calculator, SaaS NRR, expansion revenue, churn, ARR retention" />
        <meta itemProp="datePublished" content="2025-01-30" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS Net Revenue Retention (NRR)</h1>
        <p className="text-lg italic text-muted-foreground">Understand how NRR measures revenue from existing customers and why 110%+ is the benchmark for best-in-class SaaS.</p>

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Net Revenue Retention?</h2>
        <p>Net Revenue Retention (NRR) measures how much revenue you retain and expand from an existing customer cohort over a period. It includes expansion (upsell, cross-sell) and subtracts contraction (downgrades) and churn (full cancellations). NRR excludes new customer revenue.</p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">NRR Formula</h2>
        <p>Ending ARR = Beginning ARR + Expansion - Contraction - Churn. NRR (%) = (Ending ARR / Beginning ARR) × 100. NRR above 100% means expansion from existing customers exceeds churn and contraction.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Benchmarks</h2>
        <p>Best-in-class SaaS often targets 110%+ NRR. Above 120% is exceptional. Below 100% indicates net revenue loss from the existing cohort and should trigger focus on retention and expansion.</p>

        <h2 id="conclusion" className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>NRR is a critical metric for SaaS companies and investors. It signals product stickiness, land-and-expand success, and sustainable growth from existing customers. Track NRR alongside new ARR for a complete picture of growth.</p>
      </section>

      {/* FAQ */}
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
            <p className="text-muted-foreground">NRR measures how much revenue you retain and expand from an existing customer cohort over a period. It is (Ending ARR / Beginning ARR) × 100, where Ending ARR = Beginning ARR + Expansion - Contraction - Churn. It excludes new customer revenue.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good NRR?</h4>
            <p className="text-muted-foreground">Best-in-class SaaS often targets 110%+ NRR. Above 120% is exceptional. NRR of 100% means you retained all revenue from the cohort (expansion offset churn and contraction). Below 100% means net revenue loss from existing customers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the difference between NRR and GRR?</h4>
            <p className="text-muted-foreground">Gross Revenue Retention (GRR) only subtracts churn and contraction from beginning ARR; it does not add expansion. So GRR ≤ 100%. NRR adds expansion, so NRR can exceed 100% when expansion outweighs churn and contraction.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does NRR matter to investors?</h4>
            <p className="text-muted-foreground">High NRR indicates strong product-market fit, land-and-expand motion, and that growth can come from existing customers as well as new sales. It reduces reliance on new acquisition and supports efficient growth.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I improve NRR?</h4>
            <p className="text-muted-foreground">Focus on expansion (upsell, cross-sell, price increases), reducing churn (onboarding, success, product fit), and minimizing contraction (downgrades, seat reductions). Customer success and usage-based expansion play key roles.</p>
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
          <p>SaaS founders, CFOs, and revenue leaders use NRR to track retention and expansion from existing customers. Investors use NRR to assess product stickiness and growth quality. Pair NRR with new ARR and CAC for a full view of SaaS unit economics.</p>
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
          <p>The SaaS Net Revenue Retention (NRR) Calculator computes NRR from beginning ARR, expansion, contraction, and churn. NRR above 100% means expansion from existing customers exceeds churn. Target 110%+ for best-in-class performance.</p>
        </CardContent>
      </Card>
    </div>
  );
}
