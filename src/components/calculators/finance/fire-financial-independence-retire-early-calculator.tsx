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
  currentSavings: z.number().min(0).optional(),
  monthlySavings: z.number().min(0).optional(),
  annualExpenses: z.number().min(0).optional(),
  withdrawalRate: z.number().min(0).max(10).optional(),
  annualReturn: z.number().min(-100).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FIREFINANCIALINDEPENDENCERETIREEARLYCalculator() {
  const [result,setResult]=useState<{fireNumber:number; yearsToFire:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{currentSavings:undefined as unknown as number,monthlySavings:undefined as unknown as number,annualExpenses:undefined as unknown as number,withdrawalRate:undefined as unknown as number,annualReturn:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.annualExpenses===undefined||v.withdrawalRate===undefined||v.currentSavings===undefined||v.monthlySavings===undefined||v.annualReturn===undefined){ setResult(null); return; }
    const fireNum=v.annualExpenses/(v.withdrawalRate/100);
    const r=v.annualReturn/100/12;
    let pv=v.currentSavings; let months=0; const maxMonths=600;
    while(pv<fireNum&&months<maxMonths){ pv=pv*(1+r)+v.monthlySavings; months++; }
    const years=Math.floor(months/12);
    const interp=`FIRE number: ${fireNum.toFixed(2)}. Time to FIRE: ${years} years ${months%12} months.`;
    setResult({fireNumber:fireNum,yearsToFire:years,interpretation:interp,suggestions:['4% rule is common withdrawal rate; adjust for your risk tolerance and timeline.','Increase savings rate to reach FIRE faster; track expenses to reduce needed amount.','Diversify investments; aim for 7-8% long-term returns with appropriate asset allocation.','Review FIRE number annually as expenses, income, and goals change.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> FIRE (Financial Independence Retire Early) Calculator</CardTitle>
          <CardDescription>Calculate your FIRE number and timeline to financial independence using savings rate, expenses, and withdrawal rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="currentSavings" render={({field})=>(<FormItem><FormLabel>Current Savings</FormLabel><FormControl>{num('e.g., 50000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlySavings" render={({field})=>(<FormItem><FormLabel>Monthly Savings</FormLabel><FormControl>{num('e.g., 3000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualExpenses" render={({field})=>(<FormItem><FormLabel>Annual Expenses</FormLabel><FormControl>{num('e.g., 40000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="withdrawalRate" render={({field})=>(<FormItem><FormLabel>Withdrawal Rate (%)</FormLabel><FormControl>{num('e.g., 4',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualReturn" render={({field})=>(<FormItem><FormLabel>Annual Return (%)</FormLabel><FormControl>{num('e.g., 7',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>FIRE analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">FIRE Number</p><p className="text-2xl font-bold">{result.fireNumber.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Years to FIRE</p><p className="text-2xl font-bold">{result.yearsToFire} years</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Financial independence</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield Calculator</a></h4><p className="text-sm text-muted-foreground">Income streams.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Growth planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Retirement planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Expense tracking.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to FIRE</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain FIRE number, 4% rule, savings rate, and withdrawal strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>FIRE basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is FIRE?</h4><p className="text-muted-foreground">Financial Independence Retire Early: achieving financial freedom to work by choice, not necessity, through aggressive saving and investing.</p></div>
          <div><h4 className="font-semibold mb-2">What is the FIRE number?</h4><p className="text-muted-foreground">Total savings needed to support expenses indefinitely; typically calculated as annual expenses divided by withdrawal rate (e.g., 25x expenses for 4% rule).</p></div>
          <div><h4 className="font-semibold mb-2">What is the 4% rule?</h4><p className="text-muted-foreground">Withdraw 4% of initial portfolio value annually, adjusted for inflation; historically sustainable for 30-year retirements.</p></div>
          <div><h4 className="font-semibold mb-2">How much do I need to save?</h4><p className="text-muted-foreground">Typically 25-30x annual expenses; depends on withdrawal rate, timeline, and expected returns.</p></div>
          <div><h4 className="font-semibold mb-2">What savings rate is needed for FIRE?</h4><p className="text-muted-foreground">50-70% savings rate enables FIRE in 10-17 years; higher rate = faster timeline.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use a different withdrawal rate?</h4><p className="text-muted-foreground">3-3.5% for longer timelines (40+ years) or conservative planning; 4% for 30-year retirements; adjust for risk tolerance.</p></div>
          <div><h4 className="font-semibold mb-2">What about healthcare costs?</h4><p className="text-muted-foreground">Include healthcare in annual expenses; costs can be significant before Medicare eligibility; consider ACA plans or employer retiree benefits.</p></div>
          <div><h4 className="font-semibold mb-2">Can I FIRE with passive income?</h4><p className="text-muted-foreground">Yes—passive income can supplement or replace traditional withdrawal strategies; reduces reliance on portfolio withdrawals.</p></div>
          <div><h4 className="font-semibold mb-2">What investments should I use?</h4><p className="text-muted-foreground">Diversified portfolio: stocks for growth, bonds for stability; low-cost index funds; tax-advantaged accounts (401k, IRA) prioritized.</p></div>
          <div><h4 className="font-semibold mb-2">Is FIRE realistic for everyone?</h4><p className="text-muted-foreground">Depends on income, expenses, and goals; high earners with low expenses can FIRE quickly; others may need longer timelines or barista FIRE.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

