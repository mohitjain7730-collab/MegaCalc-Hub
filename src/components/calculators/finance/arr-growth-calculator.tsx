'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TrendingUp, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  startingARR: z.number({ invalid_type_error: 'Enter starting ARR' }).min(0),
  endingARR: z.number({ invalid_type_error: 'Enter ending ARR' }).min(0),
  months: z.number({ invalid_type_error: 'Enter months' }).min(1).max(60),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  netNewARR: number;
  totalGrowthPct: number;
  monthlyCAGR: number;
  annualizedCAGR: number;
  status: 'rapid' | 'healthy' | 'flat' | 'decline';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter starting ARR for the measurement period.',
  'Enter ending ARR for the same period.',
  'Enter the number of months in the period.',
  'Review net new ARR, growth %, and annualized CAGR.',
];

const faqs = [
  { question: 'What is ARR growth?', answer: 'ARR growth measures the change in annual recurring revenue over time, accounting for new, expansion, contraction, and churn.' },
  { question: 'Why use CAGR?', answer: 'CAGR smooths growth over multiple months, removing volatility to compare performance periods.' },
  { question: 'Should I include churn?', answer: 'Yes. Ending ARR should reflect churn and contraction so growth captures net performance.' },
  { question: 'How often should I calculate?', answer: 'Monthly tracking with 3, 6, and 12-month windows shows trendlines and seasonality.' },
  { question: 'How does ARR growth tie to burn multiple?', answer: 'Higher ARR growth improves burn multiple by increasing net new ARR for each dollar burned.' },
];

const relatedCalculators = [
  { name: 'Burn Multiple (Efficiency) Calculator', slug: 'burn-multiple-efficiency-calculator', description: 'Connect growth with capital efficiency.' },
  { name: 'MRR (Monthly Recurring Revenue) Calculator', slug: 'mrr-calculator', description: 'Translate customer counts and ARPU into MRR.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/arr-growth-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'ARR Growth Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'ARR Growth Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate net new ARR, growth percentage, and annualized CAGR over any period.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { startingARR, endingARR, months } = values;
  const netNewARR = endingARR - startingARR;
  const totalGrowthPct = startingARR > 0 ? (netNewARR / startingARR) * 100 : endingARR > 0 ? 100 : 0;
  const monthlyCAGR = startingARR > 0 ? Math.pow(endingARR / startingARR, 1 / months) - 1 : endingARR > 0 ? 1 : 0;
  const annualizedCAGR = Math.pow(1 + monthlyCAGR, 12) - 1;

  let status: ResultPayload['status'] = 'flat';
  let interpretation = 'Growth is stable. Monitor leading indicators to accelerate.';

  if (totalGrowthPct < 0) {
    status = 'decline';
    interpretation = 'ARR declined. Examine churn, contraction, and pipeline coverage.';
  } else if (annualizedCAGR >= 1) {
    status = 'rapid';
    interpretation = 'ARR is compounding quickly. Guard efficiency and retention as you scale.';
  } else if (annualizedCAGR >= 0.25) {
    status = 'healthy';
    interpretation = 'Growth is healthy. Maintain funnel efficiency and upsell focus.';
  }

  const recommendations = [
    `Net new ARR: ${netNewARR.toLocaleString()} (${totalGrowthPct.toFixed(1)}% over ${months} months).`,
    `Annualized CAGR: ${ (annualizedCAGR * 100).toFixed(1)}%. Track alongside burn multiple and payback.`,
    'Break down drivers: new ARR, expansion, contraction, churn to find leverage.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate ARR inputs and ensure churn/expansion are included in ending ARR.' },
    { label: 'This Month', detail: 'Align growth targets with pipeline coverage and win rates; shore up renewals.' },
    { label: 'Ongoing', detail: 'Track monthly CAGR and rollups at 3/6/12 months to keep trend clarity.' },
  ];

  return { netNewARR, totalGrowthPct, monthlyCAGR, annualizedCAGR, status, interpretation, recommendations, plan };
};

