
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, PlusCircle, XCircle, Calculator, Info, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const rateChangeSchema = z.object({
  year: z.number().int().positive(),
  rate: z.number(),
});

const formSchema = z.object({
  principal: z.number().positive(),
  term: z.number().int().positive(),
  fixedRate: z.number().positive(),
  initialFloatingRate: z.number().positive(),
  rateChanges: z.array(rateChangeSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    fixed: { totalInterest: number, monthlyPayment: number },
    floating: { totalInterest: number },
    chartData: { year: number, fixedInterest: number, floatingInterest: number }[]
}

export default function FixedVsFloatingRateCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 0,
      term: 0,
      fixedRate: 0,
      initialFloatingRate: 0,
      rateChanges: [{ year: 0, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rateChanges",
  });

  const calculateAmortization = (
      principal: number,
      termYears: number,
      initialRate: number,
      rateChanges: { year?: number; rate?: number }[] = []
  ) => {
      const n = termYears * 12;
      let balance = principal;
      let totalInterest = 0;
      let monthlyPayment = 0;
      const interestPaidByYear: number[] = Array(termYears).fill(0);
      
      let currentRate = initialRate / 100 / 12;

      for (let i = 0; i < n; i++) {
          const year = Math.floor(i / 12) + 1;
          const rateChange = rateChanges.find(rc => rc.year === year);
          if (rateChange && rateChange.rate !== undefined && i % 12 === 0) {
              currentRate = rateChange.rate / 100 / 12;
          }
          
          if(i === 0 || (rateChange && rateChange.rate !== undefined && i % 12 === 0)) {
            const remainingPeriods = n - i;
            if (currentRate > 0) {
                monthlyPayment = balance * (currentRate * Math.pow(1 + currentRate, remainingPeriods)) / (Math.pow(1 + currentRate, remainingPeriods) - 1);
            } else {
                monthlyPayment = balance / remainingPeriods;
            }
          }

          const interest = balance * currentRate;
          const principalPaid = monthlyPayment - interest;
          balance -= principalPaid;
          totalInterest += interest;
          interestPaidByYear[year - 1] += interest;
      }
      
      return { totalInterest, monthlyPayment, interestPaidByYear };
  };

  const onSubmit = (values: FormValues) => {
    const validRateChanges = values.rateChanges.filter(rc => rc.year && rc.rate !== undefined) as { year: number; rate: number }[];
    const fixedRateData = calculateAmortization(values.principal, values.term, values.fixedRate);
    const floatingRateData = calculateAmortization(values.principal, values.term, values.initialFloatingRate, validRateChanges);

    const chartData = Array.from({ length: values.term }, (_, i) => ({
        year: i + 1,
        fixedInterest: parseFloat(fixedRateData.interestPaidByYear.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(0)),
        floatingInterest: parseFloat(floatingRateData.interestPaidByYear.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(0)),
    }));

    setResult({
        fixed: { totalInterest: fixedRateData.totalInterest, monthlyPayment: fixedRateData.monthlyPayment },
        floating: { totalInterest: floatingRateData.totalInterest },
        chartData
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fixed vs Floating Rate Comparison
          </CardTitle>
          <CardDescription>
            Enter loan details and compare fixed vs floating rate options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    control={form.control} 
                    name="principal" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Principal ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 300000"
                            {...field} 
                            value={field.value || ''} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  <FormField 
                    control={form.control} 
                    name="term" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Term (Years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 30"
                            {...field} 
                            value={field.value || ''} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fixed Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField 
                      control={form.control} 
                      name="fixedRate" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="e.g., 4.5"
                              {...field} 
                              value={field.value || ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Floating Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField 
                      control={form.control} 
                      name="initialFloatingRate" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Annual Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="e.g., 3.5"
                              {...field} 
                              value={field.value || ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    <div>
                      <FormLabel>Projected Rate Changes</FormLabel>
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center mt-2">
                          <FormField 
                            control={form.control} 
                            name={`rateChanges.${index}.year`} 
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs">In Year</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 2"
                                    {...field} 
                                    value={field.value || ''} 
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                  />
                                </FormControl>
                              </FormItem>
                            )} 
                          />
                          <FormField 
                            control={form.control} 
                            name={`rateChanges.${index}.rate`} 
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs">New Rate (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any"
                                    placeholder="e.g., 4.0"
                                    {...field} 
                                    value={field.value || ''} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                              </FormItem>
                            )} 
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)} 
                            className="self-end"
                          >
                            <XCircle className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => append({ year: 0, rate: 0 })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Rate Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button type="submit" className="w-full">Compare Scenarios</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Handshake className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Comparison Results</CardTitle>
                <CardDescription>Fixed vs floating rate cost comparison</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <CardDescription>Fixed Rate Scenario</CardDescription>
                <p className="text-2xl font-bold mt-2">${result.fixed.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Interest Paid</p>
                <p className="text-sm mt-2">Monthly Payment: <span className="font-semibold">${result.fixed.monthlyPayment.toFixed(2)}</span></p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <CardDescription>Floating Rate Scenario</CardDescription>
                <p className="text-2xl font-bold mt-2">${result.floating.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Interest Paid</p>
                <p className="text-sm mt-2">Difference: <span className="font-semibold text-primary">${(result.fixed.totalInterest - result.floating.totalInterest).toFixed(2)}</span></p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" unit=" yr" />
                  <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" name="Fixed Rate Interest" dataKey="fixedInterest" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                  <Line type="monotone" name="Floating Rate Interest" dataKey="floatingInterest" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
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
            <h4 className="font-semibold text-foreground mb-2">Loan Principal and Term</h4>
            <p className="text-muted-foreground">
              Enter the loan amount you're considering and the repayment period in years. These values are the same for both fixed and floating rate scenarios to enable an accurate comparison.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Fixed Rate</h4>
            <p className="text-muted-foreground">
              Enter the annual interest rate offered for a fixed-rate loan. This rate will remain constant throughout the entire loan term, providing payment predictability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Floating Rate - Initial Rate</h4>
            <p className="text-muted-foreground">
              Enter the starting annual interest rate for the adjustable/floating rate loan. This is typically lower than fixed rates, creating an initial payment advantage.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Rate Changes</h4>
            <p className="text-muted-foreground">
              Specify when and how the floating rate changes over time. Enter the year when each change occurs (e.g., "2" for year 2) and the new interest rate. You can add multiple rate changes to model different future scenarios and assess the impact on total loan cost.
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
            Explore other loan and interest rate calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/amortization-schedule-generator" className="text-primary hover:underline">
                  Amortization Schedule Generator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Generate a detailed payment schedule showing how your loan balance decreases over time.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                  Loan EMI Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your monthly installment (EMI) for loans with different interest rates and terms.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Amortization with Extra Payments
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate how extra payments can reduce your loan term and total interest paid.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments including principal, interest, taxes, and insurance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Fixed vs. Floating Interest Rates: Risk, Payment Structure, and Comparison Analysis" />
    <meta itemProp="description" content="An expert guide detailing the key differences between fixed and floating interest rates, how payments are calculated under each, the allocation of interest rate risk, and the impact of market movements on total cost and monthly cash flow." />
    <meta itemProp="keywords" content="fixed vs floating rate comparison, interest rate risk analysis, adjustable rate mortgage vs fixed, variable interest rate calculation, payment stability risk, loan cash flow analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-fixed-vs-floating-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Fixed vs. Floating Interest Rates: Risk, Stability, and Cost Analysis</h1>
    <p className="text-lg italic text-gray-700">Master the core difference between stable, predictable payments and flexible, market-driven financing, and how to choose the right structure for your risk profile.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#structure" className="hover:underline">Rate Structure: Fixed vs. Floating Defined</a></li>
        <li><a href="#payment-calc" className="hover:underline">Payment Calculation and Stability</a></li>
        <li><a href="#risk-transfer" className="hover:underline">Interest Rate Risk Allocation</a></li>
        <li><a href="#pricing-mechanics" className="hover:underline">Pricing Mechanics: Index and Margin</a></li>
        <li><a href="#comparison-criteria" className="hover:underline">Choosing the Optimal Rate Structure</a></li>
    </ul>
<hr />

    {/* RATE STRUCTURE: FIXED VS. FLOATING DEFINED */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rate Structure: Fixed vs. Floating Defined</h2>
    <p>Interest rates are the cost of borrowing money. The fundamental choice in nearly all debt instruments—from mortgages to corporate bonds—is whether that rate should be fixed for the life of the loan or allowed to vary with the market.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fixed Interest Rate</h3>
    <p>A **Fixed Rate** remains constant for the entire duration of the loan. The initial interest rate is determined at the loan's origination and is not subject to any external market fluctuations. This provides the borrower with absolute certainty regarding their monthly principal and interest payment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Floating (Variable) Interest Rate</h3>
    <p>A **Floating Rate** (or Variable Rate) changes periodically (e.g., monthly, quarterly, or annually) based on movements in an external, publicly observable benchmark rate (the Index). The borrower's rate consists of the Index plus a fixed premium (the Margin).</p>
    <p>Examples include Adjustable Rate Mortgages (ARMs), credit cards, and many corporate loans based on the Secured Overnight Financing Rate (SOFR).</p>

<hr />

    {/* PAYMENT CALCULATION AND STABILITY */}
    <h2 id="payment-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payment Calculation and Stability</h2>
    <p>The choice of rate structure directly impacts the predictability and stability of the borrower's monthly cash flow, which is calculated using the standard loan amortization formula.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stability of Fixed Rate Payments</h3>
    <p>For a fixed-rate loan, the monthly Principal and Interest (P&I) payment remains constant for the life of the loan (e.g., 360 payments for a 30-year mortgage). While the split between principal and interest changes monthly due to amortization, the total payment amount does not, providing maximum budget stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Volatility of Floating Rate Payments</h3>
    <p>For a floating-rate loan, the payment must be recalculated at every adjustment interval based on the current interest rate. A 1% increase in the benchmark rate will lead to an immediate and permanent increase in the borrower's monthly payment. This creates **Payment Volatility** and makes future budgeting uncertain.</p>

<hr />

    {/* INTEREST RATE RISK ALLOCATION */}
    <h2 id="risk-transfer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interest Rate Risk Allocation</h2>
    <p>The key financial difference between the two structures is who bears the **Interest Rate Risk**—the risk that market rates will move against the borrower's best interests.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fixed Rate: Lender Bears Risk</h3>
    <p>The lender bears the risk that interest rates will rise. If market rates increase after the loan is issued, the lender is stuck receiving a lower rate until maturity. The borrower, having locked in the rate, is protected from rising costs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Floating Rate: Borrower Bears Risk</h3>
    <p>The borrower bears the risk that interest rates will rise. If market rates increase, the borrower's payment increases immediately. The lender is protected from market risk because they receive a higher return when their cost of capital rises. The borrower is often compensated for taking this risk with a lower initial interest rate.</p>

<hr />

    {/* PRICING MECHANICS: INDEX AND MARGIN */}
    <h2 id="pricing-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pricing Mechanics: Index and Margin</h2>
    <p>The rate for a floating loan is determined by two components, whereas a fixed rate is determined by the lender's forecast of future rates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Floating Rate Components</h3>
    <p>The actual rate is the sum of a variable **Index** (the publicly observed benchmark, e.g., SOFR) and the fixed **Margin** (the premium added by the lender).</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Floating Rate = Index Rate + Margin'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fixed Rate Pricing</h3>
    <p>To set a fixed rate, the lender must factor in their **cost of capital** plus a **premium** for the risk they are assuming (the risk that rates will rise). This premium often makes the initial fixed rate higher than the initial floating rate, acting as an insurance cost for the borrower's payment stability.</p>

<hr />

    {/* CHOOSING THE OPTIMAL RATE STRUCTURE */}
    <h2 id="comparison-criteria" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Choosing the Optimal Rate Structure</h2>
    <p>The decision to choose a fixed or floating rate depends heavily on the borrower's risk tolerance, financial forecast, and intended loan duration.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Choose Fixed Rate</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**High Risk Aversion:** When budget predictability is the highest priority (e.g., first-time homebuyers with strict budgets).</li>
        <li>**Long Duration:** For loans where the borrower intends to hold the debt for a long time (e.g., 30-year mortgage), locking in the rate provides long-term stability.</li>
        <li>**Rising Rate Environment:** When the prevailing economic forecast suggests that market interest rates are likely to increase.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Choose Floating Rate</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Short Duration:** When the borrower plans to pay off or refinance the debt quickly, minimizing the exposure to potential rate increases.</li>
        <li>**Falling Rate Environment:** When the economic forecast suggests interest rates are likely to decline, benefiting from the lower rates without refinancing.</li>
        <li>**High Risk Tolerance:** When the borrower can comfortably absorb a potentially significant increase in the monthly payment.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The comparison between fixed and floating interest rates centers on the allocation of **interest rate risk**. The fixed rate provides payment stability by transferring the risk to the lender, while the floating rate offers a lower initial cost by transferring the risk to the borrower.</p>
    <p>Optimal selection requires the borrower to compare the initial **fixed rate premium** (the insurance cost) against the risk of **payment volatility** inherent in the floating rate's reliance on the fluctuating market index.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about fixed vs. floating interest rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between fixed and floating rates?</h4>
            <p className="text-muted-foreground">
              Fixed rates remain constant throughout the loan term, providing payment stability and predictability. Floating (adjustable) rates can change periodically based on market conditions, potentially offering lower initial payments but with payment uncertainty. Fixed rates are typically higher initially but protect against rate increases.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">When should I choose a fixed rate?</h4>
            <p className="text-muted-foreground">
              Choose fixed rates when you prioritize payment stability, can afford slightly higher initial payments, want protection against rate increases, have a fixed budget, and prefer predictable financial planning. Fixed rates are ideal for long-term loans when you want certainty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">When should I choose a floating rate?</h4>
            <p className="text-muted-foreground">
              Choose floating rates when you expect rates to stay low or decline, can handle payment variability, plan to pay off the loan quickly, or when initial lower payments are important. Floating rates offer initial savings but require tolerance for payment fluctuations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How often can floating rates change?</h4>
            <p className="text-muted-foreground">
              Floating rates typically adjust annually, but specific terms vary by loan. Common adjustment periods include monthly, quarterly, semi-annually, or annually. Review your loan agreement for the adjustment frequency, rate caps, and how changes are calculated. Most loans have caps limiting maximum rate changes per period and over the loan life.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What factors influence rate changes?</h4>
            <p className="text-muted-foreground">
              Floating rates are typically tied to benchmark rates like LIBOR, SOFR, or prime rates, plus a margin. Changes in these benchmarks, driven by central bank policies, inflation expectations, economic conditions, and market demand, directly impact your rate. Your credit rating may affect the margin but not the benchmark movements.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are rate caps in adjustable-rate loans?</h4>
            <p className="text-muted-foreground">
              Rate caps limit how much your interest rate can change. Periodic caps limit changes at each adjustment (e.g., 2% per year), lifetime caps limit total increases over the loan term (e.g., 5% above initial rate), and payment caps limit monthly payment increases but may extend the loan term. Caps provide some protection against extreme rate increases.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I switch between fixed and floating rates?</h4>
            <p className="text-muted-foreground">
              Some lenders offer conversion options allowing you to switch between fixed and floating rates during the loan term, usually for a fee. Alternatively, you can refinance into a different rate type, but this involves closing costs and requalification. Evaluate the costs and potential savings before converting or refinancing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I predict floating rate movements?</h4>
            <p className="text-muted-foreground">
              Predicting rate movements is inherently uncertain. Consider economic forecasts, central bank guidance, yield curves, inflation expectations, and historical patterns. Use this calculator with different rate change scenarios to assess best-case, worst-case, and moderate outcomes. Don't rely solely on predictions—ensure you can handle potential rate increases.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Which rate type offers lower total cost?</h4>
            <p className="text-muted-foreground">
              Total cost depends on actual rate movements over time. If rates remain stable or decline, floating rates typically cost less. If rates increase significantly, fixed rates may be cheaper. Use this calculator with realistic rate change projections to compare scenarios. The lower total cost depends on future economic conditions you cannot predict with certainty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What questions should I ask before choosing?</h4>
            <p className="text-muted-foreground">
              Ask about rate caps (periodic and lifetime), initial rate vs. fully indexed rate, adjustment frequency, rate index used, margin amount, conversion options, prepayment penalties, maximum payment increase limits, and how payments change when rates adjust. Compare total costs under different scenarios using this calculator to make an informed decision that aligns with your risk tolerance and financial goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
