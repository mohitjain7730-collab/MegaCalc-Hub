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
  currentCost: z.number().min(0).optional(),
  yearsUntilEducation: z.number().min(0).max(100).optional(),
  educationInflation: z.number().min(-100).max(100).optional(),
  currentSavings: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChildEducationFundCalculator() {
  const [result,setResult]=useState<{futureCost:number; requiredAmount:number; projectedValue:number; shortfall:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentCost:undefined as unknown as number,yearsUntilEducation:undefined as unknown as number,educationInflation:undefined as unknown as number,currentSavings:undefined as unknown as number,monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.currentCost===undefined||v.yearsUntilEducation===undefined||v.educationInflation===undefined||v.currentSavings===undefined||v.monthlyContribution===undefined||v.annualReturn===undefined){ setResult(null); return; }
    const r=v.educationInflation/100;
    const futureCost=v.currentCost*Math.pow(1+r,v.yearsUntilEducation);
    const ret=v.annualReturn/100/12;
    let pv=v.currentSavings;
    for(let i=0;i<v.yearsUntilEducation*12;i++){ pv=pv*(1+ret)+v.monthlyContribution; }
    const shortfall=Math.max(0,futureCost-pv);
    const interp=`Future cost: ${futureCost.toFixed(2)}. Projected savings: ${pv.toFixed(2)}. ${shortfall>0?`Shortfall: ${shortfall.toFixed(2)}`:'On track'}.`;
    setResult({futureCost,requiredAmount:futureCost,projectedValue:pv,shortfall,interpretation:interp,suggestions:['Education costs inflate faster than general inflation (typically 5-7% annually).','Start early to leverage compound interest; even small contributions add up over 15-18 years.','Consider 529 plans or education-specific savings accounts for tax benefits.','Review and adjust contributions annually as child ages and education costs become clearer.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Child Education Fund Calculator</CardTitle>
          <CardDescription>Calculate future education costs, required savings, and projected fund value for your child's education.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="currentCost" render={({field})=>(<FormItem><FormLabel>Current Education Cost (annual)</FormLabel><FormControl>{num('e.g., 25000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="yearsUntilEducation" render={({field})=>(<FormItem><FormLabel>Years Until Education</FormLabel><FormControl>{num('e.g., 15',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="educationInflation" render={({field})=>(<FormItem><FormLabel>Education Inflation Rate (%)</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentSavings" render={({field})=>(<FormItem><FormLabel>Current Savings</FormLabel><FormControl>{num('e.g., 10000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl>{num('e.g., 8',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Education fund analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Future Cost (annual)</p><p className="text-2xl font-bold">{result.futureCost.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Projected Savings</p><p className="text-2xl font-bold">{result.projectedValue.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Shortfall</p><p className={`text-2xl font-bold ${result.shortfall>0?'text-red-600':'text-green-600'}`}>{result.shortfall.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Education planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/college-savings-goal-calculator" className="text-primary hover:underline">College Savings Goal Calculator</a></h4><p className="text-sm text-muted-foreground">College planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/inflation-adjusted-savings-goal-calculator" className="text-primary hover:underline">Inflation-Adjusted Savings Goal</a></h4><p className="text-sm text-muted-foreground">Cost adjustment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Timeline planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Child Education Fund</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain education costs, 529 plans, savings strategies, and inflation considerations.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Education fund planning</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How much do I need for my child's education?</h4><p className="text-muted-foreground">Depends on school type and duration; public college: $100-200k; private: $200-400k+ per child; adjust for inflation.</p></div>
          <div><h4 className="font-semibold mb-2">What is education inflation rate?</h4><p className="text-muted-foreground">Typically 5-7% annually, higher than general inflation; includes tuition, fees, room, board, and other costs.</p></div>
          <div><h4 className="font-semibold mb-2">When should I start saving?</h4><p className="text-muted-foreground">As early as possible—preferably at birth; compound interest works best with 15-18 year time horizon.</p></div>
          <div><h4 className="font-semibold mb-2">What are 529 plans?</h4><p className="text-muted-foreground">Tax-advantaged savings plans for education; earnings grow tax-free if used for qualified education expenses.</p></div>
          <div><h4 className="font-semibold mb-2">How much should I contribute monthly?</h4><p className="text-muted-foreground">Depends on timeline and goal; $200-500 monthly typical; start early and increase as income grows.</p></div>
          <div><h4 className="font-semibold mb-2">Should I save for multiple children?</h4><p className="text-muted-foreground">Calculate separately for each child; consider age differences; adjust contributions based on proximity to college.</p></div>
          <div><h4 className="font-semibold mb-2">What if I'm behind on savings?</h4><p className="text-muted-foreground">Increase monthly contributions, consider scholarships/grants, or use student loans for gap; prioritize high-return investments.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use retirement accounts for education?</h4><p className="text-muted-foreground">IRA withdrawals for education avoid early withdrawal penalty but still taxed; prioritize education accounts first.</p></div>
          <div><h4 className="font-semibold mb-2">What investment strategy should I use?</h4><p className="text-muted-foreground">Aggressive when child is young; gradually shift to conservative as education approaches; age-based portfolios available.</p></div>
          <div><h4 className="font-semibold mb-2">What if my child doesn't go to college?</h4><p className="text-muted-foreground">529 funds can be used for other education, transferred to another child, or withdrawn with penalty; flexible options exist.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

