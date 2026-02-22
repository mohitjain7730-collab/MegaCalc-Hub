'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  netBurnPerMonth: z.number({ invalid_type_error: 'Enter net burn' }).min(0),
  netNewARR: z.number({ invalid_type_error: 'Enter net new ARR' }).min(0),
  periodMonths: z.number({ invalid_type_error: 'Enter months' }).min(1).max(24),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  burnMultiple: number;
  periodBurn: number;
  efficiency: number;
  status: 'elite' | 'efficient' | 'watch' | 'inefficient';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter net burn per month (cash out minus cash in).',
  'Enter net new ARR added in the same period.',
  'Enter the number of months in that period (e.g., 1 for monthly, 3 for quarterly).',
  'Review burn multiple, efficiency, and improvement ideas.',
];

const faqs = [
  { question: 'What is burn multiple?', answer: 'Burn multiple = net burn over a period divided by net new ARR in that same period. It measures how efficiently cash is converted into recurring revenue.' },
  { question: 'What is a good burn multiple?', answer: 'Elite: <1, Strong: 1â€“1.5, OK: 1.5â€“2.5, Risky: >2.5. Benchmarks vary with growth stage and market.' },
  { question: 'Should I use ARR or MRR?', answer: 'Use ARR for annualized growth. If you track MRR change, convert to ARR by multiplying by 12 to keep units consistent with burn multiple benchmarks.' },
  { question: 'Do I include capital expenditures?', answer: 'Use net burn from the cash flow statement. Exclude one-time financing flows but include opex, capex, and working capital changes that consume cash.' },
  { question: 'How often should I track?', answer: 'Track monthly and summarize quarterly. Consistency lets you see trendlines and the impact of go-to-market or efficiency programs.' },
];

const relatedCalculators = [
  { name: 'Burn Rate Calculator', slug: 'burn-rate-calculator', description: 'Measure gross and net burn each month.' },
  { name: 'Runway Extension Calculator', slug: 'runway-extension-calculator', description: 'See how savings and new capital extend runway.' },
  { name: 'ARR Growth Calculator', slug: 'arr-growth-calculator', description: 'Track ARR expansion over time.' },
  { name: 'SaaS CAC (Customer Acquisition Cost) Calculator', slug: 'saas-cac-calculator', description: 'Measure acquisition cost per customer to improve efficiency.' },
];

const baseUrl = 'https://mycalculating.com/finance/burn-multiple-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Burn Multiple (Efficiency) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Burn Multiple (Efficiency) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate burn multiple, period burn, and cash-to-ARR efficiency to monitor startup capital productivity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const netBurnPerMonth = values.netBurnPerMonth;
  const netNewARR = values.netNewARR;
  const periodMonths = values.periodMonths;

  const periodBurn = netBurnPerMonth * periodMonths;
  const burnMultiple = netNewARR > 0 ? periodBurn / netNewARR : Infinity;
  const efficiency = netNewARR > 0 ? netNewARR / periodBurn : 0;

  let status: ResultPayload['status'] = 'watch';
  let interpretation = 'Burn multiple is workable. Track efficiency trend and tighten spend if growth slows.';

  if (burnMultiple < 1) {
    status = 'elite';
    interpretation = 'Excellent efficiency. Each dollar of burn creates more than a dollar of ARR.';
  } else if (burnMultiple < 1.5) {
    status = 'efficient';
    interpretation = 'Strong efficiency. Maintain discipline while scaling go-to-market.';
  } else if (burnMultiple > 2.5) {
    status = 'inefficient';
    interpretation = 'Efficiency is weak. Reassess CAC, pricing, and payback to conserve cash.';
  }

  const recommendations = [
    `Burn multiple: ${burnMultiple === Infinity ? 'N/A' : burnMultiple.toFixed(2)} (${periodBurn.toLocaleString()} burn over ${periodMonths} mo vs ${netNewARR.toLocaleString()} net new ARR).`,
    'Link burn to pipeline conversion and payback periods; prioritize channels with faster payback.',
    'Guard headcount and program spend until burn multiple trends below 1.5.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate burn and ARR change for the selected period; exclude financing inflows.' },
    { label: 'This Month', detail: 'Shift spend toward channels with CAC payback under 12 months; pause low-ROI programs.' },
    { label: 'Ongoing', detail: 'Track burn multiple monthly and publish a rolling 3-month average to smooth volatility.' },
  ];

  return { burnMultiple, periodBurn, efficiency, status, interpretation, recommendations, plan };
};

