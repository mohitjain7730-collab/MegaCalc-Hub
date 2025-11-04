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
  pricePerUnit: z.number().min(0).optional(),
  variableCostPerUnit: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EconomicBreakevenQuantityCalculator() {
  const [result,setResult]=useState<{breakevenUnits:number|null; breakevenRevenue:number|null; contribution:number|null; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{pricePerUnit:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,fixedCosts:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.pricePerUnit===undefined||v.variableCostPerUnit===undefined||v.fixedCosts===undefined){ setResult(null); return; }
    const cm=v.pricePerUnit - v.variableCostPerUnit;
    const breakevenUnits = cm>0? v.fixedCosts/cm : null;
    const breakevenRevenue = breakevenUnits!==null? breakevenUnits*v.pricePerUnit : null;
    const interpretation = breakevenUnits===null? 'Contribution margin must be positive to compute breakeven.' : `Breakeven quantity ≈ ${breakevenUnits.toFixed(0)} units and breakeven revenue ≈ ${breakevenRevenue!.toFixed(2)}.`;
    setResult({breakevenUnits,breakevenRevenue,contribution:cm,interpretation,suggestions:[
      'Increase price or reduce variable cost to raise contribution margin.',
      'Lower fixed costs to bring breakeven volume down.',
      'Improve product mix toward higher contribution margin items.',
      'Monitor breakeven versus forecast demand to assess feasibility.'
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Economic Break-even Quantity Calculator</CardTitle>
          <CardDescription>Find breakeven units and revenue from price, variable cost, and fixed costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="pricePerUnit" render={({field})=>(<FormItem><FormLabel>Price per Unit</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="fixedCosts" render={({field})=>(<FormItem><FormLabel>Fixed Costs</FormLabel><FormControl>{num('e.g., 500000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Breakeven analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contribution per Unit</p><p className="text-2xl font-bold">{result.contribution===null?'-':result.contribution.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Breakeven Units</p><p className="text-2xl font-bold">{result.breakevenUnits===null?'-':result.breakevenUnits.toFixed(0)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Breakeven Revenue</p><p className="text-2xl font-bold">{result.breakevenRevenue===null?'-':result.breakevenRevenue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Margins and leverage</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/contribution-margin-calculator" className="text-primary hover:underline">Contribution Margin</a></h4><p className="text-sm text-muted-foreground">Unit margin.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/break-even-analysis-calculator" className="text-primary hover:underline">Break-even Analysis</a></h4><p className="text-sm text-muted-foreground">Fixed vs variable.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-leverage-calculator" className="text-primary hover:underline">Operating Leverage</a></h4><p className="text-sm text-muted-foreground">Profit sensitivity.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Economic Breakeven</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain breakeven mechanics, contribution margin, and use cases.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Economic breakeven</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is economic breakeven?</h4><p className="text-muted-foreground">It is the activity level where total revenue equals total cost and operating profit equals zero; above this level, the firm earns profit.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret contribution margin?</h4><p className="text-muted-foreground">Contribution per unit (Price − Variable Cost) shows how much each unit contributes to covering fixed costs and, after breakeven, to profit.</p></div>
          <div><h4 className="font-semibold mb-2">What if contribution is negative?</h4><p className="text-muted-foreground">Breakeven cannot be reached under current pricing and costs. Raise price, lower variable costs, or discontinue the product.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use units or revenue breakeven?</h4><p className="text-muted-foreground">Units are useful for production planning; revenue breakeven is helpful for sales targets and high product variety environments.</p></div>
          <div><h4 className="font-semibold mb-2">How do fixed costs affect risk?</h4><p className="text-muted-foreground">Higher fixed costs increase operating leverage, raising breakeven volume and profit volatility with sales swings.</p></div>
          <div><h4 className="font-semibold mb-2">Can breakeven be applied to services?</h4><p className="text-muted-foreground">Yes. Treat time-based variable costs similar to materials and compute contribution per hour/session to find breakeven activity level.</p></div>
          <div><h4 className="font-semibold mb-2">How often should inputs be refreshed?</h4><p className="text-muted-foreground">Update when prices, discounts, or input costs change, or at least monthly during periods of volatility.</p></div>
          <div><h4 className="font-semibold mb-2">How to handle multi-product breakeven?</h4><p className="text-muted-foreground">Use weighted-average contribution margin based on planned product mix to estimate overall breakeven.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


