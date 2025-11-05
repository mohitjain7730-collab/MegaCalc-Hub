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
  invest1: z.number().min(0).optional(),
  return1: z.number().optional(),
  invest2: z.number().min(0).optional(),
  return2: z.number().optional(),
  invest3: z.number().min(0).optional(),
  return3: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ROIByBusinessSegmentCalculator() {
  const [result,setResult]=useState<{segmentRois:(number|null)[]; totalInvestment:number; totalReturn:number; weightedRoi:number|null; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{invest1:undefined as unknown as number,return1:undefined as unknown as number,invest2:undefined as unknown as number,return2:undefined as unknown as number,invest3:undefined as unknown as number,return3:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    const invests=[v.invest1,v.invest2,v.invest3];
    const returns=[v.return1,v.return2,v.return3];
    const segRois=invests.map((inv,idx)=> (inv===undefined||inv===0||returns[idx]===undefined)? null : ((returns[idx]! - inv)/inv)*100);
    const totalInvestment=invests.reduce((s,x)=>s+(x??0),0);
    const totalReturn=returns.reduce((s,x)=>s+(x??0),0);
    const weightedRoi= totalInvestment>0? ((totalReturn - totalInvestment)/totalInvestment)*100 : null;
    const interpretation=`Weighted ROI: ${weightedRoi===null?'-':weightedRoi.toFixed(1)}%.`;
    setResult({segmentRois:segRois,totalInvestment,totalReturn,weightedRoi,interpretation,suggestions:[
      'Allocate capital to segments with consistently higher ROI.',
      'Investigate segments with negative ROI for turnaround or divestment.',
      'Normalize segment ROI by risk and strategic importance.',
      'Track ROI trends quarterly to inform budgeting decisions.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> ROI by Business Segment Calculator</CardTitle>
          <CardDescription>Compute ROI for up to three segments and the overall weighted ROI.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <FormField control={form.control} name="invest1" render={({field})=>(<FormItem><FormLabel>Segment 1 Investment</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="return1" render={({field})=>(<FormItem><FormLabel>Segment 1 Return</FormLabel><FormControl>{num('e.g., 575000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="invest2" render={({field})=>(<FormItem><FormLabel>Segment 2 Investment (optional)</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="return2" render={({field})=>(<FormItem><FormLabel>Segment 2 Return (optional)</FormLabel><FormControl>{num('e.g., 330000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="invest3" render={({field})=>(<FormItem><FormLabel>Segment 3 Investment (optional)</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="return3" render={({field})=>(<FormItem><FormLabel>Segment 3 Return (optional)</FormLabel><FormControl>{num('e.g., 250000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Segment ROI</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Weighted ROI</p><p className={`text-2xl font-bold ${result.weightedRoi!==null && result.weightedRoi>=0?'text-green-600': result.weightedRoi===null?'':'text-red-600'}`}>{result.weightedRoi===null?'-':result.weightedRoi.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Investment</p><p className="text-2xl font-bold">{result.totalInvestment.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Return</p><p className="text-2xl font-bold">{result.totalReturn.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.segmentRois.map((r,i)=> (
                <div key={i} className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Segment {i+1} ROI</p><p className={`text-2xl font-bold ${r!==null && r>=0?'text-green-600': r===null?'':'text-red-600'}`}>{r===null?'-':r.toFixed(1)}%</p></div>
              ))}
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Profitability</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Simple ROI.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin</a></h4><p className="text-sm text-muted-foreground">Operating efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">Net Profit Margin</a></h4><p className="text-sm text-muted-foreground">Net profitability.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Segment ROI</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain segment ROI, allocation pitfalls, and decision uses.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Segment ROI</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How do you define ROI?</h4><p className="text-muted-foreground">(Return − Investment)/Investment × 100%.</p></div>
          <div><h4 className="font-semibold mb-2">What returns to include?</h4><p className="text-muted-foreground">Segment-level profit or cash inflows attributable to the investment.</p></div>
          <div><h4 className="font-semibold mb-2">How to allocate overhead?</h4><p className="text-muted-foreground">Use consistent, rational bases; test sensitivity to allocations.</p></div>
          <div><h4 className="font-semibold mb-2">Can ROI be negative?</h4><p className="text-muted-foreground">Yes—indicates value destruction; investigate causes and actions.</p></div>
          <div><h4 className="font-semibold mb-2">How many segments to compare?</h4><p className="text-muted-foreground">Keep it manageable (3–5) for clarity; deeper analysis can be done offline.</p></div>
          <div><h4 className="font-semibold mb-2">Is ROI enough?</h4><p className="text-muted-foreground">Consider risk, capital intensity, and strategic fit in addition to ROI.</p></div>
          <div><h4 className="font-semibold mb-2">How often to review?</h4><p className="text-muted-foreground">Quarterly or during planning cycles; update with actuals vs budget.</p></div>
          <div><h4 className="font-semibold mb-2">What about payback or NPV?</h4><p className="text-muted-foreground">Use alongside ROI for time value of money and risk-adjusted views.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





