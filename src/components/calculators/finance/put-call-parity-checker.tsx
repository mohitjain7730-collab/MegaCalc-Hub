'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  callPrice: z.number().min(0).optional(),
  putPrice: z.number().min(0).optional(),
  strikePrice: z.number().min(0).optional(),
  spotPrice: z.number().min(0).optional(),
  interestRate: z.number().min(0).optional(),
  timeToExpiration: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PutCallParityChecker() {
  const [result, setResult] = useState<{
    leftSide: number;
    rightSide: number;
    difference: number;
    isParity: boolean;
    arbitrageOpportunity: boolean;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      callPrice: undefined as unknown as number,
      putPrice: undefined as unknown as number,
      strikePrice: undefined as unknown as number,
      spotPrice: undefined as unknown as number,
      interestRate: undefined as unknown as number,
      timeToExpiration: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
              onChange={e => {
                const v = e.target.value;
                const n = v === '' ? undefined : Number(v);
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.callPrice == null || v.putPrice == null || v.strikePrice == null || v.spotPrice == null ||
        v.callPrice <= 0 || v.putPrice <= 0 || v.strikePrice <= 0 || v.spotPrice <= 0) {
      setResult(null);
      return;
    }
    const r = (v.interestRate ?? 0) / 100;
    const t = (v.timeToExpiration ?? 0) / 365;
    const presentValueStrike = v.strikePrice / Math.pow(1 + r, t);
    const leftSide = v.callPrice + presentValueStrike;
    const rightSide = v.putPrice + v.spotPrice;
    const difference = Math.abs(leftSide - rightSide);
    const isParity = difference < 0.01;
    const arbitrageOpportunity = difference > 0.10;
    const interpretation = `Put-Call Parity: Left side (Call + PV(Strike)) = $${leftSide.toFixed(2)}, Right side (Put + Spot) = $${rightSide.toFixed(2)}. Difference: $${difference.toFixed(2)}. ${isParity ? 'Parity holds (difference < $0.01). Options are correctly priced.' : arbitrageOpportunity ? 'Large difference detected (difference > $0.10). Potential arbitrage opportunity exists. Consider executing the arbitrage strategy.' : 'Small difference detected. Options are approximately correctly priced, but small discrepancies may exist due to transaction costs or market frictions.'}`;
    setResult({ leftSide, rightSide, difference, isParity, arbitrageOpportunity, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5"/> Put-Call Parity Checker</CardTitle>
          <CardDescription>Check put-call parity relationship between put and call options to identify arbitrage opportunities and verify option pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('callPrice', 'Call Option Price ($)', 'e.g., 5.00', '$')}
                {numInput('putPrice', 'Put Option Price ($)', 'e.g., 2.00', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('strikePrice', 'Strike Price ($)', 'e.g., 50.00', '$')}
                {numInput('spotPrice', 'Spot Price ($)', 'e.g., 52.00', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('interestRate', 'Risk-Free Interest Rate (%, optional)', 'e.g., 5', '%')}
                {numInput('timeToExpiration', 'Time to Expiration (days, optional)', 'e.g., 30')}
              </div>
              <Button type="submit" className="w-full md:w-auto">Check Parity</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Put-call parity analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Left Side</div><div className="text-xl font-semibold">${result.leftSide.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Right Side</div><div className="text-xl font-semibold">${result.rightSide.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Difference</div><div className={`text-xl font-medium ${result.isParity ? 'text-green-600' : result.arbitrageOpportunity ? 'text-red-600' : 'text-orange-600'}`}>${result.difference.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Parity Status</div><div className={`text-lg font-medium ${result.isParity ? 'text-green-600' : 'text-orange-600'}`}>{result.isParity ? 'Holds' : 'Violated'}</div></div>
              <div><div className="text-sm text-muted-foreground">Arbitrage</div><div className={`text-lg font-medium ${result.arbitrageOpportunity ? 'text-red-600' : 'text-green-600'}`}>{result.arbitrageOpportunity ? 'Opportunity' : 'None'}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Options pricing and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-breakeven-price-calculator" className="text-primary hover:underline">Option Breakeven Price</a></h4><p className="text-sm text-muted-foreground">Profit thresholds.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-time-decay-simulator" className="text-primary hover:underline">Option Time Decay</a></h4><p className="text-sm text-muted-foreground">Theta impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/covered-call-return-analyzer" className="text-primary hover:underline">Covered Call Return</a></h4><p className="text-sm text-muted-foreground">Strategy analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/arbitrage-profit-calculator" className="text-primary hover:underline">Arbitrage Profit</a></h4><p className="text-sm text-muted-foreground">Price differences.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding put-call parity and option pricing relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Put-Call Parity: Call + PV(Strike) = Put + Spot. This relationship must hold for European options to prevent arbitrage opportunities.</li>
            <li>PV(Strike) = Strike Price / (1 + r)^t, where r is risk-free interest rate and t is time to expiration in years.</li>
            <li>If parity is violated (large difference), arbitrage opportunity exists. Buy the undervalued side and sell the overvalued side to lock in risk-free profit.</li>
            <li>Put-call parity applies to European options (exercisable only at expiration). American options may deviate due to early exercise opportunities.</li>
            <li>Factors affecting parity include transaction costs, dividends, early exercise (American options), and market frictions. Small differences may be due to these factors.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Put-call parity, option pricing, and arbitrage opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is put-call parity?</h4><p className="text-muted-foreground">Put-call parity is a relationship between put and call options with the same strike and expiration: Call + PV(Strike) = Put + Spot. It must hold to prevent arbitrage.</p></div>
          <div><h4 className="font-semibold mb-2">Why is put-call parity important?</h4><p className="text-muted-foreground">Put-call parity ensures option prices are consistent. Violations indicate mispricing and arbitrage opportunities, allowing risk-free profit by buying the undervalued side and selling the overvalued side.</p></div>
          <div><h4 className="font-semibold mb-2">How is put-call parity calculated?</h4><p className="text-muted-foreground">Put-Call Parity: Call + PV(Strike) = Put + Spot, where PV(Strike) = Strike / (1 + r)^t. If both sides are equal (within small tolerance), parity holds.</p></div>
          <div><h4 className="font-semibold mb-2">Does put-call parity apply to American options?</h4><p className="text-muted-foreground">Put-call parity applies strictly to European options (exercisable only at expiration). American options may deviate due to early exercise opportunities, but the relationship is approximately true.</p></div>
          <div><h4 className="font-semibold mb-2">What if put-call parity is violated?</h4><p className="text-muted-foreground">If parity is violated (large difference), arbitrage opportunity exists. Execute the arbitrage strategy: buy the undervalued side and sell the overvalued side to lock in risk-free profit.</p></div>
          <div><h4 className="font-semibold mb-2">How do dividends affect put-call parity?</h4><p className="text-muted-foreground">Dividends affect put-call parity by reducing the spot price (adjusted for present value of dividends). Modified parity: Call + PV(Strike) = Put + Spot - PV(Dividends).</p></div>
          <div><h4 className="font-semibold mb-2">What is a reasonable tolerance for put-call parity?</h4><p className="text-muted-foreground">Small differences (&lt;$0.01) are acceptable due to transaction costs and market frictions. Large differences (&gt;$0.10) indicate potential arbitrage opportunities or significant mispricing.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use put-call parity to price options?</h4><p className="text-muted-foreground">Yes. If you know three of the four values (call price, put price, spot price, strike price), you can calculate the fourth using put-call parity, assuming parity holds.</p></div>
          <div><h4 className="font-semibold mb-2">How does interest rate affect put-call parity?</h4><p className="text-muted-foreground">Higher interest rates increase PV(Strike), making the left side larger. This means calls should be more expensive relative to puts, all else equal, to maintain parity.</p></div>
          <div><h4 className="font-semibold mb-2">What are transaction costs in put-call parity arbitrage?</h4><p className="text-muted-foreground">Transaction costs (commissions, spreads, borrowing costs) reduce arbitrage profits. Ensure the difference exceeds transaction costs before executing arbitrage strategies.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


