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
  exitValue: z.number({ invalid_type_error: 'Enter exit value' }).min(0),
  holdingPeriodYears: z.number({ invalid_type_error: 'Enter holding period years' }).min(0.1).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialInvestment: number;
  exitValue: number;
  holdingPeriodYears: number;
  moic: number;
  irr: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial investment (equity invested at acquisition).',
  'Enter exit value (total proceeds received at exit).',
  'Enter holding period in years.',
  'Review MOIC and IRR calculations.',
];

const faqs = [
  {
    question: 'What is MOIC in LBO?',
    answer:
      'MOIC (Multiple on Invested Capital) measures how many times the initial investment has been returned. MOIC = Exit Value / Initial Investment. For example, MOIC of 2.5x means $2.50 returned for every $1.00 invested.',
  },
  {
    question: 'What is IRR in LBO?',
    answer:
      'IRR (Internal Rate of Return) is the annualized rate of return that makes the NPV of all cash flows equal to zero. It accounts for the timing of cash flows and represents the compound annual growth rate of the investment.',
  },
  {
    question: 'How is IRR calculated from MOIC?',
    answer:
      'IRR ≈ (MOIC)^(1/holding period) - 1. For example, if MOIC is 2.5x over 5 years, IRR ≈ (2.5)^(1/5) - 1 = 0.20 or 20%. This is an approximation; precise IRR requires detailed cash flow analysis.',
  },
  {
    question: 'What is a good LBO return?',
    answer:
      'Target LBO returns typically range from 20-30% IRR and 2.0-3.0x MOIC over 3-7 years. Returns vary by industry, deal size, and market conditions. Top quartile funds often achieve 25%+ IRR and 2.5x+ MOIC.',
  },
  {
    question: 'How does holding period affect returns?',
    answer:
      'Longer holding periods generally require higher MOIC to achieve the same IRR. For example, 2.0x MOIC over 3 years ≈ 26% IRR, but over 7 years ≈ 10% IRR. Shorter holding periods are preferred for higher IRRs.',
  },
  {
    question: 'What factors drive LBO returns?',
    answer:
      'Key drivers include: EBITDA growth, multiple expansion (exit multiple vs. entry multiple), debt paydown (reducing leverage over time), and operational improvements. The most successful LBOs combine multiple drivers.',
  },
  {
    question: 'How do I calculate precise IRR?',
    answer:
      'Precise IRR requires detailed cash flow schedule including: initial investment, annual cash flows (distributions, fees), and exit proceeds. Use Excel IRR or XIRR functions, or financial calculators. The approximation formula works well for simple cases.',
  },
  {
    question: 'What is the difference between gross and net IRR?',
    answer:
      'Gross IRR includes only investment returns, while net IRR deducts management fees and carried interest. Net IRR is typically 3-5 percentage points lower than gross IRR and represents returns to limited partners.',
  },
  {
    question: 'How do I validate LBO returns?',
    answer:
      'Validate by: comparing to similar transactions and fund benchmarks, assessing reasonableness of exit assumptions, reviewing EBITDA growth and multiple expansion assumptions, checking debt paydown projections, and performing sensitivity analysis.',
  },
  {
    question: 'What are typical LBO return ranges?',
    answer:
      'Typical ranges: Bottom quartile: <15% IRR, <1.5x MOIC. Median: 15-20% IRR, 1.5-2.0x MOIC. Top quartile: 25%+ IRR, 2.5x+ MOIC. Returns vary significantly by fund, strategy, and market conditions.',
  },
];

