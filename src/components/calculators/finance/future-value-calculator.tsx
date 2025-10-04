
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
  pv: z.number().positive(),
  rate: z.number().positive(),
  periods: z.number().int().positive(),
  years: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FutureValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pv: undefined,
      rate: undefined,
      periods: undefined,
      years: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { pv, rate, periods, years } = values;
    const r = rate / 100;
    const fv = pv * Math.pow(1 + r / periods, periods * years);
    setResult(fv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="pv" render={({ field }) => (
                <FormItem><FormLabel>Present Value (PV) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="periods" render={({ field }) => (
                <FormItem><FormLabel>Compounding Periods per Year (n)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem><FormLabel>Number of Years (t)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate FV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Future Value</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the value of your investment after the specified period, including compound interest.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Future Value (FV) calculator determines the value of a current asset at a future date based on an assumed rate of growth. It's the core calculation for understanding how investments grow with compound interest.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>FV = PV * (1 + r/n)^(n*t)</p>
                <p>This formula calculates the future value by applying the periodic interest rate (r/n) to the present value (PV) for the total number of compounding periods (n*t).</p>
            </AccordionContent>
        </AccordionItem>
         <AccordionItem value="fv-guide">
          <AccordionTrigger>Your Financial Crystal Ball: A Guide to Future Value (FV)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
            <h3>Your Financial Crystal Ball: A Guide to Future Value (FV)</h3>
            <p>Have you ever looked at your savings account and wondered what it could become? What could that $5,000 you've saved, or the $200 you invest from every paycheck, grow into in 10, 20, or even 30 years?</p>
            <p>It’s not just a daydream; there is a fundamental financial concept designed to give you a clear, calculated answer. It’s called Future Value (FV).</p>
            <p>If you’ve heard of Present Value (PV)—the concept that tells you what future money is worth today—then Future Value is its optimistic twin. It’s the other side of the Time Value of Money coin, telling you what the money you have today will be worth in the future. Understanding FV is like having a financial crystal ball; it empowers you to set meaningful goals, create a realistic plan, and see the incredible potential of your savings.</p>
            <h4>What is Future Value? Seeing Your Money's Potential</h4>
            <p>In the simplest terms, Future Value is the value of a current asset at a specified date in the future, based on an assumed rate of growth.</p>
            <p>It answers the question, "If I invest this amount of money today, how much will I have at a specific point in the future?"</p>
            <p>The engine that drives Future Value is the single most powerful force in finance: compound interest. As we’ve discussed before, this is the process where your money earns a return, and then your returns start earning their own returns. It's the "interest on interest" that creates a snowball effect, turning a small sum into a much larger one over time. Future Value is the tool we use to measure the size of that snowball at any point on its journey.</p>
            <h4>The Future Value Formula: The Engine of Growth</h4>
            <p>Calculating the future value of a single, lump-sum investment is surprisingly simple. The formula looks like this:</p>
            <p className='font-mono p-2 bg-muted rounded-md text-center'>FV = PV * (1 + r)^n</p>
            <p>Let's quickly break down the components:</p>
            <ul className="list-disc list-inside">
              <li><strong>FV = Future Value:</strong> The amount of money you will have in the future (this is what we're solving for).</li>
              <li><strong>PV = Present Value:</strong> The amount of money you have today, your initial investment.</li>
              <li><strong>r = Interest Rate or Rate of Return:</strong> The annual growth rate you expect your investment to earn, expressed as a decimal (so, 8% = 0.08).</li>
              <li><strong>n = Number of Periods:</strong> The number of years you plan to let the money grow.</li>
            </ul>
            <h4>A Simple, Worked Example</h4>
            <p>Let's say you receive a $10,000 inheritance (PV) today. Instead of spending it, you decide to invest it in a Roth IRA for your retirement. You expect to earn an average annual return of 8% (r), and you won't touch the money for 25 years (n).</p>
            <p>Let's plug it into the formula:</p>
            <p className='font-mono p-2 bg-muted rounded-md'>FV = $10,000 × (1 + 0.08)^25<br/>FV = $10,000 × (1.08)^25<br/>FV = $10,000 × 6.848<br/>FV = $68,484.75</p>
            <p>The result: Thanks to the power of compounding, your initial $10,000 investment could grow to over $68,000 in 25 years, without you ever adding another dime. That is the magic of Future Value in action.</p>
            <h4>The Power of Regular Contributions: Future Value of an Annuity</h4>
            <p>The example above is great, but most of us don't build wealth with a single lump sum. We do it through consistent, regular contributions from our paychecks. In finance, a series of equal, regular payments is called an annuity.</p>
            <p>Calculating the future value of these regular contributions shows the truly staggering potential of a consistent savings habit. The formula is more complex, but the concept is what matters, and online calculators can do the math for you in seconds.</p>
            <h4>A Compelling, Real-World Example</h4>
            <p>Meet David, who is 30 years old and just started getting serious about retirement. He decides to contribute $500 every month to his company's 401(k). Let's assume he does this consistently until he retires at age 65 (a 35-year period) and his investments earn an average annual return of 8%.</p>
            <p>Total Contributions: $500/month x 12 months/year x 35 years = $210,000</p>
            <p>Future Value of his 401(k) at age 65: Approximately $1.1 million</p>
            <p>Read that again. By consistently saving, David contributed $210,000 of his own money, but thanks to decades of compound growth, it became a million-dollar nest egg. This is why financial advisors preach the importance of starting early and being consistent.</p>
            <h4>Why Future Value is Your Financial GPS</h4>
            <p>Future Value isn't just a fun calculation; it's a practical tool for mapping out your entire financial life.</p>
            <h5>1. Retirement Planning:</h5>
            <p>This is the number one use for FV. It allows you to project your 401(k) or IRA balance at your target retirement age. By inputting your current balance, your monthly contributions, and an expected rate of return, you can get a clear answer to the most important question: "Am I on track to meet my retirement goals?"</p>
            <h5>2. Saving for a Specific Goal:</h5>
            <p>Let's say you want to save for a $60,000 down payment on a house in 5 years. You currently have $30,000 saved. You can use FV to see if your current savings, invested at a certain rate, will grow to $60,000 in time. If the FV is less than $60,000, you know you need to increase your monthly savings contributions to hit your goal.</p>
            <h5>3. Illustrating the High Cost of Waiting:</h5>
            <p>FV is the perfect tool to convince yourself (or a friend!) to start investing now.</p>
            <p>Sarah starts at age 25, investing $300/month. By age 65, with an 8% return, her FV is ~$1 million.</p>
            <p>Mark starts at age 35, investing the same $300/month. By age 65, his FV is only ~$440,000.</p>
            <p>That ten-year delay cost Mark over half a million dollars in future wealth.</p>
            <h4>The Variables You Can Control</h4>
            <p>The best part about the Future Value formula is that you have influence over its key components.</p>
            <p><strong>Present Value (PV) / Contributions:</strong> The more money you start with and the more you contribute along the way, the larger your final result will be.</p>
            <p><strong>Time (n):</strong> This is your most powerful ally. The earlier you start your financial journey, the more years you give compounding to work its incredible magic.</p>
            <p><strong>Rate of Return (r):</strong> While you can't control the markets, your investment choices play a huge role. Choosing to invest in a diversified portfolio of stocks for a long-term goal will likely lead to a higher rate of return—and a much higher FV—than letting your money sit in a low-yield savings account.</p>
            <h4>Conclusion: Plan Your Tomorrow, Today</h4>
            <p>Future Value is a forward-looking concept that bridges the gap between where you are today and where you want to be. It transforms abstract goals like "a comfortable retirement" into concrete, motivational numbers.</p>
            <p>It's a powerful reminder that the small, disciplined choices you make today—the decision to invest that bonus, to automate your 401(k) contribution, to start a Roth IRA—can have an enormous impact on your future financial well-being.</p>
            <p>Don't just wonder what your money could become. Use the concept of Future Value to calculate it. Give your goals a number, create a plan, and start investing today. You are the architect of your financial future.</p>
            <p className="text-xs">Disclaimer: This article is for informational and educational purposes only and is not financial advice. The rates of return used in examples are hypothetical and not guaranteed. All investments involve risk.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Compound Interest Basics</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
