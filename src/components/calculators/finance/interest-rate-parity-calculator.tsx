'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Globe, Loader2, ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2, Calculator, Percent, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  spotRate: z.number().min(0.000001, "Spot rate must be positive"),
  domesticRate: z.number().min(-20).max(200, "Interest rate must be reasonable"),
  foreignRate: z.number().min(-20).max(200, "Interest rate must be reasonable"),
  timeYears: z.number().min(0.01).max(30, "Time period typically less than 30 years"),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestRateParityCalculator() {
  const [result, setResult] = useState<{
    forwardRate: number;
    forwardPremiumAmt: number;
    forwardPremiumPct: number;
    parityStatus: string;
    flowDirection: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotRate: undefined,
      domesticRate: undefined,
      foreignRate: undefined,
      timeYears: 1,
    },
  });

  const calculate = (v: FormValues) => {
    const S = v.spotRate;
    const rd = v.domesticRate / 100;
    const rf = v.foreignRate / 100;
    const t = v.timeYears;

    // Interest Rate Parity Formula: F = S * (1 + rd*t) / (1 + rf*t)
    // Note: This is using simple interest for t < 1, but technically for >1 year it should be compounded.
    // Standard IRP formula often used in markets for <1yr is simple interest.
    // For general calculator, we will use the power formula for accuracy over longer periods: F = S * ((1+rd)/(1+rf))^t
    // However, the standard academic formula shown usually is S * (1+rd)/(1+rf) for 1 year.
    // Let's implement the exponential version for robustness across t.

    const forwardRate = S * Math.pow((1 + rd) / (1 + rf), t);

    // For very short terms (t < 1), linear approximation S * (1 + rd*t) / (1 + rf*t) is common in money markets.
    // Let's stick to the exponential (Compound) for "Theoretical" accuracy over time.

    // Premium/Discount calculation
    const forwardPremiumAmt = forwardRate - S;
    const forwardPremiumPct = ((forwardRate - S) / S) * 100;

    return {
      forwardRate,
      forwardPremiumAmt,
      forwardPremiumPct,
      rd,
      rf
    };
  };

  const getParityStatus = (rd: number, rf: number) => {
    const diff = rd - rf; // Domestic - Foreign
    if (Math.abs(diff) < 0.001) return 'Parity (Rates Equal)';
    if (diff > 0) return 'Domestic Discount';
    return 'Domestic Premium';
  };

  const getFlowDirection = (rd: number, rf: number) => {
    if (rd > rf) return 'Capital flows to Domestic (High Yield) → Forward depreciates to compensate.';
    if (rf > rd) return 'Capital flows to Foreign (High Yield) → Domestic currency appreciates in Forward.';
    return 'Neutral flows expected.';
  };

  const getRecommendation = (premiumPct: number, rd: number, rf: number) => {
    if (Math.abs(rd - rf) < 0.001) return 'Rates are effectively equal. Spot and Forward rates should align closely. Hedging is cheap.';
    if (premiumPct < 0) return 'Domestic currency is trading at a Forward Discount. If you need foreign currency in the future, locking in a rate now is cheaper than spot (ignoring expectations).';
    return 'Domestic currency is trading at a Forward Premium. Exporters receiving foreign currency should consider hedging to lock in the favorable forward rate.';
  };

  const getInsights = (forwardRate: number, premiumPct: number, rd: number, rf: number) => {
    const insights = [];
    if (rd > rf) {
      insights.push(`High domestic rates (${(rd * 100).toFixed(2)}%) cause a forward discount.`);
      insights.push('The market "penalizes" holders of high-yield currency in the forward market.');
      insights.push('This prevents risk-free arbitrage profit.');
    } else {
      insights.push(`Low domestic rates (${(rd * 100).toFixed(2)}%) cause a forward premium.`);
      insights.push('You "pay" for the lower interest rate by getting a better exchange rate in the future.');
      insights.push('Useful for importers needing to buy foreign currency.');
    }

    if (Math.abs(premiumPct) > 5) insights.push('High interest rate differential implies significant currency volatility expectation.');

    return insights;
  };

  const getRisks = (rd: number, rf: number) => {
    const risks = [];
    risks.push('Counterparty Risk: The forward contract issuer may default.');
    if (Math.abs(rd - rf) > 0.05) risks.push('Carry Trade Risk: Large differentials attract speculators, increasing "crash" risk.');
    risks.push('Basis Risk: Actual market forward rates may deviate from theoretical IRP due to dollar shortages.');
    risks.push('Political Risk: Capital controls can break the IRP relationship suddenly.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);

    setResult({
      forwardRate: calc.forwardRate,
      forwardPremiumAmt: calc.forwardPremiumAmt,
      forwardPremiumPct: calc.forwardPremiumPct,
      parityStatus: getParityStatus(calc.rd, calc.rf),
      flowDirection: getFlowDirection(calc.rd, calc.rf),
      recommendation: getRecommendation(calc.forwardPremiumPct, calc.rd, calc.rf),
      insights: getInsights(calc.forwardRate, calc.forwardPremiumPct, calc.rd, calc.rf),
      risks: getRisks(calc.rd, calc.rf)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Exchange & Interest Parameters
          </CardTitle>
          <CardDescription>
            Calculate the theoretical Forward Exchange Rate based on the "No-Arbitrage" condition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="spotRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4" />
                        Current Spot Exchange Rate
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="e.g. 1.2500" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g. 1.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <Percent className="h-4 w-4" />
                        Domestic Interest Rate (%)
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
                        <Percent className="h-4 w-4" />
                        Foreign Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 3.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Forward Rate
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
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Theoretical Forward Rate</CardTitle>
                  <CardDescription>Based on Interest Rate Parity (IRP)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.forwardRate.toFixed(4)}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={result.forwardPremiumAmt >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {result.forwardPremiumAmt >= 0 ? "+" : ""}{result.forwardPremiumAmt.toFixed(4)} ({result.forwardPremiumPct.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {result.forwardPremiumAmt >= 0 ? "Premium" : "Discount"}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2">{result.flowDirection}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ArrowRightLeft className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Parity Status</p>
                  <Badge variant={result.parityStatus.includes('Discount') ? 'destructive' : 'default'}>
                    {result.parityStatus}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Domestic Rate</p>
                  <p className="font-medium text-lg">{(form.getValues('domesticRate') ?? 0).toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Globe className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Foreign Rate</p>
                  <p className="font-medium text-lg">{(form.getValues('foreignRate') ?? 0).toFixed(2)}%</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Lock className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Arbitrage & Hedging Mechanisms</CardDescription>
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
                <CardDescription>Market deviations & dangers</CardDescription>
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
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Forward Rate = Spot Rate × [ (1 + r_domestic) / (1 + r_foreign) ]^t
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Where r = annual interest rate, t = time in years
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Using the exponential formula ensures compounding accuracy for periods greater than 1 year, though the linear approximation is often used for short-term money market instruments.
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
            Explore other international finance and parity tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/purchasing-power-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">PPP Calculator</p>
                      <p className="text-sm text-muted-foreground">Inflation vs Exchange Rates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/currency-exchange-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Exchange Converter</p>
                      <p className="text-sm text-muted-foreground">Real-time Spot Rates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/discount-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Discount Rate</p>
                      <p className="text-sm text-muted-foreground">Present Value Analysis</p>
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
        <meta itemProp="name" content="The Definitive Guide to Interest Rate Parity (IRP)" />
        <meta itemProp="description" content="Master Interest Rate Parity (IRP). Learn how to calculate forward rates, understand the relationship between interest rates and exchange rates, and arbitrage without risk." />
        <meta itemProp="keywords" content="Interest Rate Parity, Forward Exchange Rate, Forex Arbitrage, Covered Interest Parity, CIP, Uncovered Interest Parity, UIP, FX Hedging" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-25" />
        <meta itemProp="url" content="/definitive-guide-irp" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Interest Rate Parity: The Gravity of Global Finance</h1>
        <p className="text-lg italic text-muted-foreground">Interest Rate Parity is the fundamental law that prevents &quot;free money&quot; in the foreign exchange markets.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is Interest Rate Parity?</a></li>
          <li><a href="#calculation" className="hover:underline">How the Formula Works</a></li>
          <li><a href="#types" className="hover:underline">Covered vs. Uncovered IRP</a></li>
          <li><a href="#implications" className="hover:underline">Why Higher Interest Rates Mean "Discount"</a></li>
          <li><a href="#risks" className="hover:underline">Arbitrage and Real-World Risks</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Interest Rate Parity (IRP)?</h2>
        <p>Interest Rate Parity (IRP) is a theory in which the interest rate differential between two countries is equal to the differential between the forward exchange rate and the spot exchange rate.</p>
        <p>Put simply: <strong>You cannot make a profit merely by borrowing money in a low-interest country and investing it in a high-interest country IF you hedge your currency risk.</strong></p>
        <p>The market adjusts the Forward Exchange Rate to exactly offset the interest rate advantage, ensuring that the return on investment is the same regardless of which currency you hold.</p>

        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Formula Works</h2>
        <p>The core formula linking the Spot Rate (S) and Forward Rate (F) is:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            {'Forward Rate = Spot Rate × (1 + r_domestic) / (1 + r_foreign)'}
          </p>
        </div>

        <p>If the domestic interest rate is higher than the foreign one, the fraction (1 + r_d) / (1 + r_f) is greater than 1. This means the Forward Rate will be higher than the Spot Rate? Wait, let's re-examine convention.</p>
        <p>Usually, we quote Price/Base. If Domestic Rate is higher, the Domestic currency is expected to <strong>depreciate</strong> to offset the yield. If the quote is Domestic/Foreign (e.g. USD/EUR where USD is domestic), and USD rates are higher, the Forward price of EUR (in USD) will be higher (Premium).</p>
        <p>Why? To prevent you from converting EUR to USD, earning 5%, and converting back. The future USD must be worth <em>less</em> (requires more USD to buy 1 EUR) to wipe out that 5% gain.</p>

        <hr />

        {/* TYPES */}
        <h2 id="types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Covered vs. Uncovered IRP</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">Covered IRP (CIP)</h3>
            <p>You use a forward contract to lock in the exchange rate <strong>today</strong>.</p>
            <p>This holds true almost 100% of the time because arbitrageurs (banks/algos) instantly exploit any deviation. It is risk-free arbitrage.</p>
          </div>
          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/10">
            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2">Uncovered IRP (UIP)</h3>
            <p>You do <strong>not</strong> hedge. You assume the future spot rate will naturally move to the theoretical level.</p>
            <p>This often fails in reality. High-interest currencies often appreciate instead of depreciate short-term (the &quot;Carry Trade&quot;).</p>
          </div>
        </div>

        <hr />

        {/* IMPLICATIONS */}
        <h2 id="implications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Higher Interest Rates Mean &quot;Discount&quot;</h2>
        <p>This is often counter-intuitive. We often hear &quot;Rate hikes strengthen the currency.&quot; That is true for the <strong>Spot</strong> rate (everyone buys the currency today to get the yield).</p>
        <p>However, in the <strong>Forward</strong> market, that same high-rate currency trades at a <strong>Discount</strong>. This is mathematical necessity.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>If Currency A pays 10% and Currency B pays 0%.</li>
          <li>If the exchange rate stayed flat, everyone would just hold A.</li>
          <li>To balance this, the market prices Currency A to lose ~10% of its value against B over the year in the forward contract.</li>
        </ul>

        <hr />

        {/* RISKS */}
        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Arbitrage and Real-World Risks</h2>
        <p>While Covered Interest Parity is a solid rule, it broke down slightly during the 2008 crisis and 2020 pandemic. This deviation is known as the <strong>Cross-Currency Basis</strong>.</p>
        <p>It happens because of:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Dollar Shortages:</strong> Global banks desperate for USD will &quot;overpay&quot; in the swap market, violating IRP.</li>
          <li><strong>Regulation:</strong> Balance sheet constraints (Basel III) prevent banks from arbitraging small discrepancies.</li>
          <li><strong>Counterparty Risk:</strong> The fear that the other bank won&apos;t be there to pay you in 1 year.</li>
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
            Expert answers to common questions about Interest Rate Parity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does Interest Rate Parity always hold?</h4>
              <p className="text-muted-foreground">
                Covered IRP holds very tightly in major currencies (USD, EUR, JPY) due to efficient arbitrage. Uncovered IRP rarely holds in the short to medium term, which is why the &quot;Carry Trade&quot; strategy exists.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a Forward Premium vs. Discount?</h4>
              <p className="text-muted-foreground">
                A currency is at a <strong>Premium</strong> if the forward rate is higher than the spot rate (it&apos;s more expensive in the future). It is at a <strong>Discount</strong> if the forward rate is lower (cheaper in the future).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Which currency trades at a discount?</h4>
              <p className="text-muted-foreground">
                The currency with the <strong>higher interest rate</strong> always trades at a forward discount against the currency with the lower rate. This discount offsets the interest gain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does this help importers/exporters?</h4>
              <p className="text-muted-foreground">
                It helps them determine the &quot;cost of hedging.&quot; If an importer needs to buy a high-interest currency in the future, IRP tells them they can lock in a cheaper rate today (forward discount) than the current spot price.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Carry Trade&quot;?</h4>
              <p className="text-muted-foreground">
                Carry Trade involves borrowing a low-interest currency (like JPY) and buying a high-interest currency (like AUD) <em>without</em> hedging. If the exchange rate doesn&apos;t change, the trader profits from the interest difference. This bets against Uncovered IRP.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why does the formula use (1+r)?</h4>
              <p className="text-muted-foreground">
                The (1+r) represents the principal plus interest at the end of the period. The ratio compares what 1 unit of money grows to in Domestic vs. Foreign markets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the role of inflation?</h4>
              <p className="text-muted-foreground">
                Inflation drives interest rates (Fisher Effect), which in turn drives forward rates (IRP). High inflation usually leads to high nominal interest rates, which leads to a forward discount (depreciation expectation).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use this for crypto?</h4>
              <p className="text-muted-foreground">
                Yes, Perpetual Futures funding rates in crypto are essentially an IRP mechanism. If longs pay shorts fees, the futures price trades above spot (Contango), reflecting the &quot;interest rate&quot; of borrowing leverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if IRP is violated?</h4>
              <p className="text-muted-foreground">
                If the forward rate deviates significantly from IRP, arbitrageurs will borrow in the cheap currency, convert it, invest in the expensive one, and lock in the profit with a forward contract until the prices align.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does IRP apply to pegged currencies?</h4>
              <p className="text-muted-foreground">
                For pegged currencies (like HKD to USD), IRP keeps interest rates very close. If rates diverged, massive capital flows would force the central bank to intervene or unpeg.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Interest Rate Parity Calculator computes the &quot;No-Arbitrage&quot; forward exchange rate.</p>
          <p>It demonstrates that exchange rate expectations are mathematically linked to interest rate differentials.</p>
          <p>Use this tool to calculate hedging costs and understand the theoretical equilibrium of Forex markets.</p>
        </CardContent>
      </Card>
    </div>
  );
}
