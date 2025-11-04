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

export default function EconomicBreakEvenQuantityCalculator() {
  const [result,setResult]=useState<{breakEvenQty:number|null; contributionPerUnit:number|null; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{pricePerUnit:undefined as unknown as number,variableCostPerUnit:undefined as unknown as number,fixedCosts:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.pricePerUnit===undefined||v.variableCostPerUnit===undefined||v.fixedCosts===undefined){ setResult(null); return; }
    const contrib=v.pricePerUnit - v.variableCostPerUnit;
    const beq=contrib>0? v.fixedCosts / contrib : null;
    const interpretation= beq===null? 'Contribution per unit must exceed variable cost to reach breakeven.' : `Break-even quantity is ${beq.toFixed(0)} units.`;
    setResult({breakEvenQty:beq,contributionPerUnit:contrib,interpretation,suggestions:[
      'Increase price or reduce variable cost to lower breakeven quantity.',
      'Lower fixed costs to reduce risk and reach breakeven faster.',
      'Improve product mix toward higher-contribution offerings.',
      'Use sensitivity analysis for price and cost scenarios.'
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
          <CardDescription>Find the units needed to cover fixed costs given price and variable cost per unit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="pricePerUnit" render={({field})=>(<FormItem><FormLabel>Price per Unit</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="variableCostPerUnit" render={({field})=>(<FormItem><FormLabel>Variable Cost per Unit</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="fixedCosts" render={({field})=>(<FormItem><FormLabel>Fixed Costs</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Contribution per Unit</p><p className="text-2xl font-bold">{result.contributionPerUnit===null?'-':result.contributionPerUnit.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Break-even Quantity</p><p className="text-2xl font-bold">{result.breakEvenQty===null?'-':result.breakEvenQty.toFixed(0)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Profitability</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/break-even-analysis-calculator" className="text-primary hover:underline">Break-Even Analysis</a></h4><p className="text-sm text-muted-foreground">Multi-metric breakeven.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/contribution-margin-calculator" className="text-primary hover:underline">Contribution Margin</a></h4><p className="text-sm text-muted-foreground">Per-unit margin.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/operating-margin-calculator" className="text-primary hover:underline">Operating Margin</a></h4><p className="text-sm text-muted-foreground">Operating efficiency.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/gross-margin-calculator" className="text-primary hover:underline">Gross Margin</a></h4><p className="text-sm text-muted-foreground">Gross profitability.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Break-even Quantity</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain fixed vs variable costs and contribution margin.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Economic breakeven</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is economic break-even quantity?</h4><p className="text-muted-foreground">The number of units that must be sold for total contribution to equal fixed costs, resulting in zero operating profit.</p></div>
          <div><h4 className="font-semibold mb-2">How do you calculate it?</h4><p className="text-muted-foreground">Fixed Costs ÷ (Price per Unit − Variable Cost per Unit). Ensure the contribution per unit is positive.</p></div>
          <div><h4 className="font-semibold mb-2">Why does contribution margin matter?</h4><p className="text-muted-foreground">It measures how much each unit contributes to covering fixed costs and generating profit after breakeven.</p></div>
          <div><h4 className="font-semibold mb-2">Can breakeven be used for pricing?</h4><p className="text-muted-foreground">Yes. Test different prices and costs to see how many units you need to sell to break even or reach target profit.</p></div>
          <div><h4 className="font-semibold mb-2">What if contribution is negative?</h4><p className="text-muted-foreground">If price is below variable cost, breakeven is impossible. Increase price, lower cost, or discontinue the product.</p></div>
          <div><h4 className="font-semibold mb-2">Does product mix change breakeven?</h4><p className="text-muted-foreground">Yes. Weighted-average contribution margin must be used when selling multiple products.</p></div>
          <div><h4 className="font-semibold mb-2">How often to revisit breakeven?</h4><p className="text-muted-foreground">Update after material changes in cost, price, or fixed overhead to keep targets realistic.</p></div>
          <div><h4 className="font-semibold mb-2">What are common pitfalls?</h4><p className="text-muted-foreground">Ignoring capacity limits, assuming linearity, or excluding step-fixed and semi-variable costs.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}



