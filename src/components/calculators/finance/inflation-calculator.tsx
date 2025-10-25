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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Complete Guide to Inflation and Financial Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Inflation: The Silent Wealth Eroder</h3>
            <p>Inflation is the gradual increase in prices over time, which reduces the purchasing power of your money. While moderate inflation (2-3%) is normal and even healthy for economic growth, it can significantly impact your long-term financial goals if not properly planned for.</p>
            
            <h3>The Time Value of Money: Why Inflation Matters</h3>
            <p>Inflation affects every aspect of your financial life, from the cost of groceries to the value of your savings. A dollar today will buy less in the future due to inflation. This is why simply saving money in a low-yield account isn't enough to build long-term wealth.</p>
            
            <h3>Inflation-Protected Investing: Building Real Wealth</h3>
            <p>To combat inflation, you need investments that historically outpace inflation rates. Stocks, real estate, and commodities have historically provided returns above inflation. Treasury Inflation-Protected Securities (TIPS) are specifically designed to protect against inflation.</p>
            
            <h3>Salary and Income Planning: Keeping Up with Rising Costs</h3>
            <p>Your income needs to keep pace with inflation to maintain your standard of living. This means negotiating regular raises, developing skills that increase your earning potential, and potentially changing jobs or careers to stay ahead of inflation.</p>
            
            <h3>Retirement Planning: The Long-Term Inflation Challenge</h3>
            <p>Inflation is particularly challenging for retirement planning because it compounds over decades. A retirement income that seems adequate today may be insufficient in 20-30 years. Plan for inflation by using growth investments and considering inflation-adjusted retirement income sources.</p>
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