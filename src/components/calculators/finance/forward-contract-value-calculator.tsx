'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Handshake, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Shield, Clock, FunctionSquare, CheckCircle2, ArrowRight, Activity, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

const formSchema = z.object({
  contractType: z.enum(['long', 'short']),
  spotPrice: z.number().positive('Spot price must be positive'),
  deliveryPrice: z.number().positive('Delivery price must be positive'),
  riskFreeRate: z.number().min(-100).max(100),
  dividendYield: z.number().min(0).default(0),
  timeToMaturity: z.number().positive('Time must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForwardContractValueCalculator() {
  const [result, setResult] = useState<{
    value: number;
    spotPV: number;
    strikePV: number;
    moneyness: string;
    profitStatus: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractType: 'long',
      spotPrice: undefined,
      deliveryPrice: undefined,
      riskFreeRate: undefined, // User must input
      dividendYield: 0,
      timeToMaturity: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // Convert percentages
    const r = v.riskFreeRate / 100;
    const q = v.dividendYield / 100;
    const t = v.timeToMaturity;

    // Calculate Present Value of Spot (adjusted for dividends)
    // S * e^(-q*t)
    const spotPV = v.spotPrice * Math.exp(-q * t);

    // Calculate Present Value of Delivery Price (Strike)
    // K * e^(-r*t)
    const strikePV = v.deliveryPrice * Math.exp(-r * t);

    // Calculate Value
    let val = 0;
    if (v.contractType === 'long') {
      val = spotPV - strikePV;
    } else {
      val = strikePV - spotPV;
    }

    // Determine Moneyness / Status
    let profitStatus = 'At the Money';
    if (val > 0) profitStatus = 'In the Money (Profit)';
    else if (val < 0) profitStatus = 'Out of the Money (Loss)';

    return {
      value: val,
      spotPV,
      strikePV,
      profitStatus
    };
  };

  const getRecommendation = (val: number, type: string) => {
    if (val > 0) {
      return `The position is currently profitable. Consider determining if credit risk warrants realizing gains early via offset.`;
    } else if (val < 0) {
      return `The position is currently underwater. Monitor margin requirements (if collateralized) or prepare for potential settlement payments.`;
    }
    return `The contract is effectively at par. No significant exposure currently.`;
  };

  const getInsights = (val: number, type: string, r: number, q: number) => {
    const insights = [];
    if (type === 'long') {
      insights.push('Value increases as Spot Price rises.');
      insights.push('Value decreases as Interest Rates rise ( PV of Strike decreases).');
    } else {
      insights.push('Value increases as Spot Price falls.');
      insights.push('Value increases as Interest Rates rise (PV of Strike decreases, benefiting Short who receives Strike). wait no - Short pays asset receives Strike.');
      // Actually: Short Payoff = K - S_T.
      // Value Short = PV(K) - PV(S).
      // If R rises, PV(K) falls. So Value Short FALLS.
      insights.push('Value decreases as Interest Rates rise (Present Value of strike price received is lower).');
    }

    if (q > 0) {
      insights.push(`Dividend yield of ${(q * 100).toFixed(2)}% reduces the effective spot exposure value.`);
    }

    return insights;
  };

  const getRisks = () => {
    const risks = [];
    risks.push('Counterparty Risk: OTC forwards are subject to default risk.');
    risks.push('Illiquidity: Entering or exiting before maturity is difficult/costly.');
    risks.push('Mark-to-Market swings may trigger collateral calls (CSA).');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      value: calc.value,
      spotPV: calc.spotPV,
      strikePV: calc.strikePV,
      moneyness: calc.profitStatus, // simplification
      profitStatus: calc.profitStatus,
      recommendation: getRecommendation(calc.value, values.contractType),
      insights: getInsights(calc.value, values.contractType, values.riskFreeRate / 100, values.dividendYield / 100),
      risks: getRisks()
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Contract Parameters
          </CardTitle>
          <CardDescription>
            Valuation of existing Forward Contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Position Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="long" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Long (Buy Asset)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="short" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Short (Sell Asset)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="spotPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Spot Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 100.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Delivery Price (K) ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Original agreed price, e.g. 95.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5.0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dividendYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dividend Yield (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.0 (Optional)"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeToMaturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time to Delivery (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.5"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Value
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Valuation Result</CardTitle>
                  <CardDescription>Current Mark-to-Market Value</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.value >= 0 ? '+' : ''}{result.value.toFixed(2)}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.profitStatus}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">PV of Spot</p>
                  <p className="text-lg font-bold">{result.spotPV.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">PV of Delivery</p>
                  <p className="text-lg font-bold">{result.strikePV.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Position</p>
                  <Badge variant="outline" className="uppercase">{form.getValues('contractType')}</Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assessment:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <ArrowRight className="h-6 w-6" />
                  Value Drivers
                </CardTitle>
                <CardDescription>Sensitivity Check</CardDescription>
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
                  Risk Factors
                </CardTitle>
                <CardDescription>Crucial considerations for Forwards</CardDescription>
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
            <FunctionSquare className="h-5 w-5" />
            Valuation Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              V_long = (S × e^(-qt)) - (K × e^(-rt))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Valuation compares the Present Value of the Spot Asset (adjusted for dividend yield <strong>q</strong>) against the Present Value of the Delivery Price <strong>K</strong> (discounted by risk-free rate <strong>r</strong>). For a Short position, the formula is reversed.
          </p>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Why mark-to-market?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Corporate Treasurers
              </h4>
              <p className="text-sm text-muted-foreground">
                Monitor the value of FX or Commodity hedges. If a hedge is deeply "out of the money," it may require posting collateral or impact earnings reports.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Credit Risk Officers
              </h4>
              <p className="text-sm text-muted-foreground">
                Assess counterparty exposure. A positive forward value represents a credit risk (if the counterparty defaults, you lose the profit).
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Fund Accountants
              </h4>
              <p className="text-sm text-muted-foreground">
                Perform daily or monthly Mark-to-Market (MtM) valuations for Net Asset Value (NAV) calculations.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Speculators
              </h4>
              <p className="text-sm text-muted-foreground">
                Determine the profit to be realized if a position is closed out early (by entering an offsetting contract).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The <strong>Forward Contract Value Calculator</strong> brings transparency to Over-the-Counter (OTC) derivatives.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>It distinguishes between the <strong>Initial Price</strong> (where value is zero) and the <strong>Current Value</strong> (which fluctuates).</li>
            <li>It highlights how interest rates and spot prices push the value in favor of the Long or Short party.</li>
            <li>It is the essential tool for managing the financial health of a derivatives book.</li>
          </ul>
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
            Tools for derivatives and interest rate analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/cost-of-carry-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Cost of Carry</p>
                      <p className="text-sm text-muted-foreground">Futures pricing model</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-rate-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Interest Rate Parity</p>
                      <p className="text-sm text-muted-foreground">FX Forward Pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/present-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Present Value</p>
                      <p className="text-sm text-muted-foreground">Time value of money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="headline" content="Valuing Forward Contracts: Mark-to-Market Explained" />
        <meta itemProp="description" content="A professional guide to Forward Contract Valuation. Understand how to calculate the value of long and short positions using spot prices, delivery prices, and interest rates." />
        <meta itemProp="keywords" content="forward contract valuation, mark to market forward, formula for forward value, derivatives pricing, counterparty risk, OTC forwards" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-10" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Forward Contract Valuation</h1>
        <p className="text-lg italic text-muted-foreground">Unlike Futures, Forward contracts are not settled daily. Their value fluctuates wildly between inception and maturity. Understanding how to mark these positions to market is critical for risk management.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Pricing vs. Valuation</a></li>
          <li><a href="#formula" className="hover:underline">The Valuation Formula</a></li>
          <li><a href="#drivers" className="hover:underline">Key Value Drivers</a></li>
          <li><a href="#risks" className="hover:underline">Forward Specific Risks</a></li>
          <li><a href="#applications" className="hover:underline">Real-World Examples</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">Pricing vs. Valuation</h2>
        <p>
          It is crucial to distinguish between <strong>Pricing</strong> and <strong>Valuation</strong> in derivatives.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Pricing</strong> determines the <strong>Delivery Price (K)</strong> at the start of the contract such that the initial value is ZERO.</li>
          <li><strong>Valuation</strong> determines the dollar value of that contract at any later point in time (t) before maturity, as market conditions change.</li>
        </ul>
        <p className="mt-4">
          When you enter a forward contract, you typically pay nothing upfront. The value is zero. As the spot price moves, the contract gains positive or negative value.
        </p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Valuation Formula</h2>
        <p>
          The value of a forward contract is essentially the difference between the <strong>Current Forward Price</strong> for the remaining time and the <strong>Original Delivery Price (K)</strong>, discounted to the present.
        </p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Value of a Long Position</h3>
        <p>A Long position wins if the Spot price goes up.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">Value = S e<sup>-qt</sup> - K e<sup>-rt</sup></p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Value of a Short Position</h3>
        <p>A Short position wins if the Spot price goes down.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">Value = K e<sup>-rt</sup> - S e<sup>-qt</sup></p>
        </div>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8">Key Value Drivers</h2>
        <p>What causes the value of your forward contract to change?</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Spot Price Movements</h3>
        <p>This is the dominant driver. For a Long position, every $1 increase in the Spot price increases the contract value by approx $1 (discounted).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Time Decay</h3>
        <p>As time passes (t decreases), the discounting factors approach 1. The value converges to the intrinsic value (Spot - K) at maturity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Interest Rates</h3>
        <p>Higher interest rates decrease the Present Value of the Delivery Price (K). This works in favor of the Long position (who pays K) and against the Short position (who receives K).</p>

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8">Forward Specific Risks</h2>
        <p>Unlike exchange-traded futures, Forwards are <strong>Over-the-Counter (OTC)</strong> instruments.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Counterparty Credit Risk:</strong> If your forward contract has a high positive value (e.g., $1M profit), you are exposed to the risk that the other party defaults and cannot pay you.</li>
          <li><strong>Liquidity Risk:</strong> You cannot easily "sell" a forward contract to a third party. You usually have to negotiate a cancellation or enter an offsetting contract with the same counterparty.</li>
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
            Common questions about Forward Valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the initial value zero?</h4>
              <p className="text-muted-foreground">
                In a fair market, the Delivery Price K is set to equal the theoretical forward price at inception. Therefore, value = Spot - PV(Forward) = 0. No money changes hands at the start.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does "Mark-to-Market" apply to forwards?</h4>
              <p className="text-muted-foreground">
                For accounting purposes, yes. Companies must value their open forward positions at current market rates for financial reporting. However, cash is not settled daily like in Futures (unless a Credit Support Annex requires collateral posting).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Delivery Price"?</h4>
              <p className="text-muted-foreground">
                The Delivery Price (K) is the fixed price you agreed to pay (if Long) or receive (if Short) for the asset at the contract's maturity. This is fixed for the life of the contract.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do dividends affect the value?</h4>
              <p className="text-muted-foreground">
                Dividends reduce the holding cost of the asset. If a stock pays a dividend, the spot price is expected to drop by that amount. Therefore, expected dividends reduce the "Spot PV" component, lowering the value of a Long Forward.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if interest rates become negative?</h4>
              <p className="text-muted-foreground">
                If rates are negative, the Present Value of K becomes <em>larger</em> than K itself. This reverses the usual interest rate sensitivity dynamics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I exit a forward contract early?</h4>
              <p className="text-muted-foreground">
                Not easily. You generally have to pay the current "Value" of the contract to the counterparty to terminate it. If the value is negative (loss), you pay them. If positive, they pay you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is an NDF (Non-Deliverable Forward)?</h4>
              <p className="text-muted-foreground">
                An NDF is a forward contract where no physical delivery takes place. Instead, at maturity, the difference between the Spot Price and the Delivery Price is settled in cash (usually in USD). NDFs are common for currencies with capital controls.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is Forward Value the same as Forward Price?</h4>
              <p className="text-muted-foreground">
                No! The <strong>Forward Price</strong> is the market rate for a new contract today. The <strong>Forward Value</strong> is the profit/loss on your <em>existing</em> contract relative to that new market rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does time decay work for forwards?</h4>
              <p className="text-muted-foreground">
                Unlike options, forwards don't have "time value" in the same sense. However, the discounting effect diminishes as time passes. Assuming spot remains flat, the value of the contract will drift slightly as the interest rate discounting unwinds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
