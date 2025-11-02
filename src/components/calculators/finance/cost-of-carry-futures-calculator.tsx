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
  riskFreeRate: z.number().min(-100).max(100).optional(),
  storageCost: z.number().min(0).optional(),
  convenienceYield: z.number().min(0).optional(),
  dividendYield: z.number().min(0).optional(),
  timeYears: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfCarryFuturesCalculator() {
  const [result,setResult]=useState<{costOfCarry:number; theoreticalFutures:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{spotPrice:undefined as unknown as number,riskFreeRate:undefined as unknown as number,storageCost:undefined as unknown as number,convenienceYield:undefined as unknown as number,dividendYield:undefined as unknown as number,timeYears:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.spotPrice===undefined||v.riskFreeRate===undefined||v.storageCost===undefined||v.convenienceYield===undefined||v.dividendYield===undefined||v.timeYears===undefined){ setResult(null); return; }
    const r=v.riskFreeRate/100; const s=v.storageCost/100; const y=v.convenienceYield/100; const d=v.dividendYield/100;
    const carry=(r+s-y-d)*v.timeYears;
    const theo=v.spotPrice*Math.exp(carry);
    const interp=`Cost of carry is ${(carry*100).toFixed(3)}% over ${v.timeYears} years. Theoretical futures: ${theo.toFixed(2)}.`;
    setResult({costOfCarry:carry*100,theoreticalFutures:theo,interpretation:interp,suggestions:['Include all costs: financing, storage, insurance minus convenience yield.','Use continuously compounded rates for precision.','Adjust for dividends in equity futures.','Compare theoretical to market price to identify arbitrage.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Cost of Carry (Futures) Calculator</CardTitle>
          <CardDescription>Compute cost of carry and theoretical futures price from spot, rates, storage, and yields.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spotPrice" render={({field})=>(<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="riskFreeRate" render={({field})=>(<FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="storageCost" render={({field})=>(<FormItem><FormLabel>Storage Cost (%/year)</FormLabel><FormControl>{num('e.g., 1',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="convenienceYield" render={({field})=>(<FormItem><FormLabel>Convenience Yield (%/year)</FormLabel><FormControl>{num('e.g., 0.5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="dividendYield" render={({field})=>(<FormItem><FormLabel>Dividend Yield (%/year)</FormLabel><FormControl>{num('e.g., 2',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({field})=>(<FormItem><FormLabel>Time to Delivery (years)</FormLabel><FormControl>{num('e.g., 0.25',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Cost of carry analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cost of Carry (%)</p><p className="text-2xl font-bold">{result.costOfCarry.toFixed(3)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Theoretical Futures Price</p><p className="text-2xl font-bold">{result.theoreticalFutures.toFixed(4)}</p></div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-basis-calculator" className="text-primary hover:underline">Futures Basis Calculator</a></h4><p className="text-sm text-muted-foreground">Basis vs spot.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Forward pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-margin-requirement-calculator" className="text-primary hover:underline">Futures Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin requirements.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value Calculator</a></h4><p className="text-sm text-muted-foreground">Time value of money.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Cost of Carry</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain components: financing, storage, convenience yield, and dividends.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Cost of carry basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is cost of carry?</h4><p className="text-muted-foreground">The net cost to hold an asset until delivery, including financing, storage, and yield components.</p></div>
          <div><h4 className="font-semibold mb-2">What contributes to cost of carry?</h4><p className="text-muted-foreground">Risk-free rate (financing), storage costs, minus convenience yield and dividend yield.</p></div>
          <div><h4 className="font-semibold mb-2">What is convenience yield?</h4><p className="text-muted-foreground">Benefit of holding physical commodity (e.g., avoiding stockouts); reduces cost of carry.</p></div>
          <div><h4 className="font-semibold mb-2">How does storage cost vary?</h4><p className="text-muted-foreground">Depends on commodity: perishables have high storage; financials have minimal storage costs.</p></div>
          <div><h4 className="font-semibold mb-2">Does this apply to all futures?</h4><p className="text-muted-foreground">Yes, but components differ: equity futures focus on dividends; commodities on storage/convenience.</p></div>
          <div><h4 className="font-semibold mb-2">How to annualize costs?</h4><p className="text-muted-foreground">Express all components as annual percentages; multiply by time to delivery for total carry.</p></div>
          <div><h4 className="font-semibold mb-2">Can cost of carry be negative?</h4><p className="text-muted-foreground">Yes—when convenience yield or dividends exceed financing plus storage, creating backwardation.</p></div>
          <div><h4 className="font-semibold mb-2">How does this relate to contango?</h4><p className="text-muted-foreground">Positive cost of carry creates contango; negative carry supports backwardation.</p></div>
          <div><h4 className="font-semibold mb-2">What about currency futures?</h4><p className="text-muted-foreground">Use interest rate differential (domestic minus foreign) as the primary cost component.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is the theoretical price?</h4><p className="text-muted-foreground">Depends on input accuracy; market prices can deviate due to liquidity, risk premiums, or arbitrage frictions.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
