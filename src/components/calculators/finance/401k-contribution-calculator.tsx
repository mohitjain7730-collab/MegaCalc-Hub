
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                      <Tooltip formatter={(value: number, name: string, props) => {
                          const payloadValue = props.payload?.[props.dataKey] as number | undefined;
                          if (payloadValue === undefined) return null;
                          return `$${payloadValue.toLocaleString()}`;
                      }} />
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
        <AccordionItem value="401k-contribution-guide">
            <AccordionTrigger>Complete guide on 401k</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>The Ultimate Guide to Your 401(k) Contribution</h3>
              <p>You just started a new job, and after a whirlwind of onboarding, you're handed the benefits package. Tucked inside, between health insurance forms and vacation policies, is the 401(k) plan—a document filled with terms like "employer match," "vesting," and "contribution limits."</p>
              <p>Immediately, the big question hits you: "How much of my paycheck should I actually put into this thing?"</p>
              <p>It's a question every American professional faces, and the answer can profoundly shape your financial future. Your 401(k) contribution isn't just a number; it's the single most powerful lever you can pull to build a secure and comfortable retirement.</p>
              <p>This guide will demystify the entire process. We’ll break down exactly what you need to know to make a confident decision, from securing "free money" to understanding the IRS rules for 2025.</p>
              
              <h4>Rule #1: Never, Ever Leave Free Money on the Table</h4>
              <p>Before we discuss percentages, limits, or investment choices, let's establish the golden rule of 401(k) contributions: <strong>Contribute at least enough to get your full employer match.</strong></p>
              <p>An employer match is a benefit where your company contributes money to your 401(k) on your behalf, but only if you contribute first. It's the closest thing to "free money" you will ever find in the world of personal finance.</p>
              <p>A common matching formula is "100% of the first 4% of your salary." Let's break down what this means with an example:</p>
              <ul className="list-disc list-inside">
                <li>Your Annual Salary: $70,000</li>
                <li>Your Contribution (4%): $2,800 per year</li>
                <li>Your Employer's Match (4%): $2,800 per year</li>
                <li><strong>Your Total Contribution: $5,600 per year</strong></li>
              </ul>
              <p>By simply contributing 4% of your own money, you have instantly doubled it. This is a 100% guaranteed return on your investment before your money has even had a chance to grow in the market. Failing to get the full match is like turning down a pay raise every single year.</p>
              <p><strong>Action Step:</strong> Find out your company's matching formula today. Make it your absolute minimum goal to contribute enough to capture every last cent of that match.</p>

              <h4>The Big Decision: Traditional (Pre-Tax) vs. Roth 401(k) Contributions</h4>
              <p>Once you've committed to getting the match, you'll often face a choice: should your contributions be Traditional or Roth? Your decision hinges on one question: <strong>Do you want to pay taxes now or later?</strong></p>
              <h5>The Traditional 401(k): Pay Taxes Later</h5>
              <p>When you contribute to a Traditional 401(k), the money comes out of your paycheck <strong>before</strong> federal and state income taxes are calculated.</p>
              <ul className="list-disc list-inside">
                <li><strong>The Benefit Now:</strong> This reduces your taxable income for the year, which means your take-home pay won't decrease by the full amount of your contribution.</li>
                <li><strong>The Catch Later:</strong> Your money grows tax-deferred, but when you withdraw it in retirement, you will pay ordinary income tax on every dollar you take out.</li>
              </ul>
              <h5>The Roth 401(k): Pay Taxes Now</h5>
              <p>When you contribute to a Roth 401(k), the money comes out of your paycheck <strong>after</strong> income taxes have been paid, just like the rest of your take-home pay.</p>
               <ul className="list-disc list-inside">
                <li><strong>The Benefit Later:</strong> The real magic happens down the road. Your money grows completely tax-free, and all qualified withdrawals in retirement are also 100% tax-free.</li>
                <li><strong>The Catch Now:</strong> You don't get an immediate tax break, so your take-home pay will decrease by the full amount of your contribution.</li>
              </ul>
              <h5>How to Choose Between Traditional and Roth?</h5>
               <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Traditional 401(k)</TableHead>
                          <TableHead>Roth 401(k)</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell>Tax Treatment Now</TableCell>
                          <TableCell>Contributions are pre-tax (lowers taxable income)</TableCell>
                          <TableCell>Contributions are post-tax</TableCell>
                      </TableRow>
                       <TableRow>
                          <TableCell>Growth</TableCell>
                          <TableCell>Tax-deferred</TableCell>
                          <TableCell>Tax-free</TableCell>
                      </TableRow>
                       <TableRow>
                          <TableCell>Withdrawals</TableCell>
                          <TableCell>Taxed as ordinary income</TableCell>
                          <TableCell>Tax-free</TableCell>
                      </TableRow>
                       <TableRow>
                          <TableCell>Best For...</TableCell>
                          <TableCell>Those who are in a high tax bracket now and expect to be in a lower one in retirement.</TableCell>
                          <TableCell>Those who are in a low tax bracket now (like young professionals) and expect to earn more later. Also great for tax diversification.</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
              <p>Many financial advisors suggest that younger employees, whose best earning years are ahead of them, can benefit greatly from the tax-free withdrawals of a Roth 401(k).</p>
              
              <h4>How Much Can You Contribute? Understanding the 2025 Limits</h4>
              <p>The IRS sets annual limits on how much you can contribute to your 401(k). For 2025, these limits are:</p>
               <ul className="list-disc list-inside">
                <li><strong>Employee Contribution Limit:</strong> You can contribute up to <strong>$23,500</strong> of your own money. This applies to the total of your Traditional and Roth 401(k) contributions combined.</li>
                <li><strong>Catch-Up Contribution:</strong> If you are age 50 or over at any point during the year, you can contribute an additional <strong>$8,000</strong>, bringing your total possible contribution to <strong>$31,500</strong>.</li>
                <li><strong>Total Contribution Limit:</strong> There is a separate, higher limit ($69,000 in 2024, projected higher for 2025) that includes your contributions, your employer’s match, and any other employer contributions. Most people don't need to worry about this limit, but it's good to know it exists.</li>
              </ul>
              <p>(Note: These 2025 figures are based on projected inflation adjustments. Always check the official IRS website for the finalized annual limits.)</p>

              <h4>Beyond the Match: A Roadmap to Increasing Your Contributions</h4>
              <p>Getting the match is the starting line, not the finish line. To ensure a comfortable retirement, most experts agree you'll need to save more. Here’s a simple, step-by-step roadmap.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Step 1: Get the Match.</strong> We can't say it enough. This is your foundation.</li>
                <li><strong>Step 2: Aim for 15% of Your Gross Income.</strong> This is the benchmark recommended by most financial planning firms like Fidelity and Vanguard. A 15% savings rate (including your employer's match) puts you on a strong trajectory for a healthy retirement.</li>
                <li><strong>Step 3: "Max Out" Your 401(k).</strong> This means contributing the full IRS employee limit ($23,500 in 2025). While not feasible for everyone, this is a powerful goal for high earners or anyone who wants to accelerate their path to financial independence.</li>
                <li><strong>Step 4: Automate Your Increases.</strong> The easiest way to save more is to make it painless. Many 401(k) plans offer an "auto-escalation" feature. By checking this box, you can set your contribution rate to automatically increase by 1% every year. This small, gradual increase is barely noticeable in your paycheck but can lead to hundreds of thousands of dollars more in retirement.</li>
              </ol>

              <h4>An Important Detail: The Vesting Schedule</h4>
              <p>Your contributions are always 100% yours. But the money your employer contributes (the match) often comes with a vesting schedule. Vesting is the process of earning full ownership of those funds.</p>
              <p>There are two common types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cliff Vesting:</strong> You gain 100% ownership after a specific period, like 3 years. If you leave your job before that, you forfeit all of the employer's contributions.</li>
                <li><strong>Graded Vesting:</strong> You gain ownership gradually over time. For example, you might be 20% vested after one year, 40% after two, and so on, until you are 100% vested after five years.</li>
              </ul>
              <p>Understanding your vesting schedule is crucial if you are considering changing jobs.</p>

              <h4>Conclusion: Your Most Powerful Wealth-Building Tool</h4>
              <p>Your 401(k) contribution is far more than a line item on your paystub; it's a direct investment in your future self. By making informed choices today, you are paving the way for a future of freedom and security.</p>
              <p>Let's recap your action plan:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Prioritize the Match:</strong> Capture every dollar of free money.</li>
                <li><strong>Choose Your Contribution Type:</strong> Decide between the immediate tax break of a Traditional 401(k) or the future tax-free withdrawals of a Roth 401(k).</li>
                <li><strong>Set Your Goal:</strong> Aim to save 15% of your income. If you can't start there, begin with the match and use auto-escalation to grow your savings over time.</li>
              </ol>
              <p>The journey to a million-dollar nest egg doesn't happen overnight. It happens one paycheck at a time, powered by the steady, disciplined habit of contributing to your 401(k).</p>
              <p className="text-xs">Disclaimer: This article is for informational purposes only and is not intended as financial or tax advice. 401(k) rules and IRS limits are subject to change. Please consult with a qualified financial professional to discuss your individual situation.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current/Retirement Age</h4>
                  <p>Your current age and the age you plan to retire. This determines your investment timeline.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current 401(k) Balance</h4>
                  <p>The amount of money you have already saved in your 401(k).</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Salary</h4>
                  <p>Your gross annual income, used to calculate contribution and match amounts.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Contribution (%)</h4>
                  <p>The percentage of your pre-tax salary you contribute to your 401(k) each paycheck.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Expected Annual Return (%)</h4>
                  <p>The average yearly growth rate you expect from your 401(k) investments.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Employer Match (%)</h4>
                  <p>The percentage of your contribution that your employer matches. For example, a 50% match means they contribute $0.50 for every $1.00 you contribute.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Employer Match Limit (%)</h4>
                  <p>The maximum percentage of your salary up to which your employer will match contributions. For instance, if the limit is 6%, your employer will not match any contributions you make beyond 6% of your salary.</p>
              </div>
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

    