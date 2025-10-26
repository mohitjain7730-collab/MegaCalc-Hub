
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Forward Rate Agreements
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
