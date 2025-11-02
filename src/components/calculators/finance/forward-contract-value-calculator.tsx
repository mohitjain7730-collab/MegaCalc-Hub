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
  spotPrice: z.number().min(0).optional(),
  forwardPrice: z.number().min(0).optional(),
  riskFreeRate: z.number().min(-100).max(100).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  contractType: z.enum(['long','short']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForwardContractValueCalculator() {
  const [result,setResult]=useState<{contractValue:number; pvOfForward:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spotPrice:undefined as unknown as number,forwardPrice:undefined as unknown as number,riskFreeRate:undefined as unknown as number,timeYears:undefined as unknown as number,contractType:undefined}});

  const onSubmit=(v:FormValues)=>{
    if(v.spotPrice===undefined||v.forwardPrice===undefined||v.riskFreeRate===undefined||v.timeYears===undefined||v.contractType===undefined){ setResult(null); return; }
    const r=v.riskFreeRate/100;
    const pvFwd=v.forwardPrice*Math.exp(-r*v.timeYears);
    const val=(v.contractType==='long'?1:-1)*(v.spotPrice-pvFwd);
    const interp=`Current value of ${v.contractType} forward: ${val>=0?'profit':'loss'} of ${Math.abs(val).toFixed(4)}.`;
    setResult({contractValue:val,pvOfForward:pvFwd,interpretation:interp,suggestions:['Forward value changes as spot moves relative to locked-in forward price.','Value converges to (spot - forward) at delivery.','Include discounting for time value when valuing before delivery.','Monitor counterparty credit risk in OTC forwards.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Forward Contract Value Calculator</CardTitle>
          <CardDescription>Compute current value of a forward contract from spot, forward price, rate, and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="spotPrice" render={({field})=>(<FormItem><FormLabel>Current Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="forwardPrice" render={({field})=>(<FormItem><FormLabel>Forward Price (locked)</FormLabel><FormControl>{num('e.g., 102',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="riskFreeRate" render={({field})=>(<FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Delivery (years)</FormLabel><FormControl>{num('e.g., 0.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="contractType" render={({field})=>(<FormItem><FormLabel>Position</FormLabel><FormControl><Input placeholder="long or short" {...field as any} value={field.value??''} onChange={e=>field.onChange((e.target.value as any)||undefined)} /></FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Forward contract valuation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contract Value</p><p className={`text-2xl font-bold ${result.contractValue>=0?'text-green-600':'text-red-600'}`}>{result.contractValue.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">PV of Forward</p><p className="text-2xl font-bold">{result.pvOfForward.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Forwards and derivatives</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-basis-calculator" className="text-primary hover:underline">Futures Basis Calculator</a></h4><p className="text-sm text-muted-foreground">Futures vs spot.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cost-of-carry-futures-calculator" className="text-primary hover:underline">Cost of Carry Calculator</a></h4><p className="text-sm text-muted-foreground">Pricing components.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value Calculator</a></h4><p className="text-sm text-muted-foreground">Discounting.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward pricing.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Forward Contract Valuation</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain valuation formula and mark-to-market mechanics.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Forward contract valuation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is forward contract value?</h4><p className="text-muted-foreground">The current mark-to-market value of a forward position, comparing spot to discounted forward price.</p></div>
          <div><h4 className="font-semibold mb-2">How is it different from futures?</h4><p className="text-muted-foreground">Forwards are OTC and not marked to market daily; futures are exchange-traded with daily settlement.</p></div>
          <div><h4 className="font-semibold mb-2">Why discount the forward price?</h4><p className="text-muted-foreground">To account for time value; delivery occurs in the future, so value today requires present value adjustment.</p></div>
          <div><h4 className="font-semibold mb-2">What if spot equals forward?</h4><p className="text-muted-foreground">Contract value is near zero if rates are low; exact zero only if spot equals PV of forward.</p></div>
          <div><h4 className="font-semibold mb-2">How does time affect value?</h4><p className="text-muted-foreground">As time approaches delivery, discounting effect decreases; value converges to spot minus forward.</p></div>
          <div><h4 className="font-semibold mb-2">What about dividends or yields?</h4><p className="text-muted-foreground">Adjust spot for expected dividends/yields or incorporate into forward price calculation.</p></div>
          <div><h4 className="font-semibold mb-2">Can value be negative?</h4><p className="text-muted-foreground">Yes—for long positions when spot is below forward; for short positions when spot is above forward.</p></div>
          <div><h4 className="font-semibold mb-2">How to hedge forward exposure?</h4><p className="text-muted-foreground">Use offsetting spot positions or futures contracts; delta-hedge with underlying asset.</p></div>
          <div><h4 className="font-semibold mb-2">What risks affect value?</h4><p className="text-muted-foreground">Spot price moves, interest rate changes, counterparty credit risk, and early termination costs.</p></div>
          <div><h4 className="font-semibold mb-2">Is this the same as intrinsic value?</h4><p className="text-muted-foreground">Forward value includes time discounting; intrinsic value at expiry is simply spot minus forward.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
