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
  year1CashFlow: z.number({ invalid_type_error: 'Enter year 1 cash flow' }).optional(),
  year2CashFlow: z.number({ invalid_type_error: 'Enter year 2 cash flow' }).optional(),
  year3CashFlow: z.number({ invalid_type_error: 'Enter year 3 cash flow' }).optional(),
  year4CashFlow: z.number({ invalid_type_error: 'Enter year 4 cash flow' }).optional(),
  year5CashFlow: z.number({ invalid_type_error: 'Enter year 5 cash flow' }).optional(),
  exitValue: z.number({ invalid_type_error: 'Enter exit value' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialInvestment: number;
  cashFlows: number[];
  exitValue: number;
  irr: number;
  npv: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial investment (equity invested, negative cash flow).',
  'Enter annual cash flows for years 1-5 (distributions, dividends, optional).',
  'Enter exit value (proceeds at exit, positive cash flow).',
  'Review IRR and NPV calculations.',
];

const faqs = [
  {
    question: 'What is IRR in PE/VC?',
    answer:
      'IRR (Internal Rate of Return) is the annualized rate of return that makes the NPV of all cash flows equal to zero. It accounts for the timing of cash flows and is the primary return metric for PE/VC investments.',
  },
  {
    question: 'How is IRR calculated?',
    answer:
      'IRR is the discount rate r that satisfies: NPV = Σ(Cash Flow_t / (1 + r)^t) = 0. Cash flows include initial investment (negative), annual distributions (positive), and exit proceeds (positive). IRR is solved iteratively using Excel IRR or XIRR functions.',
  },
  {
    question: 'What cash flows are included?',
    answer:
      'Cash flows include: initial investment (negative, Year 0), annual distributions/dividends (positive, Years 1-N), management fees (negative, if applicable), and exit proceeds (positive, final year). All cash flows should be on an after-tax basis.',
  },
  {
    question: 'What is a good IRR for PE/VC?',
    answer:
      'Target IRRs vary by strategy: Venture Capital: 25-40%+ (high risk, high return), Growth Equity: 20-30%, Buyout: 20-25%, Distressed: 15-25%. Top quartile funds often achieve 30%+ IRR. Returns vary significantly by fund, strategy, and market conditions.',
  },
  {
    question: 'How does timing affect IRR?',
    answer:
      'IRR is highly sensitive to timing. Earlier exits and distributions increase IRR, while later exits reduce IRR. For example, 2.0x MOIC over 3 years ≈ 26% IRR, but over 7 years ≈ 10% IRR. Timing is critical for IRR calculation.',
  },
  {
    question: 'What is the difference between gross and net IRR?',
    answer:
      'Gross IRR includes only investment returns, while net IRR deducts management fees (typically 1-2% annually) and carried interest (typically 20% of profits). Net IRR is typically 3-5 percentage points lower and represents returns to limited partners.',
  },
  {
    question: 'How do I calculate IRR with irregular cash flows?',
    answer:
      'Use Excel XIRR function for irregular cash flows with specific dates. XIRR accounts for exact timing of cash flows, providing more accurate IRR than regular IRR function. Format: XIRR(cash flows, dates).',
  },
  {
    question: 'What if IRR cannot be calculated?',
    answer:
      'IRR may not exist if all cash flows are negative or positive. Multiple IRRs can occur with alternating positive/negative cash flows. In these cases, use NPV at various discount rates or MOIC as alternative metrics.',
  },
  {
    question: 'How do I validate IRR?',
    answer:
      'Validate by: comparing to fund benchmarks and similar transactions, reviewing exit assumptions and cash flow projections, assessing reasonableness of timing assumptions, performing sensitivity analysis, and checking against MOIC for consistency.',
  },
  {
    question: 'What is the relationship between IRR and MOIC?',
    answer:
      'IRR and MOIC are related but different. MOIC measures total return multiple, while IRR accounts for timing. Higher MOIC generally means higher IRR, but timing matters. IRR ≈ (MOIC)^(1/holding period) - 1 is a useful approximation.',
  },
];

const relatedCalculators = [
  {
    name: 'LBO (Leveraged Buyout) Return Calculator',
    slug: 'lbo-leveraged-buyout-return-calculator',
    description: 'Calculate MOIC and IRR for LBO investments.',
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
  {
    name: 'Startup Valuation (Post-Money / Pre-Money) Calculator',
    slug: 'startup-valuation-post-money-pre-money-calculator',
    description: 'Calculate startup valuations.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/irr-pe-vc-deal-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Internal Rate of Return (IRR) for PE/VC Deal Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Internal Rate of Return (IRR) for PE/VC Deal Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate IRR for PE/VC deals with detailed cash flows including initial investment, annual distributions, and exit proceeds.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Simple IRR calculation using Newton-Raphson method
const calculateIRR = (cashFlows: number[]): number => {
  if (cashFlows.length < 2) return 0;
  
  // Check if all cash flows have same sign
  const allPositive = cashFlows.every(cf => cf >= 0);
  const allNegative = cashFlows.every(cf => cf <= 0);
  if (allPositive || allNegative) return 0;
  
  // Initial guess
  let rate = 0.1;
  const maxIterations = 100;
  const tolerance = 0.0001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let npvDerivative = 0;
    
    for (let t = 0; t < cashFlows.length; t++) {
      const pv = cashFlows[t] / Math.pow(1 + rate, t);
      npv += pv;
      npvDerivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    
    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }
    
    if (Math.abs(npvDerivative) < tolerance) {
      break;
    }
    
    rate = rate - npv / npvDerivative;
    
    // Prevent negative rates
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }
  
  return rate * 100;
};

const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate / 100, t);
  }
  return npv;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialInvestment = values.initialInvestment;
  const cashFlows: number[] = [-initialInvestment]; // Year 0: negative investment
  
  // Add annual cash flows (Years 1-5)
  const annualFlows = [
    values.year1CashFlow ?? 0,
    values.year2CashFlow ?? 0,
    values.year3CashFlow ?? 0,
    values.year4CashFlow ?? 0,
    values.year5CashFlow ?? 0,
  ];
  
  // Find last year with cash flow
  let lastYearIndex = annualFlows.length - 1;
  while (lastYearIndex >= 0 && annualFlows[lastYearIndex] === 0) {
    lastYearIndex--;
  }
  
  // Add annual flows up to last non-zero year
  for (let i = 0; i <= lastYearIndex; i++) {
    cashFlows.push(annualFlows[i]);
  }
  
  // Add exit value in final year (replace last year if it has cash flow, or add new year)
  if (lastYearIndex >= 0) {
    cashFlows[cashFlows.length - 1] += values.exitValue;
  } else {
    cashFlows.push(values.exitValue);
  }
  
  const irr = calculateIRR(cashFlows);
  const npv = calculateNPV(cashFlows, irr);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (irr <= 0) {
    status = 'low';
    interpretation = 'Negative or zero IRR indicates investment does not meet return requirements. Review assumptions and cash flow projections.';
  } else if (irr < 15) {
    status = 'low';
    interpretation = 'IRR below 15% is below typical PE/VC targets. Consider if returns meet fund requirements and market benchmarks.';
  } else if (irr < 20) {
    status = 'moderate';
    interpretation = 'IRR 15-20% is in lower range for PE/VC. May be acceptable for lower-risk strategies or market conditions.';
  } else if (irr < 30) {
    status = 'good';
    interpretation = 'IRR 20-30% represents solid PE/VC performance, typically above median fund returns.';
  } else {
    status = 'optimal';
    interpretation = 'IRR ≥30% represents top quartile PE/VC performance, exceeding typical fund benchmarks.';
  }

  const recommendations = [
    `IRR: ${irr.toFixed(2)}% represents the annualized rate of return accounting for timing of cash flows. This is the primary return metric for PE/VC investments.`,
    `NPV at IRR: ${npv.toLocaleString()} (should be near zero). NPV represents the present value of all cash flows discounted at the IRR.`,
    `Cash flows: Initial investment ${initialInvestment.toLocaleString()}, annual distributions ${annualFlows.filter(cf => cf !== 0).length} years, exit value ${values.exitValue.toLocaleString()}.`,
  ];
  
  if (irr < 20) {
    recommendations.push('Consider: IRR below 20% may be below PE/VC fund targets. Review exit assumptions, cash flow projections, and timing. Consider if returns meet fund requirements.');
  }
  
  if (irr >= 30) {
    recommendations.push('Excellent: IRR ≥30% represents top quartile performance. This indicates strong returns driven by successful exit, early distributions, or operational improvements.');
  }
  
  recommendations.push('Validation: Compare IRR to fund benchmarks and similar transactions. Review exit assumptions and cash flow projections. Perform sensitivity analysis on key variables. Consider gross vs. net IRR (deducting fees and carry).');

  const plan = [
    { label: 'This Week', detail: `Calculate IRR: ${irr.toFixed(2)}% based on cash flows. Compare to fund targets and benchmarks. Review exit assumptions and cash flow projections.` },
    { label: 'This Month', detail: 'Validate IRR by comparing to similar transactions, reviewing exit assumptions, and performing sensitivity analysis. Consider gross vs. net IRR (deducting fees and carry).' },
    { label: 'Ongoing', detail: 'Monitor investment performance against projections. Track actual cash flows and exit timing. Update IRR calculations based on actual performance and market conditions.' },
  ];

  return { initialInvestment, cashFlows, exitValue: values.exitValue, irr, npv, interpretation, status, recommendations, plan };
};

