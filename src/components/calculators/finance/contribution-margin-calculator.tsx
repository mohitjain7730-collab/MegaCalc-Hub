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
  salesPrice: z.number().min(0).optional(),
  variableCostPerUnit: z.number().min(0).optional(),
  totalSales: z.number().min(0).optional(),
  totalVariableCosts: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContributionMarginCalculator() {
  const [result,setResult]=useState<{unitContributionMargin:number; totalContributionMargin:number; contributionMarginRatio:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{salesPrice:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,totalSales:undefined as unknown as number,totalVariableCosts:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.salesPrice!==undefined&&v.variableCostPerUnit!==undefined){
      const ucm=v.salesPrice-v.variableCostPerUnit;
      const cmr=v.salesPrice>0?(ucm/v.salesPrice)*100:0;
      const interp=`Unit contribution margin: ${ucm.toFixed(2)}. Margin ratio: ${cmr.toFixed(1)}%.`;
      setResult({unitContributionMargin:ucm,totalContributionMargin:NaN,contributionMarginRatio:cmr,interpretation:interp,suggestions:['Contribution margin shows profit potential per unit after variable costs.','Higher margin provides more cushion to cover fixed costs and generate profit.','Use margin to evaluate pricing decisions and cost reduction opportunities.','Compare margin ratios across products to identify most profitable items.']});
    } else if(v.totalSales!==undefined&&v.totalVariableCosts!==undefined&&v.totalSales>0){
      const tcm=v.totalSales-v.totalVariableCosts;
      const cmr=(tcm/v.totalSales)*100;
      const interp=`Total contribution margin: ${tcm.toFixed(2)}. Margin ratio: ${cmr.toFixed(1)}%.`;
      setResult({unitContributionMargin:NaN,totalContributionMargin:tcm,contributionMarginRatio:cmr,interpretation:interp,suggestions:['Total contribution margin is revenue available to cover fixed costs.','Higher total margin indicates stronger profitability potential.','Monitor margin trends to identify cost increases or pricing pressure.','Use margin to assess business viability and break-even requirements.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Contribution Margin Calculator</CardTitle>
          <CardDescription>Calculate contribution margin per unit or total to measure how much revenue contributes to covering fixed costs and profit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="salesPrice" render={({field})=>(<FormItem><FormLabel>Sales Price per Unit</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="totalSales" render={({field})=>(<FormItem><FormLabel>Total Sales Revenue</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="totalVariableCosts" render={({field})=>(<FormItem><FormLabel>Total Variable Costs</FormLabel><FormControl>{num('e.g., 60000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Contribution margin analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Unit Contribution Margin</p><p className="text-2xl font-bold">{Number.isFinite(result.unitContributionMargin)?result.unitContributionMargin.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Contribution Margin</p><p className="text-2xl font-bold">{Number.isFinite(result.totalContributionMargin)?result.totalContributionMargin.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contribution Margin Ratio (%)</p><p className="text-2xl font-bold">{result.contributionMarginRatio.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Cost and profitability</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/break-even-analysis-calculator" className="text-primary hover:underline">Break-Even Analysis Calculator</a></h4><p className="text-sm text-muted-foreground">Break-even point.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profitability metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">Net Profit Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profit margins.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Contribution Margin</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain contribution margin, fixed vs variable costs, and margin ratio calculation.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Contribution margin</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is contribution margin?</h4><p className="text-muted-foreground">Revenue minus variable costs; amount available to cover fixed costs and contribute to profit.</p></div>
          <div><h4 className="font-semibold mb-2">How is contribution margin calculated?</h4><p className="text-muted-foreground">Unit CM = Sales Price - Variable Cost per Unit; Total CM = Total Sales - Total Variable Costs.</p></div>
          <div><h4 className="font-semibold mb-2">What is contribution margin ratio?</h4><p className="text-muted-foreground">Contribution margin divided by sales revenue; percentage of each sales dollar contributing to fixed costs and profit.</p></div>
          <div><h4 className="font-semibold mb-2">Why is contribution margin important?</h4><p className="text-muted-foreground">Shows profit potential, helps with pricing decisions, break-even analysis, and product profitability assessment.</p></div>
          <div><h4 className="font-semibold mb-2">How does it differ from gross margin?</h4><p className="text-muted-foreground">Gross margin includes fixed manufacturing costs; contribution margin only deducts variable costs.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good contribution margin?</h4><p className="text-muted-foreground">Depends on industry; 40-60% is strong; higher is better; varies by business model and cost structure.</p></div>
          <div><h4 className="font-semibold mb-2">How to improve contribution margin?</h4><p className="text-muted-foreground">Increase prices, reduce variable costs, focus on high-margin products, or improve operational efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">Can contribution margin be negative?</h4><p className="text-muted-foreground">Yes—if variable costs exceed price; indicates product is unprofitable and should be discontinued or repriced.</p></div>
          <div><h4 className="font-semibold mb-2">How does volume affect contribution margin?</h4><p className="text-muted-foreground">Unit CM stays constant; total CM increases with volume; more units = more contribution to fixed costs.</p></div>
          <div><h4 className="font-semibold mb-2">What about multi-product businesses?</h4><p className="text-muted-foreground">Calculate CM for each product; use weighted average CM for overall business; focus on high-CM products.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


