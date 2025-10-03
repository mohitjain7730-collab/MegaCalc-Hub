
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  balance: z.number().positive(),
  apr: z.number().positive(),
  monthlyPayment: z.number().positive(),
}).refine(data => {
    if (!data.balance || !data.apr) return true;
    const monthlyInterest = (data.apr / 100 / 12) * data.balance;
    return data.monthlyPayment > monthlyInterest;
}, {
    message: "Monthly payment must be greater than the interest to pay off the balance.",
    path: ["monthlyPayment"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  monthsToPayOff: number;
  totalInterest: number;
  totalPaid: number;
}

export default function CreditCardPayoffCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: undefined,
      apr: undefined,
      monthlyPayment: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { balance, apr, monthlyPayment } = values;
    const B = balance;
    const r = apr / 100 / 12; // monthly interest rate
    const M = monthlyPayment;

    // Formula: n = -log(1 - (r * B) / M) / log(1 + r)
    const n = -Math.log(1 - (r * B) / M) / Math.log(1 + r);
    const months = Math.ceil(n);
    const totalPaid = M * months;
    const totalInterest = totalPaid - B;
    
    setResult({ monthsToPayOff: months, totalInterest, totalPaid });
  };

  const formatMonths = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      let result = '';
      if (years > 0) {
          result += `${years} year${years > 1 ? 's' : ''}`;
      }
      if (remainingMonths > 0) {
          result += `${years > 0 ? ' and ' : ''}${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return result || '0 months';
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="balance" render={({ field }) => (
                <FormItem><FormLabel>Credit Card Balance</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="apr" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (APR) (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="monthlyPayment" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Payoff</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><CreditCard className="h-8 w-8 text-primary" /><CardTitle>Debt Payoff Plan</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Time to Pay Off</CardDescription>
                        <p className="text-3xl font-bold">{formatMonths(result.monthsToPayOff)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Interest Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Amount Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Credit Card Balance</h4>
                  <p>The total amount of debt you currently have on the credit card.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate (APR) (%)</h4>
                  <p>The yearly interest rate charged on your balance. This can usually be found on your credit card statement.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Monthly Payment</h4>
                  <p>The fixed amount you plan to pay towards your balance each month. To pay off the debt, this must be higher than the monthly interest charged.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator determines how many months it will take to pay off a credit card balance using a logarithmic formula derived from the standard loan amortization equation. It solves for the number of payment periods (`n`).</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>It calculates the number of months required to bring the balance to zero based on your fixed monthly payment and APR.</li>
                    <li>The result is rounded up to the next whole month.</li>
                    <li>The total amount paid is your monthly payment multiplied by the number of months.</li>
                    <li>The total interest is the total amount paid minus the original balance.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-to-escape">
          <AccordionTrigger>How to Escape the Credit Card Trap</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
            <h3>From Overwhelmed to In Control: Your Step-by-Step Guide to Paying Off Credit Card Debt</h3>
            <p>It’s a familiar, sinking feeling. The credit card statement arrives, and you brace yourself as you open it. The number is higher than you hoped, and the "Minimum Payment Due" feels like a tiny bandage on a gaping wound. You make the payment, but next month, the balance seems to have barely budged.</p>
            <p>If this sounds familiar, you are not alone. Millions of Americans are navigating the challenges of credit card debt. These cards are marketed as tools of convenience, rewards, and opportunity, and they can be. But they are also a meticulously designed trap, built on high interest rates and behavioral psychology that can keep you paying for years.</p>
            <p>The good news? You can escape the trap. Getting out of credit card debt isn't about magic or winning the lottery; it's about understanding the enemy, creating a smart battle plan, and executing it with discipline. This guide will give you that plan.</p>
            <h4>The Credit Card Trap: Why It’s So Hard to Get Ahead</h4>
            <p>To defeat the beast, you have to understand how it works. Credit card debt feels so sticky because the system is engineered to work against you in three powerful ways.</p>
            <ol className="list-decimal pl-5 space-y-2">
                <li><strong>The Sky-High APR (Annual Percentage Rate)</strong><br/>Your card’s APR is the annual interest rate charged on any balance you carry over from one month to the next. While a mortgage rate might be 7% and an auto loan 8%, credit card APRs in the U.S. routinely sit between 19% and 29%. This punishingly high rate means a huge portion of your payment is eaten up by interest charges alone.</li>
                <li><strong>The Minimum Payment Illusion</strong><br/>Your credit card company is required to offer you a minimum payment option. This seems helpful, but it's a financial illusion. The minimum payment is mathematically calculated to keep you in debt for the longest possible time, maximizing the interest the company earns from you.</li>
                <li><strong>The Dark Side of Compounding</strong><br/>Compound interest is a beautiful thing when you're investing, but it is devastating when you're in debt. With credit cards, interest is typically compounded daily. This means that each day, interest is calculated on your balance, and the next day, interest is calculated on the new, slightly larger balance. It's a snowball of debt rolling downhill, gaining size and speed every single day.</li>
            </ol>
             <h4>Your Battle Plan: Choosing a Debt Payoff Strategy</h4>
            <p>Now that you understand the enemy, it’s time to fight back. There are two primary, proven strategies for tackling credit card debt. The best one is the one you will actually stick with.</p>
            <h5>The Debt Snowball Method (Best for Motivation)</h5>
            <ol className="list-decimal pl-5 space-y-2">
                <li><strong>List Your Debts:</strong> Write down all your credit card balances from the smallest to the largest, ignoring the interest rates.</li>
                <li><strong>Focus Fire:</strong> Pay the minimum on all cards except the one with the smallest balance. Throw every extra dollar you can find at that smallest debt.</li>
                <li><strong>Roll It Over:</strong> Once the smallest debt is paid off, celebrate! Then, take the full amount you were paying on it and "roll" it into the payment for the next-smallest debt.</li>
                <li><strong>Repeat:</strong> Continue this process, gaining momentum as your "snowball" of payments grows larger and larger until all your cards are paid off.</li>
            </ol>
            <p>This method gives you quick, motivating victories that keep you in the fight.</p>
            <h5>The Debt Avalanche Method (Best for Math)</h5>
             <ol className="list-decimal pl-5 space-y-2">
                <li><strong>List Your Debts:</strong> Write down all your credit cards in order of their APR, from the highest to the lowest.</li>
                <li><strong>Focus Fire:</strong> Pay the minimum on all cards except the one with the highest APR. Attack that card with every extra dollar.</li>
                <li><strong>Work Your Way Down:</strong> Once the highest-APR card is paid off, take that entire payment and apply it to the card with the next-highest APR.</li>
                <li><strong>Repeat:</strong> Continue until you are debt-free.</li>
            </ol>
            <p>This method will save you the most money in interest over time, but it may take longer to get your first "win" if your highest-APR card also has a large balance.</p>
            <h4>Supercharging Your Payoff: Financial Tools and Tactics</h4>
            <p>Once you've chosen your strategy, you can use these tools to accelerate your progress.</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Balance Transfer Cards:</strong> If you have a good credit score, you may qualify for a balance transfer credit card. These cards offer a 0% introductory APR for a period, typically 12 to 21 months. You transfer your high-interest balances onto this new card and attack the principal aggressively without it accruing interest. Warning: These cards often have a one-time balance transfer fee (usually 3-5%), and if you don't pay off the balance before the promotional period ends, the remaining balance will be subject to a high interest rate.</li>
                <li><strong>Debt Consolidation Loans:</strong> This involves taking out a personal loan from a bank or credit union at a lower, fixed interest rate to pay off all your credit card balances at once. This simplifies your life with one predictable monthly payment. This can be a great option, but it requires discipline—you must stop using the now-empty credit cards.</li>
            </ul>
            <h4>Staying Out of Debt for Good: How to Use Credit Cards Responsibly</h4>
             <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Pay Your Balance in Full, Every Single Month.</strong><br/>This is the golden rule. When you pay your statement balance in full by the due date, you operate within the card's grace period, and you are charged zero interest. This turns your credit card into a simple payment tool, like a debit card, but with better rewards and fraud protection.</li>
                <li><strong>Automate Your Payments.</strong><br/>Set up automatic payments from your checking account. At a minimum, automate the minimum payment so you are never late. Ideally, automate the payment for the full statement balance. This enforces discipline.</li>
                <li><strong>Keep Your Credit Utilization Low.</strong><br/>Your credit utilization ratio is your total credit card balance divided by your total credit limit. This ratio is a major factor in your FICO credit score. For a healthy score, you should aim to keep your utilization below 30%, and ideally below 10%. This means if you have a $10,000 credit limit, you should try to keep your reported balance under $3,000.</li>
            </ol>
            <h4>Conclusion: You Can Do This</h4>
            <p>Climbing out of credit card debt can feel like an impossible task, but it is achievable. It starts with the decision to stop the cycle and commit to a plan.</p>
            <p>The steps are simple, but they require focus:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Stop adding to the debt. Put the cards away and switch to a cash or debit system while you're in payoff mode.</li>
                <li>Create a budget so you know where your money is going and can find extra cash to put toward your debt.</li>
                <li>Choose your strategy—snowball or avalanche—and attack the debt with intensity.</li>
                <li>Once you're free, follow the rules of responsible credit card use to build wealth, not debt.</li>
            </ul>
            <p>You have the knowledge and the tools. Your journey to financial control starts now.</p>
            <p className="text-xs">Disclaimer: This article is for informational purposes only and not intended as financial advice. Please consult with a qualified financial professional to discuss your individual situation.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more information on managing credit card debt, consult these reliable sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.experian.com/blogs/ask-experian/credit-education/paying-down-credit-card-debt/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Experian: Credit Card Payoff Strategies</a></li>
                  <li><a href="https://www.consumerfinance.gov/consumer-tools/credit-cards/credit-card-payoff-calculator/" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFPB: Credit Card Payoff Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
