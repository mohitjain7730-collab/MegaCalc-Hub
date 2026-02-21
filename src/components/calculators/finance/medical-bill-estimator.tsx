'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, DollarSign, Activity, Shield, PieChart as PieChartIcon, Info, Stethoscope } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  procedureCost: z.number().positive('The cost of the procedure is required.'),
  deductibleRemaining: z.number().nonnegative('Remaining deductible cannot be negative.'),
  coinsurance: z.number().min(0).max(100, 'Coinsurance must be between 0 and 100.'),
  outOfPocketMaxRemaining: z.number().positive('Remaining out-of-pocket max is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  youPay: number;
  insurancePays: number;
  paidToDeductible: number;
  paidInCoinsurance: number;
  totalProcedureCost: number;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const COLORS = {
  YouPay: 'hsl(var(--destructive))',
  InsurancePays: 'hsl(var(--chart-2))',
  Deductible: 'hsl(var(--chart-4))',
  Coinsurance: 'hsl(var(--chart-5))',
};

export default function MedicalBillEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procedureCost: undefined,
      deductibleRemaining: undefined,
      coinsurance: undefined,
      outOfPocketMaxRemaining: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { procedureCost, deductibleRemaining, coinsurance, outOfPocketMaxRemaining } = values;

    let youPay = 0;
    let costAfterDeductible = procedureCost;

    // 1. Pay towards remaining deductible
    const paidToDeductible = Math.min(procedureCost, deductibleRemaining);
    youPay += paidToDeductible;
    costAfterDeductible -= paidToDeductible;

    // 2. Pay coinsurance on the rest
    let paidInCoinsurance = 0;
    if (costAfterDeductible > 0) {
      paidInCoinsurance = costAfterDeductible * (coinsurance / 100);
      youPay += paidInCoinsurance;
    }

    // 3. Your payment is capped by your remaining out-of-pocket max
    if (youPay > outOfPocketMaxRemaining) {
      youPay = outOfPocketMaxRemaining;
    }

    // Recalculate paid in coinsurance based on the capped `youPay`
    paidInCoinsurance = Math.max(0, youPay - paidToDeductible);

    const insurancePays = Math.max(0, procedureCost - youPay);

    setResult({
      youPay,
      insurancePays,
      paidToDeductible,
      paidInCoinsurance,
      totalProcedureCost: procedureCost,
    });
  };

  const chartData = result
    ? [
      { name: 'Portion of Bill', 'You Pay': result.youPay, 'Insurance Pays': result.insurancePays },
    ]
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Medical Bill Estimator
          </CardTitle>
          <CardDescription>
            Estimate your out-of-pocket cost for a specific medical procedure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="procedureCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Cost of Procedure
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 8000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deductibleRemaining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Remaining Deductible
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coinsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        Coinsurance (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outOfPocketMaxRemaining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Remaining Out-of-Pocket Max
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 4000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate My Bill
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Estimated Bill Breakdown</CardTitle>
              <CardDescription>
                For a procedure costing ${formatNumberUS(result.totalProcedureCost, { maximumFractionDigits: 0 })}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                      formatter={(value, name) => [formatNumberUS(value as number), name.toString().replace(/([A-Z])/g, ' $1').trim()]}
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                    <Bar dataKey="You Pay" stackId="a" fill={COLORS.YouPay} />
                    <Bar dataKey="Insurance Pays" stackId="a" fill={COLORS.InsurancePays} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">You Pay (Total)</h4>
                  <p className="text-3xl font-bold" style={{ color: COLORS.YouPay }}>{formatNumberUS(result.youPay)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Paid to Deductible</h4>
                  <p className="text-xl font-bold">{formatNumberUS(result.paidToDeductible)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Paid in Coinsurance</h4>
                  <p className="text-xl font-bold">{formatNumberUS(result.paidInCoinsurance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                  <li>Your remaining deductible is the first part of your bill. Once it's paid, your coinsurance begins.</li>
                  <li>Your total payment is protected by your remaining out-of-pocket maximum, preventing catastrophic costs for a single procedure.</li>
                  <li>This estimate is for in-network providers. Out-of-network costs would be significantly higher.</li>
                  <li>After this procedure, your remaining deductible and out-of-pocket max for the year will be lower.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">Confirm Costs:</span> Before the procedure, get a written cost estimate from the provider and confirm coverage with your insurer.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Check Network Status:</span> Double-check that the facility, the doctor, the anesthesiologist, and any labs are all in-network.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Plan for Payment:</span> If the estimated cost is high, ask the hospital's billing department about payment plans or financial assistance options in advance.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Total Cost of Procedure</h4>
              <p className="text-muted-foreground">The full, undiscounted price of the medical service. You can often get this from the provider's billing department.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Remaining Deductible</h4>
              <p className="text-muted-foreground">How much of your annual deductible you still have to pay. Check your insurer's portal for this amount.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Coinsurance (%)</h4>
              <p className="text-muted-foreground">The percentage of the bill you pay after your deductible is met.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Remaining Out-of-Pocket Max</h4>
              <p className="text-muted-foreground">The maximum amount you have left to pay for the year. This is your ultimate financial protection.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/finance/compound-interest-calculator" className="hover:underline">Compound Interest Calculator</Link></li>
              <li><Link href="/finance/return-on-investment-calculator" className="hover:underline">Return on Investment (ROI) Calculator</Link></li>
              <li><Link href="/finance/monthly-budget-planner-calculator" className="hover:underline">Monthly Budget Planner</Link></li>
              <li><Link href="/finance/emergency-fund-requirement-calculator" className="hover:underline">Emergency Fund Requirement Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Decoding Your Medical Bill: A Step-by-Step Guide to Estimating Costs</h1>
          <p className="text-lg italic">Gain clarity and confidence before your next medical procedure by learning how to accurately estimate what you'll owe.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Medical Bill Estimation Matters</h2>
          <p>In the U.S. healthcare system, the price you see is rarely the price you pay. Your health insurance dramatically changes your financial responsibility, but navigating the details can be confusing. By estimating your bill beforehand, you can avoid financial shocks, budget effectively, and make more informed decisions about your care. This calculator breaks down the process based on the four key elements of your insurance plan.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Calculation Waterfall: How Your Bill Is Determined</h2>
          <p>Your financial responsibility for a medical bill is calculated in a specific order, like a waterfall. Money flows from one bucket to the next until the bill is settled.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Step 1: The Deductible Bucket</strong>
              <p>Before your insurance pays for most services, you must first satisfy your deductible. Any money you spend on the procedure will first go toward your <strong className="text-foreground">Remaining Deductible</strong>. If the procedure costs $5,000 and you have $1,000 of your deductible left, you will pay that $1,000 first. The remaining $4,000 of the bill flows to the next step.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Step 2: The Coinsurance Split</strong>
              <p>After your deductible is met, you and your insurance company start sharing the cost. This is where <strong className="text-foreground">Coinsurance</strong> comes in. If your coinsurance is 20%, you are responsible for 20% of the remaining bill, and your insurer covers 80%. Using the example above, you would owe 20% of $4,000, which is $800.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Step 3: The Out-of-Pocket Max Safety Net</strong>
              <p>Your <strong className="text-foreground">Remaining Out-of-Pocket Maximum</strong> is the most critical number for your financial protection. It's the absolute limit on what you can be required to pay for covered, in-network care in a year. In our example, your total payment would be $1,000 (deductible) + $800 (coinsurance) = $1,800. If your remaining OOPM was only $1,500, your payment would be capped at $1,500. You would not owe the extra $300.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Step 4: Insurance Pays the Rest</strong>
              <p>Whatever is left of the bill after your payment (capped by the OOPM) is the responsibility of the insurance company. This is the primary value of having health insurance.</p>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Crucial Factors That Can Change the Estimate</h2>
          <p>An estimate is only as good as the information you provide. Here are critical factors to be aware of:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>In-Network vs. Out-of-Network:</strong> This is the most important factor. The estimates from this calculator are only valid for <strong className="text-foreground">in-network</strong> providers. If any part of your care is out-of-network (e.g., the surgeon is in-network but the anesthesiologist is not), you could be responsible for the entire bill for that service, and it may not count toward your in-network deductible or OOPM.</li>
            <li><strong>Allowed Amount:</strong> This is a key term. It's the maximum amount an insurance company will pay for a covered health care service. Providers in-network agree to accept this amount. The "procedure cost" you should use for this calculator is the allowed amount, not the provider's initial "list price." You can get this from your insurer or the provider's billing office.</li>
            <li><strong>Non-Covered Services:</strong> Not every medical service is covered by insurance. If a procedure is deemed experimental or not medically necessary by your insurer, you could be responsible for 100% of the cost. Always seek pre-authorization for major procedures.</li>
          </ul>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I find the total cost of a procedure?</h4>
              <p className="text-muted-foreground">Start by asking the provider's billing office for the CPT code (a 5-digit code for the procedure). Then, call your insurance company with the CPT code and the provider's name. Ask them for the "negotiated rate" or "allowed amount" for that service. Many insurers also have online price transparency tools.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if the surgeon is in-network but the hospital isn't?</h4>
              <p className="text-muted-foreground">This is a common "surprise billing" scenario. You would be responsible for the hospital's out-of-network charges, which can be massive. It is critical to verify that the <strong className="text-foreground">facility itself</strong> is in-network, in addition to your main doctor.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I track my remaining deductible?</h4>
              <p className="text-muted-foreground">Your insurance company's online portal is the best place for this. It should provide real-time updates on how much of your deductible and out-of-pocket maximum you have met for the year. You can also find this information on your Explanation of Benefits (EOB) statements.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does this calculator work for prescriptions?</h4>
              <p className="text-muted-foreground">It can, but many insurance plans have a separate prescription drug deductible and cost-sharing structure (e.g., drug tiers with different copays). This calculator is most accurate for medical services like doctor visits, tests, and surgeries.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is an "Explanation of Benefits" (EOB)?</h4>
              <p className="text-muted-foreground">An EOB is <strong className="text-foreground">not a bill</strong>. It's a statement sent by your health insurance company after you receive care, explaining what was covered and what you might owe. Always compare your final bill from the provider to the EOB to check for discrepancies.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Can I negotiate my medical bill?</h4>
              <p className="text-muted-foreground">Yes, especially if you are paying out-of-pocket. You can often negotiate a lower "cash price" with providers. Even with insurance, if you are facing a large bill, you can always contact the hospital's billing department to ask for a reduction or an interest-free payment plan.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a clear estimate of your financial responsibility for a single medical event. By understanding how your deductible, coinsurance, and out-of-pocket maximum work together, you can financially prepare for planned procedures and better understand the bills from unexpected ones. Always use this as a guide and confirm details with your provider and insurer.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
