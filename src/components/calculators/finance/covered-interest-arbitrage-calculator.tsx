'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Landmark, Calculator, Info, CheckCircle2, TrendingUp, AlertCircle, ArrowRightLeft, DollarSign, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  investmentAmount: z.number().min(100, "Minimum investment amount is 100"),
  spotRate: z.number().min(0.0001, "Spot Rate must be positive"),
  forwardRate: z.number().min(0.0001, "Forward Rate must be positive"),
  domesticRate: z.number().min(-20).max(100, "Interest Rate must be realistic"),
  foreignRate: z.number().min(-20).max(100, "Interest Rate must be realistic"),
  timeYears: z.number().min(0.01).max(30, "Time period typically less than 30 years"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CoveredInterestArbitrageCalculator() {
  const [result, setResult] = useState<{
    parityForward: number;
    profitAmount: number;
    profitPercent: number;
    arbitrageDirection: string;
    actionPlan: string;
    efficiencyRating: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investmentAmount: 100000,
      spotRate: undefined,
      forwardRate: undefined,
      domesticRate: undefined,
      foreignRate: undefined,
      timeYears: 1.0,
    },
  });

  const calculate = (v: FormValues) => {
    const P = v.investmentAmount;
    const S = v.spotRate;
    const F_market = v.forwardRate; // Actual market forward rate user sees
    const rd = v.domesticRate / 100;
    const rf = v.foreignRate / 100;
    const t = v.timeYears;

    // 1. Calculate Theoretical Parity Forward Rate (Fair Value)
    // Formula: F = S * ((1+rd)/(1+rf))^t
    // We use exponential compounding for consistency with IRP calculator
    const F_parity = S * Math.pow((1 + rd) / (1 + rf), t);

    // 2. Calculate Returns for Two Strategies (Using Parity logic)
    // Strategy A: Invest Domestically
    // End Value = P * (1 + rd)^t
    // (Using simple interest convention for short term <1yr? Let's use compound for consistency)
    const endValueDomestic = P * Math.pow(1 + rd, t);

    // Strategy B: Covered Interest Arbitrage (Convert -> Invest Foreign -> Convert Forward)
    // Convert to Foreign: P / S
    // Invest Foreign: (P / S) * (1 + rf)^t
    // Selling Forward (Convert Foreign back to Domestic at F_market): [(P / S) * (1 + rf)^t] * F_market

    // However, if we are borrowing domestic to invest foreign OR borrowing foreign to invest domestic, it depends on mispricing.
    // Let's compute the Implied Return of Strategy B in Domestic terms using F_market
    const endValueCIA = (P / S) * Math.pow(1 + rf, t) * F_market;

    const profitAmount = endValueCIA - endValueDomestic;
    const profitPercent = (profitAmount / P) * 100;

    // If Profit > 0: Strategy B (Foreign Route) is better.
    // Explanation: F_market is "too high" (Premium too big or Discount too small). You sell Foreign High.
    // Action: Borrow Domestic -> Buy Spot -> Invest Foreign -> Sell Forward.

    // If Profit < 0: Strategy A (Domestic Route) is better.
    // Explanation: F_market is "too low". The foreign hedged return is worse than domestic.
    // Action (Reverse Arbitrage): Borrow Foreign -> Sell Spot (Exchange for Domestic) -> Invest Domestic -> Buy Forward (to pay back foreign loan).
    // Note for Reverse: The profit calc is endValueDomestic - endValueCIA (roughly).

    // Let's standardize the "Arbitrage Profit" as absolute value, and Direction tells us "Foreign" vs "Domestic".

    return {
      F_parity,
      diff: profitAmount,
      diffPct: profitPercent,
      netProfit: Math.abs(profitAmount)
    };
  };

  const getArbitrageDirection = (diff: number) => {
    if (Math.abs(diff) < 0.01) return 'None (Market is Efficient)';
    if (diff > 0) return 'Buy Foreign / Sell Domestic';
    return 'Buy Domestic / Sell Foreign';
  };

  const getActionPlan = (diff: number) => {
    if (Math.abs(diff) < 0.01) return 'No Arbitrage Opportunity. The Market Forward Rate matches the Interest Rate Parity theoretical rate.';
    if (diff > 0) return 'Arbitrage Opportunity: Borrow Domestic, Convert to Foreign (Spot), Invest at Foreign Rate, Sell Forward to lock in profit.';
    return 'Reverse Arbitrage Opportunity: Borrow Foreign, Convert to Domestic (Spot), Invest at Domestic Rate, Buy Forward to pay back loan.';
  };

  const getEfficiencyRating = (diffPct: number) => {
    // How huge is the mispricing?
    const absDiff = Math.abs(diffPct);
    if (absDiff > 1.0) return 'Gross Mispricing';
    if (absDiff > 0.1) return 'Inefficient';
    return 'Efficient';
  };

  const getInsights = (diff: number, diffPct: number) => {
    const insights = [];
    if (Math.abs(diffPct) > 0.5) insights.push('Large deviation detected: High probability of profit even after transaction costs.');
    else insights.push('Small deviation: Transaction costs (bid-ask spread) likely eliminate profit.');

    if (diff > 0) insights.push('Foreign yields (hedged) exceed Domestic yields.');
    else insights.push('Domestic yields exceed Foreign yields (hedged).');

    return insights;
  };

  const getRisks = (diffPct: number) => {
    const risks = [];
    risks.push('Transaction Costs: Bid/Ask spreads on Spot AND Forward legs reduce margin.');
    risks.push('Execution Risk: Prices may move while executing the four legs of the trade.');
    risks.push('Counterparty Risk: Default risk on the forward contract.');
    if (Math.abs(diffPct) > 2) risks.push('Data Alert: Extreme widespread might indicate bad data entry or market crisis.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);

    setResult({
      parityForward: calc.F_parity,
      profitAmount: calc.netProfit,
      profitPercent: Math.abs(calc.diffPct),
      arbitrageDirection: getArbitrageDirection(calc.diff),
      actionPlan: getActionPlan(calc.diff),
      efficiencyRating: getEfficiencyRating(calc.diffPct),
      insights: getInsights(calc.diff, calc.diffPct),
      risks: getRisks(calc.diffPct)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Market & Trade Parameters
          </CardTitle>
          <CardDescription>
            Input current market rates to detect risk-free arbitrage opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Principal (Domestic)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="100000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Time Horizon (Years)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="hidden lg:block"></div> {/* Spacer */}

                <FormField
                  control={form.control}
                  name="spotRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Spot Rate (S)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="e.g. 1.2000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domesticRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Domestic Interest (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 5.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foreignRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Foreign Interest (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 3.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forwardRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Market Forward Rate
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="e.g. 1.2250" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Check For Arbitrage
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Arbitrage Analysis</CardTitle>
                  <CardDescription>Opportunity Detection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.efficiencyRating}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={result.profitAmount > 0 ? "text-green-600 font-medium" : "text-muted-foreground font-medium"}>
                    Potential Profit: {result.profitAmount.toFixed(2)} ({result.profitPercent.toFixed(3)}%)
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2 font-semibold text-primary">{result.arbitrageDirection}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Theoretical Forward</p>
                  <p className="font-medium text-lg">{result.parityForward.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Your Quote</p>
                  <p className="font-medium text-lg">{(form.getValues('forwardRate') ?? 0).toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calculator className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Mispricing</p>
                  <p className={`font-medium text-lg ${result.profitAmount > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {(form.getValues('forwardRate') - result.parityForward).toFixed(5)} units
                  </p>
                </div>
              </div>

              <Alert variant={result.profitAmount > 0 ? "default" : "destructive"}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Execution Plan:</strong> {result.actionPlan}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Market Efficiency Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Why free lunches are rare</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Core Logic: 4-Legged Trade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Arbitrage Profit = [ (Investment / S) × (1 + rf)^t × Forward ] - [ Investment × (1 + rd)^t ]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The formula compares the final value of investing domestically (Strategy A) vs. converting, investing abroad, and hedoning back via a Forward Contract (Strategy B). If the two differ, an arbitrage window is open.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other derivative and parity tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/interest-rate-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">IRP Calculator</p>
                      <p className="text-sm text-muted-foreground">Theoretical Rates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/currency-forward-points-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Forward Points</p>
                      <p className="text-sm text-muted-foreground">Pips & Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/black-scholes-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Black-Scholes Calc</p>
                      <p className="text-sm text-muted-foreground">Derivative Pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Covered Interest Arbitrage (CIA)" />
        <meta itemProp="description" content="Master Covered Interest Arbitrage. Learn how to identify risk-free profit opportunities by exploiting mispricings between Spot, Forward, and Interest Rates." />
        <meta itemProp="keywords" content="Covered Interest Arbitrage, CIA, Forex Arbitrage, Risk-Free Profit, Forward Premium, Interest Rate Parity, Cash and Carry Trade" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-guide-cia" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Covered Interest Arbitrage: Finding the &quot;Free Lunch&quot;</h1>
        <p className="text-lg italic text-muted-foreground">In theory, risk-free profits shouldn&apos;t exist. In practice, they appear briefly before the market devours them.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Covered Interest Arbitrage?</a></li>
          <li><a href="#mechanics" className="hover:underline">The 4-Step Mechanism</a></li>
          <li><a href="#example" className="hover:underline">Step-by-Step Example</a></li>
          <li><a href="#barriers" className="hover:underline">Why Retail Traders Fail at CIA</a></li>
          <li><a href="#risks" className="hover:underline">Hidden Risks in a "Risk-Free" Trade</a></li>
        </ul>
        <hr />

        {/* DEFINITION */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Covered Interest Arbitrage (CIA)?</h2>
        <p>Covered Interest Arbitrage (CIA) is a trading strategy that exploits temporary inefficiencies in the forex market. It happens when the interest rate differential between two countries is not exactly reflected in the forward exchange rate.</p>
        <p>It is called <strong>Covered</strong> because the exchange rate risk is completely eliminated (hedged) using a Forward Contract. You are not betting on the currency going up or down; you are locking in a mathematical profit based on pricing errors.</p>
        <hr />

        {/* MECHANICS */}
        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 4-Step Mechanism</h2>
        <p>To execute a CIA trade, you typically perform four simultaneous actions:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Borrow</strong> currency A (Domestic).</li>
          <li><strong>Convert</strong> currency A to currency B (Foreign) at the Spot Rate.</li>
          <li><strong>Invest</strong> currency B at the Foreign interest rate.</li>
          <li><strong>Sell</strong> the future proceeds of currency B forward (using a Forward Contract) to convert back to currency A at maturity.</li>
        </ol>
        <p>If the profit from this loop is greater than interest you owe on the loan, you keep the difference. This is a pure arbitrage profit.</p>
        <hr />

        {/* EXAMPLE */}
        <h2 id="example" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Step-by-Step Example</h2>
        <p>Let's say:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>US Interest Rate: <strong>2%</strong></li>
          <li>UK Interest Rate: <strong>4%</strong></li>
          <li>Spot Rate: <strong>1.50 USD/GBP</strong></li>
          <li>Forward Rate (1 yr): <strong>1.48 USD/GBP</strong></li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation:</h3>
        <p>1. Borrow $1,000,000 at 2%. In one year, you owe <strong>$1,020,000</strong>.</p>
        <p>2. Convert $1,000,000 to GBP at 1.50. You get <strong>£666,666</strong>.</p>
        <p>3. Invest £666,666 at 4%. In one year, you have £666,666 × 1.04 = <strong>£693,333</strong>.</p>
        <p>4. Sell forward at 1.48. Convert £693,333 back to USD. £693,333 × 1.48 = <strong>$1,026,133</strong>.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Result:</h3>
        <p>Proceeds: $1,026,133<br />Loan Repayment: $1,020,000<br /><strong>Net Profit: $6,133</strong></p>
        <p>You made $6,133 without using any of your own money and taking zero market risk.</p>
        <hr />

        {/* BARRIERS */}
        <h2 id="barriers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Retail Traders Can't Do This</h2>
        <p>If it's so easy, why isn't everyone rich? Friction.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Bid-Ask Spreads:</strong> Banks charge a spread on Spot, Forward, and Rates. You buy at the high price and sell at the low price. This eats up small margins instantly.</li>
          <li><strong>Capital Access:</strong> You cannot borrow at the "Risk-Free Rate" (Libor/Sofr). You borrow at Retail rates (Prime + X), which destroys the math.</li>
          <li><strong>Size:</strong> Arbitrage usually requires millions of dollars to generate meaningful absolute profit.</li>
        </ul>
        <hr />

        {/* RISKS */}
        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hidden Risks</h2>
        <p>Even for banks, CIA is not perfectly safe:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Counterparty Risk:</strong> The bank on the other side of your Forward contract could go bankrupt (Lehman Brothers scenario).</li>
          <li><strong>Operational Risk:</strong> If one leg of the trade fails or delays execution by seconds, the market moves and the profit vanishes.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers on arbitrage trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between CIA and Carry Trade?</h4>
              <p className="text-muted-foreground">
                In CIA, you hedge your risk with a forward contract. In Carry Trade, you do NOT hedge; you hope the exchange rate stays stable. CIA is risk-free (theoretically), Carry Trade is high risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How fast do these opportunities disappear?</h4>
              <p className="text-muted-foreground">
                Milliseconds. High-Frequency Trading (HFT) algorithms constantly scan for these discrepancies and execute trades instantly, forcing the prices back into alignment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Which way does the arbitrage force prices?</h4>
              <p className="text-muted-foreground">
                Capital flows into the undervalued asset. If the Forward is too high, everyone sells it. This selling pressure drives the Forward price down until Parity is restored.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this work with crypto?</h4>
              <p className="text-muted-foreground">
                Yes, this is very popular in crypto via &quot;Cash and Carry.&quot; Buying Spot Bitcoin and selling Futures Bitcoin (when futures are at a premium) locks in the spread risk-free.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;Negative Basis&quot;?</h4>
              <p className="text-muted-foreground">
                A situation where CIA dictates a profit, but banks cannot execute it due to balance sheet constraints (regulations). This leaves money on the table, creating a persistent anomaly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do I need a Forward Contract?</h4>
              <p className="text-muted-foreground">
                Yes. Without a Forward Contract, you are exposed to FX risk. If the currency crashes, you lose money. With the contract, your exchange rate in the future is guaranteed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if interest rates change?</h4>
              <p className="text-muted-foreground">
                If you have already locked in your trade, interest rate changes don&apos;t affect your profit (assuming fixed rate borrowing). The market spots/forwards will move for new entrants, but your contract is set.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use Futures instead of Forwards?</h4>
              <p className="text-muted-foreground">
                Yes, Futures are exchange-traded versions of Forwards. They are standardized and liquid, making them easier for retail traders to access than OTC Forwards.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is &quot;Domestic&quot; usually USD?</h4>
              <p className="text-muted-foreground">
                It doesn&apos;t have to be. But the USD is the world reserve currency, so most textbooks and interbank quotes use USD as the reference point for calculations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is profit guaranteed?</h4>
              <p className="text-muted-foreground">
                Mathematically, yes. Practically, no. Execution slippage, wide spreads, and counterparty defaults are real risks that can turn a theoretical profit into a loss.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Covered Interest Arbitrage Calculator identifies deviations from market efficiency.</p>
          <p>It calculates the net profit of a fully hedged cross-currency investment strategy.</p>
          <p>While theoretical opportunities are rare for individuals, this tool demonstrates the mechanics of global capital flows.</p>
        </CardContent>
      </Card>
    </div>
  );
}
