'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';

const formSchema = z.object({
  annualIncome: z.number().min(0).optional(),
  monthlyDebts: z.number().min(0).optional(),
  downPayment: z.number().min(0).optional(),
  interestRate: z.number().min(0).optional(), // % APR
  termYears: z.number().min(1).max(40).optional(),
  propertyTaxRate: z.number().min(0).optional(), // % of price per year
  insuranceAnnual: z.number().min(0).optional(),
  hoaMonthly: z.number().min(0).optional(),
  targetHousingDTI: z.number().min(1).max(60).optional(), // % of gross income
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  maxAffordablePrice: number;
  affordablePrincipal: number;
  monthlyBudget: number;
  assumedMonthlyTaxes: number;
  assumedMonthlyInsurance: number;
  hoaMonthly: number;
  mortgagePayment: number;
  interpretation: string;
};

export default function HomeAffordabilityCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [rateScenario, setRateScenario] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualIncome: undefined as unknown as number,
      monthlyDebts: undefined as unknown as number,
      downPayment: undefined as unknown as number,
      interestRate: undefined as unknown as number,
      termYears: undefined as unknown as number,
      propertyTaxRate: undefined as unknown as number,
      insuranceAnnual: undefined as unknown as number,
      hoaMonthly: undefined as unknown as number,
      targetHousingDTI: undefined as unknown as number,
    },
  });

  const num = (placeholder: string, field: any) => (
    <Input
      type="number"
      step="0.01"
      placeholder={placeholder}
      {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={(e) => {
        const v = e.target.value;
        const n = v === '' ? undefined : Number(v);
        field.onChange(Number.isFinite(n as any) ? n : undefined);
      }}
    />
  );

  function pmt(monthlyRate: number, n: number, principal: number): number {
    if (monthlyRate === 0) return principal / n;
    const r = monthlyRate;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function solveMaxPrice(budget: number, downPayment: number, ratePct: number, years: number, taxRatePct: number, insuranceMonthly: number, hoa: number): { price: number; principal: number; mortgagePayment: number; taxesMonthly: number } {
    // Binary search on price
    let lo = 0, hi = 10_000_000; // generous upper bound
    const r = ratePct / 100 / 12;
    const n = years * 12;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const principal = Math.max(mid - (downPayment || 0), 0);
      const taxesMonthly = (taxRatePct / 100) * mid / 12;
      const m = pmt(r, n, principal);
      const total = m + taxesMonthly + insuranceMonthly + (hoa || 0);
      if (total <= budget) lo = mid; else hi = mid;
    }
    const price = lo;
    const principal = Math.max(price - (downPayment || 0), 0);
    const taxesMonthly = (taxRatePct / 100) * price / 12;
    const mortgagePayment = pmt(r, n, principal);
    return { price, principal, mortgagePayment, taxesMonthly };
  }

  const onSubmit = (v: FormValues) => {
    if (v.annualIncome === undefined || v.monthlyDebts === undefined || v.interestRate === undefined || v.termYears === undefined || v.propertyTaxRate === undefined || v.insuranceAnnual === undefined || v.targetHousingDTI === undefined) {
      setResult(null);
      return;
    }
    const monthlyIncome = (v.annualIncome || 0) / 12;
    const housingCap = (v.targetHousingDTI / 100) * monthlyIncome; // e.g., 28%
    const totalCap = 0.36 * monthlyIncome - (v.monthlyDebts || 0); // 36/43 rules simplified
    const monthlyBudget = Math.max(0, Math.min(housingCap, totalCap));
    const insuranceMonthly = (v.insuranceAnnual || 0) / 12;
    const solved = solveMaxPrice(monthlyBudget, v.downPayment || 0, v.interestRate, v.termYears, v.propertyTaxRate, insuranceMonthly, v.hoaMonthly || 0);

    const ratioDown = solved.price > 0 ? ((v.downPayment || 0) / solved.price) * 100 : 0;
    let interpretation = `With a monthly housing budget of $${monthlyBudget.toFixed(0)}, you can afford a home priced around $${solved.price.toFixed(0)}. This assumes a ${v.termYears}-year loan at ${v.interestRate.toFixed(2)}% APR, property taxes at ${v.propertyTaxRate.toFixed(2)}%/yr, $${(v.insuranceAnnual || 0).toFixed(0)}/yr insurance, and $${(v.hoaMonthly || 0).toFixed(0)}/mo HOA.`;
    interpretation += ` Your implied down payment ratio is ${ratioDown.toFixed(1)}%.`;

    setResult({
      maxAffordablePrice: solved.price,
      affordablePrincipal: solved.principal,
      monthlyBudget,
      assumedMonthlyTaxes: solved.taxesMonthly,
      assumedMonthlyInsurance: insuranceMonthly,
      hoaMonthly: v.hoaMonthly || 0,
      mortgagePayment: solved.mortgagePayment,
      interpretation,
    });
  };

  const scenarioPreview = useMemo(() => {
    if (!result) return null;
    if (rateScenario === null) return null;
    // recompute with a tweaked interest rate
    const insuranceMonthly = result.assumedMonthlyInsurance;
    const solved = solveMaxPrice(result.monthlyBudget, result.maxAffordablePrice - result.affordablePrincipal, rateScenario, (form.getValues('termYears') || 30) as number, (form.getValues('propertyTaxRate') || 1.2) as number, insuranceMonthly, (form.getValues('hoaMonthly') || 0) as number);
    return {
      rate: rateScenario,
      price: solved.price,
      payment: solved.mortgagePayment,
    };
  }, [rateScenario, result]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Home Affordability Calculator</CardTitle>
          <CardDescription>Estimate the maximum home price you can afford based on income, debts, down payment, and loan terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="annualIncome" render={({ field }) => (<FormItem><FormLabel>Annual Gross Income ($)</FormLabel><FormControl>{num('e.g., 120000', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="monthlyDebts" render={({ field }) => (<FormItem><FormLabel>Monthly Debts ($)</FormLabel><FormControl>{num('e.g., 600', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="downPayment" render={({ field }) => (<FormItem><FormLabel>Down Payment ($)</FormLabel><FormControl>{num('e.g., 80000', field)}</FormControl><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="interestRate" render={({ field }) => (<FormItem><FormLabel>Interest Rate (% APR)</FormLabel><FormControl>{num('e.g., 6.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="termYears" render={({ field }) => (<FormItem><FormLabel>Loan Term (years)</FormLabel><FormControl>{num('e.g., 30', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="propertyTaxRate" render={({ field }) => (<FormItem><FormLabel>Property Tax Rate (%/yr)</FormLabel><FormControl>{num('e.g., 1.2', field)}</FormControl><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="insuranceAnnual" render={({ field }) => (<FormItem><FormLabel>Home Insurance ($/yr)</FormLabel><FormControl>{num('e.g., 1200', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="hoaMonthly" render={({ field }) => (<FormItem><FormLabel>HOA Dues ($/mo)</FormLabel><FormControl>{num('e.g., 0', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="targetHousingDTI" render={({ field }) => (<FormItem><FormLabel>Target Housing DTI (% of income)</FormLabel><FormControl>{num('e.g., 28', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Detailed interpretation and interactive rate scenario.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Max Affordable Price</div>
                <div className="text-2xl font-semibold">${result.maxAffordablePrice.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Mortgage Payment</div>
                <div className="text-2xl font-semibold">${result.mortgagePayment.toFixed(0)}/mo</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">All-in Housing Budget</div>
                <div className="text-2xl font-semibold">${result.monthlyBudget.toFixed(0)}/mo</div>
              </div>
            </div>

            <p className="text-sm leading-6">{result.interpretation}</p>

            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What-if: interest rate scenario</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[result && (form.getValues('interestRate') as number) - 1, form.getValues('interestRate') as number, (form.getValues('interestRate') as number) + 1].map((r, idx) => (
                  <Button key={idx} variant={rateScenario===r? 'default':'secondary'} onClick={() => setRateScenario(r!)}>
                    {r!.toFixed(2)}% APR
                  </Button>
                ))}
              </div>
              {scenarioPreview && (
                <div className="mt-3 text-sm">
                  At {scenarioPreview.rate.toFixed(2)}% APR, affordable price ≈ ${scenarioPreview.price.toFixed(0)} with est. payment ${scenarioPreview.payment.toFixed(0)}/mo.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Use conservative assumptions. Lenders often look for 28/36 DTI thresholds.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Target housing DTI sets your budget; lowering it adds a safety buffer.</li>
            <li>Taxes, insurance, and HOA are included to avoid overestimating affordability.</li>
            <li>Try the rate scenario buttons to see sensitivity to rate moves.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Home financing and affordability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">Mortgage Payment</a></h4><p className="text-sm text-muted-foreground">Monthly principal and interest.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/loan-to-value-ltv-ratio-calculator" className="text-primary hover:underline">Loan‑to‑Value (LTV)</a></h4><p className="text-sm text-muted-foreground">Leverage vs property value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rent-vs-buy-home-calculator" className="text-primary hover:underline">Rent vs Buy</a></h4><p className="text-sm text-muted-foreground">Compare ownership to renting.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/house-down-payment-savings-calculator" className="text-primary hover:underline">Down Payment Savings</a></h4><p className="text-sm text-muted-foreground">Plan contributions to reach your goal.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>SEO‑oriented answers about home affordability and mortgage budgeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a good debt‑to‑income (DTI) ratio for buying a house?</h4><p className="text-muted-foreground">Many lenders prefer ≤28% for housing costs and ≤36% total DTI. Some programs allow higher DTIs with compensating factors, but lower DTIs generally qualify you for better rates and reduce payment stress.</p></div>
          <div><h4 className="font-semibold mb-2">Does this calculator include taxes, insurance, and HOA fees?</h4><p className="text-muted-foreground">Yes. We factor property taxes, insurance, and optional HOA dues into your monthly budget so the maximum home price estimate is more realistic than principal‑and‑interest only calculations.</p></div>
          <div><h4 className="font-semibold mb-2">How does interest rate change affect affordability?</h4><p className="text-muted-foreground">Higher rates increase the mortgage payment for the same principal, lowering the home price you can afford. Use the built‑in rate scenario buttons to see how a ±1% change impacts price and payment.</p></div>
          <div><h4 className="font-semibold mb-2">What down payment should I target?</h4><p className="text-muted-foreground">20% typically avoids mortgage insurance and results in lower monthly payments. However, many buyers purchase successfully with 3–10% down; the trade‑off is higher LTV, possible mortgage insurance, and sensitivity to market changes.</p></div>
          <div><h4 className="font-semibold mb-2">Are closing costs included?</h4><p className="text-muted-foreground">No. Closing costs (often 2–5% of the purchase price) are not part of the calculation. Budget for them separately along with reserves for maintenance and emergency expenses.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate are property tax and insurance estimates?</h4><p className="text-muted-foreground">Property tax rates and insurance premiums vary by location and property type. Use your county’s rate and a quote from your insurer for best accuracy. Conservative inputs help avoid budget surprises.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use gross or net income for affordability?</h4><p className="text-muted-foreground">Lenders typically evaluate DTI against gross income. For personal budgeting, you may prefer net income to account for taxes and retirement contributions, which yields a more conservative affordability estimate.</p></div>
          <div><h4 className="font-semibold mb-2">What loan term is best: 15 vs 30 years?</h4><p className="text-muted-foreground">15‑year loans have higher payments but lower total interest and often better rates; 30‑year loans maximize monthly affordability. Choose based on cash‑flow comfort and your long‑term financial goals.</p></div>
          <div><h4 className="font-semibold mb-2">How does PMI affect my budget?</h4><p className="text-muted-foreground">With down payments under ~20%, private mortgage insurance (PMI) may apply and increase the monthly payment. This calculator doesn’t include PMI; consider it in your budget if your LTV is high.</p></div>
          <div><h4 className="font-semibold mb-2">Can I qualify for more than I’m comfortable paying?</h4><p className="text-muted-foreground">Yes—pre‑approvals can exceed your personal comfort. Use this calculator to set a limit aligned with your risk tolerance, savings goals, and lifestyle rather than stretching to the lender’s maximum.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


