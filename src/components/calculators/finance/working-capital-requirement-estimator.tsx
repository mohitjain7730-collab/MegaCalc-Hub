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
  currentAssets: z.number().min(0).optional(),
  currentLiabilities: z.number().min(0).optional(),
  sales: z.number().min(0).optional(),
  costOfGoodsSold: z.number().min(0).optional(),
  accountsReceivable: z.number().min(0).optional(),
  inventory: z.number().min(0).optional(),
  accountsPayable: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WorkingCapitalRequirementEstimator() {
  const [result,setResult]=useState<{workingCapital:number; workingCapitalRatio:number; daysSalesOutstanding:number; daysInventoryOutstanding:number; daysPayableOutstanding:number; cashCycle:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentAssets:undefined as unknown as number,currentLiabilities:undefined as unknown as number,sales:undefined as unknown as number,costOfGoodsSold:undefined as unknown as number,accountsReceivable:undefined as unknown as number,inventory:undefined as unknown as number,accountsPayable:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentAssets!==undefined&&v.currentLiabilities!==undefined){
      const wc=v.currentAssets-v.currentLiabilities;
      const wcr=v.currentLiabilities>0?(v.currentAssets/v.currentLiabilities):NaN;
      let dso=NaN; let dio=NaN; let dpo=NaN; let cc=NaN;
      if(v.sales!==undefined&&v.sales>0&&v.accountsReceivable!==undefined){
        dso=(v.accountsReceivable/v.sales)*365;
      }
      if(v.costOfGoodsSold!==undefined&&v.costOfGoodsSold>0&&v.inventory!==undefined){
        dio=(v.inventory/v.costOfGoodsSold)*365;
      }
      if(v.costOfGoodsSold!==undefined&&v.costOfGoodsSold>0&&v.accountsPayable!==undefined){
        dpo=(v.accountsPayable/v.costOfGoodsSold)*365;
      }
      if(Number.isFinite(dso)&&Number.isFinite(dio)&&Number.isFinite(dpo)){
        cc=dso+dio-dpo;
      }
      const interp=`Working capital: ${wc.toFixed(2)}. ${Number.isFinite(wcr)?`Ratio: ${wcr.toFixed(2)}. `:''}${Number.isFinite(cc)?`Cash cycle: ${cc.toFixed(1)} days. `:''}${Number.isFinite(dso)?`DSO: ${dso.toFixed(1)} days. `:''}`;
      setResult({workingCapital:wc,workingCapitalRatio:wcr,daysSalesOutstanding:dso,daysInventoryOutstanding:dio,daysPayableOutstanding:dpo,cashCycle:cc,interpretation:interp,suggestions:['Positive working capital indicates ability to cover short-term obligations and fund operations.','Monitor working capital trends; declining capital may signal liquidity issues.','Optimize cash cycle by reducing DSO and DIO while extending DPO when possible.','Adequate working capital is essential for business operations and growth opportunities.']});
    } else { setResult(null); return; }
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Working Capital Requirement Estimator</CardTitle>
          <CardDescription>Calculate working capital, working capital ratio, cash conversion cycle, and assess liquidity requirements for business operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="currentAssets" render={({field})=>(<FormItem><FormLabel>Current Assets</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentLiabilities" render={({field})=>(<FormItem><FormLabel>Current Liabilities</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="sales" render={({field})=>(<FormItem><FormLabel>Sales Revenue (optional)</FormLabel><FormControl>{num('e.g., 2000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="costOfGoodsSold" render={({field})=>(<FormItem><FormLabel>Cost of Goods Sold (optional)</FormLabel><FormControl>{num('e.g., 1200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="accountsReceivable" render={({field})=>(<FormItem><FormLabel>Accounts Receivable (optional)</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="inventory" render={({field})=>(<FormItem><FormLabel>Inventory (optional)</FormLabel><FormControl>{num('e.g., 150000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="accountsPayable" render={({field})=>(<FormItem><FormLabel>Accounts Payable (optional)</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Working capital analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Working Capital</p><p className={`text-2xl font-bold ${result.workingCapital>=0?'text-green-600':'text-red-600'}`}>{result.workingCapital.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Working Capital Ratio</p><p className={`text-2xl font-bold ${Number.isFinite(result.workingCapitalRatio)?(result.workingCapitalRatio>=1?'text-green-600':'text-yellow-600'):'text-gray-400'}`}>{Number.isFinite(result.workingCapitalRatio)?result.workingCapitalRatio.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cash Cycle (days)</p><p className={`text-2xl font-bold ${Number.isFinite(result.cashCycle)?(result.cashCycle<0?'text-green-600':'text-blue-600'):'text-gray-400'}`}>{Number.isFinite(result.cashCycle)?result.cashCycle.toFixed(1):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            {Number.isFinite(result.daysSalesOutstanding)||Number.isFinite(result.daysInventoryOutstanding)||Number.isFinite(result.daysPayableOutstanding) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Number.isFinite(result.daysSalesOutstanding) && <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Sales Outstanding</p><p className="text-2xl font-bold">{result.daysSalesOutstanding.toFixed(1)} days</p></div>}
                {Number.isFinite(result.daysInventoryOutstanding) && <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Inventory Outstanding</p><p className="text-2xl font-bold">{result.daysInventoryOutstanding.toFixed(1)} days</p></div>}
                {Number.isFinite(result.daysPayableOutstanding) && <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Payable Outstanding</p><p className="text-2xl font-bold">{result.daysPayableOutstanding.toFixed(1)} days</p></div>}
              </div>
            ) : null}
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Working capital and liquidity</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-calculator" className="text-primary hover:underline">Working Capital Calculator</a></h4><p className="text-sm text-muted-foreground">Liquidity analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-conversion-cycle-calculator" className="text-primary hover:underline">Cash Conversion Cycle</a></h4><p className="text-sm text-muted-foreground">Cash cycle analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/current-ratio-calculator" className="text-primary hover:underline">Current Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Liquidity ratios.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/quick-ratio-calculator" className="text-primary hover:underline">Quick Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Quick assets ratio.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Working Capital Requirements</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain working capital calculation, cash conversion cycle, liquidity management, and working capital optimization.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Working capital requirements</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is working capital?</h4><p className="text-muted-foreground">Current assets minus current liabilities; funds available for day-to-day operations and short-term obligations.</p></div>
          <div><h4 className="font-semibold mb-2">Why is working capital important?</h4><p className="text-muted-foreground">Ensures ability to pay bills, manage operations, handle unexpected expenses, and take advantage of opportunities.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good working capital ratio?</h4><p className="text-muted-foreground">Generally 1.5-2.0; ratio above 1.0 indicates positive working capital; varies by industry and business model.</p></div>
          <div><h4 className="font-semibold mb-2">What is cash conversion cycle?</h4><p className="text-muted-foreground">Days to convert inventory and receivables into cash minus days to pay suppliers; shorter cycle improves cash flow.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate cash conversion cycle?</h4><p className="text-muted-foreground">CCC = Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding.</p></div>
          <div><h4 className="font-semibold mb-2">What causes negative working capital?</h4><p className="text-muted-foreground">Current liabilities exceed current assets; can occur in businesses with fast inventory turnover or extended payables.</p></div>
          <div><h4 className="font-semibold mb-2">Is negative working capital bad?</h4><p className="text-muted-foreground">Often indicates liquidity risk; but some businesses (retail, subscriptions) operate successfully with negative working capital.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve working capital?</h4><p className="text-muted-foreground">Accelerate receivables collection, optimize inventory levels, extend payables when possible, or increase sales efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">What is days sales outstanding (DSO)?</h4><p className="text-muted-foreground">Average days to collect receivables; lower DSO improves cash flow and working capital position.</p></div>
          <div><h4 className="font-semibold mb-2">How much working capital do I need?</h4><p className="text-muted-foreground">Depends on business cycle, industry norms, growth plans, and cash flow predictability; typically 2-3 months of operating expenses.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

