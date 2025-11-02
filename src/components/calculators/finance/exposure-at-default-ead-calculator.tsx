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
  drawnAmount: z.number().min(0).optional(),
  commitment: z.number().min(0).optional(),
  usageGivenDefault: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExposureAtDefaultEADCalculator() {
  const [result,setResult]=useState<{ead:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{drawnAmount:undefined as unknown as number,commitment:undefined as unknown as number,usageGivenDefault:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.drawnAmount===undefined||v.commitment===undefined||v.usageGivenDefault===undefined){ setResult(null); return; }
    const ead=v.drawnAmount+(v.commitment-v.drawnAmount)*(v.usageGivenDefault/100);
    const interp=`Exposure at default: ${ead.toFixed(2)}. Includes drawn ${v.drawnAmount.toFixed(2)} plus ${(v.usageGivenDefault).toFixed(1)}% of undrawn commitment.`;
    setResult({ead,interpretation:interp,suggestions:['EAD captures both drawn amounts and potential future draws.','Use credit conversion factors (CCF) for undrawn commitments.','Regulatory CCF varies by product: 75% for credit lines, lower for other commitments.','Update EAD as commitments are drawn or cancelled.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Exposure at Default (EAD) Calculator</CardTitle>
          <CardDescription>Estimate total exposure at default including drawn amounts and undrawn commitments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="drawnAmount" render={({field})=>(<FormItem><FormLabel>Drawn Amount</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="commitment" render={({field})=>(<FormItem><FormLabel>Total Commitment</FormLabel><FormControl>{num('e.g., 1000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="usageGivenDefault" render={({field})=>(<FormItem><FormLabel>Usage Given Default (%)</FormLabel><FormControl>{num('e.g., 75',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>EAD calculation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Exposure at Default (EAD)</p><p className="text-2xl font-bold">{result.ead.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Credit risk components</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-risk-expected-loss-calculator" className="text-primary hover:underline">Expected Loss Calculator</a></h4><p className="text-sm text-muted-foreground">EAD × PD × LGD.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/probability-of-default-pd-estimator" className="text-primary hover:underline">Probability of Default Estimator</a></h4><p className="text-sm text-muted-foreground">PD estimation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loss-given-default-lgd-calculator" className="text-primary hover:underline">Loss Given Default Calculator</a></h4><p className="text-sm text-muted-foreground">LGD calculation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">Debt-to-Equity Ratio</a></h4><p className="text-sm text-muted-foreground">Leverage context.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Exposure at Default</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain drawn vs undrawn, credit conversion factors, and regulatory treatment.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>EAD basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is exposure at default?</h4><p className="text-muted-foreground">Total amount owed or potentially drawn at the time of default, including drawn and undrawn commitments.</p></div>
          <div><h4 className="font-semibold mb-2">Why include undrawn commitments?</h4><p className="text-muted-foreground">Borrowers often draw down credit lines when in distress, increasing exposure beyond current drawn amounts.</p></div>
          <div><h4 className="font-semibold mb-2">What is a credit conversion factor?</h4><p className="text-muted-foreground">Percentage of undrawn commitment assumed to be drawn at default; regulatory standards vary by product type.</p></div>
          <div><h4 className="font-semibold mb-2">How do CCFs differ by product?</h4><p className="text-muted-foreground">Revolving credit lines: 75% CCF; trade finance: lower CCF; commitments with conditions: case-by-case.</p></div>
          <div><h4 className="font-semibold mb-2">Does EAD change over time?</h4><p className="text-muted-foreground">Yes—as commitments are drawn, cancelled, or limits change, EAD updates accordingly.</p></div>
          <div><h4 className="font-semibold mb-2">What about off-balance-sheet items?</h4><p className="text-muted-foreground">Guarantees, letters of credit, and derivatives require specific EAD calculation methods per regulation.</p></div>
          <div><h4 className="font-semibold mb-2">How to estimate usage given default?</h4><p className="text-muted-foreground">Use historical drawdown patterns, internal models, or regulatory benchmarks (e.g., Basel CCF tables).</p></div>
          <div><h4 className="font-semibold mb-2">Does collateral reduce EAD?</h4><p className="text-muted-foreground">No—EAD is gross exposure; collateral affects LGD (loss given default), not EAD.</p></div>
          <div><h4 className="font-semibold mb-2">What about derivatives?</h4><p className="text-muted-foreground">Derivatives use replacement cost plus potential future exposure (PFE) based on mark-to-market and add-ons.</p></div>
          <div><h4 className="font-semibold mb-2">How does EAD relate to credit limits?</h4><p className="text-muted-foreground">EAD should not exceed committed limits; monitor undrawn amounts for CCF application.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

