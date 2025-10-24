
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  chartData: { year: number; totalInvestment: number; futureValue: number; profit: number }[];
  annualizedReturn: number;
  profitPercentage: number;
  monthlyContribution: number;
  years: number;
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
      const yearEndProfit = yearEndFutureValue - yearEndTotalInvestment;
      chartData.push({
        year: year,
        totalInvestment: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(yearEndFutureValue),
        profit: Math.round(yearEndProfit),
      });
    }

    const futureValue = chartData[chartData.length - 1].futureValue;
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;
    const profitPercentage = (totalProfit / totalInvestment) * 100;
    const annualizedReturn = Math.pow(futureValue / totalInvestment, 1 / investmentPeriodYears) - 1;

    setResult({ 
      futureValue, 
      totalInvestment, 
      totalProfit, 
      chartData,
      annualizedReturn: annualizedReturn * 100,
      profitPercentage,
      monthlyContribution: monthlyInvestment,
      years: investmentPeriodYears
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Enter your investment details to see how your money can grow over time
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="monthlyInvestment" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monthly Investment Amount
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 500" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        The fixed amount you plan to invest every month. Even small amounts like $50-100 can make a significant difference over time.
                      </p>
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="annualInterestRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Expected Annual Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 10" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Historical average returns: S&P 500 (~10%), Bonds (~5%), Real Estate (~7%). Remember, past performance doesn't guarantee future results.
                      </p>
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="investmentPeriodYears" 
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Investment Period (Years)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 20" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        The longer you stay invested, the more powerful compounding becomes. Time is your greatest ally in building wealth.
                      </p>
                    </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate My Investment Growth
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>
      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Investment Projection</CardTitle>
                  <CardDescription>
                    Based on ${result.monthlyContribution.toLocaleString()} monthly investments for {result.years} years
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total value after {result.years} years
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${result.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your contributions over time
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.profitPercentage.toFixed(1)}% return on investment
                  </p>
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Annualized Return
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {result.annualizedReturn.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average annual return on your investment
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Investment Multiplier
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {(result.futureValue / result.totalInvestment).toFixed(1)}x
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your money grows by this factor
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Growth Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        unit="yr" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value/1000)}k`} 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`, 
                          name === 'totalInvestment' ? 'Total Invested' : 
                          name === 'futureValue' ? 'Portfolio Value' : 'Profit'
                        ]}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalInvestment" 
                        name="Total Investment" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="futureValue" 
                        name="Portfolio Value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        name="Profit" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights and Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Key Insights & Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 The Power of Compounding
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your profit of ${result.totalProfit.toLocaleString()} represents the magic of compound interest. 
                    Your money is working for you, generating returns on both your contributions and previous gains.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    📈 Dollar-Cost Averaging Benefits
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    By investing ${result.monthlyContribution.toLocaleString()} monthly, you're buying more shares when prices are low 
                    and fewer when prices are high, smoothing out market volatility.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    ⏰ Time is Your Greatest Asset
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    The longer you stay invested, the more powerful compounding becomes. 
                    Starting early and staying consistent is key to building wealth.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    🎯 Consider Increasing Contributions
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    As your income grows, consider increasing your monthly investment. 
                    Even a 10% increase can significantly boost your final portfolio value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* What is SIP/DCA Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is a SIP/DCA?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>A Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA) is a method of investing a fixed amount of money in mutual funds or stocks at regular intervals. It helps in disciplined investing, rupee cost averaging, and harnessing the power of compounding. Instead of investing a large lump sum at once, you invest smaller amounts over time, which can reduce the risk of market volatility.</p>
          </CardContent>
        </Card>

        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
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
          </CardContent>
        </Card>

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>This calculator uses the future value of a series formula to project the growth of your systematic investments over time, factoring in the effect of compound interest on your monthly contributions.</p>
          </CardContent>
        </Card>
        {/* Complete Guide on DCA Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Complete Guide on DCA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
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
          </CardContent>
        </Card>

        {/* Further Reading Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Further Reading
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>To learn more about Systematic Investment Plans and related concepts, you can visit these credible resources:</p>
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li><a href="https://www.investopedia.com/terms/d/dollarcostaveraging.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: What Is Dollar-Cost Averaging (DCA)?</a></li>
                <li><a href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investor.gov (U.S. SEC): Mutual Funds</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
