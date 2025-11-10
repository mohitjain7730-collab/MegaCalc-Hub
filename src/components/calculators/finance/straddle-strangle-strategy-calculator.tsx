'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Zap } from 'lucide-react';

const formSchema = z.object({
  strategyType: z.enum(['straddle', 'strangle']),
  callStrike: z.number().min(0).optional(),
  callPremium: z.number().min(0).optional(),
  putStrike: z.number().min(0).optional(),
  putPremium: z.number().min(0).optional(),
  stockPrice: z.number().min(0).optional(),
  contracts: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StraddleStrangleStrategyCalculator() {
  const [result, setResult] = useState<{
    totalPremium: number;
    lowerBreakeven: number;
    upperBreakeven: number;
    maxLoss: number;
    profitAtExpiration: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strategyType: 'straddle',
      callStrike: undefined as unknown as number,
      callPremium: undefined as unknown as number,
      putStrike: undefined as unknown as number,
      putPremium: undefined as unknown as number,
      stockPrice: undefined as unknown as number,
      contracts: undefined as unknown as number,
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
                let min: number | undefined = undefined;
                if (name === 'contracts') {
                  min = 1;
                }
                field.onChange(Number.isFinite(n as any) && n !== null && (min === undefined || n >= min) && n >= 0 ? n : undefined);
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
    if (v.callStrike == null || v.callPremium == null || v.putStrike == null || v.putPremium == null ||
        v.callStrike <= 0 || v.callPremium <= 0 || v.putStrike <= 0 || v.putPremium <= 0) {
      setResult(null);
      return;
    }
    const contracts = v.contracts ?? 1;
    const contractSize = 100;
    const totalPremium = (v.callPremium + v.putPremium) * contracts * contractSize;
    
    let lowerBreakeven: number;
    let upperBreakeven: number;
    
    if (v.strategyType === 'straddle') {
      // Straddle: same strike for call and put
      const strike = v.callStrike; // Should equal putStrike for straddle
      lowerBreakeven = strike - (totalPremium / (contracts * contractSize));
      upperBreakeven = strike + (totalPremium / (contracts * contractSize));
    } else {
      // Strangle: different strikes
      lowerBreakeven = v.putStrike - (totalPremium / (contracts * contractSize));
      upperBreakeven = v.callStrike + (totalPremium / (contracts * contractSize));
    }
    
    const maxLoss = totalPremium; // Maximum loss is premium paid
    
    // Profit at expiration
    let profitAtExpiration = 0;
    if (v.stockPrice != null && v.stockPrice > 0) {
      const callProfit = Math.max(0, v.stockPrice - v.callStrike) * contracts * contractSize;
      const putProfit = Math.max(0, v.putStrike - v.stockPrice) * contracts * contractSize;
      profitAtExpiration = callProfit + putProfit - totalPremium;
    }
    
    const interpretation = `Total premium paid: $${totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Lower breakeven: $${lowerBreakeven.toFixed(2)}. Upper breakeven: $${upperBreakeven.toFixed(2)}. Maximum loss: $${maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (premium paid). ${v.stockPrice != null && v.stockPrice > 0 ? `Profit at expiration (stock = $${v.stockPrice.toFixed(2)}): $${profitAtExpiration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : ''} ${v.strategyType === 'straddle' ? 'Straddle' : 'Strangle'} profits when stock moves significantly in either direction, making it ideal for high volatility expectations.`;
    setResult({ totalPremium, lowerBreakeven, upperBreakeven, maxLoss, profitAtExpiration, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5"/> Straddle / Strangle Strategy Calculator</CardTitle>
          <CardDescription>Calculate profit and loss for straddle and strangle options strategies to analyze volatility trading opportunities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="strategyType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straddle">Straddle (Same Strike)</SelectItem>
                        <SelectItem value="strangle">Strangle (Different Strikes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('callStrike', 'Call Strike Price ($)', 'e.g., 50.00', '$')}
                {numInput('callPremium', 'Call Premium ($)', 'e.g., 2.50', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('putStrike', 'Put Strike Price ($)', 'e.g., 50.00', '$')}
                {numInput('putPremium', 'Put Premium ($)', 'e.g., 2.50', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('stockPrice', 'Stock Price at Expiration ($, optional)', 'e.g., 55.00', '$')}
                {numInput('contracts', 'Number of Contracts (optional, default: 1)', 'e.g., 1')}
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Straddle / Strangle payoff analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Total Premium</div><div className="text-xl font-semibold text-red-600">${result.totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Lower Breakeven</div><div className="text-lg font-medium">${result.lowerBreakeven.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Upper Breakeven</div><div className="text-lg font-medium">${result.upperBreakeven.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Loss</div><div className="text-xl font-medium text-red-600">${result.maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              {result.profitAtExpiration !== 0 && (
                <div><div className="text-sm text-muted-foreground">Profit at Expiration</div><div className={`text-lg font-medium ${result.profitAtExpiration >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.profitAtExpiration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              )}
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Options strategies and volatility trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/iron-butterfly-payoff-calculator" className="text-primary hover:underline">Iron Butterfly</a></h4><p className="text-sm text-muted-foreground">Neutral strategies.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-breakeven-price-calculator" className="text-primary hover:underline">Option Breakeven Price</a></h4><p className="text-sm text-muted-foreground">Profit thresholds.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-time-decay-simulator" className="text-primary hover:underline">Option Time Decay</a></h4><p className="text-sm text-muted-foreground">Theta impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding straddle and strangle options strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Straddle: Buy call and put with the same strike price and expiration. Profits when stock moves significantly in either direction (high volatility).</li>
            <li>Strangle: Buy call and put with different strike prices (call strike > put strike) and same expiration. Similar to straddle but cheaper (lower premium).</li>
            <li>Total Premium = Call Premium + Put Premium. This is the maximum loss if both options expire worthless.</li>
            <li>Lower Breakeven = Put Strike - Total Premium per share. Upper Breakeven = Call Strike + Total Premium per share. Strategy profits outside this range.</li>
            <li>Both strategies profit from volatility. Straddle requires larger move to profit (higher breakeven), while strangle is cheaper but also requires larger move.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Straddle, strangle, volatility trading, and options strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a straddle?</h4><p className="text-muted-foreground">A straddle is buying a call and put with the same strike price and expiration. It profits when stock moves significantly in either direction, making it ideal for high volatility expectations.</p></div>
          <div><h4 className="font-semibold mb-2">What is a strangle?</h4><p className="text-muted-foreground">A strangle is buying a call and put with different strike prices (call strike &gt; put strike) and same expiration. It's cheaper than straddle but requires larger price movement to profit.</p></div>
          <div><h4 className="font-semibold mb-2">What is the difference between straddle and strangle?</h4><p className="text-muted-foreground">Straddle uses same strike for call and put, while strangle uses different strikes. Strangle is cheaper (lower premium) but requires larger price movement to profit. Straddle has higher breakeven points.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use straddle or strangle?</h4><p className="text-muted-foreground">Use straddle or strangle when you expect high volatility but are uncertain about direction. Ideal for earnings announcements, major news events, or when expecting significant price movement.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum loss for straddle/strangle?</h4><p className="text-muted-foreground">Maximum loss = Total Premium Paid (Call Premium + Put Premium). This occurs when both options expire worthless (stock stays between breakeven points).</p></div>
          <div><h4 className="font-semibold mb-2">What are the breakeven points?</h4><p className="text-muted-foreground">Lower Breakeven = Put Strike - Total Premium per share. Upper Breakeven = Call Strike + Total Premium per share. Strategy is profitable if stock moves beyond these points at expiration.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for straddle/strangle?</h4><p className="text-muted-foreground">Maximum profit is theoretically unlimited if stock moves significantly in either direction. There's no upper limit to how far stock can move, making profit potential unlimited.</p></div>
          <div><h4 className="font-semibold mb-2">How does time decay affect straddle/strangle?</h4><p className="text-muted-foreground">Time decay (theta) works against you, as both options lose value over time. Straddle/strangle buyers need significant price movement before expiration to overcome time decay and profit.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use straddle or strangle?</h4><p className="text-muted-foreground">Straddle is more expensive but has tighter breakeven points. Strangle is cheaper but requires larger move. Choose based on volatility expectations and risk tolerance. Strangle is often preferred for cost efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">Can I sell straddle/strangle instead of buying?</h4><p className="text-muted-foreground">Yes, selling straddle/strangle (short) collects premium but has unlimited loss potential. You profit if stock stays between breakeven points, but face unlimited risk if stock moves significantly. Very risky strategy.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}