export default function BurnMultipleEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netBurnPerMonth: undefined,
      netNewARR: undefined,
      periodMonths: 1,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="burn-multiple-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Burn Multiple (Efficiency) Calculator
          </CardTitle>
          <CardDescription>Measure capital efficiency by comparing burn to net new ARR.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter your metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="netBurnPerMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net burn per month ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="e.g., 250000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netNewARR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net new ARR in period ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="e.g., 400000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period length (months)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate burn multiple
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
            <CardDescription>Review burn multiple, period burn, and efficiency rating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burn multiple</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.burnMultiple === Infinity ? 'N/A' : result.burnMultiple.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Lower is better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Period burn</p>
                <p className="text-2xl font-semibold text-primary">${result.periodBurn.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Net cash out</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ARR efficiency</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiency.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">ARR per $ burn</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
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
          <p>
            <strong>Period burn</strong> = net burn per month Ã— period months.
          </p>
          <p>
            <strong>Burn multiple</strong> = period burn Ã· net new ARR in the same period.
          </p>
          <p>
            <strong>ARR efficiency</strong> = net new ARR Ã· period burn.
          </p>
          <p>Use the same time window for burn and ARR change to avoid distortions.</p>
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
                <p className="text-sm text-muted-foreground">Cash per $ ARR</p>
                <p className="text-xl font-semibold text-primary">
                  {result.burnMultiple === Infinity ? 'N/A' : `$${result.burnMultiple.toFixed(2)}`}
                </p>
                <p className="text-xs text-muted-foreground">Cash to create $1 ARR</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ARR per $ burn</p>
                <p className="text-xl font-semibold text-primary">{result.efficiency.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Return on burn</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Benchmark</p>
                <p className="text-xl font-semibold text-primary">
                  {result.burnMultiple < 1 ? 'Elite' : result.burnMultiple < 1.5 ? 'Strong' : result.burnMultiple < 2.5 ? 'Watch' : 'Inefficient'}
                </p>
                <p className="text-xs text-muted-foreground">Capital productivity</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter burn and ARR change to see burn multiple.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
        <meta itemProp="name" content="Burn Multiple: Measuring SaaS Efficiency" />
        <meta itemProp="description" content="Learn how to calculate and improve burn multiple, link burn to ARR growth, and benchmark efficiency across stages." />
        <meta itemProp="keywords" content="burn multiple calculator, saas efficiency, capital productivity, net burn, net new ARR, growth efficiency" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/burn-multiple-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Burn Multiple: Measuring SaaS Efficiency
        </h1>
        <p className="text-lg text-muted-foreground">
          Burn multiple shows how many dollars you burn to add a dollar of ARR. Lower is better; track it monthly and quarterly to keep efficiency visible.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Definition and Formula</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks by Stage</a></li>
          <li><a href="#improve" className="hover:underline">Improving Burn Multiple</a></li>
          <li><a href="#pitfalls" className="hover:underline">Common Pitfalls</a></li>
          <li><a href="#cadence" className="hover:underline">Operating Cadence</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Definition and Formula</h2>
        <p>Burn multiple = cash burned over a period Ã· net new ARR in that period. Use net burn (cash out minus cash in) and net new ARR (including churn) to stay consistent.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks by Stage</h2>
        <p>Seed/Series A: aim &lt; 1.5 while proving product-market fit. Growth: strive for 1.0â€“1.5 with scalable go-to-market. Late stage: sub-1 is elite.</p>

        <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Burn Multiple</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Prioritize channels with CAC payback under 12 months.</li>
          <li>Expand existing customers (NDR) to raise ARR without proportional burn.</li>
          <li>Stage hiring against pipeline and conversion proof.</li>
        </ul>

        <h2 id="pitfalls" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Pitfalls</h2>
        <p>Mixing periods (monthly burn vs quarterly ARR change) or excluding churn can overstate efficiency. Ensure ARR and burn align in time and scope.</p>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Operating Cadence</h2>
        <p>Report burn multiple monthly, show a 3-month rolling average, and pair it with CAC payback and LTV:CAC to keep capital productivity tight.</p>
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
          <p>Calculate burn multiple, period burn, and ARR efficiency to monitor capital productivity.</p>
          <p>Outputs mirror the Vitamin K layout: metrics, recommendations, action plan, formula, steps, guide, related tools, and FAQs.</p>
          <p>Use these insights to keep LCP low by pairing burn multiple with payback and CAC controls.</p>
        </CardContent>
      </Card>
    </div>
  );
}







