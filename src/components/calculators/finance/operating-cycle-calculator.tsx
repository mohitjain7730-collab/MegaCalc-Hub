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
  daysInventoryOutstanding: z.number().min(0).optional(),
  daysSalesOutstanding: z.number().min(0).optional(),
  daysPayableOutstanding: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingCycleCalculator() {
  const [result,setResult]=useState<{operatingCycle:number; cashConversionCycle:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{daysInventoryOutstanding:undefined as unknown as number,daysSalesOutstanding:undefined as unknown as number,daysPayableOutstanding:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.daysInventoryOutstanding===undefined||v.daysSalesOutstanding===undefined||v.daysPayableOutstanding===undefined){ setResult(null); return; }
    const oc=v.daysInventoryOutstanding + v.daysSalesOutstanding;
    const ccc=oc - v.daysPayableOutstanding;
    const interpretation=`Operating Cycle: ${oc.toFixed(1)} days. Cash Conversion Cycle: ${ccc.toFixed(1)} days.`;
    setResult({operatingCycle:oc,cashConversionCycle:ccc,interpretation,suggestions:[
      'Reduce DIO by improving inventory turns and demand forecasting.',
      'Lower DSO with better credit terms and collections.',
      'Extend DPO responsibly by negotiating supplier terms.',
      'Benchmark CCC against peers and monitor trend monthly.'
    ]});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Operating Cycle Calculator</CardTitle>
          <CardDescription>Calculate operating cycle and cash conversion cycle from DIO, DSO, and DPO.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="daysInventoryOutstanding" render={({field})=>(<FormItem><FormLabel>Days Inventory Outstanding (DIO)</FormLabel><FormControl>{num('e.g., 45',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="daysSalesOutstanding" render={({field})=>(<FormItem><FormLabel>Days Sales Outstanding (DSO)</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="daysPayableOutstanding" render={({field})=>(<FormItem><FormLabel>Days Payable Outstanding (DPO)</FormLabel><FormControl>{num('e.g., 35',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Cycle analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Operating Cycle</p><p className="text-2xl font-bold">{result.operatingCycle.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cash Conversion Cycle</p><p className={`text-2xl font-bold ${result.cashConversionCycle<=0?'text-green-600':result.cashConversionCycle<=45?'text-yellow-600':'text-red-600'}`}>{result.cashConversionCycle.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Working capital</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-requirement-estimator" className="text-primary hover:underline">Working Capital Estimator</a></h4><p className="text-sm text-muted-foreground">Liquidity planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-conversion-cycle-calculator" className="text-primary hover:underline">Cash Conversion Cycle</a></h4><p className="text-sm text-muted-foreground">Cycle metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inventory-turnover-ratio-calculator" className="text-primary hover:underline">Inventory Turnover</a></h4><p className="text-sm text-muted-foreground">Inventory efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/receivables-turnover-calculator" className="text-primary hover:underline">Receivables Turnover</a></h4><p className="text-sm text-muted-foreground">Collection speed.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Operating Cycle</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain operating cycle vs cash conversion cycle and levers: DIO, DSO, DPO.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Operating cycle</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the operating cycle?</h4><p className="text-muted-foreground">Time from purchasing inventory to collecting cash from sales: DIO + DSO.</p></div>
          <div><h4 className="font-semibold mb-2">How is CCC different?</h4><p className="text-muted-foreground">CCC = DIO + DSO - DPO; accounts for payment timing to suppliers.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good CCC?</h4><p className="text-muted-foreground">Varies by industry; lower or negative indicates efficient cash management.</p></div>
          <div><h4 className="font-semibold mb-2">How to reduce DIO?</h4><p className="text-muted-foreground">Improve forecasting, reduce SKUs, and strengthen replenishment cadence.</p></div>
          <div><h4 className="font-semibold mb-2">How to reduce DSO?</h4><p className="text-muted-foreground">Tighten credit terms, automate invoicing, and follow up promptly.</p></div>
          <div><h4 className="font-semibold mb-2">How to optimize DPO?</h4><p className="text-muted-foreground">Negotiate terms without harming supplier relationships; balance discounts vs float.</p></div>
          <div><h4 className="font-semibold mb-2">Why track monthly?</h4><p className="text-muted-foreground">Cycles change with seasonality and growth; monthly tracking reveals trends.</p></div>
          <div><h4 className="font-semibold mb-2">Can CCC be negative?</h4><p className="text-muted-foreground">Yes; strong bargaining power or subscription models may collect before paying suppliers.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



