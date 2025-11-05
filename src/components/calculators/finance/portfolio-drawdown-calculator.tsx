'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Activity } from 'lucide-react';

const formSchema = z.object({
  valuesCsv: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(csv:string): number[] {
  return csv.split(/[\n,\s]+/).map(s=>s.trim()).filter(Boolean).map(Number).filter(v=>Number.isFinite(v));
}

function computeDrawdowns(series:number[]) {
  let peak=-Infinity; let maxDD=0; let currentDD=0; const path:{value:number; peak:number; dd:number}[]=[];
  for(const v of series){
    peak=Math.max(peak, v);
    const dd = peak>0? (peak - v)/peak : 0;
    currentDD=dd; maxDD=Math.max(maxDD, dd); path.push({value:v, peak, dd});
  }
  // Simple recovery: last value relative to peak
  const recovery = peak>0? (series[series.length-1]/peak) : 0;
  return { maxDrawdown:maxDD, lastDrawdown: currentDD, recovery, path };
}

export default function PortfolioDrawdownCalculator(){
  const [result,setResult]=useState<null|{ maxDrawdown:number; lastDrawdown:number; recovery:number; path:{value:number; peak:number; dd:number}[] }>(null);

  const form=useForm<FormValues>({ resolver:zodResolver(formSchema), defaultValues:{ valuesCsv: '' } });

  const onSubmit=(v:FormValues)=>{
    const series=parseSeries(v.valuesCsv||''); if(series.length<2){ setResult(null); return; }
    setResult(computeDrawdowns(series));
  };

  const demoSeries = useMemo(()=>['100, 102, 98, 105, 103, 96, 94, 97, 101, 99, 104'].join(''),'');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Portfolio Drawdown Calculator</CardTitle>
          <CardDescription>Compute maximum drawdown and current drawdown from a value or NAV series.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="valuesCsv" render={({field})=>(
                <FormItem>
                  <FormLabel>Portfolio Values (CSV or space/newline‑separated)</FormLabel>
                  <FormControl>
                    <Input placeholder={demoSeries} {...field} />
                  </FormControl>
                  <FormMessage/>
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
            <CardDescription>Interactive inspection of drawdown path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Maximum Drawdown</div><div className="text-2xl font-semibold">{(result.maxDrawdown*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Current Drawdown</div><div className="text-2xl font-semibold">{(result.lastDrawdown*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Recovery vs Peak</div><div className="text-2xl font-semibold">{(result.recovery*100).toFixed(1)}%</div></div>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> Series Walkthrough</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {result.path.map((p,i)=> (
                  <div key={i} className="rounded border p-2">
                    <div className="text-muted-foreground">Step {i+1}</div>
                    <div>Value: {p.value}</div>
                    <div>Peak: {p.peak}</div>
                    <div>DD: {(p.dd*100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk (VaR)</a></h4><p className="text-sm text-muted-foreground">Loss threshold at a confidence level.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/conditional-value-at-risk-calculator" className="text-primary hover:underline">Conditional VaR (CVaR)</a></h4><p className="text-sm text-muted-foreground">Average loss beyond VaR.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/volatility-standard-deviation-calculator" className="text-primary hover:underline">Volatility (Std Dev)</a></h4><p className="text-sm text-muted-foreground">Dispersion of returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/information-ratio-calculator" className="text-primary hover:underline">Information Ratio</a></h4><p className="text-sm text-muted-foreground">Excess return per unit tracking error.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Drawdown measures peak‑to‑trough loss; a key downside risk metric.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Use consistent periodic values (daily/weekly/monthly NAV or equity curve).</li>
            <li>Max drawdown says nothing about duration—consider time to recovery too.</li>
            <li>Pair with volatility and CVaR to capture different risk aspects.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Drawdown methodology and interpretation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is maximum drawdown (MDD)?</h4><p className="text-muted-foreground">The worst peak‑to‑trough decline in the series, expressed as a percentage of the peak.</p></div>
          <div><h4 className="font-semibold mb-2">How is current drawdown different?</h4><p className="text-muted-foreground">It is the drawdown from the latest value to the most recent peak.</p></div>
          <div><h4 className="font-semibold mb-2">Does MDD depend on frequency?</h4><p className="text-muted-foreground">Yes—daily series usually show deeper MDD than monthly because they capture intraperiod volatility.</p></div>
          <div><h4 className="font-semibold mb-2">How to compare two strategies?</h4><p className="text-muted-foreground">Normalize by the same sampling and lookback period; compare both MDD and recovery time.</p></div>
          <div><h4 className="font-semibold mb-2">Can MDD be reduced without lowering return?</h4><p className="text-muted-foreground">Diversification, tactical hedges, and risk parity sizing can reduce drawdowns at similar expected returns.</p></div>
          <div><h4 className="font-semibold mb-2">What about path dependency?</h4><p className="text-muted-foreground">Two series with the same mean/volatility can have very different drawdowns; order of returns matters.</p></div>
          <div><h4 className="font-semibold mb-2">Is there a standard "good" MDD?</h4><p className="text-muted-foreground">It is strategy‑dependent. For example, many balanced portfolios target MDD under 25% historically.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I monitor drawdowns?</h4><p className="text-muted-foreground">Continuously for risk management; at least monthly in reporting.</p></div>
          <div><h4 className="font-semibold mb-2">What's the difference between drawdown and VaR?</h4><p className="text-muted-foreground">VaR is a probabilistic loss threshold; drawdown is realized peak‑to‑trough loss over time.</p></div>
          <div><h4 className="font-semibold mb-2">Do transaction costs affect drawdowns?</h4><p className="text-muted-foreground">Yes, especially for active strategies; costs drag performance and can deepen drawdowns.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


