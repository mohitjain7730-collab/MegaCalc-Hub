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
  totalPurchases: z.number().min(0).optional(),
  costOfGoodsSold: z.number().min(0).optional(),
  averageAccountsPayable: z.number().min(0).optional(),
  beginningPayables: z.number().min(0).optional(),
  endingPayables: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PayablesTurnoverCalculator() {
  const [result,setResult]=useState<{turnoverRatio:number; daysPayableOutstanding:number; paymentPeriod:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{totalPurchases:undefined as unknown as number,costOfGoodsSold:undefined as unknown as number,averageAccountsPayable:undefined as unknown as number,beginningPayables:undefined as unknown as number,endingPayables:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    let purchases=v.totalPurchases;
    if(purchases===undefined&&v.costOfGoodsSold!==undefined){
      purchases=v.costOfGoodsSold;
    }
    if(purchases===undefined||purchases===0){ setResult(null); return; }
    let avgAP=v.averageAccountsPayable;
    if(avgAP===undefined&&v.beginningPayables!==undefined&&v.endingPayables!==undefined){
      avgAP=(v.beginningPayables+v.endingPayables)/2;
    }
    if(avgAP===undefined||avgAP===0){ setResult(null); return; }
    const tr=purchases/avgAP;
    const dpo=365/tr;
    const interp=`Payables turnover: ${tr.toFixed(2)} times per year. Days payable outstanding: ${dpo.toFixed(1)} days.`;
    setResult({turnoverRatio:tr,daysPayableOutstanding:dpo,paymentPeriod:dpo,interpretation:interp,suggestions:['Lower turnover ratio means longer payment periods and better cash management.','Higher DPO is generally better; indicates extended payment terms and improved cash flow.','Balance payment terms with supplier relationships; avoid late payments that hurt credit.','Compare DPO to payment terms; consistently exceeding terms may indicate cash flow issues.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Payables Turnover Calculator</CardTitle>
          <CardDescription>Calculate payables turnover ratio and days payable outstanding to measure efficiency of supplier payment management.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="totalPurchases" render={({field})=>(<FormItem><FormLabel>Total Purchases</FormLabel><FormControl>{num('e.g., 800000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="costOfGoodsSold" render={({field})=>(<FormItem><FormLabel>COGS (if purchases unknown)</FormLabel><FormControl>{num('e.g., 800000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="averageAccountsPayable" render={({field})=>(<FormItem><FormLabel>Average Accounts Payable</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beginningPayables" render={({field})=>(<FormItem><FormLabel>Beginning Payables (optional)</FormLabel><FormControl>{num('e.g., 95000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="endingPayables" render={({field})=>(<FormItem><FormLabel>Ending Payables (optional)</FormLabel><FormControl>{num('e.g., 105000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Payables turnover analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Turnover Ratio</p><p className="text-2xl font-bold">{result.turnoverRatio.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Payable Outstanding</p><p className={`text-2xl font-bold ${result.daysPayableOutstanding>=45?'text-green-600':result.daysPayableOutstanding>=30?'text-yellow-600':'text-red-600'}`}>{result.daysPayableOutstanding.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Payment Period</p><p className={`text-2xl font-bold ${result.paymentPeriod>=45?'text-green-600':result.paymentPeriod>=30?'text-yellow-600':'text-red-600'}`}>{result.paymentPeriod.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Payables and working capital</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/receivables-turnover-calculator" className="text-primary hover:underline">Receivables Turnover Calculator</a></h4><p className="text-sm text-muted-foreground">Collection efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inventory-turnover-ratio-calculator" className="text-primary hover:underline">Inventory Turnover Calculator</a></h4><p className="text-sm text-muted-foreground">Inventory management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-conversion-cycle-calculator" className="text-primary hover:underline">Cash Conversion Cycle</a></h4><p className="text-sm text-muted-foreground">Cash cycle analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-requirement-estimator" className="text-primary hover:underline">Working Capital Estimator</a></h4><p className="text-sm text-muted-foreground">Capital requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Payables Turnover</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain payables turnover calculation, days payable outstanding, payment management strategies, and cash flow optimization.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Payables turnover</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is payables turnover ratio?</h4><p className="text-muted-foreground">Times per year that accounts payable are paid; calculated as Total Purchases / Average Accounts Payable.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good payables turnover ratio?</h4><p className="text-muted-foreground">Lower is generally better; indicates longer payment periods and improved cash flow; varies by industry and payment terms.</p></div>
          <div><h4 className="font-semibold mb-2">What is days payable outstanding (DPO)?</h4><p className="text-muted-foreground">Average days to pay suppliers; calculated as 365 / Turnover Ratio; higher DPO indicates better cash management.</p></div>
          <div><h4 className="font-semibold mb-2">Why is payables turnover important?</h4><p className="text-muted-foreground">Measures payment efficiency; longer payment periods improve cash flow but must balance with supplier relationships.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate average accounts payable?</h4><p className="text-muted-foreground">(Beginning Payables + Ending Payables) / 2; or use period-end balance if beginning unavailable.</p></div>
          <div><h4 className="font-semibold mb-2">Is higher DPO always better?</h4><p className="text-muted-foreground">Generally yes for cash flow, but excessively long payments may damage supplier relationships or incur late fees.</p></div>
          <div><h4 className="font-semibold mb-2">What causes high turnover ratio?</h4><p className="text-muted-foreground">Faster payment of suppliers, short payment terms, early payment discounts, or cash flow constraints requiring quick payment.</p></div>
          <div><h4 className="font-semibold mb-2">How to optimize payables management?</h4><p className="text-muted-foreground">Negotiate longer payment terms, take early payment discounts when beneficial, balance cash flow with supplier relationships.</p></div>
          <div><h4 className="font-semibold mb-2">What is the relationship with cash conversion cycle?</h4><p className="text-muted-foreground">DPO is subtracted in cash cycle calculation; longer DPO reduces cash cycle and improves working capital efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">Should I pay early or on time?</h4><p className="text-muted-foreground">Pay on time to maximize cash flow; pay early only if discounts exceed cost of capital; avoid late payments.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


