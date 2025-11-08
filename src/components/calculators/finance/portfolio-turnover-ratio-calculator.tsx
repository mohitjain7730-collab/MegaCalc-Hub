'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, RefreshCw } from 'lucide-react';

const formSchema = z.object({
  totalPurchases: z.number().min(0).optional(),
  totalSales: z.number().min(0).optional(),
  averagePortfolioValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioTurnoverRatioCalculator() {
  const [result, setResult] = useState<{
    turnoverRatio: number;
    interpretation: string;
    efficiency: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalPurchases: undefined as unknown as number,
      totalSales: undefined as unknown as number,
      averagePortfolioValue: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
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
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.totalPurchases == null || v.totalSales == null || v.averagePortfolioValue == null || v.averagePortfolioValue === 0) {
      setResult(null);
      return;
    }
    const turnover = (Math.min(v.totalPurchases, v.totalSales) / v.averagePortfolioValue) * 100;
    let efficiency = '';
    if (turnover < 20) efficiency = 'Very low turnover - passive or buy-and-hold strategy.';
    else if (turnover < 50) efficiency = 'Low turnover - moderate trading activity.';
    else if (turnover < 100) efficiency = 'Moderate turnover - active management.';
    else if (turnover < 200) efficiency = 'High turnover - very active trading.';
    else efficiency = 'Very high turnover - hyperactive trading, high transaction costs.';
    const interpretation = `Portfolio turnover ratio: ${turnover.toFixed(1)}%. ${efficiency} ${turnover > 100 ? 'Consider impact of transaction costs and taxes on net returns.' : 'Monitor transaction costs to ensure they do not erode returns.'}`;
    setResult({ turnoverRatio: turnover, interpretation, efficiency });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5"/> Portfolio Turnover Ratio Calculator</CardTitle>
          <CardDescription>Measure portfolio trading activity by calculating turnover ratio from purchases, sales, and average portfolio value.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('totalPurchases', 'Total Purchases ($)', 'e.g., 50000')}
              {numInput('totalSales', 'Total Sales ($)', 'e.g., 45000')}
              {numInput('averagePortfolioValue', 'Average Portfolio Value ($)', 'e.g., 100000')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Portfolio turnover analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-muted-foreground">Turnover Ratio</div><div className="text-2xl font-semibold">{result.turnoverRatio.toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Trading Efficiency</div><div className="text-lg font-medium">{result.efficiency.split(' - ')[0]}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sector-exposure-calculator" className="text-primary hover:underline">Sector Exposure</a></h4><p className="text-sm text-muted-foreground">Sector allocation analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tracking-difference-calculator" className="text-primary hover:underline">Tracking Difference</a></h4><p className="text-sm text-muted-foreground">Fund vs benchmark.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rolling-return-calculator" className="text-primary hover:underline">Rolling Return</a></h4><p className="text-sm text-muted-foreground">Performance consistency.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding portfolio turnover and trading efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Turnover ratio = (Min(Purchases, Sales) / Average Portfolio Value) × 100. It measures how much of the portfolio is traded annually.</li>
            <li>Lower turnover (&lt;50%) typically indicates lower transaction costs, better tax efficiency, and buy-and-hold strategies.</li>
            <li>Higher turnover (&gt;100%) suggests active trading, which can increase transaction costs, tax liabilities, and reduce net returns.</li>
            <li>Use average portfolio value over the period (e.g., beginning + ending / 2, or monthly average) for accurate calculation.</li>
            <li>Consider both transaction costs and tax implications when evaluating turnover—high turnover may erode returns through fees and realized gains.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Portfolio turnover, trading frequency, and transaction costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is portfolio turnover ratio?</h4><p className="text-muted-foreground">Portfolio turnover ratio measures how much of a portfolio is bought and sold over a period, typically expressed as an annual percentage of average portfolio value.</p></div>
          <div><h4 className="font-semibold mb-2">How is turnover ratio calculated?</h4><p className="text-muted-foreground">Turnover = (Min(Total Purchases, Total Sales) / Average Portfolio Value) × 100. Use the minimum to avoid double-counting round-trip trades.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good turnover ratio?</h4><p className="text-muted-foreground">It depends on strategy. Passive portfolios typically have turnover &lt;20%. Active strategies may have 50–200%. Very high turnover (&gt;200%) may indicate excessive trading.</p></div>
          <div><h4 className="font-semibold mb-2">Why does turnover matter?</h4><p className="text-muted-foreground">Higher turnover increases transaction costs, realized capital gains (taxable), and can reduce net returns. Lower turnover is generally more cost-efficient.</p></div>
          <div><h4 className="font-semibold mb-2">How do I calculate average portfolio value?</h4><p className="text-muted-foreground">Use (Beginning Value + Ending Value) / 2, or average monthly/quarterly values. For more precision, use time-weighted averages.</p></div>
          <div><h4 className="font-semibold mb-2">Does turnover include dividends reinvested?</h4><p className="text-muted-foreground">No. Turnover measures trading of securities, not dividend reinvestment. Dividend reinvestment doesn't increase turnover ratio.</p></div>
          <div><h4 className="font-semibold mb-2">Can turnover be negative?</h4><p className="text-muted-foreground">No. Turnover is always positive or zero. If you only buy or only sell, turnover reflects the smaller of purchases or sales relative to portfolio value.</p></div>
          <div><h4 className="font-semibold mb-2">How does turnover affect taxes?</h4><p className="text-muted-foreground">Higher turnover creates more realized gains (and losses), increasing tax liability in taxable accounts. Consider tax-loss harvesting to offset gains.</p></div>
          <div><h4 className="font-semibold mb-2">Should I minimize turnover?</h4><p className="text-muted-foreground">Not necessarily. Some strategies require active trading. The key is ensuring turnover generates value that exceeds transaction costs and taxes.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I calculate turnover?</h4><p className="text-muted-foreground">Calculate annually for reporting, or quarterly for monitoring. Compare to benchmarks and historical turnover to identify trends.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

