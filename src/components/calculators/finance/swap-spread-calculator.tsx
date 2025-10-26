
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Swap Spreads
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

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
