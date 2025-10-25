'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingDown, Info, AlertCircle, Target, Calendar, BarChart, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  futureValue: z.number().min(0).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  timePeriod: z.number().min(0).max(100).optional(),
  compoundingFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly', 'daily']).optional(),
  calculationType: z.enum(['single-amount', 'annuity', 'growing-annuity']).optional(),
  paymentAmount: z.number().min(0).optional(),
  growthRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PresentValueCalculator() {
  const [result, setResult] = useState<{ 
    presentValue: number;
    discountFactor: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; futureValue: number; presentValue: number; discountFactor: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      futureValue: undefined, 
      discountRate: undefined, 
      timePeriod: undefined, 
      compoundingFrequency: undefined,
      calculationType: undefined,
      paymentAmount: undefined,
      growthRate: undefined
    } 
  });

  const getCompoundingFrequency = (frequency: string) => {
    const frequencies = {
      'annual': 1,
      'semi-annual': 2,
      'quarterly': 4,
      'monthly': 12,
      'daily': 365
    };
    return frequencies[frequency as keyof typeof frequencies] || 1;
  };

  const calculatePresentValue = (futureValue: number, rate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    return futureValue / Math.pow(1 + periodicRate, totalPeriods);
  };

  const calculateAnnuityPV = (payment: number, rate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === 0) {
      return payment * totalPeriods;
    }
    
    return payment * (1 - Math.pow(1 + periodicRate, -totalPeriods)) / periodicRate;
  };

  const calculateGrowingAnnuityPV = (payment: number, rate: number, growthRate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const periodicGrowth = growthRate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === periodicGrowth) {
      return payment * totalPeriods;
    }
    
    return payment * (1 - Math.pow((1 + periodicGrowth) / (1 + periodicRate), totalPeriods)) / (periodicRate - periodicGrowth);
  };

  const calculate = (v: FormValues) => {
    if (v.discountRate == null || v.timePeriod == null || v.calculationType == null) return null;
    
    const compounding = getCompoundingFrequency(v.compoundingFrequency || 'annual');
    let presentValue = 0;
    
    switch (v.calculationType) {
      case 'single-amount':
        if (v.futureValue == null) return null;
        presentValue = calculatePresentValue(v.futureValue, v.discountRate, v.timePeriod, compounding);
        break;
      case 'annuity':
        if (v.paymentAmount == null) return null;
        presentValue = calculateAnnuityPV(v.paymentAmount, v.discountRate, v.timePeriod, compounding);
        break;
      case 'growing-annuity':
        if (v.paymentAmount == null || v.growthRate == null) return null;
        presentValue = calculateGrowingAnnuityPV(v.paymentAmount, v.discountRate, v.growthRate, v.timePeriod, compounding);
        break;
    }
    
    const discountFactor = presentValue / (v.futureValue || v.paymentAmount || 0);
    
    // Generate year-by-year breakdown
    const yearByYear = [];
    for (let year = 0; year <= v.timePeriod; year++) {
      const futureValue = v.futureValue || v.paymentAmount || 0;
      const yearPV = calculatePresentValue(futureValue, v.discountRate, year, compounding);
      const yearDiscountFactor = yearPV / futureValue;
      yearByYear.push({ year, futureValue, presentValue: yearPV, discountFactor: yearDiscountFactor });
    }
    
    return { presentValue, discountFactor, yearByYear: yearByYear.slice(0, 11) };
  };

  const interpret = (presentValue: number, futureValue: number, discountRate: number) => {
    const discountPercentage = ((futureValue - presentValue) / futureValue) * 100;
    
    if (discountPercentage > 50) return 'High discount rate significantly reduces present value. Consider if the investment meets your return requirements.';
    if (discountPercentage > 25) return 'Moderate discount rate affects present value. Evaluate the investment opportunity carefully.';
    if (discountPercentage > 10) return 'Reasonable discount rate with moderate impact on present value.';
    return 'Low discount rate with minimal impact on present value.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'single-amount': return 'Single Amount Present Value';
      case 'annuity': return 'Annuity Present Value';
      case 'growing-annuity': return 'Growing Annuity Present Value';
      default: return 'Present Value Calculation';
    }
  };

  const getRecommendations = (discountRate: number, presentValue: number, futureValue: number, calculationType: string) => {
    const recommendations = [];
    
    if (discountRate > 15) {
      recommendations.push('High discount rate indicates high risk or opportunity cost');
      recommendations.push('Consider if the investment return justifies the risk');
      recommendations.push('Evaluate alternative investments with lower risk');
    } else if (discountRate > 8) {
      recommendations.push('Moderate discount rate suggests reasonable risk assessment');
      recommendations.push('Compare with market rates for similar investments');
      recommendations.push('Consider your risk tolerance and investment goals');
    } else {
      recommendations.push('Low discount rate suggests conservative approach');
      recommendations.push('Ensure the rate reflects current market conditions');
      recommendations.push('Consider inflation impact on real returns');
    }
    
    if (calculationType === 'annuity') {
      recommendations.push('Consider the stability of future cash flows');
      recommendations.push('Evaluate the creditworthiness of the payment source');
      recommendations.push('Compare with other fixed-income investments');
    }
    
    if (calculationType === 'growing-annuity') {
      recommendations.push('Verify the sustainability of growth rate assumptions');
      recommendations.push('Consider economic conditions affecting growth');
      recommendations.push('Review historical growth patterns');
    }
    
    recommendations.push('Use present value for investment comparison');
    recommendations.push('Consider tax implications of the investment');
    recommendations.push('Review your overall portfolio allocation');
    
    return recommendations;
  };

  const getWarningSigns = (discountRate: number, presentValue: number, futureValue: number) => {
    const signs = [];
    
    if (discountRate > 20) {
      signs.push('Very high discount rate may indicate unrealistic expectations');
      signs.push('Consider if the risk is appropriately assessed');
      signs.push('Review market conditions and comparable investments');
    }
    
    if (presentValue < futureValue * 0.1) {
      signs.push('Present value is very low relative to future value');
      signs.push('High discount rate significantly reduces value');
      signs.push('Consider if the investment is worth the wait');
    }
    
    signs.push('Not accounting for inflation in discount rate');
    signs.push('Using inappropriate discount rate for risk level');
    signs.push('Ignoring opportunity cost of alternative investments');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.presentValue, values.futureValue || values.paymentAmount || 0, values.discountRate!),
      recommendations: getRecommendations(values.discountRate!, calculation.presentValue, values.futureValue || values.paymentAmount || 0, values.calculationType!),
      warningSigns: getWarningSigns(values.discountRate!, calculation.presentValue, values.futureValue || values.paymentAmount || 0),
      calculationType: getCalculationType(values.calculationType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Present Value Calculation
          </CardTitle>
          <CardDescription>
            Calculate the present value of future cash flows
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
                      name="discountRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
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
                              placeholder="e.g., 10" 
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
                      name="compoundingFrequency" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Compounding Frequency
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
                              <option value="daily">Daily</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
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
                              <option value="single-amount">Single Amount</option>
                              <option value="annuity">Annuity</option>
                              <option value="growing-annuity">Growing Annuity</option>
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
                    Cash Flow Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="futureValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Future Value (for single amount)
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
                    <FormField 
                      control={form.control} 
                      name="paymentAmount" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Payment Amount (for annuities)
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
                            Growth Rate (%) (for growing annuity)
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
                  </div>
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Present Value
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
                  <CardTitle>{result.calculationType}</CardTitle>
                  <CardDescription>Present value analysis and recommendations</CardDescription>
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
                    ${result.presentValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current worth of future cash flows
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Discount Factor</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {result.discountFactor.toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Present value per dollar of future value
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
                    Present Value Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Present Value</th>
                          <th className="text-right p-2">Discount Factor</th>
                          <th className="text-right p-2">Value Reduction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.presentValue.toLocaleString()}</td>
                            <td className="text-right p-2">{year.discountFactor.toFixed(4)}</td>
                            <td className="text-right p-2">{((1 - year.discountFactor) * 100).toFixed(1)}%</td>
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
              Understanding Present Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Present Value?</h4>
              <p className="text-muted-foreground">
                Present value is the current worth of a future sum of money or stream of cash flows, given a specific rate of return (discount rate). It helps you determine how much a future amount is worth today.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Discount Rate</h4>
              <p className="text-muted-foreground">
                The discount rate represents your required rate of return or the opportunity cost of capital. It reflects the risk of the investment and the time value of money. Higher rates result in lower present values.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Time Value of Money</h4>
              <p className="text-muted-foreground">
                Money today is worth more than the same amount in the future because it can be invested and earn returns. Present value calculations account for this time value of money principle.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
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
                  <a href="/category/finance/future-value-calculator" className="text-primary hover:underline">
                    Future Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate future value of investments
                </p>
              </div>
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
                  <a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">
                    Compound Interest Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate compound interest growth over time
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                    NPV Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate net present value of investments
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
              Complete Guide to Present Value Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Present Value: The Foundation of Financial Analysis</h3>
            <p>Present value is a fundamental concept in finance that allows you to compare the worth of money received at different times. It's based on the principle that money today is worth more than the same amount in the future due to its earning potential.</p>
            
            <h3>Choosing the Right Discount Rate</h3>
            <p>The discount rate is crucial in present value calculations. It should reflect the risk of the investment, your opportunity cost of capital, and current market conditions. Use rates that match the risk level of your investment or the cost of capital for your business.</p>
            
            <h3>Single Amount vs. Annuity Calculations</h3>
            <p>Single amount present value calculations are used for lump-sum payments, while annuity calculations are for regular payments. Growing annuities account for payments that increase over time, which is common in real-world scenarios like salary increases or inflation-adjusted payments.</p>
            
            <h3>Compounding Frequency Impact</h3>
            <p>The frequency of compounding significantly affects present value calculations. More frequent compounding (monthly vs. annual) results in higher present values for the same future amount. Choose the compounding frequency that matches your investment or loan terms.</p>
            
            <h3>Practical Applications of Present Value</h3>
            <p>Present value is used in investment analysis, loan evaluations, retirement planning, and business decision-making. It helps you make informed choices about investments, compare different financial options, and plan for future financial goals.</p>
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
              Common questions about present value calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right discount rate?</h4>
              <p className="text-muted-foreground">
                Choose a discount rate that reflects the risk of the investment and your opportunity cost. For low-risk investments, use rates close to government bond yields. For higher-risk investments, add a risk premium. Consider your required rate of return and current market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between present value and future value?</h4>
              <p className="text-muted-foreground">
                Present value calculates what a future amount is worth today, while future value calculates what a current amount will be worth in the future. Present value discounts future cash flows, while future value compounds current cash flows.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When should I use present value in investment decisions?</h4>
              <p className="text-muted-foreground">
                Use present value to compare investments with different timing of cash flows, evaluate loan offers, assess the value of future income streams, and make decisions about long-term financial commitments. It's essential for any time-sensitive financial decision.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect present value calculations?</h4>
              <p className="text-muted-foreground">
                Inflation should be considered in your discount rate. If you use a nominal discount rate, you're accounting for inflation. For real (inflation-adjusted) analysis, use real discount rates and real cash flows. This ensures your calculations reflect true purchasing power.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ordinary annuity and annuity due?</h4>
              <p className="text-muted-foreground">
                Ordinary annuities have payments at the end of each period, while annuity due has payments at the beginning. Annuity due has a higher present value because payments are received earlier. Most loans and investments use ordinary annuity calculations.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}