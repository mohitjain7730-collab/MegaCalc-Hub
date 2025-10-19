'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  riskFreeRate: z.number().positive(),
  beta: z.number(),
  marketReturn: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const r = values.riskFreeRate / 100;
    const b = values.beta;
    const m = values.marketReturn / 100;
    const discountRate = (r + b * (m - r)) * 100;
    setResult(discountRate);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the discount rate using the Capital Asset Pricing Model (CAPM).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Risk-Free Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="beta" render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Beta (β)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="marketReturn" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Expected Market Return (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Discount Rate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Required Rate of Return (Discount Rate)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the estimated required rate of return for the investment, which can be used as a discount rate in DCF analysis.</CardDescription>
          </CardContent>
        </Card>
      )}
      <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta itemProp="headline" content="Discount Rate — Complete Guide: What It Is, How to Choose It, and Practical Examples" />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Learn what a discount rate is, why it matters in valuation and finance, how to select an appropriate rate (WACC, CAPM, risk premium, hurdle rate), and see practical examples and sensitivity analysis."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Discount Rate: The Key to Valuing Future Cash Flows
  </h2>

  <p itemProp="description">
    The <strong>discount rate</strong> is the percentage used to convert future cash flows into their present value. It
    reflects the <strong>time value of money</strong> and the <strong>risk</strong> associated with those cash flows.
    Choosing the right discount rate is central to accurate valuation, capital budgeting, and investment decision-making.
    This guide explains what discount rates mean, how to pick them (WACC, CAPM, hurdle rates), formulas, worked
    examples, sensitivity analysis, and common pitfalls.
  </p>

  <h3 className="font-semibold text-foreground mt-6">What Is a Discount Rate?</h3>
  <p>
    The discount rate is the interest rate used to calculate the present value (PV) of future cash flows. Intuitively,
    receiving \$1,000 today is worth more than receiving \$1,000 in five years — the discount rate quantifies that
    difference. It expresses opportunity cost (what return you could earn elsewhere) plus a risk premium for uncertainty.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Why the Discount Rate Matters</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>NPV & Valuation:</strong> Discounting future cash flows using the discount rate yields Net Present Value (NPV) or intrinsic value.</li>
    <li><strong>Investment decisions:</strong> Projects with NPV &gt; 0 at your chosen discount rate add value; negative NPV destroys value.</li>
    <li><strong>Risk-adjusted comparison:</strong> Higher-risk projects require higher discount rates to compensate for uncertainty.</li>
    <li><strong>Time preference & inflation:</strong> Discount rates reflect preference for consumption today and expected inflation.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Core Discounting Formulas</h3>
  <p>Present value of a single future cash flow:</p>
  <pre className="bg-muted p-3 rounded text-sm">
PV = FV / (1 + r)^n
  </pre>
  <p>Present value of an annuity (equal cash flows each period):</p>
  <pre className="bg-muted p-3 rounded text-sm">
PV = C × [1 − (1 + r)^−n] / r
  </pre>
  <p>Perpetuity (constant cash flow to infinity):</p>
  <pre className="bg-muted p-3 rounded text-sm">
PV_perpetuity = C / r
  </pre>

  <h3 className="font-semibold text-foreground mt-6">Common Methods to Determine the Discount Rate</h3>
  <p>
    There is no single “correct” discount rate — the choice depends on context. Below are the standard approaches.
  </p>

  <h4 className="font-semibold text-foreground mt-4">1. Weighted Average Cost of Capital (WACC)</h4>
  <p>
    WACC is commonly used for firm valuation and corporate project appraisal. It represents the company’s overall cost of
    capital from debt and equity, weighted by their market proportions:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
WACC = (E / (E + D)) × Re + (D / (E + D)) × Rd × (1 − Tc)
  </pre>
  <p>
    where <em>Re</em> = cost of equity, <em>Rd</em> = cost of debt, <em>E</em> = market value of equity, <em>D</em> = market value of debt, and <em>Tc</em> = corporate tax rate.
    Use WACC when valuing cash flows available to all capital providers (levered projects, firm valuation).
  </p>

  <h4 className="font-semibold text-foreground mt-4">2. Capital Asset Pricing Model (CAPM) for Cost of Equity</h4>
  <p>
    CAPM estimates required return for equity investors using market risk:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
