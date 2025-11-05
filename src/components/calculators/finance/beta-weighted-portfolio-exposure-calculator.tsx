'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Gauge } from 'lucide-react';

const formSchema = z.object({
  weight1: z.number().min(-500).max(500).optional(),
  beta1: z.number().min(-10).max(10).optional(),
  weight2: z.number().min(-500).max(500).optional(),
  beta2: z.number().min(-10).max(10).optional(),
  weight3: z.number().min(-500).max(500).optional(),
  beta3: z.number().min(-10).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BetaWeightedPortfolioExposureCalculator(){
  const [result,setResult] = useState<null|{ betaWeighted:number; interpretation:string }>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { weight1: undefined as unknown as number, beta1: undefined as unknown as number, weight2: undefined as unknown as number, beta2: undefined as unknown as number, weight3: undefined as unknown as number, beta3: undefined as unknown as number } });

  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const onSubmit=(v:FormValues)=>{
    const entries = [
      {w:v.weight1??0,b:v.beta1??0},
      {w:v.weight2??0,b:v.beta2??0},
      {w:v.weight3??0,b:v.beta3??0},
    ];
    const totalWeight = entries.reduce((s,e)=>s+Math.abs(e.w),0);
    if(totalWeight===0){ setResult(null); return; }
    const betaW = entries.reduce((s,e)=>s + e.w*e.b, 0) / entries.reduce((s,e)=>s+e.w,0);
    const interp = Math.abs(betaW) < 0.3 ? 'Low market exposure—portfolio closer to market‑neutral.' : Math.abs(betaW) < 1 ? 'Moderate beta—partially sensitive to market swings.' : 'High beta—returns likely to amplify market moves.';
    setResult({ betaWeighted: betaW, interpretation: interp });
  };

  const whatIfScale = useMemo(()=>[0.5, 1, 1.5, 2],[]);
  const scaledBeta=(scale:number)=>{
    const v=form.getValues();
    const entries=[{w:(v.weight1??0)*scale,b:v.beta1??0},{w:(v.weight2??0)*scale,b:v.beta2??0},{w:(v.weight3??0)*scale,b:v.beta3??0}];
    const denom=entries.reduce((s,e)=>s+e.w,0); if(denom===0) return null; return entries.reduce((s,e)=>s+e.w*e.b,0)/denom;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5"/> Beta‑weighted Portfolio Exposure Calculator</CardTitle>
          <CardDescription>Estimate portfolio beta versus a benchmark using position weights and individual betas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="weight1" render={({field})=>(<FormItem><FormLabel>Position 1 Weight (e.g., % of equity)</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beta1" render={({field})=>(<FormItem><FormLabel>Position 1 Beta</FormLabel><FormControl>{num('e.g., 1.2',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="weight2" render={({field})=>(<FormItem><FormLabel>Position 2 Weight</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beta2" render={({field})=>(<FormItem><FormLabel>Position 2 Beta</FormLabel><FormControl>{num('e.g., 0.8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="weight3" render={({field})=>(<FormItem><FormLabel>Position 3 Weight</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beta3" render={({field})=>(<FormItem><FormLabel>Position 3 Beta</FormLabel><FormControl>{num('e.g., -0.2',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Interactive scaling of gross exposure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Beta‑weighted Exposure</div><div className="text-2xl font-semibold">{result.betaWeighted.toFixed(2)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Scale Position Sizes</div>
              <div className="flex flex-wrap gap-2">
                {whatIfScale.map(scale=>{
                  const s=scaledBeta(scale);
                  return (
                    <Button key={scale} variant="secondary" onClick={()=>{
                      const v=form.getValues();
                      form.setValue('weight1',(v.weight1??0)*scale);
                      form.setValue('weight2',(v.weight2??0)*scale);
                      form.setValue('weight3',(v.weight3??0)*scale);
                      onSubmit(form.getValues());
                    }}>{scale}×{s!=null?` • Beta ${s.toFixed(2)}`:''}</Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Exposure and factor tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-asset-calculator" className="text-primary hover:underline">Single‑Asset Beta</a></h4><p className="text-sm text-muted-foreground">Beta versus a benchmark.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-expected-return-calculator" className="text-primary hover:underline">Portfolio Expected Return</a></h4><p className="text-sm text-muted-foreground">Weighted mean of returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tracking-error-calculator" className="text-primary hover:underline">Tracking Error</a></h4><p className="text-sm text-muted-foreground">Volatility vs benchmark.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/information-ratio-calculator" className="text-primary hover:underline">Information Ratio</a></h4><p className="text-sm text-muted-foreground">Excess return per unit TE.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Use consistent weights (e.g., % of portfolio equity) and benchmark betas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Beta reflects sensitivity to the benchmark; 1.0 tracks, 0.0 is neutral, negative hedges.</li>
            <li>Leverage and shorts affect the weighted beta; use net exposure for the denominator.</li>
            <li>Review betas periodically—they vary across regimes and holdings.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Beta, exposure, and hedging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is beta‑weighted exposure?</h4><p className="text-muted-foreground">It is the portfolio’s overall sensitivity to a benchmark, computed as the weighted average of position betas by their portfolio weights.</p></div>
          <div><h4 className="font-semibold mb-2">How do shorts affect beta?</h4><p className="text-muted-foreground">Short positions contribute negative weight; if shorting high‑beta names, they can bring the overall beta closer to zero or negative.</p></div>
          <div><h4 className="font-semibold mb-2">Which benchmark beta should I use?</h4><p className="text-muted-foreground">Use betas estimated versus your target index (e.g., S&P 500); mixing benchmarks leads to misleading results.</p></div>
          <div><h4 className="font-semibold mb-2">Should I normalize by net or gross exposure?</h4><p className="text-muted-foreground">Most use net exposure for portfolio beta. Some managers also track gross‑weighted beta for risk control.</p></div>
          <div><h4 className="font-semibold mb-2">How frequently do betas change?</h4><p className="text-muted-foreground">They drift with volatility and composition. Monthly or quarterly refresh is common.</p></div>
          <div><h4 className="font-semibold mb-2">Can options be included?</h4><p className="text-muted-foreground">Yes, use delta‑adjusted exposures and estimate instrument beta to the benchmark, then include in weights.</p></div>
          <div><h4 className="font-semibold mb-2">Is beta enough for risk?</h4><p className="text-muted-foreground">No. Track idiosyncratic risk, factor exposures, and drawdowns in addition to beta.</p></div>
          <div><h4 className="font-semibold mb-2">What if my beta exceeds 1.5?</h4><p className="text-muted-foreground">That implies amplified sensitivity. Consider reducing high‑beta exposure or adding hedges.</p></div>
          <div><h4 className="font-semibold mb-2">How do I target a specific beta?</h4><p className="text-muted-foreground">Solve for hedge ratio using index futures or inverse ETFs so the weighted beta equals the target.</p></div>
          <div><h4 className="font-semibold mb-2">Does sector concentration bias beta?</h4><p className="text-muted-foreground">Yes. Growth/cyclical sectors usually carry higher betas than defensives; diversify accordingly.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


