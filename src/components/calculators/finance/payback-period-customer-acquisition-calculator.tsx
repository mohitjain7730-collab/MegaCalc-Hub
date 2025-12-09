'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TimerReset, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cac: z.number({ invalid_type_error: 'Enter CAC' }).min(0),
  monthlyGrossProfitPerCustomer: z.number({ invalid_type_error: 'Enter monthly gross profit' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  paybackMonths: number;
  status: 'fast' | 'standard' | 'slow';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter CAC (customer acquisition cost).',
  'Enter monthly gross profit per customer.',
  'Review payback period in months.',
  'Pair with LTV:CAC and churn for full efficiency view.',
];

const faqs = [
  { question: 'What is payback period?', answer: 'Months needed to recover CAC from monthly gross profit per customer.' },
  { question: 'What is a good payback?', answer: 'Sub-12 months is often efficient for SaaS; 12–18 is common in growth; beyond 18 can be risky unless churn is very low.' },
  { question: 'Should I use gross or net profit?', answer: 'Use gross profit per customer (revenue × gross margin) to reflect unit economics.' },
  { question: 'How does churn affect payback?', answer: 'Higher churn shortens lifetime, so slow payback plus higher churn can make CAC unrecoverable.' },
  { question: 'Why pair with LTV:CAC?', answer: 'Payback shows time to recover CAC; LTV:CAC shows overall return. Use both for efficiency.' },
];

const relatedCalculators = [
  { name: 'SaaS CAC (Customer Acquisition Cost) Calculator', slug: 'saas-cac-calculator', description: 'Source CAC input.' },
  { name: 'LTV Calculator', slug: 'ltv-calculator', description: 'Pair payback with LTV for return.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/payback-period-customer-acquisition-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Payback Period (Customer Acquisition) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Payback Period (Customer Acquisition) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate CAC payback period from CAC and monthly gross profit per customer to assess efficiency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { cac, monthlyGrossProfitPerCustomer } = values;
  const paybackMonths = monthlyGrossProfitPerCustomer > 0 ? cac / monthlyGrossProfitPerCustomer : Infinity;

  let status: ResultPayload['status'] = 'standard';
  let interpretation = 'Payback is standard. Pair with churn and LTV to confirm efficiency.';
  if (paybackMonths < 12) {
    status = 'fast';
    interpretation = 'Payback is fast (<12 months). This is efficient in most SaaS models.';
  } else if (paybackMonths > 18) {
    status = 'slow';
    interpretation = 'Payback is slow (>18 months). Improve CAC or margin, or raise ARPA to accelerate recovery.';
  }

  const recommendations = [
    `Payback: ${paybackMonths === Infinity ? 'N/A' : `${paybackMonths.toFixed(1)} months`}.`,
    'Increase ARPA or margin to shorten payback; reduce CAC via channel mix and onboarding efficiency.',
    'Monitor churn—slow payback plus higher churn risks unrecovered CAC.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Verify CAC and gross profit inputs; ensure gross margin is applied to revenue first.' },
    { label: 'This Month', detail: 'Optimize pricing/packaging and reduce acquisition costs to shorten payback.' },
    { label: 'Ongoing', detail: 'Track payback monthly; pair with LTV:CAC and churn for full efficiency view.' },
  ];

  return { paybackMonths, status, interpretation, recommendations, plan };
};

export default function PaybackPeriodCustomerAcquisitionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cac: undefined,
      monthlyGrossProfitPerCustomer: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="payback-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerReset className="h-5 w-5" />
            Payback Period (Customer Acquisition) Calculator
          </CardTitle>
          <CardDescription>Compute CAC payback in months from CAC and monthly gross profit.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter CAC and gross profit</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAC ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 900" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyGrossProfitPerCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly gross profit / customer ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate payback
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
            <CardDescription>See payback months and efficiency guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Payback (months)</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.paybackMonths === Infinity ? 'N/A' : result.paybackMonths.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">CAC ÷ gross profit</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">If profit +10%</p>
                <p className="text-xl font-semibold text-primary">
                  {result.paybackMonths === Infinity ? 'N/A' : (result.paybackMonths / 1.1).toFixed(1)} mo
                </p>
                <p className="text-xs text-muted-foreground">Sensitivity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">If CAC −10%</p>
                <p className="text-xl font-semibold text-primary">
                  {result.paybackMonths === Infinity ? 'N/A' : (result.paybackMonths * 0.9).toFixed(1)} mo
                </p>
                <p className="text-xs text-muted-foreground">Upside</p>
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
          <p><strong>Payback (months)</strong> = CAC ÷ monthly gross profit per customer.</p>
          <p>Use gross profit (not revenue) for accurate unit economics.</p>
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
                <p className="text-sm text-muted-foreground">Annual payback</p>
                <p className="text-xl font-semibold text-primary">
                  {result.paybackMonths === Infinity ? 'N/A' : (result.paybackMonths / 12).toFixed(2)} years
                </p>
                <p className="text-xs text-muted-foreground">Months ÷ 12</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Next step</p>
                <p className="text-xl font-semibold text-primary">Lift margin</p>
                <p className="text-xs text-muted-foreground">Faster recovery</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter CAC and gross profit to see payback insights.</p>
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
        <meta itemProp="name" content="CAC Payback Guide" />
        <meta itemProp="description" content="Calculate CAC payback period, interpret benchmarks, and improve acquisition efficiency." />
        <meta itemProp="keywords" content="cac payback calculator, customer acquisition payback, saas payback period, cac recovery time" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/cac-payback-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          CAC Payback: How Fast Do You Recover Spend?
        </h1>
        <p className="text-lg text-muted-foreground">Use this guide to compute payback, set targets, and connect payback to LTV:CAC and churn while keeping LCP low.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#formula" className="hover:underline">Formula & Inputs</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks</a></li>
          <li><a href="#improve" className="hover:underline">Improving Payback</a></li>
          <li><a href="#risks" className="hover:underline">Risks & Churn</a></li>
          <li><a href="#cadence" className="hover:underline">Tracking Cadence</a></li>
        </ul>
        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formula & Inputs</h2>
        <p>Payback (months) = CAC ÷ monthly gross profit per customer. Use margin-adjusted profit, not revenue.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks</h2>
        <p>Sub-12 months: efficient. 12–18: typical growth. &gt;18: risky unless churn is very low and LTV:CAC is strong.</p>

        <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Payback</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Increase ARPA through packaging and pricing.</li>
          <li>Improve gross margin by optimizing COGS.</li>
          <li>Reduce CAC via channel efficiency and onboarding speed.</li>
        </ul>

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risks & Churn</h2>
        <p>Slow payback plus high churn can mean CAC is never recovered. Pair payback analysis with churn and LTV.</p>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tracking Cadence</h2>
        <p>Track monthly; share rolling averages. Keep interface lightweight to support low LCP.</p>
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
          <p>Calculate CAC payback with blank defaults in the Vitamin K layout: inputs, results, formula, steps, guide, related tools, FAQs, and summary.</p>
          <p>Outputs include payback months, status, recommendations, and action plan to improve recovery speed.</p>
          <p>Use alongside LTV:CAC, CAC, and churn to keep acquisition efficient and LCP low.</p>
        </CardContent>
      </Card>
    </div>
  );
}







