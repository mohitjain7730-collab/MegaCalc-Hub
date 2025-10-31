
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Calculator, Info, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  notional: z.number().positive(),
  agreedRate: z.number().positive(),
  marketRate: z.number().positive(),
  monthsFrom: z.number().positive(),
  monthsTo: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForwardRateAgreementCalculator() {
  const [result, setResult] = useState<{ payment: number; direction: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notional: 0,
      agreedRate: 0,
      marketRate: 0,
      monthsFrom: 0,
      monthsTo: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { notional, agreedRate, marketRate, monthsFrom, monthsTo } = values;
    const yearFraction = (monthsTo - monthsFrom) / 12;
    const payment = notional * (marketRate - agreedRate) * yearFraction / (1 + marketRate * yearFraction);
    const direction = payment >= 0 ? 'from long to short' : 'from short to long';
    setResult({ payment, direction });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Forward Rate Agreement Parameters
          </CardTitle>
          <CardDescription>
            Enter FRA details to calculate settlement payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="notional" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notional Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1000000"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="agreedRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreed Forward Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 4.5"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="marketRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Rate at Settlement (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 4.8"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="monthsFrom" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months from Today (start)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="monthsTo" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months from Today (end)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 9"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit">Calculate Settlement</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Handshake className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>FRA Settlement Payment</CardTitle>
                <CardDescription>Settlement amount for forward rate agreement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${result.payment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(result.payment).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-2">
                <Badge variant={result.payment >= 0 ? 'default' : 'destructive'} className="text-lg py-1 px-3">
                  {result.payment >= 0 ? 'Payment Received' : 'Payment Made'}
                </Badge>
                <p className="text-muted-foreground">Payment direction: {result.direction}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Notional Amount</h4>
            <p className="text-muted-foreground">
              The principal amount on which the interest rate differential is calculated. This is not exchanged between parties—only the settlement payment based on interest rate differences is paid. Enter the notional value in your currency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Agreed Forward Rate (%)</h4>
            <p className="text-muted-foreground">
              The forward interest rate agreed upon when entering the FRA contract. This is the rate that the parties expect at the start of the contract period. Enter as an annual percentage (e.g., 4.5 for 4.5%).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Market Rate at Settlement (%)</h4>
            <p className="text-muted-foreground">
              The actual reference interest rate prevailing in the market when the FRA contract period begins. This is compared to the agreed rate to determine the settlement payment. Enter as an annual percentage.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Months from Today (start/end)</h4>
            <p className="text-muted-foreground">
              The start and end months define the contract period for which the interest rate is being forward-priced. For example, a "6x9 FRA" starts in 6 months and covers the period until month 9. Enter the number of months from today.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other interest rate and derivatives calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/swap-spread-calculator" className="text-primary hover:underline">
                  Swap Spread Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the spread between swap rates and treasury rates as a market indicator.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/breakeven-inflation-rate-calculator" className="text-primary hover:underline">
                  Breakeven Inflation Rate Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the breakeven inflation rate between nominal and real interest rates.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/fixed-vs-floating-rate-calculator" className="text-primary hover:underline">
                  Fixed vs Floating Rate Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Compare fixed and floating interest rates to determine the best option for your loan.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/currency-volatility-calculator" className="text-primary hover:underline">
                  Currency Volatility Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the financial impact of currency exchange rate fluctuations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Forward Rate Agreement (FRA) Pricing, Mechanics, and Calculation" />
    <meta itemProp="description" content="An expert guide detailing the structure of a Forward Rate Agreement (FRA), the formula for its payoff, how the contract rate (FRA rate) is derived from the yield curve, and its use in hedging and speculating on future interest rates." />
    <meta itemProp="keywords" content="forward rate agreement formula, FRA pricing mechanics, interest rate hedging, forward rate calculation yield curve, settlement amount FRA, FRA buyer vs seller" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-forward-rate-agreement-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Forward Rate Agreements (FRA): Pricing and Interest Rate Hedging</h1>
    <p className="text-lg italic text-gray-700">Master the structure of the over-the-counter derivative used to lock in a borrowing or lending rate for a future period.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#structure" className="hover:underline">FRA Structure and Terminology (n x m)</a></li>
        <li><a href="#pricing" className="hover:underline">Pricing the FRA: Deriving the Contract Rate</a></li>
        <li><a href="#settlement" className="hover:underline">Settlement Mechanics and Payoff Formula</a></li>
        <li><a href="#applications" className="hover:underline">Market Applications: Hedging and Speculation</a></li>
        <li><a href="#vs-futures" className="hover:underline">FRA vs. Interest Rate Futures</a></li>
    </ul>
<hr />

    {/* FRA STRUCTURE AND TERMINOLOGY (N X M) */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FRA Structure and Terminology (n x m)</h2>
    <p>A **Forward Rate Agreement (FRA)** is an Over-the-Counter (OTC) contract between two parties that determines the interest rate to be applied to a notional principal amount for a specific period of time in the future. It is a commitment today regarding an interest rate that will only be used later.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">FRA Notation (n x m)</h3>
    <p>FRAs are quoted using an "n x m" notation (read as "n by m") that defines the start and end of the forward period, measured in months from the settlement date (today):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">n:</strong> The number of months until the forward contract begins (the fixing date).</li>
        <li><strong className="font-semibold">m:</strong> The number of months until the forward contract expires.</li>
    </ul>
    <p>The duration of the actual borrowing/lending period under the contract is $(m - n)$ months. For example, a **3 x 6 FRA** begins in 3 months and expires in 6 months, locking in a rate for a 3-month period that begins 3 months from now.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Two Sides of the Contract</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Buyer (Fixed Rate Payer):</strong> Enters the FRA to protect against rising interest rates. The buyer pays the agreed-upon fixed FRA rate.</li>
        <li><strong className="font-semibold">Seller (Floating Rate Payer):</strong> Enters the FRA to protect against falling interest rates. The seller pays the variable market rate (the reference rate) at the fixing date.</li>
    </ul>

<hr />

    {/* PRICING THE FRA: DERIVING THE CONTRACT RATE */}
    <h2 id="pricing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pricing the FRA: Deriving the Contract Rate</h2>
    <p>The contract rate (or FRA rate) is set at the origination of the contract such that the theoretical initial Net Present Value (NPV) of the agreement is zero. This rate is derived directly from the current **Yield Curve** (the relationship between interest rates and maturity).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Forward Rate Formula (No Arbitrage)</h3>
    <p>The FRA rate is the implied forward rate between two zero-coupon bonds (or spot rates) on the yield curve. It ensures that an investor who invests for the short period ($n$ months) and then reinvests at the forward rate for the longer period ($m-n$ months) earns the same return as if they invested for the long period ($m$ months) today.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FRA Rate = [(1 + R_long * T_long) / (1 + R_short * T_short) - 1] / (T_long - T_short)'}
        </p>
    </div>
    <p>Where R long and R short are the spot rates for the longer and shorter time periods, respectively, and T represents time in years (or fraction of a year).</p>

<hr />

    {/* SETTLEMENT MECHANICS AND PAYOFF FORMULA */}
    <h2 id="settlement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Settlement Mechanics and Payoff Formula</h2>
    <p>FRAs are typically settled in cash at the start of the forward contract period (at time $n$), not at the end of the period ($m$). This early settlement necessitates discounting the cash flows back from time $m$ to time $n$.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fixing Date and Reference Rate</h3>
    <p>On the **Fixing Date** ($n$), the actual **Reference Rate** (e.g., SOFR, LIBOR) is observed. The difference between this market rate and the contracted FRA rate determines the settlement amount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Settlement Payoff Formula</h3>
    <p>The settlement is calculated as the present value of the difference in interest payments, paid at time $n$:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Settlement Amount = Notional * [ (R_reference - R_FRA) * T_period ] / [ 1 + R_reference * T_period ]'}
        </p>
    </div>
    <p>Where R reference is the market rate at time n, R FRA is the fixed contract rate, and T period is the length of the contract period (m minus n).</p>
    <ul className="list-disc ml-6 space-y-2">
    <li>If R reference &gt; R FRA, the Buyer (fixed-rate payer) receives a payment from the Seller.</li>
    <li>If R reference &lt; R FRA, the Seller receives a payment from the Buyer.</li>
    </ul>

<hr />

    {/* MARKET APPLICATIONS: HEDGING AND SPECULATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Market Applications: Hedging and Speculation</h2>
    <p>FRAs are primarily used for hedging interest rate risk, but their structure also allows for simple speculation on the future direction of interest rates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hedging Future Borrowing Costs</h3>
    <p>A corporate treasurer who knows the firm will need to borrow money in three months for a period of three months (a 3 x 6 FRA) can purchase an FRA today to lock in the interest rate. This removes the uncertainty associated with market rate fluctuations between now and the borrowing date.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Speculation</h3>
    <p>Traders can use FRAs to speculate on the movement of the reference rate. A speculator who believes the market rate will be higher than the current FRA rate should **buy** the FRA. If they believe the market rate will be lower, they should **sell** the FRA.</p>

<hr />

    {/* FRA VS. INTEREST RATE FUTURES */}
    <h2 id="vs-futures" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FRA vs. Interest Rate Futures</h2>
    <p>While both FRAs and Interest Rate Futures (e.g., Eurodollar futures) are used to manage future interest rate risk, they differ in market structure and liquidity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Market Differences</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">FRA:</strong> OTC contract, customizable notional principal and maturity dates, higher counterparty risk, settled in cash.</li>
        <li><strong className="font-semibold">Futures:</strong> Exchange-traded, standardized contracts, lower counterparty risk (due to clearinghouse), marked-to-market daily.</li>
    </ul>
    <p>FRAs are preferred by large institutional users who require tailored contracts not available on exchanges, despite the higher counterparty risk.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Forward Rate Agreement (FRA) is an essential OTC instrument for managing short-term interest rate risk. Its pricing (the FRA rate) is derived from the **yield curve** to ensure initial pricing is fair.</p>
    <p>The payoff is a cash settlement determined by the difference between the contracted FRA rate and the actual market reference rate on the **fixing date**. FRAs provide corporate hedgers with the crucial ability to lock in financing costs for future periods with precise customizability.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Forward Rate Agreements and settlement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a Forward Rate Agreement (FRA)?</h4>
            <p className="text-muted-foreground">
              A Forward Rate Agreement is an over-the-counter derivative contract that locks in an interest rate for a future period. It's an agreement between two parties where one will pay a fixed rate and receive a floating rate (or vice versa) on a notional principal amount for a specified future time period. No principal is exchanged—only the net settlement based on rate differences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does FRA settlement work?</h4>
            <p className="text-muted-foreground">
              Settlement occurs at the start of the contract period (not the end). The party paying fixed receives the difference if market rates rise above the agreed rate. The payment is discounted to present value since interest accrues over the period. The formula accounts for the time difference between settlement and the end of the interest period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are common FRA maturities and conventions?</h4>
            <p className="text-muted-foreground">
              FRAs are quoted as "start x end" (e.g., "6x9 FRA" means starts in 6 months, covers next 3 months). Common periods include 1x4, 3x6, 6x9, 6x12, and 12x24 months. They typically reference LIBOR, SOFR, or other interbank rates. Market convention uses actual/360 or actual/365 day count methods.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Who uses FRAs and why?</h4>
            <p className="text-muted-foreground">
              Banks, corporations, and investors use FRAs to hedge against interest rate changes on future borrowing or investments, to lock in funding costs, to speculate on interest rate movements, and to manage gaps between assets and liabilities. They're particularly useful for managing exposure to floating-rate obligations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the advantages of FRAs over futures?</h4>
            <p className="text-muted-foreground">
              Advantages include customization of notional and dates, no margin requirements, over-the-counter flexibility, and credit relationship between counterparties. However, FRAs lack exchange clearing and may involve counterparty credit risk. Futures offer standardization, central clearing, and daily margining.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret a positive vs negative settlement?</h4>
            <p className="text-muted-foreground">
              A positive settlement means the party paying fixed receives payment when market rates are higher than the agreed rate, while a negative settlement means they pay when market rates are lower than the agreed rate. The long position benefits when rates rise, while the short position benefits when rates fall. Settlement flows from the perspective of the long position.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What risks are associated with FRAs?</h4>
            <p className="text-muted-foreground">
              Risks include counterparty credit risk (default), market risk (unexpected rate movements), basis risk (reference rate mismatch), settlement risk, and liquidity risk. Credit risk is typically managed through credit limits, collateral, and credit default swaps. Market risk is offset by taking opposite positions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How are FRAs priced and what affects their value?</h4>
            <p className="text-muted-foreground">
              FRA prices (forward rates) are derived from spot rates using the interest rate parity concept. The forward rate is the rate that makes investing for the long period equivalent to investing for short period and rolling over. Factors affecting value include changes in forward curve, credit spreads, time to settlement, and volatility.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can FRAs be used for speculation?</h4>
            <p className="text-muted-foreground">
              Yes. Speculators can take positions in FRAs based on their interest rate views. Buying (going long) FRAs profits if rates rise above the agreed rate. Selling (going short) FRAs profits if rates fall below the agreed rate. Unlike hedgers, speculators have no underlying exposure to offset, creating directional risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do FRAs relate to interest rate swaps?</h4>
            <p className="text-muted-foreground">
              A swap is essentially a series of FRAs packaged together. An interest rate swap can be decomposed into a strip of forward rate agreements. The relationship is that each swap fixed-rate payment can be priced as the average of the corresponding forward rates, adjusted for payment frequency and day count conventions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
