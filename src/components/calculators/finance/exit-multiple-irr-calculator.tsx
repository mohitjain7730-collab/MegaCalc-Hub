'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  initialInvestment: z.number({ invalid_type_error: 'Enter initial investment' }).min(0),
  exitMultiple: z.number({ invalid_type_error: 'Enter exit multiple' }).min(0),
  holdingPeriodYears: z.number({ invalid_type_error: 'Enter holding period years' }).min(0.1).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialInvestment: number;
  exitMultiple: number;
  holdingPeriodYears: number;
  exitValue: number;
  irr: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial investment (equity invested at acquisition).',
  'Enter exit multiple (multiple of initial investment returned at exit).',
  'Enter holding period in years.',
  'Review IRR calculation based on exit multiple.',
];

const faqs = [
  {
    question: 'What is exit multiple IRR?',
    answer:
      'Exit multiple IRR calculates the annualized return (IRR) based on the exit multiple and holding period. Exit multiple = Exit Value / Initial Investment. IRR ≈ (Exit Multiple)^(1/Holding Period) - 1.',
  },
  {
    question: 'How is exit multiple IRR calculated?',
    answer:
      'IRR ≈ (Exit Multiple)^(1/Holding Period) - 1. For example, if exit multiple is 3.0x over 5 years, IRR ≈ (3.0)^(1/5) - 1 = 0.2457 or 24.57%. This is an approximation assuming no intermediate cash flows.',
  },
  {
    question: 'What is a good exit multiple?',
    answer:
      'Target exit multiples vary by strategy: Venture Capital: 3-10x+, Growth Equity: 2-5x, Buyout: 2-3x. Top quartile funds often achieve 3x+ exit multiples. Higher multiples generally mean higher IRRs, but timing matters.',
  },
  {
    question: 'How does holding period affect IRR?',
    answer:
      'Longer holding periods require higher exit multiples to achieve the same IRR. For example, 2.0x exit multiple over 3 years ≈ 26% IRR, but over 7 years ≈ 10% IRR. Shorter holding periods are preferred for higher IRRs.',
  },
  {
    question: 'What is the difference between exit multiple and MOIC?',
    answer:
      'Exit multiple and MOIC (Multiple on Invested Capital) are the same metric: Exit Value / Initial Investment. Both measure how many times the initial investment has been returned. Exit multiple is often used in IRR calculations.',
  },
  {
    question: 'How accurate is exit multiple IRR?',
    answer:
      'Exit multiple IRR is an approximation that assumes no intermediate cash flows. For precise IRR with annual distributions, use detailed cash flow analysis. The approximation works well for simple cases with exit-only returns.',
  },
  {
    question: 'What factors drive exit multiples?',
    answer:
      'Exit multiples are driven by: EBITDA growth, multiple expansion (exit multiple vs. entry multiple), operational improvements, market conditions, and industry trends. Successful exits combine multiple drivers.',
  },
  {
    question: 'How do I validate exit multiple IRR?',
    answer:
      'Validate by: comparing to similar transactions and fund benchmarks, reviewing exit assumptions and market multiples, assessing reasonableness of holding period, performing sensitivity analysis, and checking against detailed cash flow IRR.',
  },
  {
    question: 'What is multiple expansion?',
    answer:
      'Multiple expansion occurs when exit multiple exceeds entry multiple. For example, buying at 8x EBITDA and exiting at 10x EBITDA creates 2x multiple expansion. This is one of four key LBO return drivers.',
  },
  {
    question: 'How does exit multiple IRR compare to cash flow IRR?',
    answer:
      'Exit multiple IRR assumes no intermediate cash flows, while cash flow IRR accounts for annual distributions. Cash flow IRR is more accurate but requires detailed projections. Exit multiple IRR is simpler and useful for quick analysis.',
  },
];

