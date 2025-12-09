'use client';

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Activity, Target, Shield, CalculatorIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cashBalance: z.number({ invalid_type_error: 'Enter cash balance' }).min(0),
  monthlyBurn: z.number({ invalid_type_error: 'Enter monthly burn' }).min(0),
  monthlySavings: z.number({ invalid_type_error: 'Enter monthly savings' }).min(0).optional(),
  newFunding: z.number({ invalid_type_error: 'Enter new funding' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentRunway: number;
  adjustedRunway: number;
  burnAfterSavings: number;
  extensionMonths: number;
  status: 'critical' | 'stable' | 'comfortable';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current cash balance available for operations.',
  'Enter current monthly burn (net cash outflow).',
  'Add planned monthly savings or efficiency gains (optional).',
  'Add new capital injection expected (optional).',
  'Review current runway, extended runway, and savings impact.',
];

const faqs = [
  {
    question: 'What is runway?',
    answer: 'Runway is the number of months your current cash lasts at the present burn rate.',
  },
  {
    question: 'How do savings affect runway?',
    answer: 'Lower burn (through savings or revenue) increases runway. Even small cuts compound over time.',
  },
  {
    question: 'Should I include deferred expenses?',
    answer: 'Yes. Use a net burn that includes all recurring expenses, debt service, and working capital changes.',
  },
  {
    question: 'What is a healthy runway target?',
    answer: 'Early-stage companies often target 12–18 months to allow for learning cycles and a buffer for fundraising.',
  },
  {
    question: 'How often should I recalc runway?',
    answer: 'Monthly is typical. Recalculate sooner after major hiring, pricing changes, or capital raises.',
  },
];

const relatedCalculators = [
  {
    name: 'Burn Rate Calculator',
    slug: 'burn-rate-calculator',
    description: 'Track monthly cash consumption and gross vs. net burn.',
  },
  {
    name: 'Cash Flow Forecasting Calculator',
    slug: 'cash-flow-forecasting-calculator',
    description: 'Project cash inflows and outflows to anticipate runway.',
  },
  {
    name: 'Startup Valuation (Post-Money / Pre-Money) Calculator',
    slug: 'startup-valuation-post-money-pre-money-calculator',
    description: 'Pair runway planning with valuation expectations.',
  },
  {
    name: 'Founder Dilution Calculator',
    slug: 'founder-dilution-calculator',
    description: 'Model dilution when extending runway via equity financing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/runway-extension-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Runway Extension Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Runway Extension Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate startup runway, measure savings impact, and model extension from new capital.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const cashBalance = values.cashBalance;
  const monthlyBurn = values.monthlyBurn;
  const monthlySavings = values.monthlySavings ?? 0;
  const newFunding = values.newFunding ?? 0;

  const burnAfterSavings = Math.max(0, monthlyBurn - monthlySavings);
  const currentRunway = burnAfterSavings > 0 ? cashBalance / burnAfterSavings : Infinity;
  const adjustedRunway = burnAfterSavings > 0 ? (cashBalance + newFunding) / burnAfterSavings : Infinity;
  const extensionMonths = adjustedRunway - currentRunway;

  let status: ResultPayload['status'] = 'stable';
  let interpretation = 'Runway is moderate. Track burn monthly and stress test downside cases.';

  if (currentRunway < 9) {
    status = 'critical';
    interpretation = 'Runway is tight. Prioritize savings, revenue acceleration, or bridge financing.';
  } else if (currentRunway >= 18) {
    status = 'comfortable';
    interpretation = 'Runway is healthy. Keep discipline and monitor hiring pace.';
  }

  const recommendations = [
    `Current runway: ${currentRunway === Infinity ? 'No burn' : currentRunway.toFixed(1) + ' months'} with burn after savings ${burnAfterSavings.toLocaleString()}.`,
    newFunding > 0
      ? `New funding of ${newFunding.toLocaleString()} extends runway by ${extensionMonths === Infinity ? 'N/A' : extensionMonths.toFixed(1)} months.`
      : 'Add projected funding to see combined runway extension.',
    monthlySavings > 0 ? `Monthly savings of ${monthlySavings.toLocaleString()} reduce burn and extend runway by ~${(monthlySavings > 0 && burnAfterSavings > 0 ? (monthlySavings / burnAfterSavings) * currentRunway : 0).toFixed(1)} months.` : 'Model savings scenarios to extend runway without dilution.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Validate burn inputs with finance and ensure all recurring costs are included.' },
    { label: 'This Month', detail: 'Execute savings initiatives and lock in vendor or headcount adjustments to capture burn reductions.' },
    { label: 'Ongoing', detail: 'Recalculate runway monthly and keep a 3–6 month buffer for fundraising timelines.' },
  ];

  return {
    currentRunway,
    adjustedRunway,
    burnAfterSavings,
    extensionMonths,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RunwayExtensionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashBalance: undefined,
      monthlyBurn: undefined,
      monthlySavings: undefined,
      newFunding: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="runway-extension-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Runway Extension Calculator
          </CardTitle>
          <CardDescription>Estimate current runway and how savings or new capital extend it.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter your cash plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cashBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10000" placeholder="e.g., 1200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyBurn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly burn ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5000" placeholder="e.g., 180000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlySavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly savings ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="e.g., 20000 (optional)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newFunding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New funding ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50000" placeholder="e.g., 3000000 (optional)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate runway
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
            <CardDescription>See current and extended runway plus savings impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current runway</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.currentRunway === Infinity ? 'No burn' : `${result.currentRunway.toFixed(1)} mo`}
                </p>
                <p className="text-xs text-muted-foreground">Cash ÷ burn after savings</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted runway</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.adjustedRunway === Infinity ? 'No burn' : `${result.adjustedRunway.toFixed(1)} mo`}
                </p>
                <p className="text-xs text-muted-foreground">With new funding</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burn after savings</p>
                <p className="text-2xl font-semibold text-primary">${result.burnAfterSavings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Net monthly</p>
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
            <strong>Burn after savings</strong> = max(0, monthly burn − monthly savings).
          </p>
          <p>
            <strong>Current runway (months)</strong> = cash balance ÷ burn after savings.
          </p>
          <p>
            <strong>Adjusted runway (months)</strong> = (cash balance + new funding) ÷ burn after savings.
          </p>
          <p>
            <strong>Extension (months)</strong> = adjusted runway − current runway.
          </p>
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
                <p className="text-sm text-muted-foreground">Runway extension</p>
                <p className="text-xl font-semibold text-primary">
                  {result.extensionMonths === Infinity ? 'N/A' : `${result.extensionMonths.toFixed(1)} months`}
                </p>
                <p className="text-xs text-muted-foreground">From funding + savings</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Savings sensitivity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.burnAfterSavings === 0 ? 'No burn' : `${(result.extensionMonths > 0 ? result.extensionMonths.toFixed(1) : '0.0')} mo`}
                </p>
                <p className="text-xs text-muted-foreground">Change as burn drops</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burn coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {result.adjustedRunway === Infinity ? 'Covered' : `${result.adjustedRunway.toFixed(1)} mo`}
                </p>
                <p className="text-xs text-muted-foreground">Cash + funding</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter burn, savings, and funding to see runway extension.</p>
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
        <meta itemProp="name" content="Runway Extension Playbook" />
        <meta itemProp="description" content="A step-by-step guide for calculating startup runway, extending it with savings or capital, and staying ahead of fundraising cycles." />
        <meta itemProp="keywords" content="runway calculator, runway extension, startup burn rate, cash runway, savings impact, bridge funding" />
        <meta itemProp="author" content="Mycalculating Finance Team" />
        <meta itemProp="datePublished" content="2025-12-08" />
        <meta itemProp="url" content="/runway-extension-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Runway Extension Playbook
        </h1>
        <p className="text-lg text-muted-foreground">
          Calculate how long your cash lasts, how savings shift your burn, and how new capital or revenue adds months of runway.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#runway-basics" className="hover:underline">Runway and Burn Basics</a></li>
          <li><a href="#savings" className="hover:underline">Savings and Efficiency Wins</a></li>
          <li><a href="#funding" className="hover:underline">Modeling New Capital</a></li>
          <li><a href="#buffers" className="hover:underline">Buffer Targets and Risk</a></li>
          <li><a href="#cadence" className="hover:underline">Cadence for Reforecasting</a></li>
        </ul>
        <hr />

        <h2 id="runway-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Runway and Burn Basics</h2>
        <p>Runway is months of cash coverage at the current burn. Use net burn after revenue, debt, and working capital needs to avoid overestimating runway.</p>
        <p>Track both gross burn (total spend) and net burn (spend minus revenue collections) to understand true cash usage.</p>

        <h2 id="savings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Savings and Efficiency Wins</h2>
        <p>Small recurring savings compound. Focus on vendor renegotiations, hiring pacing, and cloud/unit cost controls.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Renegotiate contracts and remove unused seats.</li>
          <li>Delay non-critical hiring; prioritize revenue-facing roles.</li>
          <li>Measure unit economics to prevent growth that burns cash.</li>
        </ul>

        <h2 id="funding" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modeling New Capital</h2>
        <p>When adding new funding, include transaction costs and timeline uncertainty. Use conservative close dates and partial funding scenarios for realism.</p>

        <h2 id="buffers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Buffer Targets and Risk</h2>
        <p>Maintain at least 6 months of runway buffer to absorb slippage in sales cycles or hiring ramp. Stress test downside scenarios with slower revenue and higher churn.</p>

        <h2 id="cadence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cadence for Reforecasting</h2>
        <p>Refresh runway monthly and after major commitments. Reconcile plan vs. actuals to keep LCP low and decision-making fast.</p>
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
          <p>Estimate current runway, burn after savings, and runway extension from new capital.</p>
          <p>Outputs include current and adjusted runway, burn after savings, extension, status, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs mirror the Vitamin K layout for consistency.</p>
        </CardContent>
      </Card>
    </div>
  );
}







