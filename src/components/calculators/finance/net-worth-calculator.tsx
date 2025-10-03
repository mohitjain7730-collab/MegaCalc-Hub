
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().nonnegative(),
});

const formSchema = z.object({
  assets: z.array(itemSchema).min(1, "Add at least one asset."),
  liabilities: z.array(itemSchema).min(1, "Add at least one liability."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetWorthCalculator() {
  const [result, setResult] = useState<{ netWorth: number, totalAssets: number, totalLiabilities: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: [
        { name: 'Home', value: 0 },
        { name: 'Investments', value: 0 },
        { name: 'Savings Account', value: 0 },
        { name: 'Vehicle', value: 0 },
      ],
      liabilities: [
        { name: 'Mortgage', value: 0 },
        { name: 'Car Loan', value: 0 },
        { name: 'Credit Card Debt', value: 0 },
      ],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({ control: form.control, name: "assets" });
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({ control: form.control, name: "liabilities" });

  const onSubmit = (values: FormValues) => {
    const totalAssets = values.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = values.liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    setResult({ netWorth, totalAssets, totalLiabilities });
  };
  
  // Calculate on initial render
  useEffect(() => {
    onSubmit(form.getValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Assets (What you own)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start">
                      <FormField control={form.control} name={`assets.${index}.name`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Asset Name</FormLabel><FormControl><Input placeholder="e.g., Home" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name={`assets.${index}.value`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Asset Value</FormLabel><FormControl><Input type="number" placeholder="Value" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendAsset({ name: '', value: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Liabilities (What you owe)</CardTitle></CardHeader>
              <CardContent>
                 <div className="space-y-4">
                  {liabilityFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start">
                      <FormField control={form.control} name={`liabilities.${index}.name`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Liability Name</FormLabel><FormControl><Input placeholder="e.g., Mortgage" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name={`liabilities.${index}.value`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Liability Value</FormLabel><FormControl><Input type="number" placeholder="Value" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLiability(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendLiability({ name: '', value: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Liability</Button>
              </CardContent>
            </Card>
          </div>
          <Button type="submit" className="w-full">Calculate Net Worth</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><DollarSign className="h-8 w-8 text-primary" /><CardTitle>Your Financial Snapshot</CardTitle></div></CardHeader>
            <CardContent>
                 <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Your Net Worth</CardDescription>
                        <p className="text-4xl font-bold">${result.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div><CardDescription>Total Assets</CardDescription><p className="text-2xl font-semibold">${result.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        <div><CardDescription>Total Liabilities</CardDescription><p className="text-2xl font-semibold">${result.totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-net-worth">
          <AccordionTrigger>What is Net Worth?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Net worth is a snapshot of your financial health. It's the value of all your assets (what you own) minus the total of all your liabilities (what you owe). A positive and growing net worth is a key indicator of financial progress.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Assets (What you own)</h4>
                  <p>Anything you own that has monetary value. This includes cash in bank accounts, the market value of your home, cars, investments (stocks, bonds, 401(k)), and valuable personal property.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Liabilities (What you owe)</h4>
                  <p>Any debt or financial obligation you have. This includes mortgages, car loans, student loans, credit card balances, personal loans, and any other money you owe.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the fundamental net worth formula: `Net Worth = Total Assets - Total Liabilities`.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Assets:</strong> Include things like cash, investments (stocks, 401(k)), real estate, and valuable personal property.</li>
                    <li><strong>Liabilities:</strong> Include all debts, such as mortgages, car loans, student loans, and credit card balances.</li>
                </ul>
                <p>The calculator simply sums up all your listed assets and subtracts the sum of all your listed liabilities to find your net worth.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="complete-guide">
            <AccordionTrigger>The Ultimate Guide to Understanding Net Worth</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
                <h3>Your Financial Report Card: The Ultimate Guide to Understanding Net Worth</h3>
                <p>In our daily lives, we track dozens of numbers—the steps on our fitness tracker, our weight on the scale, followers on social media, even the balance in our checking account. But the single most important number for your financial health is one that many people never even calculate: your net worth.</p>
                <p>Your net worth is the ultimate measure of your financial progress. It’s your personal balance sheet, a snapshot of your entire financial life in one clear, concise figure. It tells you where you stand today and provides a benchmark to measure your journey toward your goals, whether that’s buying a home, retiring early, or achieving total financial independence.</p>
                <p>This guide will demystify the concept of net worth. We’ll walk you through the simple steps to calculate yours, explain why it’s a financial game-changer, and provide a clear roadmap to help you grow it.</p>
                
                <h4>What is Net Worth? The Simple Formula for Financial Clarity</h4>
                <p>At its core, the concept is incredibly simple. Your net worth is what you would have left if you sold everything you own and paid off all your debts.</p>
                <p>The formula is just one line:</p>
                <p className="font-mono p-2 bg-muted rounded-md text-center">Assets (What You Own) - Liabilities (What You Owe) = Net Worth</p>
                <p>Let’s break down those two components:</p>
                <ul className='list-disc list-inside'>
                    <li><strong>Assets:</strong> These are all the things you own that have monetary value. This includes the cash in your bank account, your retirement savings, the value of your home, and more.</li>
                    <li><strong>Liabilities:</strong> These are all of your debts. This includes your mortgage, student loans, credit card balances, and any other money you owe to others.</li>
                </ul>
                <p>If your assets are greater than your liabilities, you have a positive net worth. If your liabilities are greater than your assets, you have a negative net worth. It’s important to know that having a negative net worth, especially when you’re young and have student loans, is very common and nothing to be ashamed of. It’s simply your starting point.</p>

                <h4>A Step-by-Step Guide to Calculating Your Net Worth</h4>
                <p>Grab a notebook, open a spreadsheet, or use a financial app. It’s time to calculate your number.</p>
                <h5>Step 1: Add Up All Your Assets (What You Own)</h5>
                <p>Be thorough and list everything of value. It’s helpful to group them into categories.</p>
                <p><strong>Cash and Cash Equivalents (Liquid Assets):</strong></p>
                <ul className="list-disc list-inside">
                    <li>Checking Account Balance</li>
                    <li>Savings Account Balance (including High-Yield Savings Accounts)</li>
                    <li>Certificates of Deposit (CDs)</li>
                    <li>Money Market Account Balance</li>
                </ul>
                <p><strong>Investments:</strong></p>
                 <ul className="list-disc list-inside">
                    <li>401(k) or 403(b) balance</li>
                    <li>Roth or Traditional IRA balance</li>
                    <li>Brokerage Account (value of stocks, bonds, ETFs, mutual funds)</li>
                    <li>Health Savings Account (HSA) balance</li>
                    <li>Value of any stock options</li>
                </ul>
                <p><strong>Real Estate:</strong></p>
                <ul className="list-disc list-inside">
                    <li>Current market value of your primary home (use sites like Zillow or Redfin for an estimate)</li>
                    <li>Market value of any rental or vacation properties</li>
                </ul>
                <p><strong>Personal Property:</strong></p>
                <ul className="list-disc list-inside">
                    <li>Resale value of your car(s) (use Kelley Blue Book)</li>
                    <li>Value of valuable jewelry, art, or collectibles (be conservative with these estimates)</li>
                </ul>
                <p>Sum all these up to get your Total Assets.</p>

                <h5>Step 2: Add Up All Your Liabilities (What You Owe)</h5>
                <p>Now, make a list of every single debt you have.</p>
                <p><strong>Secured Debts:</strong></p>
                <ul className="list-disc list-inside">
                    <li>Mortgage balance</li>
                    <li>Home Equity Line of Credit (HELOC) balance</li>
                    <li>Auto loan balance</li>
                </ul>
                <p><strong>Unsecured Debts:</strong></p>
                <ul className="list-disc list-inside">
                    <li>Student loan balance (federal and private)</li>
                    <li>Credit card balances</li>
                    <li>Personal loan balances</li>
                    <li>Medical debt</li>
                </ul>
                <p>Sum all these up to get your Total Liabilities.</p>

                <h5>Step 3: Do the Math</h5>
                <p>Now, just plug your totals into the formula: Total Assets - Total Liabilities = Your Net Worth.</p>
                <p>Let’s see a quick example. Meet Jessica, a 32-year-old marketing manager.</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Assets</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>Liabilities</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Checking & Savings</TableCell>
                            <TableCell className="text-right">$15,000</TableCell>
                            <TableCell>Mortgage</TableCell>
                            <TableCell className="text-right">$250,000</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>401(k) Balance</TableCell>
                            <TableCell className="text-right">$65,000</TableCell>
                             <TableCell>Student Loans</TableCell>
                            <TableCell className="text-right">$35,000</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>Roth IRA Balance</TableCell>
                            <TableCell className="text-right">$25,000</TableCell>
                            <TableCell>Auto Loan</TableCell>
                            <TableCell className="text-right">$15,000</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>Home Value</TableCell>
                            <TableCell className="text-right">$350,000</TableCell>
                            <TableCell>Credit Card Debt</TableCell>
                            <TableCell className="text-right">$5,000</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>Car Value</TableCell>
                            <TableCell className="text-right">$20,000</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        <TableRow className="font-bold border-t">
                            <TableCell>Total Assets</TableCell>
                            <TableCell className="text-right">$475,000</TableCell>
                            <TableCell>Total Liabilities</TableCell>
                            <TableCell className="text-right">$305,000</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <p>Jessica's Net Worth = $475,000 (Assets) - $305,000 (Liabilities) = $170,000</p>
                
                <h4>Why Tracking Your Net Worth is a Financial Game-Changer</h4>
                <p>Calculating your net worth once is insightful, but its true power is revealed when you track it over time (e.g., every 6 or 12 months). Here’s why it’s so important:</p>
                <ul className='list-disc list-inside'>
                    <li><strong>It’s Your True Financial Scorecard.</strong> A high income doesn't automatically mean you’re wealthy. Someone earning $200,000 a year with $250,000 in spending has a lower savings rate than someone earning $80,000 and saving $20,000. Income is how much you make; net worth is how much you keep.</li>
                    <li><strong>It Forces You to See the Big Picture.</strong> Tracking your net worth helps you make better financial decisions. You’ll start to see how a decision impacts your overall financial health. Paying down a high-interest credit card, for example, directly and immediately increases your net worth.</li>
                    <li><strong>It Measures Progress.</strong> The absolute number is less important than the direction it’s heading. Is your net worth growing year after year? If so, your financial plan is working. If it's stagnant or shrinking, it's a sign that you need to make adjustments.</li>
                    <li><strong>It Provides Powerful Motivation.</strong> There is nothing more motivating than seeing your net worth climb due to your hard work and discipline. It encourages you to stick with your savings goals and celebrate your financial wins.</li>
                </ul>

                <h4>What is a “Good” Net Worth? A Word on Benchmarks</h4>
                <p>It’s natural to wonder how you stack up. While data from sources like the Federal Reserve’s Survey of Consumer Finances can provide median net worth figures for different age groups in the U.S., it's crucial to take these with a grain of salt.</p>
                <p>Remember: Personal finance is personal. Your journey will be different from everyone else’s. Factors like your career choice, where you live, student loans, and family circumstances all play a huge role.</p>
                <p>The only benchmark that truly matters is your own. Are you in a better financial position today than you were last year? That is the definition of success.</p>
                
                <h4>The Two Levers: How to Increase Your Net Worth</h4>
                <p>Growing your net worth comes down to two simple actions derived from the formula: increasing your assets and/or decreasing your liabilities.</p>
                <h5>Strategies to Increase Your Assets</h5>
                <ul className="list-disc list-inside">
                    <li><strong>Automate Your Investing:</strong> This is the most effective way to build assets over time. Set up automatic contributions to your 401(k) (at least up to the employer match!) and your Roth IRA.</li>
                    <li><strong>Increase Your Income:</strong> The more you earn, the more you can save and invest. Look for opportunities for a raise, develop new skills, or start a side hustle.</li>
                    <li><strong>Invest for Growth:</strong> Put your money to work in diversified, low-cost investments like index funds or ETFs to harness the power of compound interest.</li>
                </ul>
                 <h5>Strategies to Decrease Your Liabilities</h5>
                 <ul className="list-disc list-inside">
                    <li><strong>Create a Debt Payoff Plan:</strong> Focus on high-interest debt first (like credit cards). The debt avalanche (highest interest rate first) or debt snowball (smallest balance first) are both effective strategies.</li>
                    <li><strong>Avoid New Debt:</strong> Before taking on a new loan, ask yourself if it's truly necessary. Living below your means is the fastest way to get ahead.</li>
                    <li><strong>Refinance When Possible:</strong> If you can refinance your mortgage or student loans to a lower interest rate, you can save thousands and pay off the debt faster.</li>
                </ul>

                <h4>Conclusion: Your Journey Starts Today</h4>
                <p>Your net worth is more than just a number—it’s a reflection of your financial habits, decisions, and progress. Don't be afraid of what you might find. Whether your net worth is positive or negative, calculating it is the essential first step toward taking control of your financial life.</p>
                <p>Calculate it today. Track it over time. And watch as your consistent, disciplined efforts build the secure, independent future you deserve.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more details on calculating and growing your net worth, consult these authoritative resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/n/networth.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: How to Calculate Your Net Worth</a></li>
                  <li><a href="https://www.finra.org/investors/learn-to-invest/advanced-investing/net-worth" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA: Understanding Net Worth</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
