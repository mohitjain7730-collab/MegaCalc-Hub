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

export default function MortgagePaymentCalculator() {
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
          <Button type="submit">Calculate Mortgage Payment</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HandCoins className="h-8 w-8 text-primary" /><CardTitle>Mortgage Repayment Details</CardTitle></div></CardHeader>
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
                  <p>The total amount borrowed for the mortgage, after your down payment.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Annual Interest Rate (%)</h4>
                  <p>The yearly interest rate for the mortgage. This does not include taxes or insurance.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Loan Term (Years)</h4>
                  <p>The duration of the mortgage. Common terms are 15 or 30 years.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the standard formula for a fixed-rate mortgage payment to determine your fixed monthly payment. The formula accounts for the loan principal, the monthly interest rate (annual rate divided by 12), and the total number of payments (loan term in years multiplied by 12).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mortgage-guide">
            <AccordionTrigger>Understanding all about mortgage</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>Your Guide to the American Dream: Understanding Mortgages</h3>
                <p>For generations, homeownership has been a cornerstone of the American dream. It’s a place to call your own, build a family, and create lasting memories. But standing between most aspiring homeowners and their dream home is the single largest financial product they will ever encounter: the mortgage.</p>
                <p>The word itself can be intimidating, conjuring images of towering stacks of paperwork and a complex world of financial jargon. But it doesn't have to be. A mortgage is simply a tool, and like any tool, it’s incredibly effective when you understand how to use it.</p>
                <p>This guide will serve as your roadmap. We will demystify the entire mortgage landscape, breaking down how home loans work, the different types available, the costs involved, and the step-by-step process to securing one.</p>
                
                <h4>How Does a Mortgage Work? The Core Components</h4>
                <p>At its most basic, a mortgage is a loan used to purchase real estate. You, the borrower, receive money from a lender (like a bank or credit union) to buy a home. In return, you agree to pay back that money, plus interest, over a set period. The home itself serves as collateral, meaning if you fail to make your payments, the lender can take possession of the property through a process called foreclosure.</p>
                <p>Every mortgage is built on a few key terms:</p>
                <ul className="list-disc list-inside">
                    <li><strong>Principal:</strong> This is the initial amount of money you borrow to buy the home. If you buy a $400,000 house with a $40,000 down payment, your principal is $360,000.</li>
                    <li><strong>Interest Rate:</strong> This is the cost of borrowing the money, expressed as a percentage. This rate determines how much you’ll pay the lender for the privilege of using their money.</li>
                    <li><strong>Loan Term:</strong> This is the length of time you have to repay the loan. In the U.S., the most common terms are 30 years and 15 years.</li>
                    <li><strong>Amortization:</strong> This is the process of paying off your loan over time through regular, fixed payments. Each payment is split between principal and interest. In the beginning, more of your payment goes to interest; toward the end, more goes to principal.</li>
                </ul>
                
                <h4>The Anatomy of Your Monthly Payment: Understanding PITI</h4>
                <p>Your monthly mortgage payment is often more than just principal and interest. In most cases, it’s composed of four parts, known as PITI:</p>
                <ul className="list-disc list-inside">
                  <li><strong>P - Principal:</strong> The portion of your payment that reduces your loan balance.</li>
                  <li><strong>I - Interest:</strong> The portion that pays the lender for the loan.</li>
                  <li><strong>T - Taxes:</strong> Property taxes levied by your city or county. Your lender typically collects 1/12th of your annual property tax bill each month and holds it in an escrow account, paying the bill on your behalf when it’s due.</li>
                  <li><strong>I - Insurance:</strong> This includes your homeowners insurance policy and, potentially, Private Mortgage Insurance (PMI).</li>
                </ul>
                <p>A special note on PMI: If you get a conventional loan and make a down payment of less than 20% of the home's purchase price, your lender will almost always require you to pay for Private Mortgage Insurance (PMI). This insurance protects the lender—not you—in case you default on the loan. It's typically rolled into your monthly payment and can be removed once you reach 20% equity in your home.</p>

                <h4>The Big Decision: Types of Mortgages</h4>
                <p>Not all mortgages are created equal. The right one for you depends on your financial situation and how long you plan to stay in the home.</p>
                <h5>Fixed-Rate vs. Adjustable-Rate Mortgages (ARMs)</h5>
                <p>This is the most fundamental choice you will make.</p>
                <p><strong>Fixed-Rate Mortgage:</strong> The interest rate is locked in for the entire life of the loan. Your principal and interest payment will never change. This offers predictability and stability, making it the most popular choice in the U.S., especially for those who plan to stay in their home for a long time.</p>
                <p><strong>Adjustable-Rate Mortgage (ARM):</strong> An ARM has an interest rate that can change over time. Typically, it starts with a lower, fixed "introductory" rate for a set number of years (e.g., a 5/1 ARM has a fixed rate for 5 years). After that period, the rate adjusts periodically (e.g., once per year) based on broader market rates. This could mean your monthly payment goes up or down. ARMs can be beneficial if you plan to sell the home before the introductory period ends.</p>

                <h5>Common Loan Programs in the U.S.</h5>
                <ul className="list-disc list-inside">
                    <li><strong>Conventional Loans:</strong> These are the most common type of mortgage and are not insured by the federal government. They typically require a higher credit score (usually 620 or above) and a down payment of at least 3-5%. To avoid PMI, you need a 20% down payment.</li>
                    <li><strong>FHA Loans:</strong> Backed by the Federal Housing Administration, FHA loans are designed to help first-time homebuyers and those with less-than-perfect credit. They allow for down payments as low as 3.5% and have more flexible credit score requirements.</li>
                    <li><strong>VA Loans:</strong> An incredible benefit for eligible veterans, active-duty service members, and surviving spouses. VA loans are backed by the Department of Veterans Affairs and often require no down payment and no PMI.</li>
                    <li><strong>USDA Loans:</strong> For low- to moderate-income borrowers in eligible rural and suburban areas, these loans are backed by the U.S. Department of Agriculture. Like VA loans, they can offer a 0% down payment option.</li>
                </ul>

                <h4>The Money Part: Down Payments and Closing Costs</h4>
                <h5>The Down Payment</h5>
                <p>The myth that you always need a 20% down payment is one of the biggest barriers to homeownership. While 20% is the magic number to avoid PMI on a conventional loan, many programs allow for much less. A larger down payment is always beneficial—it lowers your monthly payment and reduces the total interest you'll pay—but don't let the 20% myth stop you from exploring your options.</p>
                <h5>Closing Costs</h5>
                <p>These are the fees you pay to finalize the mortgage and the real estate transaction. They are separate from your down payment and typically range from 2% to 5% of the home's purchase price. Common closing costs include:</p>
                <ul className="list-disc list-inside">
                    <li>Loan origination fees</li>
                    <li>Appraisal fees</li>
                    <li>Title insurance</li>
                    <li>Attorney fees</li>
                    <li>Home inspection fees</li>
                </ul>

                <h4>The Mortgage Process: A Simplified Timeline</h4>
                <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Get Pre-Approved:</strong> This is your most important first step. A pre-approval is a letter from a lender stating that they have reviewed your financial documents (income, assets, debt) and are willing to lend you a specific amount of money. It shows real estate agents and sellers that you are a serious, qualified buyer.</li>
                    <li><strong>Find a Home and Make an Offer:</strong> With your pre-approval letter in hand, you can confidently shop for a home in your price range.</li>
                    <li><strong>Formal Loan Application and Underwriting:</strong> Once your offer is accepted, you'll submit a formal application. The loan then goes into underwriting, where the lender does a deep dive to verify all your financial details.</li>
                    <li><strong>Appraisal and Home Inspection:</strong> The lender will order an appraisal to ensure the home is worth the price you're paying. You will hire an inspector to check for any structural or maintenance issues.</li>
                    <li><strong>Clear to Close and Closing Day:</strong> Once the underwriter gives the final sign-off, you are "clear to close." On closing day, you will sign a mountain of final paperwork, pay your down payment and closing costs, and officially receive the keys to your new home.</li>
                </ol>

                <h4>Conclusion: Your Journey to Homeownership</h4>
                <p>A mortgage is undoubtedly the biggest financial commitment most people will ever make. But by breaking it down into understandable parts—PITI, loan types, costs, and the application process—it becomes a manageable journey rather than an intimidating obstacle.</p>
                <p>The research you are doing right now is the foundation for a smart decision. Your next step is clear: talk to a lender and get pre-approved. It's the action that turns the dream of homeownership into a concrete plan.</p>
                <p className="text-xs">Disclaimer: This article is for informational purposes only and is not intended as financial advice. Mortgage rates, programs, and requirements are subject to change. Please consult with a qualified mortgage lender or financial advisor to discuss your individual situation.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>To learn more about mortgages and loan amortization, you can visit these credible resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/mortgage-calculator-5076624" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: Mortgage Calculator</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
