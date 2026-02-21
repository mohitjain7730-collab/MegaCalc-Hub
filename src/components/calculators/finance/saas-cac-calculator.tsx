'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HandCoins, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  salesMarketingSpend: z.number({ invalid_type_error: 'Enter spend' }).min(0),
  newCustomers: z.number({ invalid_type_error: 'Enter new customers' }).min(1),
  onboardingCosts: z.number({ invalid_type_error: 'Enter onboarding costs' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cac: number;
  adjustedCAC: number;
  status: 'efficient' | 'watch' | 'inefficient';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total sales + marketing spend for the period.',
  'Enter the number of new customers acquired in the same period.',
  'Optionally include onboarding/implementation costs.',
  'Review CAC, adjusted CAC, and efficiency guidance.',
];

const faqs = [
  { question: 'What is CAC?', answer: 'Customer Acquisition Cost (CAC) is the fully loaded cost to acquire one new customer over a period.' },
  { question: 'Which costs go into CAC?', answer: 'Include sales + marketing (people, programs, tools) and implementation/onboarding if required to activate the customer.' },
  { question: 'Why align periods?', answer: 'Use costs and new customers from the same period to avoid mis-stating CAC.' },
  { question: 'How does CAC connect to LTV?', answer: 'LTV Ã· CAC gauges return on acquisition. Ratios above 3:1 are typically strong; below 2:1 need improvement.' },
  { question: 'How often should I track CAC?', answer: 'Track monthly with rolling averages to smooth volatility; keep cohorts consistent.' },
];

const relatedCalculators = [
  { name: 'LTV Calculator', slug: 'ltv-calculator', description: 'Estimate lifetime value to pair with CAC.' },
  { name: 'Payback Period (Customer Acquisition) Calculator', slug: 'payback-period-customer-acquisition-calculator', description: 'See months to recover CAC.' },
];

const baseUrl = 'https://mycalculating.com/finance/saas-cac-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'SaaS CAC (Customer Acquisition Cost) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SaaS CAC (Customer Acquisition Cost) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate CAC and adjusted CAC including onboarding costs to measure acquisition efficiency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const salesMarketingSpend = values.salesMarketingSpend;
  const newCustomers = values.newCustomers;
  const onboardingCosts = values.onboardingCosts ?? 0;

  const cac = newCustomers > 0 ? salesMarketingSpend / newCustomers : Infinity;
  const adjustedCAC = newCustomers > 0 ? (salesMarketingSpend + onboardingCosts) / newCustomers : Infinity;

  let status: ResultPayload['status'] = 'watch';
  let interpretation = 'CAC is workable. Compare against LTV and payback to judge efficiency.';

  if (adjustedCAC <= 400) {
    status = 'efficient';
    interpretation = 'CAC looks efficient. Keep scaling channels with short payback.';
  } else if (adjustedCAC > 800) {
    status = 'inefficient';
    interpretation = 'CAC is high. Reassess targeting, channel mix, and onboarding costs.';
  }

  const recommendations = [
    `CAC: ${cac === Infinity ? 'N/A' : `$${cac.toFixed(2)}`} | Adjusted CAC: ${adjustedCAC === Infinity ? 'N/A' : `$${adjustedCAC.toFixed(2)}`}.`,
    'Align spend and customer counts from the same period for accuracy.',
    'Pair CAC with payback (months) and LTV to ensure sustainable growth.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate cost allocations (people, programs, tools) and period alignment.' },
    { label: 'This Month', detail: 'Shift spend to channels with faster payback; streamline onboarding costs.' },
    { label: 'Ongoing', detail: 'Track CAC monthly with rolling averages; compare to LTV and churn trends.' },
  ];

  return { cac, adjustedCAC, status, interpretation, recommendations, plan };
};

