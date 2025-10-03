
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  initialAmount: z.number().positive(),
  inflationRate: z.number().positive(),
  years: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InflationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialAmount: undefined,
      inflationRate: undefined,
      years: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { initialAmount, inflationRate, years } = values;
    const i = inflationRate / 100;
    const futureValue = initialAmount / Math.pow(1 + i, years);
    setResult(futureValue);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="initialAmount" render={({ field }) => (
                <FormItem><FormLabel>Initial Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="inflationRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Inflation Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Number of Years</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingDown className="h-8 w-8 text-primary" /><CardTitle>Future Purchasing Power</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-lg">In {form.getValues('years')} years, your ${form.getValues('initialAmount').toLocaleString()} will have the same purchasing power as</p>
                    <p className="text-4xl font-bold">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className="text-lg">today.</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-inflation">
          <AccordionTrigger>What is Inflation?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power of currency is falling. This calculator shows you how the value of your money can decrease over time.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Initial Amount</h4>
                  <p>The amount of money you want to project the future value of.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Inflation Rate (%)</h4>
                  <p>The expected average rate of inflation per year. You can use historical averages or government targets as an estimate.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Number of Years</h4>
                  <p>The number of years into the future you want to calculate for.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator uses the formula for present value to determine the future purchasing power of your money. It discounts the initial amount by the annual inflation rate over the number of years specified.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="inflation-guide">
            <AccordionTrigger>The Shrinking Dollar: A Simple Guide to Understanding Inflation</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>The Shrinking Dollar: A Simple Guide to Understanding Inflation</h3>
              <p>Do you remember when a gallon of gas was comfortably under $3? When a full cart of groceries didn't feel like a car payment? Or when your favorite lunch spot charged $10 for a sandwich that now costs $15?</p>
              <p>If you’ve felt your money just doesn't stretch as far as it used to, you're not imagining things. You're experiencing a powerful economic force that affects every single one of us, from Wall Street investors to families buying milk and bread. That force has a name: inflation.</p>
              <p>After years of being a sleepy, academic topic, inflation has become a kitchen-table issue across America. But what is it, really? This guide will demystify inflation, explaining in simple terms what it is, why it happens, and—most importantly—what you can do to protect your hard-earned money from its effects.</p>
              <h4>What is Inflation? The Shrinking Power of Your Dollar</h4>
              <p>At its core, inflation is the rate at which the general level of prices for goods and services rises, and subsequently, the purchasing power of your money falls.</p>
              <p>It’s not that the items themselves are suddenly more valuable; it's that each dollar you have becomes slightly less valuable and can buy a little bit less than it could before. This decline in purchasing power is the key concept. A $100 bill in 2025 can't buy the same amount of goods as a $100 bill could in 2015.</p>
              <p>Think of your savings as water in a bucket. Inflation is a slow, silent leak. If you just let your money sit there, the water level (your purchasing power) will steadily drop over time. To stay ahead, you need to be adding water to the bucket (earning a return on your money) faster than the leak is draining it.</p>
              <h4>How Is Inflation Measured? Understanding the CPI</h4>
              <p>Economists don't just "feel" that prices are rising. They measure it. In the United States, the most widely cited measure of inflation is the Consumer Price Index (CPI), which is calculated and published monthly by the U.S. Bureau of Labor Statistics (BLS).</p>
              <p>Think of the CPI as a giant, representative shopping cart filled with thousands of goods and services that the average American household buys. The BLS tracks the total cost of this "basket" every month.</p>
              <p>What's in the basket? It includes things like:</p>
              <ul className="list-disc list-inside">
                <li>Food: Groceries like milk, eggs, and bread; restaurant meals.</li>
                <li>Energy: Gasoline, electricity, natural gas.</li>
                <li>Housing: Rent, and an equivalent for homeownership.</li>
                <li>Transportation: New and used cars, airfare.</li>
                <li>Apparel: Clothing and shoes.</li>
                <li>Medical Care: Doctor visits, prescription drugs.</li>
              </ul>
              <p>The inflation rate that you see in the news is simply the percentage change in the CPI from one year to the next. If the CPI was 100 last year and is 103 this year, the annual inflation rate is 3%.</p>
              <h4>What Causes Inflation? The Economic Push and Pull</h4>
              <p>There is no single cause of inflation. It’s usually a combination of factors that can be broadly grouped into two categories:</p>
              <h5>1. Demand-Pull Inflation ("Too much money chasing too few goods")</h5>
              <p>This is the classic inflation scenario. It happens when the demand for goods and services in the economy is stronger than the supply. When everyone wants to buy something and there isn't enough to go around, prices naturally get bid up. We saw a perfect example of this in the years following the pandemic. A combination of government stimulus, low interest rates, and pent-up consumer demand created a surge in spending that supply chains couldn't keep up with, leading to higher prices.</p>
              <h5>2. Cost-Push Inflation ("It costs more to make and sell things")</h5>
              <p>This type of inflation happens when the costs to produce goods and services rise. Businesses, facing higher expenses, pass those costs on to consumers in the form of higher prices to protect their profit margins.</p>
              <p>Common causes include:</p>
              <ul className="list-disc list-inside">
                  <li>Supply Chain Shocks: As we saw globally, disruptions can make it more expensive to get raw materials and transport finished goods.</li>
                  <li>Rising Energy Prices: Higher gas and oil prices increase shipping costs for nearly every product.</li>
                  <li>Increased Labor Costs: A tight labor market can lead to higher wages, which can be passed on to consumers.</li>
              </ul>
              <h4>Why Inflation Is the "Silent Tax" on Your Savings</h4>
              <p>A little bit of inflation (around 2%) is generally considered healthy for a growing economy. But when inflation is high, it acts as a silent tax that erodes the value of your savings, especially cash.</p>
              <p>Here’s why. Money sitting in a standard checking or low-yield savings account is actively losing purchasing power every single day.</p>
              <p>Let's use an example:</p>
              <p>You have $10,000 saved in an account earning 0.1% interest.</p>
              <p>The annual inflation rate is 4%.</p>
              <p>After one year, your account will have $10,010. However, the cost of goods that $10,000 could buy a year ago has now risen by 4% to $10,400. Even though your account balance went up slightly, you’ve effectively lost nearly $400 in purchasing power. You didn’t "lose" money, but the value of your money decreased significantly.</p>
              <h4>How to Protect Your Money From Inflation: Your Financial Shield</h4>
              <p>You can't control the national inflation rate, but you can control your personal financial strategy. Here are the most effective ways to shield your money from the effects of inflation.</p>
              <h5>1. Investing is Your Best Defense</h5>
              <p>The primary goal is to earn a rate of return on your money that is higher than the rate of inflation.</p>
              <ul className="list-disc list-inside">
                  <li><strong>Stocks:</strong> Over the long term, the stock market has been one of the best hedges against inflation. Growing companies are often able to pass on rising costs to customers and increase their earnings, which is reflected in their stock price. A diversified, low-cost index fund (like one tracking the S&P 500) is a go-to for most long-term investors.</li>
                  <li><strong>Real Estate:</strong> Property values and rental income tend to rise with inflation, making real estate a historically strong hedge.</li>
                  <li><strong>TIPS (Treasury Inflation-Protected Securities):</strong> These are U.S. government bonds that are specifically designed to protect against inflation. The principal value of a TIPS bond increases with inflation, and it pays interest twice a year at a fixed rate.</li>
              </ul>
              <h5>2. Manage Your Debt Wisely</h5>
              <p>Inflation can be a friend to those with fixed-rate debt. If you have a 30-year fixed-rate mortgage at 3.5%, you are paying back that loan with dollars that are worth less and less over time, while your income will hopefully be rising. However, high-interest, variable-rate debt like credit cards can become even more dangerous, as the interest rates on that debt will likely rise as well.</p>
              <h5>3. Increase Your Earning Power</h5>
              <p>Your income is your most powerful inflation-fighting tool. It's crucial to ensure your pay is keeping pace with the rising cost of living. This means regularly negotiating for raises, seeking promotions, or developing new skills to increase your market value.</p>
              <h4>The Role of the Federal Reserve</h4>
              <p>In the U.S., the central bank known as the Federal Reserve (or "the Fed") is tasked with keeping inflation in check. Their primary tool for this is the federal funds rate, which influences all other interest rates in the economy.</p>
              <p>To fight high inflation, the Fed raises interest rates. This makes borrowing money more expensive for both consumers and businesses, which cools down demand and helps bring prices back under control, as we saw in 2022 and 2023.</p>
              <p>To stimulate a weak economy, the Fed lowers interest rates.</p>
              <h4>Conclusion: You Are in Control</h4>
              <p>Inflation can feel like an invisible force chipping away at your financial well-being. But by understanding what it is and how it works, you can move from a position of anxiety to one of control.</p>
              <p>You can't stop the price of gas from going up, but you can build a financial plan that ensures your wealth grows faster than prices do. The key is to transform yourself from just a saver into an investor, putting your money to work so that its purchasing power doesn't just survive, but thrives over the long term.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on inflation and its impact, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.bls.gov/data/inflation_calculator.htm" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. Bureau of Labor Statistics: CPI Inflation Calculator</a></li>
                  <li><a href="https://www.investopedia.com/inflation-calculator-5185330" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Inflation Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    