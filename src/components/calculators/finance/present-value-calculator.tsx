
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

const formSchema = z.object({
  fv: z.number().positive(),
  rate: z.number().positive(),
  years: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PresentValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fv: undefined,
      rate: undefined,
      years: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { fv, rate, years } = values;
    const r = rate / 100;
    const pv = fv / Math.pow(1 + r, years);
    setResult(pv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="fv" render={({ field }) => (
                <FormItem><FormLabel>Future Value (FV) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Annual Discount Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Number of Years (t)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate PV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Present Value</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the value today of a future sum of money, discounted at the specified annual rate.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Present Value (PV) calculator determines the current worth of a future sum of money. The concept is based on the time value of money, which states that a dollar today is worth more than a dollar tomorrow because it can be invested and earn interest.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>PV = FV / (1 + r)^t</p>
                <p>The formula discounts the Future Value (FV) by the annual rate (r) over a number of years (t).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="pv-guide">
          <AccordionTrigger>The Financial "Time Machine": A Simple Guide to Present Value (PV)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
            <p>Let me ask you a simple question: If I offered you a choice between receiving $1,000 today or receiving the exact same $1,000 one year from now, which would you choose?</p>
            <p>You’d choose the money today, of course. It’s an instinctive, obvious choice. But have you ever stopped to think why? Why is money in your hand right now inherently more valuable than the promise of the same amount in the future?</p>
            <p>That simple, intuitive answer is the foundation for one of the most important concepts in all of finance: the Time Value of Money. The practical tool we use to apply this concept is called Present Value (PV).</p>
            <p>It might sound like complex Wall Street jargon, but understanding Present Value is like having a financial superpower. It allows you to peer into the future, understand the true worth of financial promises, and make smarter decisions with your money. This guide will break it all down in simple, practical terms.</p>
            <h4>The Golden Rule of Finance: Why a Dollar Today is Worth More Than a Dollar Tomorrow</h4>
            <p>Your gut instinct to take the money now is correct for three very logical reasons:</p>
            <ul className="list-disc list-inside">
              <li><strong>Opportunity Cost (The Power to Grow):</strong> A dollar you have today can be put to work. You can invest it in the stock market, put it in a high-yield savings account, or use it to start a business. That dollar has the potential to grow and become more than a dollar in a year. A dollar you receive a year from now has missed out on a full year of that growth potential.</li>
              <li><strong>Inflation (The Silent Shrinker):</strong> Due to inflation, the purchasing power of a dollar tends to decrease over time. The $1,000 you receive a year from now will likely buy you less gas, fewer groceries, and a smaller portion of a vacation than $1,000 can today.</li>
              <li><strong>Risk and Uncertainty (A Bird in the Hand...):</strong> A promise of future payment always carries some risk. What if the person promising the money can't pay? What if the company goes out of business? Money in your possession today is certain and risk-free.</li>
            </ul>
            <p>These three factors—opportunity, inflation, and risk—are why we must "discount" the value of future money.</p>
            <h4>Defining Present Value (PV)</h4>
            <p>Now that we know why future money is worth less, we can define Present Value.</p>
            <p><strong>Present Value (PV) is the current worth of a future sum of money, given a specified rate of return.</strong></p>
            <p>In other words, it answers the question: "How much money would I need to invest today, at a certain interest rate, to have a specific amount of money in the future?" It helps you strip away the effects of time and inflation to see what a future cash flow is truly worth in today's dollars.</p>
            <h4>The Present Value Formula: Under the Hood</h4>
            <p>The calculation for PV is surprisingly straightforward. Here is the most common formula:</p>
            <p className='font-mono p-2 bg-muted rounded-md text-center'>PV = FV / (1 + r)ⁿ</p>
            <p>Let's break down what each part means:</p>
            <ul className="list-disc list-inside">
              <li><strong>PV = Present Value:</strong> This is what we are trying to find.</li>
              <li><strong>FV = Future Value:</strong> The amount of money you expect to receive in the future (e.g., $10,000).</li>
              <li><strong>r = Discount Rate:</strong> This is the most important variable. It's the annual rate of return or interest rate you could earn on your money over the time period. It represents your opportunity cost.</li>
              <li><strong>n = Number of Periods:</strong> The number of years (or periods) until you receive the money.</li>
            </ul>
            <h4>A Simple, Worked Example</h4>
            <p>Let's make this tangible. Imagine your grandmother promises to give you $10,000 for a down payment on a house, but not for another 5 years.</p>
            <p>You know that if you had the money today, you could invest it in a low-cost S&P 500 index fund, which has a historical average return of around 9%. So, you decide to use 9% as your discount rate (r).</p>
            <p>Let's plug these numbers into the formula:</p>
            <p>FV = $10,000<br/>r = 9% or 0.09<br/>n = 5 years</p>
            <p className='font-mono p-2 bg-muted rounded-md text-center'>PV = $10,000 / (1 + 0.09)⁵ = $10,000 / (1.09)⁵ = $10,000 / 1.5386 = $6,499.42</p>
            <p>The result: The present value of your grandmother's promise is $6,499.42. This means that if you invested $6,499.42 today and it grew at 9% per year, you would have exactly $10,000 in 5 years. Therefore, the promise of $10,000 five years from now is worth the same as $6,499.42 in your hands today.</p>
            <h4>Why Present Value Matters: Real-World Applications</h4>
            <p>This isn't just an academic exercise. Present Value is used every day to make critical financial decisions.</p>
            <h5>1. Retirement Planning:</h5>
            <p>You've set a goal to have a $2 million nest egg when you retire in 30 years. Present value can help you understand if you're on track. By "discounting" that future $2 million back to today, you can see what its value is in today's dollars, helping you frame your savings goals in a more realistic context.</p>
            <h5>2. Lottery Winnings (The Classic Example):</h5>
            <p>Ever wonder why a "$50 million" lottery winner is offered a "lump sum" of "only" $28 million? That's Present Value in action! The $50 million prize is actually an annuity—a series of payments over many years (e.g., $2.5 million a year for 20 years). The $28 million lump sum is the present value of that entire stream of future payments, discounted back to today. It's the amount of money you'd need today to generate that same stream of payments if you invested it.</p>
            <h5>3. Business Decisions:</h5>
            <p>A small business owner is thinking about buying a new machine for $80,000. They estimate the machine will increase profits by $25,000 a year for the next 4 years. Is it a good investment? They would calculate the present value of those four future payments. If the sum of the PVs is greater than the $80,000 cost, the investment is profitable.</p>
            <h5>4. Legal Settlements:</h5>
            <p>Similar to lottery winnings, if you are offered a legal settlement of $500,000 paid out over 10 years, the present value of that settlement is significantly less than $500,000. Understanding this is crucial for making an informed decision.</p>
            <h4>The Discount Rate: The Heart of the Calculation</h4>
            <p>As you can see, the entire PV calculation hinges on the discount rate (r). This number is both an art and a science. It represents your required rate of return or your opportunity cost. What return could you get on your money if you invested it elsewhere with a similar level of risk?</p>
            <p>If you're evaluating a low-risk promise, you might use the interest rate on a U.S. Treasury bond as your discount rate.</p>
            <p>If you're evaluating a stock market investment, you might use the historical average return of the S&P 500 (around 9-10%).</p>
            <p>A higher, more uncertain discount rate will result in a lower present value, while a lower, safer rate will result in a higher present value.</p>
            <h4>Conclusion: Thinking in Today's Dollars</h4>
            <p>You don't need to carry a financial calculator everywhere you go. The most important takeaway from Present Value is the mindset it teaches: money has a time component.</p>
            <p>By understanding that future dollars are worth less than today's dollars, you can look past headline numbers and make more rational, informed decisions. You can better evaluate investment opportunities, understand the true cost and benefits of financial choices, and plan more effectively for a future that starts with smart decisions today.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/node/10521" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. Securities and Exchange Commission – Understanding Discounted Cash Flow</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
