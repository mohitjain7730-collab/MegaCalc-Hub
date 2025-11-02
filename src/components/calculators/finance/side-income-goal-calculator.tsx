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
  targetMonthlyIncome: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  hoursPerWeek: z.number().min(0).max(168).optional(),
  weeksPerMonth: z.number().min(0).max(4.5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SideIncomeGoalCalculator() {
  const [result,setResult]=useState<{monthlyIncome:number; hoursNeeded:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{targetMonthlyIncome:undefined as unknown as number,hourlyRate:undefined as unknown as number,hoursPerWeek:undefined as unknown as number,weeksPerMonth:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    if(v.targetMonthlyIncome===undefined||v.hourlyRate===undefined){ setResult(null); return; }
    const hoursNeeded=v.targetMonthlyIncome/v.hourlyRate;
    const monthlyIncome=(v.hoursPerWeek||0)*(v.weeksPerMonth||4.33)*v.hourlyRate;
    const interp=hoursNeeded>0?`To reach ${v.targetMonthlyIncome.toFixed(2)}/month: ${hoursNeeded.toFixed(1)} hours needed. Current: ${monthlyIncome.toFixed(2)}/month.`:`Invalid inputs.`;
    setResult({monthlyIncome,hoursNeeded,interpretation:interp,suggestions:['Increase hourly rate through skills, certifications, or premium services.','Optimize hours worked; balance with main job and personal time.','Consider multiple income streams: freelance, passive, investments.','Track actual hours and income to refine calculations and goals.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Side Income Goal Calculator</CardTitle>
          <CardDescription>Calculate hours needed or monthly income potential from side work based on hourly rate and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="targetMonthlyIncome" render={({field})=>(<FormItem><FormLabel>Target Monthly Income</FormLabel><FormControl>{num('e.g., 2000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="hourlyRate" render={({field})=>(<FormItem><FormLabel>Hourly Rate</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="hoursPerWeek" render={({field})=>(<FormItem><FormLabel>Hours Per Week (optional)</FormLabel><FormControl>{num('e.g., 10',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="weeksPerMonth" render={({field})=>(<FormItem><FormLabel>Weeks Per Month (optional)</FormLabel><FormControl>{num('e.g., 4.33',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Side income analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Hours Needed</p><p className="text-2xl font-bold">{result.hoursNeeded.toFixed(1)} hours</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Current Monthly Income</p><p className="text-2xl font-bold">{result.monthlyIncome.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Income planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Investment growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">Retirement Savings Calculator</a></h4><p className="text-sm text-muted-foreground">Retirement planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">Emergency Fund Calculator</a></h4><p className="text-sm text-muted-foreground">Emergency savings.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Side Income Goals</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain side income strategies, rate negotiation, and time management.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Side income planning</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">How do I calculate side income goals?</h4><p className="text-muted-foreground">Target monthly income divided by hourly rate equals hours needed; or hours × rate × weeks = monthly income.</p></div>
          <div><h4 className="font-semibold mb-2">What is a realistic side income target?</h4><p className="text-muted-foreground">Depends on time available; $500-2000/month is common; aim for 10-20% of main income or specific savings goal.</p></div>
          <div><h4 className="font-semibold mb-2">How can I increase my hourly rate?</h4><p className="text-muted-foreground">Develop specialized skills, earn certifications, build portfolio, raise rates gradually, focus on high-value clients.</p></div>
          <div><h4 className="font-semibold mb-2">Should I focus on hours or rate?</h4><p className="text-muted-foreground">Rate is more scalable; increasing rate by 20% beats working 20% more hours due to time constraints and tax efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">How many hours per week is sustainable?</h4><p className="text-muted-foreground">5-15 hours typical; depends on main job demands, energy levels, and personal commitments; avoid burnout.</p></div>
          <div><h4 className="font-semibold mb-2">What about taxes on side income?</h4><p className="text-muted-foreground">Set aside 25-30% for taxes; track expenses for deductions; consider quarterly estimated payments if significant income.</p></div>
          <div><h4 className="font-semibold mb-2">Can side income become passive?</h4><p className="text-muted-foreground">Some side work can evolve into passive: digital products, courses, royalties, investments, automated businesses.</p></div>
          <div><h4 className="font-semibold mb-2">Should I prioritize high-rate or steady work?</h4><p className="text-muted-foreground">Balance both; steady work provides reliability; high-rate work accelerates goals; mix according to risk tolerance.</p></div>
          <div><h4 className="font-semibold mb-2">How to track side income progress?</h4><p className="text-muted-foreground">Use spreadsheet or app to log hours, income, rate, and expenses; review monthly to adjust strategy.</p></div>
          <div><h4 className="font-semibold mb-2">What if I can't meet my goal?</h4><p className="text-muted-foreground">Adjust timeline, increase hours if possible, raise rates, or lower target; consistency matters more than perfection.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

