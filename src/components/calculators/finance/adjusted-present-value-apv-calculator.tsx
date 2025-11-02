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
  baseNPV: z.number().optional(),
  debtAmount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  costOfDebt: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdjustedPresentValueAPVCalculator() {
  const [result,setResult]=useState<{apv:number; taxShieldPV:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{baseNPV:undefined as unknown as number,debtAmount:undefined as unknown as number,taxRate:undefined as unknown as number,costOfDebt:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.baseNPV===undefined||v.debtAmount===undefined||v.taxRate===undefined||v.costOfDebt===undefined){ setResult(null); return; }
    const r=v.costOfDebt/100; const t=v.taxRate/100;
    const tsPV=v.debtAmount*t;
    const apv=v.baseNPV+tsPV;
    const interp=`APV: ${apv.toFixed(2)}. Base NPV: ${v.baseNPV.toFixed(2)}, Tax shield value: ${tsPV.toFixed(2)}.`;
    setResult({apv,taxShieldPV:tsPV,interpretation:interp,suggestions:['APV separates operating value from financing benefits.','Tax shield assumes perpetual debt or constant leverage; adjust for changing debt.','Base NPV uses unlevered cost of equity (no debt risk).','Use APV when leverage changes over project life or when WACC is difficult to estimate.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Adjusted Present Value (APV) Calculator</CardTitle>
          <CardDescription>Calculate APV by adding tax shield value to base NPV for projects with financing effects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="baseNPV" render={({field})=>(<FormItem><FormLabel>Base NPV (Unlevered)</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debtAmount" render={({field})=>(<FormItem><FormLabel>Debt Amount</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="taxRate" render={({field})=>(<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="costOfDebt" render={({field})=>(<FormItem><FormLabel>Cost of Debt (%)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>APV analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Adjusted Present Value</p><p className={`text-2xl font-bold ${result.apv>=0?'text-green-600':'text-red-600'}`}>{result.apv.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Tax Shield PV</p><p className="text-2xl font-bold">{result.taxShieldPV.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Valuation methods</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4><p className="text-sm text-muted-foreground">Base valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Alternative discount rate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">Payback Period Calculator</a></h4><p className="text-sm text-muted-foreground">Investment recovery.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value Calculator</a></h4><p className="text-sm text-muted-foreground">Discounting.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Adjusted Present Value</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain APV formula, tax shields, and when to use APV vs WACC.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>APV valuation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is Adjusted Present Value?</h4><p className="text-muted-foreground">Valuation method separating operating value (unlevered NPV) from financing benefits (tax shields).</p></div>
          <div><h4 className="font-semibold mb-2">How does APV differ from NPV?</h4><p className="text-muted-foreground">NPV uses WACC; APV uses unlevered cost of equity and adds tax shield value separately.</p></div>
          <div><h4 className="font-semibold mb-2">What is the tax shield?</h4><p className="text-muted-foreground">Value of interest tax deductions; equals debt amount × tax rate for perpetual debt.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use APV?</h4><p className="text-muted-foreground">When leverage changes over time, WACC is hard to estimate, or analyzing different financing scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate base NPV?</h4><p className="text-muted-foreground">Use unlevered free cash flows discounted at unlevered cost of equity (or asset beta).</p></div>
          <div><h4 className="font-semibold mb-2">What if debt changes over time?</h4><p className="text-muted-foreground">Calculate tax shield PV year-by-year; discount each year's shield at cost of debt.</p></div>
          <div><h4 className="font-semibold mb-2">Does APV work for LBOs?</h4><p className="text-muted-foreground">Yes—APV is ideal for leveraged buyouts where debt levels change significantly over time.</p></div>
          <div><h4 className="font-semibold mb-2">What about bankruptcy costs?</h4><p className="text-muted-foreground">Subtract expected bankruptcy costs from APV; increases with leverage and business risk.</p></div>
          <div><h4 className="font-semibold mb-2">Can APV be negative?</h4><p className="text-muted-foreground">Yes—if base NPV is negative and tax shield cannot offset the loss.</p></div>
          <div><h4 className="font-semibold mb-2">How does APV compare to WACC?</h4><p className="text-muted-foreground">Both should give same value if assumptions are consistent; APV is more flexible for changing leverage.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

