
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  principal: z.number().positive(),
  annualRate: z.number().positive(),
  years: z.number().int().positive(),
  compoundingFrequency: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalAmount: number;
  totalInterest: number;
  chartData: { year: number; value: number, principal: number }[];
}

export default function CompoundInterestCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: undefined,
      annualRate: undefined,
      years: undefined,
      compoundingFrequency: 12,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { principal, annualRate, years, compoundingFrequency } = values;
    const P = principal;
    const r = annualRate / 100;
    const n = compoundingFrequency;
    const t = years;

    const totalAmount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = totalAmount - P;

    const chartData = [];
    for (let i = 1; i <= t; i++) {
      const value = P * Math.pow(1 + r / n, n * i);
      chartData.push({
        year: i,
        value: Math.round(value),
        principal: P,
      });
    }

    setResult({ totalAmount, totalInterest, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="principal" render={({ field }) => (
                <FormItem><FormLabel>Principal Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem><FormLabel>Number of Years</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="compoundingFrequency" render={({ field }) => (
                <FormItem><FormLabel>Compounding Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="1">Annually</SelectItem>
                        <SelectItem value="2">Semi-Annually</SelectItem>
                        <SelectItem value="4">Quarterly</SelectItem>
                        <SelectItem value="12">Monthly</SelectItem>
                        <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><PiggyBank className="h-8 w-8 text-primary" /><CardTitle>Investment Growth</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Future Value</CardDescription>
                        <p className="text-3xl font-bold">${result.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Principal Amount</CardDescription>
                            <p className="text-xl font-semibold">${form.getValues('principal').toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Interest Earned</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" unit="yr" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number, name: string) => name === "principal" ? `$${value.toLocaleString()}`: `$${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="principal" name="Principal" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorPrincipal)" />
                      <Area type="monotone" dataKey="value" name="Future Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-compound-interest">
          <AccordionTrigger>What is Compound Interest?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Compound interest is the interest on an investment's principal plus the interest that has already been earned. This "interest on interest" effect is why investments can grow at an exponential rate over time. The more frequently interest is compounded, the faster the growth.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Principal Amount</h4>
                  <p>The initial amount of money you are investing.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate (%)</h4>
                  <p>The nominal annual interest rate for the investment.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Number of Years</h4>
                  <p>The total number of years the money will be invested.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Compounding Frequency</h4>
                  <p>How often the interest is calculated and added to the principal. More frequent compounding (e.g., daily) results in slightly higher returns than less frequent compounding (e.g., annually).</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for the future value of an investment with compound interest:</p>
                <p className='font-mono p-4 bg-muted rounded-md'>A = P(1 + r/n)^(nt)</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>A</strong> is the future value of the investment/loan, including interest.</li>
                    <li><strong>P</strong> is the principal investment amount (the initial deposit or loan amount).</li>
                    <li><strong>r</strong> is the annual interest rate (in decimal form).</li>
                    <li><strong>n</strong> is the number of times that interest is compounded per year.</li>
                    <li><strong>t</strong> is the number of years the money is invested or borrowed for.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="compound-interest-guide">
            <AccordionTrigger>Complete guide on Compound interest</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>The Eighth Wonder of the World: Your Ultimate Guide to Compound Interest</h3>
                <p>Albert Einstein is famously said to have called compound interest "the eighth wonder of the world," adding, "He who understands it, earns it; he who doesn't, pays it."</p>
                <p>This single idea is the quiet engine behind almost every story of long-term wealth creation. It's the financial principle that allows you to build a substantial nest egg for retirement, save for a child's college education, or achieve financial independence. It is, without exaggeration, the most powerful force in personal finance.</p>
                <p>But what is it, really? This guide will break down the concept of compound interest into simple terms and show you how to harness its incredible power to build the financial future you want.</p>
                
                <h4>What is Compound Interest, Exactly?</h4>
                <p>At its core, compound interest is interest earned on interest.</p>
                <p>It’s a simple concept with profound effects. When you save or invest, your money earns a return.</p>
                <p>With simple interest, you only earn returns on your initial investment (the "principal").</p>
                <p>With compound interest, you earn returns on your principal and on the accumulated returns from all previous periods.</p>
                <p>The best analogy is a snowball rolling downhill. It starts small, but as it rolls, it picks up more snow, growing bigger and faster. Your money works the same way. The returns your investments generate are reinvested and then start generating their own returns, creating a cycle of accelerating, exponential growth.</p>
                
                <h4>Simple vs. Compound Interest: A Tale of Two Investments</h4>
                <p>To see the dramatic difference, let’s imagine two people, Alex and Ben, who both invest $10,000 at a 10% annual rate of return.</p>
                <p>Alex's investment earns simple interest.</p>
                <p>Ben's investment earns compound interest.</p>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Alex's Investment (Simple)</TableHead>
                            <TableHead>Ben's Investment (Compound)</TableHead>
                            <TableHead>The Difference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Start</TableCell><TableCell>$10,000</TableCell><TableCell>$10,000</TableCell><TableCell>$0</TableCell></TableRow>
                        <TableRow><TableCell>Year 1</TableCell><TableCell>$11,000</TableCell><TableCell>$11,000</TableCell><TableCell>$0</TableCell></TableRow>
                        <TableRow><TableCell>Year 5</TableCell><TableCell>$15,000</TableCell><TableCell>$16,105</TableCell><TableCell>$1,105</TableCell></TableRow>
                        <TableRow><TableCell>Year 10</TableCell><TableCell>$20,000</TableCell><TableCell>$25,937</TableCell><TableCell>$5,937</TableCell></TableRow>
                        <TableRow><TableCell>Year 20</TableCell><TableCell>$30,000</TableCell><TableCell>$67,275</TableCell><TableCell>$37,275</TableCell></TableRow>
                        <TableRow><TableCell>Year 30</TableCell><TableCell>$40,000</TableCell><TableCell>$174,494</TableCell><TableCell>$134,494</TableCell></TableRow>
                    </TableBody>
                </Table>
                <p>Alex earns a predictable $1,000 every year. After 30 years, he has a respectable $40,000.</p>
                <p>Ben, however, experiences the magic. In the early years, the difference is small. But as time passes, his investment begins to surge. After 30 years, his investment is worth over four times Alex's. That massive difference is purely the result of earning interest on his interest.</p>

                <h4>The Three Levers of Compounding: How to Maximize Your Growth</h4>
                <p>The power of compounding isn't random; it's driven by three key factors you can control.</p>
                <h5>1. Time (The Accelerator)</h5>
                <p>This is your most valuable asset. The longer your money has to compound, the more dramatic the results. A small amount invested early will almost always outperform a larger amount invested later. Consider two investors:</p>
                <p><strong>Emily (The Early Bird):</strong> Starts investing $250/month at age 25 and stops at age 35. Total invested: $30,000.</p>
                <p><strong>Jacob (The Late Bloomer):</strong> Starts investing $250/month at age 35 and invests until age 65. Total invested: $90,000.</p>
                <p>Assuming a 9% annual return, at age 65, Emily—who only invested for 10 years—will have nearly $700,000. Jacob, who invested three times as much money over 30 years, will only have about $455,000. Emily's 10-year head start gave her money an extra decade to do the heavy lifting for her.</p>
                <h5>2. Rate of Return (The Engine)</h5>
                <p>Where you put your money matters. A High-Yield Savings Account (HYSA) might offer a 4-5% return, which is great for an emergency fund. But to truly build long-term wealth, you need a higher rate of return to outpace inflation. This is why investing in the stock market through low-cost index funds or ETFs is so popular. While it comes with more risk, the historical average return of the S&P 500 has been around 10% annually.</p>
                <h5>3. Consistency (The Fuel)</h5>
                <p>Regular contributions are the fuel for the compounding engine. This is the principle behind your 401(k) contributions coming out of every paycheck. By consistently adding new money, you are constantly giving your investment "snowball" more to grow with, supercharging the entire process.</p>
                
                <h4>The Rule of 72: A Quick Mental Shortcut</h4>
                <p>Want a simple way to estimate how long it will take for your investment to double in value? Use the Rule of 72.</p>
                <p className='font-mono p-2 bg-muted rounded-md text-center'>Years to Double ≈ 72 / Interest Rate</p>
                <p>At a 6% rate of return, your money will double in about 12 years (72 / 6).</p>
                <p>At a 9% rate of return, your money will double in about 8 years (72 / 9).</p>
                <p>At a 12% rate of return, your money will double in about 6 years (72 / 12).</p>
                <p>This rule gives you a powerful sense of how a seemingly small difference in your rate of return can dramatically shorten your timeline to reach your financial goals.</p>
                
                <h4>Putting Compound Interest to Work for You (U.S. Edition)</h4>
                <ul className='list-disc list-inside'>
                    <li><strong>Retirement Accounts (401(k)s, IRAs):</strong> These accounts are designed to be long-term compounding machines. Their tax advantages (either tax-deferred or tax-free growth) allow your money to grow without being slowed down by annual taxes, maximizing the compounding effect.</li>
                    <li><strong>Stock Market Investing:</strong> Buying low-cost index funds or ETFs allows your money to grow with the broader market, reinvesting dividends and capital gains to accelerate compounding.</li>
                    <li><strong>High-Yield Savings Accounts (HYSAs) & CDs:</strong> For your safer money (like an emergency fund), HYSAs and Certificates of Deposit (CDs) allow your cash to compound daily or monthly, ensuring it doesn't lose purchasing power to inflation.</li>
                </ul>

                <h4>The Dark Side of Compounding: High-Interest Debt</h4>
                <p>Compound interest is impartial. It will make you rich, or it will keep you poor. It works just as powerfully against you with high-interest debt.</p>
                <ul className='list-disc list-inside'>
                    <li><strong>Credit Card Debt:</strong> With average APRs often exceeding 20%, a credit card balance is the most destructive example of compounding. If you only make minimum payments, your balance can grow shockingly fast as you pay interest on your interest every month.</li>
                    <li><strong>Student Loans:</strong> Depending on the type, interest can accrue on student loans while you're in school and after, which is why it's critical to have a plan to pay them off.</li>
                </ul>
                <p>Understanding this dark side is vital. Paying off high-interest debt is one of the best financial moves you can make, as it frees you from the negative force of compounding and allows you to put that money to work for you instead.</p>
                
                <h4>Conclusion: Your Future Self Is Counting on You</h4>
                <p>Compound interest is not a get-rich-quick scheme; it's the get-rich-for-sure principle. It is the quiet, mathematical certainty that rewards discipline, consistency, and, above all, patience.</p>
                <p>The path is simple: start as early as you can, invest consistently, choose sound investments, and avoid high-interest debt. By understanding and applying this single principle, you are taking control of your financial destiny and giving yourself the gift of a secure and prosperous future.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on compound interest and financial planning, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/c/compoundinterest.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Compound Interest</a></li>
                  <li><a href="https://www.finra.org/investors/learn-to-invest/advanced-investing/compound-interest" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA: Compound Interest Basics</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
