'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingDown, AlertCircle, Target, Info, Landmark, Calculator, Percent, BarChart3, Shield, Users, Briefcase, AlertTriangle, CheckCircle2, FunctionSquare, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  sharesOutstanding: z.number().positive('Enter total shares outstanding'),
  newEsopPoolPct: z.number().min(0.1).max(50, 'ESOP pool typically 5–20%'),
  existingOptionPoolPct: z.number().min(0).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EsopDilutionImpactCalculator() {
  const [result, setResult] = useState<{
    postEsopShares: number;
    newPoolShares: number;
    dilutionToExistingPct: number;
    newPoolPct: number;
    interpretation: string;
    dilutionLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sharesOutstanding: undefined,
      newEsopPoolPct: 10,
      existingOptionPoolPct: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const existing = v.sharesOutstanding;
    const pct = v.newEsopPoolPct / 100;
    const postEsopShares = existing / (1 - pct);
    const newPoolShares = postEsopShares - existing;
    const dilutionToExistingPct = pct * 100;
    const newPoolPct = (newPoolShares / postEsopShares) * 100;
    return { postEsopShares, newPoolShares, dilutionToExistingPct, newPoolPct };
  };

  const interpret = (dilutionPct: number) => {
    if (dilutionPct <= 5) return 'Minimal dilution. Small ESOP top-up; existing shareholders retain most ownership.';
    if (dilutionPct <= 10) return 'Moderate dilution. Typical ESOP pool size for early-stage; aligns team incentives.';
    if (dilutionPct <= 15) return 'Meaningful dilution. Common for growth-stage; ensure pool supports hiring plan.';
    if (dilutionPct <= 20) return 'Significant dilution. Large pool; validate against multi-year hiring and retention needs.';
    return 'High dilution. Very large pool; consider staggering grants or smaller initial pool with refreshes.';
  };

  const getDilutionLevel = (dilutionPct: number) => {
    if (dilutionPct <= 5) return 'Minimal';
    if (dilutionPct <= 10) return 'Moderate';
    if (dilutionPct <= 15) return 'Meaningful';
    if (dilutionPct <= 20) return 'Significant';
    return 'High';
  };

  const getRecommendation = (dilutionPct: number) => {
    if (dilutionPct <= 5) return 'Pool is conservative; you may need to top up later. Plan refreshes if hiring aggressively.';
    if (dilutionPct <= 10) return 'Typical pool size. Model future rounds so cumulative dilution stays within target.';
    if (dilutionPct <= 15) return 'Ensure pool covers 2–3 years of hiring and key retention. Compare to stage benchmarks.';
    if (dilutionPct <= 20) return 'Large pool; document allocation policy and vesting. Consider investor expectations on pool size.';
    return 'Very large pool; consider phased allocation or investor discussion on size.';
  };

  const getStrength = (dilutionPct: number) => {
    if (dilutionPct <= 5) return 'Very Low Impact';
    if (dilutionPct <= 10) return 'Low Impact';
    if (dilutionPct <= 15) return 'Moderate Impact';
    if (dilutionPct <= 20) return 'High Impact';
    return 'Very High Impact';
  };

  const getInsights = (dilutionPct: number, newPoolShares: number, postEsopShares: number) => {
    const insights = [];
    if (dilutionPct <= 10) {
      insights.push('Dilution is in typical range for early-stage ESOP pools');
      insights.push('Pool size supports hiring and retention without over-diluting');
    } else if (dilutionPct <= 20) {
      insights.push('Larger pool; ensure it aligns with multi-year hiring plan');
      insights.push('Document allocation policy for investors and employees');
    } else {
      insights.push('Very large pool; consider investor expectations');
      insights.push('Phased grants or refreshes can reduce upfront dilution');
    }
    insights.push(`New pool: ${newPoolShares.toLocaleString(undefined, { maximumFractionDigits: 0 })} shares (${(newPoolShares / postEsopShares * 100).toFixed(1)}% of fully diluted)`);
    insights.push('Existing shareholders are diluted proportionally; new pool does not dilute the pool itself');
    return insights;
  };

  const getConsiderations = () => [
    'ESOP pool is usually created or topped up pre-money in a round, diluting existing shareholders.',
    'Vesting (e.g. 4-year with 1-year cliff) affects when options convert; unvested options are not yet shares.',
    'Compare pool size to stage benchmarks: seed often 10–15%, Series A 15–20%, growth stage 10–15% refreshes.',
    'SAFEs and convertible notes convert in the same round and dilute; model in a full cap table.',
    'Runway and hiring plan should drive pool size; avoid over-allocating or under-allocating.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: interpret(calc.dilutionToExistingPct),
      dilutionLevel: getDilutionLevel(calc.dilutionToExistingPct),
      recommendation: getRecommendation(calc.dilutionToExistingPct),
      strength: getStrength(calc.dilutionToExistingPct),
      insights: getInsights(calc.dilutionToExistingPct, calc.newPoolShares, calc.postEsopShares),
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
            ESOP Pool Parameters
          </CardTitle>
          <CardDescription>
            Enter current fully diluted shares and the new ESOP pool size to see dilution impact on existing shareholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sharesOutstanding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Total Shares Outstanding (Fully Diluted)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 10,000,000"
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
                  name="newEsopPoolPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        New ESOP Pool (% of Post-Pool Fully Diluted)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 10"
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
                  name="existingOptionPoolPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Existing Option Pool (% of Current) — Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 0"
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
                Calculate ESOP Dilution Impact
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
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>ESOP Dilution Impact</CardTitle>
                  <CardDescription>Ownership impact of the new option pool</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.dilutionToExistingPct.toFixed(1)}%</p>
                <p className="text-lg text-muted-foreground mt-2">Dilution to existing shareholders</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Dilution Level</p>
                  <Badge variant={result.dilutionLevel === 'Minimal' ? 'default' : result.dilutionLevel === 'Moderate' ? 'secondary' : result.dilutionLevel === 'Meaningful' ? 'outline' : 'destructive'}>
                    {result.dilutionLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Post-ESOP Fully Diluted Shares</p>
                  <p className="text-lg font-bold">{result.postEsopShares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">New Pool Size</p>
                  <p className="text-lg font-bold">{result.newPoolShares.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({result.newPoolPct.toFixed(1)}%)</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Dilution and pool sizing context</CardDescription>
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
                  Things to Consider
                </CardTitle>
                <CardDescription>Critical factors when sizing ESOP</CardDescription>
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
          <CardDescription>
            Key components for ESOP dilution calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BarChart3 className="h-4 w-4" />
                Shares Outstanding (Fully Diluted)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total shares that exist today including all issued common, preferred (as converted), and any already reserved or granted options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Common + preferred (as-converted)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Existing option pool (reserved + granted)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use cap table fully diluted count</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Percent className="h-4 w-4" />
                New ESOP Pool %
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The size of the new or top-up option pool as a percentage of the company <em>after</em> the pool is created (post-pool fully diluted).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Typical range: 5–20% by stage</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Pre-money pool dilutes existing shareholders</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Investors often require 10–15% at Series A</span>
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
              Post-ESOP Shares = Shares Outstanding ÷ (1 − ESOP Pool %)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              New Pool Shares = Post-ESOP Shares − Shares Outstanding
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The new pool is created by increasing total shares so that the pool represents the target percentage of the enlarged total. Existing shareholders are diluted proportionally.
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
            Explore other startup and equity tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/founder-dilution-after-funding-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Founder Dilution After Funding</p>
                      <p className="text-sm text-muted-foreground">Ownership after a round</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/post-funding-runway-extension-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Post-Funding Runway Extension</p>
                      <p className="text-sm text-muted-foreground">Runway after closing a round</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly cash burn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/startup-valuation-pre-money-vs-post-money-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pre-Money vs Post-Money Valuation</p>
                      <p className="text-sm text-muted-foreground">Valuation and ownership</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/hiring-cost-impact-on-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Hiring Cost Impact on Runway</p>
                      <p className="text-sm text-muted-foreground">Runway impact of new hires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/equity-split-calculator-for-co-founders" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Equity Split for Co-Founders</p>
                      <p className="text-sm text-muted-foreground">Co-founder equity split</p>
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
        <meta itemProp="name" content="The Definitive Guide to ESOP Dilution: Calculation, Impact on Ownership, and Pool Sizing" />
        <meta itemProp="description" content="An expert guide to ESOP (Employee Stock Option Plan) dilution: how new option pools dilute existing shareholders, formula for post-ESOP fully diluted shares, and best practices for pool sizing by stage." />
        <meta itemProp="keywords" content="ESOP dilution calculator, option pool dilution, employee stock option plan, fully diluted shares, startup option pool size, ESOP dilution formula" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/esop-dilution-impact-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to ESOP Dilution: Impact on Ownership and Pool Sizing</h1>
        <p className="text-lg italic text-muted-foreground">Understand how creating or expanding an employee option pool dilutes existing shareholders and how to size the pool for hiring and retention.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#esop-definition" className="hover:underline">What Is ESOP Dilution?</a></li>
          <li><a href="#esop-formula" className="hover:underline">The ESOP Dilution Formula and Components</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Dilution and Pool Size</a></li>
          <li><a href="#pre-money-pool" className="hover:underline">Pre-Money vs Post-Money Option Pool</a></li>
          <li><a href="#applications" className="hover:underline">Role in Fundraising and Cap Table</a></li>
        </ul>
        <hr />

        {/* WHAT IS ESOP DILUTION */}
        <h2 id="esop-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is ESOP Dilution?</h2>
        <p>An <strong>Employee Stock Option Plan (ESOP)</strong> reserves a percentage of the company’s equity for employees. When you create a new pool or top up an existing one, you increase the total number of shares (fully diluted). Existing shareholders—founders, investors, and prior option holders—are diluted because their share count stays the same while the denominator (total shares) increases.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Companies Create or Top Up Pools</h3>
        <p>Companies add or expand option pools to hire key employees, retain talent with equity, and align incentives. Pools are often created or increased at funding rounds (pre-money), so the dilution is borne by pre-round shareholders, and the new investor gets a post-money percentage that already includes the pool.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Who Is Diluted?</h3>
        <p>All existing shareholders are diluted proportionally when a new pool is created:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Founders:</strong> Ownership percentage drops; share count stays the same.</li>
          <li><strong className="font-semibold">Prior investors:</strong> Same effect—same shares, smaller slice of a larger pie.</li>
          <li><strong className="font-semibold">Existing option holders:</strong> Already-granted options are diluted unless the plan explicitly protects them (rare).</li>
        </ul>

        <hr />

        {/* THE ESOP DILUTION FORMULA AND COMPONENTS */}
        <h2 id="esop-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The ESOP Dilution Formula and Components</h2>
        <p>If the new pool is to be <strong>P%</strong> of the company after the pool is in place (post-pool fully diluted), then:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Post-ESOP Shares = Shares Outstanding ÷ (1 − P ÷ 100)
          </p>
        </div>
        <p>New pool shares = Post-ESOP shares − Shares outstanding. The dilution to existing shareholders equals P% (each existing holder’s ownership percentage drops by that amount in relative terms).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Shares Outstanding (Fully Diluted)</h3>
        <p>Use the fully diluted share count before the new pool:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Common stock (issued and outstanding).</li>
          <li>Preferred stock (as-converted to common).</li>
          <li>Existing option pool (reserved + granted, if already in the cap table).</li>
          <li>SAFEs and convertible notes (as-converted at the round, if applicable).</li>
        </ul>

        <hr />

        {/* INTERPRETING DILUTION AND POOL SIZE */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Dilution and Pool Size</h2>
        <p>Typical pool sizes: <strong>5–10%</strong> at seed, <strong>10–15%</strong> at Series A, and <strong>10–15%</strong> refreshes at later stages. A 10% pool means 10% dilution to existing shareholders.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stage Benchmarks</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Seed:</strong> Often 10–15% to cover early hires and advisors.</li>
          <li><strong className="font-semibold">Series A:</strong> 15–20% post-money is common; investors may require it in the term sheet.</li>
          <li><strong className="font-semibold">Growth stage:</strong> Refreshes of 10–15% over time; avoid one very large pool that over-dilutes.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Too Small vs Too Large</h3>
        <p>Balance pool size against multi-year hiring and retention: too small and you run out of options and must top up (causing another round of dilution); too large and you over-dilute existing shareholders and may signal misalignment with investors.</p>

        <hr />

        {/* PRE-MONEY VS POST-MONEY OPTION POOL */}
        <h2 id="pre-money-pool" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pre-Money vs Post-Money Option Pool</h2>
        <p>When the pool is <strong>pre-money</strong>, it is created before the new investment. Founders and prior investors are diluted; the new investor’s percentage is calculated on the post-money cap table that already includes the pool.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Pre-Money Pool (Standard)</h3>
        <p>In most venture rounds the option pool is created or topped up pre-money. The new investor receives a percentage of the company after the pool is in place, so the investor is not diluted by the pool—founders and prior holders are.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Post-Money Pool</h3>
        <p>When the pool is <strong>post-money</strong>, the new investor is diluted too. Post-money pools are less common; term sheets usually specify pre-money pool treatment.</p>

        <hr />

        {/* ROLE IN FUNDRAISING AND CAP TABLE */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Fundraising and Cap Table</h2>
        <p>Investors often require a sufficient option pool (e.g. 10% post-money) before closing. Use this calculator to see the dilution impact of that requirement.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Term Sheet and Cap Table</h3>
        <p>When negotiating a round, model the requested pool size to see founder and existing-shareholder dilution. For multiple rounds, SAFEs, and convertible notes, use a full cap table to track cumulative dilution over time.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Best Practice</h3>
        <p>Size the pool to support 18–24 months of hiring and key retention grants. Document allocation and vesting policy so investors and employees understand how the pool will be used.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>ESOP dilution is the direct reduction in ownership percentage for existing shareholders when a new option pool is created or increased. Use the formula and this calculator to quantify the impact before a round or when planning a pool top-up.</p>
        <p>Size the pool to support hiring and retention while keeping cumulative dilution in line with stage benchmarks and investor expectations. For multiple rounds and complex cap tables, pair this tool with a full cap table or multi-round dilution calculator.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about ESOP dilution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is ESOP dilution?</h4>
              <p className="text-muted-foreground">
                ESOP dilution is the reduction in ownership percentage for existing shareholders when a new employee stock option pool is created or increased. New shares are added so that the pool represents a target percentage of the company; existing holders keep the same number of shares but a smaller percentage of the total.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate ESOP dilution?</h4>
              <p className="text-muted-foreground">
                Post-ESOP fully diluted shares = Current shares ÷ (1 − Pool %). New pool shares = Post-ESOP shares − Current shares. The dilution to existing shareholders equals the pool percentage (e.g. a 10% pool causes 10% relative dilution to existing holders).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a typical ESOP pool size?</h4>
              <p className="text-muted-foreground">
                Seed rounds often use 10–15%, Series A 15–20%, and growth stage 10–15% for refreshes. Benchmarks vary by geography and sector; investors frequently require a minimum pool (e.g. 10% post-money) at the round.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is the option pool pre-money or post-money?</h4>
              <p className="text-muted-foreground">
                In most venture rounds the pool is created or topped up pre-money, so founders and existing investors are diluted and the new investor’s percentage is calculated on a cap table that already includes the pool. Post-money pools dilute the new investor as well.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does ESOP dilution affect founders?</h4>
              <p className="text-muted-foreground">
                Founders are diluted along with other existing shareholders. A 10% pre-money pool reduces each founder’s ownership percentage by 10% in relative terms (e.g. from 50% to 45% of the larger total). Cumulative dilution from multiple rounds and pools should be modeled in a cap table.
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
                <strong className="block text-primary mb-1">Founders</strong>
                <span className="text-sm text-muted-foreground">To see how a new or larger option pool dilutes your ownership before a round.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To check pool size and dilution impact when negotiating term sheets.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">HR / People</strong>
                <span className="text-sm text-muted-foreground">To align pool size with hiring and retention plans.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors</strong>
                <span className="text-sm text-muted-foreground">To explain dilution and pool sizing to founders and boards.</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>This calculator models a single pool creation/top-up. For multiple rounds and SAFEs, use a full cap table.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Vesting and exercise timing are not included; only fully diluted ownership impact is shown.</span>
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
          <p>The ESOP Dilution Impact Calculator shows how creating or increasing an employee option pool dilutes existing shareholders.</p>
          <p>Use it to size the pool and understand ownership impact before a funding round or when planning hiring and retention.</p>
        </CardContent>
      </Card>
    </div>
  );
}
