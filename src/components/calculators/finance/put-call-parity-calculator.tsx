
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calculator, Info, FileText, Globe } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  stockPrice: z.number().positive(),
  strikePrice: z.number().positive(),
  callPrice: z.number().positive(),
  putPrice: z.number().positive(),
  rate: z.number().nonnegative(),
  time: z.number().positive(),
  timeUnit: z.enum(['years', 'months', 'days']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    leftSide: number;
    rightSide: number;
    difference: number;
    arbitrage: string | null;
}

export default function PutCallParityCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockPrice: 0,
      strikePrice: 0,
      callPrice: 0,
      putPrice: 0,
      rate: 0,
      time: 0,
      timeUnit: 'years',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { stockPrice, strikePrice, callPrice, putPrice, rate, time, timeUnit } = values;
    const r = rate / 100;
    
    let tInYears = time;
    if (timeUnit === 'months') tInYears /= 12;
    if (timeUnit === 'days') tInYears /= 365;
    
    const leftSide = putPrice + stockPrice;
    const rightSide = callPrice + strikePrice * Math.exp(-r * tInYears);
    const difference = leftSide - rightSide;
    
    let arbitrage = null;
    if (Math.abs(difference) > 0.01) { // Allowing for small rounding differences
        if (difference > 0) {
            arbitrage = "The protective put is overpriced. Strategy: Sell the put, sell the stock, buy the call, and invest the present value of the strike price.";
        } else {
            arbitrage = "The fiduciary call is overpriced. Strategy: Buy the put, buy the stock, sell the call, and borrow the present value of the strike price.";
        }
    }

    setResult({ leftSide, rightSide, difference, arbitrage });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Put-Call Parity Arbitrage Check
          </CardTitle>
          <CardDescription>
            Check for arbitrage opportunities using Put-Call Parity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="stockPrice" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 100"
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
                  name="strikePrice" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strike Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 100"
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
                  name="callPrice" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Option Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 5"
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
                  name="putPrice" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Put Option Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 4"
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
                  name="rate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk-Free Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 5"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormField 
                    control={form.control} 
                    name="time" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time to Expiration</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="e.g., 1"
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
                    name="timeUnit" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} 
                  />
                </div>
              </div>
              <Button type="submit">Check Parity</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Put-Call Parity Analysis</CardTitle>
                <CardDescription>Arbitrage opportunity detection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
              <div>
                <p className="font-semibold">Put + Stock (P + S₀)</p>
                <p className="text-xl font-mono">${result.leftSide.toFixed(4)}</p>
              </div>
              <div>
                <p className="font-semibold">Call + PV(Strike) (C + Ke⁻ʳᵀ)</p>
                <p className="text-xl font-mono">${result.rightSide.toFixed(4)}</p>
              </div>
            </div>
            {result.arbitrage ? (
              <Alert variant="destructive">
                <AlertTitle>Arbitrage Opportunity Detected!</AlertTitle>
                <AlertDescription>{result.arbitrage}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle>Parity Holds</AlertTitle>
                <AlertDescription>No arbitrage opportunity detected based on these prices.</AlertDescription>
              </Alert>
            )}
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
            <h4 className="font-semibold text-foreground mb-2">Stock Price</h4>
            <p className="text-muted-foreground">
              Current market price of the underlying stock. Both the put and call options should be on the same underlying asset at the same strike price and expiration date.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Strike Price</h4>
            <p className="text-muted-foreground">
              The exercise price of both the put and call options. Both options must have the same strike price for the parity relationship to hold.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Call and Put Prices</h4>
            <p className="text-muted-foreground">
              Current market prices of the European call and put options. Both options should have the same expiration date. Enter prices as positive values.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Risk-Free Rate</h4>
            <p className="text-muted-foreground">
              Annual risk-free interest rate, typically the yield on government bonds. This is used to discount the strike price to present value in the fiduciary call calculation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Time to Expiration</h4>
            <p className="text-muted-foreground">
              Time remaining until option expiration. You can enter this in years, months, or days. The calculator converts to years for the discounting calculation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other options and derivatives calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">
                  Black-Scholes Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate theoretical option prices using the Black-Scholes model.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/options-profit-calculator" className="text-primary hover:underline">
                  Options Profit Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate profit and loss scenarios for option strategies.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/forward-rate-agreement-calculator" className="text-primary hover:underline">
                  Forward Rate Agreement Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate settlement payments for forward rate agreements.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/swap-spread-calculator" className="text-primary hover:underline">
                  Swap Spread Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the spread between swap rates and treasury rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Synthetic Positions and Arbitrage: Risk-Free Profit Mechanisms" />
    <meta itemProp="description" content="An expert guide detailing how to create synthetic stock positions using options (calls/puts), the principle of put-call parity, and the mechanisms of arbitrage (risk-free profit) in derivative and equity markets." />
    <meta itemProp="keywords" content="synthetic position formula, put-call parity explained, arbitrage opportunities finance, risk-free profit strategy, calculating synthetic stock price, options trading arbitrage" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-synthetic-arbitrage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Synthetic Positions and Arbitrage: Exploiting Market Parity</h1>
    <p className="text-lg italic text-gray-700">Master the derivative strategies that replicate stock ownership and the mechanisms used to lock in risk-free profit from market mispricings.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#synthetic-basics" className="hover:underline">Synthetic Positions: The Concept of Replication</a></li>
        <li><a href="#put-call-parity" className="hover:underline">Put-Call Parity: The Core Arbitrage Principle</a></li>
        <li><a href="#arbitrage-mechanics" className="hover:underline">Arbitrage Mechanics and Risk-Free Profit</a></li>
        <li><a href="#synthetic-types" className="hover:underline">Key Synthetic Positions and Their Formulas</a></li>
        <li><a href="#limits" className="hover:underline">Limitations and Practical Barriers to Arbitrage</a></li>
    </ul>
