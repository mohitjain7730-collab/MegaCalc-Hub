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
  netCreditSales: z.number().min(0).optional(),
  averageAccountsReceivable: z.number().min(0).optional(),
  beginningReceivables: z.number().min(0).optional(),
  endingReceivables: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReceivablesTurnoverCalculator() {
  const [result,setResult]=useState<{turnoverRatio:number; daysSalesOutstanding:number; collectionPeriod:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{netCreditSales:undefined as unknown as number,averageAccountsReceivable:undefined as unknown as number,beginningReceivables:undefined as unknown as number,endingReceivables:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.netCreditSales===undefined){ setResult(null); return; }
    let avgAR=v.averageAccountsReceivable;
    if(avgAR===undefined&&v.beginningReceivables!==undefined&&v.endingReceivables!==undefined){
      avgAR=(v.beginningReceivables+v.endingReceivables)/2;
    }
    if(avgAR===undefined||avgAR===0){ setResult(null); return; }
    const tr=v.netCreditSales/avgAR;
    const dso=365/tr;
    const interp=`Receivables turnover: ${tr.toFixed(2)} times. Days sales outstanding: ${dso.toFixed(1)} days.`;
    setResult({turnoverRatio:tr,daysSalesOutstanding:dso,collectionPeriod:dso,interpretation:interp,suggestions:['Higher turnover ratio indicates faster collection of receivables and better cash management.','Lower DSO is better; indicates quicker conversion of sales to cash.','Compare turnover ratios to industry benchmarks; monitor trends over time.','Improve collection efficiency by tightening credit terms, following up on overdue accounts, and offering early payment discounts.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Receivables Turnover Calculator</CardTitle>
          <CardDescription>Calculate receivables turnover ratio and days sales outstanding to measure efficiency of credit sales collection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="netCreditSales" render={({field})=>(<FormItem><FormLabel>Net Credit Sales</FormLabel><FormControl>{num('e.g., 1200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="averageAccountsReceivable" render={({field})=>(<FormItem><FormLabel>Average Accounts Receivable</FormLabel><FormControl>{num('e.g., 150000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beginningReceivables" render={({field})=>(<FormItem><FormLabel>Beginning Receivables (optional)</FormLabel><FormControl>{num('e.g., 140000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="endingReceivables" render={({field})=>(<FormItem><FormLabel>Ending Receivables (optional)</FormLabel><FormControl>{num('e.g., 160000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Receivables turnover analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Turnover Ratio</p><p className="text-2xl font-bold">{result.turnoverRatio.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Sales Outstanding</p><p className={`text-2xl font-bold ${result.daysSalesOutstanding<=30?'text-green-600':result.daysSalesOutstanding<=60?'text-yellow-600':'text-red-600'}`}>{result.daysSalesOutstanding.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Collection Period</p><p className={`text-2xl font-bold ${result.collectionPeriod<=30?'text-green-600':result.collectionPeriod<=60?'text-yellow-600':'text-red-600'}`}>{result.collectionPeriod.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Receivables and collections</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-requirement-estimator" className="text-primary hover:underline">Working Capital Estimator</a></h4><p className="text-sm text-muted-foreground">Capital requirements.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-conversion-cycle-calculator" className="text-primary hover:underline">Cash Conversion Cycle</a></h4><p className="text-sm text-muted-foreground">Cash cycle analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-calculator" className="text-primary hover:underline">Working Capital Calculator</a></h4><p className="text-sm text-muted-foreground">Liquidity analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/current-ratio-calculator" className="text-primary hover:underline">Current Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Liquidity ratios.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Receivables Turnover</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain receivables turnover calculation, days sales outstanding, collection efficiency, and credit management best practices.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Receivables turnover</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is receivables turnover ratio?</h4><p className="text-muted-foreground">Times per year that accounts receivable are collected; calculated as Net Credit Sales / Average Accounts Receivable.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good receivables turnover ratio?</h4><p className="text-muted-foreground">Higher is better; varies by industry; typically 6-12 times per year; compare to industry benchmarks.</p></div>
          <div><h4 className="font-semibold mb-2">What is days sales outstanding (DSO)?</h4><p className="text-muted-foreground">Average days to collect receivables; calculated as 365 / Turnover Ratio; lower DSO indicates faster collection.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good DSO?</h4><p className="text-muted-foreground">Depends on payment terms; 30-45 days is typical; compare to credit terms offered and industry averages.</p></div>
          <div><h4 className="font-semibold mb-2">Why is receivables turnover important?</h4><p className="text-muted-foreground">Measures collection efficiency; faster collection improves cash flow and reduces bad debt risk.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate average accounts receivable?</h4><p className="text-muted-foreground">(Beginning Receivables + Ending Receivables) / 2; or use period-end balance if beginning unavailable.</p></div>
          <div><h4 className="font-semibold mb-2">What causes low turnover ratio?</h4><p className="text-muted-foreground">Loose credit terms, poor collection practices, customer payment delays, or weak credit evaluation processes.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve receivables turnover?</h4><p className="text-muted-foreground">Tighten credit terms, implement collection policies, offer early payment discounts, or improve credit evaluation.</p></div>
          <div><h4 className="font-semibold mb-2">Does high turnover always mean good?</h4><p className="text-muted-foreground">Usually yes, but extremely high turnover might indicate overly strict credit terms that limit sales growth.</p></div>
          <div><h4 className="font-semibold mb-2">How does seasonality affect turnover?</h4><p className="text-muted-foreground">Seasonal businesses may show varying turnover; use annual averages or compare same periods year-over-year.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

