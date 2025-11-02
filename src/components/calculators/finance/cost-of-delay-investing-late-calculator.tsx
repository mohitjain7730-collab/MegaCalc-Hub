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
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
  yearsDelayed: z.number().min(0).max(100).optional(),
  yearsToRetirement: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfDelayInvestingLateCalculator() {
  const [result,setResult]=useState<{earlyValue:number; lateValue:number; costOfDelay:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number,yearsDelayed:undefined as unknown as number,yearsToRetirement:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.monthlyContribution===undefined||v.annualReturn===undefined||v.yearsDelayed===undefined||v.yearsToRetirement===undefined){ setResult(null); return; }
    const r=v.annualReturn/100/12;
    const totalMonthsEarly=v.yearsToRetirement*12;
    const totalMonthsLate=(v.yearsToRetirement-v.yearsDelayed)*12;
    let early=0; let late=0;
    for(let i=0;i<totalMonthsEarly;i++){ early=early*(1+r)+v.monthlyContribution; }
    for(let i=0;i<totalMonthsLate;i++){ late=late*(1+r)+v.monthlyContribution; }
    const cost=early-late;
    const interp=`Starting ${v.yearsDelayed} years late costs ${cost.toFixed(2)}. Early: ${early.toFixed(2)}, Late: ${late.toFixed(2)}.`;
    setResult({earlyValue:early,lateValue:late,costOfDelay:cost,interpretation:interp,suggestions:['Time in market beats timing; start investing as early as possible.','Even small delays compound into significant wealth differences.','If delayed, increase contributions to partially offset lost time.','Automate investments to avoid procrastination and delays.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Cost of Delay (Investing Late) Calculator</CardTitle>
          <CardDescription>Compare wealth accumulation when starting early vs delaying investment by showing the cost of procrastination.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="yearsDelayed" render={({field})=>(<FormItem><FormLabel>Years Delayed</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="yearsToRetirement" render={({field})=>(<FormItem><FormLabel>Years to Retirement</FormLabel><FormControl>{num('e.g., 30',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Cost of delay analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Starting Early Value</p><p className="text-2xl font-bold text-green-600">{result.earlyValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Starting Late Value</p><p className="text-2xl font-bold">{result.lateValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Cost of Delay</p><p className="text-2xl font-bold text-red-600">{result.costOfDelay.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Investment timing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Time value of money.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Goal planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Retirement planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Investment income.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Cost of Delay</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain compound interest impact, opportunity cost, and strategies to catch up.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Investment delay costs</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the cost of delay?</h4><p className="text-muted-foreground">The difference in final portfolio value between starting to invest early versus delaying; demonstrates opportunity cost of procrastination.</p></div>
          <div><h4 className="font-semibold mb-2">Why does delay cost so much?</h4><p className="text-muted-foreground">Compound interest means earlier contributions have more time to grow; missing early years forfeits significant compounding.</p></div>
          <div><h4 className="font-semibold mb-2">Can I catch up if I started late?</h4><p className="text-muted-foreground">Yes—increase contributions significantly or work longer; delay still costs, but higher contributions can partially offset lost time.</p></div>
          <div><h4 className="font-semibold mb-2">How much more do I need to save if delayed?</h4><p className="text-muted-foreground">Calculate required monthly contribution to match early investor's final value; typically requires 30-50% higher contributions.</p></div>
          <div><h4 className="font-semibold mb-2">Does delaying by just one year matter?</h4><p className="text-muted-foreground">Yes—even one year can cost tens of thousands over long horizons due to compound interest on that year's contributions.</p></div>
          <div><h4 className="font-semibold mb-2">What if I can't invest much early?</h4><p className="text-muted-foreground">Start small—even $50-100 monthly compounds significantly; increase contributions as income grows; consistency matters more than amount.</p></div>
          <div><h4 className="font-semibold mb-2">Should I wait for better returns before starting?</h4><p className="text-muted-foreground">No—time in market beats timing; start immediately; dollar-cost averaging smooths entry points; waiting is costly.</p></div>
          <div><h4 className="font-semibold mb-2">How does delay affect retirement age?</h4><p className="text-muted-foreground">Delay may require working longer to accumulate sufficient wealth; starting early can enable earlier retirement with same savings rate.</p></div>
          <div><h4 className="font-semibold mb-2">What about investing during market downturns?</h4><p className="text-muted-foreground">Downturns are buying opportunities for long-term investors; starting during downturns can outperform starting at peaks.</p></div>
          <div><h4 className="font-semibold mb-2">Is it ever too late to start?</h4><p className="text-muted-foreground">Never too late—but delay has permanent cost; start now with maximum affordable contributions to minimize further opportunity cost.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

