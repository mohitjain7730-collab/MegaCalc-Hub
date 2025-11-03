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
  costOfGoodsSold: z.number().min(0).optional(),
  averageInventory: z.number().min(0).optional(),
  beginningInventory: z.number().min(0).optional(),
  endingInventory: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InventoryTurnoverRatioCalculator() {
  const [result,setResult]=useState<{turnoverRatio:number; daysInventoryOutstanding:number; inventoryDays:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{costOfGoodsSold:undefined as unknown as number,averageInventory:undefined as unknown as number,beginningInventory:undefined as unknown as number,endingInventory:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.costOfGoodsSold===undefined||v.costOfGoodsSold===0){ setResult(null); return; }
    let avgInv=v.averageInventory;
    if(avgInv===undefined&&v.beginningInventory!==undefined&&v.endingInventory!==undefined){
      avgInv=(v.beginningInventory+v.endingInventory)/2;
    }
    if(avgInv===undefined||avgInv===0){ setResult(null); return; }
    const tr=v.costOfGoodsSold/avgInv;
    const dio=365/tr;
    const interp=`Inventory turnover: ${tr.toFixed(2)} times per year. Days inventory outstanding: ${dio.toFixed(1)} days.`;
    setResult({turnoverRatio:tr,daysInventoryOutstanding:dio,inventoryDays:dio,interpretation:interp,suggestions:['Higher turnover ratio indicates efficient inventory management and faster sales.','Lower DIO is better; indicates inventory is sold quickly and doesn\'t sit idle.','Compare turnover to industry benchmarks; varies significantly by business type.','Improve turnover by optimizing inventory levels, reducing excess stock, or improving sales velocity.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Inventory Turnover Ratio Calculator</CardTitle>
          <CardDescription>Calculate inventory turnover ratio and days inventory outstanding to measure efficiency of inventory management.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="costOfGoodsSold" render={({field})=>(<FormItem><FormLabel>Cost of Goods Sold</FormLabel><FormControl>{num('e.g., 1200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="averageInventory" render={({field})=>(<FormItem><FormLabel>Average Inventory</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beginningInventory" render={({field})=>(<FormItem><FormLabel>Beginning Inventory (optional)</FormLabel><FormControl>{num('e.g., 190000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="endingInventory" render={({field})=>(<FormItem><FormLabel>Ending Inventory (optional)</FormLabel><FormControl>{num('e.g., 210000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Inventory turnover analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Turnover Ratio</p><p className="text-2xl font-bold">{result.turnoverRatio.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Days Inventory Outstanding</p><p className={`text-2xl font-bold ${result.daysInventoryOutstanding<=30?'text-green-600':result.daysInventoryOutstanding<=90?'text-yellow-600':'text-red-600'}`}>{result.daysInventoryOutstanding.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Inventory Days</p><p className={`text-2xl font-bold ${result.inventoryDays<=30?'text-green-600':result.inventoryDays<=90?'text-yellow-600':'text-red-600'}`}>{result.inventoryDays.toFixed(1)} days</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Inventory and asset management</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/receivables-turnover-calculator" className="text-primary hover:underline">Receivables Turnover Calculator</a></h4><p className="text-sm text-muted-foreground">Collection efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/payables-turnover-calculator" className="text-primary hover:underline">Payables Turnover Calculator</a></h4><p className="text-sm text-muted-foreground">Payment management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/working-capital-requirement-estimator" className="text-primary hover:underline">Working Capital Estimator</a></h4><p className="text-sm text-muted-foreground">Capital requirements.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cash-conversion-cycle-calculator" className="text-primary hover:underline">Cash Conversion Cycle</a></h4><p className="text-sm text-muted-foreground">Cash cycle analysis.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Inventory Turnover</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain inventory turnover calculation, days inventory outstanding, inventory management best practices, and optimization strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Inventory turnover</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is inventory turnover ratio?</h4><p className="text-muted-foreground">Times per year that inventory is sold and replaced; calculated as Cost of Goods Sold / Average Inventory.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good inventory turnover ratio?</h4><p className="text-muted-foreground">Higher is generally better; varies by industry (retail: 4-6, manufacturing: 6-8); compare to industry benchmarks.</p></div>
          <div><h4 className="font-semibold mb-2">What is days inventory outstanding (DIO)?</h4><p className="text-muted-foreground">Average days inventory is held before sale; calculated as 365 / Turnover Ratio; lower DIO indicates faster sales.</p></div>
          <div><h4 className="font-semibold mb-2">Why is inventory turnover important?</h4><p className="text-muted-foreground">Measures inventory efficiency; high turnover indicates good sales and minimal excess stock; affects cash flow and profitability.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate average inventory?</h4><p className="text-muted-foreground">(Beginning Inventory + Ending Inventory) / 2; or use period-end balance if beginning unavailable.</p></div>
          <div><h4 className="font-semibold mb-2">What causes low inventory turnover?</h4><p className="text-muted-foreground">Excess inventory, slow-moving products, overstocking, seasonal variations, or poor demand forecasting.</p></div>
          <div><h4 className="font-semibold mb-2">Is high turnover always good?</h4><p className="text-muted-foreground">Usually yes, but extremely high turnover might indicate stockouts, lost sales, or insufficient inventory levels.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve inventory turnover?</h4><p className="text-muted-foreground">Optimize inventory levels, reduce excess stock, improve demand forecasting, negotiate better supplier terms, or clear slow-moving items.</p></div>
          <div><h4 className="font-semibold mb-2">How does seasonality affect turnover?</h4><p className="text-muted-foreground">Seasonal businesses show varying turnover; use annual averages or compare same periods year-over-year for accurate assessment.</p></div>
          <div><h4 className="font-semibold mb-2">What is the relationship with working capital?</h4><p className="text-muted-foreground">Lower inventory levels reduce working capital requirements; higher turnover improves cash flow and reduces carrying costs.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


