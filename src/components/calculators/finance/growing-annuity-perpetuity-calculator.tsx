'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, DollarSign, Info, AlertCircle, Target, Calendar, BarChart, Infinity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  initialPayment: z.number().min(0).optional(),
  growthRate: z.number().min(0).max(100).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  timePeriod: z.number().min(1).max(100).optional(),
  calculationType: z.enum(['annuity', 'perpetuity', 'present-value', 'future-value']).optional(),
  presentValue: z.number().min(0).optional(),
  futureValue: z.number().min(0).optional(),
  paymentFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrowingAnnuityPerpetuityCalculator() {
  const [result, setResult] = useState<{ 
    presentValue: number;
    futureValue: number;
    totalPayments: number;
    totalInterest: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; payment: number; presentValue: number; futureValue: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      initialPayment: undefined, 
      growthRate: undefined, 
      discountRate: undefined, 
      timePeriod: undefined, 
      calculationType: undefined,
      presentValue: undefined,
      futureValue: undefined,
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

  const calculateGrowingAnnuityPV = (initialPayment: number, growthRate: number, discountRate: number, periods: number, frequency: number) => {
    const periodicGrowth = growthRate / 100 / frequency;
    const periodicDiscount = discountRate / 100 / frequency;
    const totalPeriods = periods * frequency;
    
    if (periodicDiscount === periodicGrowth) {
      return initialPayment * totalPeriods;
    }
    
    return initialPayment * (1 - Math.pow((1 + periodicGrowth) / (1 + periodicDiscount), totalPeriods)) / (periodicDiscount - periodicGrowth);
  };

  const calculateGrowingAnnuityFV = (initialPayment: number, growthRate: number, discountRate: number, periods: number, frequency: number) => {
    const periodicGrowth = growthRate / 100 / frequency;
    const periodicDiscount = discountRate / 100 / frequency;
    const totalPeriods = periods * frequency;
    
    if (periodicDiscount === periodicGrowth) {
      return initialPayment * totalPeriods;
    }
    
    return initialPayment * (Math.pow(1 + periodicDiscount, totalPeriods) - Math.pow(1 + periodicGrowth, totalPeriods)) / (periodicDiscount - periodicGrowth);
  };

  const calculateGrowingPerpetuityPV = (initialPayment: number, growthRate: number, discountRate: number, frequency: number) => {
    const periodicGrowth = growthRate / 100 / frequency;
    const periodicDiscount = discountRate / 100 / frequency;
    
    if (periodicDiscount <= periodicGrowth) {
      return Infinity; // Perpetuity value is infinite if growth rate >= discount rate
    }
    
    return initialPayment / (periodicDiscount - periodicGrowth);
  };

  const calculate = (v: FormValues) => {
    if (v.initialPayment == null || v.growthRate == null || v.discountRate == null || v.calculationType == null) return null;
    
    const frequency = getPaymentFrequency(v.paymentFrequency || 'annual');
    let presentValue = 0;
    let futureValue = 0;
    let totalPayments = 0;
    let totalInterest = 0;
    
    if (v.calculationType === 'perpetuity') {
      presentValue = calculateGrowingPerpetuityPV(v.initialPayment, v.growthRate, v.discountRate, frequency);
      futureValue = Infinity;
      totalPayments = Infinity;
      totalInterest = Infinity;
    } else {
      if (v.timePeriod == null) return null;
      presentValue = calculateGrowingAnnuityPV(v.initialPayment, v.growthRate, v.discountRate, v.timePeriod, frequency);
      futureValue = calculateGrowingAnnuityFV(v.initialPayment, v.growthRate, v.discountRate, v.timePeriod, frequency);
      
      // Calculate total payments
      let totalPaymentsCalc = 0;
      for (let year = 1; year <= v.timePeriod; year++) {
        totalPaymentsCalc += v.initialPayment * Math.pow(1 + v.growthRate / 100, year - 1);
      }
      totalPayments = totalPaymentsCalc;
      totalInterest = futureValue - totalPayments;
    }
    
    // Generate year-by-year breakdown
    const yearByYear = [];
    for (let year = 1; year <= Math.min(v.timePeriod || 20, 20); year++) {
      const yearPayment = v.initialPayment * Math.pow(1 + v.growthRate / 100, year - 1);
      const yearPV = calculateGrowingAnnuityPV(v.initialPayment, v.growthRate, v.discountRate, year, frequency);
      const yearFV = calculateGrowingAnnuityFV(v.initialPayment, v.growthRate, v.discountRate, year, frequency);
      yearByYear.push({ year, payment: yearPayment, presentValue: yearPV, futureValue: yearFV });
    }
    
    return { presentValue, futureValue, totalPayments, totalInterest, yearByYear };
  };

  const interpret = (growthRate: number, discountRate: number, presentValue: number, calculationType: string) => {
    if (calculationType === 'perpetuity') {
      if (growthRate >= discountRate) {
        return 'Growth rate equals or exceeds discount rate. Perpetuity value is infinite or undefined.';
      }
      if (discountRate - growthRate < 2) {
        return 'Very small difference between discount and growth rates. Perpetuity value is extremely high.';
      }
      return 'Reasonable perpetuity valuation with sustainable growth assumptions.';
    }
    
    if (growthRate > discountRate) {
      return 'Growth rate exceeds discount rate. This creates an unusual situation where later payments are worth more than earlier ones.';
    }
    
    if (growthRate > discountRate * 0.8) {
      return 'High growth rate relative to discount rate. This creates significant value from growth.';
    }
    
    return 'Conservative growth rate relative to discount rate. This provides steady, predictable growth.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'annuity': return 'Growing Annuity';
      case 'perpetuity': return 'Growing Perpetuity';
      case 'present-value': return 'Growing Annuity Present Value';
      case 'future-value': return 'Growing Annuity Future Value';
      default: return 'Growing Cash Flow Calculation';
    }
  };

  const getRecommendations = (growthRate: number, discountRate: number, presentValue: number, calculationType: string) => {
    const recommendations = [];
    
    if (calculationType === 'perpetuity') {
      if (growthRate >= discountRate) {
        recommendations.push('Growth rate too high relative to discount rate');
        recommendations.push('Consider more conservative growth assumptions');
        recommendations.push('Review the sustainability of the growth rate');
      } else {
        recommendations.push('Reasonable growth rate for perpetuity valuation');
        recommendations.push('Consider the long-term sustainability of growth');
        recommendations.push('Review economic conditions affecting growth');
      }
    }
    
    if (calculationType === 'annuity') {
      if (growthRate > discountRate * 0.8) {
        recommendations.push('High growth rate creates significant value');
        recommendations.push('Consider the sustainability of growth assumptions');
        recommendations.push('Review historical growth patterns');
      } else {
        recommendations.push('Conservative growth rate provides steady value');
        recommendations.push('Consider if growth assumptions are realistic');
        recommendations.push('Review market conditions and economic outlook');
      }
    }
    
    if (growthRate > 10) {
      recommendations.push('Very high growth rate - consider if sustainable');
      recommendations.push('Review historical growth patterns and market conditions');
      recommendations.push('Consider the risk of growth rate changes');
    }
    
    recommendations.push('Consider inflation impact on real growth');
    recommendations.push('Review the stability of the income source');
    recommendations.push('Evaluate tax implications of growing payments');
    recommendations.push('Consider your overall portfolio diversification');
    
    return recommendations;
  };

  const getWarningSigns = (growthRate: number, discountRate: number, presentValue: number, calculationType: string) => {
    const signs = [];
    
    if (calculationType === 'perpetuity' && growthRate >= discountRate) {
      signs.push('Growth rate equals or exceeds discount rate');
      signs.push('Perpetuity value is infinite or undefined');
      signs.push('Consider more conservative growth assumptions');
    }
    
    if (growthRate > 20) {
      signs.push('Very high growth rate may be unsustainable');
      signs.push('Consider if the growth rate is realistic long-term');
      signs.push('Review historical growth patterns and market conditions');
    }
    
    if (discountRate < growthRate + 2) {
      signs.push('Small difference between discount and growth rates');
      signs.push('High sensitivity to rate changes');
      signs.push('Consider the risk of rate fluctuations');
    }
    
    signs.push('Not accounting for inflation in growth assumptions');
    signs.push('Ignoring the risk of growth rate changes');
    signs.push('Not considering alternative investment options');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(values.growthRate!, values.discountRate!, calculation.presentValue, values.calculationType!),
      recommendations: getRecommendations(values.growthRate!, values.discountRate!, calculation.presentValue, values.calculationType!),
      warningSigns: getWarningSigns(values.growthRate!, values.discountRate!, calculation.presentValue, values.calculationType!),
      calculationType: getCalculationType(values.calculationType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growing Annuity/Perpetuity Calculator
          </CardTitle>
          <CardDescription>
            Calculate the value of growing cash flows and perpetuity investments
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
                      name="initialPayment" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Initial Payment Amount
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
                      name="growthRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Growth Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 3" 
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
                            <BarChart className="h-4 w-4" />
                            Discount Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 8" 
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
                      name="timePeriod" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Time Period (Years)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="e.g., 20" 
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

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Calculation Options
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
                              <option value="annuity">Growing Annuity</option>
                              <option value="perpetuity">Growing Perpetuity</option>
                              <option value="present-value">Present Value</option>
                              <option value="future-value">Future Value</option>
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
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Growing Cash Flow
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
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.calculationType}</CardTitle>
                  <CardDescription>Growing cash flow analysis and valuation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Present Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.presentValue === Infinity ? '∞' : `$${result.presentValue.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current value of growing payments
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {result.futureValue === Infinity ? '∞' : `$${result.futureValue.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Value at end of period
                  </p>
                </div>
              </div>

              {result.totalPayments !== Infinity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-muted-foreground">Total Payments</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      ${result.totalPayments.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sum of all payments
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <BarChart className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      ${result.totalInterest.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Interest earned
                    </p>
                  </div>
                </div>
              )}

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
                    Growth Over Time
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
                          <th className="text-right p-2">Future Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.payment.toLocaleString()}</td>
                            <td className="text-right p-2">${year.presentValue.toLocaleString()}</td>
                            <td className="text-right p-2">${year.futureValue.toLocaleString()}</td>
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
              Understanding Growing Cash Flows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What are Growing Annuities and Perpetuities?</h4>
              <p className="text-muted-foreground">
                Growing annuities and perpetuities are cash flows that increase at a constant rate over time. They're useful for modeling investments with growing dividends, inflation-adjusted payments, or any income stream that grows over time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Growth Rate vs. Discount Rate</h4>
              <p className="text-muted-foreground">
                The growth rate determines how much payments increase each period, while the discount rate determines the present value. For perpetuities, the growth rate must be less than the discount rate for the valuation to be finite.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Real-World Applications</h4>
              <p className="text-muted-foreground">
                Growing cash flows are common in real estate (rental income), dividend stocks, inflation-adjusted bonds, and retirement planning. They help account for the fact that many income streams grow over time due to inflation or business growth.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
                  <a href="/category/finance/perpetuity-calculator" className="text-primary hover:underline">
                    Perpetuity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate perpetuity values and payments
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
              <TrendingUp className="h-5 w-5" />
              Complete Guide to Growing Cash Flows
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Growing Cash Flows: The Power of Growth</h3>
            <p>Growing cash flows are essential for realistic financial modeling because most real-world income streams increase over time. Whether due to inflation, business growth, or other factors, accounting for growth provides more accurate valuations and better investment decisions.</p>
            
            <h3>The Mathematics of Growing Cash Flows</h3>
            <p>Growing annuities and perpetuities use more complex formulas than their fixed counterparts. The key is ensuring that the growth rate is less than the discount rate for finite valuations. This relationship determines whether the investment has a reasonable present value.</p>
            
            <h3>Real-World Applications and Examples</h3>
            <p>Growing cash flows are everywhere in finance: rental properties with increasing rents, dividend stocks with growing dividends, inflation-adjusted bonds, and retirement income that keeps pace with inflation. Understanding these patterns helps you make better investment decisions.</p>
            
            <h3>Risk Assessment and Growth Sustainability</h3>
            <p>When using growing cash flow models, consider the sustainability of the growth rate. High growth rates may be unsustainable long-term, while very low growth rates may not keep pace with inflation. Balance optimism with realism in your growth assumptions.</p>
            
            <h3>Investment Strategy with Growing Cash Flows</h3>
            <p>Growing cash flows can be powerful components of a diversified portfolio, particularly for income-focused investors. However, consider the risks of growth rate changes, economic downturns, and inflation. Use growing cash flow models as one tool among many in your investment analysis.</p>
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
              Common questions about growing cash flows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if the growth rate equals the discount rate?</h4>
              <p className="text-muted-foreground">
                When the growth rate equals the discount rate, the present value of a growing perpetuity becomes infinite. This is because the payments grow at the same rate as they're discounted, resulting in a constant present value that never decreases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose realistic growth rates?</h4>
              <p className="text-muted-foreground">
                Choose growth rates based on historical data, economic conditions, and the specific investment. Consider inflation rates, industry growth rates, and the sustainability of the growth. Be conservative in your assumptions to avoid overvaluing investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between nominal and real growth rates?</h4>
              <p className="text-muted-foreground">
                Nominal growth rates include inflation, while real growth rates are inflation-adjusted. For long-term analysis, use real growth rates and real discount rates. This ensures your valuations reflect true purchasing power rather than just nominal increases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I account for changing growth rates over time?</h4>
              <p className="text-muted-foreground">
                For investments with changing growth rates, consider using multiple-stage models. Start with a high growth rate for the initial period, then transition to a lower, more sustainable rate. This provides more realistic valuations for growing businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the risks of using growing cash flow models?</h4>
              <p className="text-muted-foreground">
                Risks include overestimating growth rates, ignoring the possibility of growth rate changes, and not considering economic downturns. Use sensitivity analysis to test different growth scenarios and consider the worst-case outcomes in your investment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
