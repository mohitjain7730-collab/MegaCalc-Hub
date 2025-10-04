
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const formSchema = z.object({
  payment: z.number().positive(),
  rate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PerpetuityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment: undefined,
      rate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { payment, rate } = values;
    const r = rate / 100;
    const pv = payment / r;
    setResult(pv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="payment" render={({ field }) => (
                <FormItem><FormLabel>Annual Payment (C) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Required Rate of Return (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate PV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Present Value of Perpetuity</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the total value today of an infinite stream of equal payments.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>A perpetuity is a type of annuity that provides an infinite stream of equal payments. It's a theoretical concept but is used in finance to value assets with indefinite cash flows, like some preferred stocks.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>PV = C / r</p>
                <p>The formula is simple: the Present Value (PV) is the annual cash payment (C) divided by the discount rate (r).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="perpetuity-guide">
          <AccordionTrigger>Finance's Answer to "Forever": A Simple Guide to Perpetuities</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
            <h3>Finance's Answer to "Forever": A Simple Guide to Perpetuities</h3>
            <p>In our everyday lives, "forever" is an abstract concept, a word reserved for poetry and promises. But in the world of finance and investing, "forever" has a surprisingly concrete and practical application. It’s called a perpetuity.</p>
            <p>While it might sound like a complex term from a dusty textbook, a perpetuity is a powerful idea that helps us value some of the world's most enduring institutions, from Ivy League universities to major corporations. It’s a key building block in understanding the time value of money and how financial professionals assign a price to assets that are expected to generate income indefinitely.</p>
            <p>This guide will demystify the concept of the perpetuity. We’ll explain the simple logic behind it, walk through its surprisingly easy formula, and explore where this idea of infinite payments shows up in the real world.</p>
            <h4>The Core Idea: An Annuity That Never Ends</h4>
            <p>To understand a perpetuity, it helps to first remember its finite cousin, the annuity. An annuity is a series of equal, regular payments that occur over a defined period. A 30-year mortgage payment is an annuity. A lottery prize of $50,000 a year for 20 years is an annuity. They have a clear start and a clear end date.</p>
            <p>A perpetuity is simply an annuity that never ends. It is a stream of equal cash payments that is expected to continue forever.</p>
            <p>Think of it this way:</p>
            <ul className="list-disc list-inside">
                <li>An annuity is like a water tank filled with a specific amount of water. If you take out a gallon every day, you know that eventually, the tank will run dry.</li>
                <li>A perpetuity is like a magical spring. You can take out a gallon every day, but because the spring is fed by an endless source, it never runs out.</li>
            </ul>
            <h4>The Surprisingly Simple Math: The Perpetuity Formula</h4>
            <p>How on earth do you calculate the value of an infinite number of future payments? It sounds like the answer should be "infinity," but thanks to the time value of money, the math is shockingly simple.</p>
            <p>The formula for the present value of a perpetuity is:</p>
            <p className='font-mono p-2 bg-muted rounded-md text-center'>PV = C / r</p>
            <p>Let's break that down:</p>
            <ul className="list-disc list-inside">
                <li><strong>PV = Present Value:</strong> The total value of all the infinite future payments, expressed in today's dollars.</li>
                <li><strong>C = Cash Payment:</strong> The amount of the fixed payment received each period (e.g., each year).</li>
                <li><strong>r = Discount Rate:</strong> The annual interest rate or rate of return.</li>
            </ul>
            <p>Why does this simple formula work? The magic is in the discounting. As we know, money in the future is worth less than money today. A payment you receive in 50 years is worth much less than a payment you receive next year. A payment you receive in 200 years is worth almost nothing in today's dollars. The formula recognizes that the present value of the very distant payments effectively rounds down to zero. It neatly captures the value of all the "meaningful" near-term payments into a single, finite number.</p>
            <h4>A Real-World Example: A University Scholarship</h4>
            <p>Imagine a philanthropist donates a large sum of money to a university to establish a permanent scholarship. The goal is to pay out $50,000 every year to a deserving student, forever. The university's endowment fund, where the money is invested, is expected to earn a reliable 8% annual return (r).</p>
            <p>How much money does the philanthropist need to donate to fund this perpetual scholarship? We use the perpetuity formula to find the Present Value.</p>
            <p>C = $50,000</p>
            <p>r = 8% or 0.08</p>
            <p className='font-mono p-2 bg-muted rounded-md'>PV = $50,000 / 0.08 = $625,000</p>
            <p>The answer: $625,000. This means that a one-time donation of $625,000, if it earns 8% a year, will generate $50,000 in returns annually ($625,000 * 0.08 = $50,000) without ever having to touch the original principal. The principal can continue generating that payment forever.</p>
            <h4>A Twist on the Formula: The Growing Perpetuity</h4>
            <p>In the real world, payments don't always stay the same. Sometimes, they are expected to grow at a steady rate. For this, we use the growing perpetuity formula.</p>
            <p className='font-mono p-2 bg-muted rounded-md text-center'>PV = C / (r - g)</p>
            <p>The only new variable here is:</p>
            <ul className="list-disc list-inside">
                <li><strong>g = Growth Rate:</strong> The constant rate at which the cash payment (C) is expected to grow each year.</li>
            </ul>
            <p>This formula is a cornerstone of stock valuation. For example, if a stable blue-chip company is expected to pay a $2.00 dividend per share (C) next year, and that dividend is expected to grow by a steady 3% (g) forever, an investor who requires a 10% return (r) could value the stock as:</p>
            <p className='font-mono p-2 bg-muted rounded-md'>PV = $2.00 / (0.10 - 0.03) = $2.00 / 0.07 = $28.57 per share</p>
            <p>(Note: This formula only works if the discount rate r is greater than the growth rate g.)</p>
            <h4>Where Do Perpetuities Exist in the Real World?</h4>
            <p>While a truly infinite payment stream is rare, the perpetuity concept is used to value many real-world assets that are expected to last for a very long time.</p>
            <ul className="list-disc list-inside">
                <li><strong>University Endowments and Foundations:</strong> This is the textbook example. Major university endowments (like those at Harvard or Yale) and large charitable foundations are managed as perpetuities. They are designed to spend only a portion of their investment earnings each year to fund their missions, leaving the principal intact to grow and generate payments forever.</li>
                <li><strong>Government Bonds (Consols):</strong> The purest historical example comes from Great Britain, which once issued bonds called "consols" that paid interest but never had a maturity date—they paid interest in perpetuity. While no longer issued, they are a classic example.</li>
                <li><strong>Preferred Stock:</strong> This is a type of stock that often pays a fixed, regular dividend to shareholders for as long as the company is in business. Because there is no maturity date, the formula for valuing a share of preferred stock is the basic perpetuity formula (PV = Dividend / Required Rate of Return).</li>
                <li><strong>Corporate Valuation:</strong> As shown in the growing perpetuity example, the formula is the foundation of the Gordon Growth Model, a popular method used by analysts to estimate the intrinsic value of a mature company's stock based on the present value of its future dividends.</li>
            </ul>
            <h4>Perpetuity vs. Annuity: A Clear Comparison</h4>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Annuity</TableHead>
                        <TableHead>Perpetuity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Duration of Payments</TableCell>
                        <TableCell>Finite (e.g., 20 years, 30 years)</TableCell>
                        <TableCell>Infinite (forever)</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Principal</TableCell>
                        <TableCell>The principal is gradually paid back over the term</TableCell>
                        <TableCell>The principal is preserved and never touched</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Valuation</TableCell>
                        <TableCell>Requires more complex present/future value formulas</TableCell>
                        <TableCell>A simple formula (PV = C/r)</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Real-World Example</TableCell>
                        <TableCell>Mortgage Payments, Car Loans, Lottery Payouts</TableCell>
                        <TableCell>University Endowments, Preferred Stock</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <h4>Conclusion: A Window into "Forever"</h4>
            <p>The perpetuity is a fascinating blend of the theoretical and the practical. It takes the abstract concept of infinity and, through the logic of the time value of money, makes it a tangible and useful tool for valuation.</p>
            <p>While you may never own a true perpetuity, understanding the concept gives you a deeper insight into the workings of finance. It clarifies how value is assigned to long-term, income-producing assets and provides one of the clearest demonstrations of a core financial truth: the further away a promise of money is, the less it is worth today. By grasping this simple idea, you're one step closer to thinking like a seasoned financial professional.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_valuingsecurities" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Valuing Securities: Perpetuities</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
