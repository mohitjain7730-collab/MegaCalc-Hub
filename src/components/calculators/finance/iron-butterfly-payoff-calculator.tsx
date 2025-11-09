'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Activity } from 'lucide-react';

const formSchema = z.object({
  lowerPutStrike: z.number().min(0).optional(),
  lowerPutPremium: z.number().min(0).optional(),
  middleStrike: z.number().min(0).optional(),
  callPremium: z.number().min(0).optional(),
  putPremium: z.number().min(0).optional(),
  upperCallStrike: z.number().min(0).optional(),
  upperCallPremium: z.number().min(0).optional(),
  stockPrice: z.number().min(0).optional(),
  contracts: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IronButterflyPayoffCalculator() {
  const [result, setResult] = useState<{
    netPremium: number;
    maxProfit: number;
    maxLoss: number;
    lowerBreakeven: number;
    upperBreakeven: number;
    profitAtExpiration: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lowerPutStrike: undefined as unknown as number,
      lowerPutPremium: undefined as unknown as number,
      middleStrike: undefined as unknown as number,
      callPremium: undefined as unknown as number,
      putPremium: undefined as unknown as number,
      upperCallStrike: undefined as unknown as number,
      upperCallPremium: undefined as unknown as number,
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
    if (v.lowerPutStrike == null || v.lowerPutPremium == null || v.middleStrike == null || 
        v.callPremium == null || v.putPremium == null || v.upperCallStrike == null || v.upperCallPremium == null ||
        v.lowerPutStrike <= 0 || v.lowerPutPremium <= 0 || v.middleStrike <= 0 || 
        v.callPremium <= 0 || v.putPremium <= 0 || v.upperCallStrike <= 0 || v.upperCallPremium <= 0) {
      setResult(null);
      return;
    }
    const contracts = v.contracts ?? 1;
    const contractSize = 100;
    
    // Iron Butterfly: Sell lower put, buy middle put, sell middle call, buy upper call
    // Net premium received = (Lower Put Premium + Middle Call Premium) - (Middle Put Premium + Upper Call Premium)
    const netPremium = (v.lowerPutPremium + v.callPremium - v.putPremium - v.upperCallPremium) * contracts * contractSize;
    
    // Max profit = Net premium received (when stock is at middle strike at expiration)
    const maxProfit = netPremium;
    
    // Max loss occurs when stock is at lower or upper strike
    const lowerLoss = (v.lowerPutStrike - v.middleStrike) * contracts * contractSize - netPremium;
    const upperLoss = (v.upperCallStrike - v.middleStrike) * contracts * contractSize - netPremium;
    const maxLoss = Math.max(lowerLoss, upperLoss);
    
    // Breakeven points
    const lowerBreakeven = v.middleStrike - (netPremium / (contracts * contractSize));
    const upperBreakeven = v.middleStrike + (netPremium / (contracts * contractSize));
    
    // Profit at expiration (if stock price provided)
    let profitAtExpiration = 0;
    if (v.stockPrice != null && v.stockPrice > 0) {
      if (v.stockPrice <= v.lowerPutStrike) {
        profitAtExpiration = (v.stockPrice - v.middleStrike) * contracts * contractSize + netPremium;
      } else if (v.stockPrice >= v.upperCallStrike) {
        profitAtExpiration = (v.middleStrike - v.stockPrice) * contracts * contractSize + netPremium;
      } else {
        profitAtExpiration = netPremium;
      }
    }
    
    const interpretation = `Net premium: $${netPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Maximum profit: $${maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} when stock is at middle strike $${v.middleStrike.toFixed(2)} at expiration. Maximum loss: $${maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Lower breakeven: $${lowerBreakeven.toFixed(2)}. Upper breakeven: $${upperBreakeven.toFixed(2)}. ${v.stockPrice != null && v.stockPrice > 0 ? `Profit at expiration (stock = $${v.stockPrice.toFixed(2)}): $${profitAtExpiration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : ''} Iron butterfly profits when stock stays near middle strike, making it ideal for low volatility expectations.`;
    setResult({ netPremium, maxProfit, maxLoss, lowerBreakeven, upperBreakeven, profitAtExpiration, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Iron Butterfly Payoff Calculator</CardTitle>
          <CardDescription>Calculate profit and loss for iron butterfly options strategies with multiple strike prices to analyze risk and reward.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('lowerPutStrike', 'Lower Put Strike ($)', 'e.g., 45.00', '$')}
                {numInput('lowerPutPremium', 'Lower Put Premium ($)', 'e.g., 1.00', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('middleStrike', 'Middle Strike ($)', 'e.g., 50.00', '$')}
                {numInput('putPremium', 'Middle Put Premium ($)', 'e.g., 2.50', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('callPremium', 'Middle Call Premium ($)', 'e.g., 2.50', '$')}
                {numInput('upperCallStrike', 'Upper Call Strike ($)', 'e.g., 55.00', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('upperCallPremium', 'Upper Call Premium ($)', 'e.g., 1.00', '$')}
                {numInput('stockPrice', 'Stock Price at Expiration ($, optional)', 'e.g., 50.00', '$')}
              </div>
              {numInput('contracts', 'Number of Contracts (optional, default: 1)', 'e.g., 1')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Iron butterfly payoff analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Net Premium</div><div className={`text-xl font-semibold ${result.netPremium >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Profit</div><div className="text-xl font-medium text-green-600">${result.maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Loss</div><div className="text-xl font-medium text-red-600">${result.maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Lower Breakeven</div><div className="text-lg font-medium">${result.lowerBreakeven.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Upper Breakeven</div><div className="text-lg font-medium">${result.upperBreakeven.toFixed(2)}</div></div>
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
          <CardDescription>Options strategies and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/straddle-strangle-strategy-calculator" className="text-primary hover:underline">Straddle / Strangle</a></h4><p className="text-sm text-muted-foreground">Volatility strategies.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/covered-call-return-analyzer" className="text-primary hover:underline">Covered Call Return</a></h4><p className="text-sm text-muted-foreground">Strategy analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-breakeven-price-calculator" className="text-primary hover:underline">Option Breakeven Price</a></h4><p className="text-sm text-muted-foreground">Profit thresholds.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding iron butterfly options strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Iron Butterfly consists of: Sell lower put, buy middle put, sell middle call, buy upper call. All options have the same expiration date.</li>
            <li>Net Premium = (Lower Put Premium + Middle Call Premium) - (Middle Put Premium + Upper Call Premium). Positive net premium means you receive money upfront.</li>
            <li>Maximum profit occurs when stock is at middle strike at expiration. All options expire worthless, and you keep the net premium received.</li>
            <li>Maximum loss occurs when stock is at lower put strike or upper call strike. Loss = Strike Width - Net Premium.</li>
            <li>Breakeven points: Lower Breakeven = Middle Strike - Net Premium per share. Upper Breakeven = Middle Strike + Net Premium per share. Strategy profits between these points.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Iron butterfly, options strategies, and risk/reward analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an iron butterfly?</h4><p className="text-muted-foreground">An iron butterfly is a four-leg options strategy: sell lower put, buy middle put, sell middle call, buy upper call. All options have the same expiration. It profits when stock stays near the middle strike.</p></div>
          <div><h4 className="font-semibold mb-2">How does iron butterfly work?</h4><p className="text-muted-foreground">Iron butterfly profits when stock price stays near the middle strike at expiration. You collect net premium upfront and keep it if stock remains between the breakeven points. Losses occur if stock moves significantly away from middle strike.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for iron butterfly?</h4><p className="text-muted-foreground">Maximum profit = Net Premium Received. This occurs when stock is exactly at the middle strike at expiration, as all options expire worthless and you keep the premium.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum loss for iron butterfly?</h4><p className="text-muted-foreground">Maximum loss = Strike Width - Net Premium. This occurs when stock is at the lower put strike or upper call strike at expiration. Loss is limited but can be significant if strikes are wide.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use iron butterfly?</h4><p className="text-muted-foreground">Use iron butterfly when you expect low volatility and stock to stay near current price (middle strike). It's ideal for neutral outlooks with limited price movement expectations.</p></div>
          <div><h4 className="font-semibold mb-2">What are the breakeven points?</h4><p className="text-muted-foreground">Lower Breakeven = Middle Strike - Net Premium per share. Upper Breakeven = Middle Strike + Net Premium per share. Strategy is profitable between these points at expiration.</p></div>
          <div><h4 className="font-semibold mb-2">How does iron butterfly compare to regular butterfly?</h4><p className="text-muted-foreground">Iron butterfly uses both puts and calls (mixed), while regular butterfly uses only calls or only puts. Iron butterfly typically has lower cost (can receive net premium) but similar payoff structure.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks of iron butterfly?</h4><p className="text-muted-foreground">Risks include unlimited loss potential if stock moves significantly away from middle strike, early assignment risk, and time decay working against you if stock doesn't stay near middle strike.</p></div>
          <div><h4 className="font-semibold mb-2">Can I close iron butterfly before expiration?</h4><p className="text-muted-foreground">Yes, you can close all four legs before expiration. Close when you've reached profit target, to limit losses, or if outlook changes. Consider transaction costs when closing early.</p></div>
          <div><h4 className="font-semibold mb-2">How do I choose strike prices for iron butterfly?</h4><p className="text-muted-foreground">Choose middle strike near current stock price. Lower and upper strikes should be equidistant from middle strike. Wider strikes increase max loss but may increase net premium. Balance risk/reward based on volatility expectations.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



