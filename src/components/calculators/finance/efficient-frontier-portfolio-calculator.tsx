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
});

type FormValues = z.infer<typeof formSchema>;

export default function EfficientFrontierPortfolioCalculator(){
  const [result,setResult]=useState<null|{wA:number; wB:number; portReturn:number; portVol:number; interpretation:string}>(null);
  const [whatIfCorr,setWhatIfCorr]=useState<number|null>(null);

  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{expReturnA:undefined as unknown as number, expReturnB:undefined as unknown as number, volA:undefined as unknown as number, volB:undefined as unknown as number, corr:undefined as unknown as number}});
  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  function minVarianceWeight(sigmaA:number, sigmaB:number, rho:number){
    const a=sigmaA*sigmaA, b=sigmaB*sigmaB, c=rho*sigmaA*sigmaB;
    const w=(b - c)/(a + b - 2*c);
    return Math.min(1, Math.max(0, w));
  }

  const compute = (v:FormValues)=>{
    if(v.volA===undefined||v.volB===undefined||v.corr===undefined){ setResult(null); return; }
    const w=minVarianceWeight((v.volA/100),(v.volB/100),v.corr);
    const exp = ((v.expReturnA||0)/100)*w + ((v.expReturnB||0)/100)*(1-w);
    const sigmaA=(v.volA/100), sigmaB=(v.volB/100), rho=v.corr; const portVol=Math.sqrt(w*w*sigmaA*sigmaA + (1-w)*(1-w)*sigmaB*sigmaB + 2*w*(1-w)*sigmaA*sigmaB*rho);
    const interp=`Minimum-variance weight in Asset A ≈ ${(w*100).toFixed(1)}%. Expected return ≈ ${(exp*100).toFixed(2)}% with volatility ≈ ${(portVol*100).toFixed(2)}%. Negative correlation lowers volatility most.`;
    setResult({wA:w, wB:1-w, portReturn:exp*100, portVol:portVol*100, interpretation:interp});
  };

  const onSubmit=(v:FormValues)=> compute(v);

  const corrWhatIfs = useMemo(()=>[-0.8,-0.5,0,0.5,0.8],[]);

  const previewAtCorr=(rho:number)=>{
    const v=form.getValues();
    if(v.volA===undefined||v.volB===undefined||v.expReturnA===undefined||v.expReturnB===undefined){ return null; }
    const w=minVarianceWeight((v.volA/100),(v.volB/100),rho);
    const exp = ((v.expReturnA||0)/100)*w + ((v.expReturnB||0)/100)*(1-w);
    const sigmaA=(v.volA/100), sigmaB=(v.volB/100); const portVol=Math.sqrt(w*w*sigmaA*sigmaA + (1-w)*(1-w)*sigmaB*sigmaB + 2*w*(1-w)*sigmaA*sigmaB*rho);
    return {w:Math.round(w*100), vol:Math.round(portVol*1000)/10};
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5"/> Efficient Frontier Portfolio Calculator (Multi‑Asset)</CardTitle>
          <CardDescription>Compute the minimum‑variance mix of two assets and explore correlation effects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="expReturnA" render={({field})=>(<FormItem><FormLabel>Exp. Return A (%)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volA" render={({field})=>(<FormItem><FormLabel>Vol A (σ, %)</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="expReturnB" render={({field})=>(<FormItem><FormLabel>Exp. Return B (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volB" render={({field})=>(<FormItem><FormLabel>Vol B (σ, %)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="corr" render={({field})=>(<FormItem><FormLabel>Correlation (−1 to 1)</FormLabel><FormControl>{num('e.g., 0.2',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Correlation sensitivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Weight Asset A</div><div className="text-2xl font-semibold">{(result.wA*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Weight Asset B</div><div className="text-2xl font-semibold">{(result.wB*100).toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Portfolio Volatility</div><div className="text-2xl font-semibold">{result.portVol.toFixed(2)}%</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Expected Return</div><div className="text-2xl font-semibold">{result.portReturn.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Correlation</div>
              <div className="flex flex-wrap gap-2">
                {corrWhatIfs.map(rho=>{
                  const prev = previewAtCorr(rho);
                  return (
                    <Button key={rho} variant="secondary" onClick={()=>{form.setValue('corr', rho); const v=form.getValues(); compute(v);}}>
                      {rho}{prev!=null?` • A ${prev.w}% • Vol ${prev.vol}%`:''}
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Target return optimization.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Aggregate risk calculation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Interpreting the efficient frontier in practice</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Use long‑run, regime‑aware inputs; avoid overfitting to short windows.</li>
            <li>Apply weight constraints and rebalancing bands to keep portfolios practical.</li>
            <li>Complement variance with drawdown and tail‑risk metrics for robustness.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Portfolio theory fundamentals for SEO and education</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the efficient frontier?</h4><p className="text-muted-foreground">The set of portfolios that achieve the maximum expected return for a given level of risk (volatility) under the mean‑variance framework.</p></div>
          <div><h4 className="font-semibold mb-2">What does minimum‑variance mean?</h4><p className="text-muted-foreground">It's the portfolio with the lowest volatility among all combinations of the given assets.</p></div>
          <div><h4 className="font-semibold mb-2">Why does correlation matter?</h4><p className="text-muted-foreground">Lower or negative correlation reduces combined volatility, creating diversification benefits and shifting the frontier upward.</p></div>
          <div><h4 className="font-semibold mb-2">Do expected returns affect the min‑variance weight?</h4><p className="text-muted-foreground">No—the min‑variance mix depends on volatilities and correlation. Returns matter for optimal trade‑offs along the frontier.</p></div>
          <div><h4 className="font-semibold mb-2">Is volatility the same as risk?</h4><p className="text-muted-foreground">Volatility is a common risk proxy. Real‑world risk also includes drawdowns, tail events, and liquidity.</p></div>
          <div><h4 className="font-semibold mb-2">Can I add a risk‑free asset?</h4><p className="text-muted-foreground">Yes—introducing a risk‑free asset yields the Capital Market Line; the tangency portfolio maximizes Sharpe ratio.</p></div>
          <div><h4 className="font-semibold mb-2">How stable are inputs over time?</h4><p className="text-muted-foreground">Expected returns, volatilities, and correlations change. Robust optimization and regular re‑estimation are recommended.</p></div>
          <div><h4 className="font-semibold mb-2">What limitations does mean‑variance have?</h4><p className="text-muted-foreground">It assumes normal returns and uses variance as risk, which may understate tail risk and non‑normal distributions.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I rebalance?</h4><p className="text-muted-foreground">A quarterly or semiannual cadence with bands is common to control drift and trading costs.</p></div>
          <div><h4 className="font-semibold mb-2">Should I constrain weights?</h4><p className="text-muted-foreground">In practice, yes. Non‑negativity or max position limits prevent extreme solutions caused by estimation error.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
