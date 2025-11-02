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
  targetAmount: z.number().min(0).optional(),
  currentSavings: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SavingsGoalTimelineCalculator() {
  const [result,setResult]=useState<{years:number; months:number; finalValue:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{targetAmount:undefined as unknown as number,currentSavings:undefined as unknown as number,monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.targetAmount===undefined||v.currentSavings===undefined||v.monthlyContribution===undefined||v.annualReturn===undefined){ setResult(null); return; }
    const r=v.annualReturn/100/12;
    let pv=v.currentSavings; let months=0; const maxMonths=600;
    while(pv<v.targetAmount&&months<maxMonths){ pv=pv*(1+r)+v.monthlyContribution; months++; }
    const years=Math.floor(months/12); const remMonths=months%12;
    const interp=`To reach ${v.targetAmount.toFixed(2)}: ${years} years ${remMonths} months. Final value: ${pv.toFixed(2)}.`;
    setResult({years,months:remMonths,finalValue:pv,interpretation:interp,suggestions:['Increase monthly contributions to reach goal faster.','Higher returns accelerate savings growth; balance risk vs return.','Review timeline annually and adjust contributions as income changes.','Consider automating monthly deposits to ensure consistency.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Savings Goal Timeline Calculator</CardTitle>
          <CardDescription>Calculate how long it will take to reach your savings goal with current contributions and expected returns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="targetAmount" render={({field})=>(<FormItem><FormLabel>Target Savings Amount</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentSavings" render={({field})=>(<FormItem><FormLabel>Current Savings</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 1000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Timeline to goal</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Time to Goal</p><p className="text-2xl font-bold">{result.years} years {result.months} months</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Final Value</p><p className="text-2xl font-bold">{result.finalValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Savings planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth calculations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Long-term goals.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">Emergency Fund Calculator</a></h4><p className="text-sm text-muted-foreground">Emergency planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Expense management.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Savings Goal Timeline</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain timeline calculation, contribution adjustments, and return assumptions.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Savings timeline</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How is savings timeline calculated?</h4><p className="text-muted-foreground">Uses compound interest formula with monthly contributions; projects when current savings plus contributions reach target.</p></div>
          <div><h4 className="font-semibold mb-2">What if I can't reach my goal?</h4><p className="text-muted-foreground">Increase monthly contributions, extend timeline, lower target amount, or seek higher returns (with appropriate risk).</p></div>
          <div><h4 className="font-semibold mb-2">How accurate is the timeline?</h4><p className="text-muted-foreground">Depends on return assumptions; actual returns vary, so timeline is an estimate based on average expected returns.</p></div>
          <div><h4 className="font-semibold mb-2">Should I assume higher returns to reach goal faster?</h4><p className="text-muted-foreground">Be conservative; use realistic returns (e.g., 6-8% for stocks long-term) rather than optimistic projections.</p></div>
          <div><h4 className="font-semibold mb-2">What if my contributions vary month to month?</h4><p className="text-muted-foreground">Use average monthly contribution; recalculate periodically as contributions change to adjust timeline.</p></div>
          <div><h4 className="font-semibold mb-2">Can I include one-time deposits?</h4><p className="text-muted-foreground">Add one-time deposits to current savings; this calculator assumes regular monthly contributions.</p></div>
          <div><h4 className="font-semibold mb-2">How does inflation affect my goal?</h4><p className="text-muted-foreground">Adjust target amount for expected inflation; if goal is $100k in today's dollars, target higher amount in future dollars.</p></div>
          <div><h4 className="font-semibold mb-2">What about taxes on investment returns?</h4><p className="text-muted-foreground">Use after-tax returns for taxable accounts; in tax-advantaged accounts (401k, IRA), use pre-tax returns.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate?</h4><p className="text-muted-foreground">Quarterly or when contributions change significantly; market returns will cause timeline to fluctuate.</p></div>
          <div><h4 className="font-semibold mb-2">Can I save for multiple goals simultaneously?</h4><p className="text-muted-foreground">Calculate each goal separately; prioritize goals by timeline and importance; allocate contributions across goals.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

