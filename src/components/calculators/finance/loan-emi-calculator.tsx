
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandCoins } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  annualInterestRate: z.number().positive(),
  loanTenureYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  chartData: { year: number; remainingBalance: number; totalInterestPaid: number }[];
}

export default function LoanEmiCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: undefined,
      loanTenureYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { loanAmount, annualInterestRate, loanTenureYears } = values;
    const P = loanAmount;
    const r = annualInterestRate / 12 / 100;
    const n = loanTenureYears * 12;

    if (r === 0) {
        const emi = P / n;
        const totalPayment = P;
        const totalInterest = 0;
        const chartData = Array.from({ length: loanTenureYears }, (_, i) => {
            const year = i + 1;
            const balance = P - emi * year * 12;
            return {
                year,
                remainingBalance: Math.max(0, balance),
                totalInterestPaid: 0,
            };
        });
        setResult({ emi, totalPayment, totalInterest, chartData });
        return;
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const chartData = [];
    let remainingBalance = P;
    let cumulativeInterest = 0;

    for (let year = 1; year <= loanTenureYears; year++) {
      let yearlyInterest = 0;
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * r;
        const principalPayment = emi - interestPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }
      cumulativeInterest += yearlyInterest;
      chartData.push({
        year: year,
        remainingBalance: Math.max(0, remainingBalance), // Ensure balance doesn't go negative
        totalInterestPaid: Math.round(cumulativeInterest),
      });
    }
    
    setResult({ emi, totalPayment, totalInterest, chartData });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="loanAmount" render={({ field }) => (
                <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualInterestRate" render={({ field }) => (
                <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="loanTenureYears" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Loan Tenure (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate EMI</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HandCoins className="h-8 w-8 text-primary" /><CardTitle>Loan Repayment Details</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Monthly EMI</CardDescription>
                        <p className="text-3xl font-bold">${result.emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <CardDescription>Total Payment</CardDescription>
                            <p className="text-xl font-semibold">${result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <CardDescription>Total Interest Paid</CardDescription>
                            <p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
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
                      <Line type="monotone" dataKey="totalInterestPaid" name="Total Interest Paid" stroke="hsl(var(--muted-foreground))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="remainingBalance" name="Remaining Balance" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-emi">
          <AccordionTrigger>What is an EMI?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding Your Loan</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Loan Amount (Principal)</h4>
                  <p>The initial amount of money you borrow from the lender.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate</h4>
                  <p>The percentage of the principal charged by the lender for the use of its money, on a yearly basis.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Loan Tenure (Years)</h4>
                  <p>The total time period over which you will repay the loan. A longer tenure means lower EMIs but higher total interest paid, while a shorter tenure means higher EMIs but lower total interest.</p>
              </div>
              <p className="mt-2 font-semibold">In the initial years of your loan, a larger portion of your EMI goes towards paying off the interest. As the loan matures, a larger portion goes towards paying off the principal.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for an Equated Monthly Installment (EMI) to determine your fixed monthly payment. The formula accounts for the loan principal, the monthly interest rate (annual rate divided by 12), and the total number of payments (tenure in years multiplied by 12).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="loan-payment-guide">
            <AccordionTrigger>Mastering Your Debt: The Ultimate Guide</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>How to Master Your Loan Payments</h3>
              <p>Taking out a loan is a rite of passage in America. It’s the key that unlocks major life goals, from buying your first home and purchasing a reliable car to funding a college education. But with every loan comes the single most important number you need to understand: the monthly payment.</p>
              <p>For many, this number feels like a mystery handed down by the bank. What does it actually consist of? How is it calculated? And most importantly, how does it fit into my budget?</p>
              <p>If you've ever felt uncertain about your loan payments, this guide is for you. We will demystify the entire process, breaking down the components of your payment, explaining the math behind it, and showing you how a simple Loan Payment Calculator is the most powerful tool you have for taking control of your financial life.</p>
              <h4>What is a Monthly Loan Payment? The Core Components</h4>
              <p>A monthly loan payment is the fixed amount you pay back to a lender every month until your loan is fully repaid. While the payment amount stays the same, what happens inside that payment changes over time.</p>
              <p>Every payment is primarily made up of two parts, often abbreviated as P+I:</p>
              <ol>
                <li><strong>Principal:</strong> This is the money you originally borrowed. Every dollar of principal you pay reduces your loan balance.</li>
                <li><strong>Interest:</strong> This is the cost of borrowing the money—it’s the fee you pay to the lender.</li>
              </ol>
              <p>In the beginning of your loan, a larger portion of your payment goes toward interest. As time goes on and your balance shrinks, more and more of each payment gets applied to the principal.</p>
              <p>For mortgages, your payment might also include two more components, known as PITI:</p>
              <ul>
                  <li><strong>Taxes:</strong> Property taxes, which the lender often collects and pays on your behalf.</li>
                  <li><strong>Insurance:</strong> Homeowners insurance and potentially Private Mortgage Insurance (PMI).</li>
              </ul>
              <p>Our focus here is on the core P+I, which applies to all types of loans.</p>

              <h4>Under the Hood: The Loan Payment Calculation Formula</h4>
              <p>You don’t need to be a math whiz, but seeing the formula helps you appreciate what a calculator does in an instant. The standard formula for calculating a fixed monthly loan payment is:</p>
              <p className="font-mono p-2 bg-muted rounded-md text-center">M = P [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</p>
              <p>Let’s break down these variables:</p>
              <ul>
                <li><strong>M</strong> is your Monthly Payment.</li>
                <li><strong>P</strong> is the Principal Loan Amount (the total amount you borrowed).</li>
                <li><strong>r</strong> is your monthly interest rate. This is your Annual Percentage Rate (APR) divided by 12 (e.g., if your APR is 6%, then r = 0.06 / 12 = 0.005).</li>
                <li><strong>n</strong> is the total number of payments over the loan's life (the term in months). For a 30-year mortgage, n = 30 * 12 = 360. For a 5-year auto loan, n = 5 * 12 = 60.</li>
              </ul>
              <p>This complex formula is why a loan payment calculator is not just a convenience—it's an essential tool.</p>

              <h4>Why You Absolutely Need to Use a Loan Payment Calculator</h4>
              <p>A good calculator gives you the clarity you need to make smart financial decisions. Here’s how it empowers you:</p>
              <ol>
                <li><strong>Instant Accuracy and Budgeting:</strong> Get an exact monthly payment figure in seconds. This allows you to see what you can truly afford before you walk into a car dealership or start seriously looking at houses.</li>
                <li><strong>Easily Compare Loan Offers:</strong> Lenders (banks, credit unions, online lenders) will offer different loan terms and APRs. A calculator lets you quickly compare these offers to see how a small difference in the APR can impact your monthly payment and the total interest you’ll pay.</li>
                <li><strong>Visualize Your Debt Payoff with an Amortization Schedule:</strong> Most calculators provide an amortization schedule—a table showing how every single payment is broken down into principal and interest over the entire life of the loan.</li>
                <li><strong>Strategize for an Early Payoff:</strong> Want to be debt-free sooner? A calculator can instantly show you the impact of making extra payments. You can see how an extra $100 per month could shave years off your mortgage and save you tens of thousands of dollars in interest.</li>
              </ol>
              
              <h4>Strategic Ways to Manage and Reduce Your Loan Burden</h4>
              <p>Your loan payment isn't set in stone forever. There are powerful strategies you can use to reduce your payments or pay off your debt faster.</p>
              <ul>
                  <li><strong>Make a Larger Down Payment:</strong> The less you borrow, the lower your monthly payment will be. A larger down payment on a home or car is the most effective way to start off on the right foot.</li>
                  <li><strong>Improve Your Credit Score:</strong> Your FICO score is the single biggest factor in determining your APR. A higher credit score signals to lenders that you are a low-risk borrower, earning you a lower interest rate that can save you thousands.</li>
                  <li><strong>Make Extra Payments:</strong> Even small extra payments can have a huge impact. By paying an extra $50 or $100 a month and specifying that it goes "directly to principal," you can significantly shorten your loan term.</li>
                  <li><strong>Refinance Your Loan:</strong> Refinancing is a very common strategy in the U.S. It means taking out a new loan (ideally at a lower interest rate) to pay off your existing loan. This is popular with mortgages and student loans when interest rates drop or your credit score improves.</li>
              </ul>

              <h4>Frequently Asked Questions (FAQs) About Loan Payments</h4>
              <ol>
                  <li><strong>What’s the difference between Interest Rate and APR?</strong><br/>The interest rate is the cost of borrowing the principal. The Annual Percentage Rate (APR) is a broader measure that includes the interest rate plus other lender fees and costs. The APR is the more accurate number to use for comparing loan offers.</li>
                  <li><strong>Are there penalties for paying off my loan early?</strong><br/>For most standard loans like conforming mortgages and auto loans, prepayment penalties are rare. However, they can exist on some types of loans, so it's always important to read the fine print of your loan agreement.</li>
                  <li><strong>What’s the difference between a fixed-rate and an adjustable-rate loan?</strong><br/>A fixed-rate loan has an interest rate that is locked in for the entire term, so your P+I payment never changes. An Adjustable-Rate Mortgage (ARM) has an interest rate that is fixed for an initial period and then can change periodically, causing your monthly payment to go up or down.</li>
              </ol>

              <h4>Conclusion: The Calculator is Your First Step to Financial Control</h4>
              <p>A loan is a tool, and your monthly payment is how you manage it. By moving past the mystery and understanding the numbers, you transform from a passive debtor into an empowered financial planner.</p>
              <p>A loan payment calculator is your first and most important ally in this process. It replaces uncertainty with clarity, allowing you to budget with confidence, compare offers intelligently, and build a strategy to become debt-free. Before you sign any loan document, take a moment to plan. You have the tool—now go build your future.</p>
              <p className="text-xs">Disclaimer: The information provided in this article is for educational purposes only. Interest rates and loan terms can vary widely. Please consult with a qualified financial advisor or lender to discuss your specific situation.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about EMIs and loan amortization, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/e/emi.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Equated Monthly Installment (EMI)</a></li>
                  <li><a href="https://www.consumerfinance.gov/owning-a-home/loan-options/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Consumer Financial Protection Bureau: Loan Options</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
