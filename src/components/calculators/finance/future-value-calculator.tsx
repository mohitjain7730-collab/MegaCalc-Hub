'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, DollarSign, Info, AlertCircle, Target, Calendar, BarChart, PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  presentValue: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  timePeriod: z.number().min(0).max(100).optional(),
  compoundingFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly', 'daily']).optional(),
  calculationType: z.enum(['single-amount', 'annuity', 'growing-annuity']).optional(),
  paymentAmount: z.number().min(0).optional(),
  growthRate: z.number().min(0).max(100).optional(),
  additionalContributions: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FutureValueCalculator() {
  const [result, setResult] = useState<{ 
    futureValue: number;
    totalContributions: number;
    totalInterest: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; contribution: number; interest: number; balance: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      presentValue: undefined, 
      interestRate: undefined, 
      timePeriod: undefined, 
      compoundingFrequency: undefined,
      calculationType: undefined,
      paymentAmount: undefined,
      growthRate: undefined,
      additionalContributions: undefined
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

  const calculateFutureValue = (presentValue: number, rate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    return presentValue * Math.pow(1 + periodicRate, totalPeriods);
  };

  const calculateAnnuityFV = (payment: number, rate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === 0) {
      return payment * totalPeriods;
    }
    
    return payment * (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
  };

  const calculateGrowingAnnuityFV = (payment: number, rate: number, growthRate: number, periods: number, compounding: number) => {
    const periodicRate = rate / 100 / compounding;
    const periodicGrowth = growthRate / 100 / compounding;
    const totalPeriods = periods * compounding;
    
    if (periodicRate === periodicGrowth) {
      return payment * totalPeriods;
    }
    
    return payment * (Math.pow(1 + periodicRate, totalPeriods) - Math.pow(1 + periodicGrowth, totalPeriods)) / (periodicRate - periodicGrowth);
  };

  const calculate = (v: FormValues) => {
    if (v.interestRate == null || v.timePeriod == null || v.calculationType == null) return null;
    
    const compounding = getCompoundingFrequency(v.compoundingFrequency || 'annual');
    let futureValue = 0;
    let totalContributions = 0;
    
    switch (v.calculationType) {
      case 'single-amount':
        if (v.presentValue == null) return null;
        futureValue = calculateFutureValue(v.presentValue, v.interestRate, v.timePeriod, compounding);
        totalContributions = v.presentValue;
        break;
      case 'annuity':
        if (v.paymentAmount == null) return null;
        futureValue = calculateAnnuityFV(v.paymentAmount, v.interestRate, v.timePeriod, compounding);
        totalContributions = v.paymentAmount * v.timePeriod;
        break;
      case 'growing-annuity':
        if (v.paymentAmount == null || v.growthRate == null) return null;
        futureValue = calculateGrowingAnnuityFV(v.paymentAmount, v.interestRate, v.growthRate, v.timePeriod, compounding);
        // Calculate total contributions for growing annuity
        let totalContribs = 0;
        for (let year = 1; year <= v.timePeriod; year++) {
          totalContribs += v.paymentAmount * Math.pow(1 + v.growthRate / 100, year - 1);
        }
        totalContributions = totalContribs;
        break;
    }
    
    const totalInterest = futureValue - totalContributions;
    
    // Generate year-by-year breakdown
    const yearByYear = [];
    let runningBalance = 0;
    let totalContribs = 0;
    
    for (let year = 1; year <= v.timePeriod; year++) {
      let yearContribution = 0;
      let yearInterest = 0;
      
      if (v.calculationType === 'single-amount' && year === 1) {
        yearContribution = v.presentValue || 0;
        yearInterest = runningBalance * (v.interestRate! / 100);
        runningBalance = yearContribution;
      } else if (v.calculationType === 'annuity') {
        yearContribution = v.paymentAmount || 0;
        yearInterest = runningBalance * (v.interestRate! / 100);
        runningBalance = (runningBalance + yearContribution) * (1 + v.interestRate! / 100);
      } else if (v.calculationType === 'growing-annuity') {
        yearContribution = (v.paymentAmount || 0) * Math.pow(1 + (v.growthRate || 0) / 100, year - 1);
        yearInterest = runningBalance * (v.interestRate! / 100);
        runningBalance = (runningBalance + yearContribution) * (1 + v.interestRate! / 100);
      }
      
      totalContribs += yearContribution;
      yearByYear.push({ 
        year, 
        contribution: yearContribution, 
        interest: yearInterest, 
        balance: runningBalance 
      });
    }
    
    return { futureValue, totalContributions, totalInterest, yearByYear: yearByYear.slice(0, 11) };
  };

  const interpret = (futureValue: number, totalContributions: number, interestRate: number) => {
    const totalInterest = futureValue - totalContributions;
    const interestPercentage = (totalInterest / totalContributions) * 100;
    
    if (interestPercentage > 200) return 'Excellent growth potential with compound interest working powerfully over time.';
    if (interestPercentage > 100) return 'Strong growth potential with significant compound interest benefits.';
    if (interestPercentage > 50) return 'Good growth potential with moderate compound interest effects.';
    return 'Conservative growth with steady compound interest accumulation.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'single-amount': return 'Single Amount Future Value';
      case 'annuity': return 'Annuity Future Value';
      case 'growing-annuity': return 'Growing Annuity Future Value';
      default: return 'Future Value Calculation';
    }
  };

  const getRecommendations = (interestRate: number, futureValue: number, totalContributions: number, calculationType: string) => {
    const recommendations = [];
    
    if (interestRate > 10) {
      recommendations.push('High interest rate offers excellent growth potential');
      recommendations.push('Consider the risk level of high-return investments');
      recommendations.push('Diversify to manage risk while maintaining growth');
    } else if (interestRate > 6) {
      recommendations.push('Moderate interest rate provides steady growth');
      recommendations.push('Consider balanced investment approach');
      recommendations.push('Review your risk tolerance and investment goals');
    } else {
      recommendations.push('Conservative interest rate with lower risk');
      recommendations.push('Consider if returns meet your financial goals');
      recommendations.push('Evaluate inflation impact on real returns');
    }
    
    if (calculationType === 'annuity') {
      recommendations.push('Consider increasing regular contributions');
      recommendations.push('Set up automatic contributions for consistency');
      recommendations.push('Review contribution limits for tax-advantaged accounts');
    }
    
    if (calculationType === 'growing-annuity') {
      recommendations.push('Ensure growth rate assumptions are realistic');
      recommendations.push('Consider economic conditions affecting growth');
      recommendations.push('Review historical growth patterns');
    }
    
    recommendations.push('Start investing early to maximize compound interest');
    recommendations.push('Consider tax-advantaged retirement accounts');
    recommendations.push('Review and rebalance your portfolio regularly');
    
    return recommendations;
  };

  const getWarningSigns = (interestRate: number, futureValue: number, totalContributions: number) => {
    const signs = [];
    
    if (interestRate > 20) {
      signs.push('Very high interest rate may indicate unrealistic expectations');
      signs.push('Consider if the risk is appropriately assessed');
      signs.push('Review market conditions and comparable investments');
    }
    
    if (interestRate < 2) {
      signs.push('Very low interest rate may not keep pace with inflation');
      signs.push('Consider higher-return investment options');
      signs.push('Review your investment strategy and goals');
    }
    
    signs.push('Not accounting for inflation in return expectations');
    signs.push('Ignoring the impact of fees on returns');
    signs.push('Not considering tax implications of investment gains');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.futureValue, calculation.totalContributions, values.interestRate!),
      recommendations: getRecommendations(values.interestRate!, calculation.futureValue, calculation.totalContributions, values.calculationType!),
      warningSigns: getWarningSigns(values.interestRate!, calculation.futureValue, calculation.totalContributions),
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
            Future Value Calculation
          </CardTitle>
          <CardDescription>
            Calculate the future value of your investments and savings
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
                      name="interestRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Interest Rate (%)
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
                    Investment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="presentValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Present Value (for single amount)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 10000" 
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
                    <FormField 
                      control={form.control} 
                      name="additionalContributions" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            Additional Annual Contributions
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 1000" 
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
                Calculate Future Value
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
                  <CardDescription>Future value analysis and growth projections</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.futureValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total value at end of period
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Contributions</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.totalContributions.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Amount you contributed
                  </p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    ${result.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interest earned
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
                    Growth Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Contribution</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.contribution.toLocaleString()}</td>
                            <td className="text-right p-2">${year.interest.toLocaleString()}</td>
                            <td className="text-right p-2">${year.balance.toLocaleString()}</td>
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
              Understanding Future Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Future Value?</h4>
              <p className="text-muted-foreground">
                Future value is the value of an investment or cash flow at a specific date in the future, based on an assumed rate of growth. It shows how much your money will be worth after earning interest or returns over time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Compound Interest</h4>
              <p className="text-muted-foreground">
                Compound interest is interest calculated on the initial principal and accumulated interest from previous periods. It's the key to building wealth over time, as your returns generate their own returns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Time Value of Money</h4>
              <p className="text-muted-foreground">
                The time value of money principle states that money available today is worth more than the same amount in the future due to its potential earning capacity. This is why starting to invest early is so powerful.
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
                  <a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">
                    Retirement Savings Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your retirement with comprehensive projections
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/sip-calculator" className="text-primary hover:underline">
                    SIP/DCA Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate systematic investment returns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Future Value (FV) Calculation, Compounding, and Investment Growth" />
    <meta itemProp="description" content="An expert guide detailing the Future Value (FV) formula, its core role in the Time Value of Money (TVM), calculating the growth of a lump sum versus a series of payments (annuity), and its application in retirement and financial goal setting." />
    <meta itemProp="keywords" content="future value formula explained, compounding cash flows, FV of a lump sum, FV of an annuity, time value of money, investment growth projection, effective annual rate (EAR)" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-future-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Future Value (FV): Projecting Investment Growth Over Time</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental concept that quantifies the value of an investment at a specific point in the future, given a constant rate of return.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#tvm-compounding" className="hover:underline">The Principle of Compounding and Time Value of Money (TVM)</a></li>
        <li><a href="#lump-sum-fv" className="hover:underline">FV Calculation for a Single Lump Sum</a></li>
        <li><a href="#annuity-fv" className="hover:underline">FV Calculation for an Annuity (Stream of Payments)</a></li>
        <li><a href="#frequency" className="hover:underline">The Critical Role of Compounding Frequency</a></li>
        <li><a href="#applications" className="hover:underline">Real-World Applications of Future Value</a></li>
    </ul>
<hr />

    {/* THE PRINCIPLE OF COMPOUNDING AND TIME VALUE OF MONEY (TVM) */}
    <h2 id="tvm-compounding" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Principle of Compounding and Time Value of Money (TVM)</h2>
    <p>The concept of <strong className="font-semibold">Future Value (FV)</strong> is the forward-looking counterpart to Present Value (PV) and is a core calculation within the <strong className="font-semibold">Time Value of Money (TVM)</strong> principle. FV quantifies how much a sum of money invested today will be worth at a specified date in the future, assuming it earns a constant rate of return (r).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Compounding: The Engine of FV</h3>
    <p>FV relies entirely on <strong className="font-semibold">compounding</strong>—the process where interest earned in one period is added to the principal, and in the next period, interest is earned on that new, larger principal. This geometric growth is why an investment's value grows exponentially rather than linearly over time.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components of FV Calculation</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Present Value (PV):</strong> The initial lump sum amount invested (or the value today).</li>
        <li><strong className="font-semibold">Rate (r):</strong> The periodic interest rate or expected return rate (must be the rate per compounding period).</li>
        <li><strong className="font-semibold">Number of Periods (t):</strong> The total number of compounding periods (e.g., 20 years multiplied by 12 months/year = 240 periods).</li>
    </ul>

<hr />

    {/* FV CALCULATION FOR A SINGLE LUMP SUM */}
    <h2 id="lump-sum-fv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FV Calculation for a Single Lump Sum</h2>
    <p>This formula calculates the future worth of a single, one-time investment made today. It isolates the effect of compounding over the investment period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Single Cash Flow Formula</h3>
    <p>The formula projects the Present Value (PV) forward using the periodic rate (r) and the number of periods (t):</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FV = PV * (1 + r)^t'}
        </p>
    </div>

    <p>Where (1 + r) raised to the power of t is known as the **Future Value Interest Factor (FVIF)**. This factor is the multiplier that quantifies the growth due to compounding.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example: Long-Term Growth</h3>
    <p>If 10,000 dollars are invested today (PV) at an annual 8 percent return (r) for 30 years (t), the FV calculation shows the exponential power of time. The longer the duration (t), the faster the final value grows, as the compounding effect dominates the initial principal.</p>

<hr />

    {/* FV CALCULATION FOR AN ANNUITY (STREAM OF PAYMENTS) */}
    <h2 id="annuity-fv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FV Calculation for an Annuity (Stream of Payments)</h2>
    <p>When an individual makes a series of equal, regular payments (PMT), such as monthly contributions to a retirement account, the total future value is calculated using the <strong className="font-semibold">Future Value of an Annuity (FVA)</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Ordinary Annuity Formula (Payments at End of Period)</h3>
    <p>This formula calculates the future value assuming contributions are made at the end of each compounding period (common for mutual fund SIPs or retirement payroll deductions):</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FV_Ordinary = PMT * [ ((1 + r)^t - 1) / r ]'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annuity Due Adjustment (Payments at Beginning of Period)</h3>
    <p>If contributions are made at the beginning of the period (Annuity Due), the payments compound for one extra period. This results in a higher FV. The adjustment is simple:</p>
    <div className="overflow-x-auto my-4 p-2 bg-gray-50 border rounded-lg inline-block">
        <p className="font-mono text-lg text-red-700 font-bold">
            {'FV_Due = FV_Ordinary * (1 + r)'}
        </p>
    </div>
    <p>The FVA calculation is the foundation for determining the feasibility of retirement savings goals.</p>

<hr />

    {/* THE CRITICAL ROLE OF COMPOUNDING FREQUENCY */}
    <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Compounding Frequency</h2>
    <p>The frequency with which interest is compounded (e.g., annually, quarterly, or daily) significantly impacts the final Future Value. The higher the frequency, the greater the growth, which is measured by the <strong className="font-semibold">Effective Annual Rate (EAR)</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Frequency Adjustment</h3>
    <p>When compounding occurs $m$ times per year, the annual nominal rate and the number of years ($Y$) must be adjusted in the single lump sum formula:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FV = PV * (1 + R_nom/m)^(Y * m)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Effective Annual Rate (EAR)</h3>
    <p>The **Effective Annual Rate (EAR)** (or Annual Percentage Yield, APY) reflects the true annual return received after accounting for compounding. The more frequently compounding occurs, the higher the EAR will be relative to the stated nominal rate, leading to a higher final Future Value.</p>

<hr />

    {/* REAL-WORLD APPLICATIONS OF FUTURE VALUE */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real-World Applications of Future Value</h2>
    <p>FV calculations are indispensable for forecasting and establishing realistic financial targets across a range of activities:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Retirement Planning</h3>
    <p>FV is used to project the balance of a retirement account (401k, IRA) at the expected retirement age. This projection confirms if the current savings rate (PMT) and expected return (r) are sufficient to meet the **Target Retirement Corpus**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. College Savings</h3>
    <p>Parents use FVA to determine the necessary monthly contributions to fund future tuition costs, adjusting the required final value for projected inflation (the difference between nominal and real future value).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Capital Budgeting</h3>
    <p>While Present Value (PV) is the primary tool for capital budgeting (NPV), firms use FV to forecast the value of reinvested cash flows, helping to compare mutually exclusive investment opportunities at a common terminal date.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Future Value is the definitive measure used to quantify the exponential power of compounding over time. It allows investors to project the growth of single investments and systematic contributions, translating immediate actions into long-term wealth outcomes.</p>
    <p>Mastery of the FV and FVA formulas is key to disciplined financial planning, providing the necessary mathematical certainty to set achievable retirement goals and understand the profound non-linear benefit of starting to invest early.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about future value and compound interest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How does compounding frequency affect future value?</h4>
              <p className="text-muted-foreground">
                More frequent compounding (monthly vs. annual) results in higher future values for the same interest rate and time period. This is because interest is calculated and added more frequently, allowing for more compound growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between simple and compound interest?</h4>
              <p className="text-muted-foreground">
                Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus previously earned interest. Compound interest grows exponentially over time, while simple interest grows linearly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How important is the interest rate in future value calculations?</h4>
              <p className="text-muted-foreground">
                The interest rate is crucial in future value calculations. Even small differences in rates can result in dramatically different outcomes over long periods. A 1% difference in annual return can mean hundreds of thousands of dollars over 30 years.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I focus on higher returns or more time?</h4>
              <p className="text-muted-foreground">
                Both are important, but time is often more powerful than high returns. Starting early with moderate returns often beats starting late with high returns. However, the best strategy combines both: start early and seek reasonable returns while managing risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I account for inflation in future value calculations?</h4>
              <p className="text-muted-foreground">
                To account for inflation, use real (inflation-adjusted) interest rates instead of nominal rates. Subtract the expected inflation rate from your nominal return rate. This gives you the purchasing power of your future value in today's dollars.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}