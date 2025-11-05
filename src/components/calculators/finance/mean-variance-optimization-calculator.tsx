'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, LineChart } from 'lucide-react';

const formSchema = z.object({
  expReturnA: z.number().min(-100).max(100).optional(),
  expReturnB: z.number().min(-100).max(100).optional(),
  volA: z.number().min(0).max(100).optional(),
  volB: z.number().min(0).max(100).optional(),
  corr: z.number().min(-1).max(1).optional(),
  targetReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MeanVarianceOptimizationCalculator(){
  const [result,setResult]=useState<null|{wA:number; wB:number; portVol:number; interpretation:string}>(null);
  const [whatIfTarget,setWhatIfTarget]=useState<number|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{expReturnA:undefined as unknown as number, expReturnB:undefined as unknown as number, volA:undefined as unknown as number, volB:undefined as unknown as number, corr:undefined as unknown as number, targetReturn:undefined as unknown as number}});
  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  function solveWeights(rA:number,rB:number,sA:number,sB:number,rho:number,target:number){
    const A=sA*sA, B=sB*sB, C=rho*sA*sB;
    const denom=(rA - rB);
    if(Math.abs(denom) < 1e-9) return null;
    const wA=(target - rB)/denom; const wB=1-wA;
    const varp = wA*wA*A + wB*wB*B + 2*wA*wB*C;
    if(varp<0) return null;
    return {wA, wB, vol:Math.sqrt(varp)};
  }

  const compute = (v:FormValues)=>{
    if(v.expReturnA===undefined||v.expReturnB===undefined||v.volA===undefined||v.volB===undefined||v.corr===undefined||v.targetReturn===undefined){ setResult(null); return; }
    const res=solveWeights((v.expReturnA/100),(v.expReturnB/100),(v.volA/100),(v.volB/100),v.corr,(v.targetReturn/100));
    if(!res){ setResult(null); return; }
    const interpretation=`To target ${(v.targetReturn).toFixed(2)}% expected return, allocate ${(res.wA*100).toFixed(1)}% to Asset A and ${(res.wB*100).toFixed(1)}% to Asset B. Estimated volatility ≈ ${(res.vol*100).toFixed(2)}%.`;
    setResult({wA:res.wA,wB:res.wB,portVol:res.vol,interpretation});
  };

  const onSubmit=(v:FormValues)=> compute(v);

  const targetWhatIfs = useMemo(()=>[3,5,6,7,9],[]);

  const previewAtTarget=(t:number)=>{
    const v=form.getValues(); if([v.expReturnA,v.expReturnB,v.volA,v.volB,v.corr].some(x=>x===undefined)) return null; const r=solveWeights((v.expReturnA!/100),(v.expReturnB!/100),(v.volA!/100),(v.volB!/100),v.corr!,t/100); return r? {wA:Math.round(r.wA*100),vol:Math.round(r.vol*1000)/10}:null;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5"/> Mean‑Variance Optimization Calculator</CardTitle>
          <CardDescription>Solve weights for a two‑asset portfolio at a chosen expected return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="expReturnA" render={({field})=>(<FormItem><FormLabel>Exp. Return A (%)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volA" render={({field})=>(<FormItem><FormLabel>Vol A (σ, %)</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="expReturnB" render={({field})=>(<FormItem><FormLabel>Exp. Return B (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volB" render={({field})=>(<FormItem><FormLabel>Vol B (σ, %)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="corr" render={({field})=>(<FormItem><FormLabel>Correlation (−1..1)</FormLabel><FormControl>{num('e.g., 0.2',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="targetReturn" render={({field})=>(<FormItem><FormLabel>Target Return (%)</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Preview other targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Weight Asset A</div><div className="text-2xl font-semibold">{(result.wA*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset B</div><div className="text-2xl font-semibold">{(result.wB*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Portfolio Volatility</div><div className="text-2xl font-semibold">{(result.portVol*100).toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Target Return</div>
              <div className="flex flex-wrap gap-2">
                {targetWhatIfs.map(t=>{
                  const prev = previewAtTarget(t);
                  return (
                    <Button key={t} variant={(whatIfTarget===t)?'default':'secondary'} onClick={()=>{form.setValue('targetReturn', t); const v=form.getValues(); compute(v);}}>
                      {t}%{prev!=null?` • A ${prev.wA}% • Vol ${prev.vol}%`:''}
                    </Button>
                  );
                })}
              </div>
              {whatIfTarget!==null && (()=>{ const r=previewAtTarget(whatIfTarget); return r? <div className="mt-2 text-sm">At {whatIfTarget}% target, weight in A ≈ {r.wA}% and volatility ≈ {r.vol}%.</div> : <div className="mt-2 text-sm">Target not attainable with given inputs.</div>; })()}
            </div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/efficient-frontier-portfolio-calculator" className="text-primary hover:underline">Efficient Frontier (Two‑Asset)</a></h4><p className="text-sm text-muted-foreground">Best portfolios for each risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Aggregate risk from weights and covariances.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Turning optimization outputs into real portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Impose weight bounds and turnover limits to reduce sensitivity.</li>
            <li>Blend with a benchmark to create stable, investable allocations.</li>
            <li>Update inputs on a fixed cadence; avoid chasing recent performance.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑ready answers about mean‑variance optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is mean‑variance optimization?</h4><p className="text-muted-foreground">A framework that selects portfolio weights to minimize variance for a given expected return or maximize return for a given variance.</p></div>
          <div><h4 className="font-semibold mb-2">Why might a target return be unattainable?</h4><p className="text-muted-foreground">If the desired return exceeds the higher asset's expected return or is below the lower one (with non‑negativity constraints), a solution may not exist.</p></div>
          <div><h4 className="font-semibold mb-2">Are weights constrained to 0–100%?</h4><p className="text-muted-foreground">This demo constrains implicitly via feasibility. In practice, you can enforce non‑negative weights or allow shorting.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive are results to inputs?</h4><p className="text-muted-foreground">Very—small changes in expected returns can swing weights. Use robust estimates, shrinkage, or Black‑Litterman approaches.</p></div>
          <div><h4 className="font-semibold mb-2">Does diversification always reduce risk?</h4><p className="text-muted-foreground">Generally, but if assets are highly correlated, the benefit diminishes—correlation is key.</p></div>
          <div><h4 className="font-semibold mb-2">What is the tangency portfolio?</h4><p className="text-muted-foreground">The Sharpe‑maximizing mix when a risk‑free asset is available; it defines the Capital Market Line.</p></div>
          <div><h4 className="font-semibold mb-2">How do I include constraints like max weight?</h4><p className="text-muted-foreground">Optimization with constraints can be solved numerically; this simplified tool illustrates the core idea.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include transaction costs?</h4><p className="text-muted-foreground">Yes—costs and taxes impact realized returns; frequent rebalancing can erode performance.</p></div>
          <div><h4 className="font-semibold mb-2">What about non‑normal returns?</h4><p className="text-muted-foreground">Fat tails and skew can invalidate variance as a complete risk measure; consider CVaR or drawdown metrics.</p></div>
          <div><h4 className="font-semibold mb-2">How often to update inputs?</h4><p className="text-muted-foreground">Quarterly or semiannually with a documented process; avoid overfitting to short windows.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