const relatedCalculators = [
  {
    name: 'LBO Debt Schedule Builder',
    slug: 'lbo-debt-schedule-builder',
    description: 'Build detailed LBO debt repayment schedules.',
  },
  {
    name: 'Internal Rate of Return (IRR) for PE/VC Deal Calculator',
    slug: 'irr-pe-vc-deal-calculator',
    description: 'Calculate IRR for PE/VC deals with detailed cash flows.',
  },
  {
    name: 'Exit Multiple IRR Calculator',
    slug: 'exit-multiple-irr-calculator',
    description: 'Calculate IRR based on exit multiples.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/lbo-leveraged-buyout-return-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'LBO (Leveraged Buyout) Return Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LBO (Leveraged Buyout) Return Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate MOIC and IRR for leveraged buyout investments based on initial investment, exit value, and holding period.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialInvestment = values.initialInvestment;
  const exitValue = values.exitValue;
  const holdingPeriodYears = values.holdingPeriodYears;
  
  // MOIC = Exit Value / Initial Investment
  const moic = initialInvestment > 0 ? exitValue / initialInvestment : 0;
  
  // IRR approximation: IRR ≈ (MOIC)^(1/holding period) - 1
  const irr = moic > 0 && holdingPeriodYears > 0 ? (Math.pow(moic, 1 / holdingPeriodYears) - 1) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (moic <= 0 || irr <= 0) {
    status = 'low';
    interpretation = 'Invalid returns. Ensure exit value exceeds initial investment.';
  } else if (moic < 1.5 || irr < 15) {
    status = 'low';
    interpretation = 'Returns below typical LBO targets. MOIC < 1.5x or IRR < 15% suggests underperformance relative to LBO benchmarks.';
  } else if (moic < 2.0 || irr < 20) {
    status = 'moderate';
    interpretation = 'Returns in lower range. MOIC 1.5-2.0x or IRR 15-20% is below median LBO performance but may be acceptable depending on risk profile.';
  } else if (moic < 2.5 || irr < 25) {
    status = 'good';
    interpretation = 'Solid returns. MOIC 2.0-2.5x or IRR 20-25% represents good LBO performance, typically above median fund returns.';
  } else {
    status = 'optimal';
    interpretation = 'Strong returns. MOIC ≥ 2.5x or IRR ≥ 25% represents top quartile LBO performance, exceeding typical fund benchmarks.';
  }

  const recommendations = [
    `MOIC: ${moic.toFixed(2)}x means ${moic.toFixed(2)} times the initial investment has been returned. This is a key metric for LBO performance evaluation.`,
    `IRR: ${irr.toFixed(2)}% represents the annualized rate of return. This accounts for the timing of cash flows and is the primary return metric for LBO investments.`,
    `Holding period: ${holdingPeriodYears.toFixed(1)} years is the investment duration. Longer holding periods require higher MOIC to achieve the same IRR.`,
  ];
  
  if (moic < 2.0) {
    recommendations.push('Consider: MOIC below 2.0x may indicate underperformance. Review exit assumptions, EBITDA growth, multiple expansion, and debt paydown. Assess if returns meet fund targets.');
  }
  
  if (irr < 20) {
    recommendations.push('Consider: IRR below 20% may be below LBO fund targets. Evaluate if holding period can be shortened or if exit value can be increased through operational improvements or multiple expansion.');
  }
  
  if (moic >= 2.5 && irr >= 25) {
    recommendations.push('Excellent: Returns exceed top quartile benchmarks. This represents strong LBO performance driven by EBITDA growth, multiple expansion, debt paydown, or operational improvements.');
  }
  
  recommendations.push('Validation: Compare returns to similar transactions and fund benchmarks. Review exit assumptions, EBITDA growth, and multiple expansion. Perform sensitivity analysis on key variables.');

  const plan = [
    { label: 'This Week', detail: `Calculate LBO returns: MOIC ${moic.toFixed(2)}x, IRR ${irr.toFixed(2)}% over ${holdingPeriodYears.toFixed(1)} years. Compare to fund targets and benchmarks.` },
    { label: 'This Month', detail: 'Validate returns by reviewing exit assumptions, EBITDA growth, multiple expansion, and debt paydown. Perform sensitivity analysis on key variables. Assess if returns meet fund targets.' },
    { label: 'Ongoing', detail: 'Monitor investment performance against projections. Track EBITDA growth, debt paydown, and operational improvements. Update return projections based on actual performance and market conditions.' },
  ];

  return { initialInvestment, exitValue, holdingPeriodYears, moic, irr, interpretation, status, recommendations, plan };
};

export default function LboLeveragedBuyoutReturnCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      exitValue: undefined,
      holdingPeriodYears: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="lbo-return-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            LBO (Leveraged Buyout) Return Calculator
          </CardTitle>
          <CardDescription>Calculate MOIC and IRR for leveraged buyout investments based on initial investment, exit value, and holding period.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your LBO investment parameters</CardTitle>
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
                  name="exitValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 250000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate LBO Returns
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
            <CardDescription>See MOIC and IRR calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">MOIC</p>
                <p className="text-2xl font-semibold text-primary">{result.moic.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Multiple on invested capital</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">IRR</p>
                <p className="text-2xl font-semibold text-primary">{result.irr.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Annualized return</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Holding Period</p>
                <p className="text-2xl font-semibold text-primary">{result.holdingPeriodYears.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Years</p>
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
            <strong>MOIC</strong> = Exit Value / Initial Investment
          </p>
          <p>
            <strong>IRR (Approximation)</strong> = (MOIC)^(1/Holding Period) - 1
          </p>
          <p>
            MOIC measures how many times the initial investment has been returned. IRR represents the annualized rate of return accounting for the timing of cash flows.
          </p>
          <p>
            <strong>Precise IRR Calculation:</strong> Requires detailed cash flow schedule including initial investment, annual cash flows, and exit proceeds. Use Excel IRR or XIRR functions for precise calculations.
          </p>
          <p>Target LBO returns typically range from 20-30% IRR and 2.0-3.0x MOIC over 3-7 years. Returns are driven by EBITDA growth, multiple expansion, debt paydown, and operational improvements.</p>
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
                <p className="text-sm text-muted-foreground">Initial Investment</p>
                <p className="text-xl font-semibold text-primary">${result.initialInvestment.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Equity invested</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exit Value</p>
                <p className="text-xl font-semibold text-primary">${result.exitValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total proceeds</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className="text-xl font-semibold text-primary">${(result.exitValue - result.initialInvestment).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Absolute return</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your LBO investment parameters to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to LBO Returns: MOIC and IRR Calculation" />
        <meta itemProp="description" content="An in-depth guide on calculating MOIC and IRR for leveraged buyout investments, understanding return drivers, and validating LBO returns." />
        <meta itemProp="keywords" content="LBO returns, MOIC, IRR, leveraged buyout, private equity returns, investment returns" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/lbo-leveraged-buyout-return-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to LBO Returns: MOIC and IRR Calculation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">How to measure buyout performance, link MOIC to IRR, and stress-test the drivers that make or break return targets.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#framework" className="hover:underline">Return Framework: MOIC vs. IRR</a></li>
          <li><a href="#math" className="hover:underline">Core Math and Approximations</a></li>
          <li><a href="#drivers" className="hover:underline">Four Drivers: Growth, Multiple, Deleveraging, Ops</a></li>
          <li><a href="#timing" className="hover:underline">Holding Period and Timing Effects</a></li>
          <li><a href="#benchmarks" className="hover:underline">Benchmarks and Quartiles</a></li>
          <li><a href="#stress" className="hover:underline">Stress Testing and Sensitivities</a></li>
          <li><a href="#playbook" className="hover:underline">Execution Playbook</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="framework" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Return Framework: MOIC vs. IRR</h2>
        <p>MOIC tells you how many dollars you got back per dollar in. IRR tells you the speed of those dollars. High MOIC with long duration can still be mediocre IRR; shorter duration boosts IRR.</p>

        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Math and Approximations</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>MOIC = Exit Value / Initial Investment</strong></p>
          <p className="font-mono text-lg"><strong>IRR ≈ (MOIC)^(1/Holding Period) - 1</strong></p>
        </div>
        <p>The approximation works when cash flows are mostly at exit. For precise IRR, include interim cash flows (dividends, fees, partial exits) with IRR/XIRR.</p>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Four Drivers: Growth, Multiple, Deleveraging, Ops</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>EBITDA Growth:</strong> Volume, pricing, margin expansion.</li>
          <li><strong>Multiple Expansion:</strong> Exiting at higher EV/EBITDA than entry.</li>
          <li><strong>Deleveraging:</strong> Paying down debt to expand equity value.</li>
          <li><strong>Operational Upside:</strong> SG&A efficiency, working capital, capex discipline.</li>
        </ul>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Holding Period and Timing Effects</h2>
        <p>Shorter holds magnify IRR for the same MOIC. Early dividends or partial exits accelerate IRR. Delayed exits or back-loaded value creation compress IRR.</p>

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks and Quartiles</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Bottom quartile:</strong> &lt;15% IRR, &lt;1.5x MOIC</li>
          <li><strong>Median:</strong> 15–20% IRR, 1.5–2.0x MOIC</li>
          <li><strong>Top quartile:</strong> 25%+ IRR, 2.5x+ MOIC</li>
        </ul>
        <p>Context matters: sector growth, leverage allowed, and cycle timing shift what is “good.”</p>

        <h2 id="stress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Testing and Sensitivities</h2>
        <p>Run downside cases on: lower exit multiple, slower EBITDA growth, delayed exit, higher interest. Small hits to multiple or timing can wipe out accretion; stress-test before committing capital.</p>

        <h2 id="playbook" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Execution Playbook</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Baseline: compute MOIC and IRR for base exit and timing.</li>
          <li>Decompose returns: growth vs. multiple vs. deleveraging vs. ops.</li>
          <li>Run sensitivities: ±1–2x EBITDA multiple, ±10–20% EBITDA, ±12–24 months exit.</li>
          <li>Layer in interim distributions to see IRR uplift.</li>
          <li>Align with fund hurdle and quartile benchmarks before go/no-go.</li>
        </ol>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Great LBOs mix sensible entry price, disciplined leverage, EBITDA growth, and at least modest multiple expansion. Translate MOIC to IRR, test timing rigorously, and stress every driver—returns are won or lost on a few key assumptions.</p>
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
          <p>This tool calculates MOIC and IRR for leveraged buyout investments based on initial investment, exit value, and holding period.</p>
          <p>Outputs include MOIC, IRR, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

