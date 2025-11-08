'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  returns: z.string().min(1, 'Enter return series'),
  confidenceLevel: z.enum(['90', '95', '99']),
  portfolioValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseReturns(s: string): number[] | null {
  try {
    const parts = s.replace(/\n/g, ',').split(',').map(x => x.trim()).filter(Boolean);
    const arr = parts.map(p => {
      let v = parseFloat(p.replace('%', ''));
      if (!Number.isFinite(v)) throw new Error('bad');
      if (Math.abs(v) > 2) v = v / 100;
      return v;
    });
    return arr.length >= 10 ? arr : null;
  } catch {
    return null;
  }
}

export default function ExpectedShortfallCalculator() {
  const [result, setResult] = useState<{
    var: number;
    expectedShortfall: number;
    varDollar: number;
    esDollar: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returns: '',
      confidenceLevel: '95',
      portfolioValue: undefined as unknown as number,
    }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parseReturns(v.returns);
    if (!parsed || parsed.length < 10) {
      setResult(null);
      return;
    }
    const sorted = [...parsed].sort((a, b) => a - b);
    const conf = parseFloat(v.confidenceLevel) / 100;
    const tailIndex = Math.floor((1 - conf) * sorted.length);
    const tailReturns = sorted.slice(0, tailIndex);
    if (tailReturns.length === 0) {
      setResult(null);
      return;
    }
    const varValue = sorted[tailIndex] || sorted[0];
    const expectedShortfall = tailReturns.reduce((s, r) => s + r, 0) / tailReturns.length;
    const portfolioVal = v.portfolioValue || 100000;
    const varDollar = Math.abs(varValue * portfolioVal);
    const esDollar = Math.abs(expectedShortfall * portfolioVal);
    const interpretation = `At ${v.confidenceLevel}% confidence, VaR is ${(varValue * 100).toFixed(2)}% (${varDollar.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}), and Expected Shortfall is ${(expectedShortfall * 100).toFixed(2)}% (${esDollar.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}). ES represents the average loss in the worst ${(1 - conf) * 100}% of scenarios, providing a more conservative tail risk measure than VaR.`;
    setResult({ var: varValue * 100, expectedShortfall: expectedShortfall * 100, varDollar, esDollar, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Expected Shortfall (Tail Risk) Calculator</CardTitle>
          <CardDescription>Calculate expected shortfall (CVaR) to measure tail risk and potential losses beyond VaR at a given confidence level.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="returns" render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Series (comma or newline separated)</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="0.8%,1.0%,-0.4%,-2.1%,0.3%..." {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="confidenceLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence Level</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
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
            <CardDescription>Tail risk metrics: VaR and Expected Shortfall</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">VaR</div><div className="text-xl font-semibold">{result.var.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Expected Shortfall</div><div className="text-xl font-semibold text-red-600">{result.expectedShortfall.toFixed(2)}%</div></div>
              {form.getValues('portfolioValue') && (
                <>
                  <div><div className="text-sm text-muted-foreground">VaR ($)</div><div className="text-xl font-semibold">${result.varDollar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                  <div><div className="text-sm text-muted-foreground">ES ($)</div><div className="text-xl font-semibold text-red-600">${result.esDollar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                </>
              )}
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk (VaR)</a></h4><p className="text-sm text-muted-foreground">Tail risk threshold.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</a></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding Expected Shortfall and tail risk measurement</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Expected Shortfall (ES), also known as Conditional Value at Risk (CVaR), measures the average loss in the worst tail scenarios beyond VaR.</li>
            <li>ES is more conservative than VaR because it considers the severity of losses in extreme scenarios, not just the threshold.</li>
            <li>Paste a series of periodic returns (daily, weekly, or monthly). More observations (100+) provide more stable tail estimates.</li>
            <li>Confidence levels (90%, 95%, 99%) determine the tail threshold. Higher confidence focuses on more extreme scenarios.</li>
            <li>Use ES alongside VaR for comprehensive tail risk assessment. ES addresses VaR's limitation of not capturing loss severity beyond the threshold.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Expected Shortfall, tail risk, and CVaR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Expected Shortfall (ES)?</h4><p className="text-muted-foreground">Expected Shortfall, also called Conditional Value at Risk (CVaR), is the average loss in the worst tail scenarios beyond the VaR threshold, providing a more comprehensive tail risk measure.</p></div>
          <div><h4 className="font-semibold mb-2">How does ES differ from VaR?</h4><p className="text-muted-foreground">VaR gives the threshold loss at a confidence level. ES gives the average loss beyond that threshold, capturing loss severity in extreme scenarios that VaR ignores.</p></div>
          <div><h4 className="font-semibold mb-2">Why is ES considered more conservative?</h4><p className="text-muted-foreground">ES is always greater than or equal to VaR because it averages losses in the worst tail, while VaR is just a threshold. ES provides a more complete picture of tail risk.</p></div>
          <div><h4 className="font-semibold mb-2">What confidence level should I use?</h4><p className="text-muted-foreground">Common choices are 95% or 99%. Higher confidence (99%) focuses on more extreme scenarios but requires more data for stable estimates. Choose based on your risk tolerance and regulatory requirements.</p></div>
          <div><h4 className="font-semibold mb-2">How many data points do I need?</h4><p className="text-muted-foreground">More is better. At least 100 observations for 95% confidence, 200+ for 99%. With fewer observations, tail estimates can be unstable and unreliable.</p></div>
          <div><h4 className="font-semibold mb-2">Can ES be negative?</h4><p className="text-muted-foreground">Yes. If returns are positive in tail scenarios, ES can be negative (representing gains). Typically, ES is negative (losses) for most portfolios.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret ES in dollar terms?</h4><p className="text-muted-foreground">Multiply ES percentage by portfolio value. For example, ES of -5% on a $100,000 portfolio means average loss of $5,000 in worst tail scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">Is ES sub-additive?</h4><p className="text-muted-foreground">Yes. ES satisfies sub-additivity, meaning portfolio ES is less than or equal to sum of individual asset ES. This makes ES a coherent risk measure, unlike VaR.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate ES?</h4><p className="text-muted-foreground">Recalculate regularly (daily, weekly, or monthly) depending on your risk monitoring frequency. Update when portfolio composition changes or market conditions shift significantly.</p></div>
          <div><h4 className="font-semibold mb-2">What are limitations of ES?</h4><p className="text-muted-foreground">ES relies on historical data and assumes future tail behavior mirrors the past. It doesn't predict black swan events. Use alongside stress testing and scenario analysis for comprehensive risk management.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


