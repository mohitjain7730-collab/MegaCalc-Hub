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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Adjustable Rate Mortgage (ARM) Payment Projection and Risk Analysis" />
    <meta itemProp="description" content="An expert guide detailing the structure of ARMs (hybrid 5/1, 7/1), how payment changes are projected after the fixed period, the role of the index, margin, and payment/rate caps in determining the maximum possible payment." />
    <meta itemProp="keywords" content="adjustable rate mortgage calculator, ARM payment projection formula, index and margin ARM explained, rate caps and payment shock, fully indexed rate calculation, hybrid ARM structure" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-arm-projection-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Adjustable Rate Mortgages (ARM): Payment Projection and Risk Analysis</h1>
    <p className="text-lg italic text-muted-foreground">Master the mechanics of hybrid ARMs to forecast payment changes, analyze risk, and understand the impact of the index and margin.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#structure" className="hover:underline">ARM Structure: Fixed Period and Adjustment Period</a></li>
        <li><a href="#rate-components" className="hover:underline">The Fully Indexed Rate: Index and Margin</a></li>
        <li><a href="#payment-calc" className="hover:underline">Payment Projection Mechanics</a></li>
        <li><a href="#caps" className="hover:underline">The Critical Role of Rate Caps (Lifetime, Periodic)</a></li>
        <li><a href="#risk-assessment" className="hover:underline">Payment Shock and Financial Risk Assessment</a></li>
    </ul>
<hr />

    {/* ARM STRUCTURE: FIXED PERIOD AND ADJUSTMENT PERIOD */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ARM Structure: Fixed Period and Adjustment Period</h2>
    <p>An <strong className="font-semibold">Adjustable Rate Mortgage (ARM)</strong> is a home loan where the interest rate can fluctuate periodically based on market conditions. Modern ARMs are almost always **hybrid ARMs**, featuring an initial fixed-rate period followed by subsequent adjustment periods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hybrid ARM Notation (e.g., 5/1, 7/1)</h3>
    <p>The notation defines the schedule:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">First Number (e.g., 5):</strong> The number of years the initial interest rate is fixed (the 'Fixed Period').</li>
        <li><strong className="font-semibold">Second Number (e.g., 1):</strong> The frequency (in years) of subsequent rate adjustments (the 'Adjustment Period').</li>
    </ul>
    <p>A 5/1 ARM, for example, has a fixed rate for the first five years. Starting in year six, the rate adjusts annually for the remainder of the loan term (typically 30 years).</p>

<hr />

    {/* THE FULLY INDEXED RATE: INDEX AND MARGIN */}
    <h2 id="rate-components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Fully Indexed Rate: Index and Margin</h2>
    <p>After the initial fixed period expires, the interest rate for the ARM is determined by two critical components: the **Index** and the **Margin**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Index (The Variable Component)</h3>
    <p>The <strong className="font-semibold">Index</strong> is the external, market-driven rate used to track the cost of money. It is the variable portion of the rate. Common indices include the Secured Overnight Financing Rate (SOFR) or the Treasury Yields. Lenders choose an index that is transparent and publicly available.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Margin (The Fixed Component)</h3>
    <p>The <strong className="font-semibold">Margin</strong> is a fixed percentage point amount added to the Index. It represents the lender's profit and risk premium. The Margin is set when the loan originates and **never changes** throughout the life of the loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fully Indexed Rate Formula</h3>
    <p>The actual interest rate applied during any adjustment period (before caps) is the sum of these two components:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Fully Indexed Rate = Index Rate + Margin'}
        </p>
    </div>
    <p>For projection purposes, future payments are modeled by estimating where the Index Rate will be at the time of adjustment.</p>

<hr />

    {/* PAYMENT PROJECTION MECHANICS */}
    <h2 id="payment-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payment Projection Mechanics</h2>
    <p>Projecting the ARM payment requires tracking the loan's amortization and recalculating the payment based on the new interest rate and the remaining loan balance and term.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Amortization during the Fixed Period</h3>
    <p>During the fixed period, the loan amortizes normally using the standard loan amortization formula (Present Value of Annuity). The outstanding balance at the end of the fixed period (e.g., after 60 months for a 5/1 ARM) becomes the new principal for the first adjustment period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recalculating the Payment (PMT)</h3>
    <p>At the time of adjustment, the new payment is calculated using the new (adjusted) interest rate, the remaining principal balance, and the remaining loan term. For a 30-year ARM, if five years have passed, the new payment is calculated over the remaining 25 years (300 months).</p>
    <p>The change in the monthly payment (the **Payment Shock**) is highly sensitive to the magnitude of the rate change and the loan's remaining term.</p>

<hr />

    {/* THE CRITICAL ROLE OF RATE CAPS (LIFETIME, PERIODIC) */}
    <h2 id="caps" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Rate Caps (Lifetime, Periodic)</h2>
    <p>Rate caps are contractual limitations placed on how much the interest rate can change. They are the borrower's primary protection against excessive Payment Shock.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Initial Adjustment Cap (First Cap)</h3>
    <p>This is the maximum the rate can increase during the very first adjustment (i.e., at the end of the fixed period). This cap is often the largest (e.g., $5\%$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Periodic Adjustment Cap</h3>
    <p>This is the maximum the rate can change during any subsequent adjustment period (e.g., $1\%$ or $2\%$ per year). The new rate cannot exceed the previous period's rate plus the periodic cap, regardless of how high the Fully Indexed Rate goes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Lifetime Adjustment Cap (Ceiling)</h3>
    <p>The <strong className="font-semibold">Lifetime Cap</strong> is the most important protection. It sets the absolute highest interest rate the loan can ever reach over its entire life (e.g., Initial Rate $+ 5\%$ or $6\%$). Loan projections must calculate the **worst-case scenario** payment based on this lifetime ceiling rate.</p>

<hr />

    {/* RISK ASSESSMENT AND PAYMENT SHOCK */}
    <h2 id="risk-assessment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Assessment and Payment Shock</h2>
    <p>The primary risk of an ARM is **Payment Shock**—the sudden, dramatic increase in the monthly payment that occurs when the fixed rate period ends and the rate adjusts upward, potentially hitting the cap.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Margin of Safety</h3>
    <p>Responsible ARM usage requires projecting the payment under the **worst-case scenario** (i.e., assuming the Fully Indexed Rate jumps immediately to the Lifetime Cap). If the borrower can comfortably afford this maximum capped payment, the loan is considered relatively safe.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interest-Only and Negative Amortization ARMs</h3>
    <p>Less common but riskier ARMs include: **Interest-Only ARMs** (where principal is not paid down during the fixed period, leading to a higher balance when the payment adjusts) and **Negative Amortization ARMs** (where the monthly payment is so low that the loan balance actually increases, compounding the final Payment Shock).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Adjustable Rate Mortgage payment projection is a multi-step financial exercise that determines the potential liability after the initial fixed period expires. The adjusted rate is controlled by the **Fully Indexed Rate** (Index + Margin) but is strictly constrained by the **Periodic** and **Lifetime Caps**.</p>
    <p>Responsible use of an ARM mandates calculating the worst-case payment scenario based on the **Lifetime Cap** to quantify the maximum potential **Payment Shock** and ensure the debt remains sustainable under all future economic conditions.</p>
</section>

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


