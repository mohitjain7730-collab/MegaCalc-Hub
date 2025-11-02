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
  netSales: z.number().min(0).optional(),
  averageFixedAssets: z.number().min(0).optional(),
  beginningFixedAssets: z.number().min(0).optional(),
  endingFixedAssets: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FixedAssetTurnoverRatioCalculator() {
  const [result,setResult]=useState<{turnoverRatio:number; assetEfficiency:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{netSales:undefined as unknown as number,averageFixedAssets:undefined as unknown as number,beginningFixedAssets:undefined as unknown as number,endingFixedAssets:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.netSales===undefined||v.netSales===0){ setResult(null); return; }
    let avgFA=v.averageFixedAssets;
    if(avgFA===undefined&&v.beginningFixedAssets!==undefined&&v.endingFixedAssets!==undefined){
      avgFA=(v.beginningFixedAssets+v.endingFixedAssets)/2;
    }
    if(avgFA===undefined||avgFA===0){ setResult(null); return; }
    const tr=v.netSales/avgFA;
    const interp=`Fixed asset turnover: ${tr.toFixed(2)}. This means $${tr.toFixed(2)} in sales per $1 of fixed assets.`;
    setResult({turnoverRatio:tr,assetEfficiency:tr,interpretation:interp,suggestions:['Higher turnover ratio indicates efficient use of fixed assets to generate sales.','Compare to industry averages; capital-intensive industries have lower ratios.','Improve ratio by increasing sales efficiency or optimizing asset utilization.','Low ratio may indicate underutilized assets, need for asset disposal, or overinvestment.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Fixed Asset Turnover Ratio Calculator</CardTitle>
          <CardDescription>Calculate fixed asset turnover ratio to measure efficiency of using fixed assets to generate sales revenue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="netSales" render={({field})=>(<FormItem><FormLabel>Net Sales</FormLabel><FormControl>{num('e.g., 5000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="averageFixedAssets" render={({field})=>(<FormItem><FormLabel>Average Fixed Assets</FormLabel><FormControl>{num('e.g., 2000000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="beginningFixedAssets" render={({field})=>(<FormItem><FormLabel>Beginning Fixed Assets (optional)</FormLabel><FormControl>{num('e.g., 1900000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="endingFixedAssets" render={({field})=>(<FormItem><FormLabel>Ending Fixed Assets (optional)</FormLabel><FormControl>{num('e.g., 2100000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Fixed asset efficiency</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Turnover Ratio</p><p className="text-2xl font-bold">{result.turnoverRatio.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Asset Efficiency</p><p className="text-2xl font-bold">{result.assetEfficiency.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Asset efficiency</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-assets-calculator" className="text-primary hover:underline">Return on Assets Calculator</a></h4><p className="text-sm text-muted-foreground">Asset profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inventory-turnover-ratio-calculator" className="text-primary hover:underline">Inventory Turnover Calculator</a></h4><p className="text-sm text-muted-foreground">Inventory management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/depreciation-straight-line-calculator" className="text-primary hover:underline">Depreciation Calculator</a></h4><p className="text-sm text-muted-foreground">Asset depreciation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capex-payback-calculator" className="text-primary hover:underline">Capex Payback Calculator</a></h4><p className="text-sm text-muted-foreground">Payback period.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Fixed Asset Turnover</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain fixed asset turnover calculation, asset efficiency measurement, interpretation, and optimization strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Fixed asset turnover</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is fixed asset turnover ratio?</h4><p className="text-muted-foreground">Measures efficiency of using fixed assets to generate sales; calculated as Net Sales / Average Fixed Assets.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good fixed asset turnover ratio?</h4><p className="text-muted-foreground">Higher is better; varies significantly by industry (retail: 3-5, manufacturing: 1-2, utilities: 0.5-1); compare to industry benchmarks.</p></div>
          <div><h4 className="font-semibold mb-2">Why is fixed asset turnover important?</h4><p className="text-muted-foreground">Indicates how effectively company uses fixed assets to generate revenue; helps assess capital efficiency and asset utilization.</p></div>
          <div><h4 className="font-semibold mb-2">What are fixed assets?</h4><p className="text-muted-foreground">Long-term assets like property, plant, equipment (PP&E); used in operations and not easily converted to cash.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate average fixed assets?</h4><p className="text-muted-foreground">(Beginning Fixed Assets + Ending Fixed Assets) / 2; accounts for asset purchases and disposals during period.</p></div>
          <div><h4 className="font-semibold mb-2">What causes low fixed asset turnover?</h4><p className="text-muted-foreground">Underutilized assets, overinvestment in fixed assets, declining sales, or capital-intensive business model.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve fixed asset turnover?</h4><p className="text-muted-foreground">Increase sales efficiency, optimize asset utilization, dispose of unused assets, or improve production processes.</p></div>
          <div><h4 className="font-semibold mb-2">Does depreciation affect the ratio?</h4><p className="text-muted-foreground">Yes—use net fixed assets (after depreciation) in calculation; depreciation reduces asset value and increases turnover ratio over time.</p></div>
          <div><h4 className="font-semibold mb-2">How does it differ from total asset turnover?</h4><p className="text-muted-foreground">Fixed asset turnover focuses only on long-term assets; total asset turnover includes all assets (current and fixed).</p></div>
          <div><h4 className="font-semibold mb-2">When is low turnover acceptable?</h4><p className="text-muted-foreground">Capital-intensive industries (utilities, manufacturing) have naturally lower ratios; focus on trends and industry comparisons.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

