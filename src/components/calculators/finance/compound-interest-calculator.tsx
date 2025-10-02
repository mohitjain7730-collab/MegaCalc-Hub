
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
              <p>Albert Einstein, one of history's greatest minds, is often credited with calling compound interest "the eighth wonder of the world," adding, "He who understands it, earns it; he who doesn't, pays it."</p>
              <p>While the quote's origin is debated, its wisdom is undeniable. Compound interest is the silent, powerful force behind nearly every story of long-term wealth creation. It’s the secret sauce that can turn small, consistent savings into a substantial fortune over time.</p>
              <p>Many have heard the term, but few truly grasp its profound implications for their financial lives. This guide will change that. We'll demystify compound interest, break down how it works, and show you how to harness its incredible power to build the financial future you deserve.</p>
              
              <h4>What is Compound Interest, Really?</h4>
              <p>In the simplest terms, compound interest is interest earned on interest.</p>
              <p>Let's break that down. When you save or invest money, you earn a return (interest).</p>
              <p>With simple interest, you only ever earn interest on your initial investment (the "principal").</p>
              <p>With compound interest, you earn interest on your initial principal and on the accumulated interest from previous periods.</p>
              <p>Think of it like a snowball rolling downhill. It starts small, but as it rolls, it picks up more snow, growing larger. As it gets larger, it picks up even more snow with each rotation, accelerating its growth. Your money works the same way. The returns your investment generates are reinvested, and they start generating their own returns. This creates a cycle of accelerating, exponential growth.</p>
              
              <h4>Simple vs. Compound Interest: A Tale of Two Investments</h4>
              <p>To see the staggering difference, let’s imagine two people, Alex and Ben, who both invest ₹1,00,000 at a 10% annual rate of return for 20 years.</p>
              <p>Alex's investment earns simple interest.</p>
              <p>Ben's investment earns compound interest.</p>
              
              <Table>
                <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Alex's Investment (Simple)</TableHead><TableHead>Ben's Investment (Compound)</TableHead><TableHead>The Difference</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow><TableCell>Start</TableCell><TableCell>₹1,00,000</TableCell><TableCell>₹1,00,000</TableCell><TableCell>₹0</TableCell></TableRow>
                    <TableRow><TableCell>Year 1</TableCell><TableCell>₹1,10,000</TableCell><TableCell>₹1,10,000</TableCell><TableCell>₹0</TableCell></TableRow>
                    <TableRow><TableCell>Year 5</TableCell><TableCell>₹1,50,000</TableCell><TableCell>₹1,61,051</TableCell><TableCell>₹11,051</TableCell></TableRow>
                    <TableRow><TableCell>Year 10</TableCell><TableCell>₹2,00,000</TableCell><TableCell>₹2,59,374</TableCell><TableCell>₹59,374</TableCell></TableRow>
                    <TableRow><TableCell>Year 15</TableCell><TableCell>₹2,50,000</TableCell><TableCell>₹4,17,725</TableCell><TableCell>₹1,67,725</TableCell></TableRow>
                    <TableRow><TableCell>Year 20</TableCell><TableCell>₹3,00,000</TableCell><TableCell>₹6,72,750</TableCell><TableCell>₹3,72,750</TableCell></TableRow>
                </TableBody>
              </Table>
              <p>Alex earns a predictable ₹10,000 every single year. After 20 years, his investment has tripled. A respectable outcome.</p>
              <p>Ben, however, experiences something far more powerful. In the first few years, the difference is minor. But as the years roll on, his investment begins to surge ahead. By year 20, Ben’s investment is worth more than double Alex’s, all because his interest was earning its own interest. The gap doesn't just grow; it widens exponentially.</p>

              <h4>Under the Hood: The Compound Interest Formula Explained</h4>
              <p>For those who want to see the engine driving this growth, here is the mathematical formula for compound interest:</p>
              <p className='font-mono p-4 bg-muted rounded-md'>A = P(1 + r/n)^(nt)</p>
              <p>It might look intimidating, but it’s quite simple when you break it down:</p>
              <ul>
                <li><strong>A</strong> = The future value of the investment/loan, including interest.</li>
                <li><strong>P</strong> = The principal amount (the initial amount of money).</li>
                <li><strong>r</strong> = The annual interest rate (in decimal form, so 10% = 0.10).</li>
                <li><strong>n</strong> = The number of times that interest is compounded per year (e.g., for annually n=1, for quarterly n=4, for monthly n=12).</li>
                <li><strong>t</strong> = The number of years the money is invested or borrowed for.</li>
              </ul>
              <p>The frequency of compounding (n) can have a significant impact. Compounding monthly is better than compounding annually, as your interest starts earning interest sooner.</p>

              <h4>The Three Levers of Compounding: How to Make it Work for You</h4>
              <p>The formula reveals three key "levers" you can pull to maximize the power of compounding in your own life.</p>
              <h5>1. Time (The Accelerator)</h5>
              <p>This is the most critical ingredient. The longer your money has to compound, the more dramatic the results. A small amount invested early can easily outperform a large amount invested later. Let's consider two investors:</p>
              <p><strong>Priya (The Early Bird):</strong> Starts investing ₹5,000 per month at age 25. She stops investing completely at age 35. Total investment: ₹6 Lakhs over 10 years.</p>
              <p><strong>Rohan (The Late Bloomer):</strong> Starts investing ₹5,000 per month at age 35 and invests continuously until age 60. Total investment: ₹15 Lakhs over 25 years.</p>
              <p>Assuming a 12% annual return, at age 60, Priya's corpus will be approximately ₹1.6 Crores, while Rohan's will only be around ₹95 Lakhs. Even though Priya invested for only 10 years and stopped, her early start gave her money a 35-year runway to grow, allowing her to comfortably beat Rohan, who invested for 25 years.</p>
              <h5>2. Rate of Return (The Engine)</h5>
              <p>The rate at which your money grows matters immensely. A higher rate of return means your money doubles faster. This is why simply keeping your savings in a low-yield bank account is not an effective long-term strategy. To truly harness compounding, you need to invest in assets with the potential for higher returns, like equity mutual funds or stocks, which have historically outpaced inflation and other asset classes over the long term.</p>
              <h5>3. Consistency (The Fuel)</h5>
              <p>While starting with a lump sum is great, the real magic for most people comes from consistent, regular investments. Adding fresh capital to your portfolio regularly (like through a Systematic Investment Plan or SIP) means you are constantly giving your investment "snowball" more snow to accumulate, fueling its growth even further.</p>
              
              <h4>The Rule of 72: A Quick Mental Shortcut</h4>
              <p>Want a simple way to estimate how long it will take for your investment to double? Use the Rule of 72.</p>
              <p className='font-mono p-2 bg-muted rounded-md text-center'>Years to Double ≈ 72 / Interest Rate</p>
              <p>If your investment earns 6% a year, it will take approximately 12 years to double (72 / 6 = 12).</p>
              <p>If your investment earns 9% a year, it will take approximately 8 years to double (72 / 9 = 8).</p>
              <p>If your investment earns 12% a year, it will take approximately 6 years to double (72 / 12 = 6).</p>
              <p>This handy rule gives you a tangible sense of how different rates of return can impact the speed of your wealth creation.</p>
              
              <h4>The Dark Side of Compounding: How It Can Work Against You</h4>
              <p>As Einstein's quote implies, compounding is a double-edged sword. If you understand it, you can earn it through investing. If you don't, you will inevitably pay it through debt.</p>
              <p>Compounding works just as powerfully against you with high-interest debt like:</p>
              <ul className='list-disc list-inside'>
                <li><strong>Credit Card Balances:</strong> Credit cards often have annual interest rates of 24% to 48%. If you only make minimum payments, your balance can quickly spiral out of control as you pay interest on your interest month after month.</li>
                <li><strong>Personal Loans:</strong> While at lower rates than credit cards, these loans also use compound interest, making it crucial to pay them off diligently.</li>
              </ul>
              <p>Understanding this dark side is essential. Prioritizing the repayment of high-interest debt is one of the smartest financial moves you can make, as it stops the destructive power of compounding from working against you.</p>

              <h4>Conclusion: Your Future Self is Counting on You</h4>
              <p>Compound interest isn't a "get rich quick" scheme. It's a "get rich smart" principle. It's the reward for discipline, patience, and foresight.</p>
              <p>The path to harnessing its power is clear:</p>
              <ul className='list-disc list-inside'>
                <li>Start as early as you possibly can.</li>
                <li>Save and invest consistently, no matter how small the amount.</li>
                <li>Invest in assets that provide a healthy rate of return over the long term.</li>
                <li>Be patient and let time work its magic.</li>
                <li>Avoid high-interest debt that turns compounding into your enemy.</li>
              </ul>
              <p>The numbers and charts in this guide are not just theory; they are a preview of your own financial potential. By understanding and applying the principle of compound interest, you are taking control of your financial destiny and giving your future self the greatest gift possible: the gift of financial freedom.</p>
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

