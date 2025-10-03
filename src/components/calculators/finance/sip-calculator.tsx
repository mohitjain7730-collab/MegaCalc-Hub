
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  monthlyInvestment: z.number().positive(),
  annualInterestRate: z.number().positive(),
  investmentPeriodYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  futureValue: number;
  totalInvestment: number;
  totalProfit: number;
  chartData: { year: number; totalInvestment: number; futureValue: number }[];
}


export default function SipDcaCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: undefined,
      annualInterestRate: undefined,
      investmentPeriodYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monthlyInvestment, annualInterestRate, investmentPeriodYears } = values;
    const r = annualInterestRate / 12 / 100;
    const n = investmentPeriodYears * 12;

    const chartData = [];
    for (let year = 1; year <= investmentPeriodYears; year++) {
      const currentN = year * 12;
      const yearEndFutureValue = monthlyInvestment * ( (Math.pow(1 + r, currentN) - 1) / r ) * (1 + r);
      const yearEndTotalInvestment = monthlyInvestment * currentN;
      chartData.push({
        year: year,
        totalInvestment: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(yearEndFutureValue),
      });
    }

    const futureValue = chartData[chartData.length - 1].futureValue;
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;

    setResult({ futureValue, totalInvestment, totalProfit, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="monthlyInvestment" render={({ field }) => (
                <FormItem><FormLabel>Monthly Investment</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualInterestRate" render={({ field }) => (
                <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="investmentPeriodYears" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Investment Period (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Investment Projection</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Estimated Value</CardDescription>
                        <p className="text-3xl font-bold">${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Investment</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Profit</CardDescription>
                            <p className="text-xl font-semibold">${result.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" unit="yr" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="totalInvestment" name="Total Investment" stroke="hsl(var(--muted-foreground))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="futureValue" name="Estimated Value" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-sip">
          <AccordionTrigger>What is a SIP/DCA?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>A Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA) is a method of investing a fixed amount of money in mutual funds or stocks at regular intervals. It helps in disciplined investing, rupee cost averaging, and harnessing the power of compounding. Instead of investing a large lump sum at once, you invest smaller amounts over time, which can reduce the risk of market volatility.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Monthly Investment</h4>
              <p>The fixed amount of money you plan to invest every month.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Expected Annual Return (%)</h4>
              <p>The rate of return you expect from your investment annually. This is not a guaranteed figure. For example, historically, equity funds have offered higher returns (e.g., 10-15%) with higher risk, while debt funds offer lower, more stable returns (e.g., 5-7%).</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Investment Period (Years)</h4>
              <p>The total duration in years for which you plan to stay invested.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the future value of a series formula to project the growth of your systematic investments over time, factoring in the effect of compound interest on your monthly contributions.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="dca-guide">
            <AccordionTrigger>Complete guide on DCA</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
                <h3>The Smartest Way to Invest? A Beginner's Guide to Dollar-Cost Averaging (DCA)</h3>
                <p>You see the headlines every day. The S&P 500 is up, the NASDAQ is down, and market analysts are predicting a dozen different outcomes. For a new investor, it’s enough to cause paralysis. The biggest fear is simple: "What if I invest all my money right before a market crash?"</p>
                <p>This fear of "timing the market" prevents millions of Americans from ever getting started. But what if there was a strategy that removed timing—and emotion—from the equation? A method that’s simple, automated, and one of the most effective ways for regular people to build long-term wealth?</p>
                <p>Meet Dollar-Cost Averaging (DCA).</p>
                <p>If you have a 401(k) at work, you're likely already using this powerful strategy without even knowing it. This guide will break down exactly what DCA is, how it works, and why it's the perfect approach for anyone looking to invest for their future, minus the stress.</p>

                <h4>So, What Exactly is Dollar-Cost Averaging (DCA)?</h4>
                <p>Think of dollar-cost averaging like an autopay subscription for your investment portfolio.</p>
                <p>In simple terms, Dollar-Cost Averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular, scheduled intervals, regardless of the share price. Instead of trying to find the "perfect" time to invest a large lump sum, you invest smaller, manageable amounts consistently over time—say, $200 every month.</p>
                <p>With each automatic investment, you purchase shares of a mutual fund, ETF, or stock. This automated, disciplined approach takes the guesswork and emotion out of building your portfolio.</p>
                <p>For most Americans, the most common example of DCA is their workplace 401(k) or 403(b) plan. Every payday, a fixed portion of your paycheck is automatically used to buy shares in the funds you’ve selected. It's the "set it and forget it" principle in action.</p>

                <h4>How Does DCA Actually Work? The Mechanics Explained</h4>
                <p>The magic of dollar-cost averaging lies in its simplicity and the way it handles market volatility. Because you invest a fixed dollar amount each time, you automatically buy more shares when the price is low and fewer shares when the price is high.</p>
                <p>This smooths out your average purchase price over time. Let's see it in action.</p>
                <p>Imagine you decide to invest $200 every month into an S&P 500 ETF.</p>
                 <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Investment Amount</TableHead>
                          <TableHead>Share Price</TableHead>
                          <TableHead>Shares Purchased</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow><TableCell>January</TableCell><TableCell>$200</TableCell><TableCell>$100</TableCell><TableCell>2.00</TableCell></TableRow>
                      <TableRow><TableCell>February</TableCell><TableCell>$200</TableCell><TableCell>$90 (Market is down)</TableCell><TableCell>2.22</TableCell></TableRow>
                      <TableRow><TableCell>March</TableCell><TableCell>$200</TableCell><TableCell>$95</TableCell><TableCell>2.11</TableCell></TableRow>
                      <TableRow><TableCell>April</TableCell><TableCell>$200</TableCell><TableCell>$110 (Market is up)</TableCell><TableCell>1.82</TableCell></TableRow>
                      <TableRow><TableCell className="font-bold">Total</TableCell><TableCell className="font-bold">$800</TableCell><TableCell></TableCell><TableCell className="font-bold">8.15</TableCell></TableRow>
                  </TableBody>
              </Table>
              <p>Now, let's do the math:</p>
              <p>Total Amount Invested: $800</p>
              <p>Total Shares Purchased: 8.15</p>
              <p>Average Cost Per Share: $800 / 8.15 = $98.16</p>
              <p>Notice that your average cost per share ($98.16) is lower than the average market price during that period ($98.75). When the market dipped in February, your fixed $200 bought more shares, lowering your overall average cost. You benefited from the downturn without having to predict it.</p>

              <h4>The Core Benefits of DCA: Why It’s a Go-To Strategy</h4>
              <p>Dollar-cost averaging is popular for good reason. It offers advantages that make investing accessible and psychologically easier to handle.</p>
              <h5>1. It Removes Emotion and Timing the Market</h5>
              <p>The biggest enemy of the average investor isn't a market crash; it's emotional decision-making. We tend to get greedy when markets are high and panic-sell when they're low. DCA automates the process, forcing you to buy consistently, which is the key to long-term success. It’s a strategy built on discipline, not prediction.</p>
              <h5>2. It Harnesses the Power of Compounding</h5>
              <p>Compounding is the process where your investment returns start generating their own returns. By investing regularly, you are consistently adding fuel to this "snowball effect."</p>
              <p>A Practical Example: Let's say a 25-year-old named Emily starts investing $400 per month in a Roth IRA. Assuming an average annual market return of 9%, let's see how her investment grows:</p>
                <ul className="list-disc list-inside">
                    <li>After 10 years: She invests $48,000. The value becomes ~$79,000.</li>
                    <li>After 20 years: She invests $96,000. The value becomes ~$226,000.</li>
                    <li>After 30 years: She invests $144,000. The value becomes a staggering ~$585,000.</li>
                </ul>
              <p>The longer you stay invested, the more powerful compounding becomes. Starting early is the key.</p>
              <h5>3. It Makes Investing Accessible</h5>
              <p>You don't need thousands of dollars to get started. With DCA, you can begin building a powerful portfolio with as little as $25 or $50 a month. Modern brokerage platforms like Fidelity, Vanguard, Charles Schwab, and others make it incredibly easy to set up automatic, recurring investments into a wide range of funds.</p>

              <h4>DCA vs. Lump Sum Investing: Which Is Right for You?</h4>
              <p>This is a classic debate. Lump sum investing is when you invest a large amount of cash all at once.</p>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Dollar-Cost Averaging (DCA)</TableHead>
                          <TableHead>Lump Sum Investing</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell>Method</TableCell>
                          <TableCell>Invest a fixed amount regularly over time.</TableCell>
                          <TableCell>Invest a large amount all at once.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Market Timing</TableCell>
                          <TableCell>Not required. Averages out purchase price.</TableCell>
                          <TableCell>Timing is a major factor. Risk of investing at a peak.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Risk</TableCell>
                          <TableCell>Lower psychological risk. Easier to handle volatility.</TableCell>
                          <TableCell>Higher risk of "bad timing" and investor regret.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Ideal For</TableCell>
                          <TableCell>Regular investing from a paycheck, beginners, risk-averse investors.</TableCell>
                          <TableCell>Those with a large windfall (inheritance, bonus) who have a long time horizon.</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
              <p>While some academic studies show that, historically, lump sum investing has produced slightly higher returns (because the U.S. market tends to go up over time), DCA is often the superior strategy from a behavioral standpoint. It prevents you from waiting on the sidelines for a "perfect" moment that may never come.</p>

              <h4>How to Start Dollar-Cost Averaging in 4 Simple Steps</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open an Investment Account: If you don't have a 401(k) at work, you can easily open a personal investment account. A Roth IRA or Traditional IRA are excellent options for retirement savings. A standard brokerage account offers more flexibility.</li>
                <li>Choose Your Investments: You don’t need to be a stock-picking genius. For most people, a low-cost, diversified index fund or ETF (e.g., one that tracks the S&P 500 or the total stock market) is a fantastic choice.</li>
                <li>Set Up Automatic Transfers: Link your checking or savings account to your new investment account.</li>
                <li>Automate Your Purchases: Set up a recurring investment. Decide your amount ($100, $250, etc.) and your frequency (e.g., monthly on the 15th) to automatically buy shares of your chosen fund.</li>
              </ol>

              <h4>Conclusion: Time in the Market, Not Timing the Market</h4>
              <p>Dollar-cost averaging is more than just an investment technique; it’s a philosophy. It’s built on the proven principle that the key to long-term success is not about perfectly timing the market’s highs and lows, but about consistently participating in its long-term growth.</p>
              <p>It’s a strategy that turns market volatility from a source of fear into an opportunity. By embracing this disciplined, automated approach, you can build wealth steadily, systematically, and without the stress. Your future self will thank you for it.</p>
              <p className="text-xs">Disclaimer: This article is for educational purposes only and should not be considered financial advice. All investments involve risk and can lose value. Consult a certified financial professional before making any investment decisions.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about Systematic Investment Plans and related concepts, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/d/dollarcostaveraging.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: What Is Dollar-Cost Averaging (DCA)?</a></li>
                  <li><a href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investor.gov (U.S. SEC): Mutual Funds</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
