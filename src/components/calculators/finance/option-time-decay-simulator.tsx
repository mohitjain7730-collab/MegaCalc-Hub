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
import { Info, Clock } from 'lucide-react';

const formSchema = z.object({
  optionPrice: z.number().min(0).optional(),
  strikePrice: z.number().min(0).optional(),
  spotPrice: z.number().min(0).optional(),
  timeToExpiration: z.number().min(0).optional(),
  volatility: z.number().min(0).optional(),
  interestRate: z.number().min(0).optional(),
  optionType: z.enum(['call', 'put']),
});

type FormValues = z.infer<typeof formSchema>;

// Simplified theta calculation (approximation)
function calculateTheta(optionPrice: number, timeToExpiration: number, volatility: number): number {
  if (timeToExpiration <= 0) return 0;
  // Theta ≈ -OptionPrice × (Volatility / sqrt(Time)) / (2 × sqrt(2π))
  // This is a simplified approximation
  const theta = -(optionPrice * (volatility / 100) / Math.sqrt(timeToExpiration / 365)) / (2 * Math.sqrt(2 * Math.PI));
  return theta;
}

export default function OptionTimeDecaySimulator() {
  const [result, setResult] = useState<{
    currentTheta: number;
    dailyDecay: number;
    weeklyDecay: number;
    monthlyDecay: number;
    timeDecayTable: { days: number; optionValue: number; decay: number }[];
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      optionPrice: undefined as unknown as number,
      strikePrice: undefined as unknown as number,
      spotPrice: undefined as unknown as number,
      timeToExpiration: undefined as unknown as number,
      volatility: undefined as unknown as number,
      interestRate: undefined as unknown as number,
      optionType: 'call',
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
    if (v.optionPrice == null || v.timeToExpiration == null || v.volatility == null ||
        v.optionPrice <= 0 || v.timeToExpiration <= 0 || v.volatility <= 0) {
      setResult(null);
      return;
    }
    const vol = v.volatility / 100;
    const currentTheta = calculateTheta(v.optionPrice, v.timeToExpiration, v.volatility);
    const dailyDecay = currentTheta;
    const weeklyDecay = currentTheta * 7;
    const monthlyDecay = currentTheta * 30;
    
    // Generate time decay table
    const timeDecayTable: { days: number; optionValue: number; decay: number }[] = [];
    for (let days = 0; days <= Math.min(v.timeToExpiration, 90); days += 7) {
      const remainingDays = Math.max(0, v.timeToExpiration - days);
      if (remainingDays === 0) {
        timeDecayTable.push({ days, optionValue: 0, decay: v.optionPrice });
      } else {
        const thetaAtTime = calculateTheta(v.optionPrice, remainingDays, v.volatility);
        const decay = Math.min(v.optionPrice, Math.abs(thetaAtTime) * days);
        const optionValue = Math.max(0, v.optionPrice - decay);
        timeDecayTable.push({ days, optionValue, decay });
      }
    }
    
    const interpretation = `Current theta: $${currentTheta.toFixed(2)} per day. Daily decay: $${dailyDecay.toFixed(2)}. Weekly decay: $${weeklyDecay.toFixed(2)}. Monthly decay: $${monthlyDecay.toFixed(2)}. Time decay accelerates as expiration approaches, with the highest decay rate occurring in the final days before expiration. Option sellers benefit from time decay, while option buyers lose value as time passes.`;
    setResult({ currentTheta, dailyDecay, weeklyDecay, monthlyDecay, timeDecayTable, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5"/> Option Time Decay (Theta Impact) Simulator</CardTitle>
          <CardDescription>Simulate option time decay (theta) over time to understand how option prices change as expiration approaches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('optionPrice', 'Option Price ($)', 'e.g., 5.00', '$')}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('strikePrice', 'Strike Price ($, optional)', 'e.g., 50.00', '$')}
                {numInput('spotPrice', 'Spot Price ($, optional)', 'e.g., 52.00', '$')}
              </div>
              {numInput('timeToExpiration', 'Time to Expiration (days)', 'e.g., 30')}
              {numInput('volatility', 'Volatility (%, annualized)', 'e.g., 20', '%')}
              {numInput('interestRate', 'Risk-Free Interest Rate (%, optional)', 'e.g., 5', '%')}
              <Button type="submit" className="w-full md:w-auto">Simulate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Time decay analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Current Theta</div><div className="text-xl font-semibold text-red-600">${result.currentTheta.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Daily Decay</div><div className="text-lg font-medium text-red-600">${result.dailyDecay.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Weekly Decay</div><div className="text-lg font-medium text-red-600">${result.weeklyDecay.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Monthly Decay</div><div className="text-lg font-medium text-red-600">${result.monthlyDecay.toFixed(2)}</div></div>
            </div>
            {result.timeDecayTable.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Time Decay Projection</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Days Remaining</th>
                        <th className="text-right p-2">Option Value</th>
                        <th className="text-right p-2">Total Decay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.timeDecayTable.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{row.days}</td>
                          <td className="text-right p-2">${row.optionValue.toFixed(2)}</td>
                          <td className="text-right p-2 text-red-600">${row.decay.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-breakeven-price-calculator" className="text-primary hover:underline">Option Breakeven Price</a></h4><p className="text-sm text-muted-foreground">Profit thresholds.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/covered-call-return-analyzer" className="text-primary hover:underline">Covered Call Return</a></h4><p className="text-sm text-muted-foreground">Strategy analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-checker" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Option pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/options-delta-neutral-portfolio-calculator" className="text-primary hover:underline">Options Delta Neutral</a></h4><p className="text-sm text-muted-foreground">Delta hedging.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding option time decay (theta) and its impact</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Theta measures the rate of decline in option price due to time decay. Theta is negative for option buyers (time decay reduces value) and positive for option sellers (time decay generates income).</li>
            <li>Time decay accelerates as expiration approaches. At-the-money options have the highest theta, while deep in-the-money or deep out-of-the-money options have lower theta.</li>
            <li>Theta is highest in the final days and weeks before expiration. Option prices decay fastest when time to expiration is short, making time decay a major risk for option buyers.</li>
            <li>Option sellers benefit from theta decay, as they collect premium that erodes over time. However, sellers face unlimited risk (calls) or large risk (puts) if the underlying moves against them.</li>
            <li>Factors affecting theta include time to expiration, volatility, moneyness (strike vs spot), and interest rates. Theta is typically highest for at-the-money options with short time to expiration.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Option time decay, theta, and expiration risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is theta?</h4><p className="text-muted-foreground">Theta is a Greek that measures the rate of decline in option price due to time decay. Theta is typically negative for option buyers (time reduces value) and represents daily decay.</p></div>
          <div><h4 className="font-semibold mb-2">How does time decay affect option prices?</h4><p className="text-muted-foreground">Time decay reduces option prices as expiration approaches. All else equal, options lose value each day due to time decay, with decay accelerating as expiration nears.</p></div>
          <div><h4 className="font-semibold mb-2">Why does time decay accelerate near expiration?</h4><p className="text-muted-foreground">Time decay accelerates near expiration because there's less time for the underlying to move favorably. Theta is highest for at-the-money options in the final days before expiration.</p></div>
          <div><h4 className="font-semibold mb-2">Which options have the highest theta?</h4><p className="text-muted-foreground">At-the-money options have the highest theta, as they have the most time value to decay. Deep in-the-money or deep out-of-the-money options have lower theta.</p></div>
          <div><h4 className="font-semibold mb-2">Do call and put options have the same theta?</h4><p className="text-muted-foreground">For at-the-money options with the same strike and expiration, call and put options have similar theta. However, theta can differ due to interest rates, dividends, and moneyness.</p></div>
          <div><h4 className="font-semibold mb-2">How can I benefit from time decay?</h4><p className="text-muted-foreground">Option sellers benefit from time decay by collecting premium that erodes over time. Strategies like covered calls, cash-secured puts, and credit spreads profit from theta decay.</p></div>
          <div><h4 className="font-semibold mb-2">How can I minimize time decay risk?</h4><p className="text-muted-foreground">Option buyers can minimize time decay risk by buying options with longer time to expiration, avoiding short-dated options, or using strategies that benefit from time decay (selling options).</p></div>
          <div><h4 className="font-semibold mb-2">What is theta decay for weekly options?</h4><p className="text-muted-foreground">Weekly options have very high theta decay, especially in the final days. Time decay can be 30-50% or more in the final week, making them risky for buyers but profitable for sellers.</p></div>
          <div><h4 className="font-semibold mb-2">How does volatility affect theta?</h4><p className="text-muted-foreground">Higher volatility increases option prices (more time value), which increases theta. However, volatility also affects other Greeks (delta, gamma), so the relationship is complex.</p></div>
          <div><h4 className="font-semibold mb-2">Should I avoid buying options close to expiration?</h4><p className="text-muted-foreground">Buying options close to expiration is risky due to high theta decay. Options can lose significant value even if the underlying moves favorably, making it difficult to profit from short-dated options.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


