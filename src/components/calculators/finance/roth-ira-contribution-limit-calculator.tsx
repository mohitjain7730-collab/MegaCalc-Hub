
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  filingStatus: z.enum(['single', 'mfj', 'mfs']),
  magi: z.number().nonnegative(),
  age: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

// Using 2024 IRS data
const year = 2024;
const limits = {
  standard: 7000,
  catchUp: 1000,
};
const phaseOuts = {
  single: { start: 146000, end: 161000, range: 15000 },
  mfj: { start: 230000, end: 240000, range: 10000 },
  mfs: { start: 0, end: 10000, range: 10000 },
};

export default function RothIraContributionLimitCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filingStatus: 'single',
      magi: undefined,
      age: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { filingStatus, magi, age } = values;
    const baseLimit = age >= 50 ? limits.standard + limits.catchUp : limits.standard;
    const phaseOut = phaseOuts[filingStatus];

    if (magi >= phaseOut.end) {
      setResult(0);
      return;
    }

    if (magi > phaseOut.start) {
      const reduction = (magi - phaseOut.start) / phaseOut.range;
      const reducedLimit = baseLimit * (1 - reduction);
      setResult(Math.max(200, Math.floor(reducedLimit / 10) * 10)); // Round down to nearest $10, min $200
      return;
    }

    setResult(baseLimit);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="filingStatus" render={({ field }) => (
                <FormItem>
                    <FormLabel>Filing Status ({year})</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="single">Single, Head of Household, or Married Filing Separately (didn't live with spouse)</SelectItem>
                            <SelectItem value="mfj">Married Filing Jointly or Qualifying Widow(er)</SelectItem>
                            <SelectItem value="mfs">Married Filing Separately (lived with spouse)</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Your Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="magi" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Modified Adjusted Gross Income (MAGI)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Limit</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Maximum Roth IRA Contribution</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">${result.toLocaleString()}</p>
                    <CardDescription>This is your maximum allowed contribution for tax year {year}.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-roth">
          <AccordionTrigger>What is a Roth IRA?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>A Roth IRA is an individual retirement account that offers tax-free growth and tax-free withdrawals in retirement. Unlike a traditional IRA, your contributions are not tax-deductible. The amount you can contribute each year is limited by the IRS and depends on your income and filing status.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="contribution-guide">
          <AccordionTrigger>The Ultimate Retirement Power Tool: Your Guide to Roth IRA Contributions</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
            <p>In the world of retirement planning, there are many valuable tools, but few are as powerful or as popular as the Roth IRA. Think of it as a superhero of savings accounts, equipped with a special power that can save you tens, or even hundreds, of thousands of dollars in the future: the power of tax-free growth.</p>
            <p>The premise is simple and brilliant: you pay taxes on your money now, contribute it to the account, and in return, your investments can grow and be withdrawn in retirement completely, 100% tax-free.</p>
            <p>But to harness this power, you need to understand the rules of the game—specifically, how to get your money into the account in the first place. This guide will break down everything you need to know about Roth IRA contributions, including the limits, income rules, and deadlines for 2025 and 2026.</p>
            <h4>The Golden Rule: How Much Can You Contribute?</h4>
            <p>This is the first question everyone asks. The IRS sets annual limits on the maximum amount you can contribute to an IRA.</p>
            <p>For the tax year 2025, the maximum you can contribute to a Roth IRA is <strong>$7,000</strong>.</p>
            <p>For the tax year 2026, this limit is projected to increase to <strong>$7,500</strong>. (Note: This is based on inflation projections; always confirm with the official IRS announcement, typically made in the fall).</p>
            <h5>The Age 50+ Catch-Up Contribution</h5>
            <p>The IRS allows those who are nearing retirement to save a little extra. If you are age 50 or older at any point during the year, you can contribute an additional <strong>$1,000</strong>.</p>
            <p>This means for 2025, an individual age 50 or over can contribute a total of <strong>$8,000</strong>.</p>
            <p>It's crucial to remember that this limit is per person, not per account. If you have both a Traditional IRA and a Roth IRA, your total combined contributions to both accounts cannot exceed the annual limit.</p>
            <h4>The "Can I Contribute?" Test: Understanding the Income Limits</h4>
            <p>The second golden rule is that the ability to contribute directly to a Roth IRA is not available to everyone. If your income is above a certain level, your ability to contribute is reduced or eliminated entirely.</p>
            <p>This is based on your Modified Adjusted Gross Income (MAGI). Below are the income phase-out ranges for 2025 and the projected ranges for 2026.</p>
            <h5>For Tax Year 2025:</h5>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Filing Status</TableHead>
                        <TableHead>MAGI Range</TableHead>
                        <TableHead>Contribution Allowed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell rowSpan={3}>Single, Head of Household</TableCell>
                        <TableCell>Less than $146,000</TableCell>
                        <TableCell>Full Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>$146,000 - $161,000</TableCell>
                        <TableCell>Reduced Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>More than $161,000</TableCell>
                        <TableCell>No Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell rowSpan={3}>Married Filing Jointly</TableCell>
                        <TableCell>Less than $230,000</TableCell>
                        <TableCell>Full Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>$230,000 - $240,000</TableCell>
                        <TableCell>Reduced Contribution</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>More than $240,000</TableCell>
                        <TableCell>No Contribution</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <p className="text-xs">(Projected ranges for 2026 will likely be slightly higher due to inflation adjustments.)</p>
            <h4>What if Your Income is Too High? The Backdoor Roth IRA</h4>
            <p>If you find your income is above the limits, don't despair. There is a well-known, legal strategy called the Backdoor Roth IRA. In simple terms, it involves:</p>
            <ol className="list-decimal pl-5 space-y-2">
                <li>Contributing money to a non-deductible Traditional IRA (which has no income limits).</li>
                <li>Shortly after, converting those funds into a Roth IRA.</li>
            </ol>
            <p>This is a more advanced strategy with specific tax implications, so it's wise to consult with a financial professional if you plan to use it.</p>
            <h4>The "What Can I Contribute?" Rule: Earned Income</h4>
            <p>There's one more fundamental rule: to contribute to an IRA, you (or your spouse) must have earned income.</p>
            <p>What counts as earned income? Wages, salaries, tips, bonuses, commissions, and self-employment income.</p>
            <p>What doesn't count? Investment income, rental income, pension payments, Social Security benefits, or child support.</p>
            <p>You can only contribute up to the annual limit or your total earned income for the year, whichever is less. For example, if you are 20 years old and earn $4,000 from a summer job, the maximum you can contribute to your Roth IRA for that year is $4,000.</p>
            <h5>The Spousal IRA: An Important Exception</h5>
            <p>What if one spouse doesn't work outside the home? The Spousal IRA rule allows a working spouse to contribute to an IRA on behalf of their non-working or low-earning spouse, as long as the couple files taxes jointly and the working spouse has enough earned income to cover both contributions.</p>
            <h4>Deadlines and How to Contribute: The Nuts and Bolts</h4>
            <h5>The Contribution Deadline</h5>
            <p>This is one of the best and most misunderstood features of an IRA. You have until Tax Day of the following year to make your contributions for the current tax year.</p>
            <p>For the <strong>2025 tax year</strong>, you have until <strong>April 15, 2026</strong>, to make your contributions.</p>
            <p>For the <strong>2026 tax year</strong>, you will have until <strong>April 15, 2027</strong>, to contribute.</p>
            <p>This gives you extra time to max out your contributions. When you make a contribution between January 1 and April 15, your brokerage will ask you to specify which tax year the contribution is for.</p>
            <h5>How to Make a Contribution</h5>
            <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Open a Roth IRA Account:</strong> You can do this in minutes online at any major brokerage firm like Vanguard, Fidelity, or Charles Schwab.</li>
                <li><strong>Fund the Account:</strong> Link your checking or savings account.</li>
                <li><strong>Contribute Your Money:</strong> You can make a lump-sum contribution all at once or set up automatic, recurring contributions (e.g., $583.33 per month to max out the $7,000 limit for 2025). Automation is a fantastic way to build the habit and benefit from dollar-cost averaging.</li>
                <li><strong>Crucial Final Step: Invest the Money!</strong> A common beginner mistake is to contribute money and leave it sitting as cash in the account. The money must be invested in stocks, bonds, mutual funds, or ETFs within the account to grow.</li>
            </ol>
            <h4>Why Bother? The Three Superpowers of a Roth IRA</h4>
            <p>Why go through all this trouble? Because the benefits are truly game-changing for your financial future.</p>
            <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Tax-Free Growth and Withdrawals:</strong> This is the main event. Decades of investment growth—all the dividends, interest, and capital gains—are completely shielded from taxes. When you pull the money out in retirement (after age 59½), every single penny is yours to keep, tax-free.</li>
                <li><strong>Incredible Flexibility:</strong> Unlike any other retirement account, a Roth IRA allows you to withdraw your direct contributions at any time, for any reason, without taxes or penalties. This is because you already paid taxes on that money. (Note: This only applies to your contributions, not your investment earnings). This makes a Roth IRA a surprisingly flexible account that can double as a backup emergency fund.</li>
                <li><strong>No Required Minimum Distributions (RMDs):</strong> Traditional IRAs and 401(k)s force you to start taking money out at a certain age (currently 73). Roth IRAs have no RMDs for the original owner. This gives you complete control over your money in retirement and makes it an exceptional tool for estate planning, as you can pass the tax-free growth on to your heirs.</li>
            </ol>
            <h4>Conclusion: Your Future Self Will Thank You</h4>
            <p>The Roth IRA is one of the most powerful wealth-building tools the U.S. tax code provides. It offers a unique combination of tax-free growth, flexibility, and control that is unmatched by other retirement accounts.</p>
            <p>The steps are clear: check your income eligibility, know the contribution limit, open an account at a reputable brokerage, and make your contribution before the Tax Day deadline. By taking action today, you are giving your future self the incredible gift of financial security and a lifetime of tax-free income.</p>
            <p className="text-xs">Disclaimer: This article is for informational purposes only and is not intended as financial or tax advice. Contribution limits and IRS rules are subject to change. Please consult with a qualified financial professional or tax advisor to discuss your individual situation.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Filing Status</h4>
                  <p>Your tax filing status as reported to the IRS. This determines the income limits for contributions.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Age</h4>
                  <p>Your age determines if you are eligible for "catch-up" contributions, which allow individuals aged 50 and over to contribute an additional amount.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Modified Adjusted Gross Income (MAGI)</h4>
                  <p>This is a specific calculation used by the IRS to determine eligibility for certain tax benefits. For most people, it's very close to their Adjusted Gross Income (AGI). Your eligibility to contribute to a Roth IRA is phased out and eventually eliminated as your MAGI increases.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the official IRS rules for the specified tax year to determine your contribution limit.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It determines the base contribution limit, adding the "catch-up" amount if you are age 50 or over.</li>
                    <li>It checks your Modified Adjusted Gross Income (MAGI) against the phase-out range for your filing status.</li>
                    <li>If your MAGI is within the phase-out range, your contribution limit is reduced proportionally. If it's above the range, your limit is $0.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For the most current and detailed rules, always consult the official IRS publications.</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.irs.gov/retirement-plans/amount-of-roth-ira-contributions-that-you-can-make-for-2024" target="_blank" rel="noopener noreferrer" className="text-primary underline">IRS.gov: Roth IRA Contribution Limits</a></li>
                  <li><a href="https://www.investopedia.com/roth-ira-contribution-and-income-limits-5071277" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Roth IRA Contribution & Income Limits</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    