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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  TrendingUp,
  Shield,
  AlertCircle,
  ArrowRight,
  Info,
  BarChart, // Renamed from BarChart3
  DollarSign,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Briefcase,
  Activity,
  User,
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Schema ---
const formSchema = z.object({
  // Revolving Credit (Credit Cards)
  totalCreditCardBalance: z.number().min(0, "Balance cannot be negative"),
  totalCreditLimit: z.number().min(1, "Credit limit must be greater than 0"),

  // Installment Loans (Mortgage, Auto, Student)
  monthlyInstallmentPayments: z.number().min(0).default(0),

  // Income
  monthlyGrossIncome: z.number().min(1, "Income must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  utilizationRate: number;
  dtiRate: number;
  utilizationStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  dtiStatus: 'Healthy' | 'Manageable' | 'High' | 'Critical';
  estimatedScoreImpact: string; // Text description
  scoreImpactSeverity: 'Positive' | 'Neutral' | 'Negative' | 'Severe';
  actionableInsights: string[];
  riskWarnings: string[];
}

export default function CreditScoreImpactEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCreditCardBalance: 2500,
      totalCreditLimit: 10000,
      monthlyInstallmentPayments: 1200,
      monthlyGrossIncome: 6000,
    },
  });

  const getUtilizationStatus = (rate: number) => {
    if (rate <= 10) return 'Excellent';
    if (rate <= 30) return 'Good';
    if (rate <= 50) return 'Fair';
    if (rate <= 75) return 'Poor';
    return 'Critical';
  };

  const getDtiStatus = (rate: number) => {
    if (rate <= 28) return 'Healthy';
    if (rate <= 36) return 'Manageable';
    if (rate <= 43) return 'High';
    return 'Critical';
  };

  const calculate = (values: FormValues) => {
    const utilization = (values.totalCreditCardBalance / values.totalCreditLimit) * 100;

    // DTI = (Total Monthly Debt Payments / Gross Monthly Income)
    // Total Monthly Debt = Installment Payments + Minimum Credit Card Payments 
    // *Estimate Min CC Payment as 3% of balance if unknown, but here we just use balance impact for Utilization
    // Ideally user inputs "Monthly CC Minimums". For simplified model, we will ESTIMATE min payment
    const estimatedMinCCPayment = values.totalCreditCardBalance * 0.03;
    const totalMonthlyDebt = values.monthlyInstallmentPayments + estimatedMinCCPayment;
    const dti = (totalMonthlyDebt / values.monthlyGrossIncome) * 100;

    const utilStatus = getUtilizationStatus(utilization);
    const dtiStatus = getDtiStatus(dti);

    let impactDesc = "Minimal impact.";
    let severity: CalculationResult['scoreImpactSeverity'] = 'Neutral';

    if (utilization > 80 || dti > 45) {
      impactDesc = "Severe negative impact likely (50+ points drop). Lenders view this as high risk.";
      severity = 'Severe';
    } else if (utilization > 50 || dti > 36) {
      impactDesc = "Moderate negative impact (20-40 points drop). Approval odds decrease.";
      severity = 'Negative';
    } else if (utilization < 10 && dti < 28) {
      impactDesc = "Positive impact. Positioned for top-tier interest rates.";
      severity = 'Positive';
    }

    // Insights Generation
    const insights = [];
    if (utilization > 30) insights.push(`Pay down $${Math.ceil(values.totalCreditCardBalance - (values.totalCreditLimit * 0.30))} to reach the 30% utilization "safe zone".`);
    if (utilization < 5) insights.push("Don't hit 0% utilization on every card. Showing explicit activity (1-3%) is often better than 0% for scoring algorithms.");
    if (dti > 43) insights.push("A DTI over 43% is the typical cut-off for Qualified Mortgages. Reduce recurring monthly obligations.");

    // Risks
    const risks = [];
    if (estimatedMinCCPayment > (values.monthlyGrossIncome * 0.15)) risks.push("You are spending >15% of income just on minimum credit card payments.");
    if (utilization > 90) risks.push("Maxed out cards are the single biggest red flag to card issuers, risking 'Clawbacks' (limit reductions).");

    setResult({
      utilizationRate: utilization,
      dtiRate: dti,
      utilizationStatus: utilStatus,
      dtiStatus: dtiStatus,
      estimatedScoreImpact: impactDesc,
      scoreImpactSeverity: severity,
      actionableInsights: insights,
      riskWarnings: risks
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Credit Health Parameters
          </CardTitle>
          <CardDescription>
            Enter your financial details to estimate the impact on your credit score and loan eligibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Section 1: Revolving Credit */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
                    <CreditCard className="h-4 w-4" /> Revolving Credit (Credit Cards)
                  </h4>
                  <FormField
                    control={form.control}
                    name="totalCreditCardBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Credit Card Balance ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2500" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalCreditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Credit Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <CardDescription className="text-xs">Sum of limits on ALL cards.</CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section 2: Installment & Income */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
                    <DollarSign className="h-4 w-4" /> Income & Fixed Debts
                  </h4>
                  <FormField
                    control={form.control}
                    name="monthlyInstallmentPayments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Installment Loan Payments ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1200" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <CardDescription className="text-xs">Auto loans, mortgages, student loans, etc.</CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyGrossIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Gross Income ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="6000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <CardDescription className="text-xs">Income before taxes.</CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Credit Impact
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Utilization Card */}
            <Card className={cn("border-t-4", result.utilizationRate > 30 ? "border-t-red-500" : "border-t-green-500")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Credit Utilization</CardTitle>
                    <CardDescription>Impact on Score (30% Weight)</CardDescription>
                  </div>
                  <Badge variant={result.utilizationStatus === 'Excellent' ? 'default' : result.utilizationStatus === 'Good' ? 'secondary' : 'destructive'}>
                    {result.utilizationStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">{result.utilizationRate.toFixed(1)}%</div>
                <Progress value={Math.min(result.utilizationRate, 100)} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ideally kept under 30%. Under 10% is gold standard.
                </p>
              </CardContent>
            </Card>

            {/* DTI Card */}
            <Card className={cn("border-t-4", result.dtiRate > 36 ? "border-t-amber-500" : "border-t-blue-500")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Debt-to-Income (DTI)</CardTitle>
                    <CardDescription>Loan Approval Odds</CardDescription>
                  </div>
                  <Badge variant={result.dtiStatus === 'Healthy' ? 'default' : 'outline'}>
                    {result.dtiStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">{result.dtiRate.toFixed(1)}%</div>
                <Progress value={Math.min(result.dtiRate, 100)} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Lenders prefer DTI under 36%. Mortgage cap is often 43%.
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Impact Banner */}
          <Alert className={cn(
            result.scoreImpactSeverity === 'Positive' ? "bg-green-50 border-green-200" :
              result.scoreImpactSeverity === 'Severe' ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
          )}>
            {result.scoreImpactSeverity === 'Positive' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Info className="h-5 w-5 text-blue-600" />}
            <AlertTitle className={cn(
              result.scoreImpactSeverity === 'Positive' ? "text-green-800" : "text-blue-800"
            )}>Estimated Credit Score Impact</AlertTitle>
            <AlertDescription className={cn(
              result.scoreImpactSeverity === 'Positive' ? "text-green-700" : "text-blue-700"
            )}>
              {result.estimatedScoreImpact}
            </AlertDescription>
          </Alert>

          {/* Insights & Risk Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb className="h-5 w-5" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.actionableInsights.length > 0 ? result.actionableInsights.map((insight, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No specific actions needed. Keep maintaining your current habits!</p>}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.riskWarnings.length > 0 ? result.riskWarnings.map((warn, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-red-800 dark:text-red-300">{warn}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No critical risks detected based on these metrics.</p>}
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
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components of credit scoring models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <CreditCard className="h-4 w-4" />
                Utilization Ratio (30% of Score)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The percentage of your available credit you are using. High utilization suggests over-leveraging.
              </p>
              <ul className="space-y-1">
                <li className="text-xs flex gap-2"><CheckCircle2 className="h-3 w-3 mt-0.5" /> 0-10%: Excellent</li>
                <li className="text-xs flex gap-2"><CheckCircle2 className="h-3 w-3 mt-0.5" /> 10-30%: Good</li>
                <li className="text-xs flex gap-2 text-red-500"><AlertCircle className="h-3 w-3 mt-0.5" /> 30%+: Harmful</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                <Briefcase className="h-4 w-4" />
                Debt-to-Income (Approval Factor)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Not a direct part of FICO score, but critical for lenders determining if you can afford a new loan.
              </p>
              <ul className="space-y-1">
                <li className="text-xs flex gap-2"><CheckCircle2 className="h-3 w-3 mt-0.5" /> &lt;36%: Preferred</li>
                <li className="text-xs flex gap-2 text-amber-500"><AlertCircle className="h-3 w-3 mt-0.5" /> 43%: Mortgage Limit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Debt Repayment", url: "/finance/debt-snowball-avalanche-repayment-calculator", icon: <TrendingUp className="h-5 w-5 text-indigo-500" />, desc: "Plan your payoff strategy" },
              { name: "Home Affordability", url: "/finance/home-affordability-calculator", icon: <Shield className="h-5 w-5 text-green-500" />, desc: "See what DTI allows you to buy" },
              { name: "Credit Card Payoff", url: "/finance/credit-card-payoff-calculator", icon: <CreditCard className="h-5 w-5 text-red-500" />, desc: "Eliminate revolving debt" },
              { name: "Emergency Fund", url: "/finance/emergency-fund-calculator", icon: <Shield className="h-5 w-5 text-blue-500" />, desc: "Safety net sizing" },
              { name: "Savings Goal", url: "/finance/savings-goal-timeline-calculator", icon: <DollarSign className="h-5 w-5 text-purple-500" />, desc: "Plan for big purchases" },
              { name: "Loan Amortization", url: "/finance/amortization-schedule-generator", icon: <BarChart className="h-5 w-5 text-amber-500" />, desc: "Understand interest costs" },
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
        <meta itemProp="headline" content="Credit Score Impact: Understanding Utilization and Debt Ratios" />
        <meta itemProp="author" content="Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-11-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Credit Score Logic: How Debt Ratios Define Your Financial Power</h1>
        <p className="text-lg text-foreground/80">
          Your credit score is not a random number; it is a calculated assessment of risk. Among the five factors that make up your FICO® Score, <strong>Amounts Owed (Credit Utilization)</strong> accounts for 30% of the total—second only to Payment History. Understanding how this ratio works is the fastest "hack" to improving your score quickly.
        </p>

        <div className="my-8 p-6 bg-muted/30 rounded-xl border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary font-medium">
            <li><a href="#utilization" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Credit Utilization Explained</a></li>
            <li><a href="#dti" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Why DTI Matters to Lenders</a></li>
            <li><a href="#30percent" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The 30% Rule Myth vs Reality</a></li>
            <li><a href="#strategies" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Strategies to Boost Score Fast</a></li>
          </ul>
        </div>

        <h2 id="utilization" className="text-2xl font-bold text-foreground mt-8 mb-4">Credit Utilization: The 30% Slice of Your Score</h2>
        <p>
          Credit utilization refers to the ratio of your outstanding credit card balances to your credit limits. It measures "how much of your available rope you are using."
        </p>
        <div className="p-4 bg-muted border rounded-lg text-center font-mono my-4 text-sm md:text-base">
          Utilization Rate = (Total Credit Card Balances / Total Credit Limits) × 100
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Per-Card vs. Total Utilization</h3>
        <p>
          FICO scoring models look at both your <em>overall</em> utilization (all cards combined) and your <em>individual</em> card utilization. Having one maxed-out card can hurt your score even if your total utilization is low because other cards are empty.
        </p>

        <h2 id="dti" className="text-2xl font-bold text-foreground mt-8 mb-4">Debt-to-Income (DTI): The Phantom Metric</h2>
        <p>
          Contrary to popular belief, <strong>Income is NOT part of your Credit Score.</strong> You can have a perfect 850 score with a $20,000 salary, or a poor 500 score with a $200,000 salary.
        </p>
        <p>
          However, DTI is critical for the <em>application</em> process. When you apply for a mortgage or auto loan, the lender calculates your DTI to see if you have enough cash flow to make payments.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Front-End DTI:</strong> Housing costs / Gross Income.</li>
          <li><strong>Back-End DTI:</strong> All debt payments (housing + cards + loans) / Gross Income.</li>
        </ul>
        <p className="mt-2">Most mortgage lenders cap the Back-End DTI at <strong>43%</strong> for Qualified Mortgages. If you are above this, you may be denied regardless of your credit score.</p>

        <h2 id="30percent" className="text-2xl font-bold text-foreground mt-8 mb-4">The '30% Rule' Myth vs. Reality</h2>
        <p>
          You often hear "keep utilization below 30%." While this is a good safety zone to avoid massive score damage, it is <strong>not</strong> the optimal level for the highest score.
        </p>
        <p>
          <strong>The Gold Standard is 1% to 10%.</strong> Data shows that consumers with the highest credit scores (800+) typically have utilization rates averaging around 7%.
        </p>
        <p>
          <em>Crucial Note:</em> Avoid 0% utilization across ALL cards for months. "All Zero Except One" (AZEO) is a popular strategy where you leave a tiny balance (e.g., $10) on one card to report to the bureau, proving you are using credit responsibly, while paying off all others in full.
        </p>

        <h2 id="strategies" className="text-2xl font-bold text-foreground mt-8 mb-4">Tactical Moves to Improve Your Ratio</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <strong className="block text-foreground">The Mid-Cycle Payment Trick</strong>
            Credit card issuers typically report your balance to bureaus on your <em>Statement Date</em>, not your Due Date. If you pay off your balance 3 days <strong>before</strong> the statement closes, the issuer will report a $0 (or very low) balance, instantly boosting your utilization score for that month.
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-1">
            <strong className="block text-foreground">Request a Limit Increase</strong>
            Call your issuer and ask for a credit limit increase. If you owe $1,000 and your limit goes from $2,000 to $4,000, your utilization drops from 50% to 25% instantly—without paying a dime. (Ask if it requires a "Hard Pull" first).
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
            Common queries about credit scores and debt ratios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { q: "Does checking my own ratio hurt my score?", a: "No. Checking your own credit or calculating these ratios is a 'Soft Inquiry' and has zero impact on your credit score." },
            { q: "How often does utilization update?", a: "Usually once a month, typically a few days after your credit card statement closing date. If you pay off a big balance today, it may take 30-45 days to reflect in your score." },
            { q: "Is it better to close unused cards?", a: "Generally, NO. Closing a card reduces your Total Credit Limit, which mathematically spikes your utilization ratio on remaining balances. Keep old no-fee cards open to anchor your credit age." },
            { q: "Does DTI affect my credit score?", a: "No. Credit bureaus do not know your income. DTI is calculated internally by lenders during a loan application, not by FICO." },
            { q: "What is a 'good' credit utilization ratio?", a: "Below 30% is considered responsible. Below 10% is considered excellent. Above 50% is considered risky and will damage your score." },
            { q: "Do installment loans count toward utilization?", a: "Not in the same way. While high loan balances affect 'Amounts Owed,' the 'Utilization Ratio' specifically refers to Revolving Credit (credit cards). Maxing out a credit card hurts you much more than having a large mortgage." },
            { q: "Can I get a mortgage with only credit card debt?", a: "Yes, but high card balances inflate your DTI. If your minimum payments on cards are high, you may qualify for a smaller mortgage loan amount." },
            { q: "What is the AZEO method?", a: "'All Zero Except One'. It's a strategy where you pay all cards to $0 before the statement date, except one card which you leave with a small balance ($10-$20). This maximizes points for 'Amounts Owed'." },
            { q: "Does business debt count?", a: "Usually no. Most business credit cards do not report to personal credit bureaus unless you default, so high utilization there often won't hurt your personal score." },
            { q: "How fast can my score recover after paying off debt?", a: "Very fast. Utilization has no 'memory'. The moment a new low balance is reported, the score recalculates as if the high balance never existed. It is the easiest factor to fix." },
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
            Who Should Use This Tool?
          </CardTitle>
          <CardDescription>
            Scenarios where monitoring these metrics is critical
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Mortgage Applicants</strong>
              <span className="text-sm text-muted-foreground">Every point counts when securing a 30-year rate. Optimizing utilization 2 months before applying can save thousands.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Debt Payoff Planners</strong>
              <span className="text-sm text-muted-foreground">Visualizing how paying off $500 lowers your utilization helps motivate you to stick to the plan.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Credit Rebuilders</strong>
              <span className="text-sm text-muted-foreground">Those recovering from bankruptcy or mistakes need to keep utilization ultra-low to rebuild trust.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Limit Increase Seekers</strong>
              <span className="text-sm text-muted-foreground">Use this to simulate what happens if your limit doubles—how much "safer" your debt looks.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The "Just Before Closing" Panic</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> Alex wants to buy a car. His score is 680 (Good). He pays down a maxed-out credit card by $1,000.<br />
                  <strong>Result:</strong> His utilization drops from 90% to 70%. Score jumps 30 points. He now qualifies for the 1.9% financing tier instead of 5.9%.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: High Income, Low Approval</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  <strong>Scenario:</strong> Sarah earns $200k/year but has $5k/month in student loans and lease payments. Her DTI is 45%.<br />
                  <strong>Result:</strong> Despite high income, she is denied a mortgage. She uses this tool to see she needs to pay off the car lease ($600/mo) to drop DTI below 43% and qualify.
                </p>
              </div>
            </div>
          </div>

          <Separator className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Estimation Only:</strong> Credit scores use proprietary "black box" algorithms (FICO 8, VantageScore 3.0) that vary by bureau. This tool provides a close estimate, not a guarantee.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Timing Delays:</strong> You might pay off a debt today, but your score won't react until the lender reports it next month.</span>
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
          <p>The Credit Score Impact Estimator focuses on two critical levers: Credit Utilization and Debt-to-Income (DTI).</p>
          <p>Utilization (30%) is the second biggest factor in your credit score, while DTI determines whether a bank will approve your loan application.</p>
          <p>Use this tool to simulate how paying down balances or increasing credit limits can optimize your financial profile for upcoming loan applications.</p>
        </CardContent>
      </Card>

    </div>
  );
}
