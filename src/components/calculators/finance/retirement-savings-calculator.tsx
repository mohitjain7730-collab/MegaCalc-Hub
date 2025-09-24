
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  currentAge: z.number().int().positive(),
  retirementAge: z.number().int().positive(),
  currentSavings: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  annualReturn: z.number().positive(),
  targetCorpus: z.number().positive().optional(),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["retirementAge"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalSavings: number;
  totalInvested: number;
  totalInterest: number;
  requiredMonthlyContribution?: number;
  chartData: { age: number; totalInvested: number; futureValue: number }[];
}

export default function RetirementSavingsCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationMode, setCalculationMode] = useState<'project' | 'target'>('project');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      retirementAge: undefined,
      currentSavings: undefined,
      monthlyContribution: undefined,
      annualReturn: undefined,
      targetCorpus: undefined,
    },
  });
  
  const calculateRetirement = (values: FormValues) => {
    const { currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, targetCorpus } = values;
    
    const rMonthly = annualReturn / 12 / 100;
    const n = (retirementAge - currentAge) * 12;

    let contribution = monthlyContribution;

    if (calculationMode === 'target' && targetCorpus) {
        const fvCurrent = currentSavings * Math.pow(1 + rMonthly, n);
        const numerator = targetCorpus - fvCurrent;
        const denominator = (Math.pow(1 + rMonthly, n) - 1) / rMonthly;
        if (denominator > 0 && numerator > 0) {
            contribution = numerator / denominator;
        } else {
            contribution = 0;
        }
    }


    const chartData = [];
    
    for (let year = 1; year <= retirementAge - currentAge; year++) {
      const currentN = year * 12;
      const age = currentAge + year;

      const fvCurrentSavings = currentSavings * Math.pow(1 + rMonthly, currentN);
      const fvMonthlyContributions = (contribution || 0) * ((Math.pow(1 + rMonthly, currentN) - 1) / rMonthly);
      
      const futureValue = fvCurrentSavings + fvMonthlyContributions;
      const yearEndTotalInvestment = currentSavings + ((contribution || 0) * currentN);
      
      chartData.push({
        age: age,
        totalInvested: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(futureValue),
      });
    }

    const totalSavings = chartData.length > 0 ? chartData[chartData.length - 1].futureValue : currentSavings;
    const totalInvested = currentSavings + ((contribution || 0) * n);
    const totalInterest = totalSavings - totalInvested;

    setResult({ 
        totalSavings, 
        totalInvested, 
        totalInterest, 
        chartData, 
        requiredMonthlyContribution: calculationMode === 'target' ? contribution : undefined
    });
  };


  return (
    <div className="space-y-8">
       <Tabs defaultValue="project" onValueChange={(value) => setCalculationMode(value as 'project' | 'target')}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project">Project My Savings</TabsTrigger>
            <TabsTrigger value="target">Calculate for a Target</TabsTrigger>
        </TabsList>
      </Tabs>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(calculateRetirement)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentAge" render={({ field }) => ( <FormItem><FormLabel>Current Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="retirementAge" render={({ field }) => ( <FormItem><FormLabel>Retirement Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="currentSavings" render={({ field }) => ( <FormItem><FormLabel>Current Savings</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="annualReturn" render={({ field }) => ( <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            
            {calculationMode === 'project' ? (
                <FormField control={form.control} name="monthlyContribution" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Monthly Contribution</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            ) : (
                <FormField control={form.control} name="targetCorpus" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Target Retirement Corpus</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            )}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Retirement Projection</CardTitle></div></CardHeader>
            <CardContent>
                {calculationMode === 'project' ? (
                    <div className="text-center space-y-4">
                        <div>
                            <CardDescription>Estimated Savings at Retirement</CardDescription>
                            <p className="text-3xl font-bold">${result.totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div><CardDescription>Total Invested</CardDescription><p className="text-xl font-semibold">${result.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                            <div><CardDescription>Total Interest Earned</CardDescription><p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <CardDescription>Required Monthly Contribution to reach your goal</CardDescription>
                        {result.requiredMonthlyContribution !== undefined && result.requiredMonthlyContribution > 0 ? (
                           <p className="text-3xl font-bold">${result.requiredMonthlyContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        ) : (
                           <p className="text-lg text-destructive">Your current savings and returns already meet or exceed your goal. No additional monthly contribution is required.</p>
                        )}
                    </div>
                )}
                 <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorFv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" unit="yrs" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="totalInvested" name="Total Invested" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorInv)" />
                      <Area type="monotone" dataKey="futureValue" name="Projected Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-retirement-planning">
          <AccordionTrigger>What is Retirement Planning?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Retirement planning is the process of setting retirement income goals and the decisions and actions necessary to achieve those goals. It includes identifying sources of income, estimating expenses, implementing a savings program, and managing assets and risk. The power of compounding makes it crucial to start saving early.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current Age & Retirement Age</h4>
                  <p>Your current age and the age you plan to retire. The difference between these two determines your investment horizon.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current Savings</h4>
                  <p>The total amount you have already saved for retirement.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Monthly Contribution</h4>
                  <p>The amount you plan to save and invest towards retirement each month.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Expected Annual Return (%)</h4>
                  <p>The average annual growth rate you expect from your investments. This varies based on risk (e.g., stocks vs. bonds).</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Target Retirement Corpus</h4>
                  <p>The total amount of money you aim to have saved by the time you retire.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses standard future value (FV) formulas to project growth. It calculates two main components:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Future Value of Current Savings:</strong> It projects how your existing savings will grow over time, untouched, based on the annual return rate. The formula is `FV = S * (1 + r)^n`.</li>
                    <li><strong>Future Value of Monthly Contributions:</strong> It calculates the future value of an ordinary annuity to determine how your series of monthly contributions will grow.</li>
                </ol>
                <p>The total retirement corpus is the sum of these two values. When calculating for a target, it rearranges the formula to solve for the required monthly contribution.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more comprehensive information on retirement planning, consult these authoritative sources. The formulas used in this calculator are based on principles widely accepted in finance.</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/articles/retirement/04/090204.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: The 4% Rule and Other Retirement Planning Calculators</a></li>
                  <li><a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/introduction-to-retirement-planning" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute: Introduction to Retirement Planning</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
