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
  goalAmount: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InvestmentGoalTrackerCalculator() {
  const [result,setResult]=useState<{progress:number; remaining:number; projectedValue:number; onTrack:boolean; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{goalAmount:undefined as unknown as number,currentValue:undefined as unknown as number,monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.goalAmount===undefined||v.currentValue===undefined||v.monthlyContribution===undefined||v.annualReturn===undefined){ setResult(null); return; }
    const progress=(v.currentValue/v.goalAmount)*100;
    const remaining=v.goalAmount-v.currentValue;
    const r=v.annualReturn/100/12;
    let pv=v.currentValue;
    for(let i=0;i<12;i++){ pv=pv*(1+r)+v.monthlyContribution; }
    const onTrack=pv>=v.goalAmount||(pv>=v.goalAmount*0.9);
    const interp=`Progress: ${progress.toFixed(1)}% toward goal. Remaining: ${remaining.toFixed(2)}. ${onTrack?'On track':'Needs adjustment'}.`;
    setResult({progress,remaining,projectedValue:pv,onTrack,interpretation:interp,suggestions:['Track monthly to monitor progress and adjust contributions if needed.','If behind target, increase contributions or extend timeline.','Rebalance portfolio if returns deviate significantly from expectations.','Celebrate milestones to stay motivated toward your investment goal.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Investment Goal Tracker Calculator</CardTitle>
          <CardDescription>Track progress toward investment goals, calculate remaining amount, and project future value.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="goalAmount" render={({field})=>(<FormItem><FormLabel>Goal Amount</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentValue" render={({field})=>(<FormItem><FormLabel>Current Investment Value</FormLabel><FormControl>{num('e.g., 30000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 1000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Goal tracking analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Progress (%)</p><p className="text-2xl font-bold">{result.progress.toFixed(1)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Remaining Amount</p><p className="text-2xl font-bold">{result.remaining.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Projected Value (1 year)</p><p className="text-2xl font-bold">{result.projectedValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Status</p><p className={`text-2xl font-bold ${result.onTrack?'text-green-600':'text-yellow-600'}`}>{result.onTrack?'On Track':'Needs Adjustment'}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Goal planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Timeline planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth calculations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Retirement goals.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4><p className="text-sm text-muted-foreground">Return metrics.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Investment Goal Tracking</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain goal setting, progress monitoring, and adjustment strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Investment goal tracking</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How do I track investment goal progress?</h4><p className="text-muted-foreground">Calculate current value divided by goal amount for percentage; compare projected value to goal to assess if on track.</p></div>
          <div><h4 className="font-semibold mb-2">What if I'm behind my goal?</h4><p className="text-muted-foreground">Increase monthly contributions, extend timeline, adjust goal amount, or seek higher returns (with appropriate risk).</p></div>
          <div><h4 className="font-semibold mb-2">How often should I review progress?</h4><p className="text-muted-foreground">Monthly or quarterly; avoid checking too frequently (daily) as short-term volatility can cause unnecessary stress.</p></div>
          <div><h4 className="font-semibold mb-2">What is a realistic progress percentage?</h4><p className="text-muted-foreground">Depends on timeline; aim for steady progress; 70-90% at midpoint suggests on track.</p></div>
          <div><h4 className="font-semibold mb-2">How do market downturns affect tracking?</h4><p className="text-muted-foreground">Temporary declines are normal; maintain contributions during downturns; focus on long-term progress, not short-term fluctuations.</p></div>
          <div><h4 className="font-semibold mb-2">Should I adjust contributions based on progress?</h4><p className="text-muted-foreground">Yes—if ahead, consider maintaining or reducing; if behind, increase contributions to catch up.</p></div>
          <div><h4 className="font-semibold mb-2">Can I have multiple investment goals?</h4><p className="text-muted-foreground">Yes—track each separately; prioritize by timeline and importance; allocate contributions across goals.</p></div>
          <div><h4 className="font-semibold mb-2">What about inflation adjustments?</h4><p className="text-muted-foreground">Adjust goal amount for expected inflation; use real returns (nominal minus inflation) for more accurate projections.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is the projection?</h4><p className="text-muted-foreground">Based on assumed returns; actual returns vary, so projections are estimates; update as actual returns materialize.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include all investments in tracking?</h4><p className="text-muted-foreground">Include investments specifically allocated to goal; exclude emergency fund or other purpose-specific savings.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

