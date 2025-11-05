'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Sigma } from 'lucide-react';

const formSchema = z.object({
  stdev1: z.number().min(0).max(100).optional(),
  stdev2: z.number().min(0).max(100).optional(),
  corr: z.number().min(-1).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MinimumVariancePortfolioCalculator(){
  const [result,setResult] = useState<null|{ w1:number; w2:number; variance:number; stdev:number; interpretation:string }>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { stdev1: undefined as unknown as number, stdev2: undefined as unknown as number, corr: undefined as unknown as number } });

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    if(v.stdev1==null||v.stdev2==null||v.corr==null){ setResult(null); return; }
    const s1=v.stdev1/100, s2=v.stdev2/100, rho=v.corr; const a11=s1*s1, a22=s2*s2, a12=rho*s1*s2;
    const det=a11*a22-a12*a12; if(det<=0){ setResult(null); return; }
    // Global minimum variance weights (sum to 1): w ∝ Σ^{-1}1
    const inv11=a22/det, inv22=a11/det, inv12=-a12/det; const u1=inv11*1+inv12*1; const u2=inv12*1+inv22*1; const sum=u1+u2; const w1=u1/sum, w2=u2/sum;
    const varP=w1*w1*a11 + 2*w1*w2*a12 + w2*w2*a22; const sd=Math.sqrt(Math.max(0,varP));
    let interpretation=`Minimum variance portfolio allocates ${Math.round(w1*100)}% to Asset 1 and ${Math.round(w2*100)}% to Asset 2 with volatility ${(sd*100).toFixed(2)}%.`;
    interpretation += rho<0? ' Negative correlation significantly reduces risk.':' Diversification benefit depends on correlation and volatility mix.';
    setResult({ w1, w2, variance: varP, stdev: sd, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5"/> Minimum Variance Portfolio Calculator</CardTitle>
          <CardDescription>Two‑asset global minimum variance allocation under unconstrained weights summing to 1.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="stdev1" render={({field})=>(<FormItem><FormLabel>Asset 1 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 18',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="stdev2" render={({field})=>(<FormItem><FormLabel>Asset 2 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="corr" render={({field})=>(<FormItem><FormLabel>Correlation (ρ)</FormLabel><FormControl>{num('between -1 and 1',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Risk decomposition and diversification note</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Weight Asset 1</div><div className="text-2xl font-semibold">{(result.w1*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset 2</div><div className="text-2xl font-semibold">{(result.w2*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Volatility (σ)</div><div className="text-2xl font-semibold">{(result.stdev*100).toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk and diversification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Variance from weights and covariances.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/efficient-frontier-portfolio-calculator" className="text-primary hover:underline">Efficient Frontier (Two‑Asset)</a></h4><p className="text-sm text-muted-foreground">Optimal risk/return sets.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Balance risk and return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/volatility-standard-deviation-calculator" className="text-primary hover:underline">Volatility (Std Dev)</a></h4><p className="text-sm text-muted-foreground">Single‑asset risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Focuses purely on variance; ignores expected returns.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Use annualized volatilities and correlations from the same lookback window.</li>
            <li>Highly negative correlation can tilt weights toward balancing risks, not capital.</li>
            <li>Consider adding return targets or constraints in a full optimizer.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Global minimum variance logic and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a global minimum variance portfolio?</h4><p className="text-muted-foreground">It is the combination of assets that achieves the lowest possible variance among all portfolios that sum to 1 under given covariances.</p></div>
          <div><h4 className="font-semibold mb-2">Does this consider expected returns?</h4><p className="text-muted-foreground">No. GMV optimizes risk only. To balance risk and return, use mean‑variance optimization.</p></div>
          <div><h4 className="font-semibold mb-2">Can weights be negative?</h4><p className="text-muted-foreground">Yes in this unconstrained model. Real‑world mandates may restrict shorting.</p></div>
          <div><h4 className="font-semibold mb-2">How reliable are correlations?</h4><p className="text-muted-foreground">Correlations are unstable across regimes. Stress test across ranges to assess robustness.</p></div>
          <div><h4 className="font-semibold mb-2">What if the covariance matrix is singular?</h4><p className="text-muted-foreground">Then the solution is not defined. Ensure inputs are reasonable; perfect correlation leads to singularity.</p></div>
          <div><h4 className="font-semibold mb-2">Is GMV suitable for risk‑averse investors?</h4><p className="text-muted-foreground">Often yes, but consider drawdowns, taxes, and rebalancing costs beyond variance alone.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I rebalance?</h4><p className="text-muted-foreground">When volatilities/correlations shift meaningfully or on a schedule (e.g., quarterly).</p></div>
          <div><h4 className="font-semibold mb-2">Do more assets always reduce variance?</h4><p className="text-muted-foreground">Not necessarily—benefit depends on correlations and relative risk levels.</p></div>
          <div><h4 className="font-semibold mb-2">How do I estimate volatility?</h4><p className="text-muted-foreground">Use historical standard deviation or model‑based forecasts (e.g., GARCH) annualized.</p></div>
          <div><h4 className="font-semibold mb-2">What about tail risk?</h4><p className="text-muted-foreground">Variance penalizes upside and downside equally; consider CVaR or drawdown metrics if tails matter.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


