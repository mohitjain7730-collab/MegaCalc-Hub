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
  beginningInventory: z.number().min(0).optional(),
  purchases: z.number().min(0).optional(),
  endingInventory: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function COGSEstimator() {
  const [result,setResult]=useState<{cogs:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{beginningInventory:undefined as unknown as number,purchases:undefined as unknown as number,endingInventory:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.beginningInventory===undefined||v.purchases===undefined||v.endingInventory===undefined){ setResult(null); return; }
    const cogs=v.beginningInventory + v.purchases - v.endingInventory;
    const interpretation=`COGS estimated at ${cogs.toFixed(2)} using BI + Purchases - EI.`;
    setResult({cogs,interpretation,suggestions:[
      'Improve inventory accuracy to tighten COGS estimates.',
      'Separate purchase returns and freight-in for more precise COGS.',
      'Analyze COGS trends versus revenue to detect margin compression.',
      'Reconcile physical counts with book inventory regularly.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Cost of Goods Sold (COGS) Estimator</CardTitle>
          <CardDescription>Estimate COGS using beginning inventory, purchases, and ending inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="beginningInventory" render={({field})=>(<FormItem><FormLabel>Beginning Inventory</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="purchases" render={({field})=>(<FormItem><FormLabel>Purchases</FormLabel><FormControl>{num('e.g., 800000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="endingInventory" render={({field})=>(<FormItem><FormLabel>Ending Inventory</FormLabel><FormControl>{num('e.g., 250000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>COGS estimate</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">COGS</p><p className="text-2xl font-bold">{result.cogs.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Margins and turnover</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inventory-turnover-ratio-calculator" className="text-primary hover:underline">Inventory Turnover</a></h4><p className="text-sm text-muted-foreground">Stock efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payables-turnover-calculator" className="text-primary hover:underline">Payables Turnover</a></h4><p className="text-sm text-muted-foreground">Payment cycle.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/receivables-turnover-calculator" className="text-primary hover:underline">Receivables Turnover</a></h4><p className="text-sm text-muted-foreground">Collection efficiency.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to COGS Estimation</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain periodic COGS formula and reconciliation with perpetual systems.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>COGS estimation</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the basic COGS formula?</h4><p className="text-muted-foreground">Beginning Inventory + Purchases − Ending Inventory.</p></div>
          <div><h4 className="font-semibold mb-2">Does this include freight-in?</h4><p className="text-muted-foreground">Yes, add freight-in to purchases for accuracy; exclude purchase returns.</p></div>
          <div><h4 className="font-semibold mb-2">How often to calculate?</h4><p className="text-muted-foreground">Monthly for management reporting; at least quarterly; always for year-end close.</p></div>
          <div><h4 className="font-semibold mb-2">What about manufacturing overhead?</h4><p className="text-muted-foreground">Include in inventory valuation under absorption costing; excluded in variable costing.</p></div>
          <div><h4 className="font-semibold mb-2">Why can COGS be misstated?</h4><p className="text-muted-foreground">Inaccurate counts, cutoffs, shrinkage, or valuation methods (FIFO/LIFO/WA).</p></div>
          <div><h4 className="font-semibold mb-2">How does COGS affect margins?</h4><p className="text-muted-foreground">Higher COGS lowers gross margin; track COGS to detect cost increases early.</p></div>
          <div><h4 className="font-semibold mb-2">Can this be used for services?</h4><p className="text-muted-foreground">Use cost of services delivered; concept similar but inventory may be minimal.</p></div>
          <div><h4 className="font-semibold mb-2">Periodic vs perpetual?</h4><p className="text-muted-foreground">Periodic uses formula; perpetual recognizes COGS at each sale via inventory system.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





