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
  volatility: z.number().min(0).max(500).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  optionType: z.enum(['call','put']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function normCdf(x: number) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x: number) { const s=x<0?-1:1; x=Math.abs(x); const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911; const t=1/(1+p*x); const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x); return s*y; }

export default function ProbabilityExpiringITMOptionsCalculator() {
  const [result,setResult]=useState<{probITM:number; probOTM:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spot:undefined as unknown as number,strike:undefined as unknown as number,rate:undefined as unknown as number,volatility:undefined as unknown as number,timeYears:undefined as unknown as number,optionType:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.spot===undefined||v.strike===undefined||v.rate===undefined||v.volatility===undefined||v.timeYears===undefined||v.optionType===undefined){ setResult(null); return; }
    const r=v.rate/100; const sig=v.volatility/100;
    if(sig===0||v.timeYears===0){ setResult({probITM:NaN,probOTM:NaN,interpretation:'Invalid inputs.',suggestions:[]}); return; }
    const d2=(Math.log(v.spot/v.strike)+(r-0.5*sig*sig)*v.timeYears)/(sig*Math.sqrt(v.timeYears));
    const probITM=v.optionType==='call'?normCdf(d2):normCdf(-d2);
    const probOTM=1-probITM;
    const interp=`Probability ${v.optionType==='call'?'spot>strike':'spot<strike'} at expiry is ${(probITM*100).toFixed(2)}%.`;
    setResult({probITM,probOTM,interpretation:interp,suggestions:['Uses risk-neutral measure; not a prediction of actual probability.','Compare to historical realized ITM rates for context.','Adjust for dividends if applicable in equity options.','Use current implied volatility from option prices for accuracy.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Probability of Expiring ITM (Options) Calculator</CardTitle>
          <CardDescription>Estimate risk-neutral probability that an option expires in-the-money.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spot" render={({field})=>(<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="strike" render={({field})=>(<FormItem><FormLabel>Strike Price</FormLabel><FormControl>{num('e.g., 105',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="rate" render={({field})=>(<FormItem><FormLabel>Risk-free Rate (%)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="volatility" render={({field})=>(<FormItem><FormLabel>Volatility (%)</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Expiry (years)</FormLabel><FormControl>{num('e.g., 0.25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="optionType" render={({field})=>(<FormItem><FormLabel>Option Type</FormLabel><FormControl><Input placeholder="call or put" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ITM probability</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Probability ITM</p><p className="text-2xl font-bold">{Number.isFinite(result.probITM)?(result.probITM*100).toFixed(2):'N/A'}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Probability OTM</p><p className="text-2xl font-bold">{Number.isFinite(result.probOTM)?(result.probOTM*100).toFixed(2):'N/A'}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Options strategies</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Theoretical option pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-greeks-calculator" className="text-primary hover:underline">Option Greeks Calculator</a></h4><p className="text-sm text-muted-foreground">Risk sensitivities.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-payoff-calculator" className="text-primary hover:underline">Option Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Scenario analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/implied-volatility-calculator" className="text-primary hover:underline">Implied Volatility Calculator</a></h4><p className="text-sm text-muted-foreground">Volatility inputs.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to ITM Probability</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain risk-neutral vs physical probabilities and N(d2) interpretation.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>ITM probability basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is ITM probability?</h4><p className="text-muted-foreground">The risk-neutral probability that an option expires in-the-money under Black–Scholes assumptions.</p></div>
          <div><h4 className="font-semibold mb-2">Is this the real-world probability?</h4><p className="text-muted-foreground">No—risk-neutral probabilities differ from physical probabilities due to risk premiums.</p></div>
          <div><h4 className="font-semibold mb-2">Which volatility should I use?</h4><p className="text-muted-foreground">Use implied volatility from option prices for pricing consistency; historical vol for different analysis.</p></div>
          <div><h4 className="font-semibold mb-2">Does time decay affect probability?</h4><p className="text-muted-foreground">Yes—probability changes as time passes and spot moves, assuming constant vol.</p></div>
          <div><h4 className="font-semibold mb-2">What if probability is 50%?</h4><p className="text-muted-foreground">Typically indicates an at-the-money option; probability depends on drift and volatility.</p></div>
          <div><h4 className="font-semibold mb-2">Can I sum probabilities?</h4><p className="text-muted-foreground">Not directly—probabilities are conditional on inputs; changing strikes or times requires recalculation.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is this for exotic options?</h4><p className="text-muted-foreground">Less accurate—barriers and path-dependence require different models.</p></div>
          <div><h4 className="font-semibold mb-2">What about dividends?</h4><p className="text-muted-foreground">Dividends reduce forward price; adjust spot or use dividend-adjusted models for equity options.</p></div>
          <div><h4 className="font-semibold mb-2">Why use d2 instead of d1?</h4><p className="text-muted-foreground">N(d2) gives ITM probability in risk-neutral measure; N(d1) relates to delta hedging.</p></div>
          <div><h4 className="font-semibold mb-2">Does this help with position sizing?</h4><p className="text-muted-foreground">Yes—combine with payoff analysis to estimate expected value and risk for strategy design.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


