'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, PieChart as PieChartIcon, Info, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  totalMedicalCosts: z.number().positive('Total estimated medical costs are required.'),
  deductible: z.number().nonnegative('Deductible cannot be negative.'),
  coinsurance: z.number().min(0).max(100, 'Coinsurance must be between 0 and 100.'),
  outOfPocketMax: z.number().positive('Out-of-pocket maximum is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  youPay: number;
  insurancePays: number;
  remainingDeductible: number;
  coinsurancePayment: number;
  totalCosts: number;
  health: 'Low' | 'Medium' | 'High' | 'Max';
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const COLORS = {
  YouPay: 'hsl(var(--destructive))',
  InsurancePays: 'hsl(var(--chart-2))',
};

export default function OutOfPocketHealthCostCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalMedicalCosts: undefined,
      deductible: undefined,
      coinsurance: undefined,
      outOfPocketMax: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { totalMedicalCosts, deductible, coinsurance, outOfPocketMax } = values;

    // 1. You pay up to your deductible first
    const initialPayment = Math.min(totalMedicalCosts, deductible);
    let remainingCosts = totalMedicalCosts - initialPayment;
    let youPay = initialPayment;
    let insurancePays = 0;

    // 2. After deductible is met, coinsurance kicks in
    let coinsurancePayment = 0;
    if (remainingCosts > 0) {
      coinsurancePayment = remainingCosts * (coinsurance / 100);
      youPay += coinsurancePayment;
      insurancePays += remainingCosts * (1 - coinsurance / 100);
    }

    // 3. Your total payment is capped at the out-of-pocket maximum
    if (youPay > outOfPocketMax) {
      const overpayment = youPay - outOfPocketMax;
      youPay = outOfPocketMax;
      // The insurance company covers the amount you would have overpaid
      insurancePays += overpayment;
    }

    // Ensure insurance payment doesn't make total exceed total costs
    insurancePays = Math.max(0, totalMedicalCosts - youPay);

    const remainingDeductible = Math.max(0, deductible - initialPayment);

    let health: CalculationResult['health'] = 'Low';
    const yourCostPercentage = (youPay / totalMedicalCosts) * 100;
    if (youPay === outOfPocketMax) health = 'Max';
    else if (yourCostPercentage > 50) health = 'High';
    else if (yourCostPercentage > 20) health = 'Medium';

    setResult({
      youPay,
      insurancePays,
      remainingDeductible,
      coinsurancePayment: youPay - initialPayment,
      totalCosts: totalMedicalCosts,
      health,
    });
  };

  const chartData = result
    ? [
      { name: 'You Pay', value: result.youPay },
      { name: 'Insurance Pays', value: result.insurancePays },
    ]
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Out-of-Pocket Health Cost Calculator
          </CardTitle>
          <CardDescription>
            Estimate your annual healthcare expenses based on your insurance plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="totalMedicalCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Estimated Medical Costs for the Year
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
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
                  name="deductible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Insurance Deductible
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1500"
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
                  name="outOfPocketMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Out-of-Pocket Maximum
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5000"
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
                Calculate My Costs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Estimated Cost Breakdown</CardTitle>
              <CardDescription>
                For total medical bills of ${formatNumberUS(result.totalCosts, { maximumFractionDigits: 0 })}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={450}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill={COLORS.YouPay} />
                      <Cell fill={COLORS.InsurancePays} />
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatNumberUS(value as number), name]}
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">You Pay</span>
                  <span className="text-4xl font-bold" style={{ color: COLORS.YouPay }}>
                    {formatNumberUS(result.youPay)}
                  </span>
                  <span className="text-lg font-medium" style={{ color: COLORS.YouPay }}>
                    {result.health} Burden
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Insurance Pays</h4>
                  <p className="text-3xl font-bold" style={{ color: COLORS.InsurancePays }}>{formatNumberUS(result.insurancePays)}</p>
                  <p className="text-sm">Your plan covers this amount after your contributions.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Remaining Deductible</h4>
                  <p className="text-2xl font-bold">{formatNumberUS(result.remainingDeductible)}</p>
                  <p className="text-sm">Amount left to pay before coinsurance fully applies.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Your Coinsurance Share</h4>
                  <p className="text-2xl font-bold">{formatNumberUS(result.coinsurancePayment)}</p>
                  <p className="text-sm">Your share of costs after the deductible was met.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                  <li>If your estimated 'You Pay' amount is high, consider switching to a plan with a lower deductible or out-of-pocket max during the next open enrollment period.</li>
                  <li>Check if you're eligible for a Health Savings Account (HSA) or Flexible Spending Account (FSA) to pay for these costs with pre-tax dollars.</li>
                  <li>Always check if your doctors and hospitals are in-network to avoid much higher, unexpected bills.</li>
                  <li>Review your bills carefully. Billing errors are common, and you have the right to dispute them.</li>
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
                    <span className="font-semibold text-foreground">Budget for Costs:</span> Set aside money monthly in a dedicated savings account for expected health costs.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Explore Payment Plans:</span> If you face a large bill, ask the provider about an interest-free payment plan.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Preventive Care:</span> Utilize free preventive services covered by your insurance to catch issues early and reduce future costs.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Negotiate Prices:</span> For non-emergency procedures, you can sometimes negotiate a lower cash price with the provider.
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
              Understanding Your Health Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Deductible</h4>
              <p className="text-muted-foreground">The amount you must pay out-of-pocket for covered services before your insurance plan starts to pay.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Coinsurance</h4>
              <p className="text-muted-foreground">Your share of the costs of a covered health care service, calculated as a percentage (e.g., 20%) of the allowed amount for the service. You pay coinsurance after you've met your deductible.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Out-of-Pocket Maximum</h4>
              <p className="text-muted-foreground">The most you have to pay for covered services in a plan year. After you spend this amount on deductibles and coinsurance, your health plan pays 100% of the costs of covered benefits.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Total Medical Costs</h4>
              <p className="text-muted-foreground">This is your best estimate of all medical services for the year, including doctor visits, hospital stays, prescriptions, and therapies.</p>
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Navigating Healthcare Costs: A Guide to Your Out-of-Pocket Expenses</h1>
          <p className="text-lg italic">Understanding your health insurance is the first step to managing your medical expenses. This guide demystifies the key terms and shows you how to take control of your healthcare budget.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Building Blocks of Your Health Costs</h2>
          <p>When you use your health insurance, your final bill is determined by a few key components. Understanding them is crucial.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Premium:</strong> The fixed amount you pay every month to keep your health insurance plan active. This is not included in the out-of-pocket cost calculation, as it's a recurring administrative fee.</li>
            <li><strong>Deductible:</strong> Think of this as the initial hurdle. It's the amount of money you must pay for covered medical services yourself before your insurance company starts to contribute. For example, if your deductible is $1,500, you pay the first $1,500 of your medical bills.</li>
            <li><strong>Coinsurance:</strong> Once you've met your deductible, you enter the cost-sharing phase. Coinsurance is the percentage of the bill that you are responsible for. If your coinsurance is 20%, and you have a $1,000 bill after your deductible is met, you pay $200 and your insurance pays $800.</li>
            <li><strong>Out-of-Pocket Maximum (OOPM):</strong> This is your financial safety net. It's the absolute most you will have to pay for covered, in-network medical services in a single year. Once you hit this limit (through payments towards your deductible and coinsurance), your insurance plan pays 100% of all covered services for the rest of the year.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">A Real-World Example</h2>
          <p>Let's walk through a scenario. You have a plan with a $2,000 deductible, 20% coinsurance, and a $5,000 out-of-pocket maximum. You have a hospital stay that costs $15,000.</p>
          <ol className="list-decimal ml-6 space-y-2">
            <li><strong>Meet the Deductible:</strong> You pay the first $2,000 of the bill. Your remaining bill is now $13,000.</li>
            <li><strong>Apply Coinsurance:</strong> You are responsible for 20% of the remaining $13,000. That's $2,600 ($13,000 * 0.20). Your insurance is responsible for the other 80%, which is $10,400.</li>
            <li><strong>Your Total Responsibility (So Far):</strong> Your deductible payment ($2,000) + your coinsurance payment ($2,600) = $4,600.</li>
            <li><strong>Check Against Out-of-Pocket Maximum:</strong> Your total responsibility of $4,600 is less than your $5,000 out-of-pocket maximum. So, your final bill is $4,600. The insurance company pays the rest ($10,400).</li>
            <li><strong>What if the bill was larger?</strong> If your coinsurance portion had been $4,000 instead of $2,600, your total responsibility would have been $2,000 (deductible) + $4,000 (coinsurance) = $6,000. Since this is over your $5,000 OOPM, your payment would be capped at $5,000. You've hit your limit for the year, and insurance covers everything else for this bill and any future covered services.</li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Strategies to Manage Out-of-Pocket Costs</h2>
          <p>Knowing your potential costs is only half the battle. Here are strategies to actively manage and reduce them:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Health Savings Accounts (HSAs):</strong> If you have a high-deductible health plan (HDHP), you may be eligible for an HSA. This lets you save for medical expenses with pre-tax dollars, and the money grows tax-free. It's a powerful tool for both healthcare and retirement savings.</li>
            <li><strong>Flexible Spending Accounts (FSAs):</strong> Offered by employers, FSAs also let you set aside pre-tax money for healthcare costs. The main difference is that FSAs are typically "use it or lose it" accounts, meaning you must spend the funds within the plan year.</li>
            <li><strong>Stay In-Network:</strong> Insurance companies have negotiated rates with a specific network of doctors and hospitals. Going "out-of-network" means your insurance will cover much less (or nothing at all), and your payments won't count toward your in-network deductible and OOPM. Always verify a provider is in-network before seeking care.</li>
            <li><strong>Utilize Preventive Care:</strong> Most insurance plans are required to cover preventive services (like annual check-ups, screenings, and vaccinations) at 100%, even before you've met your deductible. Use these services to stay healthy and catch potential problems early.</li>
            <li><strong>Question Your Bills:</strong> Medical billing is complex and errors are frequent. Always request an itemized bill and review it carefully. Question any charges you don't understand. You can often get errors corrected, saving you significant money.</li>
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
              <h4 className="font-semibold mb-2">What's the difference between a copay and coinsurance?</h4>
              <p className="text-muted-foreground">A copay is a fixed dollar amount (e.g., $30) you pay for a specific service, like a doctor's visit. Coinsurance is a percentage of the cost you pay after your deductible is met. Copays usually do not count toward your deductible but do count toward your out-of-pocket maximum.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Do monthly premiums count towards my deductible or out-of-pocket max?</h4>
              <p className="text-muted-foreground">No. Your monthly premium is the fee you pay to keep your insurance active. It does not count towards your deductible or your out-of-pocket maximum. These are only met by paying for actual medical services.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What happens after I hit my out-of-pocket maximum?</h4>
              <p className="text-muted-foreground">Your insurance plan will pay 100% of the cost for all covered, in-network services for the remainder of the plan year. You won't have to pay any more deductibles or coinsurance. You will, however, still need to pay your monthly premiums.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Are all plans structured this way?</h4>
              <p className="text-muted-foreground">Most are, but there are variations. HMOs, PPOs, EPOs, and POS plans have different rules about networks and referrals. Some plans may have separate deductibles for medical care and prescriptions. Always read your plan documents carefully.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I can't afford my out-of-pocket costs?</h4>
              <p className="text-muted-foreground">Many hospitals and healthcare providers have financial assistance programs or are willing to set up interest-free payment plans. Never be afraid to ask for help or negotiate a bill. They would rather receive smaller payments over time than nothing at all.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I find out the estimated cost of a procedure beforehand?</h4>
              <p className="text-muted-foreground">You can call your insurance company and ask for a pre-authorization or cost estimate. You can also ask the provider's billing department for the "allowed amount" for your insurance plan. Many insurers also have cost estimator tools on their websites.</p>
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
            <p>This calculator is a tool to help you understand and anticipate your potential healthcare spending for a year. By inputting your insurance plan's key figures, you can see how your costs are split between you and your insurer, empowering you to budget more effectively and make informed decisions about your healthcare and financial planning.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

