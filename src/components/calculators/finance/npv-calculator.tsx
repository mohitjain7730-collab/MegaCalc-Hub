
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Target, Info, AlertCircle, BarChart3, PlusCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cashFlowSchema = z.object({
  value: z.number().optional(),
});

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NpvCalculator() {
  const [result, setResult] = useState<{ 
    npv: number; 
    interpretation: string; 
    recommendation: string;
    profitability: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [
        { value: undefined }, // Initial Investment (CF0)
        { value: undefined }, // CF1
        { value: undefined }, // CF2
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const calculate = (v: FormValues) => {
    if (v.discountRate == null || v.cashFlows.some(cf => cf.value == null)) return null;
    const r = v.discountRate / 100;
    let npv = 0;
    v.cashFlows.forEach((cf, t) => {
      npv += (cf.value || 0) / Math.pow(1 + r, t);
    });
    return npv;
  };

  const interpret = (npv: number) => {
    if (npv > 0) return 'Positive NPV indicates the investment is expected to generate value and should be considered.';
    if (npv === 0) return 'NPV of zero means the investment breaks even at the given discount rate.';
    return 'Negative NPV suggests the investment may not meet your required return and should be reconsidered.';
  };

  const getProfitability = (npv: number) => {
    if (npv > 10000) return 'Highly Profitable';
    if (npv > 1000) return 'Profitable';
    if (npv > 0) return 'Marginally Profitable';
    if (npv === 0) return 'Break Even';
    return 'Unprofitable';
  };

  const getRiskLevel = (npv: number) => {
    if (Math.abs(npv) > 50000) return 'High';
    if (Math.abs(npv) > 10000) return 'Moderate';
    return 'Low';
  };

  const getInsights = (npv: number, discountRate: number) => {
    const insights = [];
    
    if (npv > 0) {
      insights.push('Investment creates value above the required return');
      insights.push('Consider proceeding with this investment opportunity');
      if (npv > 10000) {
        insights.push('Strong positive returns indicate excellent investment potential');
      }
    } else {
      insights.push('Investment fails to meet required return threshold');
      insights.push('Consider alternative investments or renegotiate terms');
    }

    if (discountRate > 15) {
      insights.push('High discount rate reflects significant risk or opportunity cost');
    } else if (discountRate < 5) {
      insights.push('Low discount rate suggests conservative risk assessment');
    }

    return insights;
  };

  const getConsiderations = (npv: number) => {
    const considerations = [];
    
    if (npv > 0) {
      considerations.push('Verify cash flow projections are realistic and achievable');
      considerations.push('Consider sensitivity analysis with different discount rates');
      considerations.push('Evaluate alternative investment opportunities');
    } else {
      considerations.push('Review and potentially revise cash flow assumptions');
      considerations.push('Consider if discount rate is appropriate for this risk level');
      considerations.push('Explore ways to improve project profitability');
    }

    considerations.push('Account for inflation and tax implications');
    considerations.push('Consider the time horizon and market conditions');

    return considerations;
  };

  const recommendation = (npv: number) => {
    if (npv > 10000) return 'Strong recommendation to proceed with this investment.';
    if (npv > 0) return 'Consider proceeding, but monitor assumptions closely.';
    if (npv === 0) return 'Investment is marginal; consider alternatives or renegotiation.';
    return 'Recommend against this investment unless significant improvements can be made.';
  };

  const onSubmit = (values: FormValues) => {
    const npv = calculate(values);
    if (npv == null) { setResult(null); return; }
    setResult({ 
      npv, 
      interpretation: interpret(npv), 
      recommendation: recommendation(npv),
      profitability: getProfitability(npv),
      riskLevel: getRiskLevel(npv),
      insights: getInsights(npv, values.discountRate),
      considerations: getConsiderations(npv)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Enter your investment details to calculate the Net Present Value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="discountRate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Discount Rate (%)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g., 10" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cash Flows
                  </CardTitle>
                  <CardDescription>Enter the initial investment as a negative number (Year 0), followed by future cash flows.</CardDescription>
                </CardHeader>
                <CardContent>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-20'>Year {index}:</FormLabel>
                      <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder={`Cash Flow for Year ${index}`} 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Cash Flow
                  </Button>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full md:w-auto">
                Calculate NPV
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Net Present Value Analysis</CardTitle>
                  <CardDescription>Investment valuation and recommendation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">NPV</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.npv.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.profitability}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.riskLevel === 'High' ? 'destructive' : result.riskLevel === 'Moderate' ? 'default' : 'secondary'}>
                      {result.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recommendation</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.npv > 0 ? 'Proceed' : result.npv === 0 ? 'Marginal' : 'Reconsider'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial calculators to enhance your investment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/dcf-calculator" className="text-primary hover:underline">
                    Discounted Cash Flow Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the intrinsic value of investments using DCF analysis.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">
                    Payback Period Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine how long it takes to recover your initial investment.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">
                    ROI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the return on investment percentage for your projects.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/discount-rate-calculator" className="text-primary hover:underline">
                    Discount Rate Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine the appropriate discount rate for your investment analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Net Present Value (NPV): Calculation, Interpretation, and Capital Budgeting" />
    <meta itemProp="description" content="An expert guide to the Net Present Value (NPV) method, detailing the formula for discounting cash flows, selecting the appropriate discount rate, and its use as the superior decision rule in corporate capital budgeting." />
    <meta itemProp="keywords" content="net present value formula explained, NPV calculation steps, capital budgeting decision rule, discount rate WACC, time value of money, intrinsic value project, IRR vs NPV, mutually exclusive projects" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-net-present-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Net Present Value (NPV): The Superior Capital Budgeting Rule</h1>
    <p className="text-lg italic text-gray-700">Master the foundation of corporate investment—the metric that quantifies the true economic profit or loss of a project in today's dollars.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#concept" className="hover:underline">NPV Concept and the Time Value of Money</a></li>
        <li><a href="#calculation" className="hover:underline">The Net Present Value Formula and Mechanics</a></li>
        <li><a href="#discount-rate" className="hover:underline">Selecting the Discount Rate (WACC)</a></li>
        <li><a href="#decision" className="hover:underline">The NPV Decision Rule: Interpretation and Acceptance Criteria</a></li>
        <li><a href="#applications" className="hover:underline">NPV vs. IRR and Advanced Capital Budgeting</a></li>
    </ul>
<hr />

    {/* NPV CONCEPT AND THE TIME VALUE OF MONEY */}
    <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">NPV Concept and the Time Value of Money</h2>
    <p><strong className="font-semibold">Net Present Value (NPV)</strong> is the core valuation technique used in finance to determine the economic viability of a project or investment. It measures the difference between the present value of the project's expected cash inflows and the present value of its expected cash outflows (including the initial cost).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discounting Future Value</h3>
    <p>NPV is a direct application of the **Time Value of Money (TVM)**. Because a dollar received in the future is worth less than a dollar received today, the NPV method uses a rate (the discount rate) to adjust all future cash flows (FCF) to their current equivalent value. This adjustment ensures that the investment decision is based on an "apples-to-apples" comparison of current costs versus future benefits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Goal of NPV</h3>
    <p>The resulting NPV figure represents the net value added to the company or shareholder wealth by undertaking the project. If the NPV is positive, it means the project's discounted cash returns exceed the cost of the initial investment and the cost of the capital used to fund it.</p>

<hr />

    {/* THE NET PRESENT VALUE FORMULA AND MECHANICS */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Net Present Value Formula and Mechanics</h2>
    <p>The NPV formula is the sum of the Present Values (PV) of all future cash flows, minus the initial investment (which is typically a cash outflow at time $t=0$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Formula</h3>
    <p>For a project with a fixed initial cost and multiple subsequent cash flows, the formula is:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'NPV = Sum [ CF_t / (1 + r)^t ] - Initial Investment'}
        </p>
    </div>

    <p>Where:</p>
<ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">CFt:</strong> Net cash flow at time t (can be positive or negative).</li>
    <li><strong className="font-semibold">r:</strong> The discount rate (cost of capital).</li>
    <li><strong className="font-semibold">t:</strong> The time period (year) of the cash flow.</li>
    <li><strong className="font-semibold">Initial Investment:</strong> Cash flow at time t=0 (usually a negative value).</li>
</ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discounting the Cash Flows</h3>
<p>Each individual future cash flow must be discounted back to the present value using the term {'1 / (1 + r)^t'}. The farther out the cash flow (higher t), the greater the discounting effect, demonstrating TVM's impact on long-term project viability.</p>

<hr />

    {/* SELECTING THE DISCOUNT RATE (WACC) */}
    <h2 id="discount-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selecting the Discount Rate (WACC)</h2>
    <p>The discount rate ($r$) is the most sensitive and crucial input in the NPV calculation. For corporate projects, the appropriate discount rate is typically the firm’s <strong className="font-semibold">Weighted Average Cost of Capital (WACC)</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">WACC as the Hurdle Rate</h3>
    <p>WACC represents the average rate of return the company pays to its long-term debt holders (creditors) and equity holders (investors). It serves as the <strong className="font-semibold">Hurdle Rate</strong>—the minimum return a project must generate to be worthwhile. If a project generates cash flows that, when discounted, result in a positive NPV, it means the project's return exceeds the cost of the financing used to fund it.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Project-Specific Risk Adjustment</h3>
    <p>While WACC is the default rate, complex projects often require adjusting the discount rate to account for <strong className="font-semibold">project-specific risk</strong>. If a project is inherently riskier than the firm’s average business operations (e.g., entering a new market), a higher discount rate should be used. This higher rate reduces the NPV, correctly penalizing the project for its higher risk profile.</p>

<hr />

    {/* THE NPV DECISION RULE: INTERPRETATION AND ACCEPTANCE CRITERIA */}
    <h2 id="decision" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The NPV Decision Rule: Interpretation and Acceptance Criteria</h2>
    <p>The power of the NPV method lies in its simple, unambiguous decision rule, which directly maximizes shareholder value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Acceptance Rule</h3>
<p>The standard NPV decision rule is:</p>
<ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">If NPV &gt; 0 (Positive):</strong> Accept the project. The investment is expected to generate a return greater than the cost of capital, thereby adding value to the firm.</li>
    <li><strong className="font-semibold">If NPV = 0 (Zero):</strong> Indifference. The project is expected to generate a return exactly equal to the cost of capital (WACC).</li>
    <li><strong className="font-semibold">If NPV &lt; 0 (Negative):</strong> Reject the project. The investment would destroy shareholder value, as its returns do not cover the cost of capital.</li>
</ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation as Value Added</h3>
    <p>Unlike other metrics that provide a percentage return, NPV provides a value in dollars. A positive NPV of 1 million dollars means the project is expected to increase the total wealth of the firm by 1 million dollars in today's terms. This is why NPV is considered the most reliable measure for long-term investment decisions.</p>

<hr />

    {/* NPV VS. IRR AND ADVANCED CAPITAL BUDGETING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">NPV vs. IRR and Advanced Capital Budgeting</h2>
    <p>While the <strong className="font-semibold">Internal Rate of Return (IRR)</strong> is a popular metric, NPV is theoretically superior, especially when dealing with complex projects.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Superiority of NPV over IRR</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Reinvestment Rate Assumption:</strong> NPV assumes that cash flows are reinvested at the **Discount Rate ($r$ or WACC)**, which is economically realistic. IRR assumes cash flows are reinvested at the IRR itself, which is often overly optimistic, especially for high-IRR projects.</li>
        <li><strong className="font-semibold">Mutually Exclusive Projects:</strong> When choosing between two projects, NPV correctly selects the project that adds the most absolute dollar value to the firm, even if a competing project has a higher IRR (the **Scale Problem**).</li>
        <li><strong className="font-semibold">Non-Conventional Cash Flows:</strong> For projects with complex cash flow patterns (e.g., an intermediate cash outflow), IRR can yield multiple different rates, rendering the metric unreliable, whereas NPV always yields a single, definitive dollar value.</li>
    </ul>
    <p>Due to these factors, NPV should always be the primary decision criterion in corporate finance, with IRR used only as a supplementary measure of margin of safety.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Net Present Value is the single most rigorous measure for assessing the economic viability of capital investments. By discounting all future cash flows using the cost of capital, NPV adheres strictly to the Time Value of Money principle, providing the true current dollar value added to the firm.</p>
    <p>A positive NPV guarantees that a project will generate returns exceeding the cost of its financing, thereby creating wealth for shareholders, solidifying its position as the theoretically correct and definitive decision rule in corporate capital budgeting.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Net Present Value and investment analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Net Present Value (NPV)?</h4>
              <p className="text-muted-foreground">
                NPV is the difference between the present value of cash inflows and outflows over a period of time. It's used to analyze the profitability of an investment or project.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I interpret NPV results?</h4>
              <p className="text-muted-foreground">
                A positive NPV means the investment is expected to generate value above the required return. A negative NPV indicates the investment may not meet your return requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What discount rate should I use?</h4>
              <p className="text-muted-foreground">
                The discount rate should reflect your required rate of return, which can be based on your cost of capital, opportunity cost, or risk-adjusted return expectations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between NPV and IRR?</h4>
              <p className="text-muted-foreground">
                NPV calculates the absolute value in dollars, while IRR finds the rate of return where NPV equals zero. Both are useful for investment decisions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can NPV be negative?</h4>
              <p className="text-muted-foreground">
                Yes, a negative NPV means the investment is expected to lose value when discounted at the required rate of return. This suggests the investment may not be worthwhile.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect NPV?</h4>
              <p className="text-muted-foreground">
                Inflation affects both cash flows and discount rates. Use nominal rates with nominal cash flows, or real rates with inflation-adjusted cash flows for consistency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of NPV?</h4>
              <p className="text-muted-foreground">
                NPV relies on accurate cash flow projections and discount rate assumptions. It doesn't account for qualitative factors or flexibility in decision-making.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use NPV for all investments?</h4>
              <p className="text-muted-foreground">
                NPV is most useful for investments with predictable cash flows. For highly uncertain or strategic investments, consider other methods alongside NPV.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate NPV?</h4>
              <p className="text-muted-foreground">
                Recalculate NPV when market conditions change, when you receive new information about cash flows, or when your required rate of return changes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if my cash flows are irregular?</h4>
              <p className="text-muted-foreground">
                NPV can handle irregular cash flows. Simply enter the actual cash flow amounts for each period, including zero amounts for periods with no cash flow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
