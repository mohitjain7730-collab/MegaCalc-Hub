
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, Calculator, Info, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  swapRate: z.number().positive(),
  treasuryRate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwapSpreadCalculator() {
  const [result, setResult] = useState<{ spread: number; spreadBasis: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      swapRate: 0,
      treasuryRate: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { swapRate, treasuryRate } = values;
    const spread = swapRate - treasuryRate;
    const spreadBasis = spread * 10000;
    setResult({ spread, spreadBasis });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Swap Spread Parameters
          </CardTitle>
          <CardDescription>
            Enter swap rate and treasury rate to calculate the spread
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="swapRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Swap Rate (Annual %)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 3.5"
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
                  name="treasuryRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treasury Rate (Annual %)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 3.0"
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
              <Button type="submit">Calculate Swap Spread</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Swap Spread</CardTitle>
                <CardDescription>Difference between swap and treasury rates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {result.spreadBasis.toFixed(2)} bps
              </div>
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Spread: {result.spread.toFixed(4)}% ({result.spreadBasis.toFixed(2)} basis points)
              </Badge>
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
            <h4 className="font-semibold text-foreground mb-2">Swap Rate (Annual %)</h4>
            <p className="text-muted-foreground">
              The fixed interest rate paid in a swap contract. It represents the market's expectation of future floating rates plus a credit and liquidity premium. Swap rates are quoted as annual percentages and vary by maturity (e.g., 1-year, 5-year, 10-year swaps).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Treasury Rate (Annual %)</h4>
            <p className="text-muted-foreground">
              The risk-free rate on a government bond with a matching maturity to the swap. Treasury rates serve as the benchmark for risk-free returns and are typically lower than swap rates. Enter as an annual percentage.
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
                <a href="/category/finance/forward-rate-agreement-calculator" className="text-primary hover:underline">
                  Forward Rate Agreement Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate settlement payments for forward rate agreements on interest rates.
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Swap Spread Calculation, Interpretation, and Fixed Income Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Swap Spread formula, its calculation as the difference between the fixed leg of an interest rate swap and the government bond yield (Treasury), and its crucial role as a barometer for credit risk and market liquidity." />
    <meta itemProp="keywords" content="swap spread formula explained, calculating swap spread, fixed leg of interest rate swap, treasury yield swap spread, credit risk indicator finance, market liquidity benchmark, Libor-OIS spread relation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-swap-spread-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Swap Spread: Market Barometer for Risk and Liquidity</h1>
    <p className="text-lg italic text-muted-foreground">Master the foundational metric in fixed income markets that measures the difference between derivative pricing and government benchmark yields.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Swap Spread Definition and Components</a></li>
        <li><a href="#calculation" className="hover:underline">The Swap Spread Calculation Formula</a></li>
        <li><a href="#risk-interpretation" className="hover:underline">Interpretation as Credit Risk and Liquidity Indicator</a></li>
        <li><a href="#arbitrage" className="hover:underline">Synthetic Treasury vs. Arbitrage Mechanics</a></li>
        <li><a href="#drivers" className="hover:underline">Key Drivers of Swap Spread Fluctuations</a></li>
    </ul>
<hr />

    {/* SWAP SPREAD DEFINITION AND COMPONENTS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Swap Spread Definition and Components</h2>
    <p>The **Swap Spread** is the difference between the fixed annual rate paid on a plain vanilla **Interest Rate Swap (IRS)** and the yield on a government bond (typically a U.S. Treasury bond) of the same maturity. It is expressed in basis points (bps).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interest Rate Swap (IRS) Fixed Leg</h3>
    <p>In a standard IRS, one party agrees to pay a **Fixed Rate** in exchange for receiving a **Floating Rate** (usually based on SOFR or an equivalent interbank rate). The fixed rate is the rate that makes the present value of the fixed payments equal to the present value of the expected floating payments at the contract's inception.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Benchmark (Risk-Free Rate)</h3>
    <p>The government bond yield (e.g., the U.S. Treasury yield) serves as the benchmark **Risk-Free Rate**. Government bonds are considered the purest measure of risk-free return because they are backed by the taxing authority of the government.</p>

<hr />

    {/* THE SWAP SPREAD CALCULATION FORMULA */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Swap Spread Calculation Formula</h2>
    <p>The Swap Spread calculation is a simple subtraction that immediately reveals the premium the market is placing on the derivative contract over the government benchmark.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The calculation is based on the comparison of two rates for the same maturity (e.g., 10 years):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Swap Spread = Swap Fixed Rate - Treasury Yield'}
        </p>
    </div>
    <p>The result is typically positive, meaning the fixed rate paid on the swap is usually higher than the government bond yield, reflecting the inherent differences in credit risk, liquidity, and supply between the two instruments.</p>

<hr />

    {/* INTERPRETATION AS CREDIT RISK AND LIQUIDITY INDICATOR */}
    <h2 id="risk-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation as Credit Risk and Liquidity Indicator</h2>
    <p>The Swap Spread is a vital barometer of the health and stability of the global financial system. Its magnitude and movement provide deep insight into market conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Credit Risk Component</h3>
    <p>The largest driver of a positive swap spread is the **Credit Risk** embedded in the swap contract. The fixed-rate receiver in an IRS faces counterparty risk—the risk that the floating-rate payer will default. Since Treasury bonds have negligible credit risk, the positive spread compensates the swap participant for accepting this counterparty risk. A **widening swap spread** often signals increased counterparty risk in the banking system.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Liquidity Component</h3>
    <p>The spread also reflects the difference in liquidity. Treasury bonds are the most liquid securities in the world. Swap contracts, though highly liquid, are typically less so. The premium may compensate for the lower tradability of the swap.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Negative Swap Spreads (Market Stress)</h3>
    <p>Historically, Swap Spreads have always been positive. However, during periods of extreme financial distress (e.g., the 2008 crisis), spreads can turn **negative**. This anomaly occurs when intense demand for the safety of Treasury bonds drives their yields down faster than swap rates. A negative spread signals a severe **flight to quality**, where investors accept a lower return on Treasuries just for the guarantee of safety, overriding normal risk premiums.</p>

<hr />

    {/* ARBITRAGE MECHANICS AND SYNTHETIC TREASURY */}
    <h2 id="arbitrage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Synthetic Treasury vs. Arbitrage Mechanics</h2>
    <p>The Swap Spread concept relies on the theoretical link between creating a government bond synthetically using a derivative.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Creating a Synthetic Treasury</h3>
    <p>A portfolio can be constructed to synthetically replicate the cash flows of a Treasury bond:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Buy:** A fixed-rate payment (the fixed leg of an IRS).</li>
        <li>**Receive:** A floating-rate payment (the floating leg of an IRS).</li>
        <li>**Use Floating Rate:** To pay off floating-rate debt (effectively converting floating liability into a fixed liability).</li>
    </ul>
    <p>In theory, the fixed payment required in the swap should equal the Treasury yield, but the spread difference prevents immediate, risk-free arbitrage due to the credit and liquidity differences.</p>

<hr />

    {/* KEY DRIVERS OF SWAP SPREAD FLUCTUATIONS */}
    <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Drivers of Swap Spread Fluctuations</h2>
    <p>Understanding what moves the swap spread provides predictive insight into market health and interest rate expectations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Supply and Demand Dynamics</h3>
    <p>The largest fluctuations occur due to the supply of Treasuries and the demand for fixed-rate debt. For example, large bond issuance by the government can temporarily depress Treasury prices, causing yields to rise and the swap spread to narrow.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monetary Policy Expectations</h3>
    <p>Swap rates reflect the market's expectation of future central bank interest rate movements. A sudden shift in the expected path of the base rate impacts the swap fixed rate more immediately than the long-term Treasury yield, causing temporary fluctuations in the spread.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Swap Spread is a fundamental gauge of the global debt market, calculated as the difference between the **fixed leg of an Interest Rate Swap** and the **yield of a benchmark Treasury bond** of equal maturity.</p>
    <p>Its primary value lies in quantifying the market's assessment of **counterparty credit risk** and liquidity premium. Analyzing the Swap Spread is essential for macro investors seeking real-time signals regarding financial system stability and long-term interest rate trends.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about swap spreads and their significance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a swap spread?</h4>
            <p className="text-muted-foreground">
              A swap spread is the difference between the fixed rate on an interest rate swap and the yield on a Treasury security of the same maturity. It represents the premium investors require to take on credit and liquidity risk beyond the risk-free Treasury rate. A positive spread means the swap rate exceeds the Treasury rate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why are swap spreads important?</h4>
            <p className="text-muted-foreground">
              Swap spreads are crucial market indicators because they reflect credit risk, liquidity conditions, supply and demand for swaps, and overall market stress. Widening spreads indicate increased perceived risk or reduced liquidity. Analysts and investors monitor spreads to assess market conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What causes swap spreads to widen or narrow?</h4>
            <p className="text-muted-foreground">
              Swap spreads widen due to increased credit concerns, reduced liquidity, regulatory changes, or imbalances in supply and demand. They narrow when credit conditions improve, liquidity increases, or when arbitrage activities reduce disparities. Central bank policies and changes in bank capital requirements also impact spreads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret a negative swap spread?</h4>
            <p className="text-muted-foreground">
              A negative swap spread (swap rate below Treasury rate) is unusual and often indicates structural market factors such as high demand for fixed-rate swaps, regulatory requirements forcing banks to pay fixed, or imbalances in hedging demand. It suggests the swap market is pricing differently than simple credit premium models would predict.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What affects swap spread levels?</h4>
            <p className="text-muted-foreground">
              Factors include counterparty credit risk in swap markets, liquidity differences between swaps and Treasuries, bank capital requirements and regulations, supply and demand for hedging, corporate bond market dynamics, and central bank monetary policy. Changes in any of these can move swap spreads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do swap spreads differ across maturities?</h4>
            <p className="text-muted-foreground">
              Swap spreads typically vary by maturity, often reflecting different risk profiles for different time horizons. Shorter-term spreads may be more influenced by monetary policy expectations, while longer-term spreads may reflect growth and inflation expectations. The term structure of swap spreads provides additional insights into market views.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the relationship between swap spreads and credit spreads?</h4>
            <p className="text-muted-foreground">
              Swap spreads include both credit and liquidity components. While they're related to corporate bond credit spreads, swap spreads also reflect the specific risks of counterparty default in swap markets, differences in liquidity between swaps and corporate bonds, and institutional demand factors. They may move with credit spreads but not always in lockstep.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How can swap spreads be used in portfolio management?</h4>
            <p className="text-muted-foreground">
              Portfolio managers use swap spreads to assess relative value between swaps and Treasuries, identify arbitrage opportunities, hedge interest rate risk, and gauge market sentiment. A widening spread may signal switching from corporate bonds to swaps for better value. Monitoring spreads helps time hedging and investment decisions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why have swap spreads been historically volatile?</h4>
            <p className="text-muted-foreground">
              Swap spreads have shown high volatility due to financial crises (widening during stress), changing bank capital regulations, shifts in dealer inventory levels, changes in hedging demand from pension funds and insurance companies, monetary policy transitions, and episodic liquidity shocks. Post-financial crisis regulations have fundamentally altered spread dynamics.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How are swap spreads used in pricing financial instruments?</h4>
            <p className="text-muted-foreground">
              Swap spreads are used to determine the appropriate discount rates for derivative valuations, to price new issuance of corporate bonds and loans, to calculate the cost of funding, to price structured products, and to benchmark floating-rate instruments. Accurate spread assessment is essential for proper valuation across fixed-income markets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
