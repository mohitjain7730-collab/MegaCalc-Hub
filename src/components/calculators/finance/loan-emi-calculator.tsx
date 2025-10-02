
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
        <AccordionItem value="emi-guide">
            <AccordionTrigger>Complete guide on how to get out of EMI Trap</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
              <h3>How to Master Your Loan Payments</h3>
                <p>Taking out a loan is a major life decision. Whether it’s for a dream home, a new car, your higher education, or a personal need, a loan can be a powerful tool to achieve your goals. But with this financial tool comes a crucial responsibility: the Equated Monthly Instalment, or EMI. For many, the term "EMI" is a source of anxiety. How is it calculated? How much of it is interest versus the actual loan amount? And most importantly, can I actually afford it? If you've ever asked these questions, you're in the right place. This guide will demystify the world of EMIs. We'll break down what an EMI is, explore the formula behind it, and show you how a simple Loan/EMI Calculator can transform you from an anxious borrower into a confident financial planner.</p>
                <h4>What Exactly is an EMI (Equated Monthly Instalment)?</h4>
                <p>At its core, an Equated Monthly Instalment (EMI) is a fixed payment amount that a borrower makes to a lender on a specified date each month. This payment continues until the loan, along with all the accumulated interest, is fully paid off. The key word here is "Equated." It means that the amount you pay every month remains the same throughout the loan's tenure. This predictability makes budgeting significantly easier. Every EMI payment you make has two components:</p>
                <ol>
                  <li><strong>Principal Repayment:</strong> This is the portion of the payment that goes towards reducing the original loan amount you borrowed.</li>
                  <li><strong>Interest Payment:</strong> This is the cost of borrowing the money, paid to the lender.</li>
                </ol>
                <p>A common misconception is that these two components are split 50/50. In reality, during the initial years of the loan, the interest component makes up a larger portion of your EMI. As you continue to pay, the principal component gradually increases while the interest portion decreases.</p>
                <h4>Under the Hood: Decoding the EMI Calculation Formula</h4>
                <p>You don't need to be a math genius to understand your loan, but seeing the formula can help you appreciate what an EMI calculator does for you in seconds. The mathematical formula used to calculate EMI is:</p>
                <p className="font-mono p-2 bg-muted rounded-md text-center">E = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)</p>
                <p>Let's break down what each variable means:</p>
                <ul>
                  <li><strong>E</strong> is the Equated Monthly Instalment (the amount you need to calculate).</li>
                  <li><strong>P</strong> is the Principal Loan Amount (the initial amount you borrowed).</li>
                  <li><strong>r</strong> is the monthly rate of interest. This is crucial; the annual interest rate is divided by 12. (For example, if the annual rate is 9%, then r=9/(12×100)=0.0075).</li>
                  <li><strong>n</strong> is the number of monthly instalments, also known as the loan tenure in months. (For a 20-year loan, n=20×12=240 months).</li>
                </ul>
                <p>Looks complicated, right? Manually calculating this is tedious and prone to errors. This is precisely why a Loan/EMI calculator is an indispensable tool.</p>
                <h4>Why You Absolutely Need to Use a Loan/EMI Calculator</h4>
                <p>A Loan/EMI calculator is more than just a convenience; it's a strategic financial planning tool. Here’s how it empowers you:</p>
                <ol>
                  <li><strong>Instant and Accurate Results:</strong> It eliminates the complex manual calculations, providing you with your exact EMI in seconds. This accuracy is vital for budgeting.</li>
                  <li><strong>Better Financial Planning:</strong> Before you even apply for a loan, you can determine your affordability. By adjusting the loan amount, tenure, and interest rate, you can find an EMI that comfortably fits your monthly budget.</li>
                  <li><strong>Ability to Compare Loan Offers:</strong> When you're shopping for a loan, different banks will offer various interest rates and terms. A calculator allows you to quickly compare these offers side-by-side to see which one is genuinely the most cost-effective in the long run.</li>
                  <li><strong>Understanding the Total Cost:</strong> The calculator doesn't just show you the EMI. It also reveals two critical figures: the Total Interest Payable and the Total Payment (Principal + Interest). This helps you see the true cost of the loan over its entire duration.</li>
                  <li><strong>Planning Prepayments:</strong> You can use the calculator to see how making partial prepayments can drastically reduce your loan tenure and the total interest you pay.</li>
                </ol>
                <h4>How to Use Our EMI Calculator: A Simple Step-by-Step Guide</h4>
                <p>Our calculator is designed to be simple and intuitive. All you need are three key pieces of information:</p>
                <ol>
                  <li><strong>Principal Loan Amount (₹):</strong> Enter the amount you wish to borrow.</li>
                  <li><strong>Annual Interest Rate (%):</strong> Enter the annual rate of interest offered by the lender.</li>
                  <li><strong>Loan Tenure (Years/Months):</strong> Enter the duration for which you are taking the loan.</li>
                </ol>
                <p>Once you input these values, our calculator will instantly display:</p>
                <ul>
                  <li>Your Monthly EMI</li>
                  <li>The Total Interest Payable</li>
                  <li>The Total Principal and Interest you'll pay over the loan's lifetime.</li>
                </ul>
                <p>It also generates a detailed amortization schedule, which is a complete roadmap of your loan repayment.</p>
                <h4>What is an Amortization Schedule and Why Should You Care?</h4>
                <p>The amortization schedule is arguably the most insightful part of an EMI calculator's results. It’s a detailed table that shows the month-by-month breakdown of your EMI payments into principal and interest components.</p>
                <p>Here’s a simplified example for a ₹1,00,000 loan for 1 year at 12% annual interest (EMI would be ₹8,885):</p>
                <Table>
                  <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>EMI</TableHead><TableHead>Principal Paid</TableHead><TableHead>Interest Paid</TableHead><TableHead>Outstanding Balance</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow><TableCell>1</TableCell><TableCell>₹8,885</TableCell><TableCell>₹7,885</TableCell><TableCell>₹1,000</TableCell><TableCell>₹92,115</TableCell></TableRow>
                    <TableRow><TableCell>2</TableCell><TableCell>₹8,885</TableCell><TableCell>₹7,963</TableCell><TableCell>₹921</TableCell><TableCell>₹84,152</TableCell></TableRow>
                    <TableRow><TableCell>3</TableCell><TableCell>₹8,885</TableCell><TableCell>₹8,043</TableCell><TableCell>₹842</TableCell><TableCell>₹76,109</TableCell></TableRow>
                    <TableRow><TableCell>...</TableCell><TableCell>...</TableCell><TableCell>...</TableCell><TableCell>...</TableCell><TableCell>...</TableCell></TableRow>
                    <TableRow><TableCell>12</TableCell><TableCell>₹8,885</TableCell><TableCell>₹8,797</TableCell><TableCell>₹88</TableCell><TableCell>₹0</TableCell></TableRow>
                  </TableBody>
                </Table>
                <p>By looking at this schedule, you can see exactly how your payments are chipping away at your loan and how the interest burden reduces over time.</p>
                <h4>Strategic Ways to Reduce Your EMI Burden</h4>
                <p>Feeling that your EMI is too high? Or do you simply want to become debt-free faster? Here are some effective strategies:</p>
                <ul>
                  <li><strong>Make a Larger Down Payment:</strong> The lower your principal amount (P), the lower your EMI will be. Paying a larger down payment upfront is the most effective way to reduce your monthly obligation.</li>
                  <li><strong>Opt for a Longer Tenure:</strong> Extending the loan tenure (n) will reduce your monthly EMI. However, be cautious! A longer tenure means you will pay significantly more interest over the life of the loan. Use the calculator to see this trade-off clearly.</li>
                  <li><strong>Loan Prepayment:</strong> If you receive a bonus or a sudden windfall, using it to make a partial prepayment on your loan is a brilliant move. This reduces the principal, which can either lower your subsequent EMIs or reduce the loan tenure, saving you a huge amount in interest.</li>
                  <li><strong>Choose a Lower Interest Rate:</strong> Even a 0.25% difference in the interest rate can save you thousands over the loan's duration. Always compare lenders and negotiate for the best possible rate.</li>
                </ul>
                <h4>Frequently Asked Questions (FAQs) About Loans and EMIs</h4>
                <ol>
                  <li><strong>What happens if I miss an EMI payment?</strong><br/>Missing an EMI payment will result in late payment fees and penalties. More importantly, it will be reported to credit bureaus like CIBIL, which will negatively impact your credit score, making it harder to get loans in the future.</li>
                  <li><strong>Can I prepay my loan? Are there any charges?</strong><br/>Most lenders allow prepayment. For floating-rate home loans, there are no prepayment charges as per RBI guidelines. However, for fixed-rate loans and other types of loans (like personal or car loans), the lender might levy a small prepayment penalty.</li>
                  <li><strong>What's the difference between a fixed and a floating interest rate?</strong><br/>A fixed interest rate remains the same throughout the loan tenure, so your EMI is constant. A floating interest rate is linked to a benchmark rate and can change over time, causing your EMI to increase or decrease.</li>
                  <li><strong>How does my credit score affect my EMI?</strong><br/>Your credit score doesn't directly affect the EMI calculation, but it heavily influences the interest rate (r) a lender offers you. A higher credit score signals to lenders that you are a reliable borrower, and they will offer you a lower interest rate, which in turn leads to a lower EMI.</li>
                </ol>
                <h4>Conclusion: Your Partner in Financial Empowerment</h4>
                <p>A loan is not just a liability; it's an opportunity. And understanding your EMI is the first step toward managing that opportunity wisely. The days of being intimidated by complex financial calculations are over. A Loan/EMI calculator removes the guesswork and replaces it with clarity. It empowers you to plan, compare, and make decisions that align with your financial reality. By using this simple tool, you're not just calculating a number; you're designing your financial future with confidence. So, before you sign on the dotted line, take a moment to plan. Try our Loan/EMI Calculator today and take the first confident step towards your goals.</p>
                <p className="text-xs">Disclaimer: The calculations and information provided in this article are for educational and illustrative purposes only. Interest rates and loan terms can vary between financial institutions. Please consult with a qualified financial advisor before making any borrowing decisions.</p>
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
