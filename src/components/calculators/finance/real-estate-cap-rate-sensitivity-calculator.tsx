'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Activity } from 'lucide-react';

const formSchema = z.object({
  noiAnnual: z.number().min(0).optional(),
  currentCapRatePct: z.number().min(0).max(50).optional(),
  scenarioChangeBps: z.number().min(-1000).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapRateSensitivityCalculator(){
  const [result,setResult]=useState<null|{valueNow:number; valueScenario:number; interpretation:string}>(null);
  const [whatIfBps,setWhatIfBps]=useState<number|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema), defaultValues:{noiAnnual:undefined as unknown as number, currentCapRatePct:undefined as unknown as number, scenarioChangeBps:undefined as unknown as number}});
  const num=(ph:string,field:any)=>(<Input type="number" step="0.01" placeholder={ph} {...field} value={Number.isFinite(field.value as any)?(field.value as any):''} onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}} />);

  const capToValue=(noi:number, capPct:number)=> capPct>0? noi/(capPct/100) : 0;

  const onSubmit=(v:FormValues)=>{
    if(v.noiAnnual===undefined||v.currentCapRatePct===undefined){ setResult(null); return; }
    const valueNow=capToValue(v.noiAnnual, v.currentCapRatePct);
    const bps=v.scenarioChangeBps||0; const newCap=v.currentCapRatePct + bps/100;
    const valueScenario= newCap>0? capToValue(v.noiAnnual,newCap):0;
    const delta=valueScenario - valueNow;
    const interp=`At ${v.currentCapRatePct?.toFixed(2)}% cap, value ≈ $${valueNow.toFixed(0)}. A ${bps>=0?'+':''}${bps} bps change to ${newCap.toFixed(2)}% implies value ≈ $${valueScenario.toFixed(0)} (${delta>=0?'+':''}${delta.toFixed(0)}).`;
    setResult({valueNow, valueScenario, interpretation:interp});
  };

  const quick=(bps:number)=>{
    const noi=(form.getValues('noiAnnual')||0); const cap=(form.getValues('currentCapRatePct')||0)+bps/100; return cap>0? capToValue(noi,cap):0;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Real Estate Sensitivity (Cap Rate Change) Calculator</CardTitle>
          <CardDescription>Estimate value impact when cap rates move by selected basis points.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="noiAnnual" render={({field})=>(<FormItem><FormLabel>NOI (annual $)</FormLabel><FormControl>{num('e.g., 120000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentCapRatePct" render={({field})=>(<FormItem><FormLabel>Current Cap Rate (%)</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenarioChangeBps" render={({field})=>(<FormItem><FormLabel>Scenario Change (bps)</FormLabel><FormControl>{num('e.g., +50 or -50',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <CardDescription>Quick basis‑point scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Current Value</div><div className="text-2xl font-semibold">${result.valueNow.toFixed(0)}</div></div>
              <div><div className="text-sm text-muted-foreground">Scenario Value</div><div className="text-2xl font-semibold">${result.valueScenario.toFixed(0)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What‑if: Cap Rate Move</div>
              <div className="flex flex-wrap gap-2">
                {[-100,-50,0,50,100].map(bps => (
                  <Button key={bps} variant={(whatIfBps===bps)?'default':'secondary'} onClick={()=>setWhatIfBps(bps)}>{bps>0?`+${bps}`:bps} bps</Button>
                ))}
              </div>
              {whatIfBps!==null && (
                <div className="mt-2 text-sm">At {((form.getValues('currentCapRatePct')||0)+(whatIfBps/100)).toFixed(2)}% cap, value ≈ ${quick(whatIfBps).toFixed(0)}.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Real‑estate valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rental-yield-calculator" className="text-primary hover:underline">Rental Yield</a></h4><p className="text-sm text-muted-foreground">Income return estimate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-rent-multiplier-grm-calculator" className="text-primary hover:underline">Gross Rent Multiplier (GRM)</a></h4><p className="text-sm text-muted-foreground">Price vs rent.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dscr-calculator" className="text-primary hover:underline">DSCR</a></h4><p className="text-sm text-muted-foreground">Debt service coverage.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/property-appreciation-projection-calculator" className="text-primary hover:underline">Property Appreciation</a></h4><p className="text-sm text-muted-foreground">Future value projection.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Best practices for modeling cap‑rate moves</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Pair cap‑rate scenarios with NOI growth assumptions to see combined effects.</li>
            <li>Use basis‑point steps (25–100 bps) that reflect current market volatility.</li>
            <li>Stress test financing: higher rates can reduce NOI via interest expense.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑friendly answers on cap rate and valuation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a cap rate?</h4><p className="text-muted-foreground">Capitalization rate equals NOI divided by market value. It is a shorthand for pricing income‑producing property.</p></div>
          <div><h4 className="font-semibold mb-2">Why do small cap‑rate moves change value so much?</h4><p className="text-muted-foreground">Value is inversely related to cap rate. A 50 bps change can swing value by 8–10% around common ranges.</p></div>
          <div><h4 className="font-semibold mb-2">Are cap rates the same across property types?</h4><p className="text-muted-foreground">No—multifamily, office, retail, and industrial each have distinct cap‑rate ranges based on risk and growth expectations.</p></div>
          <div><h4 className="font-semibold mb-2">How do interest rates affect cap rates?</h4><p className="text-muted-foreground">Higher funding costs generally pressure cap rates higher (values lower), but supply/demand and rent growth also matter.</p></div>
          <div><h4 className="font-semibold mb-2">Does NOI growth offset cap‑rate expansion?</h4><p className="text-muted-foreground">Yes—rising NOI can partly offset valuation pressure from higher cap rates. Model both drivers together.</p></div>
          <div><h4 className="font-semibold mb-2">Are cap rates pre‑tax?</h4><p className="text-muted-foreground">Yes—cap rates use NOI before financing and taxes to compare properties consistently.</p></div>
          <div><h4 className="font-semibold mb-2">What is a basis point (bps)?</h4><p className="text-muted-foreground">One basis point is 0.01%. A 50 bps move equals 0.50 percentage points.</p></div>
          <div><h4 className="font-semibold mb-2">Which cap rate should I use?</h4><p className="text-muted-foreground">Use current market comps for similar assets, location, lease terms, and risk profile.</p></div>
          <div><h4 className="font-semibold mb-2">How do renovations impact cap rate?</h4><p className="text-muted-foreground">Stabilized NOI and perceived risk change with renovations; markets may accept lower cap rates for higher‑quality, durable income.</p></div>
          <div><h4 className="font-semibold mb-2">Is terminal cap rate different?</h4><p className="text-muted-foreground">Yes—pro formas often assume a different exit (terminal) cap rate to reflect future market uncertainty.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
