
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  value: z.number().positive(),
  rate: z.number().positive(),
  periods: z.number().int().positive(),
  valueType: z.enum(['pv', 'fv']),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnnuityPaymentCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      rate: undefined,
      periods: undefined,
      valueType: 'pv',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { value, rate, periods, valueType } = values;
    const r = rate / 100;
    let pmt;

    if (valueType === 'pv') {
      // PMT = PV * [r / (1 - (1 + r)^-n)]
      pmt = value * (r / (1 - Math.pow(1 + r, -periods)));
    } else {
      // PMT = FV * [r / ((1 + r)^n - 1)]
      pmt = value * (r / (Math.pow(1 + r, periods) - 1));
    }
    
    setResult(pmt);
  };
  
  const valueType = form.watch('valueType');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="valueType" render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Calculate Payment based on:</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="pv" /></FormControl><FormLabel className="font-normal">Loan Amount (Present Value)</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="fv" /></FormControl><FormLabel className="font-normal">Savings Goal (Future Value)</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem><FormLabel>{valueType === 'pv' ? 'Present Value (PV)' : 'Future Value (FV)'} in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Interest Rate per Period (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="periods" render={({ field }) => (
                <FormItem><FormLabel>Number of Periods (n)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Payment</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Periodic Payment (PMT)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the regular payment required each period.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>An annuity is a series of equal payments made at regular intervals. This calculator finds the payment amount (PMT) for an ordinary annuity, where payments are made at the end of each period.</p>
                <p>If you're solving for a loan (based on its Present Value), it calculates the payment needed to amortize the loan over the periods. If you're solving for a savings goal (based on its Future Value), it calculates the payment you must invest each period to reach that goal.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="annuity-guide">
            <AccordionTrigger>The Search for a Paycheck for Life: A Guide to Annuity Payments</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>The Search for a Paycheck for Life: A Guide to Annuity Payments</h3>
                <p>For decades, the classic American retirement was built on a “three-legged stool”: Social Security, a company pension, and personal savings. But for most workers today, one of those legs—the company pension that provided a guaranteed paycheck for life—has vanished.</p>
                <p>This has left millions of retirees facing a daunting question: "How do I turn my nest egg into a reliable stream of income that I won't outlive?"</p>
                <p>Enter the annuity, a financial product sold by insurance companies that aims to solve this very problem. You’ve likely heard them advertised as a way to create your own "personal pension." But annuities are also one of the most complex and debated products in personal finance.</p>
                <p>This guide will cut through the jargon and the sales pitches. We will provide a clear, unbiased look at what an annuity payment is, how it works, the different types available, and the critical pros and cons you must understand before making a decision.</p>
                <h4>What Is an Annuity? From a Lump Sum to a Lasting Income</h4>
                <p>At its core, an annuity is a contract between you and an insurance company. The basic agreement is simple:</p>
                <ul className="list-disc list-inside">
                    <li>You pay the insurance company a sum of money, either in a single lump sum or through a series of payments over time.</li>
                    <li>In return, the insurance company promises to make regular payments back to you, either immediately or at a specified date in the future.</li>
                </ul>
                <p>The process is typically split into two distinct phases:</p>
                <ul className="list-disc list-inside">
                    <li><strong>The Accumulation Phase:</strong> This is the period when you are funding the annuity. Your money is invested and grows on a tax-deferred basis, meaning you don't pay taxes on the investment gains each year.</li>
                    <li><strong>The Payout (or Annuitization) Phase:</strong> This is when you "turn on the income stream." You begin receiving regular, scheduled payments from the insurance company. These are the annuity payments that form the core of the product's promise.</li>
                </ul>
                <h4>The Core Types of Annuities: Understanding Your Options</h4>
                <p>This is where things can get complicated, as annuities come in several different flavors, each with its own risk and reward profile.</p>
                <h5>1. Fixed Annuities (The Most Straightforward)</h5>
                <p>Think of a fixed annuity like a Certificate of Deposit (CD) from an insurance company. You give them a lump sum, and they guarantee you a fixed, predictable interest rate for a set number of years. Your growth is safe and guaranteed, and your future payments will be a known, fixed amount.</p>
                <p><strong>Best for:</strong> Risk-averse individuals who prioritize safety and predictability over high growth.</p>
                <h5>2. Variable Annuities (Higher Growth Potential, Higher Risk & Fees)</h5>
                <p>With a variable annuity, your money is invested in a portfolio of "sub-accounts," which are essentially mutual funds. The value of your annuity—and the size of your future payments—will rise and fall with the performance of these underlying investments.</p>
                <p><strong>Best for:</strong> Individuals with a higher risk tolerance who want the potential for stock market-like growth within a tax-deferred wrapper.</p>
                <p><strong>Warning:</strong> Variable annuities are notorious for their high fees. You'll often pay for mortality and expense charges, administrative fees, and the fees for the underlying funds, which can significantly eat into your returns.</p>
                <h5>3. Fixed Indexed Annuities (The Complex Hybrid)</h5>
                <p>These annuities try to offer the best of both worlds. Your returns are linked to the performance of a market index, like the S&P 500. The insurance company offers you some of the upside of the market but also provides a "floor" to protect you from losses if the market goes down.</p>
                <p><strong>The Catch:</strong> This protection comes with significant limitations. Your upside is almost always "capped" (e.g., if the market gains 15%, you might only be credited with a 7% gain), and the formulas used can be incredibly complex.</p>
                <h4>Receiving Your Money: Annuity Payout Options</h4>
                <p>When you decide to start receiving payments, you’ll have to make a crucial, often irreversible, decision on how those payments will be structured.</p>
                <ul className="list-disc list-inside">
                    <li><strong>Life Only (Single Life):</strong> You receive a guaranteed payment every month for the rest of your life. This option provides the highest possible monthly payment, but it's a high-stakes bet. The payments stop the moment you die, and your heirs receive nothing, even if you only received one payment.</li>
                    <li><strong>Period Certain:</strong> You receive payments for a guaranteed period, such as 10, 15, or 20 years. If you die before that period is over, your named beneficiary will continue to receive the payments until the period ends.</li>
                    <li><strong>Life with Period Certain:</strong> This is a hybrid. You are guaranteed payments for life, but you also select a "certain period" (e.g., 10 years). If you die within that period, your beneficiary receives the remaining payments. The monthly payment is lower than a Life Only option.</li>
                    <li><strong>Joint and Survivor:</strong> This option provides payments for as long as either you or your spouse is alive. It's a common choice for married couples who want to ensure the surviving spouse continues to receive income. The monthly payment is lower than a single life option but provides invaluable protection for a partner.</li>
                </ul>
                <h4>The Big Debate: The Pros and Cons of Annuities</h4>
                <p>To make an informed decision, you must weigh the powerful benefits against the significant drawbacks.</p>
                <h5>The PROS of Annuities</h5>
                <ul className="list-disc list-inside">
                    <li><strong>Guaranteed Lifetime Income:</strong> This is the number one reason to buy an annuity. It is a powerful tool to create "longevity insurance," protecting you from the very real risk of outliving your savings.</li>
                    <li><strong>Tax-Deferred Growth:</strong> During the accumulation phase, your investments grow without you having to pay taxes on dividends or capital gains each year, allowing your money to compound more efficiently.</li>
                    <li><strong>Principal Protection (for Fixed types):</strong> Fixed and indexed annuities offer protection from market downturns, which can be appealing for conservative investors.</li>
                </ul>
                <h5>The CONS of Annuities</h5>
                <ul className="list-disc list-inside">
                    <li><strong>High Fees and Commissions:</strong> This is the biggest criticism, especially for variable and indexed annuities. Layers of fees can seriously erode your investment returns over time, and high, often hidden, commissions can incentivize salespeople to sell you a product that isn't in your best interest.</li>
                    <li><strong>Complexity:</strong> The contracts can be hundreds of pages long and filled with confusing jargon, caps, spreads, and participation rates that make it difficult to understand exactly how your money will grow.</li>
                    <li><strong>Illiquidity:</strong> Your money is not easily accessible. Most annuities have a "surrender period" that can last for many years (e.g., 7-10 years). If you need to withdraw your money early, you will face steep surrender charges.</li>
                    <li><strong>Inflation Risk:</strong> A fixed annuity payment of $2,000 a month may seem great today, but 20 years from now, inflation will have significantly reduced its purchasing power. Some annuities offer inflation-protection riders, but they come at a high cost, reducing your initial payments.</li>
                </ul>
                <h4>Conclusion: A Tool, Not a Panacea</h4>
                <p>Annuities are not inherently "good" or "bad"—they are a specific tool for a specific job. They excel at providing a guaranteed income stream that can cover your essential living expenses in retirement (housing, food, healthcare), giving you peace of mind.</p>
                <p>However, that guarantee comes at a significant price: high fees, complexity, and a lack of flexibility. For many people, a well-diversified portfolio of low-cost index funds in a 401(k) and IRA, combined with a sensible withdrawal strategy, is a more efficient and flexible way to fund retirement.</p>
                <p>An annuity is a major financial decision. It should never be "sold" to you in a high-pressure situation. It should be "bought" by you after careful research and consideration. Before you sign any contract, it is highly recommended that you consult with a fiduciary financial advisor who is obligated to act in your best interest. They can help you determine if the trade-offs of an annuity make sense for your unique financial situation.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.finra.org/investors/learn-to-invest/types-investments/annuities" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA – Annuities: Understanding Your Options</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
