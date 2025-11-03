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
  homePrice: z.number().min(0).optional(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  currentSavings: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HouseDownPaymentSavingsCalculator() {
  const [result,setResult]=useState<{downPaymentNeeded:number; remaining:number; years:number; months:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{homePrice:undefined as unknown as number,downPaymentPercent:undefined as unknown as number,currentSavings:undefined as unknown as number,monthlyContribution:undefined as unknown as number,annualReturn:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.homePrice===undefined||v.downPaymentPercent===undefined||v.currentSavings===undefined||v.monthlyContribution===undefined||v.annualReturn===undefined){ setResult(null); return; }
    const needed=v.homePrice*(v.downPaymentPercent/100);
    const remaining=Math.max(0,needed-v.currentSavings);
    const r=v.annualReturn/100/12;
    let pv=v.currentSavings; let months=0; const maxMonths=600;
    while(pv<needed&&months<maxMonths){ pv=pv*(1+r)+v.monthlyContribution; months++; }
    const years=Math.floor(months/12); const remMonths=months%12;
    const interp=`Down payment needed: ${needed.toFixed(2)}. Remaining: ${remaining.toFixed(2)}. Time to save: ${years} years ${remMonths} months.`;
    setResult({downPaymentNeeded:needed,remaining,years,months:remMonths,interpretation:interp,suggestions:['Aim for 20% down to avoid PMI and get better rates.','Increase monthly savings to reach goal faster; even $100 extra makes a difference.','Consider down payment assistance programs or gifts if available.','Keep savings in safe, liquid accounts as purchase date approaches.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> House Down Payment Savings Calculator</CardTitle>
          <CardDescription>Calculate down payment needed, remaining amount to save, and timeline to reach your home purchase goal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="homePrice" render={({field})=>(<FormItem><FormLabel>Home Price</FormLabel><FormControl>{num('e.g., 300000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="downPaymentPercent" render={({field})=>(<FormItem><FormLabel>Down Payment (%)</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="currentSavings" render={({field})=>(<FormItem><FormLabel>Current Savings</FormLabel><FormControl>{num('e.g., 20000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyContribution" render={({field})=>(<FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl>{num('e.g., 1500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Down payment planning</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Down Payment Needed</p><p className="text-2xl font-bold">{result.downPaymentNeeded.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Remaining to Save</p><p className="text-2xl font-bold">{result.remaining.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Time to Goal</p><p className="text-2xl font-bold">{result.years} years {result.months} months</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Home purchase planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment Calculator</a></h4><p className="text-sm text-muted-foreground">Monthly payments.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Goal planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Savings growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget management.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Down Payment Savings</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain down payment requirements, PMI, savings strategies, and timeline planning.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Down payment savings</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How much down payment do I need?</h4><p className="text-muted-foreground">Conventional loans: 20% avoids PMI; FHA: 3.5% minimum; VA/USDA: 0% for qualified buyers; check lender requirements.</p></div>
          <div><h4 className="font-semibold mb-2">What is PMI?</h4><p className="text-muted-foreground">Private Mortgage Insurance required when down payment is less than 20%; adds 0.5-1% annually to loan cost; can be removed at 20% equity.</p></div>
          <div><h4 className="font-semibold mb-2">How long does it take to save for down payment?</h4><p className="text-muted-foreground">Depends on savings rate and home price; typically 2-5 years for 20% down; faster with higher income or lower prices.</p></div>
          <div><h4 className="font-semibold mb-2">Should I wait to save 20% down?</h4><p className="text-muted-foreground">Depends on market conditions; in rising markets, buying earlier with smaller down payment may be better than waiting for 20%.</p></div>
          <div><h4 className="font-semibold mb-2">What about closing costs?</h4><p className="text-muted-foreground">Closing costs are separate from down payment; typically 2-5% of home price; budget for both when planning purchase.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use gifted money for down payment?</h4><p className="text-muted-foreground">Yes—lenders allow gifts from family; requires gift letter and documentation; some lenders have restrictions on gift sources.</p></div>
          <div><h4 className="font-semibold mb-2">What if home prices rise while I'm saving?</h4><p className="text-muted-foreground">Adjust goal amount for expected appreciation; in hot markets, consider buying sooner with smaller down payment if affordable.</p></div>
          <div><h4 className="font-semibold mb-2">Where should I keep down payment savings?</h4><p className="text-muted-foreground">High-yield savings account or short-term CDs; prioritize safety and liquidity over returns as purchase date approaches.</p></div>
          <div><h4 className="font-semibold mb-2">Should I invest down payment money?</h4><p className="text-muted-foreground">Risky—market downturns can delay purchase; if timeline is 3+ years, consider conservative investments; avoid stocks near purchase date.</p></div>
          <div><h4 className="font-semibold mb-2">What are down payment assistance programs?</h4><p className="text-muted-foreground">State and local programs offer grants, loans, or tax credits; check eligibility based on income, location, and first-time buyer status.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


