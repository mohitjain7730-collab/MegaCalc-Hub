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
  monthlyIncome: z.number().min(0).optional(),
  housing: z.number().min(0).optional(),
  utilities: z.number().min(0).optional(),
  food: z.number().min(0).optional(),
  transportation: z.number().min(0).optional(),
  healthcare: z.number().min(0).optional(),
  insurance: z.number().min(0).optional(),
  debtPayments: z.number().min(0).optional(),
  savings: z.number().min(0).optional(),
  other: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MonthlyBudgetPlannerCalculator() {
  const [result,setResult]=useState<{totalExpenses:number; netRemaining:number; savingsRate:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{monthlyIncome:undefined as unknown as number,housing:undefined as unknown as number,utilities:undefined as unknown as number,food:undefined as unknown as number,transportation:undefined as unknown as number,healthcare:undefined as unknown as number,insurance:undefined as unknown as number,debtPayments:undefined as unknown as number,savings:undefined as unknown as number,other:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.monthlyIncome===undefined){ setResult(null); return; }
    const exp=(v.housing||0)+(v.utilities||0)+(v.food||0)+(v.transportation||0)+(v.healthcare||0)+(v.insurance||0)+(v.debtPayments||0)+(v.other||0);
    const totalExp=exp+(v.savings||0);
    const rem=v.monthlyIncome-totalExp;
    const sr=v.monthlyIncome>0?((v.savings||0)/v.monthlyIncome)*100:0;
    const interp=rem>=0?`Budget balanced. Net remaining: ${rem.toFixed(2)}. Savings rate: ${sr.toFixed(1)}%.`:`Budget deficit: ${Math.abs(rem).toFixed(2)}. Expenses exceed income by ${Math.abs(rem).toFixed(2)}.`;
    setResult({totalExpenses:totalExp,netRemaining:rem,savingsRate:sr,interpretation:interp,suggestions:['Aim for 50/30/20 rule: 50% needs, 30% wants, 20% savings/debt.','Track actual spending vs budget monthly and adjust categories.','Automate savings and debt payments to prioritize these expenses.','Review and update budget quarterly to reflect income and expense changes.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Monthly Budget Planner Calculator</CardTitle>
          <CardDescription>Plan and track your monthly budget by income and expense categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="monthlyIncome" render={({field})=>(<FormItem><FormLabel>Monthly Income</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="housing" render={({field})=>(<FormItem><FormLabel>Housing (rent/mortgage)</FormLabel><FormControl>{num('e.g., 1500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="utilities" render={({field})=>(<FormItem><FormLabel>Utilities</FormLabel><FormControl>{num('e.g., 200',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="food" render={({field})=>(<FormItem><FormLabel>Food/Groceries</FormLabel><FormControl>{num('e.g., 500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="transportation" render={({field})=>(<FormItem><FormLabel>Transportation</FormLabel><FormControl>{num('e.g., 400',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="healthcare" render={({field})=>(<FormItem><FormLabel>Healthcare</FormLabel><FormControl>{num('e.g., 300',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="insurance" render={({field})=>(<FormItem><FormLabel>Insurance</FormLabel><FormControl>{num('e.g., 250',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="debtPayments" render={({field})=>(<FormItem><FormLabel>Debt Payments</FormLabel><FormControl>{num('e.g., 500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="savings" render={({field})=>(<FormItem><FormLabel>Savings</FormLabel><FormControl>{num('e.g., 1000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="other" render={({field})=>(<FormItem><FormLabel>Other Expenses</FormLabel><FormControl>{num('e.g., 350',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Budget summary</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold">{result.totalExpenses.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Net Remaining</p><p className={`text-2xl font-bold ${result.netRemaining>=0?'text-green-600':'text-red-600'}`}>{result.netRemaining.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Savings Rate (%)</p><p className="text-2xl font-bold">{result.savingsRate.toFixed(1)}%</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Personal finance tools</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">Emergency Fund Calculator</a></h4><p className="text-sm text-muted-foreground">Emergency savings.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Debt strategy.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Savings planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Long-term planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Monthly Budgeting</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain budgeting principles, expense tracking, and budget optimization strategies.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Budget planning</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How do I create a monthly budget?</h4><p className="text-muted-foreground">List all income sources, categorize expenses, set spending limits per category, and track actual spending monthly.</p></div>
          <div><h4 className="font-semibold mb-2">What is the 50/30/20 rule?</h4><p className="text-muted-foreground">Budget guideline: 50% for needs (housing, utilities, food), 30% for wants, 20% for savings and debt payoff.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include savings in my budget?</h4><p className="text-muted-foreground">Yes—treat savings as a fixed expense; pay yourself first to build wealth and achieve financial goals.</p></div>
          <div><h4 className="font-semibold mb-2">What if my expenses exceed income?</h4><p className="text-muted-foreground">Reduce discretionary spending, negotiate bills, increase income, or restructure debt to balance your budget.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I review my budget?</h4><p className="text-muted-foreground">Review monthly to compare actual vs planned spending; update quarterly for major life changes or income shifts.</p></div>
          <div><h4 className="font-semibold mb-2">What categories should I track?</h4><p className="text-muted-foreground">Essential: housing, utilities, food, transportation, healthcare, insurance, debt. Optional: entertainment, dining, shopping.</p></div>
          <div><h4 className="font-semibold mb-2">How to stick to my budget?</h4><p className="text-muted-foreground">Use envelope method, automate savings, track expenses daily, set realistic limits, and reward yourself for milestones.</p></div>
          <div><h4 className="font-semibold mb-2">Should I budget for irregular expenses?</h4><p className="text-muted-foreground">Yes—create sinking funds for annual expenses (insurance, taxes, holidays) by saving monthly amounts.</p></div>
          <div><h4 className="font-semibold mb-2">What about variable income?</h4><p className="text-muted-foreground">Base budget on average or minimum income; save surplus in high months to cover low months.</p></div>
          <div><h4 className="font-semibold mb-2">Can I adjust my budget during the month?</h4><p className="text-muted-foreground">Yes—budgets are flexible tools; adjust categories if needed, but avoid reducing savings to cover overspending.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

