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
  fixedCosts: z.number().min(0).optional(),
  variableCostPerUnit: z.number().min(0).optional(),
  pricePerUnit: z.number().min(0).optional(),
  salesPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenAnalysisCalculator() {
  const [result,setResult]=useState<{breakEvenUnits:number; breakEvenRevenue:number; contributionMargin:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{fixedCosts:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,pricePerUnit:undefined as unknown as number,salesPrice:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.fixedCosts===undefined||v.variableCostPerUnit===undefined||v.pricePerUnit===undefined||v.pricePerUnit<=v.variableCostPerUnit){ setResult(null); return; }
    const cm=v.pricePerUnit-v.variableCostPerUnit;
    const beUnits=v.fixedCosts/cm;
    const beRev=beUnits*v.pricePerUnit;
    const interp=`Break-even: ${beUnits.toFixed(2)} units or ${beRev.toFixed(2)} revenue. Contribution margin: ${cm.toFixed(2)} per unit.`;
    setResult({breakEvenUnits:beUnits,breakEvenRevenue:beRev,contributionMargin:cm,interpretation:interp,suggestions:['Break-even is point where total revenue equals total costs (no profit, no loss).','Reduce fixed costs or increase contribution margin to lower break-even point.','Sales above break-even generate profit; below break-even generates loss.','Use break-even to evaluate pricing, cost structures, and sales targets.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Break-Even Analysis Calculator</CardTitle>
          <CardDescription>Calculate break-even point in units and revenue where total costs equal total revenue (zero profit/loss).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="fixedCosts" render={({field})=>(<FormItem><FormLabel>Fixed Costs</FormLabel><FormControl>{num('e.g., 50000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="pricePerUnit" render={({field})=>(<FormItem><FormLabel>Price per Unit</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="salesPrice" render={({field})=>(<FormItem><FormLabel>Sales Price (optional)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Break-even analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Break-Even Units</p><p className="text-2xl font-bold">{result.breakEvenUnits.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Break-Even Revenue</p><p className="text-2xl font-bold">{result.breakEvenRevenue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contribution Margin</p><p className="text-2xl font-bold">{result.contributionMargin.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Business analysis</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/contribution-margin-calculator" className="text-primary hover:underline">Contribution Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Margin analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profitability metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profitability analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-profit-margin-calculator" className="text-primary hover:underline">Net Profit Margin Calculator</a></h4><p className="text-sm text-muted-foreground">Profit margins.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Break-Even Analysis</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain break-even formula, fixed vs variable costs, and decision-making applications.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Break-even analysis</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is break-even point?</h4><p className="text-muted-foreground">Sales volume where total revenue equals total costs (fixed + variable); no profit, no loss.</p></div>
          <div><h4 className="font-semibold mb-2">How is break-even calculated?</h4><p className="text-muted-foreground">Break-even units = Fixed Costs / (Price - Variable Cost per Unit); Break-even revenue = Break-even units × Price.</p></div>
          <div><h4 className="font-semibold mb-2">What are fixed costs?</h4><p className="text-muted-foreground">Costs that don't change with production volume: rent, salaries, insurance, depreciation.</p></div>
          <div><h4 className="font-semibold mb-2">What are variable costs?</h4><p className="text-muted-foreground">Costs that vary with production: materials, labor, shipping, commissions; total increases with units.</p></div>
          <div><h4 className="font-semibold mb-2">What is contribution margin?</h4><p className="text-muted-foreground">Price minus variable cost per unit; amount each unit contributes to covering fixed costs and profit.</p></div>
          <div><h4 className="font-semibold mb-2">How to lower break-even point?</h4><p className="text-muted-foreground">Reduce fixed costs, increase price, decrease variable costs, or increase contribution margin.</p></div>
          <div><h4 className="font-semibold mb-2">What if price equals variable cost?</h4><p className="text-muted-foreground">Break-even is infinite; contribution margin is zero; cannot cover fixed costs; business is unviable.</p></div>
          <div><h4 className="font-semibold mb-2">How does break-even help decision-making?</h4><p className="text-muted-foreground">Evaluates pricing strategies, cost reduction impact, new product viability, and minimum sales targets.</p></div>
          <div><h4 className="font-semibold mb-2">Can break-even change over time?</h4><p className="text-muted-foreground">Yes—as costs, prices, or product mix change; recalculate periodically for accuracy.</p></div>
          <div><h4 className="font-semibold mb-2">What about multiple products?</h4><p className="text-muted-foreground">Calculate weighted average contribution margin; or calculate break-even for each product separately.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