export default function ArrGrowthCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startingARR: undefined,
      endingARR: undefined,
      months: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="arr-growth-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ARR Growth Calculator
          </CardTitle>
          <CardDescription>Compute net new ARR, growth %, and annualized CAGR.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter ARR values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startingARR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting ARR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="e.g., 1500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endingARR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ending ARR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="e.g., 2400000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period length (months)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ARR growth
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See net new ARR, growth %, and CAGR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net new ARR</p>
                <p className="text-2xl font-semibold text-primary">${result.netNewARR.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ending − starting</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Growth %</p>
                <p className="text-2xl font-semibold text-primary">{result.totalGrowthPct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Period growth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly CAGR</p>
                <p className="text-2xl font-semibold text-primary">{(result.monthlyCAGR * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Smoothed growth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annualized CAGR</p>
                <p className="text-2xl font-semibold text-primary">{(result.annualizedCAGR * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Net new ARR</strong> = ending ARR − starting ARR.</p>
          <p><strong>Growth %</strong> = net new ARR ÷ starting ARR × 100.</p>
          <p><strong>Monthly CAGR</strong> = (ending / starting)^(1 ÷ months) − 1.</p>
          <p><strong>Annualized CAGR</strong> = (1 + monthly CAGR)^12 − 1.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ARR delta</p>
                <p className="text-xl font-semibold text-primary">${result.netNewARR.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Absolute change</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Run rate lift</p>
                <p className="text-xl font-semibold text-primary">{result.totalGrowthPct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Period lift</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Growth quality</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter ARR values to see growth metrics.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/TechArticle"
      >
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="ARR Growth Playbook" />
        <meta itemProp="description" content="A concise guide to calculating ARR growth, interpreting CAGR, and pairing growth with efficiency metrics." />
        <meta itemProp="keywords" content="ARR growth calculator, ARR CAGR, SaaS growth rate, net new ARR, recurring revenue growth" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/arr-growth-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          ARR Growth Playbook
        </h1>
        <p className="text-lg text-muted-foreground">Track ARR growth with net new ARR, growth %, and CAGR to keep momentum aligned with efficiency.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#formula" className="hover:underline">ARR Growth Formula</a></li>
          <li><a href="#drivers" className="hover:underline">Key Drivers</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks & Targets</a></li>
          <li><a href="#quality" className="hover:underline">Quality of Growth</a></li>
          <li><a href="#cadence" className="hover:underline">Measurement Cadence</a></li>
        </ul>
        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ARR Growth Formula</h2>
        <p>ARR growth = (Ending ARR − Starting ARR) ÷ Starting ARR. CAGR smooths growth across months: (Ending ÷ Starting)^(1 ÷ months) − 1.</p>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Drivers</h2>
        <p>Break ARR into new, expansion, contraction, and churn. Improving retention (lower churn) often has the fastest impact on growth quality.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks & Targets</h2>
        <p>Early stage: triple-triple-double targets. Growth stage: 40%+ YoY with efficiency focus. Late stage: durable 20–30% with strong NDR.</p>

        <h2 id="quality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Quality of Growth</h2>
        <p>Pair ARR growth with CAC payback, burn multiple, and NDR to ensure growth is sustainable and capital efficient.</p>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measurement Cadence</h2>
        <p>Track monthly and review 3/6/12-month CAGR to spot acceleration or deceleration early. Keep LCP low by loading calculations quickly.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Compute net new ARR, growth %, and annualized CAGR with blank defaults and dark-mode styling.</p>
          <p>Sections follow the Vitamin K structure: inputs, results, formula, steps, additional metrics, guide, related calculators, FAQs, and summary.</p>
          <p>Use this to align ARR growth with efficiency metrics like burn multiple and CAC payback.</p>
        </CardContent>
      </Card>
    </div>
  );
}







