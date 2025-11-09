'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, DollarSign } from 'lucide-react';

const formSchema = z.object({
  buyPrice: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  buyCost: z.number().min(0).optional(),
  sellCost: z.number().min(0).optional(),
  holdingCost: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ArbitrageProfitCalculator() {
  const [result, setResult] = useState<{
    priceDifference: number;
    grossProfit: number;
    totalCosts: number;
    netProfit: number;
    profitPercent: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyPrice: undefined as unknown as number,
      sellPrice: undefined as unknown as number,
      quantity: undefined as unknown as number,
      buyCost: undefined as unknown as number,
      sellCost: undefined as unknown as number,
      holdingCost: undefined as unknown as number,
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
    if (v.buyPrice == null || v.sellPrice == null || v.quantity == null ||
        v.buyPrice <= 0 || v.sellPrice <= 0 || v.quantity <= 0) {
      setResult(null);
      return;
    }
    const priceDifference = v.sellPrice - v.buyPrice;
    const grossProfit = priceDifference * v.quantity;
    const buyCost = v.buyCost ?? 0;
    const sellCost = v.sellCost ?? 0;
    const holdingCost = v.holdingCost ?? 0;
    const totalCosts = buyCost + sellCost + holdingCost;
    const netProfit = grossProfit - totalCosts;
    const profitPercent = (netProfit / (v.buyPrice * v.quantity + totalCosts)) * 100;
    
    const interpretation = `Price difference: $${priceDifference.toFixed(2)} per unit. Gross profit: $${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Total costs: $${totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Net profit: $${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${profitPercent.toFixed(2)}% return). ${netProfit > 0 ? 'Arbitrage opportunity is profitable after costs.' : 'Arbitrage opportunity is not profitable after costs. Consider reducing costs or finding better price differences.'}`;
    setResult({ priceDifference, grossProfit, totalCosts, netProfit, profitPercent, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Arbitrage Profit Calculator</CardTitle>
          <CardDescription>Calculate arbitrage profit from price differences between markets, assets, or instruments to identify trading opportunities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('buyPrice', 'Buy Price ($)', 'e.g., 50.00', '$')}
                {numInput('sellPrice', 'Sell Price ($)', 'e.g., 50.50', '$')}
              </div>
              {numInput('quantity', 'Quantity (units)', 'e.g., 1000')}
              {numInput('buyCost', 'Buy Transaction Cost ($, optional)', 'e.g., 10', '$')}
              {numInput('sellCost', 'Sell Transaction Cost ($, optional)', 'e.g., 10', '$')}
              {numInput('holdingCost', 'Holding Cost ($, optional)', 'e.g., 5', '$')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Arbitrage profit analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Price Difference</div><div className={`text-xl font-semibold ${result.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.priceDifference.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Gross Profit</div><div className={`text-xl font-medium ${result.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Total Costs</div><div className="text-lg font-medium">${result.totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Net Profit</div><div className={`text-2xl font-semibold ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Profit %</div><div className={`text-xl font-medium ${result.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.profitPercent.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Trading opportunities and risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/basis-risk-calculator" className="text-primary hover:underline">Basis Risk</a></h4><p className="text-sm text-muted-foreground">Price convergence.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-hedge-ratio-calculator" className="text-primary hover:underline">Futures Hedge Ratio</a></h4><p className="text-sm text-muted-foreground">Hedging strategies.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/options-delta-neutral-portfolio-calculator" className="text-primary hover:underline">Options Delta Neutral</a></h4><p className="text-sm text-muted-foreground">Delta hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Identifying and calculating arbitrage opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Arbitrage is the simultaneous purchase and sale of the same or similar asset in different markets to profit from price differences, with minimal risk.</li>
            <li>Arbitrage Profit = (Sell Price - Buy Price) × Quantity - Total Costs. Costs include transaction costs, holding costs, financing costs, and any other expenses.</li>
            <li>Arbitrage opportunities exist when price differences exceed total costs. Efficient markets quickly eliminate arbitrage opportunities through price convergence.</li>
            <li>Types of arbitrage include spatial (different locations), temporal (different times), statistical (related assets), and triangular (three-way exchanges).</li>
            <li>Risks include execution risk (prices change before execution), counterparty risk, liquidity risk, and regulatory risk. True arbitrage should be risk-free.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Arbitrage, price differences, and risk-free trading opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is arbitrage?</h4><p className="text-muted-foreground">Arbitrage is the simultaneous purchase and sale of the same or similar asset in different markets to profit from price differences, with minimal or no risk. It exploits market inefficiencies.</p></div>
          <div><h4 className="font-semibold mb-2">How is arbitrage profit calculated?</h4><p className="text-muted-foreground">Arbitrage Profit = (Sell Price - Buy Price) × Quantity - Total Costs. Costs include transaction costs, holding costs, financing costs, and any other expenses.</p></div>
          <div><h4 className="font-semibold mb-2">Is arbitrage risk-free?</h4><p className="text-muted-foreground">True arbitrage should be risk-free, but in practice, risks include execution risk (prices change before execution), counterparty risk, liquidity risk, and regulatory risk. Pure arbitrage is rare.</p></div>
          <div><h4 className="font-semibold mb-2">What are the types of arbitrage?</h4><p className="text-muted-foreground">Types include spatial arbitrage (different locations), temporal arbitrage (different times), statistical arbitrage (related assets), triangular arbitrage (three-way exchanges), and merger arbitrage.</p></div>
          <div><h4 className="font-semibold mb-2">Why do arbitrage opportunities exist?</h4><p className="text-muted-foreground">Arbitrage opportunities exist due to market inefficiencies, information asymmetry, transaction costs, liquidity differences, or temporary supply/demand imbalances. Efficient markets quickly eliminate opportunities.</p></div>
          <div><h4 className="font-semibold mb-2">How quickly do arbitrage opportunities disappear?</h4><p className="text-muted-foreground">In efficient markets, arbitrage opportunities disappear quickly (seconds to minutes) as traders exploit them, causing prices to converge. Less liquid markets may have longer-lasting opportunities.</p></div>
          <div><h4 className="font-semibold mb-2">What costs should I include in arbitrage calculations?</h4><p className="text-muted-foreground">Include transaction costs (commissions, spreads), holding costs (storage, insurance), financing costs (interest), currency conversion costs, and any other expenses that reduce profit.</p></div>
          <div><h4 className="font-semibold mb-2">Can I arbitrage between different assets?</h4><p className="text-muted-foreground">Yes, but this is statistical arbitrage (not pure arbitrage) and involves risk. Examples include pairs trading, index arbitrage, and convertible arbitrage. Risk is higher than pure arbitrage.</p></div>
          <div><h4 className="font-semibold mb-2">What is triangular arbitrage?</h4><p className="text-muted-foreground">Triangular arbitrage exploits price differences between three currencies or assets. For example, if A/B, B/C, and C/A exchange rates don't align, profit can be made by trading through all three pairs.</p></div>
          <div><h4 className="font-semibold mb-2">How do I find arbitrage opportunities?</h4><p className="text-muted-foreground">Monitor price differences across markets, use automated systems to detect opportunities, focus on less liquid markets, and consider transaction costs. Real-time data and fast execution are essential.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

