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
                  <div className="text-sm text-muted-foreground mt-1">
                    <Badge variant={result.financialHealth === 'Excellent' ? 'default' : result.financialHealth === 'Good' ? 'secondary' : result.financialHealth === 'Fair' ? 'outline' : result.financialHealth === 'Poor' ? 'destructive' : 'destructive'}>
                      {result.financialHealth} Financial Health
                    </Badge>
                  </div>
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Comprehensive Guide to Net Worth Calculation, Tracking, and Financial Health" />
    <meta itemProp="description" content="An expert guide detailing the fundamental equation of Net Worth (Assets - Liabilities), its role as a key metric of financial health for individuals and businesses (Balance Sheet), and strategies for consistent wealth growth." />
    <meta itemProp="keywords" content="net worth definition finance, how to calculate net worth, total assets vs total liabilities, personal balance sheet, tracking net worth growth, financial independence measurement, liquid net worth" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-net-worth-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Net Worth: The Single Metric of Financial Health</h1>
    <p className="text-lg italic text-muted-foreground">Understand the foundational concept used by businesses and individuals alike to assess true economic standing at any given moment.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">The Core Equation and Definition of Net Worth</a></li>
        <li><a href="#assets" className="hover:underline">Component 1: Categorizing and Valuing Total Assets</a></li>
        <li><a href="#liabilities" className="hover:underline">Component 2: Calculating Total Liabilities</a></li>
        <li><a href="#applications" className="hover:underline">Net Worth in Personal Finance and Corporate Accounting</a></li>
        <li><a href="#tracking" className="hover:underline">Strategic Significance and Tracking Net Worth Growth</a></li>
    </ul>
