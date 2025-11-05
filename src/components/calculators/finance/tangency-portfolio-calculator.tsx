'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, LineChart } from 'lucide-react';

const formSchema = z.object({
  expReturn1: z.number().min(-100).max(100).optional(),
  expReturn2: z.number().min(-100).max(100).optional(),
  stdev1: z.number().min(0).max(100).optional(),
  stdev2: z.number().min(0).max(100).optional(),
  corr: z.number().min(-1).max(1).optional(),
  riskFree: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TangencyPortfolioCalculator(){
  const [result,setResult] = useState<null | {
    w1: number; w2: number; sharpe: number; portReturn: number; portStdev: number; interpretation: string;
  }>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expReturn1: undefined as unknown as number,
      expReturn2: undefined as unknown as number,
      stdev1: undefined as unknown as number,
      stdev2: undefined as unknown as number,
      corr: undefined as unknown as number,
      riskFree: undefined as unknown as number,
    }
  });

  const num=(ph:string,field:any)=>(
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any)?(field.value as any):''}
      onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}}
    />
  );

  const compute = (v:FormValues)=>{
    if(v.expReturn1==null||v.expReturn2==null||v.stdev1==null||v.stdev2==null||v.corr==null||v.riskFree==null){ setResult(null); return; }
    const mu1=v.expReturn1/100, mu2=v.expReturn2/100; // convert to decimals
    const s1=v.stdev1/100, s2=v.stdev2/100; const rho=v.corr; const rf=v.riskFree/100;
    const cov = rho*s1*s2;

    // Tangency weights for 2 assets (unconstrained, sum to 1):
    // w ∝ Σ^{-1}(μ - rf*1)
    const a11 = s1*s1, a22=s2*s2, a12=cov; // covariance matrix
    const det = a11*a22 - a12*a12;
    if(det<=0){ setResult(null); return; }
    const inv11 = a22/det, inv22 = a11/det, inv12 = -a12/det;
    const k1 = mu1 - rf, k2 = mu2 - rf;
    const u1 = inv11*k1 + inv12*k2;
    const u2 = inv12*k1 + inv22*k2;
    const sum = u1+u2;
    const w1 = u1/sum; const w2 = u2/sum;

    // Portfolio stats
    const portMu = w1*mu1 + w2*mu2;
    const portVar = w1*w1*a11 + 2*w1*w2*a12 + w2*w2*a22;
    const portSd = Math.sqrt(Math.max(0,portVar));
    const sharpe = portSd>0 ? (portMu - rf)/portSd : 0;
    let interpretation = `Tangency portfolio allocates ${Math.round(w1*100)}% to Asset 1 and ${Math.round(w2*100)}% to Asset 2. Expected return ${
      (portMu*100).toFixed(2)
    }% with volatility ${(portSd*100).toFixed(2)}%. Sharpe ≈ ${sharpe.toFixed(2)} relative to risk‑free ${v.riskFree.toFixed(2)}%.`;
    interpretation += sharpe>=0.6? ' This is a strong risk‑adjusted profile.':' Consider improving expected returns or reducing correlation/volatility.';
    setResult({ w1, w2, sharpe, portReturn: portMu*100, portStdev: portSd*100, interpretation });
  };

  const onSubmit = (v:FormValues)=> compute(v);

  const rfWhatIfs = useMemo(()=>[-1,0,1,2,3,4,5],[]);

  const previewSharpeAtRf=(rfPct:number)=>{
    const v = form.getValues();
    if(v.expReturn1==null||v.expReturn2==null||v.stdev1==null||v.stdev2==null||v.corr==null){ return null; }
    const mu1=v.expReturn1/100, mu2=v.expReturn2/100; const s1=v.stdev1/100, s2=v.stdev2/100; const rho=v.corr; const rf=rfPct/100;
    const cov=rho*s1*s2; const a11=s1*s1, a22=s2*s2, a12=cov; const det=a11*a22-a12*a12; if(det<=0) return null;
    const inv11=a22/det, inv22=a11/det, inv12=-a12/det; const k1=mu1-rf, k2=mu2-rf; const u1=inv11*k1+inv12*k2; const u2=inv12*k1+inv22*k2; const sum=u1+u2; const w1=u1/sum; const w2=u2/sum;
    const portMu=w1*mu1+w2*mu2; const portVar=w1*w1*a11+2*w1*w2*a12+w2*w2*a22; const sd=Math.sqrt(Math.max(0,portVar)); return sd>0? (portMu-rf)/sd : null;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5"/> Tangency Portfolio (Max Sharpe) Calculator</CardTitle>
          <CardDescription>Two‑asset tangency weights relative to a risk‑free rate; unconstrained, sum to 1.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="expReturn1" render={({field})=>(<FormItem><FormLabel>Asset 1 Expected Return (%)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="stdev1" render={({field})=>(<FormItem><FormLabel>Asset 1 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="expReturn2" render={({field})=>(<FormItem><FormLabel>Asset 2 Expected Return (%)</FormLabel><FormControl>{num('e.g., 5.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="stdev2" render={({field})=>(<FormItem><FormLabel>Asset 2 Volatility (σ, %)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="corr" render={({field})=>(<FormItem><FormLabel>Correlation (ρ)</FormLabel><FormControl>{num('between -1 and 1',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="riskFree" render={({field})=>(<FormItem><FormLabel>Risk‑free Rate (%)</FormLabel><FormControl>{num('e.g., 2',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Interactive risk‑free sensitivity (what‑if Sharpe).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Weight Asset 1</div><div className="text-2xl font-semibold">{(result.w1*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset 2</div><div className="text-2xl font-semibold">{(result.w2*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Sharpe Ratio</div><div className="text-2xl font-semibold">{result.sharpe.toFixed(2)}</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Expected Return</div><div className="text-2xl font-semibold">{result.portReturn.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Volatility (σ)</div><div className="text-2xl font-semibold">{result.portStdev.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Risk‑free Rate</div>
              <div className="flex flex-wrap gap-2">
                {rfWhatIfs.map(rf=>{
                  const s = previewSharpeAtRf(rf);
                  return (
                    <Button key={rf} variant="secondary" onClick={()=>{form.setValue('riskFree', rf); const v=form.getValues(); compute(v);}}>
                      {rf}%{s!=null?` • Sharpe ${s.toFixed(2)}`:''}
                    </Button>
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
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Trade‑off between risk and return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/efficient-frontier-portfolio-calculator" className="text-primary hover:underline">Efficient Frontier (Two‑Asset)</a></h4><p className="text-sm text-muted-foreground">Best portfolios for each risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Aggregate risk from weights and covariances.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted performance.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Use for mean‑variance inputs; add constraints or more assets in advanced tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Expected returns and volatilities should be annualized and consistent.</li>
            <li>Correlation drives diversification benefit; lower ρ often raises the Sharpe.</li>
            <li>Negative weights imply leverage/shorts; this tool allows unconstrained weights that sum to 1.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Tangency portfolio, Sharpe ratio, and assumptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a tangency portfolio?</h4><p className="text-muted-foreground">It is the portfolio on the efficient frontier that maximizes the Sharpe ratio relative to a given risk‑free rate, assuming mean‑variance preferences.</p></div>
          <div><h4 className="font-semibold mb-2">Why do weights sometimes turn negative?</h4><p className="text-muted-foreground">With unconstrained optimization, the Sharpe‑maximizing solution can short the less attractive asset to lever the better one, while keeping weights summing to 1.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use historical or forward‑looking returns?</h4><p className="text-muted-foreground">Forward‑looking (model/consensus) estimates are ideal. Historical averages are a fallback but can be regime‑dependent.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive is the result to the risk‑free rate?</h4><p className="text-muted-foreground">Sharpe ratios adjust linearly with rf. Small rf changes can flip the preferred mix when assets have similar profiles—use the what‑if buttons to test.</p></div>
          <div><h4 className="font-semibold mb-2">Does correlation matter more than volatility?</h4><p className="text-muted-foreground">Both matter. Lower correlation improves diversification, often enabling a higher Sharpe even if individual volatilities are high.</p></div>
          <div><h4 className="font-semibold mb-2">Can I extend this to more than two assets?</h4><p className="text-muted-foreground">Yes; the concept generalizes using Σ^{-1}(μ − rf·1). Use the mean‑variance optimizer or efficient frontier tools for multi‑asset cases.</p></div>
          <div><h4 className="font-semibold mb-2">Is the maximum Sharpe portfolio always optimal?</h4><p className="text-muted-foreground">It is optimal for quadratic utility/normal returns assumptions. Real‑world frictions, drawdowns, and tails may shift preferences.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret a Sharpe below 0.3?</h4><p className="text-muted-foreground">That’s weak on a historical basis. Consider better assets, lower fees, or diversifiers to raise the Sharpe.</p></div>
          <div><h4 className="font-semibold mb-2">What about constraints like no‑short or max weight?</h4><p className="text-muted-foreground">This simplified tool does not impose constraints. For practical portfolios, constraints are common and generally reduce the maximum Sharpe.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recompute?</h4><p className="text-muted-foreground">Recalculate when expected returns, volatilities, correlations, or the risk‑free rate shift materially—often quarterly or annually.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