<hr />

    {/* SYNTHETIC POSITIONS: THE CONCEPT OF REPLICATION */}
    <h2 id="synthetic-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Synthetic Positions: The Concept of Replication</h2>
    <p>A <strong className="font-semibold">Synthetic Position</strong> is a derivatives strategy designed to replicate the risk and reward profile of a simpler security using a combination of other financial instruments (typically options). The goal is to create an identical position without actually trading the underlying asset.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Principle of No Arbitrage</h3>
    <p>Synthetic replication is based on the <strong className="font-semibold">Law of One Price</strong>, which states that two securities or portfolios that generate the exact same cash flows in the future must trade at the same price today. If they do not, an arbitrage opportunity exists.</p>
    <p>By combining a long call option and a short put option (both with the same strike price and expiration date), a trader can create a position that behaves exactly like owning the underlying stock. This is a <strong className="font-semibold">Synthetic Long Stock</strong> position.</p>

<hr />

    {/* PUT-CALL PARITY: THE CORE ARBITRAGE PRINCIPLE */}
    <h2 id="put-call-parity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Put-Call Parity: The Core Arbitrage Principle</h2>
    <p><strong className="font-semibold">Put-Call Parity</strong> is a fundamental theorem in options pricing that defines the necessary relationship between the price of European put options, European call options, the underlying stock price, and the present value of the strike price (adjusted for the risk-free rate).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Put-Call Parity Formula</h3>
    <p>The equation establishes the theoretical equivalence between two portfolios that both yield the underlying stock at expiration:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'C + PV(X) = P + S'}
        </p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$C$ = Price of the Call Option</li>
        <li>$PV(X)$ = Present Value of the Strike Price (X), discounted at the risk-free rate ($r$).</li>
        <li>$P$ = Price of the Put Option</li>
        <li>$S$ = Price of the Underlying Stock</li>
    </ul>
    <p>This formula is the mathematical backbone for arbitrage strategies involving options. If the equality does not hold, a mispricing exists.</p>

<hr />

    {/* ARBITRAGE MECHANICS AND RISK-FREE PROFIT */}
    <h2 id="arbitrage-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Arbitrage Mechanics and Risk-Free Profit</h2>
    <p><strong className="font-semibold">Arbitrage</strong> is the simultaneous buying and selling of the same asset in different markets or forms to profit from a temporary price difference. Because the profit is locked in by executing two opposing trades simultaneously, it is theoretically <strong className="font-semibold">risk-free</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Put-Call Parity Arbitrage Example</h3>
    <p>If the market prices violate the Put-Call Parity relationship, an arbitrageur acts immediately:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Identify Mispricing:</strong> Assume $C + PV(X)$ is greater than $P + S$. The synthetic portfolio is overpriced.</li>
        <li><strong className="font-semibold">Execute Trades:</strong> The arbitrageur sells the overpriced synthetic portfolio (Short Call, Buy Put, Borrow Money to buy Stock).</li>
        <li><strong className="font-semibold">Lock in Profit:</strong> The arbitrageur buys the cheaper direct portfolio (Buy Stock). The profit is the difference between the two side of the equation, realized immediately at execution.</li>
    </ol>
    <p>Arbitrage opportunities are rare and fleeting, as sophisticated traders and automated algorithms instantly exploit these mispricings, quickly driving prices back to parity.</p>

<hr />

    {/* KEY SYNTHETIC POSITIONS AND THEIR FORMULAS */}
    <h2 id="synthetic-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Synthetic Positions and Their Formulas</h2>
    <p>The Put-Call Parity formula can be algebraically rearranged to define any single instrument (S, C, or P) in terms of the other three, allowing traders to create a synthetic equivalent for any desired position.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Synthetic Long Stock (Buy Stock)</h3>
    <p>Replicates owning the underlying stock. Used when options are mispriced relative to the stock price.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'S = C - P + PV(X)'}
        </p>
    </div>
    <p>Strategy: Buy Call, Sell Put, Lend/Invest PV(X) at the risk-free rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Synthetic Long Call (Buy Call)</h3>
    <p>Replicates buying a call option. Used when the put option and stock combination are cheaper than the call option itself.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'C = P + S - PV(X)'}
        </p>
    </div>
    <p>Strategy: Buy Put, Buy Stock, Borrow PV(X).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Synthetic Long Put (Buy Put)</h3>
    <p>Replicates buying a put option. Used for quick hedging or when the call option and stock combination are expensive.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'P = C - S + PV(X)'}
        </p>
    </div>
    <p>Strategy: Buy Call, Sell Stock, Lend PV(X).</p>