Re = Rf + β × (Rm − Rf)
  </pre>
  <p>
    where <em>Rf</em> = risk-free rate, <em>β</em> = beta (sensitivity to market), and <em>Rm − Rf</em> = equity market risk premium.
    Use CAPM for projects whose risk profile matches the company’s equity or when estimating cost of equity.
  </p>

  <h4 className="font-semibold text-foreground mt-4">3. Hurdle Rate / Required Rate of Return</h4>
  <p>
    Organizations often set a minimum acceptable rate (hurdle) reflecting opportunity cost plus strategic premium.
    For strategic or high-risk projects, firms may use higher hurdle rates than WACC.
  </p>

  <h4 className="font-semibold text-foreground mt-4">4. Risk-Free Rate + Risk Premiums</h4>
  <p>
    For smaller projects or personal investments, a simpler approach is using a risk-free rate (e.g., government bond yield)
    plus a risk premium reflecting project uncertainty, size, illiquidity, and country risk.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Practical Example: Discounting Future Cash Flows</h3>
  <p>
    You expect \$5,000 each year for 4 years and require an 8% return. Present value:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
PV = 5000 × [1 − (1 + 0.08)^−4] / 0.08 = 5000 × 3.3121 = 16,560.5
  </pre>
  <p>
    If the initial investment is \$15,000, NPV = 16,560.5 − 15,000 = \$1,560.5 (positive → accept).
  </p>

  <h3 className="font-semibold text-foreground mt-6">Choosing the Right Discount Rate — Practical Guidelines</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Match risk profiles:</strong> Use project-specific rates — don’t apply corporate WACC to a risky startup project.</li>
    <li><strong>Use market data:</strong> For Rf, use current yields on government securities of matching duration (e.g., 10-yr treasury).</li>
    <li><strong>Adjust for inflation:</strong> Use nominal rates for nominal cash flows and real rates for inflation-adjusted cash flows.</li>
    <li><strong>Consider currency & country risk:</strong> Add country risk premium for emerging markets or different currencies.</li>
    <li><strong>Horizon matters:</strong> For long-term projects, terminal discounting and stable growth assumptions become critical.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Sensitivity & Scenario Analysis</h3>
  <p>
    Because NPV is highly sensitive to the discount rate, always run sensitivity analysis. Show NPV under multiple rates
    (e.g., ±2% from base). This reveals how robust your decision is to changes in required return and assumptions.
  </p>
  <p className="italic">Example: A small increase in discount rate can turn a marginally positive NPV into a negative one.</p>

  <h3 className="font-semibold text-foreground mt-6">Terminal Value and Discount Rate Choices</h3>
  <p>
    A large portion of firm valuation often comes from terminal value. Use a conservative discount rate and realistic
    perpetual growth rate when calculating terminal value with the Gordon Growth Model:
  </p>
  <pre className="bg-muted p-3 rounded text-sm">
TV = CashFlow_&#123;n+1&#125; / (r − g)
</pre>
  <p>
    where <em>g</em> = long-term growth rate and <em>r</em> = discount rate. If r is close to g, terminal value becomes unstable — avoid unrealistic combinations.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Common Mistakes to Avoid</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Mixing real cash flows with nominal discount rates (and vice versa).</li>
    <li>Using an inappropriate discount rate that doesn’t reflect project risk.</li>
    <li>Overreliance on a single-point estimate — always model ranges.</li>
    <li>Ignoring tax effects, financing structure, or working capital impacts.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Advanced Considerations</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Adjusting for leverage:</strong> Use unlevered free cash flows discounted at WACC for firm value; apply debt and cash adjustments afterward.</li>
    <li><strong>Project-specific betas:</strong> Unlever or relever beta when applying CAPM to projects with different capital structures.</li>
    <li><strong>Real options:</strong> In some investments, optionality (flexibility to delay, expand) may justify a lower effective discount rate or different valuation technique.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>Q: Is a higher discount rate always worse for NPV?</strong> A: A higher discount rate reduces present values, making NPV lower — it reflects higher required returns or risk.</p>
    <p><strong>Q: Should I use WACC or CAPM?</strong> A: Use CAPM to estimate cost of equity; use WACC for discounting cash flows available to all capital providers (firm valuation).</p>
    <p><strong>Q: How do I adjust for inflation?</strong> A: Use nominal discount rates with nominal cash flows, or use real rates with inflation-adjusted cash flows. Convert between them using (1 + nominal) = (1 + real) × (1 + inflation).</p>
    <p><strong>Q: How often should I re-estimate the discount rate?</strong> A: Revisit it when market conditions, capital structure, or project risk materially change — typically annually for corporate planning.</p>
    <p><strong>Q: Can discount rates be negative?</strong> A: In practice, nominal discount rates are usually positive; negative real rates can occur in deflationary environments or when risk-free yields are extremely low.</p>
  </div>

  <p className="italic mt-4">
    Disclaimer: This guide is for educational purposes and general financial planning. For project-specific valuation or investment advice, consult a qualified finance professional.
  </p>
</section>
    </div>
  );
}
