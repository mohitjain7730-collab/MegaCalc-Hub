
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
         <AccordionItem value="retirement-guide">
            <AccordionTrigger>Complete guide on retirement savings</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
                <h3>Retire on Your Terms: A Comprehensive Guide to Building Your Retirement Savings</h3>
                <p>Imagine your ideal retirement. Is it seeing the national parks from an RV, living near the beach, spoiling your grandkids, or simply enjoying the peace of mind that comes from a life of financial security?</p>
                <p>Whatever your version of the American dream looks like, it’s built on a foundation of smart financial planning done today. For many, the world of retirement savings feels like an overwhelming alphabet soup—401(k), 403(b), IRA, Roth, SEP. It’s easy to feel anxious and push it off for "next year."</p>
                <p>But the secret to a secure retirement isn't winning the lottery. It's about taking small, consistent steps over a long period. This guide will demystify the U.S. retirement system and provide a clear, actionable roadmap to help you move from uncertainty to confidence.</p>
                <h4>Your Greatest Financial Superpower: The Magic of Compounding</h4>
                <p>If you learn only one thing about investing, let it be this: the single most important factor in your retirement success is not how much you earn, but how early you start.</p>
                <p>This is because of a powerful force called compounding. It’s the process where your investment returns start to generate their own returns. Think of it as a snowball rolling downhill—it grows bigger and faster all on its own.</p>
                <p>Let’s see this with two friends, Sarah and Michael:</p>
                <p><strong>Sarah</strong> starts investing at age 25. She contributes $300 per month to her retirement account, which earns an average of 9% annually.</p>
                <p><strong>Michael</strong> delays and starts at age 35. To try and catch up, he invests a larger amount, $500 per month, into the same type of account.</p>
                <p>Who has more money when they both turn 65?</p>
                <p>Sarah’s Total Investment: $144,000 ($300 x 12 x 40 years)</p>
                <p>Michael’s Total Investment: $180,000 ($500 x 12 x 30 years)</p>
                <p>Despite Michael investing $36,000 more of his own money, the results are staggering:</p>
                <p><strong>Sarah’s Retirement Nest Egg: Approximately $1.4 million</strong></p>
                <p><strong>Michael’s Retirement Nest Egg: Approximately $820,000</strong></p>
                <p>Sarah’s 10-year head start allowed her money to work for her for an entire extra decade, making her a clear winner. That is the undeniable power of compounding.</p>
                <h4>The Million-Dollar Question: How Much Do You Actually Need?</h4>
                <p>This is the central question of retirement planning. A great starting point is a popular guideline called The 4% Rule.</p>
                <p>The 4% Rule suggests that you can safely withdraw 4% of your total retirement savings in your first year of retirement, then adjust that amount for inflation each following year, with a high probability of your money lasting for at least 30 years.</p>
                <p>To find your target, you can reverse the rule:</p>
                <p className="font-mono p-2 bg-muted rounded-md text-center">Your Target Nest Egg = Your Estimated Annual Expenses × 25</p>
                <p>For example, if you estimate you'll need $60,000 per year to live comfortably in retirement, your target would be:</p>
                <p>$60,000 × 25 = $1.5 million</p>
                <p>Remember to also consider these critical factors:</p>
                <ul className="list-disc list-inside">
                  <li><strong>Inflation:</strong> The cost of living will be much higher in 20 or 30 years.</li>
                  <li><strong>Healthcare:</strong> Medical and long-term care costs are a significant and rising expense for retirees in the U.S.</li>
                  <li><strong>Social Security:</strong> While you shouldn't rely on it entirely, Social Security will likely provide a foundational layer of income, reducing the amount you need to withdraw from your nest egg.</li>
                </ul>
                <h4>The Building Blocks: Your Guide to U.S. Retirement Accounts</h4>
                <p>The U.S. government provides powerful, tax-advantaged accounts designed to help you save for retirement. Here are the main ones you need to know.</p>
                <h5>1. Employer-Sponsored Plans: Your Starting Point</h5>
                <p>These are the plans you get through your job.</p>
                <p><strong>401(k) & 403(b):</strong> The 401(k) is the most common retirement plan offered by private companies, while the 403(b) is its equivalent for non-profits and public schools. You contribute a percentage of your pre-tax salary, which lowers your taxable income today. The most important feature of these plans is the employer match.</p>
                <p><strong>The Employer Match is Free Money:</strong> Most companies will match your contributions up to a certain percentage (e.g., "100% of the first 3% of your salary"). This is a 100% return on your investment, guaranteed. Contributing enough to get the full employer match should be your #1 financial priority.</p>
                <h5>2. Individual Retirement Accounts (IRAs): Your Personal Power Tool</h5>
                <p>Anyone with earned income can open an IRA, giving you more control and investment options.</p>
                <p><strong>Traditional IRA:</strong> You may be able to deduct your contributions from your taxes today (pre-tax), your money grows tax-deferred, and you pay income tax on withdrawals in retirement.</p>
                <p><strong>Roth IRA:</strong> You contribute with money you’ve already paid taxes on (post-tax). The magic is that your money grows completely tax-free, and all qualified withdrawals in retirement are also 100% tax-free. For many people, especially young earners, the Roth IRA is one of the best wealth-building tools available.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Traditional IRA</TableHead>
                      <TableHead>Roth IRA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Contributions</TableCell>
                      <TableCell>Pre-tax (potentially tax-deductible)</TableCell>
                      <TableCell>Post-tax (not deductible)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Growth</TableCell>
                      <TableCell>Tax-deferred</TableCell>
                      <TableCell>Tax-free</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Withdrawals</TableCell>
                      <TableCell>Taxed as ordinary income</TableCell>
                      <TableCell>Tax-free and penalty-free</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <h4>Common (and Costly) Retirement Planning Mistakes to Avoid</h4>
                <ul className='list-disc list-inside'>
                    <li><strong>Not Getting the Full 401(k) Match:</strong> This is like turning down a pay raise. It is the most important "free money" you will ever be offered.</li>
                    <li><strong>Cashing Out Your 401(k) When Changing Jobs:</strong> When you leave a job, it can be tempting to cash out your 401(k). Don't do it! You'll pay income taxes and a 10% penalty. Instead, execute a "rollover" to move the money into an IRA or your new employer's 401(k) plan.</li>
                    <li><strong>Being Too Conservative:</strong> While safety is important, avoiding stocks means your savings may not outpace inflation. A diversified portfolio with a healthy allocation to low-cost index funds is crucial for long-term growth.</li>
                    <li><strong>Procrastination:</strong> As Sarah and Michael's story showed, every single day you wait to invest is a day you lose the power of compounding.</li>
                </ul>
                <h4>Creating Your Action Plan: A Simple Savings Hierarchy</h4>
                <p>So, where should you put your next dollar? For most people, this is the recommended order of operations:</p>
                <ol className="list-decimal list-inside">
                  <li><strong>Step 1: The Match.</strong> Contribute to your workplace 401(k) or 403(b) just enough to get the full employer match.</li>
                  <li><strong>Step 2: The IRA.</strong> After securing the match, fully fund a Roth or Traditional IRA. The annual contribution limit is set by the IRS ($7,000 in 2024 for those under 50).</li>
                  <li><strong>Step 3: Max Out the 401(k).</strong> If you still have money to save, go back to your 401(k) and contribute more, up to the annual maximum ($23,000 in 2024 for those under 50).</li>
                  <li><strong>Step 4: Other Accounts.</strong> Once you've maxed out your tax-advantaged accounts, you can save more in a Health Savings Account (HSA) if eligible, or a standard brokerage account.</li>
                </ol>
                <p>Calculating the exact amount you need to save each month to bridge the gap between what you have and what you’ll need can be complex. This is where a robust tool can bring your personal situation into focus.</p>
                <p>[Plan your secure future with our Retirement Savings Calculator.]</p>
                <h4>Conclusion: Take Control of Your American Dream</h4>
                <p>Retirement isn’t an age; it’s a financial destination. It’s the point where your assets can generate enough income to let you live life on your own terms. The journey to that destination starts not with a windfall, but with a plan.</p>
                <p>By starting early, taking full advantage of "free money" like an employer match, choosing the right accounts, and staying consistent, you can turn the dream of a comfortable, stress-free retirement into your reality.</p>
                <p>Disclaimer: This article is for educational purposes only and not financial advice. Contribution limits and tax laws are subject to change. Consult a certified financial professional to create a personalized retirement plan.</p>
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
