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
  futuresPrice: z.number().min(0).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  costOfCarry: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesBasisCalculator() {
  const [result,setResult]=useState<{basis:number; basisPct:number; theoreticalFutures:number; convergence:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spotPrice:undefined as unknown as number,futuresPrice:undefined as unknown as number,timeYears:undefined as unknown as number,costOfCarry:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.spotPrice===undefined||v.futuresPrice===undefined||v.timeYears===undefined||v.costOfCarry===undefined){ setResult(null); return; }
    const basis=v.futuresPrice-v.spotPrice;
    const basisPct=(basis/v.spotPrice)*100;
    const theo=v.spotPrice*(1+v.costOfCarry*v.timeYears/100);
    const conv=Math.abs(v.futuresPrice-theo);
    const interp=basis>0?`Contango: futures above spot.`:basis<0?`Backwardation: futures below spot.`:`At parity: no basis.`;
    setResult({basis,basisPct,theoreticalFutures:theo,convergence:conv,interpretation:interp,suggestions:['Basis converges to zero at delivery (spot=futures).','Cost of carry includes financing, storage, dividends, convenience yield.','Negative basis (backwardation) may signal supply tightness.','Monitor basis changes for arbitrage opportunities.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Futures Basis Calculator</CardTitle>
          <CardDescription>Calculate basis (futures minus spot) and compare to theoretical pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="spotPrice" render={({field})=>(<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="futuresPrice" render={({field})=>(<FormItem><FormLabel>Futures Price</FormLabel><FormControl>{num('e.g., 101.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Delivery (years)</FormLabel><FormControl>{num('e.g., 0.25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="costOfCarry" render={({field})=>(<FormItem><FormLabel>Cost of Carry (%/year)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Basis analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Basis</p><p className={`text-2xl font-bold ${result.basis>=0?'text-green-600':'text-red-600'}`}>{result.basis.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Basis %</p><p className={`text-2xl font-bold ${result.basisPct>=0?'text-green-600':'text-red-600'}`}>{result.basisPct.toFixed(3)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Theoretical Futures</p><p className="text-2xl font-bold">{result.theoreticalFutures.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Convergence Gap</p><p className="text-2xl font-bold">{result.convergence.toFixed(4)}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Futures and pricing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-margin-requirement-calculator" className="text-primary hover:underline">Futures Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin requirements.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/convexity-adjustment-bond-futures-calculator" className="text-primary hover:underline">Convexity Adjustment</a></h4><p className="text-sm text-muted-foreground">Futures vs forwards.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward pricing theory.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/purchasing-power-parity-calculator" className="text-primary hover:underline">Purchasing Power Parity</a></h4><p className="text-sm text-muted-foreground">Long-run fair value.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Futures Basis</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain contango, backwardation, cost of carry, and convergence.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Basis and futures pricing</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is futures basis?</h4><p className="text-muted-foreground">The difference between futures price and spot price; positive is contango, negative is backwardation.</p></div>
          <div><h4 className="font-semibold mb-2">Why does basis exist?</h4><p className="text-muted-foreground">Due to cost of carry (financing, storage), convenience yield, and supply/demand imbalances.</p></div>
          <div><h4 className="font-semibold mb-2">What is contango?</h4><p className="text-muted-foreground">Futures above spot; common in commodities with storage costs or when rates exceed convenience yield.</p></div>
          <div><h4 className="font-semibold mb-2">What is backwardation?</h4><p className="text-muted-foreground">Futures below spot; may signal supply tightness or high convenience yield.</p></div>
          <div><h4 className="font-semibold mb-2">Does basis converge?</h4><p className="text-muted-foreground">Yes—basis should converge to zero at delivery as spot and futures prices align.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate cost of carry?</h4><p className="text-muted-foreground">Include financing rate, storage costs, insurance, minus dividends/convenience yield for commodities.</p></div>
          <div><h4 className="font-semibold mb-2">Can basis be negative?</h4><p className="text-muted-foreground">Yes—backwardation creates negative basis, especially near delivery or in supply-constrained markets.</p></div>
          <div><h4 className="font-semibold mb-2">Does basis predict direction?</h4><p className="text-muted-foreground">Not directly; basis reflects carry and structure, not necessarily spot price direction.</p></div>
          <div><h4 className="font-semibold mb-2">How to trade basis?</h4><p className="text-muted-foreground">Arbitrage when basis deviates from cost of carry; calendar spreads capture basis changes.</p></div>
          <div><h4 className="font-semibold mb-2">What about delivery?</h4><p className="text-muted-foreground">Physical delivery forces convergence; cash-settled contracts converge via final settlement price.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


