'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Target, Info, AlertCircle, BarChart3, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  riskFreeRate: z.number().positive(),
  beta: z.number(),
  marketReturn: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountRateCalculator() {
  const [result, setResult] = useState<{ 
    discountRate: number; 
    interpretation: string; 
    recommendation: string;
    riskLevel: string;
    marketPremium: number;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.riskFreeRate == null || v.beta == null || v.marketReturn == null) return null;
    const r = v.riskFreeRate / 100;
    const b = v.beta;
    const m = v.marketReturn / 100;
    const discountRate = (r + b * (m - r)) * 100;
    const marketPremium = (m - r) * 100;
    return { discountRate, marketPremium };
  };

  const interpret = (discountRate: number, beta: number) => {
    if (discountRate > 20) return 'Very high discount rate indicates significant risk or high opportunity cost.';
    if (discountRate > 15) return 'High discount rate suggests elevated risk or strong market expectations.';
    if (discountRate > 10) return 'Moderate discount rate reflects balanced risk-return expectations.';
    if (discountRate > 5) return 'Conservative discount rate suggests lower risk or market conditions.';
    return 'Very low discount rate may indicate low risk or unusual market conditions.';
  };

  const getRiskLevel = (discountRate: number, beta: number) => {
    if (discountRate > 20 || beta > 2) return 'Very High';
    if (discountRate > 15 || beta > 1.5) return 'High';
    if (discountRate > 10 || beta > 1) return 'Moderate';
    if (discountRate > 5 || beta > 0.5) return 'Low';
    return 'Very Low';
  };

  const getInsights = (discountRate: number, beta: number, marketPremium: number) => {
    const insights = [];
    
    if (beta > 1.5) {
      insights.push('High beta indicates the investment is more volatile than the market');
    } else if (beta < 0.5) {
      insights.push('Low beta suggests the investment is less volatile than the market');
    }

    if (marketPremium > 8) {
      insights.push('High market risk premium reflects elevated market risk expectations');
    } else if (marketPremium < 4) {
      insights.push('Low market risk premium suggests conservative market outlook');
    }

    if (discountRate > 15) {
      insights.push('High discount rate may limit investment opportunities');
    } else if (discountRate < 8) {
      insights.push('Low discount rate may make more investments attractive');
    }

    return insights;
  };

  const getConsiderations = (discountRate: number, beta: number) => {
    const considerations = [];
    
    considerations.push('Verify beta reflects current market conditions and company fundamentals');
    considerations.push('Consider if risk-free rate matches your investment horizon');
    considerations.push('Review market return assumptions for accuracy');
    
    if (beta > 1.5) {
      considerations.push('High beta investments require careful risk management');
    }
    
    if (discountRate > 15) {
      considerations.push('High discount rate may require exceptional returns to justify investment');
    }

    considerations.push('Consider sensitivity analysis with different beta and market return assumptions');
    considerations.push('Account for changes in market conditions over time');

    return considerations;
  };

  const recommendation = (discountRate: number, beta: number) => {
    if (discountRate > 20) return 'Use with caution - very high discount rate may limit viable investments.';
    if (discountRate > 15) return 'Appropriate for high-risk investments or volatile market conditions.';
    if (discountRate > 10) return 'Suitable for moderate-risk investments and standard market conditions.';
    if (discountRate > 5) return 'Conservative rate suitable for low-risk investments.';
    return 'Very conservative rate - verify assumptions and market conditions.';
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc == null) { setResult(null); return; }
    setResult({ 
      discountRate: calc.discountRate, 
      interpretation: interpret(calc.discountRate, values.beta), 
      recommendation: recommendation(calc.discountRate, values.beta),
      riskLevel: getRiskLevel(calc.discountRate, values.beta),
      marketPremium: calc.marketPremium,
      insights: getInsights(calc.discountRate, values.beta, calc.marketPremium),
      considerations: getConsiderations(calc.discountRate, values.beta)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            CAPM Parameters
          </CardTitle>
          <CardDescription>
            Enter the parameters to calculate the discount rate using the Capital Asset Pricing Model (CAPM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Risk-Free Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 4.5" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Investment Beta (β)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 1.2" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Expected Market Return (%)
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
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Calculate Discount Rate
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
                  <CardTitle>Discount Rate Analysis</CardTitle>
                  <CardDescription>Required rate of return and risk assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Discount Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.discountRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required Rate of Return
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
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Market Premium</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.marketPremium.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Risk Premium
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
                  Calculate NPV using your discount rate to evaluate investment profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/dcf-calculator" className="text-primary hover:underline">
                    Discounted Cash Flow Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use DCF analysis to determine the intrinsic value of investments.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/wacc-calculator" className="text-primary hover:underline">
                    WACC Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the weighted average cost of capital for comprehensive analysis.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/capm-calculator" className="text-primary hover:underline">
                    CAPM Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand the Capital Asset Pricing Model for risk assessment.
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
              Complete Guide to Discount Rates
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
              Common questions about discount rates and CAPM analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a discount rate?</h4>
              <p className="text-muted-foreground">
                A discount rate is the interest rate used to determine the present value of future cash flows. It reflects the time value of money and the risk associated with an investment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is the discount rate calculated using CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM calculates discount rate as: Risk-Free Rate + Beta × (Market Return - Risk-Free Rate). This formula accounts for systematic risk and market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is beta and how does it affect the discount rate?</h4>
              <p className="text-muted-foreground">
                Beta measures an investment's sensitivity to market movements. A beta greater than 1 indicates higher volatility than the market, while beta less than 1 indicates lower volatility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What should I use as the risk-free rate?</h4>
              <p className="text-muted-foreground">
                Use government bond yields that match your investment horizon. For long-term investments, use 10-year treasury yields; for short-term, use 3-month treasury bills.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I determine the expected market return?</h4>
              <p className="text-muted-foreground">
                Use historical market returns (typically 8-12% annually) or forward-looking estimates based on current market conditions and economic outlook.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When should I use CAPM vs. WACC?</h4>
              <p className="text-muted-foreground">
                Use CAPM for equity-focused analysis or when evaluating individual investments. Use WACC for company-wide valuation or when considering both debt and equity financing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can discount rates change over time?</h4>
              <p className="text-muted-foreground">
                Yes, discount rates should be updated as market conditions, interest rates, and company risk profiles change. Review and adjust annually or when significant changes occur.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM assumes efficient markets, constant beta, and that investors hold diversified portfolios. It may not capture all risk factors or work well for private companies or unique investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I adjust for different risk levels?</h4>
              <p className="text-muted-foreground">
                Add risk premiums for specific factors like size, liquidity, country risk, or industry-specific risks. These adjustments reflect additional risks not captured by beta alone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use real or nominal discount rates?</h4>
              <p className="text-muted-foreground">
                Use nominal rates with nominal cash flows, or real rates with inflation-adjusted cash flows. Mixing them will lead to incorrect valuations. Convert between them using the Fisher equation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
