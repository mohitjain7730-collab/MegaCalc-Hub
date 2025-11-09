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
import { Info, Target } from 'lucide-react';

const formSchema = z.object({
  strikePrice: z.number().min(0).optional(),
  optionPremium: z.number().min(0).optional(),
  optionType: z.enum(['call', 'put']),
  contracts: z.number().min(1).optional(),
  contractSize: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OptionBreakevenPriceCalculator() {
  const [result, setResult] = useState<{
    breakevenPrice: number;
    totalPremium: number;
    maxProfit: number;
    maxLoss: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strikePrice: undefined as unknown as number,
      optionPremium: undefined as unknown as number,
      optionType: 'call',
      contracts: undefined as unknown as number,
      contractSize: undefined as unknown as number,
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
                if (name === 'contracts' || name === 'contractSize') {
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
    if (v.strikePrice == null || v.optionPremium == null || v.strikePrice <= 0 || v.optionPremium <= 0) {
      setResult(null);
      return;
    }
    const contracts = v.contracts ?? 1;
    const contractSize = v.contractSize ?? 100;
    const totalPremium = v.optionPremium * contracts * contractSize;
    
    let breakevenPrice: number;
    let maxProfit: number;
    let maxLoss: number;
    
    if (v.optionType === 'call') {
      // Call breakeven = Strike + Premium
      breakevenPrice = v.strikePrice + v.optionPremium;
      // Max profit is unlimited (theoretically)
      maxProfit = Infinity;
      // Max loss is premium paid
      maxLoss = totalPremium;
    } else {
      // Put breakeven = Strike - Premium
      breakevenPrice = v.strikePrice - v.optionPremium;
      // Max profit = Strike - Premium (if underlying goes to zero)
      maxProfit = (v.strikePrice - v.optionPremium) * contracts * contractSize;
      // Max loss is premium paid
      maxLoss = totalPremium;
    }
    
    const interpretation = `Breakeven price: $${breakevenPrice.toFixed(2)}. At expiration, the ${v.optionType} option will be profitable if the underlying price is ${v.optionType === 'call' ? 'above' : 'below'} $${breakevenPrice.toFixed(2)}. Total premium ${v.optionType === 'call' ? 'paid' : 'paid'}: $${totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Maximum loss: $${maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (premium paid). ${v.optionType === 'call' ? 'Maximum profit is unlimited if underlying price rises significantly.' : `Maximum profit: $${maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} if underlying price falls to zero.`}`;
    setResult({ breakevenPrice, totalPremium, maxProfit: isFinite(maxProfit) ? maxProfit : 0, maxLoss, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/> Option Breakeven Price Calculator</CardTitle>
          <CardDescription>Calculate breakeven price for call and put options to determine the underlying price needed to profit at expiration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('strikePrice', 'Strike Price ($)', 'e.g., 50.00', '$')}
                <FormField control={form.control} name="optionType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="put">Put</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              {numInput('optionPremium', 'Option Premium ($)', 'e.g., 2.50', '$')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('contracts', 'Number of Contracts (optional, default: 1)', 'e.g., 1')}
                {numInput('contractSize', 'Contract Size (shares per contract, optional, default: 100)', 'e.g., 100')}
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
            <CardDescription>Breakeven analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Breakeven Price</div><div className="text-2xl font-semibold">${result.breakevenPrice.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Total Premium</div><div className="text-xl font-medium">${result.totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Profit</div><div className="text-xl font-medium text-green-600">{result.maxProfit === 0 ? 'Unlimited' : `$${result.maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div></div>
              <div><div className="text-sm text-muted-foreground">Max Loss</div><div className="text-xl font-medium text-red-600">${result.maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Options analysis and strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-time-decay-simulator" className="text-primary hover:underline">Option Time Decay</a></h4><p className="text-sm text-muted-foreground">Theta impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/covered-call-return-analyzer" className="text-primary hover:underline">Covered Call Return</a></h4><p className="text-sm text-muted-foreground">Strategy analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-checker" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Option pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding option breakeven prices and profit/loss</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Call Breakeven = Strike Price + Premium Paid. The underlying must rise above this price for the call option to be profitable at expiration.</li>
            <li>Put Breakeven = Strike Price - Premium Paid. The underlying must fall below this price for the put option to be profitable at expiration.</li>
            <li>At breakeven, the option's intrinsic value equals the premium paid, resulting in zero profit or loss (excluding transaction costs).</li>
            <li>For call options, maximum loss is limited to premium paid, while maximum profit is theoretically unlimited if underlying price rises significantly.</li>
            <li>For put options, maximum loss is limited to premium paid, while maximum profit is limited to Strike - Premium (if underlying falls to zero).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Option breakeven prices, profit/loss, and expiration analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is option breakeven price?</h4><p className="text-muted-foreground">Option breakeven price is the underlying price at expiration where the option position has zero profit or loss. For calls: Strike + Premium. For puts: Strike - Premium.</p></div>
          <div><h4 className="font-semibold mb-2">How is call option breakeven calculated?</h4><p className="text-muted-foreground">Call Breakeven = Strike Price + Premium Paid. The underlying must rise above this price for the call to be profitable at expiration.</p></div>
          <div><h4 className="font-semibold mb-2">How is put option breakeven calculated?</h4><p className="text-muted-foreground">Put Breakeven = Strike Price - Premium Paid. The underlying must fall below this price for the put to be profitable at expiration.</p></div>
          <div><h4 className="font-semibold mb-2">What happens if underlying price equals breakeven?</h4><p className="text-muted-foreground">If underlying price equals breakeven at expiration, the option has zero profit or loss (excluding transaction costs). The option's intrinsic value equals the premium paid.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum loss for option buyers?</h4><p className="text-muted-foreground">Maximum loss for option buyers is limited to the premium paid. Options cannot have negative value, so losses are capped at the premium paid.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for call options?</h4><p className="text-muted-foreground">Maximum profit for call options is theoretically unlimited if the underlying price rises significantly. There's no upper limit to how high the underlying can go.</p></div>
          <div><h4 className="font-semibold mb-2">What is the maximum profit for put options?</h4><p className="text-muted-foreground">Maximum profit for put options is limited to Strike Price - Premium Paid (if underlying falls to zero). The underlying cannot go below zero, capping maximum profit.</p></div>
          <div><h4 className="font-semibold mb-2">Does breakeven change before expiration?</h4><p className="text-muted-foreground">Breakeven at expiration is fixed (Strike ± Premium). However, before expiration, option prices include time value, so the underlying price needed to profit may differ from expiration breakeven.</p></div>
          <div><h4 className="font-semibold mb-2">How do transaction costs affect breakeven?</h4><p className="text-muted-foreground">Transaction costs (commissions, spreads) increase the effective breakeven. For calls: Strike + Premium + Costs. For puts: Strike - Premium - Costs. Include costs for accurate breakeven analysis.</p></div>
          <div><h4 className="font-semibold mb-2">Should I exercise options at breakeven?</h4><p className="text-muted-foreground">At breakeven, options have zero intrinsic value, so exercising typically results in a loss after transaction costs. It's usually better to let options expire or close the position before expiration.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


