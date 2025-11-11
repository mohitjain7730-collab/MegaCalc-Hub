
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, PlusCircle, XCircle, Calculator, Info, FileText, TrendingUp } from 'lucide-react';

const cashFlowSchema = z.object({ value: z.number().positive().optional() });

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapexPaybackCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      cashFlows: [{ value: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "cashFlows" });

  const onSubmit = (values: FormValues) => {
    const { initialInvestment, cashFlows } = values;
    let cumulativeCashFlow = 0;
    
    // Handle case for even cash flows by checking if only one cash flow value is provided
    const isEvenFlow = cashFlows.length === 1 && cashFlows[0].value;
    if(isEvenFlow) {
        const payback = initialInvestment / cashFlows[0].value!;
        const years = Math.floor(payback);
        const months = (payback - years) * 12;
        setResult(`${years} years and ${months.toFixed(1)} months`);
        return;
    }

    // Handle uneven cash flows
    for (let i = 0; i < cashFlows.length; i++) {
        const cashFlow = cashFlows[i].value || 0;
        if (cumulativeCashFlow + cashFlow >= initialInvestment) {
            const unrecovered = initialInvestment - cumulativeCashFlow;
            const months = (unrecovered / cashFlow) * 12;
            setResult(`${i} years and ${months.toFixed(1)} months`);
            return;
        }
        cumulativeCashFlow += cashFlow;
    }
    setResult("Payback period is longer than the provided cash flows.");
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Capital Expenditure Parameters
          </CardTitle>
          <CardDescription>
            Enter investment and cash flow details to calculate payback period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField 
                control={form.control} 
                name="initialInvestment" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Investment ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 100000"
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Annual Cash Inflows</CardTitle>
                  <CardDescription>For even cash flows, enter one value. For uneven, add a field for each year.</CardDescription>
                </CardHeader>
                <CardContent>
                  {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 mb-2">
                          <FormLabel className='w-24'>Year {index + 1}:</FormLabel>
                          <FormField 
                            control={form.control} 
                            name={`cashFlows.${index}.value`} 
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 25000"
                                    {...field} 
                                    value={field.value ?? ''} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                                  />
                                </FormControl>
                              </FormItem>
                            )} 
                          />
                          {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                          )}
                      </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => append({ value: undefined })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Year for Uneven Flows
                  </Button>
                </CardContent>
              </Card>

              <Button type="submit">Calculate Payback Period</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Payback Period</CardTitle>
                  <CardDescription>Time to recover initial investment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
                <CardDescription className='mt-4 text-center'>
                  This is the time it takes for the investment to generate enough cash flow to recover its initial cost.
                </CardDescription>
            </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Initial Investment</h4>
            <p className="text-muted-foreground">
              The total upfront cost of the project or capital expenditure. This includes all costs required to acquire, install, and commission the asset.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Annual Cash Inflows</h4>
            <p className="text-muted-foreground">
              The net cash generated by the project each year. If the inflows are consistent every year, enter a single value. If they vary over time, add a field for each year's projected inflow to get a more accurate payback calculation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other investment and financial analysis calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                  Net Present Value (NPV) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the present value of future cash flows to evaluate investment profitability.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/irr-calculator" className="text-primary hover:underline">
                  Internal Rate of Return (IRR) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the discount rate that makes NPV zero for an investment.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/dcf-calculator" className="text-primary hover:underline">
                  Discounted Cash Flow (DCF) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Value investments using discounted cash flow analysis methodology.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/break-even-point-calculator" className="text-primary hover:underline">
                  Break-Even Point Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the sales volume needed to cover all costs and break even.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Capital Expenditure (CapEx) Payback Period: Calculation, Liquidity, and Risk Assessment" />
    <meta itemProp="description" content="An expert guide detailing the Payback Period formula for CapEx projects, its use as a liquidity metric, the distinction between equal and uneven cash flows, and the critical flaw of ignoring the Time Value of Money (TVM)." />
    <meta itemProp="keywords" content="capex payback period calculation, capital expenditure payback formula, liquidity risk metric, unadjusted payback method, uneven cash flow payback, capital budgeting methods" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-capex-payback-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to CapEx Payback Period: Measuring Investment Recovery Time</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental capital budgeting technique that determines how quickly a cash outflow for an asset can be recovered by subsequent cash inflows.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">CapEx and Payback Period: Core Definitions</a></li>
        <li><a href="#cash-flow" className="hover:underline">Calculating Relevant Cash Flows</a></li>
        <li><a href="#equal" className="hover:underline">Calculation with Equal Annual Cash Flows</a></li>
        <li><a href="#uneven" className="hover:underline">Calculation with Uneven Annual Cash Flows</a></li>
        <li><a href="#limitations" className="hover:underline">Major Limitations and Decision Rule</a></li>
    </ul>
