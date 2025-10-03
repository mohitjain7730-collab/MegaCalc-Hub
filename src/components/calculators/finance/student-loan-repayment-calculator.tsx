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

export default function StudentLoanRepaymentCalculator() {
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
                <FormItem className="md:col-span-2"><FormLabel>Loan Term (Years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Student Loan Payment</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HandCoins className="h-8 w-8 text-primary" /><CardTitle>Student Loan Repayment Details</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Monthly Payment</CardDescription>
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
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Loan Amount</h4>
                  <p>The total principal amount of your student loan debt.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate (%)</h4>
                  <p>The yearly interest rate on your loan. If you have multiple loans with different rates, you can use a weighted average.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Loan Term (Years)</h4>
                  <p>The repayment period for your loan. A standard repayment plan is typically 10 years, but other options may be available.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard loan amortization formula to determine your fixed monthly payment for your student loan. The formula accounts for the loan principal, the monthly interest rate, and the total number of payments.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="student-loan-guide">
            <AccordionTrigger>The Ultimate Guide to Student Loans</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
                <h3>Navigating the Maze: Your Ultimate Guide to Student Loans</h3>
                <p>You did it. The acceptance letters have arrived, and the excitement of starting college is palpable. But alongside the campus tour brochures and school spirit merchandise comes a far more intimidating document: the financial aid award letter, complete with the estimated cost of attendance.</p>
                <p>For the vast majority of American families, the sticker price of a college education is far beyond what they can cover out of pocket. This is where student loans enter the picture. A student loan is a form of financial aid that must be repaid with interest, and it's one of the most common tools used to fund higher education.</p>
                <p>Navigating this world can feel overwhelming, but it doesn't have to be. Think of this guide as your compass. We will walk you through the entire landscape—from the different types of loans and how to apply for them to the strategies for responsible repayment after you toss your graduation cap in the air.</p>

                <h4>The Two Worlds of Student Loans: Federal vs. Private</h4>
                <p>This is the single most important distinction to understand. Not all student loans are created equal.</p>
                <h5>Federal Student Loans (Your First and Best Choice)</h5>
                <p>Federal student loans are funded directly by the U.S. Department of Education. They are the foundation of student borrowing for a reason—they are designed with powerful, built-in protections for borrowers.</p>
                <ul className="list-disc list-inside">
                    <li><strong>Fixed Interest Rates:</strong> The interest rate is set by Congress and is fixed for the life of the loan. It will never change.</li>
                    <li><strong>No Credit Check Required (for most loans):</strong> Undergraduates can get federal loans without a credit history or a cosigner.</li>
                    <li><strong>Flexible Repayment Plans:</strong> Federal loans offer access to programs that can lower your monthly payment based on your income (more on this later).</li>
                    <li><strong>Loan Forgiveness Potential:</strong> These are the only loans eligible for federal forgiveness programs, like Public Service Loan Forgiveness (PSLF).</li>
                    <li><strong>Deferment and Forbearance:</strong> They offer options to temporarily pause payments if you face financial hardship, like unemployment.</li>
                </ul>
                <p><strong>The Golden Rule:</strong> Before you even think about any other type of loan, you should always borrow the maximum amount you are eligible for in federal student loans.</p>

                <h5>Private Student Loans (Use Sparingly to Fill the Gap)</h5>
                <p>Private student loans are offered by banks, credit unions, and online lenders. They are a consumer financial product, much like an auto loan or a personal loan.</p>
                <ul className="list-disc list-inside">
                    <li><strong>Credit-Based:</strong> Approval and the interest rate you get are based on your credit history. Since most students don't have a long credit history, this almost always requires a creditworthy cosigner (like a parent).</li>
                    <li><strong>Variable or Fixed Rates:</strong> You may be offered a variable interest rate, which can change over time, potentially causing your payments to increase.</li>
                    <li><strong>Fewer Borrower Protections:</strong> Private loans do not offer the flexible income-driven repayment plans or federal forgiveness programs that come with federal loans.</li>
                </ul>
                <p>Think of private loans as a last resort, to be used only after you have exhausted all scholarships, grants, and federal loan options.</p>

                <h4>How to Apply: The FAFSA is Your Golden Ticket</h4>
                <p>To get access to any federal aid, you must complete one critical form: the FAFSA (Free Application for Federal Student Aid).</p>
                <p>The FAFSA is the master key that unlocks all federal financial aid, including grants (which you don't have to pay back), work-study programs, and federal student loans. You (and your parents, if you are a dependent student) will use your financial information to complete the application.</p>
                <p><strong>When to file:</strong> The FAFSA application opens in December for the following academic year. You should file it as early as possible, as some aid is first-come, first-served.</p>
                <p><strong>What it does:</strong> The information on your FAFSA is used to calculate your Student Aid Index (SAI). This number is a measure of your family's financial strength and is used by colleges to determine how much federal aid you are eligible to receive.</p>

                <h4>Decoding Your Federal Loan Offer: Subsidized vs. Unsubsidized</h4>
                <p>After you're accepted to a college and they've received your FAFSA information, you'll get a financial aid award letter. If you are offered federal loans, you will likely see these two terms:</p>
                <h5>Direct Subsidized Loans</h5>
                <p>These are the best type of student loan you can get. They are available to undergraduate students who demonstrate financial need.</p>
                <p><strong>The Key Benefit:</strong> The U.S. Department of Education pays the interest on your loan for you while you're in school at least half-time, during your six-month grace period after you graduate, and during any periods of deferment. This saves you a significant amount of money.</p>
                <h5>Direct Unsubsidized Loans</h5>
                <p>These loans are available to both undergraduate and graduate students, and financial need is not a requirement.</p>
                <p><strong>The Key Difference:</strong> You are responsible for paying all the interest that accrues on the loan, starting from the day it's disbursed. While you are in school, that interest adds up. You can choose to pay it while you're studying, or you can let it capitalize—meaning the accrued interest gets added to your principal loan balance when you start repayment.</p>

                <h4>The Reality of Repayment: Your Options After Graduation</h4>
                <p>Your loan journey doesn't end when you get your diploma. Once your six-month grace period is over, you'll need to start making payments. Thankfully, the federal system offers several plans.</p>
                <ul className="list-disc list-inside">
                    <li><strong>Standard Repayment Plan:</strong> This puts you on a path to pay off your loans in 10 years with a fixed monthly payment.</li>
                    <li><strong>Income-Driven Repayment (IDR) Plans:</strong> These are one of the most powerful benefits of federal loans. IDR plans cap your monthly payment at a percentage of your discretionary income. If your income is low, your payment could be as low as $0 per month. The newest and most generous plan is the SAVE (Saving on a Valuable Education) Plan. After making payments for 20-25 years on an IDR plan, any remaining loan balance is forgiven.</li>
                    <li><strong>Public Service Loan Forgiveness (PSLF):</strong> This is a critical program for graduates who work for the government or a qualifying non-profit organization. Under PSLF, if you make 120 qualifying monthly payments (10 years' worth) on an eligible repayment plan, the remaining balance on your Direct Loans is forgiven, tax-free.</li>
                </ul>

                <h4>Golden Rules for Responsible Borrowing</h4>
                <p>Student loans are a serious, multi-year financial commitment. Approaching them with care will save you stress and money down the road.</p>
                <ul className="list-disc list-inside">
                    <li><strong>Borrow Only What You Absolutely Need.</strong> Your school may offer you more in loans than the direct cost of tuition and fees. Resist the temptation to borrow extra for lifestyle expenses. Every dollar you borrow is a dollar you'll have to pay back with interest.</li>
                    <li><strong>Exhaust "Free Money" First.</strong> Vigorously apply for scholarships and grants. This is money you don't have to pay back, and it reduces the amount you'll need to borrow.</li>
                    <li><strong>Understand Your Future Payment.</strong> Before you accept a loan, use the federal Loan Simulator tool to estimate what your monthly payments will be after graduation. Compare that to the expected starting salary for your chosen career.</li>
                    <li><strong>Keep Meticulous Records.</strong> Save all your loan documents. Know who your loan servicer is (the company that manages your loan and collects payments). You are your own best advocate.</li>
                </ul>

                <h4>Conclusion: A Tool, Not a Trap</h4>
                <p>A college education remains one of the best long-term investments you can make in yourself. For most, student loans are a necessary part of that investment. When used thoughtfully and managed responsibly, they are a powerful tool for upward mobility.</p>
                <p>Remember the hierarchy: start with scholarships and grants, then maximize your federal loan options (subsidized first), and only then, if there is still a funding gap, cautiously consider private loans. By approaching this process with knowledge and a plan, you are setting the stage for a bright and successful financial future.</p>
                <p className="text-xs">Disclaimer: This article is for informational purposes only and not financial advice. Student loan terms, interest rates, and federal programs are subject to change. Please refer to official government websites like StudentAid.gov for the most current information.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about student loans, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://smartasset.com/student-loans/student-loan-calculator" target="_blank" rel="noopener noreferrer" className="text-primary underline">SmartAsset: Student Loan Repayment Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
