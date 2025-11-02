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
  notional: z.number().min(0).optional(),
  fixedRate: z.number().min(-100).max(100).optional(),
  floatingRate: z.number().min(-100).max(100).optional(),
  remainingPeriods: z.number().min(0).optional(),
  discountRate: z.number().min(-100).max(100).optional(),
  swapType: z.enum(['pay-fixed','receive-fixed']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwapValuationPlainVanillaInterestRateSwapCalculator() {
  const [result,setResult]=useState<{swapValue:number; fixedLegPV:number; floatingLegPV:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{notional:undefined as unknown as number,fixedRate:undefined as unknown as number,floatingRate:undefined as unknown as number,remainingPeriods:undefined as unknown as number,discountRate:undefined as unknown as number,swapType:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.notional===undefined||v.fixedRate===undefined||v.floatingRate===undefined||v.remainingPeriods===undefined||v.discountRate===undefined||v.swapType===undefined){ setResult(null); return; }
    const r=v.discountRate/100; const fixed=v.fixedRate/100; const float=v.floatingRate/100;
    const periodPV=(fixed-float)*v.notional/(1+r);
    const fixedPV=v.notional*fixed*v.remainingPeriods/(1+r);
    const floatPV=v.notional*float*v.remainingPeriods/(1+r);
    const val=(v.swapType==='pay-fixed'?-1:1)*(fixedPV-floatPV);
    const interp=`Swap value: ${val>=0?'asset':'liability'} of ${Math.abs(val).toFixed(2)}. Fixed leg PV: ${fixedPV.toFixed(2)}, Floating leg PV: ${floatPV.toFixed(2)}.`;
    setResult({swapValue:val,fixedLegPV:fixedPV,floatingLegPV:floatPV,interpretation:interp,suggestions:['Valuation uses current market rates; update as rates change.','Simplified model; real swaps use actual payment dates and day count.','Floating leg resets periodically; use forward rates for accuracy.','Monitor counterparty credit exposure as swap value changes.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Swap Valuation (Plain Vanilla Interest Rate Swap) Calculator</CardTitle>
          <CardDescription>Estimate current value of an interest rate swap using fixed/floating rates and discount factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="notional" render={({field})=>(<FormItem><FormLabel>Notional Amount</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="fixedRate" render={({field})=>(<FormItem><FormLabel>Fixed Rate (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="floatingRate" render={({field})=>(<FormItem><FormLabel>Floating Rate (%)</FormLabel><FormControl>{num('e.g., 4.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="remainingPeriods" render={({field})=>(<FormItem><FormLabel>Remaining Periods</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="discountRate" render={({field})=>(<FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="swapType" render={({field})=>(<FormItem><FormLabel>Swap Type</FormLabel><FormControl><Input placeholder="pay-fixed or receive-fixed" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Swap valuation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Swap Value</p><p className={`text-2xl font-bold ${result.swapValue>=0?'text-green-600':'text-red-600'}`}>{result.swapValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Fixed Leg PV</p><p className="text-2xl font-bold">{result.fixedLegPV.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Floating Leg PV</p><p className="text-2xl font-bold">{result.floatingLegPV.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Swaps and derivatives</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/swaption-pricing-calculator" className="text-primary hover:underline">Swaption Pricing Calculator</a></h4><p className="text-sm text-muted-foreground">Options on swaps.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value Calculator</a></h4><p className="text-sm text-muted-foreground">Discounting cash flows.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4><p className="text-sm text-muted-foreground">Net present value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/fixed-vs-floating-rate-calculator" className="text-primary hover:underline">Fixed vs Floating Rate</a></h4><p className="text-sm text-muted-foreground">Rate comparisons.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Interest Rate Swap Valuation</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain fixed/floating legs, discounting, and mark-to-market.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Swap valuation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an interest rate swap?</h4><p className="text-muted-foreground">An agreement to exchange fixed-rate payments for floating-rate payments on a notional amount.</p></div>
          <div><h4 className="font-semibold mb-2">How is swap value calculated?</h4><p className="text-muted-foreground">Present value of fixed leg minus present value of floating leg, using current market discount rates.</p></div>
          <div><h4 className="font-semibold mb-2">What does positive value mean?</h4><p className="text-muted-foreground">For pay-fixed swaps: liability when fixed rate exceeds floating; asset when floating exceeds fixed.</p></div>
          <div><h4 className="font-semibold mb-2">Why does floating leg value change?</h4><p className="text-muted-foreground">Floating rate resets periodically; value reflects forward rates implied by yield curve.</p></div>
          <div><h4 className="font-semibold mb-2">Which discount rate to use?</h4><p className="text-muted-foreground">Use risk-free curve matching swap currency and tenor; OIS for USD swaps.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate?</h4><p className="text-muted-foreground">Mark to market daily or when market rates change materially; monitor counterparty exposure.</p></div>
          <div><h4 className="font-semibold mb-2">What about payment frequency?</h4><p className="text-muted-foreground">Semi-annual is common; adjust discount factors and period count to match actual schedule.</p></div>
          <div><h4 className="font-semibold mb-2">Can swaps have negative value?</h4><p className="text-muted-foreground">Yes—value can flip from asset to liability as rates move against the position.</p></div>
          <div><h4 className="font-semibold mb-2">What is credit valuation adjustment?</h4><p className="text-muted-foreground">CVA adjusts swap value for counterparty credit risk; this tool shows risk-free valuation.</p></div>
          <div><h4 className="font-semibold mb-2">How to close a swap early?</h4><p className="text-muted-foreground">Enter offsetting swap or terminate with counterparty; settlement equals current market value.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

