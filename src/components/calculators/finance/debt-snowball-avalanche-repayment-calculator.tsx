'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Shield,
  Search,
  Scale,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Schema & Types ---
const debtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Debt name is required"),
  balance: z.number().min(0.01, "Balance must be positive"),
  rate: z.number().min(0, "Interest rate cannot be negative").max(1000, "Rate seems too high"),
  minPayment: z.number().min(0, "Min payment must be positive"),
});

const formSchema = z.object({
  debts: z.array(debtSchema).min(1, "At least one debt is required"),
  extraPayment: z.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface PayoffResult {
  strategy: 'Snowball' | 'Avalanche';
  totalInterest: number;
  totalMonths: number;
  totalPaid: number;
  payoffDate: Date;
  schedule: { month: number; remainingBalance: number; paidInterest: number; paidPrincipal: number }[];
}

interface ComparisonResult {
  snowball: PayoffResult;
  avalanche: PayoffResult;
  winner: 'Snowball' | 'Avalanche' | 'Tie';
  interestSaved: number;
  timeSaved: number; // in months
}

// --- Helper Functions ---
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

export default function DebtSnowballAvalancheRepaymentCalculator() {
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      debts: [
        { id: '1', name: 'Credit Card', balance: 5000, rate: 18.99, minPayment: 150 },
        { id: '2', name: 'Car Loan', balance: 12000, rate: 4.5, minPayment: 350 },
      ],
      extraPayment: 100,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "debts",
  });

  const calculateStrategy = (debts: FormValues['debts'], extraPayment: number, strategy: 'Snowball' | 'Avalanche'): PayoffResult => {
    // Clone debts to avoid mutation
    let currentDebts = debts.map(d => ({ ...d }));
    let totalInterest = 0;
    let months = 0;
    let schedule = [];
    let active = true;

    // Sorting
    // Snowball: Lowest Balance first
    // Avalanche: Highest Rate first
    const sortDebts = (ds: typeof currentDebts) => {
      return ds.sort((a, b) => {
        if (strategy === 'Snowball') return a.balance - b.balance;
        return b.rate - a.rate;
      });
    };

    while (active && months < 600) { // Safety break at 50 years
      months++;
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;
      let totalMonthlyBudget = currentDebts.reduce((sum, d) => sum + d.minPayment, 0) + extraPayment;

      // Accrue interest
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const interest = d.balance * (d.rate / 100 / 12);
          d.balance += interest;
          totalInterest += interest;
          monthlyInterest += interest;
        }
      });

      // Pay minimums
      let surplus = extraPayment; // We start with the extra payment as surplus

      // First pass: Pay minimums
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          let payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
          monthlyPrincipal += payment; // This is raw cash flow, split principal/interest implied

          // If a debt is paid off (or very close), its min payment becomes surplus
          if (d.balance < 0.01) {
            d.balance = 0;
            // The min payment that WAS allocated here is now freed up for next month, 
            // BUT for THIS month, any excess from the min payment goes to surplus? 
            // Simplified: standard model is "Snowball rolls over freed up min payments".
          }
        } else {
          // Debt is already 0, so its minPayment is available as surplus
          surplus += d.minPayment;
        }
      });

      // Second pass: Apply surplus to top priority debt
      // Re-sort to find current top priority that still has balance
      let activeDebts = currentDebts.filter(d => d.balance > 0);
      if (activeDebts.length === 0) {
        active = false;
        break;
      }

      activeDebts = sortDebts(activeDebts);

      // Apply surplus to the first one
      if (activeDebts.length > 0 && surplus > 0) {
        let target = activeDebts[0];
        let payment = Math.min(target.balance, surplus);
        target.balance -= payment;
        monthlyPrincipal += payment;
        surplus -= payment;
      }

      schedule.push({
        month: months,
        remainingBalance: currentDebts.reduce((sum, d) => sum + d.balance, 0),
        paidInterest: monthlyInterest,
        paidPrincipal: monthlyPrincipal
      });

      if (currentDebts.every(d => d.balance <= 0.01)) active = false;
    }

    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + months, today.getDate());

    return {
      strategy,
      totalInterest,
      totalMonths: months,
      totalPaid: totalInterest + debts.reduce((s, d) => s + d.balance, 0), // Approx
      payoffDate,
      schedule
    };
  };

  const onSubmit = (values: FormValues) => {
    const snowballRes = calculateStrategy(values.debts, values.extraPayment, 'Snowball');
    const avalancheRes = calculateStrategy(values.debts, values.extraPayment, 'Avalanche');

    let winner: 'Snowball' | 'Avalanche' | 'Tie' = 'Tie';
    if (avalancheRes.totalInterest < snowballRes.totalInterest - 1) winner = 'Avalanche'; // allowing $1 diff
    else if (snowballRes.totalInterest < avalancheRes.totalInterest - 1) winner = 'Snowball';

    setResult({
      snowball: snowballRes,
      avalanche: avalancheRes,
      winner,
      interestSaved: Math.abs(snowballRes.totalInterest - avalancheRes.totalInterest),
      timeSaved: Math.abs(snowballRes.totalMonths - avalancheRes.totalMonths)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Debts & Budget
          </CardTitle>
          <CardDescription>
            List all your current debts. The calculator will compare the Snowball and Avalanche repayment methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Debt List */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`debts.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Debt Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Visa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`debts.${index}.balance`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Balance ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`debts.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`debts.${index}.minPayment`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Min Payment ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end pb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ id: crypto.randomUUID(), name: '', balance: 0, rate: 0, minPayment: 0 })}
                  className="w-full border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Debt
                </Button>
              </div>

              <Separator />

              <div className="max-w-md">
                <FormField
                  control={form.control}
                  name="extraPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Monthly Extra Payment Budget ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g. 500"
                          className="text-lg font-medium"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <CardDescription className="text-xs mt-1">
                        Amount you can pay <strong>above</strong> the minimums each month.
                      </CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full size-lg text-lg">
                <Calculator className="mr-2 h-5 w-5" />
                Compare Repayment Strategies
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-8">

          {/* Winner Banner */}
          <Card className={cn(
            "border-l-4",
            result.winner === 'Avalanche' ? "border-l-blue-600" : result.winner === 'Snowball' ? "border-l-indigo-600" : "border-l-gray-400"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {result.winner === 'Avalanche' && "Avalanche Saves You More Money"}
                    {result.winner === 'Snowball' && "Snowball and Avalanche are Comparable"}
                    {result.winner === 'Tie' && "Both Strategies Yield Identical Results"}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {result.winner === 'Avalanche' && `By creating a "Debt Avalanche" (paying highest rates first), you save ${formatCurrency(result.interestSaved)} in interest compared to the Snowball method.`}
                    {result.winner === 'Snowball' && `Surprisingly, the Snowball method costs about the same as Avalanche in this scenario, but offers better psychological wins.`}
                    {result.winner === 'Tie' && `Since the interest rates or balances are similar, mathematically there is no difference. Choose the one that motivates you most.`}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="px-4 py-1 text-base">
                  {result.winner === 'Avalanche' ? 'Recommended: Avalanche' : 'Recommended: Your Choice'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Snowball Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle>Debt Snowball</CardTitle>
                    <CardDescription>Smallest Balance First</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Debt Free By</span>
                  <span className="font-bold text-lg">{result.snowball.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Time to Payoff</span>
                  <span className="font-bold">{result.snowball.totalMonths} Months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Total Interest Paid</span>
                  <span className="font-bold text-destructive">{formatCurrency(result.snowball.totalInterest)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Avalanche Card */}
            <Card className="relative overflow-hidden border-blue-200 dark:border-blue-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Debt Avalanche</CardTitle>
                    <CardDescription>Highest Interest Rate First</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="text-muted-foreground">Debt Free By</span>
                  <span className="font-bold text-lg">{result.avalanche.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="text-muted-foreground">Time to Payoff</span>
                  <span className="font-bold">{result.avalanche.totalMonths} Months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="text-muted-foreground">Total Interest Paid</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(result.avalanche.totalInterest)}</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Strategic Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb className="h-5 w-5" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Tailored advice for your situation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    {result.winner === 'Avalanche'
                      ? "Switching to Avalanche could save you significant money on interest. This is the mathematically optimal path."
                      : "The difference in interest is negligible. You should choose the Snowball method for the psychological boost of eliminating debts quickly."}
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Adding just $50 more to your monthly payment ({formatCurrency(form.getValues('extraPayment') + 50)}) could cut another {Math.round(result.avalanche.totalMonths * 0.1)} months off your freedom date.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Ensure you have a small emergency fund ($1,000) before aggressively attacking debt, to avoid adding new debt during the process.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Potential pitfalls to avoid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <span className="text-sm text-red-800 dark:text-red-300">
                    <strong>Variable Rates:</strong> If your credit card rates rise, your payoff timeline will extend. Prioritize variable rate debts in an Avalanche strategy.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <span className="text-sm text-red-800 dark:text-red-300">
                    <strong>Consolidation Trap:</strong> Moving debt to a 0% transfer card is great, BUT only if you don't run up the old cards again. Behavior is key.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Understanding Your Strategy Inputs
          </CardTitle>
          <CardDescription>How the variables affect your debt freedom date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                Extra Payment
              </h4>
              <p className="text-sm text-muted-foreground">
                This is the "Snowball" itself. It's the fuel that accelerates your payoff. The more you add here, the faster the compounding effect works. Even $20/month makes a statistical difference.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-indigo-500" />
                Interest Rate vs Balance
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>Snowball</strong> ignores Interest Rate to focus on Balance (Motivation). <br />
                <strong>Avalanche</strong> ignores Balance size to focus on Rate (Math).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Methodology & Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
            For each month {`{`} <br />
            &nbsp;&nbsp; 1. Accrue Interest = Balance * (Rate / 12) <br />
            &nbsp;&nbsp; 2. Pay Minimums on ALL debts <br />
            &nbsp;&nbsp; 3. Excess Cash = Extra Payment + (Min Payment of Paid Off Debts) <br />
            &nbsp;&nbsp; 4. Apply Excess Cash to [TARGET DEBT] <br />
            {`}`} <br />
            <br />
            Target Debt depends on Strategy: <br />
            - Snowball: Lowest Balance <br />
            - Avalanche: Highest Interest Rate
          </div>
          <p className="text-sm text-muted-foreground">
            This calculator uses an iterative amortization algorithm. It simulates your payments month-by-month, handling the "rollover" effect where payments from eliminated debts are added to the acceleration fund for the next target.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>Other calculators to improve your financial health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Credit Card Payoff", url: "/finance/credit-card-payoff-calculator", icon: <DollarSign className="h-5 w-5 text-red-500" />, desc: "Specific plan for plastic debt" },
              { name: "Budget Planner", url: "/finance/monthly-budget-planner-calculator", icon: <PieChart className="h-5 w-5 text-green-500" />, desc: "Find money for extra payments" },
              { name: "Emergency Fund", url: "/finance/emergency-fund-calculator", icon: <Shield className="h-5 w-5 text-blue-500" />, desc: "Protect your progress" },
              { name: "Savings Goal", url: "/finance/savings-goal-timeline-calculator", icon: <Target className="h-5 w-5 text-indigo-500" />, desc: "Plan for life after debt" },
              { name: "Loan Amortization", url: "/finance/amortization-schedule-generator", icon: <Calendar className="h-5 w-5 text-purple-500" />, desc: "Deep dive into loan schedules" },
              { name: "Debt-to-Income", url: "/finance/dscr-calculator", icon: <Scale className="h-5 w-5 text-orange-500" />, desc: "Check your borrowing power" },
            ].map((item, i) => (
              <Link key={i} href={item.url} className="block group">
                <Card className="h-full hover:shadow-md transition-all border-muted group-hover:border-primary/50">
                  <CardContent className="p-4 flex items-start gap-3">
                    {item.icon}
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section (SEO Optimized) */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-sm border" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Debt Snowball vs. Avalanche: The Ultimate Repayment Strategy Guide" />
        <meta itemProp="author" content="Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-11-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">The Definitive Guide to Debt Repayment: Snowball vs. Avalanche</h1>

        <p className="text-lg text-foreground/80">
          Becoming debt-free is less about math and more about behavior. However, the strategy you choose—whether the psychologically rewarding <strong>Debt Snowball</strong> or the mathematically superior <strong>Debt Avalanche</strong>—can significantly impact your motivation and the total interest you pay. This comprehensive guide breaks down the mechanics, psychology, and execution of both methods.
        </p>

        <div className="my-8 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary font-medium">
            <li><a href="#basics" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Core Concept</a></li>
            <li><a href="#snowball" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Deep Dive: Debt Snowball</a></li>
            <li><a href="#avalanche" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Deep Dive: Debt Avalanche</a></li>
            <li><a href="#comparison" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Mathematical vs. Psychological Wins</a></li>
            <li><a href="#execution" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Step-by-Step Execution Plan</a></li>
            <li><a href="#pitfalls" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Common Pitfalls to Avoid</a></li>
          </ul>
        </div>

        <h2 id="basics" className="text-2xl font-bold text-foreground mt-8 mb-4">The Core Concept of Accelerated Repayment</h2>
        <p>
          Most people pay their debts inefficiently. They pay the minimums on everything, and if they have extra cash, they spread it around—paying $20 extra here, $50 extra there. This "scattershot" approach feels like you're doing something, but it typically yields poor results because it fails to focus the power of compounding.
        </p>
        <p>
          Both the Snowball and Avalanche methods rely on a core principle called <strong>Concentrated Force</strong>. You adhere to the minimum payments on <em>every single debt except one</em>. That one "Target Debt" receives every spare dollar you have—your "Extra Payment." Once that target is destroyed, you don't pocket the money you were spending on it. Instead, you roll that entire amount (the old minimum + the extra payment) into the next debt. This creates a compounding "rollover" effect that grows larger and larger as debts are eliminated.
        </p>

        <h2 id="snowball" className="text-2xl font-bold text-foreground mt-8 mb-4 flex items-center gap-3">
          <Target className="h-6 w-6 text-indigo-600" />
          Deep Dive: The Debt Snowball Method
        </h2>
        <h3 className="text-xl font-semibold text-foreground mb-2">How it Works</h3>
        <p>
          Popularized by financial experts like Dave Ramsey, the Debt Snowball strategy ignores interest rates entirely. Instead, it orders your debts by <strong>Balance Size (smallest to largest)</strong>.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Step 1:</strong> List debts from smallest balance to largest balance.</li>
          <li><strong>Step 2:</strong> Pay minimums on everything except the smallest one.</li>
          <li><strong>Step 3:</strong> Attack the smallest debt with vengeance. Sell things, take a side job, cut budget—throw it all at the little one.</li>
          <li><strong>Step 4:</strong> When the small one is gone, take its payment and apply it to the next smallest.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">The Psychology (Why it Wins)</h3>
        <p>
          Academic research from the <em>Harvard Business Review</em> and the <em>Journal of Consumer Research</em> supports the Snowball method. Why? Because humans are not calculators; we are emotional creatures. When you owe money to five different creditors, it feels overwhelming. By quickly eliminating the smallest debt (even if it's just a $200 medical bill), you get a "Quick Win."
        </p>
        <p>
          This dopamine hit proves to your brain that <em>you can do this</em>. The broken behavior chain is healed, and motivation surges. This increased intensity often leads people to pay off debt faster in reality, even if the math says it should take longer, because they stick with the plan.
        </p>

        <h2 id="avalanche" className="text-2xl font-bold text-foreground mt-8 mb-4 flex items-center gap-3">
          <TrendingDown className="h-6 w-6 text-blue-600" />
          Deep Dive: The Debt Avalanche Method
        </h2>
        <h3 className="text-xl font-semibold text-foreground mb-2">How it Works</h3>
        <p>
          The Debt Avalanche is the strategy for the optimizing rationalist. It minimizes the amount of money you give to the bank by targeting debts with the <strong>Highest Interest Rate</strong> first, regardless of the balance.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Step 1:</strong> List debts from highest interest rate to lowest interest rate.</li>
          <li><strong>Step 2:</strong> Pay minimums on everything except the one with the highest rate.</li>
          <li><strong>Step 3:</strong> Attack the high-interest debt (often a credit card or payday loan).</li>
          <li><strong>Step 4:</strong> Once paid, move to the next highest rate.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">The Math (Why it Saves)</h3>
        <p>
          Mathematically, this is the superior method. Every day a dollar sits in a 24% APR credit card debt, it costs you more than a dollar sitting in a 4% student loan. By eliminating the high-interest principals first, you reduce the "friction" of interest accumulating against you. Over the course of paying off $20,000+ in debt, the Avalanche method can often save hundreds or even thousands of dollars in interest compared to the Snowball.
        </p>

        <h2 id="comparison" className="text-2xl font-bold text-foreground mt-8 mb-4">Comparison: Which Should You Choose?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-5 border rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10">
            <span className="block font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-400">Choose Snowball If:</span>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You have struggled with discipline in the past.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You need to see immediate results to stay motivated.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You have many small, annoying debts complicating your life.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> The interest rate gaps between debts are small (e.g., 4% vs 5%).</li>
            </ul>
          </div>
          <div className="p-5 border rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
            <span className="block font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">Choose Avalanche If:</span>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You are highly disciplined and logical.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You are not discouraged by a lack of early milestones.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> You have predatory debts with extremely high rates (20%+).</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> The "Target Debt" is large, meaning it will take long to pay off regardless of strategy.</li>
            </ul>
          </div>
        </div>

        <h2 id="execution" className="text-2xl font-bold text-foreground mt-8 mb-4">Tactical Execution: How to Start Today</h2>
        <p>
          Deciding is the easy part. Doing is hard. Here is a tactical plan to ensure your success, regardless of the method you choose.
        </p>
        <div className="space-y-4 mt-4">
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</span>
            <div>
              <strong className="block text-foreground">Stop the Bleeding</strong>
              Cut up the credit cards. You cannot get out of a hole while you are still digging. If you are trying to pay off debt while still using credit to fund your lifestyle, you are spinning your wheels. Switch to debit/cash immediately.
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</span>
            <div>
              <strong className="block text-foreground">Build a Starter Emergency Fund</strong>
              Before attacking debt, save $1,000 to $2,000 in a separate account. This is your "Murphy Repellent." When the car breaks down or the water heater explodes, you use this cash instead of the credit card. This prevents you from relapsing into debt.
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</span>
            <div>
              <strong className="block text-foreground">Organization is Key</strong>
              Use this calculator to map out your journey. Print the results. Tape "The Date" (your debt-free date) to your bathroom mirror. Visualizing the finish line is a powerful motivator.
            </div>
          </div>
        </div>

        <h2 id="pitfalls" className="text-2xl font-bold text-foreground mt-8 mb-4">Common Pitfalls to Avoid</h2>
        <p>
          <strong>The Consolidation Trap:</strong> Many people take out a personal loan or do a balance transfer to lower their interest rate. This <em>can</em> be smart (an Avalanche tactic), but often the borrower hasn't fixed their spending habits. They pay off the credit cards with the loan, feel "rich," and then run up the credit card balances again. Now they have the loan AND the new credit card debt.
        </p>
        <p>
          <strong>Lifestyle Creep:</strong> As you pay off debts, your monthly cash flow improves. It is tempting to use that "freed up" money to buy a nicer car or eat out more. Resist this urge. Every dollar freed up must be directed to the next debt until you are completely free.
        </p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers to common questions about debt repayment strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { q: "Can I switch strategies halfway through?", a: "Yes. Many people start with the Snowball to knock out 2-3 small debts for motivation, then switch to Avalanche to finish off the larger, high-interest debts efficiently." },
            { q: "Should I include my mortgage?", a: "Generally, no. Your mortgage is a long-term, secured debt (usually with a lower rate) and a tax asset. The Snowball/Avalanche methods are designed for consumer debt (credit cards, cars, student loans, medical bills)." },
            { q: "What if I have a 0% interest debts?", a: "In the Avalanche method, 0% debts go last (mathematically). In the Snowball method, they stick to their position based on balance size. However, be careful—if the 0% period is expiring soon, you might want to prioritize it to avoid back-interest penalties." },
            { q: "Is debt consolidation a better option?", a: "Consolidation simplifies payments into one bill and ideally lowers your rate. However, it doesn't reduce the principal owed. It often extends the term, meaning you might pay MORE interest over time. Use it only if you have corrected your spending behavior." },
            { q: "How much of an emergency fund do I need before starting?", a: "Most experts recommend a small 'starter' fund of $1,000 to $2,000. Do not build a full 3-6 month fund yet; use that excess cash to clear high-interest debt first." },
            { q: "What if I can't even afford minimum payments?", a: "You are in a 'debt emergency'. Contact your creditors immediately to ask for hardship programs. You may need to look into credit counseling or, in severe cases, bankruptcy. The Snowball/Avalanche methods assume you can cover minimums." },
            { q: "Does the calculator account for variable rates?", a: "This calculator assumes fixed rates for simplicity. If you have variable rates (like credit cards), assume an average or slightly higher rate to be safe in your planning." },
            { q: "Should I use my 401(k) to pay off debt?", a: "Usually, NO. Raiding retirement accounts triggers taxes and penalties that often outweigh the interest savings. Plus, you lose decades of compound growth. Treat retirement funds as protected assets." },
            { q: "What about 'Snowflaking'?", a: "Snowflaking is finding small, one-time amounts of money (selling an item, a birthday gift, a rebate) and immediately throwing it at the debt. It complements both Snowball and Avalanche perfectly." },
            { q: "How do I stay motivated for 3+ years?", a: "Break the journey into milestones. Celebrate when you pay off a specific card, or when your total drops below $10k. Join communities like r/debtfree for support. Motivation acts like fuel; you need to replenish it regularly." },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-base mb-1 text-foreground">{item.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Debt-Free Journey Starters</strong>
                <span className="text-sm text-muted-foreground">Individuals feeling overwhelmed by multiple debt accounts who need a structured plan to regain control and choose the right starting point.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Optimizers</strong>
                <span className="text-sm text-muted-foreground">People with stable income who want to mathematically minimize interest payments (Avalanche) to build net worth faster.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Couples Merging Finances</strong>
                <span className="text-sm text-muted-foreground">Newlyweds bringing separate debts into a marriage who need a unified, neutral strategy to tackle their combined liabilities.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Dave Ramsey Followers</strong>
                <span className="text-sm text-muted-foreground">Fans of the "Baby Steps" program looking to visualize exactly how the Debt Snowball will accelerate their timeline.</span>
              </div>
            </div>
          </div>

          <Separator className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>The Behavioral Gap:</strong> The calculator assumes you will execute the plan perfectly every month. In reality, unexpected expenses (car repairs, medical bills) often cause pauses in the payoff journey.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Variable Interest Rates:</strong> This tool projects using today's interest rates. If the Federal Reserve raises rates, credit card APRs will increase, extending your actual payoff timeline.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Minimum Payment Changes:</strong> As balances decrease, credit card issuers often lower the minimum payment required. Our calculator typically assumes you maintain the standard initial commitment, which is the key to accelerated payoff.</span>
              </li>
            </ul>
          </div>

          <Separator className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-green-600" />
              Real-World Scenarios
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The "Psychological Win" Seeker</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> Sarah has 5 debts. Three are under $500, but they all have similar interest rates (around 15%).<br />
                  <strong>Best Fit:</strong> <span className="font-semibold">Snowball.</span> By paying off those three small debts in just a few months, she simplifies her life and gains massive momentum, even if she pays $20 more in interest over the long run.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: The "Predatory Loan" Victim</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  <strong>Scenario:</strong> Mark has a large $15,000 personal loan at 9% and a smaller $2,000 payday loan at 400% APR.<br />
                  <strong>Best Fit:</strong> <span className="font-semibold">Avalanche.</span> The math here is undeniable. That 400% loan is a financial emergency. Paying anything else first—even if smaller—would be financially disastrous.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Debt Snowball / Avalanche Calculator is a powerful planning tool designed to visualize your journey to debt freedom.</p>
          <p>It compares the two most effective repayment strategies, helping you balance mathematical optimization (Avalanche) with psychological momentum (Snowball).</p>
          <p>By inputting your specific debts and budget, you can generate a personalized roadmap that shows exactly when you will be debt-free and how much interest you can save.</p>
        </CardContent>
      </Card>

    </div>
  );
}
