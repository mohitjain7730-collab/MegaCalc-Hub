'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Landmark, Globe, FileText, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  loanAmount: z.number().positive(),
  initialRatePercent: z.number().nonnegative(),
  fixedYears: z.number().positive(),
  totalTermYears: z.number().positive(),
  indexRatePercent: z.number().nonnegative(),
  marginPercent: z.number().nonnegative(),
  adjustIntervalYears: z.number().positive(),
  periodicCapPercent: z.number().nonnegative(),
  lifetimeCapPercent: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

type YearRow = { year: number; ratePercent: number; monthlyPayment: number; balanceEnd: number };

export default function ArmPaymentProjectionCalculator() {
  const [rows, setRows] = useState<YearRow[] | null>(null);
  const [opinion, setOpinion] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      initialRatePercent: undefined,
      fixedYears: undefined,
      totalTermYears: undefined,
      indexRatePercent: undefined,
      marginPercent: undefined,
      adjustIntervalYears: undefined,
      periodicCapPercent: undefined,
      lifetimeCapPercent: undefined,
    },
  });

  function amortizeMonthlyPayment(principal: number, annualRatePct: number, months: number): number {
    const r = annualRatePct / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function project(values: FormValues) {
    const {
      loanAmount,
      initialRatePercent,
      fixedYears,
      totalTermYears,
      indexRatePercent,
      marginPercent,
      adjustIntervalYears,
      periodicCapPercent,
      lifetimeCapPercent,
    } = values;

    const totalMonths = totalTermYears * 12;
    const fixedMonths = fixedYears * 12;
    const adjustIntervalMonths = adjustIntervalYears * 12;

    let balance = loanAmount;
    const out: YearRow[] = [];

    // Helper to simulate a block of months with a fixed rate and compute year-end snapshots
    function simulateMonths(startMonth: number, months: number, annualRate: number) {
      const payment = amortizeMonthlyPayment(balance, annualRate, totalMonths - (startMonth - 1));
      for (let m = 0; m < months && startMonth + m <= totalMonths; m++) {
        const r = annualRate / 100 / 12;
        const interest = balance * r;
        const principal = payment - interest;
        balance = Math.max(0, balance - principal);
        const currentMonth = startMonth + m;
        // At each December (month multiple of 12) or at loan end, record a row
        if (currentMonth % 12 === 0 || currentMonth === totalMonths) {
          const year = Math.ceil(currentMonth / 12);
          out.push({ year, ratePercent: annualRate, monthlyPayment: payment, balanceEnd: balance });
        }
      }
    }

    // Fixed period
    simulateMonths(1, fixedMonths, initialRatePercent);

    // Adjustment periods
    let elapsed = fixedMonths;
    // lifetime cap enforcer: rate cannot exceed initial + lifetimeCapPercent
    let lastRate = initialRatePercent;
    const maxRate = initialRatePercent + lifetimeCapPercent;
    while (elapsed < totalMonths) {
      // Fully indexed rate suggestion
      const targetRate = indexRatePercent + marginPercent;
      // Move from lastRate toward targetRate but capped by periodicCapPercent and lifetime cap
      const direction = targetRate >= lastRate ? 1 : -1;
      const step = Math.min(periodicCapPercent, Math.abs(targetRate - lastRate));
      let newRate = lastRate + direction * step;
      newRate = Math.min(newRate, maxRate);
      // Simulate next adjustment block
      const remaining = totalMonths - elapsed;
      const block = Math.min(adjustIntervalMonths, remaining);
      simulateMonths(elapsed + 1, block, newRate);
      elapsed += block;
      lastRate = newRate;
    }

    // Opinion
    const maxPayment = Math.max(...out.map(r => r.monthlyPayment));
    const minPayment = Math.min(...out.map(r => r.monthlyPayment));
    const paymentVolatility = (maxPayment - minPayment) / (minPayment || 1);
    let summary = 'Payments may change over time. Plan for variability and cushion your budget.';
    if (paymentVolatility > 0.25) summary = 'High payment volatility risk. Consider affordability buffers or a fixed-rate alternative.';
    else if (paymentVolatility > 0.1) summary = 'Moderate volatility risk. Ensure emergency funds and stress-test your budget.';

    setRows(out);
    setOpinion(summary);
  }

  const onSubmit = (values: FormValues) => project(values);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="loanAmount" render={({ field }) => (
              <FormItem><FormLabel>Loan Amount ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="initialRatePercent" render={({ field }) => (
              <FormItem><FormLabel>Initial Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fixedYears" render={({ field }) => (
              <FormItem><FormLabel>Fixed Period (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="totalTermYears" render={({ field }) => (
              <FormItem><FormLabel>Total Term (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="indexRatePercent" render={({ field }) => (
              <FormItem><FormLabel>Index Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="marginPercent" render={({ field }) => (
              <FormItem><FormLabel>Margin (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="adjustIntervalYears" render={({ field }) => (
              <FormItem><FormLabel>Adjustment Interval (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="periodicCapPercent" render={({ field }) => (
              <FormItem><FormLabel>Periodic Cap (±% per adjustment)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lifetimeCapPercent" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Lifetime Cap (+% over initial)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Project ARM Payments</Button>
        </form>
      </Form>

      {rows && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>ARM Year-by-Year Projection</CardTitle></div>
            <CardDescription>Rates and payments adjust by caps and interval. Inputs are blank until you add your values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Rate (%)</th>
                    <th className="py-2 pr-4">Monthly Payment</th>
                    <th className="py-2 pr-4">Balance End</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.year} className="border-t">
                      <td className="py-2 pr-4">{r.year}</td>
                      <td className="py-2 pr-4">{r.ratePercent.toFixed(2)}</td>
                      <td className="py-2 pr-4">${r.monthlyPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</td>
                      <td className="py-2 pr-4">${r.balanceEnd.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <CardDescription>{opinion}</CardDescription>
            </div>
            
            {/* ARM Rate and Payment Chart */}
            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" unit="yr" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value/1000)}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'ratePercent' ? `${value.toFixed(2)}%` : `$${value.toLocaleString()}`,
                      name === 'ratePercent' ? 'Interest Rate' : 'Monthly Payment'
                    ]}
                    labelFormatter={(year) => `Year ${year}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ratePercent" 
                    name="Interest Rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="monthlyPayment" 
                    name="Monthly Payment" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other mortgage and loan calculators
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
                Calculate monthly mortgage payments for fixed-rate loans.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Loan Amortization with Extra Payments
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate loan amortization with extra payments to save interest.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-refinance-savings-calculator" className="text-primary hover:underline">
                  Mortgage Refinance Savings Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Compare your current mortgage vs a new refinance.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/graduated-payment-mortgage-calculator" className="text-primary hover:underline">
                  Graduated Payment Mortgage Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate graduated payment mortgages with increasing payments.
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
            Complete Guide to Adjustable Rate Mortgages
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
            Common questions about adjustable rate mortgages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is an Adjustable Rate Mortgage (ARM)?</h4>
            <p className="text-muted-foreground">
              An Adjustable Rate Mortgage starts with a fixed teaser rate for a limited time, then adjusts periodically based on an index plus a margin, subject to caps that limit how much the rate can change.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the index rate?</h4>
            <p className="text-muted-foreground">
              The index is a market-based reference rate (like SOFR, LIBOR, or the Prime Rate) that fluctuates over time. Lenders add a fixed margin to the index rate to determine your adjusted interest rate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are rate caps?</h4>
            <p className="text-muted-foreground">
              Rate caps limit how much your interest rate can change. A periodic cap limits the change per adjustment period, while a lifetime cap limits the total increase over the loan term. These caps protect borrowers from extreme payment increases.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">When do ARMs make sense?</h4>
            <p className="text-muted-foreground">
              ARMs can make sense if you expect to move or refinance before adjustments begin, as the lower initial rate can reduce costs. If you'll hold the loan long-term, stress test higher payments to ensure affordability.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How often do ARM rates adjust?</h4>
            <p className="text-muted-foreground">
              Adjustment intervals vary by loan but are commonly 1, 3, 5, or 7 years. After the fixed period, rates typically adjust annually based on the index plus margin, subject to caps.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between initial rate and adjusted rate?</h4>
            <p className="text-muted-foreground">
              The initial rate is the fixed teaser rate you start with. After the fixed period, the rate adjusts based on the index plus margin. The new rate cannot exceed the periodic and lifetime caps.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I prepare for payment increases?</h4>
            <p className="text-muted-foreground">
              Budget for the highest plausible payment based on caps, maintain a 3–6 month emergency fund, stress test your budget with higher payments, and consider a fixed-rate loan if payment volatility makes you uncomfortable.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I refinance an ARM to a fixed-rate loan?</h4>
            <p className="text-muted-foreground">
              Yes, you can refinance an ARM to a fixed-rate mortgage at any time. This is often done when you expect to stay in the home long-term or when fixed rates become more attractive than your current adjusted rate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if the index rate goes down?</h4>
            <p className="text-muted-foreground">
              If the index rate decreases, your ARM rate typically decreases as well (subject to floor rates and adjustment caps). This can lower your monthly payment, providing savings during periods of declining interest rates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I choose an ARM or fixed-rate mortgage?</h4>
            <p className="text-muted-foreground">
              Choose an ARM if you plan to move or refinance within the fixed period and want lower initial payments. Choose a fixed-rate mortgage if you plan to stay long-term and prefer payment stability and predictability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


