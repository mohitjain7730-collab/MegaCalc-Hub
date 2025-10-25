
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Net Present Value
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