<hr />

    {/* CAPEX AND PAYBACK PERIOD: CORE DEFINITIONS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">CapEx and Payback Period: Core Definitions</h2>
    <p>**Capital Expenditure (CapEx)** refers to funds used by a company to acquire, upgrade, and maintain physical assets such as property, plants, buildings, technology, or equipment. These investments are critical for the firm’s long-term operational viability and growth.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Payback Period's Purpose</h3>
    <p>The **Payback Period** metric assesses the liquidity and risk of these CapEx decisions. It calculates the precise amount of time (usually in years) required for the net cash inflows generated by the new asset to completely recover the initial cash outflow (the cost of the CapEx).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Focus on Liquidity</h3>
    <p>The metric is highly favored by managers of small firms or departments with tight budgets because it directly answers a liquidity question: "How long will this capital be tied up?" A shorter payback period is preferred as it signals lower risk and faster liquidity of the invested capital.</p>

<hr />

    {/* CALCULATING RELEVANT CASH FLOWS */}
    <h2 id="cash-flow" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Relevant Cash Flows</h2>
    <p>The cash flows used in the Payback Period calculation are the **incremental net cash inflows** generated by the project. This is the additional cash generated due to the CapEx, minus any associated operating expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cash Flow Formula (After-Tax)</h3>
    <p>The relevant annual cash flow is typically approximated using the operating profit after taxes (NOPAT) plus the non-cash depreciation expense (since the cash was already spent):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annual Cash Flow = Net Income (after-tax) + Depreciation Expense'}
        </p>
    </div>
    <p>Depreciation is added back because it is a tax shield—it reduces taxable income but does not represent a current cash outflow.</p>

<hr />

    {/* CALCULATION WITH EQUAL ANNUAL CASH FLOWS */}
    <h2 id="equal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation with Equal Annual Cash Flows</h2>
    <p>When a CapEx project (e.g., a standard piece of machinery) is expected to generate the same amount of cash inflow every year, the Payback Period calculation is simple and direct.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>For an annuity stream of returns, the formula divides the initial cost by the constant annual cash flow:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Payback Period = Initial CapEx Cost / Annual Net Cash Flow'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example and Interpretation</h3>
    <p>If a machine costs 500,000 dollars (CapEx) and generates a net cash inflow of 100,000 dollars every year, the payback period is 5 years. This assumes the cash flows occur at the end of each year.</p>

<hr />

    {/* CALCULATION WITH UNEVEN ANNUAL CASH FLOWS */}
    <h2 id="uneven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation with Uneven Annual Cash Flows</h2>
    <p>For most complex CapEx projects (e.g., R&D initiatives, new factory construction), cash flows are unequal. In this scenario, the Payback Period requires tracking the cumulative cash balance year-by-year.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cumulative Method</h3>
    <p>The calculation tracks the unrecovered investment balance until it hits zero:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Cumulative Cash Flow:</strong> Sum the annual cash flows sequentially until the total exceeds the Initial CapEx Cost.</li>
        <li><strong className="font-semibold">Identify Full Recovery Year:</strong> Note the year just before full recovery (the last year the cumulative total was negative).</li>
        <li><strong className="font-semibold">Calculate Fractional Year:</strong> The final period is calculated by dividing the **unrecovered cost** remaining at the start of the final year by the cash flow generated during that final year.</li>
    </ol>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Payback Period = Last Year Before Full Recovery + (Unrecovered Cost / Cash Flow in Recovery Year)'}
        </p>
    </div>

