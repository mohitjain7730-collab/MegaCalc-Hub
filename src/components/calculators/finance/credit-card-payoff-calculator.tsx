'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, DollarSign, TrendingDown, Info, AlertCircle, Target, Calculator, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentBalance: z.number().min(0).optional(),
  annualInterestRate: z.number().min(0).max(100).optional(),
  minimumPayment: z.number().min(0).optional(),
  extraPayment: z.number().min(0).optional(),
  payoffStrategy: z.enum(['minimum', 'fixed', 'snowball', 'avalanche']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditCardPayoffCalculator() {
  const [result, setResult] = useState<{ 
    payoffTime: number;
    totalInterest: number;
    totalPayments: number;
    monthlyPayment: number;
    strategy: string;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    paymentSchedule: { month: number; balance: number; payment: number; interest: number; principal: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: undefined, 
      annualInterestRate: undefined, 
      minimumPayment: undefined, 
      extraPayment: undefined,
      payoffStrategy: undefined
    } 
  });

  const calculatePayoff = (balance: number, rate: number, payment: number) => {
    const monthlyRate = rate / 100 / 12;
    let currentBalance = balance;
    let totalInterest = 0;
    let month = 0;
    const schedule = [];

    while (currentBalance > 0.01 && month < 600) { // Max 50 years
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      const actualPayment = principalPayment + interestPayment;
      
      totalInterest += interestPayment;
      currentBalance -= principalPayment;
      month++;

      schedule.push({
        month,
        balance: Math.max(0, currentBalance),
        payment: actualPayment,
        interest: interestPayment,
        principal: principalPayment
      });
    }

    return { payoffTime: month, totalInterest, schedule };
  };

  const calculate = (v: FormValues) => {
    if (v.currentBalance == null || v.annualInterestRate == null || v.minimumPayment == null) return null;
    
    const extraPayment = v.extraPayment || 0;
    const totalPayment = v.minimumPayment + extraPayment;
    
    return calculatePayoff(v.currentBalance, v.annualInterestRate, totalPayment);
  };

  const interpret = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const interestPercentage = (totalInterest / originalBalance) * 100;
    
    if (payoffTime > 300) return 'Very long payoff time—consider debt consolidation or balance transfer.';
    if (payoffTime > 120) return 'Long payoff time—focus on increasing payments and reducing expenses.';
    if (payoffTime > 60) return 'Moderate payoff time—good progress, consider accelerating payments.';
    return 'Short payoff time—excellent debt management strategy.';
  };

  const getStrategy = (strategy: string) => {
    switch (strategy) {
      case 'minimum': return 'Minimum Payment Strategy';
      case 'fixed': return 'Fixed Payment Strategy';
      case 'snowball': return 'Debt Snowball Strategy';
      case 'avalanche': return 'Debt Avalanche Strategy';
      default: return 'Custom Payment Strategy';
    }
  };

  const getRecommendations = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const recommendations = [];
    
    if (payoffTime > 300) {
      recommendations.push('Consider debt consolidation loan with lower interest rate');
      recommendations.push('Look into balance transfer cards with 0% intro APR');
      recommendations.push('Cut all non-essential expenses immediately');
      recommendations.push('Increase income through side hustles or job change');
      recommendations.push('Seek professional debt counseling');
    } else if (payoffTime > 120) {
      recommendations.push('Increase monthly payments by any amount possible');
      recommendations.push('Use windfalls (tax refunds, bonuses) for extra payments');
      recommendations.push('Consider debt avalanche method (highest interest first)');
      recommendations.push('Track spending to find money for extra payments');
    } else if (payoffTime > 60) {
      recommendations.push('Maintain current payment strategy');
      recommendations.push('Consider debt snowball for psychological wins');
      recommendations.push('Build emergency fund to prevent new debt');
      recommendations.push('Start saving for future goals');
    } else {
      recommendations.push('Excellent debt management!');
      recommendations.push('Focus on building emergency fund');
      recommendations.push('Start investing for long-term goals');
      recommendations.push('Consider debt-free lifestyle maintenance');
    }

    return recommendations;
  };

  const getWarningSigns = (payoffTime: number, totalInterest: number, originalBalance: number) => {
    const signs = [];
    
    if (payoffTime > 300) {
      signs.push('Payoff time exceeds 25 years - unsustainable');
      signs.push('Total interest exceeds original balance');
      signs.push('Minimum payments barely cover interest');
      signs.push('Risk of default and credit damage');
    } else {
      signs.push('High credit utilization ratio');
      signs.push('Missing payments or paying late');
      signs.push('Using credit cards for daily expenses');
      signs.push('No emergency fund to prevent new debt');
    }

    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    const { payoffTime, totalInterest, schedule } = calculation;
    const totalPayments = values.currentBalance! + totalInterest;
    const monthlyPayment = values.minimumPayment! + (values.extraPayment || 0);
    
    setResult({ 
      payoffTime,
      totalInterest,
      totalPayments,
      monthlyPayment,
      strategy: getStrategy(values.payoffStrategy || 'minimum'),
      interpretation: interpret(payoffTime, totalInterest, values.currentBalance!),
      recommendations: getRecommendations(payoffTime, totalInterest, values.currentBalance!),
      warningSigns: getWarningSigns(payoffTime, totalInterest, values.currentBalance!),
      paymentSchedule: schedule.slice(0, 12) // Show first 12 months
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Card Debt Information
          </CardTitle>
          <CardDescription>
            Enter your credit card details to calculate payoff timeline and strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="currentBalance" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Balance
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
                  name="annualInterestRate" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Annual Interest Rate (%)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 18.99" 
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
                  name="minimumPayment" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Minimum Payment
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 150" 
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
                  name="extraPayment" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Extra Payment (Optional)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 100" 
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
                  name="payoffStrategy" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Payoff Strategy
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as any)}
                        >
                          <option value="">Select strategy</option>
                          <option value="minimum">Minimum Payment</option>
                          <option value="fixed">Fixed Payment</option>
                          <option value="snowball">Debt Snowball</option>
                          <option value="avalanche">Debt Avalanche</option>
                  </select>
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Payoff Plan
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
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Credit Card Payoff Plan</CardTitle>
                  <CardDescription>Timeline and strategy for becoming debt-free</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Payoff Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {Math.floor(result.payoffTime / 12)} years {result.payoffTime % 12} months
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.payoffTime} total months
                  </p>
                </div>
                
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interest cost
                  </p>
                    </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Monthly Payment</span>
                        </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.monthlyPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.strategy}
                  </p>
                        </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Payment Schedule Preview */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Payment Schedule (First 12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Balance</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Principal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.paymentSchedule.map((payment, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{payment.month}</td>
                            <td className="text-right p-2">${payment.balance.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.payment.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.interest.toFixed(2)}</td>
                            <td className="text-right p-2">${payment.principal.toFixed(2)}</td>
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
                        Payoff Recommendations
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
              Understanding Credit Card Payoff Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Minimum Payment Strategy</h4>
              <p className="text-muted-foreground">
                Paying only the minimum required payment. This results in the longest payoff time and highest total interest cost. Not recommended unless absolutely necessary.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Debt Snowball Method</h4>
              <p className="text-muted-foreground">
                Pay minimums on all debts, then put extra money toward the smallest balance first. Provides psychological wins and motivation to continue.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Debt Avalanche Method</h4>
              <p className="text-muted-foreground">
                Pay minimums on all debts, then put extra money toward the highest interest rate first. Mathematically optimal for saving money on interest.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Fixed Payment Strategy</h4>
              <p className="text-muted-foreground">
                Pay the same amount each month regardless of minimum payment changes. Provides predictable budgeting and faster payoff as balance decreases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other debt management and financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                    Loan/EMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate loan payments and schedules
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                    Mortgage Payment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate mortgage payments and costs
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/student-loan-repayment-calculator" className="text-primary hover:underline">
                    Student Loan Repayment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your student loan repayment strategy
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">
                    Debt-to-Equity Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Analyze your debt-to-equity ratio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Guide to Credit Card Debt Payoff
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>Understanding Credit Card Debt: The High-Interest Trap</h3>
            <p>Credit card debt is one of the most expensive forms of debt, with interest rates typically ranging from 15-25% annually. Unlike mortgages or student loans, credit card debt is unsecured, meaning there's no collateral backing it, which is why rates are so high.</p>
            
            <h3>The Psychology of Debt Payoff</h3>
            <p>Debt payoff is as much psychological as it is mathematical. The debt snowball method (paying smallest balances first) provides quick wins and motivation, while the debt avalanche method (paying highest interest first) saves the most money. Choose the method that will keep you motivated.</p>
            
            <h3>Creating Your Debt Payoff Strategy</h3>
            <p>Start by listing all your debts with balances, minimum payments, and interest rates. Choose your payoff method, then create a budget that allocates extra money toward debt payoff. Even small extra payments can significantly reduce your payoff time.</p>
            
            <h3>Preventing Future Debt</h3>
            <p>Once you're debt-free, focus on building an emergency fund to prevent future debt. Aim for 3-6 months of expenses in a high-yield savings account. This safety net will help you avoid credit cards for unexpected expenses.</p>
            
            <h3>Building Healthy Credit Habits</h3>
            <p>Use credit cards as a tool, not a crutch. Pay off your balance in full each month to avoid interest charges. If you can't pay in full, you're spending more than you can afford. Focus on building wealth through assets, not accumulating debt.</p>
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
              Common questions about credit card debt payoff
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I pay off credit cards or invest?</h4>
              <p className="text-muted-foreground">
                Generally, pay off high-interest credit card debt first. Credit card interest rates (15-25%) are typically much higher than investment returns (7-10%). The guaranteed savings from paying off debt usually outweighs potential investment gains.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between snowball and avalanche methods?</h4>
              <p className="text-muted-foreground">
                Snowball focuses on smallest balances first for psychological wins, while avalanche focuses on highest interest rates first for maximum money savings. Avalanche saves more money, but snowball provides more motivation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use a balance transfer card?</h4>
              <p className="text-muted-foreground">
                Balance transfer cards can be helpful if you have good credit and can get a 0% intro APR. However, you must pay off the balance before the intro period ends, and you need to avoid new charges on the old card.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra should I pay each month?</h4>
              <p className="text-muted-foreground">
                Pay as much extra as possible while maintaining your emergency fund and other financial obligations. Even $25-50 extra per month can significantly reduce payoff time and interest costs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I can't make the minimum payment?</h4>
              <p className="text-muted-foreground">
                Contact your credit card company immediately to discuss hardship programs, reduced payments, or payment plans. Many companies offer temporary relief options to help avoid default.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I close credit cards after paying them off?</h4>
              <p className="text-muted-foreground">
                Generally, keep the accounts open to maintain your credit utilization ratio and credit history length. However, if you can't control spending, closing them may be necessary for your financial health.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}