const relatedCalculators = [
  {
    name: 'LBO (Leveraged Buyout) Return Calculator',
    slug: 'lbo-leveraged-buyout-return-calculator',
    description: 'Calculate MOIC and IRR for LBO investments.',
  },
  {
    name: 'Internal Rate of Return (IRR) for PE/VC Deal Calculator',
    slug: 'irr-pe-vc-deal-calculator',
    description: 'Calculate IRR with detailed cash flows.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow valuation.',
  },
  {
    name: 'Terminal Value (Exit Multiple) Calculator',
    slug: 'terminal-value-exit-multiple-calculator',
    description: 'Calculate terminal value using exit multiples.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/exit-multiple-irr-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Exit Multiple IRR Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Exit Multiple IRR Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate IRR based on exit multiple and holding period for private equity and venture capital investments.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialInvestment = values.initialInvestment;
  const exitMultiple = values.exitMultiple;
  const holdingPeriodYears = values.holdingPeriodYears;
  
  // Exit Value = Initial Investment × Exit Multiple
  const exitValue = initialInvestment * exitMultiple;
  
  // IRR approximation: IRR ≈ (Exit Multiple)^(1/Holding Period) - 1
  const irr = exitMultiple > 0 && holdingPeriodYears > 0 
    ? (Math.pow(exitMultiple, 1 / holdingPeriodYears) - 1) * 100 
    : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (irr <= 0 || exitMultiple < 1) {
    status = 'low';
    interpretation = 'Negative or zero IRR indicates investment does not meet return requirements. Exit multiple below 1.0x means loss on investment.';
  } else if (exitMultiple < 1.5 || irr < 15) {
    status = 'low';
    interpretation = 'Exit multiple < 1.5x or IRR < 15% is below typical PE/VC targets. Consider if returns meet fund requirements.';
  } else if (exitMultiple < 2.0 || irr < 20) {
    status = 'moderate';
    interpretation = 'Exit multiple 1.5-2.0x or IRR 15-20% is in lower range. May be acceptable for lower-risk strategies or market conditions.';
  } else if (exitMultiple < 3.0 || irr < 25) {
    status = 'good';
    interpretation = 'Exit multiple 2.0-3.0x or IRR 20-25% represents solid PE/VC performance, typically above median fund returns.';
  } else {
    status = 'optimal';
    interpretation = 'Exit multiple ≥3.0x or IRR ≥25% represents top quartile PE/VC performance, exceeding typical fund benchmarks.';
  }

  const recommendations = [
    `Exit multiple: ${exitMultiple.toFixed(2)}x means ${exitMultiple.toFixed(2)} times the initial investment has been returned. Exit value: ${exitValue.toLocaleString()}.`,
    `IRR: ${irr.toFixed(2)}% represents the annualized rate of return based on exit multiple and holding period. This approximation assumes no intermediate cash flows.`,
    `Holding period: ${holdingPeriodYears.toFixed(1)} years is the investment duration. Longer holding periods require higher exit multiples to achieve the same IRR.`,
  ];
  
  if (exitMultiple < 2.0) {
    recommendations.push('Consider: Exit multiple below 2.0x may be below PE/VC fund targets. Review exit assumptions, EBITDA growth, and multiple expansion opportunities.');
  }
  
  if (irr < 20) {
    recommendations.push('Consider: IRR below 20% may be below PE/VC fund targets. Evaluate if holding period can be shortened or if exit value can be increased.');
  }
  
  if (exitMultiple >= 3.0 && irr >= 25) {
    recommendations.push('Excellent: Exit multiple ≥3.0x and IRR ≥25% represents top quartile performance. This indicates strong returns driven by EBITDA growth, multiple expansion, or operational improvements.');
  }
  
  recommendations.push('Validation: Compare exit multiple and IRR to similar transactions and fund benchmarks. Review exit assumptions and market multiples. Perform sensitivity analysis on exit multiple and holding period. Consider detailed cash flow IRR for more accuracy.');

  const plan = [
    { label: 'This Week', detail: `Calculate exit multiple IRR: ${exitMultiple.toFixed(2)}x exit multiple, ${irr.toFixed(2)}% IRR over ${holdingPeriodYears.toFixed(1)} years. Compare to fund targets and benchmarks.` },
    { label: 'This Month', detail: 'Validate exit multiple and IRR by comparing to similar transactions, reviewing exit assumptions and market multiples, and performing sensitivity analysis. Consider detailed cash flow IRR for more accuracy.' },
    { label: 'Ongoing', detail: 'Monitor investment performance against projections. Track EBITDA growth, multiple expansion, and operational improvements. Update exit multiple and IRR projections based on actual performance and market conditions.' },
  ];

  return { initialInvestment, exitMultiple, holdingPeriodYears, exitValue, irr, interpretation, status, recommendations, plan };
};

export default function ExitMultipleIrrCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      exitMultiple: undefined,
      holdingPeriodYears: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="exit-multiple-irr-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Exit Multiple IRR Calculator
          </CardTitle>
          <CardDescription>Calculate IRR based on exit multiple and holding period for private equity and venture capital investments.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your exit multiple parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="initialInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Investment</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exitMultiple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="holdingPeriodYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holding Period (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Exit Multiple IRR
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See exit multiple IRR calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exit Multiple</p>
                <p className="text-2xl font-semibold text-primary">{result.exitMultiple.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Multiple of investment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exit Value</p>
                <p className="text-2xl font-semibold text-primary">${result.exitValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total proceeds</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">IRR</p>
                <p className="text-2xl font-semibold text-primary">{result.irr.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Annualized return</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
            <strong>Exit Multiple</strong> = Exit Value / Initial Investment
          </p>
          <p>
            <strong>Exit Value</strong> = Initial Investment × Exit Multiple
          </p>
          <p>
            <strong>IRR (Approximation)</strong> = (Exit Multiple)^(1/Holding Period) - 1
          </p>
          <p>
            This approximation assumes no intermediate cash flows. For precise IRR with annual distributions, use detailed cash flow analysis.
          </p>
          <p>Target exit multiples vary by strategy: VC 3-10x+, Growth Equity 2-5x, Buyout 2-3x. Top quartile funds achieve 3x+ exit multiples.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Exit Multiple IRR: Private Equity Return Calculation" />
        <meta itemProp="description" content="An in-depth guide on calculating IRR based on exit multiples and holding periods for private equity and venture capital investments." />
        <meta itemProp="keywords" content="exit multiple IRR, private equity IRR, exit multiple, MOIC, investment returns" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/exit-multiple-irr-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Exit Multiple IRR: Private Equity Return Calculation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">Use exit multiples to approximate IRR quickly, understand timing sensitivity, and know when to switch to full cash flow modeling.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#concept" className="hover:underline">Concept: Multiples to IRR</a></li>
          <li><a href="#math" className="hover:underline">Approximate Math</a></li>
          <li><a href="#timing" className="hover:underline">Timing Sensitivity</a></li>
          <li><a href="#bench" className="hover:underline">Benchmarks by Strategy</a></li>
          <li><a href="#drivers" className="hover:underline">Drivers of Higher Multiples</a></li>
          <li><a href="#limits" className="hover:underline">Limits of the Shortcut</a></li>
          <li><a href="#playbook" className="hover:underline">Quick Playbook</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Concept: Multiples to IRR</h2>
        <p>Exit multiple IRR is a shortcut: if you know your exit as a multiple of invested capital and the hold length, you can approximate IRR without full cash flows.</p>

        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Approximate Math</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>IRR ≈ (Exit Multiple)^(1/Holding Period) - 1</strong></p>
        </div>
        <p>Assumes a single exit cash flow. If you have interim dividends or partial exits, move to full IRR/XIRR with dated cash flows.</p>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Timing Sensitivity</h2>
        <p>Same multiple, longer hold → lower IRR. E.g., 2.0x over 3 years ≈ 26% IRR; over 7 years ≈ 10% IRR. Timing is as important as the multiple.</p>

        <h2 id="bench" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks by Strategy</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>VC:</strong> 3–10x+ with wide dispersion.</li>
          <li><strong>Growth:</strong> 2–5x common.</li>
          <li><strong>Buyout:</strong> 2–3x typical.</li>
        </ul>
        <p>Top quartile often starts at 3x+ for growth/VC; buyout top quartile near 2.5–3x with shorter holds.</p>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drivers of Higher Multiples</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>EBITDA growth and margin expansion.</li>
          <li>Multiple expansion (exit multiple &gt; entry multiple).</li>
          <li>Efficient capital structure and deleveraging.</li>
          <li>Operational uplift and strategic positioning.</li>
        </ul>

        <h2 id="limits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limits of the Shortcut</h2>
        <p>This shortcut ignores interim cash flows, fees, and timing nuance. Use it for quick screening; move to detailed IRR/XIRR when cash flows are uneven or when dividends/recaps occur.</p>

        <h2 id="playbook" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Quick Playbook</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Estimate exit multiple from base case.</li>
          <li>Apply IRR ≈ (multiple)^(1/years) - 1 for fast read.</li>
          <li>Run sensitivities: ±0.5–1.0x multiple, ±1–2 years hold.</li>
          <li>If interim dividends/recaps exist, switch to full cash flow IRR.</li>
          <li>Benchmark to strategy quartiles before go/no-go.</li>
        </ol>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Exit multiple IRR is a fast lens on returns: great for screening, insufficient for final underwriting. Always reconcile with full cash flow modeling when timing or interim cash flows matter.</p>
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
          <p>This tool calculates IRR based on exit multiple and holding period for private equity and venture capital investments.</p>
          <p>Outputs include exit multiple, exit value, IRR, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

