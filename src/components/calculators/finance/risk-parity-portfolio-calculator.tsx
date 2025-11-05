'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Scale } from 'lucide-react';

const formSchema = z.object({
  stdev1: z.number().min(0).max(100).optional(),
  stdev2: z.number().min(0).max(100).optional(),
  stdev3: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RiskParityPortfolioCalculator(){
  const [result,setResult]=useState<null|{ w1:number; w2:number; w3:number; interpretation:string }>(null);

  const form=useForm<FormValues>({ resolver:zodResolver(formSchema), defaultValues: { stdev1: undefined as unknown as number, stdev2: undefined as unknown as number, stdev3: undefined as unknown as number } });

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    if(v.stdev1==null||v.stdev2==null||v.stdev3==null){ setResult(null); return; }
    const s1=v.stdev1/100, s2=v.stdev2/100, s3=v.stdev3/100;
    // Simple inverse-volatility risk parity (approximate, assumes low correlations)
    const inv=[1/(s1||1e-9), 1/(s2||1e-9), 1/(s3||1e-9)];
    const sum=inv.reduce((a,b)=>a+b,0);
    const w=inv.map(x=>x/sum);
    const interpretation=`Inverse‑volatility risk parity suggests ${(w[0]*100).toFixed(0)}% / ${(w[1]*100).toFixed(0)}% / ${(w[2]*100).toFixed(0)}% across the three assets. Lower‑vol assets receive higher capital to equalize risk contribution.`;
    setResult({ w1:w[0], w2:w[1], w3:w[2], interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5"/> Risk Parity Portfolio Calculator</CardTitle>
          <CardDescription>Approximate inverse‑volatility allocations to equalize risk contribution across up to 3 assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="stdev1" render={({field})=>(<FormItem><FormLabel>Asset 1 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="stdev2" render={({field})=>(<FormItem><FormLabel>Asset 2 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 12',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="stdev3" render={({field})=>(<FormItem><FormLabel>Asset 3 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Inverse‑volatility sizing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Weight Asset 1</div><div className="text-2xl font-semibold">{(result.w1*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset 2</div><div className="text-2xl font-semibold">{(result.w2*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset 3</div><div className="text-2xl font-semibold">{(result.w3*100).toFixed(1)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Optimize risk and return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Assess overall risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/volatility-standard-deviation-calculator" className="text-primary hover:underline">Volatility (Std Dev)</a></h4><p className="text-sm text-muted-foreground">Single‑asset risk inputs.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/efficient-frontier-portfolio-calculator" className="text-primary hover:underline">Efficient Frontier</a></h4><p className="text-sm text-muted-foreground">Best portfolios for each risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Risk parity targets equal risk contribution; inverse‑volatility is a quick proxy.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>For correlated assets, true risk parity needs the full covariance matrix.</li>
            <li>Leverage is often used to lift expected return while keeping balanced risk.</li>
            <li>Rebalance as volatilities shift to maintain parity.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Risk parity concepts and caveats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is risk parity?</h4><p className="text-muted-foreground">An allocation approach that equalizes each asset's contribution to total portfolio risk, not capital.</p></div>
          <div><h4 className="font-semibold mb-2">Why inverse‑volatility?</h4><p className="text-muted-foreground">If assets are uncorrelated, inverse‑vol weights approximate equal risk contribution.</p></div>
          <div><h4 className="font-semibold mb-2">Do correlations matter?</h4><p className="text-muted-foreground">Yes. With correlations, compute marginal risk contributions using the covariance matrix and solve for equal contributions.</p></div>
          <div><h4 className="font-semibold mb-2">Is leverage required?</h4><p className="text-muted-foreground">Often, yes, to lift expected return after sizing up low‑vol assets like bonds.</p></div>
          <div><h4 className="font-semibold mb-2">How stable are these allocations?</h4><p className="text-muted-foreground">They change with volatility regimes; consider smoothing or bands to reduce turnover.</p></div>
          <div><h4 className="font-semibold mb-2">Can I cap weights?</h4><p className="text-muted-foreground">Yes in practice; this simplified tool is unconstrained and sums to 1.</p></div>
          <div><h4 className="font-semibold mb-2">What is risk contribution?</h4><p className="text-muted-foreground">It is weight × marginal contribution to risk; equal at the solution under the chosen risk model.</p></div>
          <div><h4 className="font-semibold mb-2">Does inverse‑volatility ignore returns?</h4><p className="text-muted-foreground">Yes; it's risk‑only sizing. Pair with expected returns when targeting Sharpe or specific outcomes.</p></div>
          <div><h4 className="font-semibold mb-2">How frequently to rebalance?</h4><p className="text-muted-foreground">Commonly monthly or quarterly, or when vol deviates beyond a threshold.</p></div>
          <div><h4 className="font-semibold mb-2">What about tail risk?</h4><p className="text-muted-foreground">Volatility underweights tails; consider drawdown/CVaR based parity for tail‑aware sizing.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


