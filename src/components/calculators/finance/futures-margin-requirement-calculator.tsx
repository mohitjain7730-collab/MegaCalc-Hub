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
  contractSize: z.number().min(0).optional(),
  futuresPrice: z.number().min(0).optional(),
  initialMarginPct: z.number().min(0).max(100).optional(),
  maintenanceMarginPct: z.number().min(0).max(100).optional(),
  contracts: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesMarginRequirementCalculator() {
  const [result,setResult]=useState<{initialMargin:number; maintenanceMargin:number; notional:number; marginRatio:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{contractSize:undefined as unknown as number,futuresPrice:undefined as unknown as number,initialMarginPct:undefined as unknown as number,maintenanceMarginPct:undefined as unknown as number,contracts:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.contractSize===undefined||v.futuresPrice===undefined||v.initialMarginPct===undefined||v.maintenanceMarginPct===undefined||v.contracts===undefined){ setResult(null); return; }
    const notional=v.contractSize*v.futuresPrice*v.contracts;
    const init=notional*(v.initialMarginPct/100);
    const maint=notional*(v.maintenanceMarginPct/100);
    const ratio=(init/notional)*100;
    const interp=`Initial margin: ${init.toFixed(2)}; maintenance: ${maint.toFixed(2)}. Notional: ${notional.toFixed(2)}.`;
    setResult({initialMargin:init,maintenanceMargin:maint,notional,marginRatio:ratio,interpretation:interp,suggestions:['Margin requirements vary by exchange and contract specifications.','Monitor account equity to avoid maintenance margin calls.','Consider SPAN margins for portfolio offsets.','Add buffer above minimum to reduce liquidation risk.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Futures Margin Requirement Calculator</CardTitle>
          <CardDescription>Estimate initial and maintenance margin requirements for futures positions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="contractSize" render={({field})=>(<FormItem><FormLabel>Contract Size (units)</FormLabel><FormControl>{num('e.g., 100',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="futuresPrice" render={({field})=>(<FormItem><FormLabel>Futures Price</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="initialMarginPct" render={({field})=>(<FormItem><FormLabel>Initial Margin (%)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="maintenanceMarginPct" render={({field})=>(<FormItem><FormLabel>Maintenance Margin (%)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="contracts" render={({field})=>(<FormItem><FormLabel>Number of Contracts</FormLabel><FormControl>{num('e.g., 2',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Margin requirements</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Initial Margin</p><p className="text-2xl font-bold">{result.initialMargin.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Maintenance Margin</p><p className="text-2xl font-bold">{result.maintenanceMargin.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Notional Value</p><p className="text-2xl font-bold">{result.notional.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Margin Ratio</p><p className="text-2xl font-bold">{result.marginRatio.toFixed(2)}%</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Futures and derivatives</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-basis-calculator" className="text-primary hover:underline">Futures Basis Calculator</a></h4><p className="text-sm text-muted-foreground">Spot vs futures pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/convexity-adjustment-bond-futures-calculator" className="text-primary hover:underline">Convexity Adjustment</a></h4><p className="text-sm text-muted-foreground">Futures vs forwards.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-price-calculator" className="text-primary hover:underline">Bond Price Calculator</a></h4><p className="text-sm text-muted-foreground">Underlying pricing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Position risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Futures Margin</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain initial vs maintenance, SPAN margins, and margin calls.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Futures margin</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is initial margin?</h4><p className="text-muted-foreground">The amount required to open a futures position, typically 5–15% of contract value.</p></div>
          <div><h4 className="font-semibold mb-2">What is maintenance margin?</h4><p className="text-muted-foreground">The minimum equity level to keep the position open; below this triggers a margin call.</p></div>
          <div><h4 className="font-semibold mb-2">How do exchanges set margins?</h4><p className="text-muted-foreground">Based on historical volatility, contract specs, and risk models (e.g., SPAN for portfolios).</p></div>
          <div><h4 className="font-semibold mb-2">Can margins change?</h4><p className="text-muted-foreground">Yes—exchanges adjust margins based on market conditions, especially during volatility spikes.</p></div>
          <div><h4 className="font-semibold mb-2">What happens at margin call?</h4><p className="text-muted-foreground">You must deposit funds to restore maintenance margin or the broker may liquidate positions.</p></div>
          <div><h4 className="font-semibold mb-2">How to reduce margin needs?</h4><p className="text-muted-foreground">Use offsetting positions for portfolio margins; some exchanges offer spread margins for hedges.</p></div>
          <div><h4 className="font-semibold mb-2">Does leverage amplify risk?</h4><p className="text-muted-foreground">Yes—high leverage means small price moves can trigger large losses relative to margin.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use securities as margin?</h4><p className="text-muted-foreground">Some brokers accept securities collateral; check eligibility and haircuts.</p></div>
          <div><h4 className="font-semibold mb-2">What is SPAN margin?</h4><p className="text-muted-foreground">Portfolio-based margin that considers offsetting positions to reduce total requirement.</p></div>
          <div><h4 className="font-semibold mb-2">How to monitor margin?</h4><p className="text-muted-foreground">Track account equity daily; maintain buffer above maintenance to avoid calls.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

