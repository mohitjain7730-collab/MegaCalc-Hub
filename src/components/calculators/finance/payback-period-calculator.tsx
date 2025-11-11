'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Target, Info, AlertCircle, BarChart3, PlusCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cashFlowSchema = z.object({ value: z.number().positive() });

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaybackPeriodCalculator() {
  const [result, setResult] = useState<{ 
    paybackPeriod: string; 
    interpretation: string; 
    recommendation: string;
    riskLevel: string;
    totalCashFlow: number;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      cashFlows: [{ value: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const calculate = (v: FormValues) => {
    if (v.initialInvestment == null || v.cashFlows.some(cf => cf.value == null)) return null;
    let cumulativeCashFlow = 0;
    let years = 0;
    let totalCashFlow = 0;

    for (let i = 0; i < v.cashFlows.length; i++) {
        const cashFlow = v.cashFlows[i].value || 0;
        totalCashFlow += cashFlow;
        if (cumulativeCashFlow + cashFlow >= v.initialInvestment) {
            const unrecoveredAmount = v.initialInvestment - cumulativeCashFlow;
            const months = (unrecoveredAmount / cashFlow) * 12;
            return { 
              paybackPeriod: `${years} years and ${months.toFixed(1)} months`,
              totalCashFlow
            };
        }
        cumulativeCashFlow += cashFlow;
        years++;
    }
    return { 
      paybackPeriod: "Payback period is longer than the provided cash flows.",
      totalCashFlow
    };
  };

  const interpret = (paybackPeriod: string, totalCashFlow: number, initialInvestment: number) => {
    if (paybackPeriod.includes("longer than")) {
      return 'Investment may not recover initial cost within the projected timeframe.';
    }
    
    const years = parseFloat(paybackPeriod.split(' ')[0]);
    if (years <= 2) {
      return 'Very fast payback indicates low risk and quick return on investment.';
    } else if (years <= 5) {
      return 'Moderate payback period suggests reasonable risk-return profile.';
    } else {
      return 'Long payback period indicates higher risk and slower capital recovery.';
    }
  };

  const getRiskLevel = (paybackPeriod: string) => {
    if (paybackPeriod.includes("longer than")) return 'Very High';
    
    const years = parseFloat(paybackPeriod.split(' ')[0]);
    if (years <= 2) return 'Low';
    if (years <= 5) return 'Moderate';
    return 'High';
  };

  const getInsights = (paybackPeriod: string, totalCashFlow: number, initialInvestment: number) => {
    const insights = [];
    
    if (paybackPeriod.includes("longer than")) {
      insights.push('Investment may not recover initial cost within projected timeframe');
      insights.push('Consider revising cash flow projections or investment terms');
    } else {
      const years = parseFloat(paybackPeriod.split(' ')[0]);
      if (years <= 2) {
        insights.push('Fast payback indicates strong cash generation ability');
        insights.push('Low risk investment with quick capital recovery');
      } else if (years <= 5) {
        insights.push('Moderate payback period suggests balanced risk-return profile');
        insights.push('Suitable for most investment criteria');
      } else {
        insights.push('Long payback period requires careful risk assessment');
        insights.push('Consider if the investment aligns with your risk tolerance');
      }
    }

    if (totalCashFlow > initialInvestment * 2) {
      insights.push('Strong total cash flow generation potential');
    }

    return insights;
  };

  const getConsiderations = (paybackPeriod: string, totalCashFlow: number, initialInvestment: number) => {
    const considerations = [];
    
    considerations.push('Verify cash flow projections are realistic and achievable');
    considerations.push('Consider the time value of money in your analysis');
    considerations.push('Evaluate alternative investment opportunities');
    
    if (paybackPeriod.includes("longer than")) {
      considerations.push('Review and potentially revise cash flow assumptions');
      considerations.push('Consider if the investment is viable given the timeframe');
    }

    considerations.push('Account for market conditions and industry trends');
    considerations.push('Compare with industry benchmarks and similar investments');

    return considerations;
  };

  const recommendation = (paybackPeriod: string, totalCashFlow: number, initialInvestment: number) => {
    if (paybackPeriod.includes("longer than")) {
      return 'Recommend against this investment unless significant improvements can be made.';
    }
    
    const years = parseFloat(paybackPeriod.split(' ')[0]);
    if (years <= 2) {
      return 'Strong recommendation to proceed with this investment.';
    } else if (years <= 5) {
      return 'Consider proceeding, but monitor cash flow assumptions closely.';
    } else {
      return 'Proceed with caution - ensure the long-term benefits justify the extended payback period.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc == null) { setResult(null); return; }
    setResult({ 
      paybackPeriod: calc.paybackPeriod, 
      interpretation: interpret(calc.paybackPeriod, calc.totalCashFlow, values.initialInvestment), 
      recommendation: recommendation(calc.paybackPeriod, calc.totalCashFlow, values.initialInvestment),
      riskLevel: getRiskLevel(calc.paybackPeriod),
      totalCashFlow: calc.totalCashFlow,
      insights: getInsights(calc.paybackPeriod, calc.totalCashFlow, values.initialInvestment),
      considerations: getConsiderations(calc.paybackPeriod, calc.totalCashFlow, values.initialInvestment)
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
            Enter your investment details to calculate the payback period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Initial Investment ($)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g., 100000" 
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
                    <TrendingUp className="h-5 w-5" />
                    Projected Annual Cash Inflows
                  </CardTitle>
                  <CardDescription>Enter the expected cash flows for each year</CardDescription>
                </CardHeader>
                <CardContent>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-24'>Year {index + 1}:</FormLabel>
                      <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
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
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Year
                  </Button>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full md:w-auto">
                Calculate Payback Period
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
                  <CardTitle>Payback Period Analysis</CardTitle>
                  <CardDescription>Investment recovery timeline and risk assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.paybackPeriod}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recovery Time
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.riskLevel === 'Very High' ? 'destructive' : result.riskLevel === 'High' ? 'default' : 'secondary'}>
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
                    {result.riskLevel === 'Very High' ? 'Reconsider' : result.riskLevel === 'Low' ? 'Proceed' : 'Consider'}
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
                  <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                    Net Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate NPV to evaluate investment profitability and decision-making.
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
                  <a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">
                    Return on Investment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the internal rate of return for your investments.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/dcf-calculator" className="text-primary hover:underline">
                    DCF Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use discounted cash flow analysis for comprehensive valuation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Payback Period: Calculation, Interpretation, and Capital Budgeting" />
    <meta itemProp="description" content="An expert guide detailing the Payback Period formula, its primary use as a liquidity and risk metric in capital budgeting, its limitations (Time Value of Money), and its role in evaluating short-term investment viability." />
    <meta itemProp="keywords" content="payback period formula explained, how to calculate payback period, unadjusted payback method, discounted payback period, liquidity metric finance, capital budgeting simple methods, project recovery time" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-10" /> 
    <meta itemProp="url" content="/definitive-payback-period-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Payback Period: Measuring Investment Liquidity and Risk</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental capital budgeting technique that determines the exact time required to recover the initial cost of an investment.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#concept" className="hover:underline">Payback Period: Definition and Primary Function</a></li>
        <li><a href="#calculation" className="hover:underline">The Unadjusted Payback Period Calculation</a></li>
        <li><a href="#uneven" className="hover:underline">Calculating Payback with Uneven Cash Flows</a></li>
        <li><a href="#discounted" className="hover:underline">The Discounted Payback Period</a></li>
        <li><a href="#limitations" className="hover:underline">Major Limitations and Decision Rule</a></li>
    </ul>
<hr />

    {/* PAYBACK PERIOD: DEFINITION AND PRIMARY FUNCTION */}
    <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payback Period: Definition and Primary Function</h2>
    <p>The **Payback Period** is a capital budgeting metric used to determine the amount of time (usually in years) required for an investment's cumulative cash inflows to equal its initial cash outflow. In simple terms, it measures how long it takes for a project to "pay for itself."</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">A Focus on Liquidity and Risk</h3>
    <p>The Payback Period is not a measure of profitability (like NPV or IRR), but rather a measure of **liquidity** and **risk**. Businesses often prioritize quick payback periods for two main reasons:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Liquidity Management:</strong> Companies with limited cash reserves prefer projects that return capital quickly, freeing up those funds for other immediate needs.</li>
        <li><strong className="font-semibold">Risk Mitigation:</strong> The longer the time to recover the initial investment, the higher the exposure to economic downturns, technological obsolescence, or market changes. A shorter payback period implies lower risk.</li>
    </ol>
    <p>Because of its simplicity and focus on short-term factors, the Payback Period is a common screening tool used early in the project evaluation process, especially for small businesses or projects with high uncertainty.</p>

<hr />

    {/* THE UNADJUSTED PAYBACK PERIOD CALCULATION */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Unadjusted Payback Period Calculation</h2>
    <p>The simplest version of the Payback Period assumes that the project generates **equal annual cash flows** (an annuity). This is the easiest calculation but the least realistic for most real-world investments.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Formula for Equal Cash Flows</h3>
    <p>When the annual cash flows are identical, the formula is straightforward division:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Payback Period = Initial Investment / Annual Cash Flow'}
        </p>
    </div>

    <p>For example, a project costing 100,000 dollars that generates 25,000 dollars in cash flow every year has a payback period of 100,000 / 25,000 = 4 years.</p>

<hr />

    {/* CALCULATING PAYBACK WITH UNEVEN CASH FLOWS */}
    <h2 id="uneven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Payback with Uneven Cash Flows</h2>
    <p>Most real-world projects generate **uneven annual cash flows** (e.g., higher returns in later years). In this case, the Payback Period must be calculated by tracking the **cumulative cash flow** until the initial investment is recovered.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cumulative Cash Flow Approach</h3>
    <p>The calculation is a three-step process:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Identify Full Recovery Year:</strong> Determine the last year in which the cumulative cash flow was still negative (i.e., less than the initial investment).</li>
        <li><strong className="font-semibold">Calculate Remaining Cost:</strong> Determine the amount of the initial investment that is still unrecovered at the beginning of the next year.</li>
        <li><strong className="font-semibold">Fractional Year:</strong> Divide the remaining unrecovered cost by the cash flow generated in the recovery year (assuming cash flows occur evenly throughout that year).</li>
    </ol>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Payback Period = Last Year Before Full Recovery + (Unrecovered Cost / Cash Flow in Recovery Year)'}
        </p>
    </div>

<hr />

    {/* THE DISCOUNTED PAYBACK PERIOD */}
    <h2 id="discounted" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Discounted Payback Period</h2>
    <p>The single greatest weakness of the simple Payback Period is that it ignores the **Time Value of Money (TVM)**. It treats a dollar received today as equal to a dollar received five years from now. The <strong className="font-semibold">Discounted Payback Period</strong> corrects this flaw by calculating payback using the **Present Value (PV)** of the cash flows.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mechanics of Discounted Payback</h3>
    <p>The process is identical to the unadjusted method, but the input used is the **PV of the cash flow** for each year, discounted at the project's cost of capital (WACC).</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Discount All FCF:</strong> Calculate the Present Value (PV) of each annual cash flow using the formula PV = Cash Flow / (1 + r)^t. (Note: The calculation requires the discount rate (r) and the time (t) for each cash flow.)</li>
        <li><strong className="font-semibold">Calculate Cumulative PV:</strong> Sum the discounted cash flows until the total equals the initial investment.</li>
    </ol>
    <p>The Discounted Payback Period is always **longer** than the unadjusted period because discounting reduces the value of future cash flows, requiring more time to recover the initial cost. If a project fails to recoup its initial investment within its entire life, even the discounted cash flows will never offset the initial outflow.</p>

<hr />

    {/* MAJOR LIMITATIONS AND DECISION RULE */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Major Limitations and Decision Rule</h2>
    <p>While intuitive, the Payback Period method has serious deficiencies that make it unsuitable as a standalone tool for capital budgeting.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Limitations</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Ignores Cash Flows After Payback:</strong> The method completely disregards cash flows generated after the payback date. A project might have a short payback period but ignore huge cash flows in later years, leading to the selection of a value-destroying project over a highly profitable one.</li>
        <li><strong className="font-semibold">Ignores TVM (Unadjusted):</strong> By not discounting cash flows, the unadjusted method misrepresents the true economic reality of the project.</li>
        <li><strong className="font-semibold">No Wealth Maximization:</strong> Unlike Net Present Value (NPV), the Payback Period does not inherently seek to maximize shareholder wealth; it only seeks to minimize time exposure.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Acceptance Rule</h3>
    <p>The project acceptance rule is based on a pre-determined, subjective criterion set by management (the target payback time):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Accept:</strong> If the calculated Payback Period is less than the maximum acceptable payback period set by the firm.</li>
        <li><strong className="font-semibold">Reject:</strong> If the calculated Payback Period is greater than the maximum acceptable period.</li>
    </ul>
    <p>Due to its shortcomings, the Payback Period is best used as a **secondary, risk-screening metric** alongside the theoretically superior NPV method.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Payback Period is a simple, intuitive metric primarily valued for its direct assessment of **liquidity** and **short-term risk** in capital budgeting. It quickly reveals how long an investment's initial cost will remain locked up in the project.</p>
    <p>While the unadjusted method suffers from the critical flaw of ignoring the Time Value of Money, the more robust **Discounted Payback Period** addresses this. Regardless of the method used, the Payback Period should serve as a practical screening tool to eliminate high-risk, slow-to-recover projects, paving the way for definitive selection using the superior wealth maximization metric, Net Present Value.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about payback period analysis and investment recovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is payback period?</h4>
              <p className="text-muted-foreground">
                Payback period is the time it takes for an investment to recover its initial cost through cash flows. It's a simple measure of investment risk and liquidity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate payback period?</h4>
              <p className="text-muted-foreground">
                Add up the cash flows year by year until the cumulative total equals or exceeds the initial investment. If it occurs partway through a year, interpolate to find the exact time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good payback period?</h4>
              <p className="text-muted-foreground">
                A good payback period depends on the industry and risk tolerance. Generally, 2-5 years is considered reasonable for most investments, but this varies by sector and company size.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of payback period?</h4>
              <p className="text-muted-foreground">
                Payback period ignores the time value of money, doesn't consider cash flows after payback, and doesn't measure profitability. It's best used alongside other metrics like NPV and IRR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use simple or discounted payback period?</h4>
              <p className="text-muted-foreground">
                Use discounted payback period for more accurate analysis as it accounts for the time value of money. Simple payback is useful for quick estimates, but discounted payback provides better decision-making information.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does payback period relate to risk?</h4>
              <p className="text-muted-foreground">
                Shorter payback periods generally indicate lower risk as capital is recovered quickly. Longer payback periods suggest higher risk due to extended exposure and uncertainty about future cash flows.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can payback period be negative?</h4>
              <p className="text-muted-foreground">
                No, payback period cannot be negative. If cash flows never recover the initial investment, the payback period is considered infinite or "never" - indicating the investment may not be viable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I handle irregular cash flows in payback period?</h4>
              <p className="text-muted-foreground">
                For irregular cash flows, calculate cumulative cash flows period by period until the initial investment is recovered. Use interpolation if payback occurs partway through a period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between payback period and break-even point?</h4>
              <p className="text-muted-foreground">
                Payback period measures time to recover initial investment, while break-even point measures the sales volume or revenue needed to cover all costs. They serve different analytical purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate payback period?</h4>
              <p className="text-muted-foreground">
                Recalculate payback period when cash flow projections change, market conditions shift, or when you receive updated financial information. Regular monitoring helps ensure investment decisions remain valid.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}