
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
          <AccordionTrigger>What is a SIP?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money in mutual funds at regular intervals (usually monthly). It helps in disciplined investing, rupee cost averaging, and harnessing the power of compounding. Instead of investing a large lump sum at once, you invest smaller amounts over time, which can reduce the risk of market volatility.</p>
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
        <AccordionItem value="sip-guide">
            <AccordionTrigger>Complete Guide on SIP</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3 className="font-semibold text-foreground">What is an SIP? The Ultimate Beginner's Guide to Building Wealth in 2025</h3>
              <p>Ever looked at the stock market and felt overwhelmed? The soaring highs, the gut-wrenching lows, the complex jargon—it’s enough to make anyone think, "Investing is not for me." But what if there was a way to invest that didn't require you to be a market guru? A method that was simple, disciplined, and incredibly powerful over the long term?</p>
              <p>Enter the Systematic Investment Plan (SIP).</p>
              <p>If you're a salaried employee, a student with pocket money, or anyone looking to build wealth steadily without the stress of timing the market, this guide is for you. We'll break down exactly what an SIP is, how it works, and why it might just be the smartest financial decision you make this year.</p>
              
              <h4 className="font-semibold text-foreground">So, What Exactly is a Systematic Investment Plan (SIP)?</h4>
              <p>Think of an SIP like a subscription service for your future wealth.</p>
              <p>In simple terms, a Systematic Investment Plan (SIP) is a method of investing a fixed amount of money in mutual funds at regular intervals (usually weekly, monthly, or quarterly). Instead of investing a large one-time amount (known as a lump sum), you invest smaller, manageable amounts consistently over time.</p>
              <p>Your bank account is automatically debited on a pre-decided date, and that money is used to purchase units of your chosen mutual fund scheme. It’s an automated, disciplined approach to investing that takes the emotion and guesswork out of the equation.</p>

              <h4 className="font-semibold text-foreground">How Does an SIP Actually Work? The Mechanics Explained</h4>
              <p>Let's break it down into a simple, step-by-step process:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>You Choose a Mutual Fund:</strong> First, you select a mutual fund that aligns with your financial goals (e.g., a large-cap equity fund for long-term growth or a hybrid fund for balanced risk).</li>
                <li><strong>You Decide on an Amount and Frequency:</strong> You decide how much you want to invest. This can be as low as ₹100 or ₹500 per month. You also choose the frequency—most commonly, monthly.</li>
                <li><strong>You Set a Date:</strong> You pick a date of the month for the investment to be automatically deducted from your bank account.</li>
                <li><strong>The Automation Kicks In:</strong> On that chosen date every month, the fixed amount is transferred from your bank and invested into the mutual fund. You are allotted mutual fund units based on the Net Asset Value (NAV) of the fund on that day.</li>
                <li><strong>The Cycle Repeats:</strong> This process repeats every month, slowly and steadily building your investment portfolio without you having to lift a finger.</li>
              </ol>
              <p>The magic of an SIP lies in two core principles that we will explore next: Rupee Cost Averaging and the Power of Compounding.</p>

              <h4 className="font-semibold text-foreground">The Core Benefits of SIP: Why It's a Smart Choice for Everyone</h4>
              <p>SIPs are popular for a reason. They offer a host of advantages that make investing accessible and effective for the average person.</p>
              
              <h5>1. Rupee Cost Averaging: Your Shield Against Market Volatility</h5>
              <p>This is perhaps the most significant advantage of an SIP. "Rupee Cost Averaging" sounds complex, but the concept is beautifully simple.</p>
              <p>Since you invest a fixed amount every month, you automatically buy more units when the market is down (prices are low) and fewer units when the market is up (prices are high). This averages out your purchase cost per unit over time, reducing the risk of entering the market at a peak.</p>
              <p>Let's see it in action with an example:</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Investment Amount</TableHead>
                    <TableHead>NAV (Price per Unit)</TableHead>
                    <TableHead>Units Purchased</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>January</TableCell><TableCell>₹5,000</TableCell><TableCell>₹50</TableCell><TableCell>100.00</TableCell></TableRow>
                  <TableRow><TableCell>February</TableCell><TableCell>₹5,000</TableCell><TableCell>₹45 (Market down)</TableCell><TableCell>111.11</TableCell></TableRow>
                  <TableRow><TableCell>March</TableCell><TableCell>₹5,000</TableCell><TableCell>₹48</TableCell><TableCell>104.17</TableCell></TableRow>
                  <TableRow><TableCell>April</TableCell><TableCell>₹5,000</TableCell><TableCell>₹55 (Market up)</TableCell><TableCell>90.91</TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">Total</TableCell><TableCell className="font-bold">₹20,000</TableCell><TableCell></TableCell><TableCell className="font-bold">406.19</TableCell></TableRow>
                </TableBody>
              </Table>
              <p>Total Investment: ₹20,000</p>
              <p>Total Units Purchased: 406.19</p>
              <p>Average Cost Per Unit: ₹20,000 / 406.19 = ₹49.24</p>
              <p>Notice how your average purchase cost (₹49.24) is lower than the average market price over the four months. You benefited from the market dip in February by automatically buying more units. This is rupee cost averaging—it smooths out the bumps and removes the need to time the market perfectly.</p>

              <h5>2. The Power of Compounding: The 8th Wonder of the World</h5>
              <p>Albert Einstein reportedly called compounding interest "the eighth wonder of the world." An SIP is the perfect vehicle to harness this power.</p>
              <p>Compounding is the process where your investment returns start generating their own returns. With an SIP, your monthly investments grow, and the returns you earn are reinvested, leading to exponential growth over the long term.</p>
              <p><strong>A Practical Example:</strong> Let's say a 25-year-old named Priya starts an SIP of ₹5,000 per month. Assuming an average annual return of 12%, let's see how her investment grows:</p>
              <ul className="list-disc list-inside">
                <li><strong>After 10 years:</strong> She invests ₹6 Lakhs. The value becomes ~₹11.6 Lakhs.</li>
                <li><strong>After 20 years:</strong> She invests ₹12 Lakhs. The value becomes ~₹50 Lakhs.</li>
                <li><strong>After 30 years:</strong> She invests ₹18 Lakhs. The value becomes a staggering ~₹1.76 Crores.</li>
              </ul>
              <p>The longer you stay invested, the more powerful compounding becomes. That's why starting early, even with a small amount, is key.</p>
              
              <h5>3. Fosters Financial Discipline</h5>
              <p>One of the biggest hurdles to wealth creation is a lack of discipline. SIPs solve this by automating the process. The money is debited from your account before you have a chance to spend it, instilling a regular saving and investing habit. It treats investing like a mandatory monthly bill—one that pays you back handsomely in the future.</p>

              <h5>4. Accessibility and Affordability</h5>
              <p>You don’t need a large sum of money to start investing. With SIPs, you can start with as little as ₹100 or ₹500 per month. This breaks down the barrier to entry, making it possible for students, young professionals, and small-income earners to participate in the growth potential of the markets.</p>

              <h4 className="font-semibold text-foreground">SIP vs. Lump Sum: Which Is Right for You?</h4>
              <p>This is a common question for new investors. A lump sum investment involves investing a large, one-time amount.</p>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Systematic Investment Plan (SIP)</TableHead>
                          <TableHead>Lump Sum Investment</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell>Method</TableCell>
                          <TableCell>Invest a fixed amount regularly.</TableCell>
                          <TableCell>Invest a large amount at once.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Market Timing</TableCell>
                          <TableCell>Not required. Benefits from volatility.</TableCell>
                          <TableCell>Requires careful timing for best results.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Risk</TableCell>
                          <TableCell>Lower, as risk is averaged out over time.</TableCell>
                          <TableCell>Higher, as entering at a market peak can lead to losses.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Discipline</TableCell>
                          <TableCell>Enforces a disciplined investing habit.</TableCell>
                          <TableCell>A one-time action; does not build a habit.</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell>Ideal For</TableCell>
                          <TableCell>Salaried individuals, beginners, long-term goal planning.</TableCell>
                          <TableCell>Experienced investors, those with a large windfall (e.g., bonus, inheritance).</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
              <p>For most people, especially beginners, the disciplined and risk-mitigating nature of an SIP makes it the superior choice.</p>

              <h4 className="font-semibold text-foreground">How to Start Your First SIP in 5 Simple Steps</h4>
              <p>Getting started is easier than you think. Here’s a quick guide:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Complete Your KYC:</strong> KYC (Know Your Customer) is a mandatory requirement. You'll need your PAN card, Aadhaar card, and a photograph. Most platforms offer a completely digital, paperless KYC process that takes just a few minutes.</li>
                <li><strong>Choose the Right Mutual Fund:</strong> Research funds based on your goals, risk appetite, and investment horizon. Platforms like Groww, Zerodha Coin, and Kuvera provide easy-to-use tools for research.</li>
                <li><strong>Decide Your SIP Amount & Date:</strong> Choose a monthly investment amount that fits your budget and a date that is usually after your salary credit.</li>
                <li><strong>Set Up the Auto-Debit Mandate:</strong> Link your bank account and authorize the auto-debit. This is a one-time setup that allows the platform to automatically deduct the SIP amount every month.</li>
                <li><strong>Monitor, But Don't Panic:</strong> Once started, your investments will fluctuate with the market. The key is to stay invested for the long term and not panic-sell during downturns. Remember the principle of rupee cost averaging!</li>
              </ol>

              <h4 className="font-semibold text-foreground">Frequently Asked Questions (FAQs) about SIPs</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Can I stop or pause my SIP?</strong><br/>Yes, you have complete flexibility. You can pause your SIP for a few months or stop it altogether without any penalty. You can also redeem your invested amount at any time (subject to exit loads, if any).</li>
                <li><strong>Is there a lock-in period for SIPs?</strong><br/>Most regular mutual fund SIPs do not have a lock-in period. The exception is ELSS (Equity Linked Savings Schemes) funds, which have a mandatory lock-in period of 3 years but offer tax benefits under Section 80C.</li>
                <li><strong>Are SIP returns guaranteed?</strong><br/>No. SIPs invest in mutual funds, which are linked to the market. Returns are not guaranteed and are subject to market risks. However, the long-term historical performance of equity markets has been positive.</li>
                <li><strong>Can I increase my SIP amount?</strong><br/>Absolutely! You can use a "SIP Top-up" or "Step-up SIP" feature to automatically increase your SIP amount by a fixed percentage or amount annually. This is a great way to align your investments with your salary increments.</li>
              </ol>

              <h4 className="font-semibold text-foreground">Conclusion: Your First Step Towards Financial Freedom</h4>
              <p>A Systematic Investment Plan isn't a get-rich-quick scheme. It’s a get-rich-slowly-but-surely strategy. It is a testament to the idea that small, consistent actions can lead to massive results over time.</p>
              <p>By embracing the discipline of regular investing and harnessing the power of compounding and rupee cost averaging, an SIP demystifies the world of investing. It puts you in the driver's seat of your financial journey, turning your long-term goals—be it buying a house, funding your child’s education, or retiring comfortably—into achievable realities.</p>
              <p>So, don't wait for the "perfect time" to invest. The best time was yesterday. The next best time is today. Start your SIP, stay patient, and let time do the heavy lifting for you.</p>
              
              <p className="text-xs"><strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. This article is for educational purposes only and should not be considered financial advice. Consult a certified financial advisor before making any investment decisions.</p>

            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about Systematic Investment Plans and related concepts, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/s/systematicinvestmentplan.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: What Is a Systematic Investment Plan (SIP)?</a></li>
                  <li><a href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investor.gov (U.S. SEC): Mutual Funds</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
