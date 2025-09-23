
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  currentAge: z.number().int().positive(),
  retirementAge: z.number().int().positive(),
  currentBalance: z.number().nonnegative(),
  annualSalary: z.number().positive(),
  monthlyContributionPercent: z.number().nonnegative(),
  annualReturn: z.number().positive(),
  employerMatchPercent: z.number().nonnegative(),
  employerMatchLimit: z.number().nonnegative(),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["retirementAge"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalBalance: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalInterest: number;
  chartData: { 
    age: number; 
    yourContributions: number; 
    employerContributions: number;
    interest: number;
    total: number;
  }[];
}

export default function FourOhOneKCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      retirementAge: undefined,
      currentBalance: undefined,
      annualSalary: undefined,
      monthlyContributionPercent: undefined,
      annualReturn: undefined,
      employerMatchPercent: undefined,
      employerMatchLimit: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { currentAge, retirementAge, currentBalance, annualSalary, monthlyContributionPercent, annualReturn, employerMatchPercent, employerMatchLimit } = values;

    const monthlySalary = annualSalary / 12;
    const monthlyContribution = monthlySalary * (monthlyContributionPercent / 100);
    const maxMatchContribution = monthlySalary * (employerMatchLimit / 100);
    const employerMatch = Math.min(monthlyContribution, maxMatchContribution) * (employerMatchPercent / 100);

    const rMonthly = annualReturn / 12 / 100;
    const n = (retirementAge - currentAge) * 12;

    const totalMonthlyInput = monthlyContribution + employerMatch;
    
    let futureValue = currentBalance;
    let totalContributions = currentBalance;
    let totalEmployerMatch = 0;

    const chartData = [];
    
    for (let year = 1; year <= retirementAge - currentAge; year++) {
      let fvAtYearEnd = currentBalance * Math.pow(1 + rMonthly, year * 12);
      let fvContributions = 0;
      if (rMonthly > 0) {
        fvContributions = (monthlyContribution + employerMatch) * ((Math.pow(1 + rMonthly, year * 12) - 1) / rMonthly);
      } else {
        fvContributions = (monthlyContribution + employerMatch) * (year * 12);
      }

      const total = fvAtYearEnd + fvContributions;
      const yourContributions = currentBalance + (monthlyContribution * year * 12);
      const employerContributions = employerMatch * year * 12;
      const interest = total - yourContributions - employerContributions;

      chartData.push({
        age: currentAge + year,
        yourContributions: Math.round(yourContributions),
        employerContributions: Math.round(employerContributions),
        interest: Math.round(interest),
        total: Math.round(total),
      });
    }

    if(chartData.length > 0) {
      const finalData = chartData[chartData.length - 1];
      setResult({
        totalBalance: finalData.total,
        totalContributions: finalData.yourContributions,
        totalEmployerMatch: finalData.employerContributions,
        totalInterest: finalData.interest,
        chartData,
      });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentAge" render={({ field }) => ( <FormItem><FormLabel>Current Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="retirementAge" render={({ field }) => ( <FormItem><FormLabel>Retirement Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="currentBalance" render={({ field }) => ( <FormItem><FormLabel>Current 401(k) Balance</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="annualSalary" render={({ field }) => ( <FormItem><FormLabel>Annual Salary</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="monthlyContributionPercent" render={({ field }) => ( <FormItem><FormLabel>Your Contribution (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="annualReturn" render={({ field }) => ( <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="employerMatchPercent" render={({ field }) => ( <FormItem><FormLabel>Employer Match (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="employerMatchLimit" render={({ field }) => ( <FormItem><FormLabel>Employer Match Limit (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>401(k) Projection</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Estimated Balance at Retirement</CardDescription>
                        <p className="text-3xl font-bold">${result.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div><CardDescription>Your Contributions</CardDescription><p className="text-xl font-semibold">${result.totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        <div><CardDescription>Employer Match</CardDescription><p className="text-xl font-semibold">${result.totalEmployerMatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        <div><CardDescription>Total Interest</CardDescription><p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                    </div>
                </div>
                 <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} stackOffset="expand" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" unit="yrs" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value: number, name: string, props) => `$${(props.payload[name]).toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="yourContributions" stackId="1" name="Your Contributions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                      <Area type="monotone" dataKey="employerContributions" stackId="1" name="Employer Match" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                      <Area type="monotone" dataKey="interest" stackId="1" name="Interest Earned" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-401k">
          <AccordionTrigger>What is a 401(k)?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>A 401(k) is a retirement savings plan sponsored by an employer. It lets workers save and invest a piece of their paycheck before taxes are taken out. Taxes aren't paid until the money is withdrawn from the account. A key feature is the potential for an employer match, which is essentially free money contributed by your employer to your retirement account.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator projects the growth of your 401(k) by combining the future value of your current balance with the future value of your ongoing contributions, including the employer match.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Employer Match:</strong> First, it calculates the monthly employer match based on your salary, contribution percentage, and the company's match policy.</li>
                    <li><strong>Future Value of Balance:</strong> It calculates how your current balance will grow on its own using a standard compound interest formula.</li>
                    <li><strong>Future Value of Contributions:</strong> It then calculates the future value of your monthly contributions plus the employer match using the formula for a series of regular payments (an annuity).</li>
                    <li>The total projected balance is the sum of these two future values.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on 401(k) plans and retirement planning, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/retirement/401k-calculator/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: 401(k) Calculator</a></li>
                  <li><a href="https://www.irs.gov/retirement-plans/plan-sponsor/401k-resource-guide-plan-sponsors" target="_blank" rel="noopener noreferrer" className="text-primary underline">IRS: 401(k) Resource Guide</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    