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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Complete Guide to Future Value and Compound Interest
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Compound Interest: The Eighth Wonder of the World</h3>
            <p>Compound interest is often called the eighth wonder of the world because of its incredible power to grow wealth over time. It's the process where your investment returns generate their own returns, creating exponential growth that can turn modest savings into substantial wealth.</p>
            
            <h3>The Power of Time in Investment Growth</h3>
            <p>Time is the most powerful factor in investment growth. Starting to invest just a few years earlier can result in dramatically different outcomes due to compound interest. The longer your money has to grow, the more powerful the compound effect becomes.</p>
            
            <h3>Regular Contributions: Building Wealth Consistently</h3>
            <p>Regular contributions to your investments, whether monthly or annually, can significantly boost your future value. Even small, consistent contributions can grow into substantial sums over time, especially when combined with compound interest.</p>
            
            <h3>Investment Strategies for Maximum Growth</h3>
            <p>To maximize your future value, focus on consistent contributions, appropriate risk management, and long-term thinking. Consider tax-advantaged accounts, diversify your investments, and avoid trying to time the market. The key is staying invested and letting compound interest work its magic.</p>
            
            <h3>Real-World Applications of Future Value</h3>
            <p>Future value calculations help you plan for retirement, education expenses, major purchases, and other financial goals. They show you how much you need to save and invest to reach your targets, and help you make informed decisions about your financial future.</p>
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