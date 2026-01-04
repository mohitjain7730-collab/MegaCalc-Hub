'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, ArrowRightLeft, TrendingUp, AlertCircle, Info, Landmark, Calculator, DollarSign, Shield, Clock, FunctionSquare, CheckCircle2, RefreshCw, BarChart3, Target, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
  position: z.enum(['payer', 'receiver']),
  notionalAmount: z.number().positive('Notional amount must be positive'),
  existingFixedRate: z.number().min(0, 'Rate must be positive'),
  currentMarketRate: z.number().min(0, 'Rate must be positive'),
  timeToMaturity: z.number().positive('Time must be positive'),
  paymentFrequency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwapValuationCalculator() {
  const [result, setResult] = useState<{
    swapValue: number;
    annuityFactor: number;
    rateDelta: number; // Difference in rates
    perBasisPointValue: number; // DV01 roughly
    status: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: 'payer',
      notionalAmount: undefined,
      existingFixedRate: undefined, // Contract Rate
      currentMarketRate: undefined, // New Market Rate
      timeToMaturity: undefined,
      paymentFrequency: '2', // Semi-Annual default
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Inputs
    const N = v.notionalAmount;
    const R_old = v.existingFixedRate / 100;
    const R_new = v.currentMarketRate / 100;
    const t = v.timeToMaturity;
    const freq = parseInt(v.paymentFrequency);

    // Total number of remaining payments
    const n = t * freq;

    // Rate per period
    const r_per_period = R_new / freq;

    // 2. Calculate Annuity Factor (PV of $1 paid every period for n periods)
    // Formula: (1 - (1 + r)^-n) / r
    // This assumes the discount curve is flat at the new market swap rate (Par Yield)
    let annuityFactor = 0;
    if (r_per_period === 0) {
      annuityFactor = n; // No discounting
    } else {
      annuityFactor = (1 - Math.pow(1 + r_per_period, -n)) / r_per_period;
    }

    // Adjust Annuity Factor to annual terms? 
    // The payment amount each period is R/freq * Notional. 
    // The PV = (R_old/freq * N - R_new/freq * N) * AnnuityFactor_per_period.
    // Or simpler: Value = (R_old - R_new) * (AnnuityFactor / freq) * N

    const adjustedAnnuity = annuityFactor / freq; // Acts as the PVBP (Price Value of Basis Point) multiplier

    // 3. Swap Value
    // Payer Fixed: Pays R_old, Receives Floating. (Equivalent to Short Fixed Bond, Long Floating Bond)
    // If Market rate R_new > R_old, existing fixed leg is cheap (asset).
    // Value = (R_new - R_old) * Annuity * N

    // Receiver Fixed: Receives R_old, Pays Floating. (Equivalent to Long Fixed Bond, Short Floating Bond)
    // Value = (R_old - R_new) * Annuity * N

    let swapValue = 0;
    if (v.position === 'payer') {
      swapValue = (R_new - R_old) * adjustedAnnuity * N;
    } else {
      swapValue = (R_old - R_new) * adjustedAnnuity * N;
    }

    // 4. Per Basis Point Value (DV01 approx)
    const dv01 = 0.0001 * adjustedAnnuity * N;

    // 5. Status
    let status = 'Par';
    if (swapValue > 0) status = 'In the Money (Asset)';
    else if (swapValue < 0) status = 'Out of the Money (Liability)';

    return {
      swapValue,
      annuityFactor: adjustedAnnuity,
      rateDelta: (R_new - R_old) * 100,
      perBasisPointValue: dv01,
      status
    };
  };

  const getRecommendation = (val: number, pos: string) => {
    if (val > 0) {
      return `Your position has accrued value. You could unwind this swap for a cash profit of approx $${val.toFixed(2)}.`;
    } else if (val < 0) {
      return `Your position is a liability. Unwinding now would require a payment of approx $${Math.abs(val).toFixed(2)}.`;
    }
    return `The swap is currently valued near par. No significant liquidation value.`;
  };

  const getInsights = (val: number, pos: string, rateDelta: number) => {
    const insights = [];
    if (pos === 'payer') {
      if (rateDelta > 0) insights.push('Market rates have risen above your fixed rate. You are paying below-market interest.');
      else insights.push('Market rates have fallen below your fixed rate. You are paying above-market interest.');
    } else {
      if (rateDelta < 0) insights.push('Market rates have fallen. You are locked in receiving a higher-than-market rate.');
      else insights.push('Market rates have risen. You are receiving less than current market opportunities.');
    }

    insights.push(`Sensitivity: A 1 basis point (0.01%) move in rates changes value by approx $${(Math.abs(val / (rateDelta * 100)) || 0).toFixed(2)}.`);

    return insights;
  };

  const getRisks = () => {
    const risks = [];
    risks.push('Yield Curve Risk: Assumption of a flat term structure may cause valuation errors.');
    risks.push('Floating Leg Basis: The floating spread (e.g., SOFR + spread) might diverge.');
    risks.push('Counterparty Credit Risk (CVA): Valuation must be adjusted for default probability.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      swapValue: calc.swapValue,
      annuityFactor: calc.annuityFactor,
      rateDelta: calc.rateDelta,
      perBasisPointValue: calc.perBasisPointValue,
      status: calc.status,
      recommendation: getRecommendation(calc.swapValue, values.position),
      insights: getInsights(calc.swapValue, values.position, calc.rateDelta),
      risks: getRisks()
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Swap Parameters
          </CardTitle>
          <CardDescription>
            Valuation of Plain Vanilla Interest Rate Swaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Your Position</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="payer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Pay Fixed / Receive Float
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="receiver" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Receive Fixed / Pay Float
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
                  name="notionalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Notional Principal
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 1000000"
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
                  name="timeToMaturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Years to Maturity
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.5"
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
                  name="existingFixedRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Contract Fixed Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Old Rate, e.g. 3.5"
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
                  name="currentMarketRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Current Market Fixed Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="New Rate, e.g. 4.0"
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
                  name="paymentFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Annual (1/yr)</SelectItem>
                          <SelectItem value="2">Semi-Annual (2/yr)</SelectItem>
                          <SelectItem value="4">Quarterly (4/yr)</SelectItem>
                          <SelectItem value="12">Monthly (12/yr)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Swap Value
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
                <ArrowRightLeft className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Valuation Result</CardTitle>
                  <CardDescription>Net Present Value (NPV)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.swapValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.swapValue >= 0 ? '+' : ''}{result.swapValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.status}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Rate Differential</p>
                  <p className="text-lg font-bold">{Math.abs(result.rateDelta).toFixed(2)} bps</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">DV01 Risk</p>
                  <p className="text-lg font-bold">~${result.perBasisPointValue.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Annuity Factor</p>
                  <p className="text-lg font-bold">{result.annuityFactor.toFixed(4)}</p>
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
                  <TrendingUp className="h-6 w-6" />
                  Market Position
                </CardTitle>
                <CardDescription>Why is this happening?</CardDescription>
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
                  Valuation Disclaimers
                </CardTitle>
                <CardDescription>Model limitations</CardDescription>
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
            Valuation Formula (Market Rate Method)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              V_payer = (R_market - R_fixed) × Annuity_Factor × Notional
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We compare your existing <strong>Contract Fixed Rate</strong> against the <strong>Current Market Swap Rate</strong> for the remaining term. The difference is the "coupon saving/loss", which is then discounted to present value using the annuity factor of the remaining stream.
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
            Uses for corporates and banks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Corporate Borrowers
              </h4>
              <p className="text-sm text-muted-foreground">
                Companies with floating-rate debt use swaps to "fix" their interest payments. This calculator values that position to see if it's an asset or liability.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Pension Funds
              </h4>
              <p className="text-sm text-muted-foreground">
                Funds receiving fixed coupons may swap to floating rates if they believe interest rates will rise (duration management).
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Real Estate Developers
              </h4>
              <p className="text-sm text-muted-foreground">
                Developers often use swaps to convert variable construction loans into fixed-rate long-term financing certainty.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Auditors & Analysts
              </h4>
              <p className="text-sm text-muted-foreground">
                Independently verify the "Mark-to-Market" value of off-balance-sheet derivatives reported by firms.
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
            The <strong>Swap Valuation Calculator</strong> provides a "quick and dirty" Mark-to-Market (MtM) check using the flat-curve method.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>It helps Payer and Receiver counterparties understand who is currently "winning" the trade based on new market rates.</li>
            <li>It quantifies the cash amount required to unwind or terminate the agreement today.</li>
            <li>It highlights the sensitivity of the swap's value to small changes in interest rates (DV01 risk).</li>
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
            Fixed Income and Derivatives Tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/forward-contract-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Forward Value</p>
                      <p className="text-sm text-muted-foreground">Contract valuation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cost-of-carry-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Cost of Carry</p>
                      <p className="text-sm text-muted-foreground">Futures pricing</p>
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
                      <p className="text-sm text-muted-foreground">Discount tool</p>
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
        <meta itemProp="headline" content="Valuing Interest Rate Swaps: The Plain Vanilla Guide" />
        <meta itemProp="description" content="Learn how to calculate the value of an plain vanilla interest rate swap. A complete guide for corporate treasurers and finance students on fixed leg vs floating leg valuation." />
        <meta itemProp="keywords" content="swap valuation calculator, interest rate swap, plain vanilla swap, fixed vs floating leg, mark to market swap, annuity factor formula" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-09-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Interest Rate Swap Valuation</h1>
        <p className="text-lg italic text-muted-foreground">Interest Rate Swaps (IRS) are the world's largest derivative market. Understanding how to value them is essential for managing interest rate exposure.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is a Plain Vanilla Swap?</a></li>
          <li><a href="#valuation" className="hover:underline">How Valuation Works</a></li>
          <li><a href="#formula" className="hover:underline">The "Difference in Rates" Method</a></li>
          <li><a href="#legs" className="hover:underline">Fixed Leg vs. Floating Leg</a></li>
          <li><a href="#uses" className="hover:underline">Who Uses Swaps?</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is a Plain Vanilla Swap?</h2>
        <p>
          A <strong>Plain Vanilla Interest Rate Swap</strong> is an agreement between two parties to exchange cash flows on a defined Notional Amount.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Party A (Payer):</strong> Pays a Fixed Rate and receives a Floating Rate (e.g., SOFR).</li>
          <li><strong>Party B (Receiver):</strong> Receives a Fixed Rate and pays a Floating Rate.</li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">Note: The principal (notional) is never exchanged, only the interest payments.</p>

        <h2 id="valuation" className="text-2xl font-bold text-foreground pt-8">How Valuation Works</h2>
        <p>
          At the moment a swap is signed (Inception), the value is typically <strong>Zero</strong>. The fixed rate is chosen such that the Present Value (PV) of the Fixed Leg equals the PV of the Floating Leg.
        </p>
        <p className="mt-2">
          As time passes and interest rates change, value emerges:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li>If market rates <strong>Rise</strong>, the Payer (who locked in a lower fixed rate) gains value. The Receiver loses value.</li>
          <li>If market rates <strong>Fall</strong>, the Payer (who is paying a high fixed rate) loses value. The Receiver gains value.</li>
        </ul>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The "Difference in Rates" Method</h2>
        <p>
          While professional systems discount every single cash flow curve, a robust method for quick valuation is determining the value of the <strong>difference</strong> between the contract rate and the current market rate.
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">Value = (R_market - R_contract) × Annuity Factor × Notional</p>
        </div>
        <p>
          The <strong>Annuity Factor</strong> represents the sum of discount factors for all remaining payment dates. It tells you "What is the present value of receiving $1 per year for the remaining life of the swap?"
        </p>

        <h2 id="legs" className="text-2xl font-bold text-foreground pt-8">Fixed Leg vs. Floating Leg</h2>
        <p>Alternatively, you can value legs separately.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Floating Leg Value</h3>
        <p>Interestingly, on a reset date, the value of the Floating Leg is always equal to <strong>Par (100%)</strong>. Why? Because the floating rate resets to the market rate, so it is always "fairly priced" at that moment.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Fixed Leg Value</h3>
        <p>The Fixed Leg behaves like a fixed-coupon bond. If rates rise, the bond price falls. If rates fall, the bond price rises.</p>
        <p className="mt-4 font-semibold italic">Therefore: Payer Swap Value ≈ Floating Leg (Par) - Fixed Leg Bond Value.</p>

        <h2 id="uses" className="text-2xl font-bold text-foreground pt-8">Who Uses Swaps?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Corporate Borrowers</h4>
            <p className="text-sm">Companies with variable-rate loans use swaps to "fix" their interest rate expenses, neutralizing the risk of rising rates.</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Pension Funds</h4>
            <p className="text-sm">Funds receiving fixed income might swap to floating to reduce duration risk if they expect rates to rise.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Swap Valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the calculation approximate?</h4>
              <p className="text-muted-foreground">
                This calculator uses a single discount rate (flat yield assumption) for simplicity. Institutional valuation uses a separate zero-coupon curve (to discount) and a forecasting curve (to project floating rates), often OIS-discounting.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens at maturity?</h4>
              <p className="text-muted-foreground">
                At maturity, all obligations are settled. The final exchange of interest occurs, and the contract terminates. The value converges to zero.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does Notional Amount change hands?</h4>
              <p className="text-muted-foreground">
                No. In a plain vanilla Interest Rate Swap, the notional principal is never exchanged. It is only used to calculate the interest payments. This minimizes counterparty risk compared to a loan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "DV01"?</h4>
              <p className="text-muted-foreground">
                DV01 (Dollar Value of an 01) measures the change in the swap's value for a 1 basis point (0.01%) change in interest rates. It is a key risk metric.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I make money on a swap?</h4>
              <p className="text-muted-foreground">
                Yes. If you are a Payer (Paying Fixed) and rates rise, your swap becomes an asset. You are paying e.g. 3% when the market is demanding 5%. You can sell (assign) this contract for a profit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is LIBOR vs SOFR?</h4>
              <p className="text-muted-foreground">
                LIBOR was the old standard floating rate. SOFR (Secured Overnight Financing Rate) is the new standard (since 2023) for USD swaps. SOFR is risk-free, while LIBOR included bank credit risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I exit a swap?</h4>
              <p className="text-muted-foreground">
                You can terminate it with the dealer at market value (Cash Settlement) or enter an offsetting swap (e.g., if you Pay Fixed, you enter a new Receive Fixed swap).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "Basis Swap"?</h4>
              <p className="text-muted-foreground">
                A swap where both legs are floating but pegged to different indices (e.g., 3-month SOFR vs 1-month SOFR).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
