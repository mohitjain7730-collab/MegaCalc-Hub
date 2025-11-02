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
  monthlyExpenses: z.number().min(0).optional(),
  monthsCoverage: z.number().min(0).max(24).optional(),
  monthlyIncome: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmergencyFundRequirementCalculator() {
  const [result,setResult]=useState<{emergencyFund:number; monthsOfIncome:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{monthlyExpenses:undefined as unknown as number,monthsCoverage:undefined as unknown as number,monthlyIncome:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.monthlyExpenses===undefined||v.monthsCoverage===undefined){ setResult(null); return; }
    const ef=v.monthlyExpenses*v.monthsCoverage;
    const moi=v.monthlyIncome!==undefined&&v.monthlyIncome>0?(ef/v.monthlyIncome):NaN;
    const interp=`Emergency fund needed: ${ef.toFixed(2)} for ${v.monthsCoverage} months of expenses. ${Number.isFinite(moi)?`Equals ${moi.toFixed(1)} months of income.`:''}`;
    setResult({emergencyFund:ef,monthsOfIncome:moi,interpretation:interp,suggestions:['Emergency fund covers 3-6 months of essential expenses (not discretionary).','Increase to 6-12 months if income is irregular, high risk, or single income household.','Keep emergency fund in liquid, low-risk accounts (high-yield savings, money market).','Review and adjust annually based on life changes, expenses, and income stability.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Emergency Fund Requirement Calculator</CardTitle>
          <CardDescription>Calculate how much emergency fund you need based on monthly expenses and desired coverage period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="monthlyExpenses" render={({field})=>(<FormItem><FormLabel>Monthly Essential Expenses</FormLabel><FormControl>{num('e.g., 3000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthsCoverage" render={({field})=>(<FormItem><FormLabel>Months of Coverage</FormLabel><FormControl>{num('e.g., 6',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="monthlyIncome" render={({field})=>(<FormItem><FormLabel>Monthly Income (optional)</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Emergency fund calculation</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Emergency Fund Target</p><p className="text-2xl font-bold">{result.emergencyFund.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Months of Income</p><p className="text-2xl font-bold">{Number.isFinite(result.monthsOfIncome)?result.monthsOfIncome.toFixed(1):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Personal finance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Expense planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Savings growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/credit-card-payoff-calculator" className="text-primary hover:underline">Credit Card Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Debt management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Long-term planning.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Emergency Funds</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain emergency fund purpose, how much to save, and where to keep it.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Emergency fund planning</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is an emergency fund?</h4><p className="text-muted-foreground">Savings set aside to cover unexpected expenses or income loss, providing financial security during emergencies.</p></div>
          <div><h4 className="font-semibold mb-2">How much should I save?</h4><p className="text-muted-foreground">Typically 3-6 months of essential expenses; increase to 6-12 months for irregular income or higher risk.</p></div>
          <div><h4 className="font-semibold mb-2">What expenses should I include?</h4><p className="text-muted-foreground">Essential expenses only: housing, utilities, food, insurance, minimum debt payments; exclude discretionary spending.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include investment accounts?</h4><p className="text-muted-foreground">No—emergency fund should be separate from investments; keep in liquid, low-risk accounts for immediate access.</p></div>
          <div><h4 className="font-semibold mb-2">Where should I keep my emergency fund?</h4><p className="text-muted-foreground">High-yield savings accounts, money market accounts, or short-term CDs; prioritize liquidity and safety over returns.</p></div>
          <div><h4 className="font-semibold mb-2">What counts as an emergency?</h4><p className="text-muted-foreground">Job loss, medical emergencies, major home/car repairs, unexpected tax bills; not vacations or routine purchases.</p></div>
          <div><h4 className="font-semibold mb-2">How to build an emergency fund?</h4><p className="text-muted-foreground">Start small, save consistently (automate transfers), reduce expenses, use windfalls, and build gradually over time.</p></div>
          <div><h4 className="font-semibold mb-2">Should I pay off debt first?</h4><p className="text-muted-foreground">Build a small buffer (1 month) first, then balance debt payoff with emergency fund growth based on interest rates.</p></div>
          <div><h4 className="font-semibold mb-2">What if I use my emergency fund?</h4><p className="text-muted-foreground">Replenish it as soon as possible; resume regular contributions until reaching your target amount again.</p></div>
          <div><h4 className="font-semibold mb-2">Does emergency fund need change over time?</h4><p className="text-muted-foreground">Yes—recalculate annually as expenses change; life events (marriage, kids, house) may require larger fund.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

