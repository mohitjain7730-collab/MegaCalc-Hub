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
  bookValue: z.number({ invalid_type_error: 'Enter book value' }).min(0),
  expectedNetIncome: z.number({ invalid_type_error: 'Enter expected net income' }),
  requiredReturn: z.number({ invalid_type_error: 'Enter required return' }).min(0).max(100),
  growthRate: z.number({ invalid_type_error: 'Enter growth rate' }).min(-100).max(100).optional(),
  forecastYears: z.number({ invalid_type_error: 'Enter forecast years' }).min(1).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bookValue: number;
  expectedNetIncome: number;
  requiredReturn: number;
  residualIncome: number;
  equityValue: number;
  premiumToBook: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current book value of equity (total shareholders\' equity).',
  'Enter expected net income for the forecast period.',
  'Enter required return (cost of equity) as a percentage.',
  'Optionally enter growth rate and forecast years for multi-period analysis.',
  'Review residual income, equity value, premium to book, and recommendations.',
];

const faqs = [
  {
    question: 'What is residual income?',
    answer:
      'Residual income is earnings above the required return on book equity. It represents the excess profit after accounting for the opportunity cost of capital invested in the business.',
  },
  {
    question: 'How does residual income model work?',
    answer:
      'The residual income model values equity as book value plus the present value of future residual income. Equity Value = Book Value + PV of Future Residual Income. This captures value creation above the required return.',
  },
  {
    question: 'What is the required return?',
    answer:
      'Required return is the cost of equity, representing the minimum return investors expect. It can be estimated using CAPM, dividend discount model, or bond yield plus risk premium. Typically ranges from 8% to 15% for most companies.',
  },
  {
    question: 'When is residual income model best used?',
    answer:
      'The model is ideal when firms don\'t pay dividends, book value is meaningful and reliable, accounting quality is high, or for financial institutions where book value is a key metric. It\'s particularly useful for companies with negative or irregular cash flows.',
  },
  {
    question: 'What about negative residual income?',
    answer:
      'Negative residual income reduces equity value below book value, indicating the company is earning less than the required return. This suggests poor performance relative to investor expectations and may signal value destruction.',
  },
  {
    question: 'How to forecast residual income?',
    answer:
      'Forecast net income and book value for each period. Residual income = Net Income - (Beginning Book Equity Ã— Required Return). Book value grows by retained earnings (Net Income - Dividends).',
  },
  {
    question: 'What is terminal value in residual income model?',
    answer:
      'Terminal value is the present value of residual income beyond the explicit forecast period. Common assumptions include constant growth in residual income, zero residual income (convergence to book value), or perpetuity with no growth.',
  },
  {
    question: 'Does it work for banks and financial institutions?',
    answer:
      'Yes, residual income model is commonly used for financial firms where book value is a key metric and regulatory capital requirements make book value particularly relevant. It aligns well with the accounting structure of financial institutions.',
  },
  {
    question: 'How does it compare to DCF valuation?',
    answer:
      'Both models should yield the same value if assumptions are consistent. Residual income focuses on accounting earnings and book value, while DCF focuses on cash flows. Residual income can be more intuitive when book value is meaningful.',
  },
  {
    question: 'What adjustments are needed for book value?',
    answer:
      'Clean book value by removing goodwill impairments, adjusting for off-balance-sheet items, using market values for certain assets, and ensuring clean surplus accounting. Book value should reflect economic reality, not just accounting numbers.',
  },
];