<hr />

    {/* LIMITATIONS AND PRACTICAL BARRIERS TO ARBITRAGE */}
    <h2 id="limits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Practical Barriers to Arbitrage</h2>
    <p>While arbitrage is theoretically risk-free, several real-world factors prevent retail traders from consistently exploiting these opportunities.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Transaction Costs</h3>
    <p>Arbitrage requires simultaneous execution of multiple trades (e.g., buying a stock, selling a call, buying a put). The commissions and fees for these multiple transactions often consume the small profit margin created by the mispricing, making the net return negative.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Liquidity and Timeliness</h3>
    <p>Mispricings are usually small, lasting for milliseconds. Exploiting them requires near-instantaneous execution, which is dominated by high-frequency trading (HFT) firms. Furthermore, illiquid securities may not offer enough volume for the arbitrageur to execute all necessary legs of the trade at the required prices.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Dividend and Borrowing Costs</h3>
    <p>The Put-Call Parity formula is simplified and does not fully account for dividends paid on the stock before expiration or the actual cost of borrowing money for the position, both of which can alter the arbitrage calculation and eliminate the theoretical profit.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Synthetic positions and arbitrage are defined by the fundamental principle of <strong className="font-semibold">Put-Call Parity</strong>, which ensures that the cost of replicating a security must match the cost of the security itself.</p>
    <p>Arbitrage strategies exploit fleeting violations of this parity through simultaneous buying and selling, locking in a theoretical risk-free profit. While inaccessible to most individual traders due to speed and transaction costs, the core concept remains the bedrock of derivatives pricing and market efficiency.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Put-Call Parity and arbitrage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is Put-Call Parity?</h4>
            <p className="text-muted-foreground">
              Put-Call Parity is a fundamental principle in options pricing that shows the relationship between the price of a European call option and a European put option, both with the same underlying asset, strike price, and expiration date. In an efficient market, this relationship must hold to prevent risk-free arbitrage opportunities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the Put-Call Parity formula?</h4>
            <p className="text-muted-foreground">
              The formula is: P + S₀ = C + Ke⁻ʳᵀ, where P is the put price, S₀ is the stock price, C is the call price, K is the strike price, r is the risk-free rate, and T is time to expiration. The left side (P + S₀) is called a "protective put," and the right side (C + Ke⁻ʳᵀ) is a "fiduciary call." Both portfolios have identical payoffs at expiration.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does arbitrage work if parity is violated?</h4>
            <p className="text-muted-foreground">
              If the protective put is overpriced, arbitrageurs sell it and buy the fiduciary call. If the fiduciary call is overpriced, arbitrageurs sell it and buy the protective put. This trading activity forces prices back into parity, ensuring the relationship holds in efficient markets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Does Put-Call Parity apply to American options?</h4>
            <p className="text-muted-foreground">
              Put-Call Parity strictly applies only to European options (can't be exercised early). For American options, the relationship is an inequality rather than an equality due to early exercise opportunities. The formula provides bounds but not exact equality.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What assumptions does Put-Call Parity make?</h4>
            <p className="text-muted-foreground">
              Key assumptions include: European options (no early exercise), no dividends on the underlying stock during the option's life, a constant risk-free rate, no transaction costs or taxes, perfect liquidity and ability to borrow/lend at the risk-free rate, and no arbitrage opportunities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why might Put-Call Parity fail in practice?</h4>
            <p className="text-muted-foreground">
              Parity may fail due to transaction costs (bid-ask spreads, commissions), taxes, dividends on the underlying, early exercise features in American options, borrowing costs above the risk-free rate, settlement delays, or market inefficiencies. Small violations may not be arbitrageable once costs are considered.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How can I use Put-Call Parity to price options?</h4>
            <p className="text-muted-foreground">
              If you know the price of either the call or put, along with the stock price, strike price, risk-free rate, and time to expiration, you can solve for the other option's price. This is particularly useful for pricing synthetic positions or verifying that option prices are consistent with each other.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are synthetic positions?</h4>
            <p className="text-muted-foreground">
              Synthetic positions are combinations of options and the underlying stock that replicate another position. Examples include: synthetic long stock (long call + short put), synthetic short stock (short call + long put), synthetic long call (long stock + long put), and synthetic long put (long call + short stock).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do dividends affect Put-Call Parity?</h4>
            <p className="text-muted-foreground">
              Dividends paid on the underlying stock before option expiration affect Put-Call Parity. The formula must be adjusted to account for the present value of expected dividends. The modified formula becomes: P + S₀ = C + D + Ke⁻ʳᵀ, where D is the present value of dividends.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Is Put-Call Parity the same as no-arbitrage pricing?</h4>
            <p className="text-muted-foreground">
              Put-Call Parity is a specific application of the no-arbitrage principle to option pricing. It's one of many no-arbitrage relationships in finance. The principle that similar portfolios should have similar values (or arbitrage opportunities disappear) is fundamental to modern finance theory.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