export default function IrrPeVcDealCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      year1CashFlow: undefined,
      year2CashFlow: undefined,
      year3CashFlow: undefined,
      year4CashFlow: undefined,
      year5CashFlow: undefined,
      exitValue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="irr-pe-vc-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Internal Rate of Return (IRR) for PE/VC Deal Calculator
          </CardTitle>
          <CardDescription>Calculate IRR for PE/VC deals with detailed cash flows including initial investment, annual distributions, and exit proceeds.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your PE/VC deal cash flows</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Investment</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year1CashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year 1 Cash Flow (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year2CashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year 2 Cash Flow (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year3CashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year 3 Cash Flow (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year4CashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year 4 Cash Flow (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year5CashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year 5 Cash Flow (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate IRR
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
            <CardDescription>See IRR and NPV calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">IRR</p>
                <p className="text-2xl font-semibold text-primary">{result.irr.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Annualized return</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">NPV at IRR</p>
                <p className="text-2xl font-semibold text-primary">${result.npv.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Should be near zero</p>
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
            <strong>IRR</strong> is the discount rate r that satisfies: NPV = Σ(Cash Flow_t / (1 + r)^t) = 0
          </p>
          <p>
            Cash flows include: initial investment (negative, Year 0), annual distributions (positive, Years 1-N), and exit proceeds (positive, final year).
          </p>
          <p>
            <strong>NPV</strong> = Σ(Cash Flow_t / (1 + Discount Rate)^t)
          </p>
          <p>IRR is solved iteratively using Newton-Raphson method or Excel IRR/XIRR functions. IRR accounts for the timing of cash flows and is the primary return metric for PE/VC investments.</p>
          <p>Target IRRs vary by strategy: VC 25-40%+, Growth Equity 20-30%, Buyout 20-25%. Top quartile funds achieve 30%+ IRR.</p>
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
        <meta itemProp="name" content="The Complete Guide to IRR for PE/VC Deals: Cash Flow Analysis" />
        <meta itemProp="description" content="An in-depth guide on calculating IRR for PE/VC deals with detailed cash flows, understanding return metrics, and validating IRR calculations." />
        <meta itemProp="keywords" content="IRR, PE IRR, VC IRR, private equity IRR, venture capital IRR, cash flow analysis" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/irr-pe-vc-deal-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to IRR for PE/VC Deals: Cash Flow Analysis</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at calculating IRR for PE/VC deals with detailed cash flows, understanding return metrics, and validating IRR calculations.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding IRR</a></li>
          <li><a href="#calculation" className="hover:underline">IRR Calculation</a></li>
          <li><a href="#cashflows" className="hover:underline">Cash Flow Components</a></li>
          <li><a href="#benchmarks" className="hover:underline">IRR Benchmarks</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding IRR</h2>
        <p>IRR (Internal Rate of Return) is the annualized rate of return that makes the NPV of all cash flows equal to zero. It accounts for the timing of cash flows and is the primary return metric for PE/VC investments.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>NPV = Σ(Cash Flow_t / (1 + IRR)^t) = 0</strong></p>
        </div>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">IRR Calculation</h2>
        <p>IRR is solved iteratively using Newton-Raphson method or Excel IRR/XIRR functions. The calculation requires:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Initial investment (negative cash flow, Year 0)</li>
          <li>Annual cash flows (distributions, dividends, Years 1-N)</li>
          <li>Exit proceeds (positive cash flow, final year)</li>
        </ul>

        <hr className="my-6" />

        <h2 id="cashflows" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cash Flow Components</h2>
        <p>Cash flows should include:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Initial Investment:</strong> Equity invested at acquisition (negative)</li>
          <li><strong>Annual Distributions:</strong> Dividends, distributions, or partial exits (positive)</li>
          <li><strong>Management Fees:</strong> Annual fees paid to fund manager (negative, if applicable)</li>
          <li><strong>Exit Proceeds:</strong> Sale proceeds, IPO proceeds, or final distribution (positive)</li>
        </ul>
        <p>All cash flows should be on an after-tax basis.</p>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">IRR Benchmarks</h2>
        <p>Target IRRs vary by strategy:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Venture Capital:</strong> 25-40%+ (high risk, high return)</li>
          <li><strong>Growth Equity:</strong> 20-30%</li>
          <li><strong>Buyout:</strong> 20-25%</li>
          <li><strong>Distressed:</strong> 15-25%</li>
        </ul>
        <p>Top quartile funds often achieve 30%+ IRR.</p>

        <hr className="my-6" />

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Validate IRR by:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Comparing to fund benchmarks and similar transactions</li>
          <li>Reviewing exit assumptions and cash flow projections</li>
          <li>Assessing reasonableness of timing assumptions</li>
          <li>Performing sensitivity analysis</li>
          <li>Considering gross vs. net IRR (deducting fees and carry)</li>
        </ul>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>IRR is the primary return metric for PE/VC investments, accounting for timing of cash flows. Proper calculation requires accurate cash flow projections, appropriate discounting, and validation against benchmarks. IRR varies significantly by strategy, fund, and market conditions.</p>
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
          <p>This tool calculates IRR for PE/VC deals with detailed cash flows including initial investment, annual distributions, and exit proceeds.</p>
          <p>Outputs include IRR, NPV at IRR, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

