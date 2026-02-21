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
  finalYearFreeCashFlow: z.number({ invalid_type_error: 'Enter final year free cash flow' }).min(0),
  perpetualGrowthRate: z.number({ invalid_type_error: 'Enter perpetual growth rate' }).min(0).max(10),
  wacc: z.number({ invalid_type_error: 'Enter WACC' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  finalYearFreeCashFlow: number;
  perpetualGrowthRate: number;
  wacc: number;
  nextYearFreeCashFlow: number;
  terminalValue: number;
  presentValueOfTerminalValue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter final year free cash flow from forecast period.',
  'Enter perpetual growth rate (typically 2-4%).',
  'Enter WACC (Weighted Average Cost of Capital).',
  'Review terminal value and present value calculations.',
];

const faqs = [
  {
    question: 'What is terminal value (Gordon Growth Model)?',
    answer:
      'Terminal value using the Gordon Growth Model (perpetuity growth model) estimates the value of a company\'s cash flows beyond the explicit forecast period, assuming cash flows grow at a constant perpetual rate forever. It\'s calculated as: Terminal Value = FCF(n+1) / (WACC - g), where FCF(n+1) is next year\'s free cash flow, WACC is the discount rate, and g is the perpetual growth rate.',
  },
  {
    question: 'How is terminal value calculated?',
    answer:
      'Terminal Value = Next Year FCF / (WACC - Perpetual Growth Rate). First, calculate next year\'s FCF by growing the final year FCF by the growth rate: FCF(n+1) = Final Year FCF * (1 + g). Then divide by (WACC - g) to get the terminal value. This assumes cash flows grow forever at the perpetual growth rate.',
  },
  {
    question: 'What is perpetual growth rate?',
    answer:
      'Perpetual growth rate is the constant rate at which free cash flows are assumed to grow forever beyond the forecast period. It typically ranges from 2-4%, roughly matching long-term GDP growth plus inflation. Growth rates above 5% are generally unrealistic for mature companies and should be avoided, as they assume the company will outgrow the economy indefinitely.',
  },
  {
    question: 'What is WACC?',
    answer:
      'WACC (Weighted Average Cost of Capital) is the discount rate used to value the terminal cash flows. It represents the required return on investment, weighted by the proportion of debt and equity in the capital structure. WACC must be greater than the perpetual growth rate for the formula to be mathematically valid.',
  },
  {
    question: 'Why must WACC be greater than growth rate?',
    answer:
      'WACC must exceed the growth rate to ensure the denominator (WACC - g) is positive, making the formula mathematically valid. If growth rate equals or exceeds WACC, the terminal value becomes infinite or negative, which is economically meaningless. In practice, WACC is typically 8-15% while growth rates are 2-4%, ensuring a positive difference.',
  },
  {
    question: 'How do I calculate present value of terminal value?',
    answer:
      'Present Value of Terminal Value = Terminal Value / (1 + WACC)^n, where n is the number of years in the forecast period. This discounts the terminal value (which is in year n) back to today\'s present value, consistent with discounting forecast period cash flows.',
  },
  {
    question: 'What if growth rate equals or exceeds WACC?',
    answer:
      'If the perpetual growth rate equals or exceeds WACC, the Gordon Growth Model becomes invalid (dividing by zero or negative value). This suggests the growth rate assumption is too high. Review and reduce the growth rate to a sustainable level (typically 2-4%), ensuring WACC exceeds growth rate by at least 2-3 percentage points for reasonable valuations.',
  },
  {
    question: 'How sensitive is terminal value to assumptions?',
    answer:
      'Terminal value is highly sensitive to both WACC and growth rate assumptions, often representing 50-80% of total DCF value. Small changes in these assumptions (e.g., 1% change in growth rate or WACC) can significantly impact valuation. This is why terminal value assumptions require careful justification and sensitivity analysis.',
  },
  {
    question: 'Should I use Gordon Growth or Exit Multiple?',
    answer:
      'Both methods are commonly used. Gordon Growth is preferred when: you can reasonably estimate long-term growth, the company has stable cash flow patterns, and you want a theoretically consistent approach. Exit Multiple is preferred when: comparable company multiples are reliable, the company may be sold in the forecast period, or growth is difficult to estimate. Many analysts use both for triangulation.',
  },
  {
    question: 'What is a reasonable perpetual growth rate?',
    answer:
      'Reasonable perpetual growth rates typically range from 2-4%, reflecting long-term economic growth expectations. For developed economies, 2-3% is common (roughly inflation). For faster-growing economies or companies with strong competitive advantages, 3-4% may be justified. Growth rates above 4% are rarely appropriate for mature companies, as they assume indefinite outperformance of the overall economy.',
  },
];

const relatedCalculators = [
  {
    name: 'Discounted Cash Flow (DCF) Sensitivity Grid Calculator',
    slug: 'discounted-cash-flow-dcf-sensitivity-grid-calculator',
    description: 'Calculate DCF sensitivity analysis.',
  },
  {
    name: 'Terminal Value (Exit Multiple) Calculator',
    slug: 'terminal-value-exit-multiple-calculator',
    description: 'Calculate terminal value using exit multiples.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/terminal-value-gordon-growth-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Terminal Value (Gordon Growth) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Terminal Value (Gordon Growth) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate terminal value using the Gordon Growth Model (perpetuity growth model) for DCF valuation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const finalYearFreeCashFlow = values.finalYearFreeCashFlow;
  const perpetualGrowthRatePct = values.perpetualGrowthRate / 100;
  const waccPct = values.wacc / 100;
  
  // Next Year FCF = Final Year FCF * (1 + g)
  const nextYearFreeCashFlow = finalYearFreeCashFlow * (1 + perpetualGrowthRatePct);
  
  // Terminal Value = FCF(n+1) / (WACC - g)
  // Assuming 5-year forecast period for PV calculation
  const forecastPeriod = 5;
  let terminalValue = 0;
  if (waccPct > perpetualGrowthRatePct) {
    terminalValue = nextYearFreeCashFlow / (waccPct - perpetualGrowthRatePct);
  }
  
  // Present Value of Terminal Value = TV / (1 + WACC)^n
  const presentValueOfTerminalValue = terminalValue / Math.pow(1 + waccPct, forecastPeriod);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Terminal value: ${terminalValue.toLocaleString()} using Gordon Growth Model. `;
  
  if (waccPct <= perpetualGrowthRatePct) {
    status = 'low';
    interpretation += 'ERROR: WACC must exceed growth rate - formula invalid.';
  } else if ((waccPct - perpetualGrowthRatePct) < 0.02) {
    status = 'low';
    interpretation += 'WARNING: Very small spread between WACC and growth rate creates high sensitivity.';
  } else if (perpetualGrowthRatePct > 0.05) {
    status = 'moderate';
    interpretation += 'High growth rate (>5%) may be unrealistic for mature companies.';
  } else {
    status = 'optimal';
    interpretation += 'Assumptions appear reasonable for terminal value calculation.';
  }

  const recommendations: string[] = [];
  
  if (waccPct <= perpetualGrowthRatePct) {
    recommendations.push('CRITICAL ERROR: WACC must exceed perpetual growth rate. The Gordon Growth Model is invalid when growth rate equals or exceeds WACC. Adjust assumptions: reduce growth rate to 2-4% range or increase WACC to ensure a positive spread of at least 2-3 percentage points.');
  } else {
    recommendations.push(`Terminal value calculation: ${terminalValue.toLocaleString()} calculated using Gordon Growth Model. Next year FCF: ${nextYearFreeCashFlow.toLocaleString()}, growing final year FCF by ${values.perpetualGrowthRate}%. Terminal value represents the value of all future cash flows beyond the forecast period, assuming perpetual growth at ${values.perpetualGrowthRate}%.`);
    recommendations.push(`Present value: Present value of terminal value is ${presentValueOfTerminalValue.toLocaleString()} (assuming ${forecastPeriod}-year forecast period). This is the value today of the terminal value, which should be added to the present value of forecast period cash flows to get total enterprise value.`);
    
    if (perpetualGrowthRatePct > 0.05) {
      recommendations.push(`High growth rate warning: Perpetual growth rate of ${values.perpetualGrowthRate}% exceeds typical 2-4% range. Growth rates above 4-5% are rarely appropriate for mature companies, as they assume the company will outgrow the economy indefinitely. Consider reducing to a more sustainable rate (2-4%) unless the company has exceptional competitive advantages.`);
    }
    
    if ((waccPct - perpetualGrowthRatePct) < 0.02) {
      recommendations.push(`High sensitivity warning: Small spread of ${((waccPct - perpetualGrowthRatePct) * 100).toFixed(1)}% between WACC and growth rate creates extreme sensitivity. Small changes in assumptions will cause large valuation swings. Consider increasing WACC or reducing growth rate to create a more reasonable spread (ideally 3-8%).`);
    }
  }
  
  recommendations.push('Sensitivity analysis: Terminal value is highly sensitive to WACC and growth rate assumptions, often representing 50-80% of total DCF value. Perform sensitivity analysis by varying both assumptions to understand valuation range. Compare to exit multiple method for triangulation.');

  const plan = [
    { label: 'This Week', detail: `Calculate terminal value: ${terminalValue.toLocaleString()} using Gordon Growth Model with ${values.perpetualGrowthRate}% growth rate and ${values.wacc}% WACC. Document assumptions and rationale for growth rate selection.` },
    { label: 'This Month', detail: 'Perform sensitivity analysis on terminal value by varying WACC and growth rate assumptions. Compare Gordon Growth terminal value to exit multiple method for triangulation. Review growth rate assumption - ensure it\'s sustainable and realistic (typically 2-4%).' },
    { label: 'Ongoing', detail: 'Update terminal value assumptions as market conditions or company prospects change. Regularly validate growth rate against long-term economic growth and company-specific factors. Monitor WACC for changes in capital structure or risk profile.' },
  ];

  return { finalYearFreeCashFlow, perpetualGrowthRate: values.perpetualGrowthRate, wacc: values.wacc, nextYearFreeCashFlow, terminalValue, presentValueOfTerminalValue, interpretation, status, recommendations, plan };
};

export default function TerminalValueGordonGrowthCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalYearFreeCashFlow: undefined,
      perpetualGrowthRate: undefined,
      wacc: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="terminal-value-gordon-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Terminal Value (Gordon Growth) Calculator
          </CardTitle>
          <CardDescription>Calculate terminal value using the Gordon Growth Model (perpetuity growth model) for DCF valuation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your terminal value parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="finalYearFreeCashFlow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Year Free Cash Flow</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perpetualGrowthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perpetual Growth Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Typically 2-4%</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wacc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WACC (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Must exceed growth rate</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Terminal Value
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
            <CardDescription>See terminal value calculation and present value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Next Year FCF</p>
                <p className="text-2xl font-semibold text-primary">{result.nextYearFreeCashFlow.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCF(n+1)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Terminal Value</p>
                <p className="text-2xl font-semibold text-primary">{result.terminalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Gordon Growth Model</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">PV of Terminal Value</p>
                <p className="text-2xl font-semibold text-primary">{result.presentValueOfTerminalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Present value</p>
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
            <strong>Next Year FCF</strong> = Final Year FCF * (1 + Perpetual Growth Rate)
          </p>
          <p>
            <strong>Terminal Value</strong> = Next Year FCF / (WACC - Perpetual Growth Rate)
          </p>
          <p>
            <strong>Present Value of Terminal Value</strong> = Terminal Value / (1 + WACC)^n
          </p>
          <p>Where n = number of years in forecast period (typically 5)</p>
          <p>The Gordon Growth Model (perpetuity growth model) calculates terminal value by assuming free cash flows grow at a constant perpetual rate forever. The model requires WACC to exceed the growth rate for the formula to be mathematically valid. Terminal value often represents 50-80% of total DCF value, making assumption selection critical.</p>
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
                <p className="text-sm text-muted-foreground">WACC - Growth Rate</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.wacc - result.perpetualGrowthRate) / 100).toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">Spread (decimal)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-xl font-semibold text-primary">{result.perpetualGrowthRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Perpetual growth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">WACC</p>
                <p className="text-xl font-semibold text-primary">{result.wacc.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Discount rate</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your terminal value parameters to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Terminal Value: Gordon Growth Model (Perpetuity Growth)" />
        <meta itemProp="description" content="An in-depth guide on calculating terminal value using the Gordon Growth Model (perpetuity growth model) for DCF valuation." />
        <meta itemProp="keywords" content="terminal value, Gordon Growth Model, perpetuity growth, DCF terminal value, terminal value calculation" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/terminal-value-gordon-growth-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Terminal Value: Gordon Growth Model (Perpetuity Growth)</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at calculating terminal value using the Gordon Growth Model (perpetuity growth model) for DCF valuation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Terminal Value</a></li>
          <li><a href="#gordon" className="hover:underline">Gordon Growth Model</a></li>
          <li><a href="#assumptions" className="hover:underline">Key Assumptions</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Steps</a></li>
          <li><a href="#sensitivity" className="hover:underline">Sensitivity Analysis</a></li>
          <li><a href="#best" className="hover:underline">Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Terminal Value in DCF Valuation</h2>
        <p>Terminal value (TV) is the estimated value of a company's cash flows <b>beyond the explicit forecast period</b> in a Discounted Cash Flow (DCF) valuation. Because it's impractical to forecast cash flows indefinitely, DCF models typically forecast cash flows for a finite period (usually 5-10 years) and then estimate the value of all future cash flows beyond that period as a single "terminal value." Terminal value often represents <b>50-80% of total enterprise value</b> in DCF models, making it one of the most critical components of valuation and requiring careful consideration of assumptions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Terminal Value Matters</h3>
        <p>Terminal value is critical because: <b>Dominant component</b>—typically represents the majority of total DCF value, especially for mature companies with stable cash flows. <b>Long-term value capture</b>—captures the value of cash flows beyond the forecast period, which can be substantial. <b>Assumption sensitivity</b>—small changes in terminal value assumptions can significantly impact total valuation. <b>Investment horizon</b>—reflects the going-concern assumption that the business will continue operating beyond the forecast period. <b>Comparability</b>—allows comparison with other valuation methods (multiples, precedent transactions) by providing a total enterprise value estimate. Given its significance, terminal value calculations require careful selection of growth rates, discount rates, and assumptions about the company's long-term performance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Two Primary Methods for Calculating Terminal Value</h3>
        <p>There are two main approaches to calculating terminal value: <b>Gordon Growth Model (Perpetuity Growth Model)</b>—assumes cash flows grow at a constant perpetual rate forever. This method is theoretically sound and widely used. <b>Exit Multiple Method</b>—applies a market multiple (e.g., EV/EBITDA) to a final year metric. This method relies on market comparables. The Gordon Growth Model is preferred when: growth rates are stable and predictable, the company is in a mature, steady-state phase, and long-term growth aligns with macroeconomic growth rates. Both methods should theoretically yield similar results if assumptions are consistent, and many analysts use both as a reasonableness check.</p>

        <hr className="my-6" />

        <h2 id="gordon" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Gordon Growth Model (Perpetuity Growth Model)</h2>
        <p>The <b>Gordon Growth Model (GGM)</b>, also known as the <b>Perpetuity Growth Model</b>, is derived from the Gordon-Shapiro dividend discount model and adapted for free cash flows. It assumes that cash flows will grow at a <b>constant perpetual rate (g)</b> forever, treating the company as a growing perpetuity. This model is mathematically elegant and theoretically sound, making it one of the most commonly used methods for terminal value calculation in DCF valuations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Theoretical Foundation</h3>
        <p>The Gordon Growth Model is based on the <b>growing perpetuity formula</b> from finance theory. It assumes: <b>Infinite life</b>—the company continues operating indefinitely (going-concern assumption). <b>Constant growth</b>—cash flows grow at a constant rate (g) each year forever. <b>Stable operations</b>—the company has reached a stable, mature state with predictable cash flow patterns. <b>Perpetual growth rate</b>—the growth rate (g) is sustainable in perpetuity and is typically conservative (2-4%), often aligned with long-term GDP growth or inflation. <b>Discount rate exceeds growth</b>—WACC must exceed the growth rate (WACC {'>'} g) for the formula to be mathematically valid. If g {'≥'} WACC, the model breaks down as the denominator becomes zero or negative, indicating unsustainable growth assumptions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Use the Gordon Growth Model</h3>
        <p>The Gordon Growth Model is most appropriate when: <b>Mature, stable company</b>—the business has reached a steady state with predictable cash flows. <b>Predictable growth</b>—growth rates are stable and can be estimated with reasonable confidence. <b>Going concern</b>—the company will continue operating beyond the forecast period. <b>Reasonable growth assumptions</b>—the perpetual growth rate aligns with long-term economic growth (typically 2-4% for mature companies). <b>Consistent with forecast period</b>—the terminal growth rate is consistent with or slightly lower than the final years of the explicit forecast. The model may be less appropriate for: high-growth companies (growth rates too volatile), cyclical industries (growth patterns unstable), or companies facing significant structural changes (business model shifts).</p>

        <hr className="my-6" />

        <h2 id="assumptions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Assumptions: Perpetual Growth Rate and WACC</h2>
        <p>The accuracy of terminal value calculations depends critically on two key assumptions: the <b>perpetual growth rate (g)</b> and the <b>Weighted Average Cost of Capital (WACC)</b>. Small changes in these assumptions can dramatically impact terminal value and total enterprise value, making careful selection essential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Selecting the Perpetual Growth Rate (g)</h3>
        <p>The <b>perpetual growth rate</b> should reflect the expected long-term growth of free cash flows beyond the forecast period. Key considerations: <b>Conservative assumption</b>—typically 2-4% for mature companies, often aligned with long-term GDP growth, inflation expectations, or industry growth rates. <b>Economic reality</b>—growth rates much above 4-5% are rarely sustainable in perpetuity, as they would imply the company eventually becomes the entire economy. <b>Industry context</b>—growth rates may vary by industry: mature industries (1-3%), growing industries (2-4%), technology/emerging industries (3-5%, but with higher risk). <b>Historical growth</b>—consider historical growth rates, but adjust for expected changes (maturity, competition, market saturation). <b>Macroeconomic factors</b>—align with long-term GDP growth, inflation expectations, and demographic trends. <b>Consistency with forecast</b>—terminal growth should typically be equal to or lower than the final years of the explicit forecast period. <b>Mathematical requirement</b>—must be less than WACC (g {'<'} WACC) for the formula to be valid.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Selecting the Weighted Average Cost of Capital (WACC)</h3>
        <p><b>WACC</b> represents the average rate of return required by all providers of capital (debt and equity holders). It serves as the discount rate for terminal value because it reflects the opportunity cost of capital. Key considerations: <b>Company-specific</b>—WACC should reflect the company's risk profile, capital structure, and cost of capital. <b>Must exceed growth rate</b>—WACC must be greater than the perpetual growth rate (WACC {'>'} g) for the model to work. This is economically logical, as the discount rate (cost of capital) should exceed the growth rate for a sustainable business. <b>Consistent with forecast period</b>—typically use the same WACC as the explicit forecast period, assuming stable capital structure. <b>Risk-adjusted</b>—higher-risk companies have higher WACC, which reduces terminal value. <b>Market-based</b>—WACC reflects current market conditions, interest rates, and risk premiums. Common WACC ranges: low-risk companies (6-8%), moderate-risk companies (8-12%), high-risk companies (12-15%+).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Spread (WACC - g)</h3>
        <p>The <b>spread</b> between WACC and growth rate (WACC - g) is critical because it appears in the denominator of the Gordon Growth formula. A smaller spread (e.g., 9% - 7% = 2%) results in a much higher terminal value than a larger spread (e.g., 10% - 3% = 7%). This non-linear relationship makes terminal value highly sensitive to assumptions. For example, if WACC = 10% and g = 3%, the spread is 7%. If g increases to 4%, the spread becomes 6%, and terminal value increases by 16.7% [(1/0.06) / (1/0.07) - 1]. This sensitivity underscores the importance of conservative growth rate assumptions and careful WACC estimation.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Steps and Formula</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Terminal Value = FCF(n+1) / (WACC - g)</strong></p>
          <p className="text-sm mt-2">Where FCF(n+1) = Final Year FCF * (1 + g)</p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Step-by-Step Calculation Process</h3>
        <p>The terminal value calculation involves several steps: <b>Step 1: Forecast Free Cash Flows</b>—project FCFs for the explicit forecast period (typically 5-10 years) until the business reaches a stable state with predictable growth patterns. <b>Step 2: Determine Final Year FCF</b>—identify the free cash flow in the final year of the forecast period (FCF_n). <b>Step 3: Calculate First Terminal Year FCF</b>—apply the perpetual growth rate to the final year FCF: FCF(n+1) = FCF_n × (1 + g). This represents the FCF in the first year after the forecast period. <b>Step 4: Calculate Terminal Value</b>—apply the Gordon Growth formula: Terminal Value = FCF(n+1) / (WACC - g). This gives the terminal value as of the end of the forecast period. <b>Step 5: Discount to Present Value</b>—discount the terminal value back to present value using WACC: Present Value of Terminal Value = Terminal Value / (1 + WACC)^n, where n is the number of years in the forecast period. <b>Step 6: Calculate Enterprise Value</b>—add the present value of terminal value to the present value of explicit forecast period cash flows: Enterprise Value = PV(Forecast FCFs) + PV(Terminal Value).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
        <p>Assume a company has: Final Year FCF (Year 5) = $100 million, WACC = 10%, Perpetual Growth Rate (g) = 3%, Forecast Period = 5 years. <b>Step 1:</b> FCF(6) = $100 million × (1 + 0.03) = $103 million. <b>Step 2:</b> Terminal Value (end of Year 5) = $103 million / (0.10 - 0.03) = $103 million / 0.07 = $1,471.4 million. <b>Step 3:</b> Present Value of Terminal Value = $1,471.4 million / (1.10)^5 = $1,471.4 million / 1.6105 = $913.3 million. The terminal value of $913.3 million (in present value terms) would then be added to the present value of the 5-year forecast FCFs to get total enterprise value.</p>

        <hr className="my-6" />

        <h2 id="sensitivity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sensitivity Analysis and Valuation Impact</h2>
        <p>Terminal value is <b>highly sensitive</b> to changes in key assumptions, particularly the perpetual growth rate and WACC. Because terminal value often represents 50-80% of total DCF value, small changes in assumptions can significantly impact the final valuation, making sensitivity analysis essential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Growth Rate Sensitivity</h3>
        <p>Changing the perpetual growth rate has a <b>non-linear impact</b> on terminal value due to its effect on the denominator (WACC - g). For example, with WACC = 10% and FCF(n+1) = $100 million: If g = 2%, Terminal Value = $100 / (0.10 - 0.02) = $1,250 million. If g = 3%, Terminal Value = $100 / (0.10 - 0.03) = $1,429 million (+14.3% increase). If g = 4%, Terminal Value = $100 / (0.10 - 0.04) = $1,667 million (+33.3% vs. g=2%). As growth approaches WACC, terminal value increases dramatically. This sensitivity underscores the importance of using conservative growth rate assumptions and performing sensitivity analysis across a range of growth rates (typically 2-5%).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">WACC Sensitivity</h3>
        <p>Changing WACC also has a significant impact on terminal value. Using the same example with g = 3% and FCF(n+1) = $100 million: If WACC = 9%, Terminal Value = $100 / (0.09 - 0.03) = $1,667 million. If WACC = 10%, Terminal Value = $100 / (0.10 - 0.03) = $1,429 million (-14.3% decrease). If WACC = 11%, Terminal Value = $100 / (0.11 - 0.03) = $1,250 million (-25% vs. WACC=9%). Higher WACC reduces terminal value, reflecting higher risk and opportunity cost. This sensitivity highlights the importance of accurate WACC estimation and sensitivity analysis across different WACC assumptions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity Tables and Scenario Analysis</h3>
        <p>Valuation professionals typically create <b>sensitivity tables</b> showing how terminal value (and total enterprise value) changes across different combinations of growth rate and WACC. Common practice: vary growth rate from 2% to 5% (in 0.5% increments) and WACC from 8% to 12% (in 1% increments) to create a matrix. This helps: identify valuation ranges (low, base, high cases), understand key drivers of value, communicate uncertainty to decision-makers, and compare with other valuation methods. Many DCF models also include scenario analysis (bull, base, bear cases) with different assumptions for each scenario, providing a range of possible values rather than a single point estimate.</p>

        <hr className="my-6" />

        <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices and Common Pitfalls</h2>
        <p>Effective terminal value calculation requires careful attention to assumptions, consistency, and reasonableness checks. Following best practices helps ensure reliable valuations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
        <p>Key best practices include: <b>Use conservative growth rates</b>—typically 2-4% for mature companies, aligned with long-term GDP growth or inflation. Avoid aggressive growth rates that are unsustainable. <b>Ensure WACC {'>'} g</b>—WACC must exceed growth rate for the formula to be mathematically valid. This is also economically logical. <b>Align with forecast period</b>—terminal growth should be consistent with or lower than the final years of the explicit forecast. <b>Perform sensitivity analysis</b>—test how changes in assumptions affect valuation, creating sensitivity tables and scenario analysis. <b>Compare with exit multiple method</b>—use both Gordon Growth and exit multiple methods and compare results for reasonableness. <b>Consider industry context</b>—growth rates should reflect industry dynamics, maturity, and competitive position. <b>Document assumptions</b>—clearly document and justify all assumptions, including growth rates, WACC, and rationale. <b>Reality check</b>—verify that terminal value assumptions are consistent with the company's business model, market position, and competitive environment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Common Pitfalls to Avoid</h3>
        <p>Common mistakes include: <b>Too aggressive growth rates</b>—using growth rates above 5-6% in perpetuity, which is rarely sustainable. <b>Growth rate {'≥'} WACC</b>—this makes the formula invalid and indicates unsustainable assumptions. <b>Inconsistent assumptions</b>—terminal growth rate significantly higher than forecast period growth, or WACC that doesn't match the forecast period. <b>Ignoring sensitivity</b>—not performing sensitivity analysis, leading to overconfidence in a single valuation estimate. <b>Ignoring terminal value importance</b>—not recognizing that terminal value often dominates total value, leading to insufficient attention to assumptions. <b>One-size-fits-all</b>—using the same growth rate for all companies without considering industry, maturity, and competitive factors. <b>Not discounting terminal value</b>—forgetting to discount terminal value back to present value, which overstates enterprise value. <b>Ignoring alternative methods</b>—not comparing Gordon Growth results with exit multiple method for reasonableness checks.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The Gordon Growth Model provides a theoretically sound approach to estimating terminal value by assuming perpetual growth at a constant rate. While the model is simple, it requires careful assumption selection, particularly for the perpetual growth rate and WACC. Terminal value often dominates DCF valuations, making sensitivity analysis essential for understanding valuation uncertainty.</p>
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
          <p>This tool calculates terminal value using the Gordon Growth Model (perpetuity growth model) for DCF valuation.</p>
          <p>Outputs include terminal value, present value of terminal value, next year FCF, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}




