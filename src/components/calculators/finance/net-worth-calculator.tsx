'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Info, AlertCircle, Target, Building, Car, PiggyBank, CreditCard, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  liquidAssets: z.number().min(0).optional(),
  investmentAssets: z.number().min(0).optional(),
  realEstateValue: z.number().min(0).optional(),
  vehicleValue: z.number().min(0).optional(),
  otherAssets: z.number().min(0).optional(),
  mortgageDebt: z.number().min(0).optional(),
  creditCardDebt: z.number().min(0).optional(),
  studentLoanDebt: z.number().min(0).optional(),
  autoLoanDebt: z.number().min(0).optional(),
  otherDebt: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetWorthCalculator() {
  const [result, setResult] = useState<{ 
    totalAssets: number; 
    totalLiabilities: number;
    netWorth: number;
    interpretation: string;
    financialHealth: string;
    recommendations: string[];
    warningSigns: string[];
    assetBreakdown: { category: string; amount: number; percentage: number }[];
    liabilityBreakdown: { category: string; amount: number; percentage: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liquidAssets: undefined, 
      investmentAssets: undefined, 
      realEstateValue: undefined, 
      vehicleValue: undefined, 
      otherAssets: undefined,
      mortgageDebt: undefined,
      creditCardDebt: undefined,
      studentLoanDebt: undefined,
      autoLoanDebt: undefined,
      otherDebt: undefined
    } 
  });

  const calculate = (v: FormValues) => {
    const totalAssets = (v.liquidAssets || 0) + (v.investmentAssets || 0) + (v.realEstateValue || 0) + (v.vehicleValue || 0) + (v.otherAssets || 0);
    const totalLiabilities = (v.mortgageDebt || 0) + (v.creditCardDebt || 0) + (v.studentLoanDebt || 0) + (v.autoLoanDebt || 0) + (v.otherDebt || 0);
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  };

  const interpret = (netWorth: number, totalAssets: number, totalLiabilities: number) => {
    if (netWorth < 0) return 'Negative net worth—focus on debt reduction and building emergency fund.';
    if (netWorth < totalAssets * 0.1) return 'Low net worth—prioritize debt payoff and asset building.';
    if (netWorth < totalAssets * 0.3) return 'Moderate net worth—good foundation, continue building wealth.';
    return 'Strong net worth—excellent financial position, focus on wealth preservation and growth.';
  };

  const getFinancialHealth = (netWorth: number, totalAssets: number) => {
    if (netWorth < 0) return 'Critical';
    if (netWorth < totalAssets * 0.1) return 'Poor';
    if (netWorth < totalAssets * 0.3) return 'Fair';
    if (netWorth < totalAssets * 0.5) return 'Good';
    return 'Excellent';
  };

  const getRecommendations = (netWorth: number, totalAssets: number, totalLiabilities: number) => {
    const recommendations = [];
    
    if (netWorth < 0) {
      recommendations.push('Create emergency fund of $1,000 immediately');
      recommendations.push('Stop all non-essential spending');
      recommendations.push('Focus on highest interest debt first');
      recommendations.push('Consider debt consolidation if rates are favorable');
      recommendations.push('Increase income through side hustles or job change');
    } else if (netWorth < totalAssets * 0.1) {
      recommendations.push('Build 3-6 months emergency fund');
      recommendations.push('Pay off high-interest debt aggressively');
      recommendations.push('Start investing in low-cost index funds');
      recommendations.push('Track spending and create budget');
    } else if (netWorth < totalAssets * 0.3) {
      recommendations.push('Maximize retirement contributions');
      recommendations.push('Diversify investment portfolio');
      recommendations.push('Consider real estate investment');
      recommendations.push('Review and optimize insurance coverage');
    } else {
      recommendations.push('Focus on tax-efficient investing strategies');
      recommendations.push('Consider estate planning');
      recommendations.push('Explore alternative investments');
      recommendations.push('Maintain asset allocation balance');
    }

    return recommendations;
  };

  const getWarningSigns = (netWorth: number, totalLiabilities: number) => {
    const signs = [];
    
    if (netWorth < 0) {
      signs.push('Negative net worth indicates financial distress');
      signs.push('High debt-to-asset ratio is unsustainable');
      signs.push('Lack of emergency fund creates vulnerability');
      signs.push('Credit score likely suffering from high debt');
    } else {
      signs.push('High credit card balances relative to income');
      signs.push('Missing or inadequate insurance coverage');
      signs.push('No emergency fund or less than 3 months expenses');
      signs.push('All assets in one category (lack of diversification)');
    }

    return signs;
  };

  const getAssetBreakdown = (v: FormValues, totalAssets: number) => {
    const breakdown = [];
    if (v.liquidAssets && v.liquidAssets > 0) breakdown.push({ category: 'Liquid Assets', amount: v.liquidAssets, percentage: (v.liquidAssets / totalAssets) * 100 });
    if (v.investmentAssets && v.investmentAssets > 0) breakdown.push({ category: 'Investments', amount: v.investmentAssets, percentage: (v.investmentAssets / totalAssets) * 100 });
    if (v.realEstateValue && v.realEstateValue > 0) breakdown.push({ category: 'Real Estate', amount: v.realEstateValue, percentage: (v.realEstateValue / totalAssets) * 100 });
    if (v.vehicleValue && v.vehicleValue > 0) breakdown.push({ category: 'Vehicles', amount: v.vehicleValue, percentage: (v.vehicleValue / totalAssets) * 100 });
    if (v.otherAssets && v.otherAssets > 0) breakdown.push({ category: 'Other Assets', amount: v.otherAssets, percentage: (v.otherAssets / totalAssets) * 100 });
    return breakdown;
  };

  const getLiabilityBreakdown = (v: FormValues, totalLiabilities: number) => {
    const breakdown = [];
    if (v.mortgageDebt && v.mortgageDebt > 0) breakdown.push({ category: 'Mortgage', amount: v.mortgageDebt, percentage: (v.mortgageDebt / totalLiabilities) * 100 });
    if (v.creditCardDebt && v.creditCardDebt > 0) breakdown.push({ category: 'Credit Cards', amount: v.creditCardDebt, percentage: (v.creditCardDebt / totalLiabilities) * 100 });
    if (v.studentLoanDebt && v.studentLoanDebt > 0) breakdown.push({ category: 'Student Loans', amount: v.studentLoanDebt, percentage: (v.studentLoanDebt / totalLiabilities) * 100 });
    if (v.autoLoanDebt && v.autoLoanDebt > 0) breakdown.push({ category: 'Auto Loans', amount: v.autoLoanDebt, percentage: (v.autoLoanDebt / totalLiabilities) * 100 });
    if (v.otherDebt && v.otherDebt > 0) breakdown.push({ category: 'Other Debt', amount: v.otherDebt, percentage: (v.otherDebt / totalLiabilities) * 100 });
    return breakdown;
  };

  const onSubmit = (values: FormValues) => {
    const { totalAssets, totalLiabilities, netWorth } = calculate(values);
    if (totalAssets === 0 && totalLiabilities === 0) { setResult(null); return; }
    
    setResult({ 
      totalAssets, 
      totalLiabilities,
      netWorth,
      interpretation: interpret(netWorth, totalAssets, totalLiabilities),
      financialHealth: getFinancialHealth(netWorth, totalAssets),
      recommendations: getRecommendations(netWorth, totalAssets, totalLiabilities),
      warningSigns: getWarningSigns(netWorth, totalLiabilities),
      assetBreakdown: getAssetBreakdown(values, totalAssets),
      liabilityBreakdown: getLiabilityBreakdown(values, totalLiabilities)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Assets & Liabilities
          </CardTitle>
          <CardDescription>
            Enter your financial information to calculate your net worth and get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="liquidAssets" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            Liquid Assets (Cash, Savings, Checking)
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
                      name="investmentAssets" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Investment Assets (Stocks, Bonds, 401k, IRA)
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
                      name="realEstateValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Real Estate Value
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 300000" 
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
                      name="vehicleValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Vehicle Value
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 25000" 
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
                      name="otherAssets" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Other Assets (Jewelry, Art, Collectibles)
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
                    </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Liabilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="mortgageDebt" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Mortgage Debt
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 200000" 
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
                      name="creditCardDebt" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit Card Debt
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
                      name="studentLoanDebt" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Student Loan Debt
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 30000" 
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
                      name="autoLoanDebt" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Auto Loan Debt
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 15000" 
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
                      name="otherDebt" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Other Debt (Personal Loans, etc.)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 8000" 
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
                Calculate My Net Worth
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
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Net Worth Analysis</CardTitle>
                  <CardDescription>Complete financial position and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Assets</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.totalAssets.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your total assets
                  </p>
                </div>
                
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Liabilities</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    ${result.totalLiabilities.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your total debt
                  </p>
                </div>
                
                <div className={`text-center p-6 rounded-lg ${result.netWorth >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className={`h-5 w-5 ${result.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="text-sm font-medium text-muted-foreground">Net Worth</span>
                  </div>
                  <p className={`text-3xl font-bold ${result.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.netWorth.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Badge variant={result.financialHealth === 'Excellent' ? 'default' : result.financialHealth === 'Good' ? 'secondary' : result.financialHealth === 'Fair' ? 'outline' : result.financialHealth === 'Poor' ? 'destructive' : 'destructive'}>
                      {result.financialHealth} Financial Health
                    </Badge>
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Asset and Liability Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Asset Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.assetBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {result.assetBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.category}</span>
                            <div className="text-right">
                              <div className="font-semibold">${item.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No assets entered</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingDown className="h-5 w-5" />
                      Liability Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.liabilityBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {result.liabilityBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.category}</span>
                            <div className="text-right">
                              <div className="font-semibold">${item.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                    </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No liabilities entered</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Financial Recommendations
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
              Understanding Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Net Worth?</h4>
              <p className="text-muted-foreground">
                Net worth is the difference between your total assets and total liabilities. It's a key indicator of your financial health and represents your true wealth. A positive net worth means you own more than you owe.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Assets vs Liabilities</h4>
              <p className="text-muted-foreground">
                Assets are things you own that have value (cash, investments, property). Liabilities are debts you owe (loans, credit cards, mortgages). Your net worth increases when assets grow faster than liabilities.
              </p>
              </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Why Net Worth Matters</h4>
              <p className="text-muted-foreground">
                Net worth provides a complete picture of your financial position, helps track progress over time, and guides investment and debt management decisions. It's more important than income alone.
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
              Explore other financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <a href="/category/finance/emergency-fund-calculator" className="text-primary hover:underline">
                    Emergency Fund Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate how much emergency fund you need
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/roth-ira-contribution-limit-calculator" className="text-primary hover:underline">
                    Roth IRA Contribution Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Roth IRA contribution limits
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/401k-contribution-calculator" className="text-primary hover:underline">
                    401k Contribution Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your 401k contributions and growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Complete Guide to Building Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Net Worth: Your Financial Foundation</h3>
            <p>Net worth is the cornerstone of financial health, representing the true measure of your wealth. It's calculated by subtracting your total liabilities from your total assets. This single number tells you whether you're building wealth or accumulating debt.</p>
            
            <h3>Building Assets: The Wealth Creation Engine</h3>
            <p>Assets are anything you own that has value. They can be liquid (cash, savings accounts), invested (stocks, bonds, retirement accounts), or tangible (real estate, vehicles, collectibles). The key to building net worth is to grow your assets faster than your liabilities.</p>
            
            <h3>Managing Liabilities: The Debt Reduction Strategy</h3>
            <p>Liabilities represent everything you owe. While some debt (like mortgages) can be considered "good debt" if it helps you build assets, high-interest debt like credit cards should be eliminated quickly. The goal is to minimize liabilities while maximizing assets.</p>
            
            <h3>Net Worth Growth Strategies</h3>
            <p>To increase your net worth, focus on three key areas: increasing income, reducing expenses, and investing wisely. Start by building an emergency fund, then pay off high-interest debt, and finally invest in assets that appreciate over time.</p>
            
            <h3>Tracking Your Progress</h3>
            <p>Calculate your net worth monthly to track your financial progress. This regular check-in helps you stay motivated and make necessary adjustments to your financial strategy. Remember, building net worth is a marathon, not a sprint.</p>
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
              Common questions about net worth and financial health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good net worth by age?</h4>
              <p className="text-muted-foreground">
                A general rule is: Age 30: 1x annual income, Age 40: 3x annual income, Age 50: 5x annual income, Age 60: 8x annual income. However, focus on your own progress rather than comparing to others.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I include my home in net worth?</h4>
              <p className="text-muted-foreground">
                Yes, include your home's current market value as an asset and your mortgage balance as a liability. This gives you the true equity you have in your home.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I calculate my net worth?</h4>
              <p className="text-muted-foreground">
                Calculate your net worth monthly to track progress and make adjustments. More frequent tracking can help you stay motivated and catch problems early.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if my net worth is negative?</h4>
              <p className="text-muted-foreground">
                Focus on debt reduction, building an emergency fund, and increasing income. Create a debt payoff plan and stick to a budget. Many people start with negative net worth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I increase my net worth?</h4>
              <p className="text-muted-foreground">
                Increase assets through saving and investing, decrease liabilities by paying off debt, and avoid lifestyle inflation when your income increases.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}