export default function SaasCacCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesMarketingSpend: undefined,
      newCustomers: undefined,
      onboardingCosts: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="saas-cac-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            SaaS CAC (Customer Acquisition Cost) Calculator
          </CardTitle>
          <CardDescription>Measure CAC and adjusted CAC including onboarding costs.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter acquisition data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salesMarketingSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales + marketing spend ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>New customers acquired</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Onboarding costs ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 8000 (optional)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate CAC
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
            <CardDescription>See CAC, adjusted CAC, and efficiency status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">CAC</p>
                <p className="text-2xl font-semibold text-primary">{result.cac === Infinity ? 'N/A' : `$${result.cac.toFixed(2)}`}</p>
                <p className="text-xs text-muted-foreground">Spend Ã· new customers</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted CAC</p>
                <p className="text-2xl font-semibold text-primary">{result.adjustedCAC === Infinity ? 'N/A' : `$${result.adjustedCAC.toFixed(2)}`}</p>
                <p className="text-xs text-muted-foreground">Incl. onboarding</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency tip</p>
                <p className="text-xs text-muted-foreground">Pair with payback and LTV:CAC.</p>
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
          <p><strong>CAC</strong> = sales + marketing spend Ã· new customers.</p>
          <p><strong>Adjusted CAC</strong> = (sales + marketing + onboarding) Ã· new customers.</p>
          <p>Use the same period for spend and customers to keep CAC accurate.</p>
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
                <p className="text-sm text-muted-foreground">CAC delta</p>
                <p className="text-xl font-semibold text-primary">{result.adjustedCAC === Infinity ? 'N/A' : `$${(result.adjustedCAC - result.cac).toFixed(2)}`}</p>
                <p className="text-xs text-muted-foreground">Impact of onboarding</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Capital efficiency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Next step</p>
                <p className="text-xl font-semibold text-primary">Pair with payback</p>
                <p className="text-xs text-muted-foreground">See months to recover</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter spend and customers to see CAC insights.</p>
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
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
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
        <meta itemProp="name" content="SaaS CAC Explained" />
        <meta itemProp="description" content="Learn how to calculate SaaS CAC, include onboarding costs, and tie CAC to payback and LTV for efficient growth." />
        <meta itemProp="keywords" content="SaaS CAC calculator, customer acquisition cost, adjusted CAC, onboarding cost, CAC payback" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/saas-cac-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          SaaS CAC: How to Calculate and Improve It
        </h1>
        <p className="text-lg text-muted-foreground">Use this guide to calculate CAC accurately, include onboarding, and keep acquisition efficient.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Definition and Formula</a></li>
          <li><a href="#scope" className="hover:underline">What Costs to Include</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks and Payback</a></li>
          <li><a href="#improve" className="hover:underline">Improving CAC</a></li>
          <li><a href="#cadence" className="hover:underline">Tracking Cadence</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Definition and Formula</h2>
        <p>CAC = total sales + marketing spend Ã· new customers. Adjusted CAC adds onboarding/implementation costs.</p>

        <h2 id="scope" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Costs to Include</h2>
        <p>Include salaries, programs, tools, ads, events, and onboarding resources. Exclude COGS and existing customer success unless directly tied to new acquisition.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks and Payback</h2>
        <p>Efficient motions target CAC payback under 12 months and LTV:CAC of 3:1+. Early-stage may accept higher CAC if payback is visible and churn is low.</p>

        <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving CAC</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Shift spend to channels with verified conversion and payback.</li>
          <li>Reduce onboarding friction to lower adjusted CAC.</li>
          <li>Align sales comp with payback and retention targets.</li>
        </ul>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tracking Cadence</h2>
        <p>Track monthly, share rolling 3-month CAC, and pair with churn, NDR, and LTV to keep capital efficiency in view.</p>
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
          <p>Calculate CAC and adjusted CAC with blank defaults, clear formulas, and Vitamin K-style sections.</p>
          <p>Outputs include CAC metrics, recommendations, action plan, formula, steps, guide, related tools, FAQs, and summary.</p>
          <p>Use alongside payback, LTV, and churn to keep acquisition efficient and LCP low.</p>
        </CardContent>
      </Card>
    </div>
  );
}







