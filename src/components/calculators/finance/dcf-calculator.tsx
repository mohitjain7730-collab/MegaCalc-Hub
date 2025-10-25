
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

const cashFlowSchema = z.object({ value: z.number().optional() });

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
  terminalValue: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DcfCalculator() {
  const [result, setResult] = useState<{ 
    dcf: number; 
    interpretation: string; 
    recommendation: string;
    valuation: string;
    riskLevel: string;
    terminalValuePV: number;
    cashFlowPV: number;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [{ value: undefined }],
      terminalValue: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const calculate = (v: FormValues) => {
    if (v.discountRate == null || v.terminalValue == null || v.cashFlows.some(cf => cf.value == null)) return null;
    const r = v.discountRate / 100;
    
    let cashFlowPV = 0;
    v.cashFlows.forEach((cf, t) => {
      cashFlowPV += (cf.value || 0) / Math.pow(1 + r, t + 1);
    });
    
    const terminalValuePV = v.terminalValue / Math.pow(1 + r, v.cashFlows.length);
    const dcf = cashFlowPV + terminalValuePV;

    return { dcf, terminalValuePV, cashFlowPV };
  };

  const interpret = (dcf: number, terminalValuePV: number, cashFlowPV: number) => {
    const terminalPercentage = (terminalValuePV / dcf) * 100;
    
    if (terminalPercentage > 80) {
      return 'High reliance on terminal value suggests long-term growth assumptions are critical.';
    } else if (terminalPercentage > 50) {
      return 'Significant terminal value component indicates substantial long-term value.';
    } else {
      return 'Cash flow driven valuation with moderate terminal value contribution.';
    }
  };

  const getValuation = (dcf: number) => {
    if (dcf > 1000000) return 'High Value';
    if (dcf > 100000) return 'Moderate Value';
    if (dcf > 10000) return 'Low Value';
    return 'Minimal Value';
  };

  const getRiskLevel = (dcf: number, terminalValuePV: number, cashFlowPV: number) => {
    const terminalPercentage = (terminalValuePV / dcf) * 100;
    
    if (terminalPercentage > 80) return 'High';
    if (terminalPercentage > 50) return 'Moderate';
    return 'Low';
  };

  const getInsights = (dcf: number, terminalValuePV: number, cashFlowPV: number, discountRate: number) => {
    const insights = [];
    const terminalPercentage = (terminalValuePV / dcf) * 100;
    
    if (terminalPercentage > 70) {
      insights.push('High terminal value dependency - verify long-term growth assumptions');
    }
    
    if (cashFlowPV > terminalValuePV) {
      insights.push('Cash flow driven valuation - near-term performance is critical');
    }

    if (discountRate > 15) {
      insights.push('High discount rate reflects significant risk or opportunity cost');
    } else if (discountRate < 8) {
      insights.push('Conservative discount rate suggests lower risk assessment');
    }

    if (dcf > 1000000) {
      insights.push('High intrinsic value indicates strong investment potential');
    }

    return insights;
  };

  const getConsiderations = (dcf: number, terminalValuePV: number, cashFlowPV: number) => {
    const considerations = [];
    const terminalPercentage = (terminalValuePV / dcf) * 100;
    
    considerations.push('Verify cash flow projections are realistic and achievable');
    considerations.push('Review terminal value assumptions and growth rates');
    considerations.push('Consider sensitivity analysis with different discount rates');
    
    if (terminalPercentage > 70) {
      considerations.push('High terminal value dependency requires careful growth rate validation');
    }
    
    considerations.push('Account for market conditions and industry trends');
    considerations.push('Compare with market valuations and peer companies');

    return considerations;
  };

  const recommendation = (dcf: number, terminalValuePV: number, cashFlowPV: number) => {
    const terminalPercentage = (terminalValuePV / dcf) * 100;
    
    if (terminalPercentage > 80) {
      return 'High terminal value dependency - verify long-term assumptions carefully.';
    } else if (dcf > 1000000) {
      return 'Strong intrinsic value suggests attractive investment opportunity.';
    } else if (dcf > 100000) {
      return 'Moderate value - consider alongside other valuation methods.';
    } else {
      return 'Lower intrinsic value - review assumptions and market conditions.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc == null) { setResult(null); return; }
    setResult({ 
      dcf: calc.dcf, 
      interpretation: interpret(calc.dcf, calc.terminalValuePV, calc.cashFlowPV), 
      recommendation: recommendation(calc.dcf, calc.terminalValuePV, calc.cashFlowPV),
      valuation: getValuation(calc.dcf),
      riskLevel: getRiskLevel(calc.dcf, calc.terminalValuePV, calc.cashFlowPV),
      terminalValuePV: calc.terminalValuePV,
      cashFlowPV: calc.cashFlowPV,
      insights: getInsights(calc.dcf, calc.terminalValuePV, calc.cashFlowPV, values.discountRate),
      considerations: getConsiderations(calc.dcf, calc.terminalValuePV, calc.cashFlowPV)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            DCF Parameters
          </CardTitle>
          <CardDescription>
            Enter the parameters to calculate the Discounted Cash Flow value
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
                    Projected Free Cash Flows
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
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Year
                  </Button>
                </CardContent>
              </Card>
              
              <FormField control={form.control} name="terminalValue" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Terminal Value
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g., 500000" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full md:w-auto">
                Calculate DCF
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
                  <CardTitle>Discounted Cash Flow Analysis</CardTitle>
                  <CardDescription>Intrinsic value assessment and valuation insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">DCF Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.dcf.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.valuation}
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
                    {result.dcf > 1000000 ? 'Strong Buy' : result.dcf > 100000 ? 'Consider' : 'Review'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cash Flow Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cash Flow PV:</span>
                        <span className="font-medium">${result.cashFlowPV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Terminal Value PV:</span>
                        <span className="font-medium">${result.terminalValuePV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">Total DCF:</span>
                        <span className="font-bold">${result.dcf.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Terminal Value Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Terminal Value %:</span>
                        <span className="font-medium">{((result.terminalValuePV / result.dcf) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cash Flow %:</span>
                        <span className="font-medium">{((result.cashFlowPV / result.dcf) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <a href="/category/finance/discount-rate-calculator" className="text-primary hover:underline">
                    Discount Rate Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine the appropriate discount rate for your DCF analysis.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/enterprise-value-calculator" className="text-primary hover:underline">
                    Enterprise Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate enterprise value to assess company worth comprehensively.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/free-cash-flow-calculator" className="text-primary hover:underline">
                    Free Cash Flow Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate free cash flow to understand company's cash generation ability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Discounted Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Discounted Cash Flow analysis and valuation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Discounted Cash Flow (DCF)?</h4>
              <p className="text-muted-foreground">
                DCF is a valuation method that estimates the intrinsic value of an investment by discounting its projected future cash flows to present value using a required rate of return.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is DCF different from NPV?</h4>
              <p className="text-muted-foreground">
                DCF calculates the total present value of future cash flows, while NPV subtracts the initial investment from DCF. DCF gives you the intrinsic value, NPV tells you the net benefit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is terminal value and why is it important?</h4>
              <p className="text-muted-foreground">
                Terminal value represents the present value of all future cash flows beyond the projection period. It's often a significant portion of DCF and requires careful estimation of long-term growth rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right discount rate for DCF?</h4>
              <p className="text-muted-foreground">
                Use the company's weighted average cost of capital (WACC), or for equity-focused analysis, use the cost of equity derived from CAPM. The rate should reflect the risk of the investment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the main limitations of DCF analysis?</h4>
              <p className="text-muted-foreground">
                DCF relies heavily on assumptions about future cash flows, growth rates, and discount rates. Small changes in these assumptions can significantly impact the valuation. It also doesn't account for market sentiment or qualitative factors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How many years should I project cash flows?</h4>
              <p className="text-muted-foreground">
                Typically 5-10 years for detailed projections, followed by a terminal value. The exact period depends on the business cycle, industry stability, and your confidence in long-term forecasts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When should I use DCF vs. other valuation methods?</h4>
              <p className="text-muted-foreground">
                Use DCF for companies with predictable cash flows and when you want to understand intrinsic value. For companies with uncertain cash flows, consider using relative valuation methods like P/E ratios or comparable company analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I handle high-growth companies in DCF?</h4>
              <p className="text-muted-foreground">
                For high-growth companies, use multi-stage DCF models with different growth phases. Start with high growth, transition to moderate growth, and end with stable growth for terminal value calculation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a reasonable terminal growth rate?</h4>
              <p className="text-muted-foreground">
                Terminal growth rates typically range from 2-4%, often matching long-term GDP growth or inflation. Avoid rates higher than the discount rate, as this creates unrealistic valuations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I validate my DCF assumptions?</h4>
              <p className="text-muted-foreground">
                Perform sensitivity analysis by varying key assumptions, compare with market valuations and peer companies, and ensure your assumptions are consistent with industry trends and company fundamentals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
