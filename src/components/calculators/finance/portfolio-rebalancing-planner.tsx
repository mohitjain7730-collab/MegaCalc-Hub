'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, RotateCcw } from 'lucide-react';

const formSchema = z.object({
  positions: z.string().min(1, 'Enter positions data'),
  portfolioValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parsePositions(data: string): { name: string; currentWeight: number; targetWeight: number }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const positions: { name: string; currentWeight: number; targetWeight: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;
      const current = parseFloat(parts[1].replace('%', ''));
      const target = parseFloat(parts[2].replace('%', ''));
      if (!Number.isFinite(current) || !Number.isFinite(target)) continue;
      positions.push({
        name: parts[0],
        currentWeight: Math.abs(current) > 1 ? current / 100 : current,
        targetWeight: Math.abs(target) > 1 ? target / 100 : target
      });
    }
    return positions.length > 0 ? positions : null;
  } catch {
    return null;
  }
}

export default function PortfolioRebalancingPlanner() {
  const [result, setResult] = useState<{
    rebalancing: { name: string; currentWeight: number; targetWeight: number; drift: number; tradeAmount: number; tradePercent: number }[];
    totalDrift: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positions: '',
      portfolioValue: undefined as unknown as number,
    }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parsePositions(v.positions);
    if (!parsed || parsed.length === 0) {
      setResult(null);
      return;
    }
    const portfolioVal = v.portfolioValue || 100000;
    const rebalancing = parsed.map(pos => {
      const drift = pos.currentWeight - pos.targetWeight;
      const tradeAmount = drift * portfolioVal;
      const tradePercent = drift * 100;
      return { ...pos, drift, tradeAmount, tradePercent };
    });
    const totalDrift = rebalancing.reduce((sum, r) => sum + Math.abs(r.drift), 0);
    const maxDrift = rebalancing.reduce((max, r) => Math.abs(r.drift) > Math.abs(max.drift) ? r : max, rebalancing[0]);
    const interpretation = `Total absolute drift: ${(totalDrift * 100).toFixed(1)}%. Largest drift: ${maxDrift.name} (${maxDrift.drift > 0 ? '+' : ''}${(maxDrift.drift * 100).toFixed(1)}%). ${totalDrift > 0.1 ? 'Rebalancing recommended to restore target allocations.' : 'Portfolio is well-aligned with targets.'}`;
    setResult({ rebalancing, totalDrift, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5"/> Portfolio Rebalancing Planner</CardTitle>
          <CardDescription>Plan portfolio rebalancing by calculating target allocations, current drift, and required trades to restore target weights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="positions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Positions (CSV: Name, Current Weight%, Target Weight%)</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Name,Current%,Target%\nStock A,35,30\nStock B,25,30\nStock C,40,40" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="portfolioValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Value ($, optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100000"
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Rebalancing trades and drift analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Position</th>
                    <th className="text-right p-2">Current</th>
                    <th className="text-right p-2">Target</th>
                    <th className="text-right p-2">Drift</th>
                    {form.getValues('portfolioValue') && <th className="text-right p-2">Trade ($)</th>}
                  </tr>
                </thead>
                <tbody>
                  {result.rebalancing.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="text-right p-2">{(r.currentWeight * 100).toFixed(1)}%</td>
                      <td className="text-right p-2">{(r.targetWeight * 100).toFixed(1)}%</td>
                      <td className={`text-right p-2 ${Math.abs(r.drift) > 0.05 ? 'font-semibold' : ''} ${r.drift > 0 ? 'text-red-600' : r.drift < 0 ? 'text-green-600' : ''}`}>
                        {r.drift > 0 ? '+' : ''}{(r.drift * 100).toFixed(1)}%
                      </td>
                      {form.getValues('portfolioValue') && (
                        <td className={`text-right p-2 ${r.tradeAmount > 0 ? 'text-red-600' : r.tradeAmount < 0 ? 'text-green-600' : ''}`}>
                          {r.tradeAmount > 0 ? '+' : ''}${r.tradeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-md border p-3 bg-muted/50">
              <div className="text-sm font-semibold mb-1">Total Absolute Drift</div>
              <div className="text-2xl font-bold">{(result.totalDrift * 100).toFixed(1)}%</div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sector-exposure-calculator" className="text-primary hover:underline">Sector Exposure</a></h4><p className="text-sm text-muted-foreground">Sector allocation analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/style-drift-analyzer" className="text-primary hover:underline">Style Drift Analyzer</a></h4><p className="text-sm text-muted-foreground">Factor exposure tracking.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean-Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</a></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Planning portfolio rebalancing to maintain target allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Enter positions with current weight% and target weight%. Weights can be percentages (30) or decimals (0.30).</li>
            <li>Drift = Current Weight - Target Weight. Positive drift means overweight (sell), negative means underweight (buy).</li>
            <li>Rebalance when drift exceeds tolerance bands (e.g., ±5% or ±10% depending on policy). Large drifts increase tracking error and risk.</li>
            <li>Consider transaction costs and taxes when rebalancing. Rebalance only when drift justifies the costs, or use threshold-based rebalancing.</li>
            <li>Rebalance periodically (quarterly, semi-annually) or use threshold-based rebalancing (rebalance when drift exceeds bands).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Portfolio rebalancing, drift management, and allocation maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is portfolio rebalancing?</h4><p className="text-muted-foreground">Rebalancing is the process of adjusting portfolio allocations back to target weights by buying underweight positions and selling overweight positions.</p></div>
          <div><h4 className="font-semibold mb-2">Why does drift occur?</h4><p className="text-muted-foreground">Drift occurs when different assets appreciate or depreciate at different rates, causing weights to shift away from targets even without new contributions or withdrawals.</p></div>
          <div><h4 className="font-semibold mb-2">When should I rebalance?</h4><p className="text-muted-foreground">Rebalance when drift exceeds tolerance bands (e.g., ±5% or ±10%), periodically (quarterly/annually), or when portfolio composition changes significantly.</p></div>
          <div><h4 className="font-semibold mb-2">What are rebalancing costs?</h4><p className="text-muted-foreground">Rebalancing costs include transaction fees, bid-ask spreads, taxes on realized gains, and opportunity costs. Consider these when deciding rebalancing frequency.</p></div>
          <div><h4 className="font-semibold mb-2">Should I rebalance exactly to targets?</h4><p className="text-muted-foreground">Not always. Consider tolerance bands to reduce transaction costs. Rebalance to targets only when drift exceeds bands, or use threshold-based rebalancing.</p></div>
          <div><h4 className="font-semibold mb-2">How do I handle taxes when rebalancing?</h4><p className="text-muted-foreground">In taxable accounts, rebalancing creates realized gains. Use tax-loss harvesting, rebalance in tax-advantaged accounts first, or use new contributions to adjust allocations.</p></div>
          <div><h4 className="font-semibold mb-2">What is threshold-based rebalancing?</h4><p className="text-muted-foreground">Rebalance only when drift exceeds predefined thresholds (e.g., ±5% or ±10%), reducing transaction costs while maintaining reasonable alignment with targets.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use new contributions to rebalance?</h4><p className="text-muted-foreground">Yes. Direct new contributions to underweight positions to rebalance without selling, avoiding transaction costs and taxes in taxable accounts.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I check for rebalancing?</h4><p className="text-muted-foreground">Check monthly or quarterly. Rebalance when drift exceeds thresholds or periodically (quarterly/annually), depending on your policy and transaction cost considerations.</p></div>
          <div><h4 className="font-semibold mb-2">What if I cannot rebalance due to constraints?</h4><p className="text-muted-foreground">If transaction costs or taxes are prohibitive, accept some drift or use new contributions to gradually restore targets. Update target allocations if constraints are permanent.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


