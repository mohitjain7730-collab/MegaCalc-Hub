
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Payback Period Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

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
