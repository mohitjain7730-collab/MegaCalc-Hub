'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart3, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  startingMRR: z.number({ invalid_type_error: 'Enter starting MRR' }).min(0),
  newMRR: z.number({ invalid_type_error: 'Enter new MRR' }).min(0).optional(),
  expansionMRR: z.number({ invalid_type_error: 'Enter expansion MRR' }).min(0).optional(),
  churnedMRR: z.number({ invalid_type_error: 'Enter churned MRR' }).min(0).optional(),
  contractionMRR: z.number({ invalid_type_error: 'Enter contraction MRR' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  endingMRR: number;
  netNewMRR: number;
  growthRate: number;
  netDollarRetention: number;
  status: 'rapid' | 'healthy' | 'flat' | 'decline';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter starting MRR for the period.',
  'Enter new MRR from new customers.',
  'Enter expansion MRR from upsells.',
  'Enter churned MRR and contraction MRR.',
  'Review ending MRR, net new MRR, growth %, and NDR.',
];

const faqs = [
  { question: 'What is MRR?', answer: 'Monthly Recurring Revenue (MRR) is predictable subscription revenue normalized to a monthly amount.' },
  { question: 'What is Net Dollar Retention (NDR)?', answer: 'NDR = (Starting MRR + Expansion − Contraction − Churn) ÷ Starting MRR. It measures revenue retention from existing customers.' },
  { question: 'Should I include one-time fees?', answer: 'No. MRR should exclude one-time or usage spikes to stay recurring and predictable.' },
  { question: 'How often should I track MRR?', answer: 'Track monthly; also monitor leading indicators weekly (signups, activations) to react faster.' },
  { question: 'How does MRR link to ARR?', answer: 'ARR ≈ MRR × 12. Use ARR for annualized metrics and burn multiple comparisons.' },
];

const relatedCalculators = [
  { name: 'ARR Growth Calculator', slug: 'arr-growth-calculator', description: 'Annualize MRR changes and track CAGR.' },
  { name: 'LTV Calculator', slug: 'ltv-calculator', description: 'Estimate lifetime value from ARPA, margin, and churn.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/mrr-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'MRR (Monthly Recurring Revenue) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MRR (Monthly Recurring Revenue) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate ending MRR, net new MRR, growth rate, and net dollar retention from subscription changes.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const startingMRR = values.startingMRR;
  const newMRR = values.newMRR ?? 0;
  const expansionMRR = values.expansionMRR ?? 0;
  const churnedMRR = values.churnedMRR ?? 0;
  const contractionMRR = values.contractionMRR ?? 0;

  const endingMRR = startingMRR + newMRR + expansionMRR - churnedMRR - contractionMRR;
  const netNewMRR = endingMRR - startingMRR;
  const growthRate = startingMRR > 0 ? (netNewMRR / startingMRR) * 100 : endingMRR > 0 ? 100 : 0;
  const netDollarRetention = startingMRR > 0 ? ((startingMRR + expansionMRR - churnedMRR - contractionMRR) / startingMRR) * 100 : 0;

  let status: ResultPayload['status'] = 'flat';
  let interpretation = 'MRR is stable. Focus on expansion and churn reduction.';

  if (growthRate < 0) {
    status = 'decline';
    interpretation = 'MRR declined. Investigate churn drivers and contraction reasons.';
  } else if (growthRate >= 15) {
    status = 'rapid';
    interpretation = 'MRR is growing quickly. Ensure onboarding and support scale with growth.';
  } else if (growthRate >= 5) {
    status = 'healthy';
    interpretation = 'Growth is healthy. Keep an eye on churn and payback efficiency.';
  }

  const recommendations = [
    `Net new MRR: ${netNewMRR.toLocaleString()} (${growthRate.toFixed(1)}% growth).`,
    `NDR: ${netDollarRetention.toFixed(1)}%. Aim for 110%+ by increasing expansion and reducing churn.`,
    'Segment churn by cohort and reason to target retention fixes.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate MRR inputs and separate one-time fees from recurring revenue.' },
    { label: 'This Month', detail: 'Launch at-risk retention plays and upsell campaigns to lift NDR.' },
    { label: 'Ongoing', detail: 'Track MRR components monthly and pair with CAC payback for efficiency.' },
  ];

  return { endingMRR, netNewMRR, growthRate, netDollarRetention, status, interpretation, recommendations, plan };
};

export default function MrrCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startingMRR: undefined,
      newMRR: undefined,
      expansionMRR: undefined,
      churnedMRR: undefined,
      contractionMRR: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mrr-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            MRR (Monthly Recurring Revenue) Calculator
          </CardTitle>
          <CardDescription>Compute ending MRR, net new MRR, growth rate, and NDR.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter MRR components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startingMRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting MRR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newMRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New MRR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 8000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expansionMRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expansion MRR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 3000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="churnedMRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Churned MRR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractionMRR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraction MRR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate MRR
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
            <CardDescription>See ending MRR, net new, growth, and NDR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ending MRR</p>
                <p className="text-2xl font-semibold text-primary">${result.endingMRR.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">After all movements</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net new MRR</p>
                <p className="text-2xl font-semibold text-primary">${result.netNewMRR.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Change this period</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Growth rate</p>
                <p className="text-2xl font-semibold text-primary">{result.growthRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Period growth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">NDR</p>
                <p className="text-2xl font-semibold text-primary">{result.netDollarRetention.toFixed(1)}%</p>
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
          <p><strong>Ending MRR</strong> = starting + new + expansion − churned − contraction.</p>
          <p><strong>Net new MRR</strong> = ending − starting.</p>
          <p><strong>Growth %</strong> = net new ÷ starting × 100.</p>
          <p><strong>NDR</strong> = (starting + expansion − churned − contraction) ÷ starting × 100.</p>
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
                <p className="text-sm text-muted-foreground">NDR status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.netDollarRetention >= 120 ? 'Excellent' : result.netDollarRetention >= 110 ? 'Strong' : result.netDollarRetention >= 100 ? 'Neutral' : 'Decline'}
                </p>
                <p className="text-xs text-muted-foreground">Existing customer health</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Growth status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Momentum check</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ARR (est.)</p>
                <p className="text-xl font-semibold text-primary">${(result.endingMRR * 12).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">MRR × 12</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter MRR details to see additional insights.</p>
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
        <meta itemProp="name" content="MRR Growth Guide" />
        <meta itemProp="description" content="Understand MRR components, calculate growth and net dollar retention, and improve recurring revenue health." />
        <meta itemProp="keywords" content="MRR calculator, monthly recurring revenue, net dollar retention, SaaS MRR growth" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/mrr-growth-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          MRR Growth Guide
        </h1>
        <p className="text-lg text-muted-foreground">Track MRR components, growth rate, and NDR to keep recurring revenue healthy and predictable.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#components" className="hover:underline">MRR Components</a></li>
          <li><a href="#ndr" className="hover:underline">Net Dollar Retention</a></li>
          <li><a href="#growth" className="hover:underline">Growth Benchmarks</a></li>
          <li><a href="#quality" className="hover:underline">Quality of Revenue</a></li>
          <li><a href="#cadence" className="hover:underline">Tracking Cadence</a></li>
        </ul>
        <hr />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">MRR Components</h2>
        <p>Break MRR into starting, new, expansion, contraction, and churn. Keep one-time revenue out to avoid overstating recurring performance.</p>

        <h2 id="ndr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Dollar Retention</h2>
        <p>NDR above 110% signals strong product-market fit and upsell motion. Below 100% means contraction or churn is eroding the base.</p>

        <h2 id="growth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Growth Benchmarks</h2>
        <p>Early-stage: double-digit monthly growth with volatile NDR. Growth-stage: 5–10% monthly with NDR >110%. Late-stage: steady mid-single digits with durable NDR.</p>

        <h2 id="quality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Quality of Revenue</h2>
        <p>High-quality MRR has low churn, strong expansion, and diversified customer mix. Pair MRR with CAC payback and burn multiple for capital efficiency.</p>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tracking Cadence</h2>
        <p>Measure monthly; review 3/6/12-month trends. Keep load times low by reusing cached data and lightweight UI for fast LCP.</p>
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
          <p>Calculate ending MRR, net new MRR, growth rate, and NDR with blank defaults and Vitamin K-style layout.</p>
          <p>Outputs include metrics, recommendations, action plan, formula, steps, guide, related tools, FAQs, and summary for easy interpretation.</p>
          <p>Use this to monitor recurring revenue health and keep LCP low with the shared template.</p>
        </CardContent>
      </Card>
    </div>
  );
}







