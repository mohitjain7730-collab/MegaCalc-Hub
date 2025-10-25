'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Infinity, Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, BarChart, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  paymentAmount: z.number().min(0).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  calculationType: z.enum(['present-value', 'payment-amount', 'discount-rate']).optional(),
  presentValue: z.number().min(0).optional(),
  paymentFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PerpetuityCalculator() {
  const [result, setResult] = useState<{ 
    presentValue: number;
    paymentAmount: number;
    discountRate: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; payment: number; presentValue: number; discountFactor: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      paymentAmount: undefined, 
      discountRate: undefined, 
      calculationType: undefined, 
      presentValue: undefined,
      paymentFrequency: undefined
    } 
  });

  const getPaymentFrequency = (frequency: string) => {
    const frequencies = {
      'annual': 1,
      'semi-annual': 2,
      'quarterly': 4,
      'monthly': 12
    };
    return frequencies[frequency as keyof typeof frequencies] || 1;
  };

  const calculatePerpetuityPV = (payment: number, rate: number, frequency: number) => {
    const periodicRate = rate / 100 / frequency;
    return payment / periodicRate;
  };

  const calculatePerpetuityPayment = (presentValue: number, rate: number, frequency: number) => {
    const periodicRate = rate / 100 / frequency;
    return presentValue * periodicRate;
  };

  const calculatePerpetuityRate = (payment: number, presentValue: number, frequency: number) => {
    return (payment / presentValue) * frequency * 100;
  };

  const calculate = (v: FormValues) => {
    if (v.calculationType == null) return null;
    
    const frequency = getPaymentFrequency(v.paymentFrequency || 'annual');
    let presentValue = 0;
    let paymentAmount = 0;
    let discountRate = 0;
    
    switch (v.calculationType) {
      case 'present-value':
        if (v.paymentAmount == null || v.discountRate == null) return null;
        presentValue = calculatePerpetuityPV(v.paymentAmount, v.discountRate, frequency);
        paymentAmount = v.paymentAmount;
        discountRate = v.discountRate;
        break;
      case 'payment-amount':
        if (v.presentValue == null || v.discountRate == null) return null;
        paymentAmount = calculatePerpetuityPayment(v.presentValue, v.discountRate, frequency);
        presentValue = v.presentValue;
        discountRate = v.discountRate;
        break;
      case 'discount-rate':
        if (v.paymentAmount == null || v.presentValue == null) return null;
        discountRate = calculatePerpetuityRate(v.paymentAmount, v.presentValue, frequency);
        paymentAmount = v.paymentAmount;
        presentValue = v.presentValue;
        break;
    }
    
    // Generate year-by-year breakdown
    const yearByYear = [];
    for (let year = 1; year <= 20; year++) {
      const yearPayment = paymentAmount * frequency;
      const yearPV = presentValue;
      const discountFactor = 1 / Math.pow(1 + discountRate / 100, year);
      yearByYear.push({ year, payment: yearPayment, presentValue: yearPV, discountFactor });
    }
    
    return { presentValue, paymentAmount, discountRate, yearByYear };
  };

  const interpret = (discountRate: number, presentValue: number, paymentAmount: number) => {
    const yieldPercentage = (paymentAmount / presentValue) * 100;
    
    if (discountRate > 15) return 'High discount rate indicates high risk or opportunity cost. Consider if the investment meets your return requirements.';
    if (discountRate > 8) return 'Moderate discount rate suggests reasonable risk assessment. Review your investment strategy and goals.';
    if (discountRate > 4) return 'Conservative discount rate with lower risk. Ensure the rate reflects current market conditions.';
    return 'Very low discount rate. Consider if this meets your investment objectives and inflation expectations.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'present-value': return 'Perpetuity Present Value';
      case 'payment-amount': return 'Perpetuity Payment Amount';
      case 'discount-rate': return 'Perpetuity Discount Rate';
      default: return 'Perpetuity Calculation';
    }
  };

  const getRecommendations = (discountRate: number, presentValue: number, paymentAmount: number, calculationType: string) => {
    const recommendations = [];
    
    if (calculationType === 'present-value') {
      if (discountRate > 10) {
        recommendations.push('High discount rate suggests high risk investment');
        recommendations.push('Consider if the risk is appropriately assessed');
        recommendations.push('Review market conditions and comparable investments');
      } else {
        recommendations.push('Reasonable discount rate for perpetuity valuation');
        recommendations.push('Consider the stability of the income source');
        recommendations.push('Evaluate the creditworthiness of the payment source');
      }
    }
    
    if (calculationType === 'payment-amount') {
      recommendations.push('Consider the sustainability of the payment amount');
      recommendations.push('Review the stability of the income source');
      recommendations.push('Evaluate inflation impact on real returns');
      recommendations.push('Consider the creditworthiness of the payer');
    }
    
    if (calculationType === 'discount-rate') {
      recommendations.push('Compare with market rates for similar investments');
      recommendations.push('Consider your risk tolerance and investment goals');
      recommendations.push('Review current economic conditions');
      recommendations.push('Evaluate alternative investment opportunities');
    }
    
    recommendations.push('Consider the impact of inflation on real returns');
    recommendations.push('Review the stability and reliability of the income source');
    recommendations.push('Evaluate tax implications of the investment');
    recommendations.push('Consider your overall portfolio diversification');
    
    return recommendations;
  };

  const getWarningSigns = (discountRate: number, presentValue: number, paymentAmount: number) => {
    const signs = [];
    
    if (discountRate > 20) {
      signs.push('Very high discount rate may indicate unrealistic expectations');
      signs.push('Consider if the risk is appropriately assessed');
      signs.push('Review market conditions and comparable investments');
    }
    
    if (discountRate < 2) {
      signs.push('Very low discount rate may not keep pace with inflation');
      signs.push('Consider if the rate reflects current market conditions');
      signs.push('Review your investment strategy and goals');
    }
    
    if (presentValue > paymentAmount * 50) {
      signs.push('Very high present value relative to payment amount');
      signs.push('Consider if the valuation is realistic');
      signs.push('Review the stability of the income source');
    }
    
    signs.push('Not accounting for inflation in discount rate');
    signs.push('Ignoring the risk of payment interruption');
    signs.push('Not considering alternative investment options');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.discountRate, calculation.presentValue, calculation.paymentAmount),
      recommendations: getRecommendations(calculation.discountRate, calculation.presentValue, calculation.paymentAmount, values.calculationType!),
      warningSigns: getWarningSigns(calculation.discountRate, calculation.presentValue, calculation.paymentAmount),
      calculationType: getCalculationType(values.calculationType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Infinity className="h-5 w-5" />
            Perpetuity Calculation
          </CardTitle>
          <CardDescription>
            Calculate the value of infinite cash flows and perpetuity investments
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Basic Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="calculationType" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Calculation Type
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select calculation type</option>
                              <option value="present-value">Present Value</option>
                              <option value="payment-amount">Payment Amount</option>
                              <option value="discount-rate">Discount Rate</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="paymentFrequency" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Payment Frequency
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select frequency</option>
                              <option value="annual">Annual</option>
                              <option value="semi-annual">Semi-Annual</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="monthly">Monthly</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="paymentAmount" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Payment Amount
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 5000" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                            />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="discountRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Discount Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 8.5" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                            />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="presentValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Present Value
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
                      )} 
                    />
                  </div>
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Perpetuity
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
                <Infinity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.calculationType}</CardTitle>
                  <CardDescription>Perpetuity analysis and infinite cash flow valuation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Present Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.presentValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current value of infinite payments
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Payment Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.paymentAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Per payment period
                  </p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Discount Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.discountRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required return rate
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Year-by-Year Analysis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart className="h-5 w-5" />
                    Perpetuity Value Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Present Value</th>
                          <th className="text-right p-2">Discount Factor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.payment.toLocaleString()}</td>
                            <td className="text-right p-2">${year.presentValue.toLocaleString()}</td>
                            <td className="text-right p-2">{year.discountFactor.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Investment Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Warning Signs to Watch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.warningSigns.map((sign, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{sign}</span>
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

      {/* Educational Content */}
      <div className="space-y-6">
        {/* Explain the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding Perpetuities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a Perpetuity?</h4>
              <p className="text-muted-foreground">
                A perpetuity is an infinite series of equal payments made at regular intervals. Unlike annuities, perpetuities never end. Common examples include preferred stock dividends, certain types of bonds, and some real estate investments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Present Value of Perpetuity</h4>
              <p className="text-muted-foreground">
                The present value of a perpetuity is calculated by dividing the payment amount by the discount rate. This gives you the current worth of all future payments, discounted to today's value.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Real-World Applications</h4>
              <p className="text-muted-foreground">
                Perpetuities are used to value preferred stock, certain types of bonds, real estate with perpetual leases, and other investments that provide infinite cash flows. They're also used in academic finance and theoretical models.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Infinity className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning and investment tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/annuity-payment-calculator" className="text-primary hover:underline">
                    Annuity Payment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate annuity payments and values
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/present-value-calculator" className="text-primary hover:underline">
                    Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate present value of future cash flows
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/growing-annuity-perpetuity-calculator" className="text-primary hover:underline">
                    Growing Annuity/Perpetuity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate growing annuity and perpetuity values
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">
                    Retirement Savings Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your retirement with comprehensive projections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Infinity className="h-5 w-5" />
              Complete Guide to Perpetuities and Infinite Cash Flows
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Perpetuities: Infinite Cash Flow Valuation</h3>
            <p>Perpetuities are financial instruments that provide infinite cash flows at regular intervals. Unlike annuities, which have a finite life, perpetuities continue forever. This makes them valuable for valuing certain types of investments and understanding the theoretical value of infinite income streams.</p>
            
            <h3>The Mathematics of Perpetuities</h3>
            <p>The present value of a perpetuity is calculated using the simple formula: PV = Payment / Discount Rate. This formula assumes that payments continue forever and that the discount rate remains constant. The higher the discount rate, the lower the present value.</p>
            
            <h3>Real-World Perpetuity Examples</h3>
            <p>Common examples of perpetuities include preferred stock with fixed dividends, certain types of government bonds, and real estate with perpetual leases. These investments provide regular income that can theoretically continue forever, making them suitable for perpetuity valuation.</p>
            
            <h3>Limitations and Considerations</h3>
            <p>While perpetuities provide a useful theoretical framework, real-world applications have limitations. No investment truly lasts forever, and discount rates can change over time. Consider the stability of the income source and the reliability of the payment stream when using perpetuity valuations.</p>
            
            <h3>Investment Strategy with Perpetuities</h3>
            <p>Perpetuities can be valuable components of a diversified investment portfolio, particularly for income-focused investors. However, consider the risks of inflation, payment interruption, and changes in interest rates. Use perpetuity valuations as one tool among many in your investment analysis.</p>
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
              Common questions about perpetuities and infinite cash flows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between an annuity and a perpetuity?</h4>
              <p className="text-muted-foreground">
                An annuity has a finite number of payments over a specific period, while a perpetuity has infinite payments that continue forever. Perpetuities are theoretical constructs, while annuities are common in real-world financial products.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right discount rate for a perpetuity?</h4>
              <p className="text-muted-foreground">
                Choose a discount rate that reflects the risk of the investment and your required rate of return. Consider the stability of the income source, current market conditions, and your opportunity cost of capital. Higher-risk investments require higher discount rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Are perpetuities realistic in real-world investing?</h4>
              <p className="text-muted-foreground">
                True perpetuities are rare in practice, but the concept is useful for valuing long-term investments and understanding the theoretical value of infinite cash flows. Many investments can be approximated as perpetuities for valuation purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect perpetuity valuations?</h4>
              <p className="text-muted-foreground">
                Inflation erodes the purchasing power of fixed payments over time. For perpetuities with fixed payments, consider using real (inflation-adjusted) discount rates. For growing perpetuities, factor in expected inflation in your growth rate assumptions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the risks of investing in perpetuity-like instruments?</h4>
              <p className="text-muted-foreground">
                Risks include payment interruption, changes in interest rates, inflation, and the possibility that the income source may not continue forever. Consider the creditworthiness of the payer and the stability of the underlying asset or business.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}