const relatedCalculators = [
  {
    name: 'DCF Valuation Calculator',
    slug: 'dcf-calculator',
    description: 'Value equity using discounted cash flow approach.',
  },
  {
    name: 'Dividend Discount Model Calculator',
    slug: 'dividend-discount-model-calculator',
    description: 'Estimate value based on dividend payments.',
  },
  {
    name: 'Market Value Added (MVA) Calculator',
    slug: 'market-value-added-mva-calculator',
    description: 'Compare market value to book value of capital.',
  },
  {
    name: 'Return on Equity Calculator',
    slug: 'return-on-equity-calculator',
    description: 'Evaluate profitability relative to equity.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/residual-income-model-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Residual Income Model Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Residual Income Model Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate equity value using residual income model: book value plus present value of residual income.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const bookValue = values.bookValue;
  const expectedNetIncome = values.expectedNetIncome;
  const requiredReturn = values.requiredReturn / 100;
  const growthRate = values.growthRate ? values.growthRate / 100 : 0;
  const forecastYears = values.forecastYears || 1;

  // Validate required return to avoid division by zero
  if (requiredReturn <= 0) {
    throw new Error('Required return must be greater than 0');
  }

  // Calculate residual income
  const residualIncome = expectedNetIncome - (bookValue * requiredReturn);

  // Calculate equity value
  let equityValue = bookValue;
  if (forecastYears > 1 && growthRate < requiredReturn && Math.abs(requiredReturn - growthRate) > 0.0001) {
    // Multi-period with growth
    const pvri = residualIncome * (1 - Math.pow((1 + growthRate) / (1 + requiredReturn), forecastYears)) / (requiredReturn - growthRate);
    equityValue = bookValue + pvri;
  } else if (forecastYears > 1) {
    // Multi-period without growth (or growth >= required return, use perpetuity)
    equityValue = bookValue + (residualIncome / requiredReturn);
  } else {
    // Single period
    equityValue = bookValue + (residualIncome / (1 + requiredReturn));
  }

  const premiumToBook = equityValue - bookValue;
  const premiumPercent = bookValue > 0 ? (premiumToBook / bookValue) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The residual income model suggests the equity is fairly valued relative to book value. The company is generating returns above the required rate.';

  if (residualIncome < 0) {
    status = 'low';
    interpretation = 'Negative residual income indicates the company is earning less than the required return. Equity value is below book value, suggesting poor performance relative to investor expectations.';
  } else if (premiumPercent < 10) {
    status = 'moderate';
    interpretation = 'The equity value shows a modest premium to book value. Residual income is positive but relatively small, indicating limited value creation above the required return.';
  } else if (premiumPercent >= 10 && premiumPercent <= 50) {
    status = 'optimal';
    interpretation = 'The residual income model indicates strong value creation. Equity value significantly exceeds book value, reflecting substantial residual income generation above the required return.';
  } else {
    status = 'good';
    interpretation = 'The equity value shows a substantial premium to book value. The company is generating significant residual income, indicating strong value creation and competitive advantages.';
  }

  const recommendations = [
    'Verify book value accuracy: ensure book value reflects economic reality by adjusting for goodwill, off-balance-sheet items, and using market values where appropriate.',
    `Use appropriate required return: ${(requiredReturn * 100).toFixed(1)}% should reflect the cost of equity based on company risk, market conditions, and investor expectations.`,
    'Consider terminal value assumptions: for multi-period forecasts, ensure terminal value assumptions (growth rate, convergence) are reasonable and consistent with industry dynamics.',
  ];
  if (residualIncome < 0) {
    recommendations.push('Investigate negative residual income: analyze why the company is earning less than required return. Consider operational improvements, cost reductions, or strategic changes.');
  }
  if (premiumPercent > 50) {
    recommendations.push('Validate high premium: ensure assumptions are conservative and realistic. High premiums may indicate optimistic forecasts or model limitations.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate residual income and equity value using current book value (${bookValue.toLocaleString()}) and expected net income. Compare to market value to assess valuation.` },
    { label: 'This Month', detail: 'Refine forecasts by updating book value projections, reviewing required return assumptions, and validating growth rate estimates based on company fundamentals.' },
    { label: 'Ongoing', detail: 'Monitor residual income trends over time. Track changes in book value, net income, and required return to maintain accurate equity valuations.' },
  ];

  return { bookValue, expectedNetIncome, requiredReturn: values.requiredReturn, residualIncome, equityValue, premiumToBook, status, interpretation, recommendations, plan };
};

export default function ResidualIncomeModelCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookValue: undefined,
      expectedNetIncome: undefined,
      requiredReturn: undefined,
      growthRate: undefined,
      forecastYears: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="residual-income-model-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Residual Income Model Calculator
          </CardTitle>
          <CardDescription>Estimate equity value using residual income model: book value plus present value of residual income.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your financial data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bookValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Value of Equity ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedNetIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Net Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="growthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forecastYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Years - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate equity value
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
            <CardDescription>See residual income, equity value, premium to book, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Residual Income</p>
                <p className={`text-2xl font-semibold ${result.residualIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.residualIncome.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity Value</p>
                <p className="text-2xl font-semibold text-primary">{result.equityValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Premium to Book</p>
                <p className={`text-2xl font-semibold ${result.premiumToBook >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.premiumToBook.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
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
            <strong>Residual Income</strong> = Expected Net Income - (Book Value Ã— Required Return). This represents earnings above the opportunity cost of capital.
          </p>
          <p>
            <strong>Equity Value</strong> = Book Value + Present Value of Future Residual Income. For single period: Equity Value = Book Value + Residual Income / (1 + Required Return).
          </p>
          <p>
            <strong>Multi-period with growth</strong>: Equity Value = Book Value + Residual Income Ã— [1 - ((1 + Growth Rate) / (1 + Required Return))^Years] / (Required Return - Growth Rate).
          </p>
          <p>
            <strong>Premium to Book</strong> = Equity Value - Book Value. A positive premium indicates value creation above book value, while negative premium suggests value destruction.
          </p>
          <p>The residual income model is particularly useful for companies where book value is meaningful, accounting quality is high, or for financial institutions where regulatory capital makes book value relevant.</p>
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
                <p className="text-sm text-muted-foreground">Premium %</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.premiumToBook / result.bookValue) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of book value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ROE vs Required</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.expectedNetIncome / result.bookValue) * 100).toFixed(1)}% vs {result.requiredReturn.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Actual vs Required</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Value per $ Book</p>
                <p className="text-xl font-semibold text-primary">{(result.equityValue / result.bookValue).toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Equity multiple</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your financial data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Residual Income Model: Equity Valuation Using Book Value and Residual Income" />
    <meta itemProp="description" content="An in-depth guide on the Residual Income Model (RIM), detailing how to value equity using book value plus the present value of future residual income, with comprehensive formulas, applications, and best practices." />
    <meta itemProp="keywords" content="residual income model, RIM valuation, equity valuation, book value, residual income, cost of equity, equity value calculator, accounting-based valuation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-residual-income-model-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Residual Income Model: Equity Valuation Using Book Value and Residual Income</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to valuing equity using the Residual Income Model, which combines book value with the present value of future residual income to estimate intrinsic value.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is the Residual Income Model?</a></li>
        <li><a href="#formula" className="hover:underline">Core Formula and Calculation</a></li>
        <li><a href="#components" className="hover:underline">Key Components: Book Value, Net Income, and Required Return</a></li>
        <li><a href="#applications" className="hover:underline">When to Use Residual Income Model</a></li>
        <li><a href="#terminal" className="hover:underline">Terminal Value and Multi-Period Forecasting</a></li>
        <li><a href="#comparison" className="hover:underline">Comparison with DCF and Other Valuation Methods</a></li>
    </ul>
<hr />

    {/* OVERVIEW: WHAT IS THE RESIDUAL INCOME MODEL */}
    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is the Residual Income Model?</h2>
    <p>The <b>Residual Income Model (RIM)</b>, also known as the <b>Economic Value Added (EVA)</b> model or <b>Abnormal Earnings Model</b>, is an equity valuation method that estimates intrinsic value by combining book value with the present value of future residual income. Unlike discounted cash flow (DCF) models that focus on cash flows, RIM uses accounting earnings and book value as its foundation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Residual income represents the <b>excess earnings</b> above the required return on invested capital. It answers the question: "After accounting for the opportunity cost of capital, how much value is the company creating?"</p>
    <p>If a company has $1 million in book equity and investors require a 12% return, the company must earn at least $120,000 just to meet expectations. Any earnings above $120,000 represent <b>residual income</b>â€”value creation beyond the minimum required return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Residual Income Matters</h3>
    <p>Traditional valuation methods like DCF can be challenging when companies have negative or irregular cash flows, don't pay dividends, or operate in industries where book value is particularly meaningful (such as financial services). The residual income model addresses these limitations by:</p>
    <ul>
        <li><b>Using accounting earnings:</b> More stable and predictable than cash flows for many companies</li>
        <li><b>Incorporating book value:</b> Provides a floor for valuation and reflects invested capital</li>
        <li><b>Focusing on value creation:</b> Directly measures whether management is creating or destroying value</li>
        <li><b>Working without dividends:</b> Doesn't require dividend payments or forecasts</li>
    </ul>

<hr />

    {/* CORE FORMULA AND CALCULATION */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Formula and Calculation</h2>
    <p>The residual income model has two fundamental equations:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Residual Income Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Residual Income = Net Income - (Book Value Ã— Required Return)</b></p>
    </div>
    <p>This formula calculates the excess earnings after accounting for the opportunity cost of capital. A positive residual income indicates value creation, while negative residual income suggests the company is earning less than investors require.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Equity Value Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Equity Value = Book Value + Present Value of Future Residual Income</b></p>
    </div>
    <p>For a single-period model (one year forecast):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Equity Value = Book Value + Residual Income / (1 + Required Return)</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Multi-Period Model with Growth</h3>
    <p>For multiple forecast periods with constant growth in residual income:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Equity Value = Book Value + RI Ã— [1 - ((1 + g) / (1 + r))^n] / (r - g)</b></p>
    </div>
    <p>Where:</p>
    <ul>
        <li><b>RI</b> = Residual Income in first period</li>
        <li><b>g</b> = Growth rate of residual income</li>
        <li><b>r</b> = Required return (cost of equity)</li>
        <li><b>n</b> = Number of forecast periods</li>
    </ul>
    <p><b>Important:</b> This formula assumes growth rate (g) is less than required return (r). If g â‰¥ r, the model breaks down mathematically and alternative terminal value assumptions must be used.</p>

<hr />

    {/* KEY COMPONENTS */}
    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Components: Book Value, Net Income, and Required Return</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Book Value of Equity</h3>
    <p><b>Book value</b> represents the accounting value of shareholders' equityâ€”total assets minus total liabilities. It serves as the foundation of the residual income model and provides a "floor" for valuation.</p>
    <p><b>Adjustments to book value:</b> For accurate valuation, book value should be "cleaned" to reflect economic reality:</p>
    <ul>
        <li><b>Remove goodwill impairments:</b> Goodwill may not reflect economic value</li>
        <li><b>Adjust for off-balance-sheet items:</b> Include operating leases, contingent liabilities, etc.</li>
        <li><b>Use market values where appropriate:</b> For certain assets (real estate, investments), market values may be more relevant</li>
        <li><b>Ensure clean surplus accounting:</b> Book value should grow only through retained earnings (Net Income - Dividends)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expected Net Income</h3>
    <p><b>Net income</b> is the accounting profit after all expenses, taxes, and interest. For the residual income model, you need to forecast expected net income for the forecast period(s).</p>
    <p><b>Forecasting considerations:</b></p>
    <ul>
        <li>Use normalized earnings that reflect sustainable profitability</li>
        <li>Adjust for one-time items, restructuring charges, or accounting anomalies</li>
        <li>Consider industry trends, competitive dynamics, and company-specific factors</li>
        <li>For multi-period models, forecast how net income will evolve over time</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Required Return (Cost of Equity)</h3>
    <p><b>Required return</b> is the minimum return investors expect for bearing the risk of owning the company's equity. It represents the opportunity cost of capital and is typically estimated using:</p>
    <ul>
        <li><b>Capital Asset Pricing Model (CAPM):</b> Required Return = Risk-Free Rate + Beta Ã— Market Risk Premium</li>
        <li><b>Dividend Discount Model:</b> Required Return = (Dividend / Price) + Growth Rate</li>
        <li><b>Bond Yield Plus Risk Premium:</b> Required Return = Corporate Bond Yield + Equity Risk Premium (typically 3-5%)</li>
    </ul>
    <p><b>Typical ranges:</b> Required return typically ranges from 8% to 15% for most companies, with higher values for riskier companies or during periods of high market risk premiums.</p>

<hr />

    {/* WHEN TO USE RESIDUAL INCOME MODEL */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Use Residual Income Model</h2>
    <p>The residual income model is particularly well-suited for certain situations:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Companies Without Dividends</h3>
    <p>For companies that don't pay dividends or have irregular dividend policies, dividend discount models are impractical. The residual income model doesn't require dividend forecasts, making it ideal for growth companies or firms reinvesting all earnings.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Financial Institutions</h3>
    <p>Banks, insurance companies, and other financial institutions have book value as a key regulatory and operational metric. The residual income model aligns naturally with how these firms are managed and regulated, making it a preferred valuation method.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. High Book Value Relevance</h3>
    <p>When book value is meaningful and reflects economic reality (e.g., asset-heavy businesses, real estate companies), the residual income model provides intuitive valuations. The model explicitly incorporates book value, making it more relevant than pure cash flow models.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Negative or Irregular Cash Flows</h3>
    <p>Companies with negative cash flows (startups, capital-intensive firms in growth phase) are difficult to value using DCF. The residual income model uses accounting earnings, which may be positive even when cash flows are negative, providing a more stable valuation foundation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. High Accounting Quality</h3>
    <p>When accounting standards are high and earnings quality is good, the residual income model benefits from reliable accounting data. This is particularly true in developed markets with strong regulatory oversight.</p>

<hr />

    {/* TERMINAL VALUE */}
    <h2 id="terminal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Terminal Value and Multi-Period Forecasting</h2>
    <p>For multi-period residual income models, you must make assumptions about what happens beyond the explicit forecast period. Common terminal value approaches include:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Constant Growth in Residual Income</h3>
    <p>Assume residual income grows at a constant rate (g) forever. This requires g &lt; r (required return) and uses the formula:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Terminal Value = RI<sub>n+1</sub> / (r - g)</b></p>
    </div>
    <p>Where RI<sub>n+1</sub> is residual income in the first year after the forecast period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Zero Residual Income (Convergence)</h3>
    <p>Assume that competitive forces eliminate excess returns, so residual income converges to zero. This is conservative and assumes the company will only earn the required return in perpetuity, making equity value equal to book value at the terminal date.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Perpetuity with No Growth</h3>
    <p>Assume residual income remains constant (no growth) forever:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Terminal Value = RI / r</b></p>
    </div>

<hr />

    {/* COMPARISON WITH OTHER METHODS */}
    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comparison with DCF and Other Valuation Methods</h2>
    <p>The residual income model should theoretically yield the same value as DCF if assumptions are consistent. However, they differ in practice:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Residual Income vs. DCF</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Aspect</th>
                    <th className="border-b p-2 font-bold">Residual Income Model</th>
                    <th className="border-b p-2 font-bold">DCF Model</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Foundation</td>
                    <td className="border-b p-2">Accounting earnings & book value</td>
                    <td className="border-b p-2">Cash flows</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Best for</td>
                    <td className="border-b p-2">No dividends, high book value relevance</td>
                    <td className="border-b p-2">Stable cash flows, dividend-paying</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Terminal value</td>
                    <td className="border-b p-2">Residual income assumptions</td>
                    <td className="border-b p-2">Cash flow growth assumptions</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Intuition</td>
                    <td className="border-b p-2">Value creation above required return</td>
                    <td className="border-b p-2">Present value of future cash flows</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages of Residual Income Model</h3>
    <ul>
        <li>Works without dividend forecasts</li>
        <li>Incorporates book value explicitly</li>
        <li>Uses accounting earnings (often more stable than cash flows)</li>
        <li>Directly measures value creation vs. destruction</li>
        <li>Intuitive for financial institutions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations of Residual Income Model</h3>
    <ul>
        <li>Depends on accounting quality and clean surplus accounting</li>
        <li>Requires accurate book value adjustments</li>
        <li>Terminal value assumptions can significantly impact results</li>
        <li>Less intuitive than DCF for cash-generating businesses</li>
        <li>May not work well for companies with poor accounting quality</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The <b>Residual Income Model</b> is a powerful equity valuation method that combines book value with the present value of future residual income. It's particularly valuable for companies without dividends, financial institutions, and firms where book value is meaningful. The model directly measures value creation by comparing actual earnings to required returns, providing intuitive insights into whether management is creating or destroying shareholder value.</p>
    <p>Key to successful application is ensuring accurate book value (with appropriate adjustments), realistic net income forecasts, and appropriate required return estimates. When used correctly, the residual income model should yield valuations consistent with DCF models, while offering unique advantages for certain types of companies and industries.</p>
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
          <p>This tool estimates equity value using the residual income model: book value plus present value of residual income.</p>
          <p>Outputs include book value, expected net income, required return, residual income, equity value, premium to book, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
