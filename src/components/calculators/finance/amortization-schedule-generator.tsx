
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Amortization
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

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
