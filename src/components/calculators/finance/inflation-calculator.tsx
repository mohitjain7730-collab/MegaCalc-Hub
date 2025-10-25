'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, DollarSign, Target, Info, AlertCircle, Calendar, BarChart, PiggyBank, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentAmount: z.number().min(0).optional(),
  inflationRate: z.number().min(0).max(50).optional(),
  timePeriod: z.number().min(1).max(100).optional(),
  calculationType: z.enum(['purchasing-power', 'future-value', 'real-return', 'salary-adjustment']).optional(),
  currentSalary: z.number().min(0).optional(),
  investmentReturn: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InflationCalculator() {
  const [result, setResult] = useState<{ 
    futureValue: number;
    purchasingPower: number;
    realReturn: number;
    salaryNeeded: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; value: number; purchasingPower: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAmount: undefined, 
      inflationRate: undefined,
      timePeriod: undefined, 
      calculationType: undefined,
      currentSalary: undefined,
      investmentReturn: undefined
    } 
  });

  const calculatePurchasingPower = (amount: number, inflationRate: number, years: number) => {
    const futureValue = amount * Math.pow(1 + inflationRate / 100, years);
    const purchasingPower = amount; // What you can buy today
    return { futureValue, purchasingPower };
  };

  const calculateFutureValue = (amount: number, inflationRate: number, years: number) => {
    return amount * Math.pow(1 + inflationRate / 100, years);
  };

  const calculateRealReturn = (nominalReturn: number, inflationRate: number) => {
    return ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
  };

  const calculateSalaryAdjustment = (currentSalary: number, inflationRate: number, years: number) => {
    return currentSalary * Math.pow(1 + inflationRate / 100, years);
  };

  const calculate = (v: FormValues) => {
    if (v.currentAmount == null || v.inflationRate == null || v.timePeriod == null || v.calculationType == null) return null;
    
    const yearByYear = [];
    for (let year = 0; year <= v.timePeriod; year++) {
      const futureValue = v.currentAmount * Math.pow(1 + v.inflationRate / 100, year);
      const purchasingPower = v.currentAmount; // Constant purchasing power
      yearByYear.push({ year, value: futureValue, purchasingPower });
    }
    
    let futureValue = 0;
    let purchasingPower = 0;
    let realReturn = 0;
    let salaryNeeded = 0;
    
    switch (v.calculationType) {
      case 'purchasing-power':
        futureValue = calculateFutureValue(v.currentAmount, v.inflationRate, v.timePeriod);
        purchasingPower = v.currentAmount;
        break;
      case 'future-value':
        futureValue = calculateFutureValue(v.currentAmount, v.inflationRate, v.timePeriod);
        purchasingPower = v.currentAmount;
        break;
      case 'real-return':
        if (v.investmentReturn == null) return null;
        realReturn = calculateRealReturn(v.investmentReturn, v.inflationRate);
        futureValue = v.currentAmount * Math.pow(1 + v.investmentReturn / 100, v.timePeriod);
        purchasingPower = v.currentAmount * Math.pow(1 + realReturn / 100, v.timePeriod);
        break;
      case 'salary-adjustment':
        if (v.currentSalary == null) return null;
        salaryNeeded = calculateSalaryAdjustment(v.currentSalary, v.inflationRate, v.timePeriod);
        futureValue = salaryNeeded;
        purchasingPower = v.currentSalary;
        break;
    }
    
    return { 
      futureValue, 
      purchasingPower, 
      realReturn, 
      salaryNeeded,
      yearByYear: yearByYear.slice(0, 11) // Show first 11 years
    };
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'purchasing-power': return 'Purchasing Power Analysis';
      case 'future-value': return 'Future Value Calculation';
      case 'real-return': return 'Real Return Analysis';
      case 'salary-adjustment': return 'Salary Adjustment Analysis';
      default: return 'Inflation Analysis';
    }
  };

  const interpret = (inflationRate: number, timePeriod: number, calculationType: string) => {
    if (inflationRate > 10) return 'High inflation rate—consider inflation-protected investments and salary negotiations.';
    if (inflationRate > 5) return 'Moderate inflation rate—plan for rising costs and consider inflation hedging.';
    if (inflationRate > 2) return 'Normal inflation rate—standard planning applies.';
    return 'Low inflation rate—focus on growth investments and long-term planning.';
  };

  const getRecommendations = (inflationRate: number, calculationType: string, realReturn: number) => {
    const recommendations = [];
    
    if (calculationType === 'purchasing-power' || calculationType === 'future-value') {
      recommendations.push('Invest in assets that historically outpace inflation (stocks, real estate)');
      recommendations.push('Consider Treasury Inflation-Protected Securities (TIPS)');
      recommendations.push('Diversify investments across different asset classes');
      recommendations.push('Review and adjust your investment strategy regularly');
    }
    
    if (calculationType === 'real-return') {
      if (realReturn < 0) {
        recommendations.push('Your investments are losing purchasing power');
        recommendations.push('Consider higher-return investments or risk tolerance');
        recommendations.push('Review your investment allocation and strategy');
      } else {
        recommendations.push('Good real return—maintain current strategy');
        recommendations.push('Continue regular rebalancing');
      }
    }
    
    if (calculationType === 'salary-adjustment') {
      recommendations.push('Negotiate salary increases to keep pace with inflation');
      recommendations.push('Develop additional skills to increase earning potential');
      recommendations.push('Consider career advancement opportunities');
      recommendations.push('Build multiple income streams');
    }
    
    recommendations.push('Build emergency fund to cover 3-6 months of expenses');
    recommendations.push('Consider inflation when setting financial goals');
    recommendations.push('Review and update your financial plan annually');
    
    return recommendations;
  };

  const getWarningSigns = (inflationRate: number, calculationType: string, realReturn: number) => {
    const signs = [];
    
    if (inflationRate > 10) {
      signs.push('Very high inflation can erode savings quickly');
      signs.push('Cash and low-yield investments lose value rapidly');
      signs.push('Fixed-income investments may not keep pace');
    }
    
    if (calculationType === 'real-return' && realReturn < 0) {
      signs.push('Negative real return means losing purchasing power');
      signs.push('Consider changing investment strategy');
      signs.push('Review risk tolerance and return expectations');
    }
    
    signs.push('Not accounting for inflation in long-term planning');
    signs.push('Keeping too much money in low-yield savings accounts');
    signs.push('Not adjusting salary expectations for inflation');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(values.inflationRate!, values.timePeriod!, values.calculationType!),
      recommendations: getRecommendations(values.inflationRate!, values.calculationType!, calculation.realReturn),
      warningSigns: getWarningSigns(values.inflationRate!, values.calculationType!, calculation.realReturn),
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
            Inflation Analysis
          </CardTitle>
          <CardDescription>
            Calculate the impact of inflation on your money and investments
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="currentAmount" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Current Amount
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
                      name="inflationRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Annual Inflation Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 3.5" 
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
                              step="1" 
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
                              <option value="purchasing-power">Purchasing Power Analysis</option>
                              <option value="future-value">Future Value Calculation</option>
                              <option value="real-return">Real Return Analysis</option>
                              <option value="salary-adjustment">Salary Adjustment</option>
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
                    <PiggyBank className="h-5 w-5 text-blue-600" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="currentSalary" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Current Salary (for salary adjustment)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 50000" 
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
                      name="investmentReturn" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Investment Return (%) (for real return)
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
                  </div>
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Inflation Impact
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
                  <CardDescription>Inflation impact analysis and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.futureValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nominal value in the future
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Purchasing Power</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.purchasingPower.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    What you can buy today
                  </p>
                </div>
              </div>

              {result.realReturn !== 0 && (
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Real Return</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.realReturn.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inflation-adjusted return
                  </p>
                </div>
              )}

              {result.salaryNeeded > 0 && (
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-muted-foreground">Salary Needed</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${result.salaryNeeded.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To maintain current purchasing power
                  </p>
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
                    Year-by-Year Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Future Value</th>
                          <th className="text-right p-2">Purchasing Power</th>
                          <th className="text-right p-2">Inflation Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.value.toLocaleString()}</td>
                            <td className="text-right p-2">${year.purchasingPower.toLocaleString()}</td>
                            <td className="text-right p-2">${(year.value - year.purchasingPower).toLocaleString()}</td>
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
                        Inflation Protection Strategies
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
              Understanding Inflation and Its Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Inflation?</h4>
              <p className="text-muted-foreground">
                Inflation is the rate at which the general level of prices for goods and services rises, resulting in a decrease in purchasing power. It's measured as an annual percentage increase in the Consumer Price Index (CPI).
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Purchasing Power vs Future Value</h4>
              <p className="text-muted-foreground">
                Future value shows the nominal amount your money will be worth, while purchasing power shows what you can actually buy with that money. Inflation erodes purchasing power over time.
              </p>
              </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Real Return</h4>
              <p className="text-muted-foreground">
                Real return is your investment return adjusted for inflation. It shows whether your investments are actually growing your wealth or just keeping pace with rising prices.
              </p>
              </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Inflation Protection Strategies</h4>
              <p className="text-muted-foreground">
                Protect against inflation by investing in assets that historically outpace inflation (stocks, real estate), using inflation-protected securities (TIPS), and ensuring your income keeps pace with inflation.
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
                  <a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">
                    Real Rate of Return Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate inflation-adjusted returns
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
    <meta itemProp="name" content="The Definitive Guide to Inflation Calculation, Purchasing Power, and Future Value" />
    <meta itemProp="description" content="An expert guide detailing the inflation rate formula, the concept of purchasing power, how to calculate future value and required nominal return to preserve wealth, and the role of the Consumer Price Index (CPI)." />
    <meta itemProp="keywords" content="inflation rate formula explained, purchasing power calculation, future value of money with inflation, real vs nominal return, consumer price index (CPI), inflation adjustment methods, cost of living increase" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-inflation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Inflation: Calculating the Erosion of Purchasing Power</h1>
    <p className="text-lg italic text-gray-700">Master the formulas that quantify the rate at which the value of currency decreases, and how to project the true cost of future expenses.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Inflation: Core Definition and Key Measurement Tools</a></li>
        <li><a href="#future-value" className="hover:underline">Calculating Future Value (FV) with Inflation</a></li>
        <li><a href="#purchasing-power" className="hover:underline">The Erosion of Purchasing Power (PV)</a></li>
        <li><a href="#real-return" className="hover:underline">Nominal vs. Real Rate of Return</a></li>
        <li><a href="#economic-impact" className="hover:underline">Economic Types of Inflation and Financial Impact</a></li>
    </ul>
<hr />

    {/* INFLATION: CORE DEFINITION AND KEY MEASUREMENT TOOLS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Inflation: Core Definition and Key Measurement Tools</h2>
    <p><strong className="font-semibold">Inflation</strong> is the sustained increase in the general price level of goods and services in an economy over a period of time. As the price level rises, each unit of currency buys fewer goods and services, meaning inflation directly causes a decrease in <strong className="font-semibold">purchasing power</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring the Inflation Rate</h3>
    <p>Inflation is quantified using a price index, most commonly the <strong className="font-semibold">Consumer Price Index (CPI)</strong>. The CPI measures the average change in prices paid by urban consumers for a basket of consumer goods and services (e.g., food, housing, medical care, transportation). The inflation rate is calculated as the percentage change in the index over two specific time periods:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Inflation Rate = [(CPI_End - CPI_Start) / CPI_Start]'}
        </p>
    </div>
<hr />

    {/* CALCULATING FUTURE VALUE (FV) WITH INFLATION */}
    <h2 id="future-value" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Future Value (FV) with Inflation</h2>
    <p>A primary function of inflation analysis is to determine the future cost of an item or service. This calculation is essential for long-term planning, such as estimating future retirement expenses, college tuition, or the replacement cost of capital goods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Future Cost Projection Formula</h3>
    <p>The calculation is similar to compound interest, but instead of using a rate of return, it uses the assumed inflation rate (i) to project the current price (Present Value, PV) over a period (t):</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Future Cost = PV_Today * (1 + i)^t'}
        </p>
    </div>
    <p>For example, a service costing $100 today will cost $100 \times (1.03)^{10} \approx \$134.39$ in ten years, assuming a consistent 3% annual inflation rate. This simple compound calculation reveals the magnitude of the rising cost of living.</p>

<hr />

    {/* THE EROSION OF PURCHASING POWER (PV) */}
    <h2 id="purchasing-power" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Erosion of Purchasing Power (PV)</h2>
    <p>While the Future Value calculation looks forward to a future cost, the <strong className="font-semibold">Purchasing Power</strong> calculation looks backward to see how much a fixed sum of money is worth in today's (discounted) terms, after being eroded by inflation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating the Discounted Value</h3>
    <p>This is mathematically the reverse of the Future Value calculation. It determines the equivalent purchasing power of a future sum in current dollars:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Purchasing Power = FV / (1 + i)^t'}
        </p>
    </div>
    <p>A retirement corpus of 1,000,000 to be received in 30 years must be discounted by the inflation rate (i) to reveal its true value in today’s buying power. This exercise exposes the inadequacy of saving amounts based on today's dollar figures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Rule of 70</h3>
    <p>The <strong className="font-semibold">Rule of 70</strong> provides a quick estimate for how long it takes for the purchasing power of money to be cut in half due to inflation:</p>
    <div className="overflow-x-auto my-4 p-2 bg-gray-50 border rounded-lg inline-block">
        <p className="font-mono text-lg text-red-700 font-bold">
            {'Years to Halve Value = 70 / Inflation Rate (in percent)'}
        </p>
    </div>
    <p>At a 3.5% inflation rate, the purchasing power of your money is halved in just 70 / 3.5 = 20 years.</p>

<hr />

    {/* NOMINAL VS. REAL RATE OF RETURN */}
    <h2 id="real-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Nominal vs. Real Rate of Return</h2>
    <p>The primary goal of investment is to achieve a positive <strong className="font-semibold">real return</strong>, meaning the investment growth rate must exceed the inflation rate. Financial planning relies on converting nominal figures into real, inflation-adjusted figures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fisher Equation (Approximation)</h3>
    <p>The relationship between the nominal return, real return, and inflation is approximated by the Fisher Equation:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Real Rate ≈ Nominal Rate - Inflation Rate'}
        </p>
    </div>
    <p>If an investment yields a 7% nominal return, but inflation is 3%, the real rate of return is only 4%. If the nominal return is 2% and inflation is 3%, the investment has yielded a negative 1% real return, and the investor has lost purchasing power.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Exact Fisher Equation</h3>
    <p>For precise financial modeling, the exact formula is used:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Real Rate = [(1 + Nominal Rate) / (1 + Inflation Rate)] - 1'}
        </p>
    </div>
    <p>Using the real rate is crucial for retirement and financial independence models, as it allows all calculations (future expenses and required savings) to be performed in constant, present-day dollars, simplifying the planning process.</p>

<hr />

    {/* ECONOMIC TYPES OF INFLATION AND FINANCIAL IMPACT */}
    <h2 id="economic-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Economic Types of Inflation and Financial Impact</h2>
    <p>Inflation is categorized by its underlying economic cause, which influences how policymakers (central banks) respond and how investors should position their assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Inflation</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Demand-Pull Inflation:</strong> Occurs when aggregate demand in an economy outpaces aggregate supply (too much money chasing too few goods). This is a sign of a strong, growing economy, often prompting interest rate hikes.</li>
        <li><strong className="font-semibold">Cost-Push Inflation:</strong> Occurs when overall prices increase (inflation) due to increases in the cost of wages and raw materials (e.g., oil price shocks). This can lead to stagflation (high inflation and low growth).</li>
        <li><strong className="font-semibold">Hyperinflation:</strong> Extremely rapid, often accelerating, inflation, typically defined as monthly inflation exceeding 50%. This causes a complete collapse in public confidence in the currency.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Inflation's Impact on Financial Instruments</h3>
    <p>Inflation is a transfer of wealth. It punishes holders of cash and fixed-income assets while benefiting debtors and owners of real assets:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Negative Impact:</strong> Bonds (fixed coupons lose value), cash (purchasing power erodes), and long-term debt (if the rate is fixed).</li>
        <li><strong className="font-semibold">Positive Impact:</strong> Real estate (asset value appreciates), stocks (companies can raise prices), and debt (the principal owed is repaid with cheaper future dollars).</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Inflation is not merely a rising cost, but a quantifiable decrease in currency value. Understanding the compounding effect of inflation on future expenses is essential for any long-term financial strategy.</p>
    <p>Financial mastery requires utilizing the Future Value formula to accurately forecast costs and, critically, ensuring investment returns consistently exceed the inflation rate. By calculating the <strong className="font-semibold">real rate of return</strong>, individuals can confirm that they are truly growing their purchasing power and not just their nominal account balances.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about inflation and its impact on finances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a normal inflation rate?</h4>
              <p className="text-muted-foreground">
                The Federal Reserve targets an inflation rate of about 2% per year. Historically, inflation has averaged around 3-4% annually in the US. Rates above 5% are considered high, while rates below 1% are considered low.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect my savings?</h4>
              <p className="text-muted-foreground">
                Inflation erodes the purchasing power of your savings over time. If your savings earn less than the inflation rate, you're actually losing money in real terms. This is why investing is important for long-term wealth building.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What investments protect against inflation?</h4>
              <p className="text-muted-foreground">
                Stocks, real estate, commodities, and Treasury Inflation-Protected Securities (TIPS) historically provide inflation protection. Diversification across these asset classes helps protect against inflation while maintaining growth potential.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I worry about inflation in my retirement planning?</h4>
              <p className="text-muted-foreground">
                Yes, inflation is crucial in retirement planning. Your retirement income needs to keep pace with inflation, or your purchasing power will decline over time. Consider inflation-adjusted annuities and growth investments in your retirement portfolio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect my salary?</h4>
              <p className="text-muted-foreground">
                If your salary doesn't increase at least as fast as inflation, you're effectively taking a pay cut in real terms. This is why salary negotiations and career advancement are important for maintaining your standard of living.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can inflation be good for me?</h4>
              <p className="text-muted-foreground">
                Moderate inflation can be beneficial if you have fixed-rate debt (like mortgages), as the real value of your debt decreases over time. However, high inflation generally hurts consumers and can destabilize the economy.
              </p>
            </div>
          </CardContent>
        </Card>
              </div>
    </div>
  );
}