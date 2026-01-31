'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Percent, Target, Zap, Info, FunctionSquare, Calculator, DollarSign, CheckCircle2, AlertCircle, Briefcase, AlertTriangle, Landmark, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LEAD_MULTIPLIER = 1.15;

const formSchema = z.object({
  numFounders: z.literal(2).or(z.literal(3)).or(z.literal(4)),
  // Co-founder 1
  name1: z.string().optional(),
  idea1: z.number().min(0).max(100),
  time1: z.number().min(0).max(100),
  capital1: z.number().min(0).max(100),
  lead1: z.boolean().optional(),
  // Co-founder 2
  name2: z.string().optional(),
  idea2: z.number().min(0).max(100),
  time2: z.number().min(0).max(100),
  capital2: z.number().min(0).max(100),
  lead2: z.boolean().optional(),
  // Co-founder 3
  name3: z.string().optional(),
  idea3: z.number().min(0).max(100),
  time3: z.number().min(0).max(100),
  capital3: z.number().min(0).max(100),
  lead3: z.boolean().optional(),
  // Co-founder 4
  name4: z.string().optional(),
  idea4: z.number().min(0).max(100),
  time4: z.number().min(0).max(100),
  capital4: z.number().min(0).max(100),
  lead4: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type FounderSplit = { name: string; equityPct: number; score: number };

type ResultPayload = {
  splits: FounderSplit[];
  interpretation: string;
  recommendation: string;
  status: 'balanced' | 'moderate' | 'skewed';
  recommendations: string[];
  insights: string[];
  considerations: string[];
};

const baseUrl = 'https://mycalculating.com/category/finance/equity-split-calculator-for-co-founders';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Equity Split Calculator for Co-Founders', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Equity Split Calculator for Co-Founders',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate suggested co-founder equity split from idea, time, capital, and lead role contributions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function getScores(values: FormValues): { name: string; score: number }[] {
  const n = values.numFounders;
  const scores: { name: string; score: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const idea = (values as Record<string, unknown>)[`idea${i}`] as number;
    const time = (values as Record<string, unknown>)[`time${i}`] as number;
    const capital = (values as Record<string, unknown>)[`capital${i}`] as number;
    const lead = (values as Record<string, unknown>)[`lead${i}`] as boolean | undefined;
    const name = ((values as Record<string, unknown>)[`name${i}`] as string) || `Co-founder ${i}`;
    let score = (idea ?? 0) + (time ?? 0) + (capital ?? 0);
    if (lead) score *= LEAD_MULTIPLIER;
    scores.push({ name, score: Math.max(0, score) });
  }
  return scores;
}

const calculateResult = (values: FormValues): ResultPayload => {
  const scoreList = getScores(values);
  const total = scoreList.reduce((s, x) => s + x.score, 0);
  const splits: FounderSplit[] = scoreList.map(({ name, score }) => ({
    name,
    score,
    equityPct: total > 0 ? (score / total) * 100 : 100 / scoreList.length,
  }));

  const maxPct = Math.max(...splits.map((s) => s.equityPct));
  const minPct = Math.min(...splits.map((s) => s.equityPct));
  const spread = maxPct - minPct;

  let status: ResultPayload['status'] = 'balanced';
  let interpretation = 'Suggested split reflects relative contributions (idea, time, capital, lead role). Document and consider vesting.';

  if (spread > 40) {
    status = 'skewed';
    interpretation = 'Split is heavily skewed toward one co-founder. Ensure all agree and document rationale; consider vesting to protect the company.';
  } else if (spread > 25) {
    status = 'moderate';
    interpretation = 'Split shows meaningful differences in contribution. Align on rationale and document; vesting is recommended.';
  }

  const recommendation = 'Document the split and rationale in a founder agreement; use 4-year vesting with 1-year cliff to align long-term.';

  const recommendations: string[] = [
    `Suggested equity: ${splits.map((s) => `${s.name} ${s.equityPct.toFixed(1)}%`).join(', ')}.`,
    'Use this as a starting point; adjust by agreement. Document in a founder agreement or cap table.',
    'Implement 4-year vesting with 1-year cliff to protect the company if a co-founder leaves early.',
  ];

  const insights: string[] = [];
  if (status === 'balanced') {
    insights.push('Relatively balanced split can reduce conflict and align incentives');
    insights.push('Document contribution assumptions so everyone agrees on the rationale');
  } else if (status === 'moderate') {
    insights.push('Meaningful differences in contribution are reflected in the split');
    insights.push('Ensure all co-founders understand and accept the rationale');
  } else {
    insights.push('Heavy skew may be appropriate if one founder carries most of idea, time, or capital');
    insights.push('Document rationale and consider vesting to protect the company');
  }
  insights.push('Vesting (e.g. 4-year with 1-year cliff) is standard for co-founder equity');

  const considerations: string[] = [
    'This is a suggested split based on inputs; legal agreements and vesting should be set with a lawyer.',
    'Idea, time, and capital weights are subjective; align as a team on how you score each.',
    'Lead role multiplier (e.g. CEO) is optional; use only if you agree one founder has clearly greater responsibility.',
    'Future hires and investors will dilute this split; use a cap table to model later rounds.',
  ];

  return {
    splits,
    interpretation,
    recommendation,
    status,
    recommendations,
    insights,
    considerations,
  };
};

export default function EquitySplitCalculatorForCoFounders() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numFounders: 2,
      name1: '', idea1: 50, time1: 50, capital1: 0, lead1: false,
      name2: '', idea2: 50, time2: 50, capital2: 0, lead2: false,
      name3: '', idea3: 33, time3: 33, capital3: 33, lead3: false,
      name4: '', idea4: 25, time4: 25, capital4: 25, lead4: false,
    },
  });

  const n = form.watch('numFounders');

  return (
    <div className="space-y-8">
      <Script id="equity-split-co-founders-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equity Split Calculator for Co-Founders
          </CardTitle>
          <CardDescription>
            Suggest co-founder equity split from idea, time, capital, and lead role. Startup-specific. Use as a starting point and document with vesting.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contribution inputs</CardTitle>
          <CardDescription>For each co-founder: idea, time/commitment, capital (0–100 each). Optionally mark lead role for a small multiplier.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <FormField
                control={form.control}
                name="numFounders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of co-founders</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value) as 2 | 3 | 4)}
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {[1, 2, 3, 4].filter((i) => i <= n).map((i) => (
                <Card key={i} className="p-4">
                  <p className="font-medium mb-3">Co-founder {i}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`name${i}` as 'name1'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder={`Co-founder ${i}`} value={field.value ?? ''} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`idea${i}` as 'idea1'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idea / vision (0–100)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={100} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`time${i}` as 'time1'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time / commitment (0–100)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={100} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`capital${i}` as 'capital1'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capital (0–100)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={100} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lead${i}` as 'lead1'}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="rounded border-input"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Lead role (e.g. CEO) — small multiplier</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Suggested Equity Split
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Suggested Co-Founder Equity Split</CardTitle>
                  <CardDescription>Based on idea, time, capital, and lead role</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.splits.map((s, i) => (
                  <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-2xl font-bold text-primary">{s.equityPct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Score: {s.score.toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Badge variant={result.status === 'balanced' ? 'default' : result.status === 'moderate' ? 'secondary' : 'outline'}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </Badge>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
              {result.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Next steps</p>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary"><Target className="h-6 w-6" />Strategic Insights</CardTitle>
                <CardDescription>Equity and alignment</CardDescription>
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
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400"><AlertCircle className="h-6 w-6" />Risk & Considerations</CardTitle>
                <CardDescription>Factors to monitor</CardDescription>
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
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
          <CardDescription>Key components required for the co-founder equity split calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><Percent className="h-4 w-4" />Idea, Time, Capital</h4>
              <p className="text-sm text-muted-foreground mb-3">Relative contribution (0–100) for idea/vision, time/commitment, and capital. Higher numbers mean greater relative contribution. They need not sum to 100 across co-founders; we use relative weights and normalize to 100%.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Idea / vision (0–100): origin of idea, product direction</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Time / commitment (0–100): full-time vs part-time, effort</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Capital (0–100): cash invested, forgone salary</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Scores are summed per founder; lead multiplier applied if checked</span></li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300"><Users className="h-4 w-4" />Lead role</h4>
              <p className="text-sm text-muted-foreground mb-3">If one co-founder has a clear lead role (e.g. CEO), check Lead role. We apply a small multiplier (e.g. 1.15x) to their score so their suggested equity is slightly higher. Use only if the team agrees.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><span>Optional; apply to at most one founder</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><span>Reflects greater accountability and visibility</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FunctionSquare className="h-5 w-5" />Formula Used</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">Score_i = (Idea_i + Time_i + Capital_i) × (1.15 if Lead else 1)</p>
            <p className="font-mono text-sm text-center mt-2">Equity %_i = Score_i ÷ Sum(Score_j) × 100</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Scores are relative; we normalize to 100% so suggested equity sums to 100%. Idea, time, and capital are each 0–100 per founder; the lead multiplier (1.15) is applied only if the lead role box is checked.</p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Related Financial Calculators</CardTitle>
          <CardDescription>Explore other startup and equity tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/equity-cap-table-generator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Equity Cap Table Generator</p>
                      <p className="text-sm text-muted-foreground">Build cap table with founders and investors.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/founder-dilution-after-funding-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Founder Dilution After Funding Calculator</p>
                      <p className="text-sm text-muted-foreground">See dilution after a round.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/option-pool-allocation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Option Pool Allocation Calculator</p>
                      <p className="text-sm text-muted-foreground">Size option pool and dilution.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-valuation-pre-money-vs-post-money-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Valuation (Pre-Money vs Post-Money) Calculator</p>
                      <p className="text-sm text-muted-foreground">Pre-money vs post-money valuation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/post-funding-runway-extension-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Post-Funding Runway Extension Calculator</p>
                      <p className="text-sm text-muted-foreground">Runway extension after funding.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly burn and runway.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="The Definitive Guide to Co-Founder Equity Split: Idea, Time, Capital, and Lead Role" />
        <meta itemProp="description" content="Expert guide to co-founder equity split: contribution weights (idea, time, capital), lead role multiplier, and documenting the split with vesting." />
        <meta itemProp="keywords" content="co-founder equity split, founder equity, startup equity, idea time capital, vesting" />
        <meta itemProp="url" content={baseUrl} />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Co-Founder Equity Split: Idea, Time, Capital, and Lead Role</h1>
        <p className="text-lg italic text-muted-foreground">Suggest co-founder equity split from relative contributions (idea, time, capital) and optional lead role. Startup-specific. Use as a starting point and document with vesting.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#eq-definition" className="hover:underline">Co-Founder Equity Split: Definition and Purpose</a></li>
          <li><a href="#eq-formula" className="hover:underline">The Formula and Components</a></li>
          <li><a href="#eq-equal-vs-weighted" className="hover:underline">Equal vs. Contribution-Based Splits</a></li>
          <li><a href="#eq-interpretation" className="hover:underline">Interpreting Results and Vesting</a></li>
          <li><a href="#eq-documentation" className="hover:underline">Documentation and Legal</a></li>
          <li><a href="#eq-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />
        <h2 id="eq-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Co-Founder Equity Split: Definition and Purpose</h2>
        <p>A co-founder equity split is the percentage of the company each co-founder owns at founding. This calculator suggests a split based on relative contributions: idea/vision, time/commitment, capital, and an optional lead role (e.g. CEO) multiplier. Getting the split right early reduces conflict and supports a clear cap table for future investors.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Contribution-Based Splits</h3>
        <p>Using idea, time, and capital (and optionally lead role) makes the rationale explicit. It reduces conflict when everyone agrees on how contributions are weighted and encourages documenting the assumptions. Many teams use equal splits when contributions are similar; when one founder carries more of the idea, time, or capital, a weighted split can feel fairer and avoid resentment later.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Lead Role Multiplier</h3>
        <p>If one co-founder has clearly greater responsibility (e.g. CEO), a small multiplier (e.g. 1.15x) increases their suggested share. Use only if the team agrees; otherwise leave lead unchecked for all. The lead multiplier is not meant to double a founder’s share—it reflects slightly greater accountability and visibility.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">When to Set the Split</h3>
        <p>Ideally agree on the split before or at incorporation, and document it in a founder agreement or cap table. Revisiting the split after months of work often leads to difficult conversations; doing it upfront with a clear methodology (like this calculator) makes the discussion easier.</p>
        <hr />
        <h2 id="eq-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula and Components</h2>
        <p>For each co-founder, a score is computed from idea, time, and capital (each 0–100). If the lead role box is checked, that founder’s score is multiplied by 1.15. Equity percentage is then: Score_i ÷ Sum(Score_j) × 100. Scores are relative; they need not sum to 100 across co-founders—we normalize so the suggested equity sums to 100%.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Idea / Vision (0–100)</h3>
        <p>Represents the relative contribution of the original idea, product vision, or strategic direction. A founder who conceived the idea and defined the product might score higher here; a late-joining co-founder might score lower.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Time / Commitment (0–100)</h3>
        <p>Reflects relative commitment in terms of time and effort—full-time vs. part-time, or years of expected dedication. Be consistent: if one founder is 100% and another 50%, that can be reflected in the time score.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Capital (0–100)</h3>
        <p>Reflects relative financial contribution: cash invested, forgone salary, or other capital put into the company. Not all teams weight capital heavily; some treat it as a separate note or loan. Use 0 for all if you are not factoring capital into the split.</p>
        <hr />
        <h2 id="eq-equal-vs-weighted" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Equal vs. Contribution-Based Splits</h2>
        <p>Equal splits (e.g. 50/50 or 33/33/34) are common when co-founders join at the same time with similar roles and commitment. They are simple and avoid endless debate. When one founder brings the idea, more time, or more capital, a contribution-based split can be fairer. Use this calculator to see what a weighted split looks like; you can always round to a round number (e.g. 55/45) and document the rationale.</p>
        <hr />
        <h2 id="eq-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results and Vesting</h2>
        <p>Use the suggested split as a starting point; adjust by agreement. Implement 4-year vesting with 1-year cliff so equity vests over time and early leavers do not keep full unvested shares. Vesting protects the company and aligns long-term incentives—standard in venture-backed startups and recommended even for bootstrapped teams.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why a One-Year Cliff</h3>
        <p>The cliff means no equity vests until the co-founder has been with the company for one year. After the cliff, equity typically vests monthly or quarterly over the remaining period. If someone leaves before the cliff, they typically receive no equity for that period, which avoids giving large stakes to short-term participants.</p>
        <hr />
        <h2 id="eq-documentation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Documentation and Legal</h2>
        <p>Document the split and rationale in a founder agreement or cap table. Have a lawyer review; this calculator is not legal advice. A clear, written record helps with investor due diligence and reduces the risk of disputes if relationships change later.</p>
        <hr />
        <h2 id="eq-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Use this calculator to suggest a co-founder equity split from idea, time, capital, and lead role. Document the result and use vesting to align long-term incentives. Pair with a cap table or founder dilution calculator to see how the split changes after funding and option pool allocation.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Next Steps</h3>
        <p>After you have a suggested split: (1) Discuss and adjust with your co-founders until everyone agrees. (2) Document the split and rationale in a founder agreement or cap table. (3) Implement 4-year vesting with 1-year cliff. (4) Have a lawyer review all equity documents. (5) Use a cap table tool to model dilution from future investors and option pool.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about co-founder equity split</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a co-founder equity split?</h4>
              <p className="text-muted-foreground">The co-founder equity split is the percentage of the company each co-founder owns at founding. This calculator suggests a split based on relative contributions: idea, time, capital, and optional lead role. Getting it right early reduces conflict and supports a clear cap table for future investors.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How are idea, time, and capital used?</h4>
              <p className="text-muted-foreground">You enter 0–100 for each co-founder for idea/vision, time/commitment, and capital. We sum these into a score per founder (with an optional lead multiplier) and normalize to 100% to get suggested equity. They need not sum to 100 across co-founders; we use relative weights. For example, if one founder scores 150 and another 100, the first gets 60% and the second 40%.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the lead role multiplier?</h4>
              <p className="text-muted-foreground">If one co-founder has a clear lead role (e.g. CEO), we apply a small multiplier (e.g. 1.15x) to their score so their suggested equity is slightly higher. Use only if the team agrees. The multiplier reflects greater accountability and visibility, not a doubling of share.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should equity be equal?</h4>
              <p className="text-muted-foreground">Equal splits are common for 2–3 co-founders when contributions are similar. When one founder carries more idea, time, or capital, a contribution-based split can be fairer. Use this calculator as a starting point and adjust by agreement. You can always round to a round number (e.g. 55/45) and document the rationale.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is vesting and why use it?</h4>
              <p className="text-muted-foreground">Vesting means equity is earned over time (e.g. 4 years with a 1-year cliff). If a co-founder leaves early, unvested shares typically return to the company. Vesting protects the company and aligns long-term incentives. It is standard in venture-backed startups and recommended even for bootstrapped teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I document the split?</h4>
              <p className="text-muted-foreground">Document the split and rationale in a founder agreement or cap table. Have a lawyer review. This calculator is not legal advice. A clear written record helps with investor due diligence and reduces the risk of disputes if relationships change later.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if we disagree on contributions?</h4>
              <p className="text-muted-foreground">Discuss as a team how you weight idea, time, and capital. Adjust the inputs until you get a split everyone can accept, then document the rationale so future disagreements are easier to resolve. Some teams use a facilitator or advisor to run the discussion.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does the split change after funding?</h4>
              <p className="text-muted-foreground">The co-founder split is diluted when you add investors, option pool, or other shareholders. Use a cap table or founder dilution calculator to see post-round ownership. The relative split between co-founders stays the same unless you issue new founder equity; the percentage of the company each holds goes down as new shares are issued.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does this differ from an equity cap table?</h4>
              <p className="text-muted-foreground">This tool suggests a co-founder-only split from contributions. A cap table lists all shareholders (founders, option pool, investors) and their ownership. Use both: set the founder split here, then build the full cap table with our Equity Cap Table Generator or similar to model dilution from future rounds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why do investors care about co-founder equity split?</h4>
              <p className="text-muted-foreground">Investors care that co-founder equity is clearly agreed and documented. A contribution-based split shows you have thought through fairness; vesting shows you protect the company. Both support a professional cap table and due diligence. Disputes over founder equity can derail a company, so investors look for alignment and clear documentation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Usage of this Calculator</CardTitle>
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><Users className="h-5 w-5 text-blue-600" />Who Should Use This Calculator?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Co-Founding Teams</strong>
                <span className="text-sm text-muted-foreground">To agree on a fair starting split based on idea, time, capital, and lead role before incorporating or issuing equity.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors</strong>
                <span className="text-sm text-muted-foreground">To help founders model and discuss contribution-based splits and vesting.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Accelerators & Incubators</strong>
                <span className="text-sm text-muted-foreground">To give cohorts a structured way to set founder equity and avoid common mistakes before term sheets.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">First-Time Founders</strong>
                <span className="text-sm text-muted-foreground">To see how idea, time, and capital translate into a suggested split and why vesting is standard.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><AlertTriangle className="h-5 w-5 text-amber-600" />Limitations & Accuracy</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Subjective inputs:</strong> Idea, time, and capital weights are subjective; align as a team on how you score each.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Not legal advice:</strong> Document and vest with a lawyer; this tool is for planning only.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Future dilution:</strong> The split is diluted by investors and option pool; use a cap table or founder dilution calculator for post-round ownership.</span></li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><Landmark className="h-5 w-5 text-green-600" />Real-World Examples</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Two co-founders, one lead</h5>
                <p className="text-sm text-muted-foreground">A has Idea 60, Time 70, Capital 20, Lead; B has Idea 40, Time 30, Capital 80. A’s score = (60+70+20)×1.15 = 172.5; B’s = 150. Equity A ≈ 53.5%, B ≈ 46.5%. They round to 55/45 and document that A drove product and ops while B brought capital.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Three co-founders, equal commitment</h5>
                <p className="text-sm text-muted-foreground">All three score Idea 33, Time 33, Capital 33, no lead. Scores are equal, so suggested split is 33.3% each. They keep equal split and add 4-year vesting with 1-year cliff so early departures don’t keep full equity.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Equity Split Calculator for Co-Founders suggests a co-founder equity split from idea, time, capital, and optional lead role. Use it as a starting point and adjust by agreement.</p>
          <p>Document the split and rationale in a founder agreement or cap table, and implement vesting (e.g. 4-year with 1-year cliff) to align long-term incentives and protect the company.</p>
          <p>Pair with a cap table or founder dilution calculator to see how the split changes after funding and option pool allocation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
