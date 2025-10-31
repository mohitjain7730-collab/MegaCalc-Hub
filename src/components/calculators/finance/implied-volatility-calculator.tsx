'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  spot: z.number().min(0).optional(),
  strike: z.number().min(0).optional(),
  rate: z.number().min(-100).max(100).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  optionType: z.enum(['call','put']).optional(),
  optionPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function normCdf(x: number) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x: number) { const s = x < 0 ? -1 : 1; x = Math.abs(x); const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911; const t=1/(1+p*x); const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x); return s*y; }

function bsPrice(S:number,K:number,rPct:number,sigma:number,T:number,type:'call'|'put'){ const r=rPct/100; if (sigma<=0||T===0){ return Math.max((type==='call'?S-K:S-K*-1),0);} const d1=(Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*Math.sqrt(T)); const d2=d1-sigma*Math.sqrt(T); if(type==='call'){ return S*normCdf(d1)-K*Math.exp(-r*T)*normCdf(d2);} return K*Math.exp(-r*T)*normCdf(-d2)-S*normCdf(-d1); }

function impliedVol(S:number,K:number,rPct:number,T:number,type:'call'|'put',price:number){ let lo=1e-4, hi=5.0; for(let i=0;i<100;i++){ const mid=(lo+hi)/2; const val=bsPrice(S,K,rPct,mid,T,type); if(val>price) hi=mid; else lo=mid; } return (lo+hi)/2*100; }

export default function ImpliedVolatilityCalculator(){
  const [result,setResult]=useState<{impliedVolPct:number; modelPrice:number; error:number; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spot:undefined as unknown as number,strike:undefined as unknown as number,rate:undefined as unknown as number,timeYears:undefined as unknown as number,optionType:undefined,optionPrice:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.spot===undefined||v.strike===undefined||v.rate===undefined||v.timeYears===undefined||v.optionType===undefined||v.optionPrice===undefined){ setResult(null); return; }
    const iv=impliedVol(v.spot,v.strike,v.rate,v.timeYears,v.optionType,v.optionPrice);
    const model=bsPrice(v.spot,v.strike,v.rate,iv/100,v.timeYears,v.optionType);
    setResult({impliedVolPct:iv, modelPrice:model, error:model-v.optionPrice, suggestions:['Use consistent units and periodicity for inputs.','Check dividends and borrow costs; this simple model ignores them.','Compare across expiries/strikes to view the volatility surface.','Use mid-prices to reduce bid/ask bias in IV.']});
  };

  const num=(ph:string,field:any)=>(
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any)?(field.value as any):''}
      onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}}/>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Implied Volatility (IV) Calculator</CardTitle>
          <CardDescription>Back out volatility from option market price using Black–Scholes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spot" render={({field})=>(<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strike" render={({field})=>(<FormItem><FormLabel>Strike Price</FormLabel><FormControl>{num('e.g., 105',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="rate" render={({field})=>(<FormItem><FormLabel>Risk-free Rate (%)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Expiry (years)</FormLabel><FormControl>{num('e.g., 0.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="optionType" render={({field})=>(<FormItem><FormLabel>Option Type</FormLabel><FormControl><Input placeholder="call or put" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="optionPrice" render={({field})=>(<FormItem><FormLabel>Option Market Price</FormLabel><FormControl>{num('e.g., 4.20',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Implied volatility</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Implied Volatility</p><p className="text-2xl font-bold">{result.impliedVolPct.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Model Price (check)</p><p className="text-2xl font-bold">{result.modelPrice.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Pricing Error</p><p className="text-2xl font-bold">{result.error.toFixed(4)}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Options analytics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Compute theoretical prices.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-greeks-calculator" className="text-primary hover:underline">Option Greeks Calculator</a></h4><p className="text-sm text-muted-foreground">Risk sensitivities.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-calculator" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Arbitrage check.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-payoff-calculator" className="text-primary hover:underline">Option Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Scenario analysis.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Implied Volatility</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide.</p><p>Discuss IV vs historical vol, skew/smile, and surface.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Implied volatility basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is implied volatility?</h4><p className="text-muted-foreground">The volatility input that makes the model price equal the market price.</p></div>
          <div><h4 className="font-semibold mb-2">Does IV predict returns?</h4><p className="text-muted-foreground">IV reflects market expectations of variability, not direction or expected return.</p></div>
          <div><h4 className="font-semibold mb-2">Which model is used?</h4><p className="text-muted-foreground">This tool uses Black–Scholes without dividends; real markets use surfaces and adjustments.</p></div>
          <div><h4 className="font-semibold mb-2">Why different IVs for calls vs puts?</h4><p className="text-muted-foreground">Skew and demand/supply imbalances cause IV differences across strikes and sides.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is bisection?</h4><p className="text-muted-foreground">Very robust for monotonic pricing; speed is sufficient for most use cases.</p></div>
          <div><h4 className="font-semibold mb-2">What inputs matter most?</h4><p className="text-muted-foreground">Time to expiry, moneyness, and rates have the largest impact on IV and price.</p></div>
          <div><h4 className="font-semibold mb-2">Can IV be annualized?</h4><p className="text-muted-foreground">Yes—model uses annualized volatility consistent with year-based time input.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use mid or last price?</h4><p className="text-muted-foreground">Mid is preferred to reduce bid/ask bias; use last with caution in illiquid markets.</p></div>
          <div><h4 className="font-semibold mb-2">How to compare IVs?</h4><p className="text-muted-foreground">Compare within the same expiry and relative moneyness; surfaces vary across assets.</p></div>
          <div><h4 className="font-semibold mb-2">What about dividends?</h4><p className="text-muted-foreground">Dividend yields reduce call IV and raise put IV in basic models; adjust inputs or use dividend models.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
