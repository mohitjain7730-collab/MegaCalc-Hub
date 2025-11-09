'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, BarChart3 } from 'lucide-react';

const formSchema = z.object({
  stockPrice: z.number().min(0).optional(),
  strikePrice: z.number().min(0).optional(),
  optionPremium: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  expirationPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CoveredCallReturnAnalyzer() {
  const [result, setResult] = useState<{
    premiumIncome: number;
    capitalGain: number;
    totalReturn: number;
    returnPercent: number;
    maxProfit: number;
    maxProfitPrice: number;
    breakevenPrice: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockPrice: undefined as unknown as number,
      strikePrice: undefined as unknown as number,
      optionPremium: undefined as unknown as number,
      shares: undefined as unknown as number,
      expirationPrice: undefined as unknown as number,
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
    if (v.stockPrice == null || v.strikePrice == null || v.optionPremium == null || v.shares == null ||
        v.stockPrice <= 0 || v.strikePrice <= 0 || v.optionPremium <= 0 || v.shares <= 0) {
      setResult(null);
      return;
    }
    const premiumIncome = v.optionPremium * v.shares;
    const stockCost = v.stockPrice * v.shares;
    const expirationPrice = v.expirationPrice ?? v.strikePrice;
    
    // If stock price > strike, stock is called away at strike
    const salePrice = Math.min(expirationPrice, v.strikePrice);
    const capitalGain = (salePrice - v.stockPrice) * v.shares;
    const totalReturn = premiumIncome + capitalGain;
    const returnPercent = (totalReturn / stockCost) * 100;
    
    // Max profit occurs when stock is at or above strike (called away)
    const maxProfit = premiumIncome + (v.strikePrice - v.stockPrice) * v.shares;
    const maxProfitPrice = v.strikePrice;
    
    // Breakeven = Stock Price - Premium
    const breakevenPrice = v.stockPrice - v.optionPremium;
    
    const interpretation = `Premium income: $${premiumIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Capital gain: $${capitalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Total return: $${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${returnPercent.toFixed(2)}% return). Maximum profit: $${maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} when stock is at or above strike price $${v.strikePrice.toFixed(2)}. Breakeven price: $${breakevenPrice.toFixed(2)}. If stock falls below breakeven, the strategy loses money.`;
    setResult({ premiumIncome, capitalGain, totalReturn, returnPercent, maxProfit, maxProfitPrice, breakevenPrice, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Covered Call Return Analyzer</CardTitle>
          <CardDescription>Analyze returns from covered call strategies by calculating income, capital gains, and total return from selling calls against stock positions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('stockPrice', 'Stock Price ($)', 'e.g., 50.00', '$')}
              {numInput('strikePrice', 'Strike Price ($)', 'e.g., 52.00', '$')}
              {numInput('optionPremium', 'Call Premium ($ per share)', 'e.g., 1.50', '$')}
              {numInput('shares', 'Number of Shares', 'e.g., 100')}
              {numInput('expirationPrice', 'Stock Price at Expiration ($, optional)', 'e.g., 53.00', '$')}
              <Button type="submit" className="w-full md:w-auto">Analyze</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Covered call return analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Premium Income</div><div className="text-xl font-semibold text-green-600">${result.premiumIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Capital Gain</div><div className={`text-xl font-medium ${result.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.capitalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Total Return</div><div className={`text-2xl font-semibold ${result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Return %</div><div className={`text-xl font-medium ${result.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.returnPercent.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Max Profit</div><div className="text-lg font-medium text-green-600">${result.maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Profit Price</div><div className="text-lg font-medium">${result.maxProfitPrice.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Breakeven Price</div><div className="text-lg font-medium">${result.breakevenPrice.toFixed(2)}</div></div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-breakeven-price-calculator" className="text-primary hover:underline">Option Breakeven Price</a></h4><p className="text-sm text-muted-foreground">Profit thresholds.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-time-decay-simulator" className="text-primary hover:underline">Option Time Decay</a></h4><p className="text-sm text-muted-foreground">Theta impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-checker" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Option pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding covered call strategies and returns</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Covered call strategy involves owning stock and selling call options against it. Premium income is collected upfront, but upside is limited to the strike price.</li>
            <li>Total Return = Premium Income + Capital Gain. Premium income is fixed (premium × shares), while capital gain depends on stock price at expiration.</li>
            <li>Maximum profit occurs when stock is at or above strike price at expiration. Stock is called away at strike, and premium is kept. Max Profit = Premium + (Strike - Stock Price) × Shares.</li>
            <li>Breakeven = Stock Price - Premium. If stock falls below breakeven, the strategy loses money. Premium provides downside protection.</li>
            <li>Covered calls are best for neutral to slightly bullish outlooks. They generate income but cap upside potential. If stock rises significantly above strike, opportunity cost is incurred.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Covered calls, option strategies, and income generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a covered call?</h4><p className="text-muted-foreground">A covered call is a strategy where you own stock and sell call options against it. You collect premium income but give up upside potential above the strike price.</p></div>
          <div><h4 className="font-semibold mb-2">How does covered call work?</h4><p className="text-muted-foreground">You own stock and sell call options. If stock stays below strike, you keep the premium and stock. If stock rises above strike, stock is called away at strike, and you keep premium plus capital gain up to strike.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for covered calls?</h4><p className="text-muted-foreground">Maximum profit = Premium Income + (Strike Price - Stock Price) × Shares. This occurs when stock is at or above strike at expiration, and stock is called away.</p></div>
          <div><h4 className="font-semibold mb-2">What is the breakeven for covered calls?</h4><p className="text-muted-foreground">Breakeven = Stock Price - Premium. If stock falls below breakeven, the strategy loses money. Premium provides downside protection.</p></div>
          <div><h4 className="font-semibold mb-2">What happens if stock rises above strike?</h4><p className="text-muted-foreground">If stock rises above strike, the call is exercised, and stock is called away at strike price. You keep premium plus capital gain up to strike, but miss additional upside above strike.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks of covered calls?</h4><p className="text-muted-foreground">Risks include unlimited downside if stock falls significantly (premium provides limited protection), opportunity cost if stock rises above strike, and early assignment risk.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use covered calls?</h4><p className="text-muted-foreground">Use covered calls for neutral to slightly bullish outlooks, when you want to generate income, or when you're willing to sell stock at strike price. Avoid if you expect significant upside.</p></div>
          <div><h4 className="font-semibold mb-2">What strike price should I choose?</h4><p className="text-muted-foreground">Choose strike price based on your outlook. Out-of-the-money strikes (higher) provide more upside but lower premium. At-the-money strikes provide balance between income and upside.</p></div>
          <div><h4 className="font-semibold mb-2">Can I buy back the call before expiration?</h4><p className="text-muted-foreground">Yes, you can buy back the call to close the position. If call price has declined (due to time decay or stock decline), you can profit by buying it back cheaper than you sold it.</p></div>
          <div><h4 className="font-semibold mb-2">How do dividends affect covered calls?</h4><p className="text-muted-foreground">Dividends reduce call premiums (call holders don't receive dividends). If dividend is significant, calls may be exercised early to capture dividend, potentially reducing strategy returns.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


