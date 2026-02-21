'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  monthlyARPA: z.number({ invalid_type_error: 'Enter ARPA' }).min(0),
  grossMarginPct: z.number({ invalid_type_error: 'Enter gross margin %' }).min(0).max(100),
  monthlyChurnPct: z.number({ invalid_type_error: 'Enter churn %' }).min(0).max(100),
  annualDiscountRatePct: z.number({ invalid_type_error: 'Enter discount rate %' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ltv: number;
  marginPerMonth: number;
  churnRate: number;
  effectiveRate: number;
  status: 'strong' | 'watch' | 'weak';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter monthly ARPA/ARPU (average revenue per account).',
  'Enter gross margin percentage.',
  'Enter monthly churn percentage.',
  'Optionally add annual discount rate to be conservative.',
  'Review LTV, margin, and effective rate assumptions.',
];

const faqs = [
  { question: 'What is LTV?', answer: 'Customer Lifetime Value (LTV) estimates gross profit generated over a customer lifetime.' },
  { question: 'Which churn to use?', answer: 'Use logo churn for account-level LTV; use revenue churn if LTV is revenue-weighted.' },
  { question: 'Why discount rate?', answer: 'Discounting future cash flows is conservative and reduces LTV, especially for long lifetimes.' },
  { question: 'Should I cap lifetime?', answer: 'Many teams cap lifetime at 5â€“7 years even with low churn to avoid overstating LTV.' },
  { question: 'How does LTV connect to CAC?', answer: 'Use LTV:CAC to gauge acquisition efficiency. Ratios above 3:1 are typically strong.' },
];

const relatedCalculators = [
  { name: 'SaaS CAC (Customer Acquisition Cost) Calculator', slug: 'saas-cac-calculator', description: 'Pair LTV with CAC for efficiency.' },
  { name: 'Payback Period (Customer Acquisition) Calculator', slug: 'payback-period-customer-acquisition-calculator', description: 'See months to recover CAC.' },
];

const baseUrl = 'https://mycalculating.com/finance/ltv-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'LTV (Customer Lifetime Value) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LTV (Customer Lifetime Value) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate customer lifetime value using ARPA, gross margin, churn rate, and optional discount rate.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const monthlyARPA = values.monthlyARPA;
  const grossMarginPct = values.grossMarginPct / 100;
  const churnRate = values.monthlyChurnPct / 100;
  const annualDiscountRatePct = values.annualDiscountRatePct ?? 0;
  const monthlyDiscountRate = annualDiscountRatePct / 1200; // convert percent annual to monthly fraction

  const marginPerMonth = monthlyARPA * grossMarginPct;
  const effectiveRate = churnRate + monthlyDiscountRate;
  const ltv = effectiveRate > 0 ? marginPerMonth / effectiveRate : Infinity;

  let status: ResultPayload['status'] = 'watch';
  let interpretation = 'LTV looks workable; pair with CAC and payback to judge efficiency.';
  if (ltv >= 5000) {
    status = 'strong';
    interpretation = 'LTV is strong. Maintain retention and margin to preserve value.';
  } else if (ltv < 1500) {
    status = 'weak';
    interpretation = 'LTV is low. Improve retention, pricing, or margin before scaling spend.';
  }

  const recommendations = [
    `LTV: ${ltv === Infinity ? 'N/A' : `$${ltv.toFixed(2)}`} | Margin/month: $${marginPerMonth.toFixed(2)} | Effective rate: ${(effectiveRate * 100).toFixed(2)}%.`,
    'Validate churn input; small changes in churn drive large LTV swings.',
    'Use conservative discounting and cap lifetime to avoid overstating LTV.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate ARPA, margin, and churn inputs; exclude one-time revenue.' },
    { label: 'This Month', detail: 'Run retention and pricing experiments to lift LTV components.' },
    { label: 'Ongoing', detail: 'Track LTV monthly and pair with CAC and payback for decisions.' },
  ];

  return { ltv, marginPerMonth, churnRate, effectiveRate, status, interpretation, recommendations, plan };
};

