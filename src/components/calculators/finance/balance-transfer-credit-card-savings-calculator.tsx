'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  CreditCard,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  PiggyBank,
  BookOpen,
  HelpCircle,
  Briefcase,
  Shield,
  ArrowRight,
  XCircle,
  Clock,
  Target // Ensure Target is imported for scenarios icon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Schema ---
const formSchema = z.object({
  transferBalance: z.number().min(100, "Balance must be at least $100"),
  currentApr: z.number().min(0.1, "Current APR usually > 0"),
  monthlyPayment: z.number().min(10, "Payment must strictly be positive"),

  // New Card Details
  promoApr: z.number().min(0).default(0),
  promoDurationMonths: z.number().min(1, "Promo period must be at least 1 month"),
  transferFeePercent: z.number().min(0).default(3),
  postPromoApr: z.number().min(0.1, "Post-promo APR required roughly"),
});

type FormValues = z.infer<typeof formSchema>;

interface PayoffScenario {
  totalPaid: number;
  totalInterest: number;
  monthsToPayoff: number;
  debtRemainingAtProMoEnd: number;
}

interface CalculationResult {
  currentScenario: PayoffScenario;
  transferScenario: PayoffScenario;
  netSavings: number;
  breakEvenMonth: number;
  isProfitable: boolean;
  profitableInMonths: number;
  feeAmount: number;
  payoffDateString: string;
}

