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
  revenue: z.number().min(0).optional(),
  cogs: z.number().min(0).optional(),
  operatingExpenses: z.number().min(0).optional(),
  interestExpense: z.number().min(0).optional(),
  taxes: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrossProfitVsNetProfitAnalyzer() {
  const [result,setResult]=useState<{grossProfit:number; grossMargin:number; netProfit:number; netMargin:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{revenue:undefined as unknown as number,cogs:undefined as unknown as number,operatingExpenses:undefined as unknown as number,interestExpense:undefined as unknown as number,taxes:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.revenue===undefined||v.cogs===undefined||v.operatingExpenses===undefined||v.interestExpense===undefined||v.taxes===undefined){ setResult(null); return; }
    const grossProfit=v.revenue - v.cogs;
    const netProfit=grossProfit - v.operatingExpenses - v.interestExpense - v.taxes;
    const grossMargin=v.revenue!==0? (grossProfit/v.revenue)*100 : 0;
    const netMargin=v.revenue!==0? (netProfit/v.revenue)*100 : 0;
    const interpretation=`Gross Margin: ${grossMargin.toFixed(1)}%. Net Margin: ${netMargin.toFixed(1)}%.`;
    setResult({grossProfit,grossMargin,netProfit,netMargin,interpretation,suggestions:[
      'Improve gross margin via pricing, product mix, and COGS control.',
      'Reduce operating expenses by targeting overhead and process efficiency.',
      'Optimize financing to lower interest costs.',
      'Plan taxes and credits to enhance after-tax profitability.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Gross Profit vs Net Profit Analyzer</CardTitle>
          <CardDescription>Compare gross and net profitability and understand margin drivers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="revenue" render={({field})=>(<FormItem><FormLabel>Revenue</FormLabel><FormControl>{num('e.g., 2000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="cogs" render={({field})=>(<FormItem><FormLabel>COGS</FormLabel><FormControl>{num('e.g., 1200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="operatingExpenses" render={({field})=>(<FormItem><FormLabel>Operating Expenses</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="interestExpense" render={({field})=>(<FormItem><FormLabel>Interest Expense</FormLabel><FormControl>{num('e.g., 25000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="taxes" render={({field})=>(<FormItem><FormLabel>Taxes</FormLabel><FormControl>{num('e.g., 80000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Margin analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Gross Profit</p><p className="text-2xl font-bold">{result.grossProfit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Gross Margin</p><p className="text-2xl font-bold">{result.grossMargin.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Profit</p><p className={`text-2xl font-bold ${result.netProfit>=0?'text-green-600':'text-red-600'}`}>{result.netProfit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Margin</p><p className={`text-2xl font-bold ${result.netMargin>=0?'text-green-600':'text-red-600'}`}>{result.netMargin.toFixed(1)}%</p></div>
            </div>
            <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Margins</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">Net Profit Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Net profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Operating efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Investment return.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Gross vs Net Profit</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain gross vs net profit, margins, and key drivers.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Gross vs net profit</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is gross profit?</h4><p className="text-muted-foreground">Revenue minus COGS; measures core product profitability.</p></div>
          <div><h4 className="font-semibold mb-2">What is net profit?</h4><p className="text-muted-foreground">Gross profit minus operating expenses, interest, and taxes; bottom-line earnings.</p></div>
          <div><h4 className="font-semibold mb-2">Why can margins differ?</h4><p className="text-muted-foreground">Product mix, pricing, cost structure, financing, and tax strategies.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve gross margin?</h4><p className="text-muted-foreground">Raise prices, reduce COGS, shift mix to high-margin products.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve net margin?</h4><p className="text-muted-foreground">Optimize overhead, financing, and effective tax rate.</p></div>
          <div><h4 className="font-semibold mb-2">Benchmarking tips?</h4><p className="text-muted-foreground">Compare to industry medians and peer group; track trends over time.</p></div>
          <div><h4 className="font-semibold mb-2">Seasonality impact?</h4><p className="text-muted-foreground">Margins can vary by quarter; analyze on a rolling 12-month basis.</p></div>
          <div><h4 className="font-semibold mb-2">Cash vs accrual?</h4><p className="text-muted-foreground">Margins are typically analyzed on accrual basis; cash timing can differ.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



