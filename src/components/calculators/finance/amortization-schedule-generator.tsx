
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Calculator, Info, FileText, CreditCard, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  annualRate: z.number().positive(),
  loanTerm: z.number().int().positive(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { paymentNumber: number; payment: number; principal: number; interest: number; balance: number };

export default function AmortizationScheduleGenerator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualRate: undefined,
      loanTerm: undefined,
      paymentsPerYear: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { loanAmount, annualRate, loanTerm, paymentsPerYear } = values;
    const r = (annualRate / 100) / paymentsPerYear;
    const n = loanTerm * paymentsPerYear;
    const M = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    let balance = loanAmount;
    const newSchedule: ScheduleItem[] = [];

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = M - interest;
      balance -= principal;
      newSchedule.push({ paymentNumber: i, payment: M, principal, interest, balance });
    }
    setSchedule(newSchedule);
  };

  const totalInterest = schedule ? schedule.reduce((sum, item) => sum + item.interest, 0) : 0;
  const totalPrincipal = schedule ? schedule[0]?.payment * schedule.length : 0;

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Parameters
          </CardTitle>
          <CardDescription>
            Enter your loan details to generate a complete amortization schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="loanAmount" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 250000"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="annualRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6.5"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="loanTerm" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 30"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="paymentsPerYear" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payments per Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 12"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit">Generate Schedule</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {schedule && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Amortization Schedule</CardTitle>
                <CardDescription>Total Interest: ${totalInterest.toFixed(2)} | Total Payment: ${totalPrincipal.toFixed(2)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pmt #</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(item => (
                    <TableRow key={item.paymentNumber}>
                      <TableCell>{item.paymentNumber}</TableCell>
                      <TableCell>${item.payment.toFixed(2)}</TableCell>
                      <TableCell>${item.principal.toFixed(2)}</TableCell>
                      <TableCell>${item.interest.toFixed(2)}</TableCell>
                      <TableCell>${item.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Principal Loan Amount</h4>
            <p className="text-muted-foreground">
              The total amount borrowed from the lender. This is the initial balance that will be paid down over the life of the loan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Annual Interest Rate</h4>
            <p className="text-muted-foreground">
              The nominal yearly interest rate for the loan. This percentage is applied to the remaining balance to calculate the interest portion of each payment.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Loan Term & Payments per Year</h4>
            <p className="text-muted-foreground">
              The total duration of the loan in years and how frequently payments are made (e.g., 12 for monthly payments). The total number of payments is the loan term multiplied by payments per year.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other loan and financial calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your monthly mortgage payment including principal, interest, taxes, and insurance.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                  Loan EMI Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate Equated Monthly Installment (EMI) for your personal or home loan.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Loan with Extra Payments Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                See how extra payments can reduce your loan term and total interest paid.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/debt-to-income-ratio-calculator" className="text-primary hover:underline">
                  Debt-to-Income Ratio Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your debt-to-income ratio to assess your loan affordability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Loan Amortization Schedules: Calculation, Interest-Principal Split, and Debt Management" />
    <meta itemProp="description" content="An expert guide detailing the structure of a loan amortization schedule, the formula for calculating fixed periodic payments (PMT), the mechanics of the interest-principal split, and how the schedule is affected by extra payments." />
    <meta itemProp="keywords" content="loan amortization schedule formula, calculating fixed payment PMT, interest principal split amortization, front-loaded interest explained, reducing balance method, debt repayment schedule generator" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-amortization-schedule-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Amortization Schedule: Mapping Your Debt Repayment</h1>
    <p className="text-lg italic text-gray-700">Master the structured table that details every fixed loan payment, revealing the precise allocation between interest and principal over the life of the debt.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Amortization: Definition and Schedule Components</a></li>
        <li><a href="#payment-calc" className="hover:underline">Calculating the Fixed Payment (PMT)</a></li>
        <li><a href="#split" className="hover:underline">The Interest-Principal Split: Front-Loading Mechanics</a></li>
        <li><a href="#interest-calc" className="hover:underline">The Reducing Balance Interest Calculation</a></li>
        <li><a href="#extra-payments" className="hover:underline">Impact of Extra Payments on the Schedule</a></li>
    </ul>
<hr />

    {/* AMORTIZATION: DEFINITION AND SCHEDULE COMPONENTS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Amortization: Definition and Schedule Components</h2>
    <p>**Amortization** is the process of gradually paying off a debt over a fixed period through a series of regular, equal installments. The **Amortization Schedule** is the detailed table that shows the exact financial breakdown of every single payment made over the life of the loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Schedule Components</h3>
    <p>Each row in the schedule represents one payment and tracks five columns:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Beginning Balance:</strong> The outstanding principal at the start of the period.</li>
        <li><strong className="font-semibold">Fixed Payment (PMT):</strong> The constant total installment amount.</li>
        <li><strong className="font-semibold">Interest Paid:</strong> The portion of the PMT covering the accrued interest.</li>
        <li><strong className="font-semibold">Principal Paid:</strong> The portion of the PMT that reduces the loan balance.</li>
        <li><strong className="font-semibold">Ending Balance:</strong> The remaining principal after the PMT is applied.</li>
    </ol>
    <p>The schedule must end with an **Ending Balance of zero** on the final payment date.</p>

<hr />

    {/* CALCULATING THE FIXED PAYMENT (PMT) */}
    <h2 id="payment-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Fixed Payment (PMT)</h2>
    <p>The fixed monthly payment (PMT) is calculated using the **Present Value of Annuity** formula, ensuring that the stream of payments perfectly equals the original loan principal (PV) over the full term (n).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The PMT formula is derived by rearranging the PVA equation, using the original loan principal (P), the periodic interest rate (r), and the total number of periods (n):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'PMT = P * [ r * (1 + r)^n / ((1 + r)^n - 1) ]'}
        </p>
    </div>
    <p>The term in brackets is the **Capital Recovery Factor**, the multiplier that calculates the fixed payment required to recover the principal plus interest.</p>

<hr />

    {/* THE INTEREST-PRINCIPAL SPLIT: FRONT-LOADING MECHANICS */}
    <h2 id="split" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Interest-Principal Split: Front-Loading Mechanics</h2>
    <p>The central feature of the amortization schedule is that the proportion of interest to principal within the fixed PMT changes with every payment made. This is known as the **front-loading of interest**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Dynamic Shift</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Early Years:</strong> The outstanding principal balance is at its highest. Therefore, the interest portion of the PMT is maximized, and only a tiny portion reduces the principal.</li>
        <li><strong className="font-semibold">Mid-Term:</strong> The interest portion and principal portion gradually become closer to equal.</li>
        <li><strong className="font-semibold">Later Years:</strong> The outstanding principal is low. The interest portion of the PMT is minimized, and the vast majority of the payment goes toward rapidly paying down the remaining principal.</li>
    </ul>
    <p>This front-loaded structure means the borrower pays the majority of the total interest cost during the first third of the loan's life.</p>

<hr />

    {/* THE REDUCING BALANCE INTEREST CALCULATION */}
    <h2 id="interest-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Reducing Balance Interest Calculation</h2>
    <p>The amortization method relies on the **reducing balance method**, ensuring that interest is calculated fairly—only on the principal that is currently owed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interest Calculation for Payment 'k'</h3>
    <p>The interest due for the current payment is calculated based on the **Beginning Balance** of that specific period:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Interest (k) = Beginning Balance (k) * Periodic Interest Rate (r)'}
        </p>
    </div>
    <p>The Principal reduction for the period is then calculated as the remainder of the fixed payment:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Principal Paid (k) = PMT - Interest (k)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Updating the Schedule</h3>
    <p>The **Ending Balance** for payment $k$ becomes the **Beginning Balance** for payment $k+1$, perpetuating the cycle until the balance hits zero. The total interest paid over the loan term is the sum of all individual interest components in the schedule.</p>

<hr />

    {/* IMPACT OF EXTRA PAYMENTS ON THE SCHEDULE */}
    <h2 id="extra-payments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of Extra Payments on the Schedule</h2>
    <p>An extra payment (or prepayment) immediately alters the amortization schedule, leading to significant savings in time and interest cost.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Principal-Only Reduction</h3>
    <p>A properly designated extra payment is applied $100\%$ toward the outstanding principal. This immediately reduces the **Beginning Balance** for all future periods, causing the following effects:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Reduced Interest Base:</strong> The next month’s interest is calculated on a much smaller principal amount.</li>
        <li><strong className="font-semibold">Faster Payoff:</strong> Because the fixed PMT now covers the interest sooner, a larger portion is automatically directed to principal reduction, eliminating payments at the end of the loan's life and shortening the tenure.</li>
    </ol>
    <p>The amortization generator recalculates the entire schedule after the extra payment, showing the new, accelerated payoff date and the precise dollar amount of interest saved.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Amortization Schedule is the definitive tool for tracking and managing installment debt. It reveals the **fixed PMT** structure and the vital **front-loading of interest** inherent in loans like mortgages.</p>
    <p>Understanding the reducing balance method empowers borrowers to utilize **prepayments** effectively. By applying surplus funds directly to the principal balance, the borrower shortens the loan term and minimizes the overall interest burden, accelerating their path to debt freedom.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about amortization schedules and loan payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">How does an amortization schedule work?</h4>
            <p className="text-muted-foreground">
              An amortization schedule shows each payment broken down into principal and interest components. Initially, most of each payment goes to interest, but over time, the principal portion increases while the interest portion decreases. This is called "amortization."
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why do I pay more interest at the beginning of the loan?</h4>
            <p className="text-muted-foreground">
              Since interest is calculated on the remaining loan balance, and the balance is highest at the start, the interest portion of early payments is larger. As you pay down the principal, the interest portion naturally decreases.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do extra payments affect my loan?</h4>
            <p className="text-muted-foreground">
              Extra payments directly reduce the principal balance, which means less interest is charged in future periods. This can significantly shorten your loan term and reduce total interest paid, often saving thousands of dollars over the life of the loan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between interest rate and APR?</h4>
            <p className="text-muted-foreground">
              The interest rate is the cost of borrowing the principal amount. APR (Annual Percentage Rate) includes the interest rate plus additional fees and costs. APR provides a more complete picture of the total cost of the loan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I pay off my loan early?</h4>
            <p className="text-muted-foreground">
              Most loans allow early payoff, but some may have prepayment penalties. Check your loan agreement. Paying off early can save interest but means losing potential investment returns from that money elsewhere.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does a shorter loan term affect payments?</h4>
            <p className="text-muted-foreground">
              Shorter loan terms result in higher monthly payments but significantly less total interest paid. For example, a 15-year mortgage has higher monthly payments than a 30-year mortgage but can save tens of thousands in interest.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the front-loading of interest?</h4>
            <p className="text-muted-foreground">
              Front-loading means that in the early years of a loan, a large portion of each payment goes to interest rather than principal. This is a natural consequence of how interest is calculated on the remaining balance, which starts high and decreases over time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I calculate the monthly payment manually?</h4>
            <p className="text-muted-foreground">
              The formula is: M = P [ r(1+r)^n ] / [ (1+r)^n - 1 ], where M is monthly payment, P is principal, r is monthly interest rate, and n is number of payments. However, using a calculator is recommended to avoid errors.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I make bi-weekly payments?</h4>
            <p className="text-muted-foreground">
              Making half the monthly payment every two weeks results in 26 payments per year instead of 12 monthly payments. This equals 13 monthly payments per year, which can significantly reduce the loan term and total interest paid.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does refinancing affect my amortization?</h4>
            <p className="text-muted-foreground">
              Refinancing replaces your existing loan with a new one, resetting the amortization schedule. If you refinance to a lower interest rate, you can reduce monthly payments or shorten the term. However, early payments in the new loan will again be mostly interest.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