export default function BalanceTransferCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transferBalance: 5000,
      currentApr: 24.99,
      monthlyPayment: 250,
      promoApr: 0,
      promoDurationMonths: 18,
      transferFeePercent: 3,
      postPromoApr: 24.99,
    },
  });

  const calculatePayoff = (balance: number, apr: number, monthlyPayment: number, promoMonths: number = 0, promoApr: number = 0, nextApr: number = 0): PayoffScenario => {
    let currentBalance = balance;
    let totalInterest = 0;
    let months = 0;
    let active = true;
    let debtAtPromoEnd = 0;

    // Safety Loop Cap
    while (active && months < 600) {
      months++;

      const isPromo = months <= promoMonths;
      const effectiveApr = isPromo ? promoApr : nextApr;
      const monthlyRate = effectiveApr / 100 / 12;

      const interest = currentBalance * monthlyRate;
      totalInterest += interest;
      currentBalance += interest;

      let payment = monthlyPayment;
      if (currentBalance < payment) {
        payment = currentBalance;
        active = false;
      }
      currentBalance -= payment;

      if (months === promoMonths) {
        debtAtPromoEnd = currentBalance;
      }

      if (currentBalance <= 0.01) {
        active = false;
      }
    }

    return {
      totalPaid: totalInterest + balance, // Note: For transfer scenario, balance includes fee already
      totalInterest,
      monthsToPayoff: months,
      debtRemainingAtProMoEnd: debtAtPromoEnd
    };
  };

  const onSubmit = (values: FormValues) => {
    // 1. Current Scenario (Stay Put)
    const currentScenario = calculatePayoff(
      values.transferBalance,
      values.currentApr,
      values.monthlyPayment,
      0,
      0,
      values.currentApr
    );

    // 2. Transfer Scenario
    const feeAmount = values.transferBalance * (values.transferFeePercent / 100);
    const initialTransferBalance = values.transferBalance + feeAmount;

    const transferScenario = calculatePayoff(
      initialTransferBalance,
      values.currentApr, // Not used, logic handled by params below
      values.monthlyPayment,
      values.promoDurationMonths,
      values.promoApr,
      values.postPromoApr
    );

    const netSavings = currentScenario.totalPaid - transferScenario.totalPaid;

    // Break Even Calculation: When does Interest Saved > Transfer Fee?
    // Monthly interest on old card approx: Balance * (Rate/12)
    // Monthly interest on new card: Balance * (PromoRate/12) usually 0
    // Savings per month = OldInterest - NewInterest
    // Months to break even = Fee / SavingsPerMonth
    const monthlyInterestOld = values.transferBalance * (values.currentApr / 100 / 12);
    const monthlyInterestNew = initialTransferBalance * (values.promoApr / 100 / 12);
    const monthlySavings = monthlyInterestOld - monthlyInterestNew;
    const breakEvenMonth = monthlySavings > 0 ? Math.ceil(feeAmount / monthlySavings) : 999;

    const today = new Date();
    today.setMonth(today.getMonth() + transferScenario.monthsToPayoff);

    setResult({
      currentScenario,
      transferScenario,
      netSavings,
      breakEvenMonth,
      isProfitable: netSavings > 0,
      profitableInMonths: breakEvenMonth,
      feeAmount,
      payoffDateString: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Parameters
          </CardTitle>
          <CardDescription>
            Input your current debt details and the new card offer to see if it makes financial sense.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Current Debt */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4" /> Current Card (High Interest)
                  </h4>
                  <FormField
                    control={form.control}
                    name="transferBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance to Transfer ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentApr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current APR (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="24.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Payment Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="250" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* New Offer */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" /> New Card Offer (0% Promo)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="promoDurationMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Promo Duration (Mos)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="18" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="promoApr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Promo APR (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transferFeePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Transfer Fee (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postPromoApr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Post-Promo APR (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="24.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </div>

              <Button type="submit" className="w-full text-lg h-12">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Savings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">

          {/* Main Savings Banner */}
          <Alert className={cn(
            "border-l-8 flex flex-col justify-center",
            result.isProfitable ? "bg-green-50 border-emerald-500" : "bg-red-50 border-red-500"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-full", result.isProfitable ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                {result.isProfitable ? <PiggyBank className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
              <div>
                <AlertTitle className="text-2xl font-bold text-foreground">
                  {result.isProfitable
                    ? `You could save $${result.netSavings.toFixed(2)}!`
                    : `You would LOSE $${Math.abs(result.netSavings).toFixed(2)}`
                  }
                </AlertTitle>
                <AlertDescription className="text-base text-muted-foreground mt-1">
                  {result.isProfitable
                    ? `By switching, you recoup the $${result.feeAmount.toFixed(0)} transfer fee in just ${result.breakEvenMonth} months.`
                    : `The transfer fee ($${result.feeAmount.toFixed(0)}) outweighs the interest savings. Stick with your current card or find a better offer.`}
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Payment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Timeline Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Debt Free Date</span>
                  <span className="font-bold text-lg">{result.payoffDateString}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Months Faster</span>
                  <span className="font-bold text-green-600">
                    {Math.max(0, result.currentScenario.monthsToPayoff - result.transferScenario.monthsToPayoff)} Months
                  </span>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress during Promo Period</span>
                    <span>{(100 - (result.transferScenario.debtRemainingAtProMoEnd / form.getValues('transferBalance')) * 100).toFixed(0)}% Paid Off</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (result.transferScenario.debtRemainingAtProMoEnd / form.getValues('transferBalance') * 100))} className="h-2" />
                  {result.transferScenario.debtRemainingAtProMoEnd > 0 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Warning: You will still owe ${result.transferScenario.debtRemainingAtProMoEnd.toFixed(0)} when the promo ends.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-500" />
                  Total Cost Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Stay Put Cost</p>
                    <p className="text-lg font-bold text-red-600">${result.currentScenario.totalInterest.toFixed(0)}</p>
                    <span className="text-[10px] text-muted-foreground">Interest Only</span>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Transfer Cost</p>
                    <p className="text-lg font-bold text-green-600">${(result.transferScenario.totalInterest + result.feeAmount).toFixed(0)}</p>
                    <span className="text-[10px] text-muted-foreground">Interest + Fee</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Transfer Fee (Upfront)</span>
                    <span>${result.feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Paid (New Card)</span>
                    <span>${result.transferScenario.totalInterest.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  Strategic Moves
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Automate the "Kill Payment"</h4>
                    <p className="text-xs text-muted-foreground">
                      To finish exactly when the promo ends, calculate Balance / {form.getValues('promoDurationMonths')} months. Set your autopay to exactly this amount.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Don't Close the Old Card</h4>
                    <p className="text-xs text-muted-foreground">
                      Keep your old zero-balance account open to maintain your "Average Age of Accounts" and lower your utilization ratio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm text-red-800 dark:text-red-300">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    DON'T use the new card for spending. New purchases often accrue interest immediately at the high rate, negating your savings.
                  </li>
                  <li className="flex gap-2 text-sm text-red-800 dark:text-red-300">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    DON'T miss a payment. Being even 1 day late can void your 0% promo offer entirely, reverting you to penalty APR (often 29.99%).
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Understanding Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Terms
          </CardTitle>
          <CardDescription>
            Common jargon in balance transfer offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Percent className="h-4 w-4" /> Transfer Fee (3-5%)
              </h4>
              <p className="text-sm text-muted-foreground">
                The upfront cost to move your debt. On a $10,000 transfer, a 3% fee adds $300 to your debt immediately. This is the main "hurdle" you must clear with interest savings.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Calendar className="h-4 w-4" /> Promo Period (12-21 Mos)
              </h4>
              <p className="text-sm text-muted-foreground">
                The golden window where interest is 0%. Your goal is to pay 100% of the debt within this window. Any remaining balance after Month 21 gets hit with the Post-Promo APR.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Debt Repayment", url: "/finance/debt-snowball-avalanche-repayment-calculator", icon: <TrendingDown className="h-5 w-5 text-indigo-500" />, desc: "Avalanche vs Snowball" },
              { name: "Credit Card Payoff", url: "/finance/credit-card-payoff-calculator", icon: <CreditCard className="h-5 w-5 text-red-500" />, desc: "See your payoff date" },
              { name: "Credit Score Impact", url: "/finance/credit-score-impact-estimator-debt-ratio-calculator", icon: <DollarSign className="h-5 w-5 text-green-500" />, desc: "Check utilization impact" },
              { name: "Budget Planner", url: "/finance/monthly-budget-planner-calculator", icon: <DollarSign className="h-5 w-5 text-blue-500" />, desc: "Find extra payment money" },
            ].map((item, i) => (
              <Link key={i} href={item.url} className="block group">
                <Card className="hover:shadow-md transition-all h-full">
                  <CardContent className="p-4 flex gap-3">
                    {item.icon}
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-sm border" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Mastering the Balance Transfer: A Strategic Guide to 0% APR" />
        <meta itemProp="author" content="Financial Strategy Team" />
        <meta itemProp="datePublished" content="2025-10-10" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">The Art of the Balance Transfer: Stop Paying Interest Today</h1>
        <p className="text-lg text-foreground/80">
          A Balance Transfer is one of the most powerful tools in personal finance—if used correctly. It involves moving high-interest debt (often 20% to 30% APR) to a new credit card that offers a temporary 0% interest rate. This acts as a "Cease Fire" on your compounding interest, allowing 100% of your payment to attack the principal balance.
        </p>

        <div className="my-8 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary font-medium">
            <li><a href="#math" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Math: Break-Even Analysis</a></li>
            <li><a href="#risks" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The "Shell Game" Risk</a></li>
            <li><a href="#credit" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Impact on Credit Score</a></li>
            <li><a href="#checklist" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Execution Checklist</a></li>
          </ul>
        </div>

        <h2 id="math" className="text-2xl font-bold text-foreground mt-8 mb-4">The Math: Break-Even Analysis</h2>
        <p>
          Balance transfers are not free. They almost always come with a <strong>Transfer Fee</strong>, typically 3% or 5% of the amount transferred.
        </p>
        <p>
          For example, transferring $10,000 incurs a $300 fee. While $300 sounds like a lot, consider the alternative: keeping that $10,000 on a 24% APR card costs you <strong>$200 per month</strong> in interest.
        </p>
        <p>
          In this scenario, you break even in just 1.5 months ($300 fee / $200 monthly savings). After month 2, entirely pure profit savings begin.
        </p>

        <h2 id="risks" className="text-2xl font-bold text-foreground mt-8 mb-4">The 'Shell Game' Risk</h2>
        <p>
          The danger of balance transfers is behavioral, not mathematical. Banks offer these 0% rates because they know a statistically significant percentage of users will:
        </p>
        <ol className="list-decimal ml-6 space-y-2 mt-4">
          <li>Transfer the debt to the new card.</li>
          <li>Feel relief and "rich" again.</li>
          <li>Run up the balance on the <em>old</em> card again.</li>
        </ol>
        <p className="mt-4">
          If you do this, you have doubled your debt. This is called the "Shell Game"—moving debt around without actually paying it off. To succeed, you must commit to not using <em>either</em> card for new purchases until the debt is gone.
        </p>

        <h2 id="credit" className="text-2xl font-bold text-foreground mt-8 mb-4">Impact on Credit Score</h2>
        <p>
          <strong>Short Term (Dip):</strong> Applying for the new card causes a "Hard Inquiry" (approx. 5 point drop). Opening a new account lowers your "Average Age of Accounts."
        </p>
        <p>
          <strong>Medium Term (Boost):</strong> Your total credit limit increases (New Limit + Old Limit), which drastically lowers your Utilization Ratio. As you pay down the debt interest-free, your score will climb rapidly.
        </p>

        <h2 id="checklist" className="text-2xl font-bold text-foreground mt-8 mb-4">Execution Checklist</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
            <p><strong>Check Your Score:</strong> You typically need Good to Excellent credit (690+) to qualify for the best 0% offers (18-21 months).</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
            <p><strong>Do The Math:</strong> Use this calculator. Ensure your savings &gt; fee.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
            <p><strong>Don't Cancel Old Card:</strong> Once transferred, put the old card in a drawer (sock drawer). Keep it open for credit age, but delete it from Amazon/Apple Pay to remove temptation.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about the transfer process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { q: "Can I transfer debt between cards from the same bank?", a: "Usually, NO. Banks offer these promos to acquire new customers or steal balances from competitors. You typically cannot transfer a Chase balance to another Chase card." },
            { q: "What happens if I miss a payment?", a: "Disaster. Most agreements have a clause that revokes the 0% promo immediately if you are 60 days late (or sometimes even 1 day late), resetting your rate to the penalty APR (29.99%)." },
            { q: "Is the 3% transfer fee negotiable?", a: "Rarely. It is baked into the terms. However, some credit unions or specific cards (like the Chase Slate or Navy Federal) occasionally offer $0 transfer fee promos." },
            { q: "What is 'Deferred Interest'?", a: "A trap. Common in store cards (Home Depot, Best Buy). It says 'No Interest if paid in full by X'. If you owe even $1 at the end, they charge you ALL the interest back to Day 1. Most major bank balance transfers (Citi, Discover) are '0% APR', which is safer—you only pay interest on the remaining balance after the promo." },
            { q: "Can I transfer more than my credit limit?", a: "No. Your transfer is capped by the new card's limit. If you have $10k debt but get approved for a $5k limit, you can only transfer $5k (minus the fee)." },
            { q: "How long does the transfer take?", a: "Typically 3 to 14 days. Continue making payments on your old card until you see the balance hit zero to avoid a late fee." },
            { q: "Can I use the card for new purchases?", a: "Technically yes, but don't. New purchases may not have the 0% rate, and payments might be applied to the 0% balance first, leaving your new purchases to accrue interest. Keep the card 'clean' for debt only." },
            { q: "Does this look bad to lenders?", a: "Not necessarily. It shows you are managing debt actively. However, opening too many cards in a short time (churning) is a red flag." },
            { q: "What if I still have a balance after 18 months?", a: "You will start paying the standard interest rate (e.g., 24%) on the remaining amount. You could try to transfer again to a new card ('surfing'), but approval isn't guaranteed." },
            { q: "Can I transfer other types of debt?", a: "Often yes. Many 'Balance Transfer' checks allow you to pay off car loans, personal loans, or even deposit cash into your checking account, though fees/terms may vary." },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-base mb-1 text-foreground">{item.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Who Is This Tool For?
          </CardTitle>
          <CardDescription>
            Real-world scenarios for balance transfers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">The "Rate Trap" Victim</strong>
              <span className="text-sm text-muted-foreground">Someone stuck with a 29% APR card who is making payments but seeing the balance barely move due to interest.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">The Bonus Anticipator</strong>
              <span className="text-sm text-muted-foreground">You expect a large bonus in 6 months to clear the debt, but want to stop the interest bleeding while you wait.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Strategic Movers</strong>
              <span className="text-sm text-muted-foreground">People with good credit who treat balance transfers as low-cost consolidation loans.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Credit Optimizers</strong>
              <span className="text-sm text-muted-foreground">Those wanting to boost their score by segregating utilization onto a new tradeline.</span>
            </div>
          </div>

          <Separator className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-green-600" />
              Real-World Scenarios
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The Wedding Debt</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> You put $15,000 of wedding expenses on a card. Interest is eating $300/mo. You transfer to an 18-month 0% card.<br />
                  <strong>Result:</strong> Transfer fee is $450. You save $4,500 in interest over 18 months. Net win: $4,050.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Case B: The "Short Window" Mistake</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  <strong>Scenario:</strong> You transfer $5,000 for a $150 fee (3%). The promo period is only 6 months. You can only pay $100/mo.<br />
                  <strong>Result:</strong> You pay $600 of principal. At month 7, the remaining $4,400 gets hit with 25% APR. You saved $150 in interest but paid $150 in fees. Net savings: $0.
                </p>
              </div>
            </div>
          </div>

          <Separator className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations of this Calculator
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Credit Limit Limit:</strong> We assume you can transfer the whole balance. In reality, your new card's limit might be lower than your debt.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Minimum Payments:</strong> We assume a fixed monthly budget. Real minimum payments fluctuate as balances drop.</span>
              </li>
            </ul>
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
          <p>The Balance Transfer Savings Calculator determines if moving your high-interest debt to a 0% APR card is worth the transfer fee.</p>
          <p>It performs a rigorous Break-Even Analysis, showing you exactly how many months it takes for the interest savings to outweigh the upfront cost.</p>
          <p>This tool helps you avoid the "Transfer Fee Trap" and creates a clear timeline for your debt-free date.</p>
        </CardContent>
      </Card>

    </div>
  );
}