<hr />

    {/* MAJOR LIMITATIONS AND DECISION RULE */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Major Limitations and Decision Rule</h2>
    <p>The Payback Period is intuitive but has critical flaws that prevent its use as the sole decision metric for complex CapEx decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Ignores Time Value of Money (TVM)</h3>
    <p>The metric's primary weakness is its failure to discount future cash flows. It treats a dollar received in Year 1 the same as a dollar received in Year 5, fundamentally violating the **Time Value of Money** principle. The **Discounted Payback Period** is a corrective method, but the standard method ignores this.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Ignores Cash Flows After Payback</h3>
    <p>The metric stops analyzing the project once the initial CapEx is recovered. A project might have a slightly longer payback period but generate massive cash flows for decades afterward, making it superior to a project with a fast payback but a short revenue tail.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Acceptance Rule</h3>
    <p>The rule relies on a subjective target set by management (e.g., "all projects must payback within 3 years"). A project is accepted only if its payback period is **less than** the maximum acceptable period.</p>
    <p>Due to its flaws, the Payback Period is best used as a secondary **liquidity and risk screening tool** alongside the theoretically superior Net Present Value (NPV) method.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Payback Period provides a quick, liquidity-focused analysis of CapEx decisions, measuring the time required for incremental cash inflows to recover the initial investment.</p>
    <p>While useful for assessing **short-term risk** and liquidity, its severe limitation is ignoring the **Time Value of Money** and all cash flows generated after the payback date. It should always be used as a preliminary screen, with the final investment decision being confirmed by discounted cash flow metrics like NPV.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about payback period and capital expenditure analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the payback period and why is it important?</h4>
            <p className="text-muted-foreground">
              The payback period is the time required for an investment to generate cash flows sufficient to recover the initial investment. It's a simple risk assessment tool—shorter payback periods indicate faster capital recovery and lower risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between even and uneven cash flows?</h4>
            <p className="text-muted-foreground">
              Even cash flows are constant amounts received each year, making calculation straightforward. Uneven cash flows vary annually, requiring year-by-year analysis to determine when cumulative cash flows equal the initial investment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the limitations of the payback period method?</h4>
            <p className="text-muted-foreground">
              The payback period doesn't consider the time value of money, ignores cash flows after payback, and doesn't measure overall profitability. It's best used as a complementary tool alongside NPV and IRR analysis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's a good payback period?</h4>
            <p className="text-muted-foreground">
              A "good" payback period varies by industry and company policy. Generally, 3-5 years is acceptable for most capital projects. Shorter periods (1-2 years) are preferred for higher-risk investments or industries with rapid technological change.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does payback period compare to NPV and IRR?</h4>
            <p className="text-muted-foreground">
              Payback focuses on liquidity and risk, measuring how quickly capital is recovered. NPV and IRR measure profitability by considering the time value of money and total project returns. Payback is simpler but less comprehensive.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use payback period as my sole investment decision criterion?</h4>
            <p className="text-muted-foreground">
              No. While payback period is useful for assessing liquidity risk, it should be combined with NPV, IRR, and other financial metrics. It's most valuable for preliminary screening or when capital recovery speed is critical.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I handle investments with multiple cash flow scenarios?</h4>
            <p className="text-muted-foreground">
              For multiple scenarios, calculate payback period for each scenario separately. Compare base case, best case, and worst case to understand the range of payback periods and associated risks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What if the payback period exceeds the cash flow projection period?</h4>
            <p className="text-muted-foreground">
              If the investment doesn't pay back within the projected cash flows, the payback period is longer than provided. This may indicate the investment is not financially viable or you need more detailed cash flow projections.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can payback period be negative?</h4>
            <p className="text-muted-foreground">
              No, payback period is always positive (or undefined if cash flows never recover the investment). However, a project that never pays back has an infinite payback period, indicating it's not financially viable.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How should I factor in maintenance costs and operational expenses?</h4>
            <p className="text-muted-foreground">
              For accurate payback analysis, cash inflows should be net of all ongoing costs. Subtract annual operating expenses, maintenance, taxes, and other costs from gross revenue to get net cash inflows used in payback calculations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
