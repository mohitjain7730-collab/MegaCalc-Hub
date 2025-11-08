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
import { Info, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  startValue: z.number().min(0).optional(),
  endValue: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  trades: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseTrades(data: string): { date: Date; value: number }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const trades: { date: Date; value: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;
      const date = new Date(parts[0]);
      const value = parseFloat(parts[1].replace(/[$%,]/g, ''));
      if (isNaN(date.getTime()) || !Number.isFinite(value) || value <= 0) continue;
      trades.push({ date, value });
    }
    return trades.length > 0 ? trades.sort((a, b) => a.date.getTime() - b.date.getTime()) : null;
  } catch {
    return null;
  }
}

function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export default function CAGRFromTradeHistoryCalculator() {
  const [result, setResult] = useState<{
    cagr: number;
    totalReturn: number;
    years: number;
    startValue: number;
    endValue: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startValue: undefined as unknown as number,
      endValue: undefined as unknown as number,
      startDate: '',
      endDate: '',
      trades: '',
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
    let startVal = v.startValue;
    let endVal = v.endValue;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (v.trades && v.trades.trim()) {
      const parsed = parseTrades(v.trades);
      if (parsed && parsed.length > 0) {
        startVal = parsed[0].value;
        endVal = parsed[parsed.length - 1].value;
        startDate = parsed[0].date;
        endDate = parsed[parsed.length - 1].date;
      }
    } else {
      if (v.startDate) startDate = new Date(v.startDate);
      if (v.endDate) endDate = new Date(v.endDate);
    }

    if (startVal == null || endVal == null || startVal <= 0 || endVal <= 0) {
      setResult(null);
      return;
    }

    let years = 1;
    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    }

    if (years <= 0) years = 1;

    const cagr = calculateCAGR(startVal, endVal, years);
    const totalReturn = ((endVal - startVal) / startVal) * 100;
    const interpretation = `CAGR: ${cagr.toFixed(2)}% over ${years.toFixed(2)} years. Total return: ${totalReturn.toFixed(2)}% (from $${startVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to $${endVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). CAGR represents the annualized growth rate assuming compounding.`;
    setResult({ cagr, totalReturn, years, startValue: startVal, endValue: endVal, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> CAGR from Trade History Calculator</CardTitle>
          <CardDescription>Calculate compound annual growth rate (CAGR) from trade history, including returns, dates, and contributions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('startValue', 'Start Value ($)', 'e.g., 10000', '$')}
                {numInput('endValue', 'End Value ($)', 'e.g., 15000', '$')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="trades" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade History (CSV: Date, Portfolio Value) - Optional</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="Date,Portfolio Value\n2020-01-01,10000\n2021-01-01,12000\n2022-01-01,15000" {...field} className="font-mono" />
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
            <CardDescription>CAGR and total return analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">CAGR</div><div className="text-2xl font-semibold">{result.cagr.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Total Return</div><div className="text-xl font-medium">{result.totalReturn.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Time Period</div><div className="text-lg font-medium">{result.years.toFixed(2)} years</div></div>
              <div><div className="text-sm text-muted-foreground">End Value</div><div className="text-lg font-medium">${result.endValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/win-rate-expectancy-calculator" className="text-primary hover:underline">Win Rate & Expectancy</a></h4><p className="text-sm text-muted-foreground">Strategy performance.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/maximum-drawdown-calculator" className="text-primary hover:underline">Maximum Drawdown</a></h4><p className="text-sm text-muted-foreground">Downside risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rolling-return-calculator" className="text-primary hover:underline">Rolling Return</a></h4><p className="text-sm text-muted-foreground">Time-weighted returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tracking-difference-calculator" className="text-primary hover:underline">Tracking Difference</a></h4><p className="text-sm text-muted-foreground">Benchmark comparison.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Calculating CAGR from trade history and portfolio performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>CAGR = ((End Value / Start Value)^(1 / Years)) - 1. CAGR represents the annualized growth rate assuming compounding.</li>
            <li>Enter start value and end value, plus start date and end date (or trade history) to calculate the time period accurately.</li>
            <li>Alternatively, paste trade history with dates and portfolio values. The calculator will use the first and last values.</li>
            <li>CAGR smooths out volatility and provides a single annualized return figure, making it easier to compare performance across different time periods.</li>
            <li>CAGR assumes constant compounding. Actual returns may vary year-to-year, but CAGR provides a useful summary metric for long-term performance.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>CAGR, compound growth, and portfolio performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is CAGR?</h4><p className="text-muted-foreground">CAGR (Compound Annual Growth Rate) is the annualized growth rate of an investment over a period, assuming constant compounding. It smooths out volatility to provide a single return figure.</p></div>
          <div><h4 className="font-semibold mb-2">How is CAGR calculated?</h4><p className="text-muted-foreground">CAGR = ((End Value / Start Value)^(1 / Years)) - 1. It represents the constant annual growth rate that would produce the same final value if applied each year.</p></div>
          <div><h4 className="font-semibold mb-2">Why use CAGR instead of total return?</h4><p className="text-muted-foreground">CAGR annualizes returns, making it easier to compare performance across different time periods. Total return doesn't account for time, so a 50% return over 1 year is very different from 50% over 10 years.</p></div>
          <div><h4 className="font-semibold mb-2">Can CAGR be negative?</h4><p className="text-muted-foreground">Yes. Negative CAGR indicates the investment declined over the period. For example, if $10,000 becomes $8,000 over 2 years, CAGR is negative.</p></div>
          <div><h4 className="font-semibold mb-2">How does CAGR handle contributions and withdrawals?</h4><p className="text-muted-foreground">CAGR based on start and end values includes the effect of contributions and withdrawals. For more accurate analysis, use time-weighted returns or calculate CAGR for each period separately.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good CAGR?</h4><p className="text-muted-foreground">Good CAGR depends on asset class, risk tolerance, and market conditions. Stocks historically return 7-10% CAGR, while bonds return 3-5% CAGR. Higher CAGR often comes with higher volatility.</p></div>
          <div><h4 className="font-semibold mb-2">How does volatility affect CAGR?</h4><p className="text-muted-foreground">CAGR doesn't directly show volatility. Two portfolios with the same CAGR can have very different volatility. Use CAGR alongside metrics like maximum drawdown or standard deviation for complete analysis.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use CAGR to project future returns?</h4><p className="text-muted-foreground">CAGR is based on past performance and doesn't guarantee future returns. Use it as a guide, but remember that past performance doesn't guarantee future results.</p></div>
          <div><h4 className="font-semibold mb-2">How do I calculate CAGR with multiple contributions?</h4><p className="text-muted-foreground">For multiple contributions, use the first and last portfolio values (including contributions) to calculate CAGR. Alternatively, use time-weighted returns or calculate CAGR for each contribution period separately.</p></div>
          <div><h4 className="font-semibold mb-2">What is the difference between CAGR and average return?</h4><p className="text-muted-foreground">CAGR accounts for compounding, while average return is the simple average of annual returns. CAGR is more accurate for long-term growth analysis, as it reflects the effect of compounding.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