export default function LtvCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyARPA: undefined,
      grossMarginPct: undefined,
      monthlyChurnPct: undefined,
      annualDiscountRatePct: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ltv-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            LTV (Customer Lifetime Value) Calculator
          </CardTitle>
          <CardDescription>Estimate LTV from ARPA, margin, churn, and discount rate.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter revenue and churn</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyARPA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly ARPA ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grossMarginPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross margin (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyChurnPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly churn (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualDiscountRatePct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual discount rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8 (optional)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate LTV
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
            <CardDescription>See LTV, margin, and effective rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">LTV</p>
                <p className="text-2xl font-semibold text-primary">{result.ltv === Infinity ? 'N/A' : `$${result.ltv.toFixed(2)}`}</p>
                <p className="text-xs text-muted-foreground">Gross profit lifetime</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Margin / month</p>
                <p className="text-2xl font-semibold text-primary">${result.marginPerMonth.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">ARPA Ã— margin %</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Effective rate</p>
                <p className="text-2xl font-semibold text-primary">{(result.effectiveRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Churn + discount</p>
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
          <p><strong>Margin per month</strong> = ARPA Ã— gross margin %.</p>
          <p><strong>Effective rate</strong> = churn rate + monthly discount rate.</p>
          <p><strong>LTV</strong> = margin per month Ã· effective rate.</p>
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
                <p className="text-sm text-muted-foreground">Lifetime (months)</p>
                <p className="text-xl font-semibold text-primary">
                  {result.effectiveRate === 0 ? 'N/A' : (1 / result.effectiveRate).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">1 Ã· effective rate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Churn input</p>
                <p className="text-xl font-semibold text-primary">{(result.churnRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Monthly churn</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Value strength</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter ARPA, margin, and churn to see LTV.</p>
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
        <meta itemProp="name" content="Customer Lifetime Value (LTV) Guide" />
        <meta itemProp="description" content="Learn how to calculate LTV using ARPA, margin, churn, and discounting, and how to pair it with CAC for efficient growth." />
        <meta itemProp="keywords" content="ltv calculator, saas ltv, churn impact, discount rate, arpa, lifetime value" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/ltv-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Customer Lifetime Value (LTV): How to Calculate It
        </h1>
        <p className="text-lg text-muted-foreground">Use this guide to compute LTV, choose conservative assumptions, and keep acquisition efficient with LTV:CAC and payback.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Definition & Formula</a></li>
          <li><a href="#assumptions" className="hover:underline">Key Assumptions</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks & Caps</a></li>
          <li><a href="#improve" className="hover:underline">Improving LTV</a></li>
          <li><a href="#cadence" className="hover:underline">Tracking Cadence</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Definition & Formula</h2>
        <p>LTV = (ARPA Ã— gross margin) Ã· (churn rate + discount rate). Use monthly rates and conservative discounting.</p>

        <h2 id="assumptions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Assumptions</h2>
        <p>Accurate churn and margin inputs matter most. Even a 0.5% change in churn can swing LTV meaningfully.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks & Caps</h2>
        <p>Cap lifetime to avoid overstatement. Many teams cap at 60â€“84 months. Revisit assumptions quarterly.</p>

        <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving LTV</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Reduce churn via onboarding, adoption, and success playbooks.</li>
          <li>Increase ARPA via packaging and value-based pricing.</li>
          <li>Improve margin through cost optimization.</li>
        </ul>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tracking Cadence</h2>
        <p>Update LTV monthly; pair with CAC, LTV:CAC, and payback to keep capital efficiency visible and LCP low.</p>
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
          <p>Calculate LTV from ARPA, gross margin, churn, and discounting with the Vitamin K template.</p>
          <p>Outputs include LTV, margin, effective rate, recommendations, action plan, formula, steps, guide, related tools, FAQs, and summary.</p>
          <p>Use alongside CAC, payback, and LTV:CAC to ensure efficient growth.</p>
        </CardContent>
      </Card>
    </div>
  );
}