<hr />

    {/* THE CORE EQUATION AND DEFINITION OF NET WORTH */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Core Equation and Definition of Net Worth</h2>
    <p><strong className="font-semibold">Net Worth (NW)</strong> is the value of all financial and non-financial assets owned, minus the total value of all outstanding liabilities (debts). It represents the true measure of an entity's wealth at a specific point in time—what the entity would own if it liquidated all assets and paid off all debts.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fundamental Balance Sheet Equation</h3>
    <p>Whether for a household or a major corporation, Net Worth is derived from the balance sheet identity:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Net Worth = Total Assets - Total Liabilities'}
        </p>
    </div>
    <p>In corporate accounting, Net Worth is often referred to as **Shareholders’ Equity** or **Owners’ Equity**, reflecting the residual claim owners have on the company's assets after all debts are satisfied.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Positive, Negative, and Zero Net Worth</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Positive Net Worth:</strong> Assets exceed liabilities. This indicates solvency and financial health.</li>
        <li><strong className="font-semibold">Negative Net Worth:</strong> Liabilities exceed assets. This is common early in life (due to student loans and mortgages) or for companies experiencing deep financial distress.</li>
        <li><strong className="font-semibold">Zero Net Worth:</strong> Assets precisely equal liabilities. The entity is technically solvent but has no residual wealth.</li>
    </ul>

<hr />

    {/* COMPONENT 1: CATEGORIZING AND VALUING TOTAL ASSETS */}
    <h2 id="assets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Component 1: Categorizing and Valuing Total Assets</h2>
    <p><strong className="font-semibold">Assets</strong> are anything of economic value owned by the entity. For accurate net worth calculation, assets must be valued at their current fair market value (FMV)—what they could realistically be sold for today—not their original purchase price (cost basis).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Asset Classification in Personal Finance</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Liquid Assets (Cash & Equivalents):</strong> Easily converted to cash. Includes checking accounts, savings accounts, money market funds, and highly liquid bonds/CDs.</li>
        <li><strong className="font-semibold">Investment Assets:</strong> Held for appreciation or income generation. Includes stocks, bonds, mutual funds, 401(k) and IRA balances, and brokerage accounts.</li>
        <li><strong className="font-semibold">Real Assets (Property):</strong> Less liquid. Includes the fair market value of primary residences, rental properties, and land. The value used should be the appraised value, not the original purchase price.</li>
        <li><strong className="font-semibold">Personal Assets:</strong> Items like vehicles, jewelry, and expensive art. While part of net worth, these are often excluded from routine tracking due to high transaction costs and low resale value relative to purchase price.</li>
    </ul>
    <p>The valuation of non-liquid assets, particularly real estate, introduces the most subjectivity and potential error into the Net Worth calculation.</p>

<hr />

    {/* COMPONENT 2: CALCULATING TOTAL LIABILITIES */}
    <h2 id="liabilities" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Component 2: Calculating Total Liabilities</h2>
    <p><strong className="font-semibold">Liabilities</strong> are all financial obligations or debts owed to external parties. They represent claims against the entity's assets and must be totaled at their current outstanding principal balance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Liability Classification</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Secured Debt:</strong> Debt tied to a specific asset (collateral). Examples include mortgages (secured by the home), auto loans, and secured personal loans.</li>
        <li><strong className="font-semibold">Unsecured Debt:</strong> Debt not backed by collateral. Examples include credit card balances, medical debt, and most personal loans.</li>
        <li><strong className="font-semibold">Long-Term Liabilities:</strong> Obligations due more than one year away, such as the remaining balance on a 30-year mortgage or term life insurance premiums.</li>
        <li><strong className="font-semibold">Short-Term Liabilities (Current):</strong> Obligations due within the current year, such as credit card balances and utility bills.</li>
    </ul>
    <p>Crucially, only the <strong className="font-semibold">principal balance</strong> of the loan (the amount you must pay to zero out the debt today) should be included. Future interest payments, while part of the total debt cost, are not included in the current liability balance.</p>

<hr />

    {/* NET WORTH IN PERSONAL FINANCE AND CORPORATE ACCOUNTING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Worth in Personal Finance and Corporate Accounting</h2>
    <p>While the formula remains the same, the application of Net Worth differs slightly between personal and corporate contexts.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Personal Finance: The Financial Health Snapshot</h3>
    <p>For individuals, Net Worth is the definitive benchmark of financial progress. It directly measures the effectiveness of savings, investment, and debt reduction strategies. Financial Independence (FI) movements often use a target Net Worth (e.g., 25 times annual expenses) as the threshold for retirement, completely decoupling income from wealth.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Corporate Accounting: Shareholder Equity and Solvency</h3>
    <p>In business, the Balance Sheet structure mandates: **Assets = Liabilities + Equity**. Equity (Net Worth) represents the portion of the company's value owned by the shareholders. Lenders and investors scrutinize a company’s equity:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Lending Decisions:</strong> Lenders assess net worth to determine solvency (ability to cover debts) and leverage ratios (how much debt the company uses relative to equity).</li>
        <li><strong className="font-semibold">Valuation:</strong> A company's book value (Equity per share) is often used as a baseline for valuing stable, non-cyclical firms.</li>
    </ul>

<hr />

    {/* STRATEGIC SIGNIFICANCE AND TRACKING NET WORTH GROWTH */}
    <h2 id="tracking" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Significance and Tracking Net Worth Growth</h2>
    <p>Tracking Net Worth consistently—ideally on a monthly or quarterly basis—is crucial for financial strategy. It shifts the focus from volatile monthly income to stable, long-term wealth accumulation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Drivers of Net Worth Change</h3>
    <p>Net Worth can increase in three primary ways:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Saving/Debt Reduction:</strong> Paying down liabilities (e.g., mortgage principal) or adding to liquid assets directly increases NW.</li>
        <li><strong className="font-semibold">Investment Returns:</strong> Growth in the value of investment assets (e.g., stock market returns, real estate appreciation) increases NW.</li>
        <li><strong className="font-semibold">Capital Injections:</strong> Receiving a large gift or inheritance directly increases NW.</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Tracking</h3>
    <p>A positive trend in Net Worth confirms the effectiveness of the entire financial plan. A negative trend, despite steady income, signals that consumption or asset depreciation is outpacing savings and investment returns, necessitating immediate corrective action.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Net Worth is the definitive, comprehensive metric of financial health, consolidating all assets and liabilities into a single, undeniable figure. Its calculation—Total Assets minus Total Liabilities—forms the bedrock of personal finance and corporate accounting.</p>
    <p>For the individual, tracking Net Worth consistently transforms financial management from a focus on short-term cash flow into a strategic pursuit of long-term wealth accumulation, providing the clearest possible roadmap to financial independence.</p>
</section>

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