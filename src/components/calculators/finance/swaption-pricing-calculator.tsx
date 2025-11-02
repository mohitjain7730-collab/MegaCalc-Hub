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
  swapRate: z.number().min(-100).max(100).optional(),
  strikeRate: z.number().min(-100).max(100).optional(),
  volatility: z.number().min(0).max(500).optional(),
  riskFreeRate: z.number().min(-100).max(100).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  swaptionType: z.enum(['payer','receiver']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function normCdf(x: number) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x: number) { const s=x<0?-1:1; x=Math.abs(x); const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911; const t=1/(1+p*x); const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x); return s*y; }

export default function SwaptionPricingCalculator() {
  const [result,setResult]=useState<{swaptionValue:number; d1:number; d2:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{swapRate:undefined as unknown as number,strikeRate:undefined as unknown as number,volatility:undefined as unknown as number,riskFreeRate:undefined as unknown as number,timeYears:undefined as unknown as number,swaptionType:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.swapRate===undefined||v.strikeRate===undefined||v.volatility===undefined||v.riskFreeRate===undefined||v.timeYears===undefined||v.swaptionType===undefined){ setResult(null); return; }
    const r=v.riskFreeRate/100; const sig=v.volatility/100;
    if(sig===0||v.timeYears===0){ setResult({swaptionValue:NaN,d1:NaN,d2:NaN,interpretation:'Invalid inputs.',suggestions:[]}); return; }
    const d1=(Math.log(v.swapRate/v.strikeRate)+(r+0.5*sig*sig)*v.timeYears)/(sig*Math.sqrt(v.timeYears));
    const d2=d1-sig*Math.sqrt(v.timeYears);
    const val=(v.swaptionType==='payer'?1:-1)*((v.swaptionType==='payer'?normCdf(d1):normCdf(-d1))*v.swapRate-(v.swaptionType==='payer'?normCdf(d2):normCdf(-d2))*v.strikeRate)*Math.exp(-r*v.timeYears);
    const interp=`${v.swaptionType} swaption value: ${val>=0?'premium':'discount'} of ${Math.abs(val).toFixed(4)}.`;
    setResult({swaptionValue:val,d1,d2,interpretation:interp,suggestions:['Uses Black model for swaption pricing; assumes log-normal swap rate.','Payer swaptions: right to pay fixed; receiver: right to receive fixed.','Volatility is swap rate volatility, not bond or interest rate vol.','Use forward swap rate and expiry-matched discount rate for accuracy.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Swaption Pricing Calculator</CardTitle>
          <CardDescription>Estimate swaption value using Black model with swap rate, strike, volatility, and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="swapRate" render={({field})=>(<FormItem><FormLabel>Forward Swap Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strikeRate" render={({field})=>(<FormItem><FormLabel>Strike Rate (%)</FormLabel><FormControl>{num('e.g., 4.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volatility" render={({field})=>(<FormItem><FormLabel>Swap Rate Volatility (%)</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="riskFreeRate" render={({field})=>(<FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Expiry (years)</FormLabel><FormControl>{num('e.g., 1',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="swaptionType" render={({field})=>(<FormItem><FormLabel>Swaption Type</FormLabel><FormControl><Input placeholder="payer or receiver" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Swaption valuation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Swaption Value</p><p className={`text-2xl font-bold ${result.swaptionValue>=0?'text-green-600':'text-red-600'}`}>{Number.isFinite(result.swaptionValue)?result.swaptionValue.toFixed(4):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">d1</p><p className="text-2xl font-bold">{Number.isFinite(result.d1)?result.d1.toFixed(4):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">d2</p><p className="text-2xl font-bold">{Number.isFinite(result.d2)?result.d2.toFixed(4):'N/A'}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Swaps and options</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/swap-valuation-plain-vanilla-interest-rate-swap-calculator" className="text-primary hover:underline">Swap Valuation Calculator</a></h4><p className="text-sm text-muted-foreground">Underlying swap value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Related option model.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-greeks-calculator" className="text-primary hover:underline">Option Greeks Calculator</a></h4><p className="text-sm text-muted-foreground">Risk sensitivities.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/implied-volatility-calculator" className="text-primary hover:underline">Implied Volatility Calculator</a></h4><p className="text-sm text-muted-foreground">Volatility inputs.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Swaption Pricing</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain Black model, payer vs receiver swaptions, and volatility inputs.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Swaption pricing</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a swaption?</h4><p className="text-muted-foreground">An option to enter into an interest rate swap at a specified strike rate on or before expiry.</p></div>
          <div><h4 className="font-semibold mb-2">What is a payer swaption?</h4><p className="text-muted-foreground">Right to enter a swap paying fixed rate; exercised when swap rate exceeds strike.</p></div>
          <div><h4 className="font-semibold mb-2">What is a receiver swaption?</h4><p className="text-muted-foreground">Right to enter a swap receiving fixed rate; exercised when swap rate is below strike.</p></div>
          <div><h4 className="font-semibold mb-2">Which model is used?</h4><p className="text-muted-foreground">Black model (Black-76) adapted for swaptions, assuming log-normal swap rate distribution.</p></div>
          <div><h4 className="font-semibold mb-2">What volatility should I use?</h4><p className="text-muted-foreground">Use implied swaption volatility or historical swap rate volatility matching tenor and expiry.</p></div>
          <div><h4 className="font-semibold mb-2">How does it differ from bond options?</h4><p className="text-muted-foreground">Swaptions reference swap rates; bond options reference bond prices; different underlying and vol.</p></div>
          <div><h4 className="font-semibold mb-2">Can swaptions be American?</h4><p className="text-muted-foreground">Yes, though European swaptions are most common; early exercise complicates valuation.</p></div>
          <div><h4 className="font-semibold mb-2">What affects swaption value most?</h4><p className="text-muted-foreground">Moneyness (swap rate vs strike), volatility, time to expiry, and discount rate.</p></div>
          <div><h4 className="font-semibold mb-2">How to hedge swaptions?</h4><p className="text-muted-foreground">Delta-hedge with underlying swap or interest rate futures; gamma and vega require additional hedges.</p></div>
          <div><h4 className="font-semibold mb-2">What about Bermuda swaptions?</h4><p className="text-muted-foreground">Exercise on specific dates; requires lattice or Monte Carlo methods, not Black model.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

