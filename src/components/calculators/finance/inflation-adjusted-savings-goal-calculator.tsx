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
  currentGoal: z.number().min(0).optional(),
  inflationRate: z.number().min(-100).max(100).optional(),
  yearsUntilGoal: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InflationAdjustedSavingsGoalCalculator() {
  const [result,setResult]=useState<{adjustedGoal:number; inflationAmount:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentGoal:undefined as unknown as number,inflationRate:undefined as unknown as number,yearsUntilGoal:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentGoal===undefined||v.inflationRate===undefined||v.yearsUntilGoal===undefined){ setResult(null); return; }
    const r=v.inflationRate/100;
    const adjusted=v.currentGoal*Math.pow(1+r,v.yearsUntilGoal);
    const inflationAmount=adjusted-v.currentGoal;
    const interp=`Goal in ${v.yearsUntilGoal} years: ${adjusted.toFixed(2)}. Inflation adds ${inflationAmount.toFixed(2)} to target.`;
    setResult({adjustedGoal:adjusted,inflationAmount,interpretation:interp,suggestions:['Always adjust goals for inflation to maintain purchasing power.','Use historical inflation averages (2-3%) or current rate if significantly different.','Increase savings rate or timeline if inflation-adjusted goal seems too high.','Review and update inflation assumptions annually as economic conditions change.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Inflation-Adjusted Savings Goal Calculator</CardTitle>
          <CardDescription>Adjust your savings goals for inflation to determine the future value needed to maintain purchasing power.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="currentGoal" render={({field})=>(<FormItem><FormLabel>Current Savings Goal</FormLabel><FormControl>{num('e.g., 50000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="inflationRate" render={({field})=>(<FormItem><FormLabel>Annual Inflation Rate (%)</FormLabel><FormControl>{num('e.g., 3',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="yearsUntilGoal" render={({field})=>(<FormItem><FormLabel>Years Until Goal</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Inflation adjustment</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Adjusted Goal</p><p className="text-2xl font-bold">{result.adjustedGoal.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Inflation Amount</p><p className="text-2xl font-bold text-red-600">+{result.inflationAmount.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Inflation and goals</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4><p className="text-sm text-muted-foreground">Inflation impact.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Goal planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Rate of Return</a></h4><p className="text-sm text-muted-foreground">After-inflation returns.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Inflation-Adjusted Goals</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain inflation impact, purchasing power, and goal adjustment strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Inflation-adjusted savings</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">Why adjust savings goals for inflation?</h4><p className="text-muted-foreground">Inflation erodes purchasing power; a goal that buys X today will need more money in the future to buy the same X.</p></div>
          <div><h4 className="font-semibold mb-2">What inflation rate should I use?</h4><p className="text-muted-foreground">Historical average (2-3% in developed countries) or current rate if significantly different; consider personal expense inflation.</p></div>
          <div><h4 className="font-semibold mb-2">How much does inflation affect my goal?</h4><p className="text-muted-foreground">3% inflation doubles cost in ~24 years; 10 years at 3% adds ~35% to goal; compound effect grows over time.</p></div>
          <div><h4 className="font-semibold mb-2">Should I adjust all goals for inflation?</h4><p className="text-muted-foreground">Yes—all long-term goals (5+ years) should account for inflation; short-term goals may not need adjustment.</p></div>
          <div><h4 className="font-semibold mb-2">How does inflation affect retirement goals?</h4><p className="text-muted-foreground">Significantly—30-year retirement needs much higher amount; adjust annual expenses for inflation over retirement period.</p></div>
          <div><h4 className="font-semibold mb-2">What if inflation is higher than expected?</h4><p className="text-muted-foreground">Increase savings rate, extend timeline, or reduce goal; review and update assumptions annually.</p></div>
          <div><h4 className="font-semibold mb-2">Do investment returns offset inflation?</h4><p className="text-muted-foreground">Good investments (stocks) historically beat inflation; use real returns (nominal minus inflation) for planning.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate?</h4><p className="text-muted-foreground">Annually or when inflation rates change significantly; update goals as economic conditions evolve.</p></div>
          <div><h4 className="font-semibold mb-2">What about different expense categories?</h4><p className="text-muted-foreground">Healthcare and education inflate faster than general inflation; use specific inflation rates for those goals.</p></div>
          <div><h4 className="font-semibold mb-2">Can I ignore inflation for short-term goals?</h4><p className="text-muted-foreground">For goals under 2-3 years, inflation impact is minimal; for 5+ years, always adjust.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

