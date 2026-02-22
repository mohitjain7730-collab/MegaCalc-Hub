
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, Shield, Info, ShieldPlus, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const formSchema = z.object({
  filingStatus: z.enum(['single', 'family']),
  annualIncome: z.number().positive('Annual income must be positive.'),
  hsaContribution: z.number().positive('HSA contribution must be positive.'),
  investmentReturnRate: z.number().min(0, 'Return rate cannot be negative.'),
  yearsOfGrowth: z.number().positive('Years must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  taxSavings: number;
  effectiveContribution: number;
  futureValue: number;
  totalContributions: number;
  totalGrowth: number;
  chartData: { name: string; 'Tax-Free Growth': number; 'Contributions': number }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

// Simplified tax brackets for calculation
const TAX_BRACKETS = {
  single: [
    { limit: 11000, rate: 0.10 },
    { limit: 44725, rate: 0.12 },
    { limit: 95375, rate: 0.22 },
    { limit: 182100, rate: 0.24 },
    { limit: 231250, rate: 0.32 },
    { limit: 578125, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  family: [ // Using Married Filing Jointly brackets
    { limit: 22000, rate: 0.10 },
    { limit: 89450, rate: 0.12 },
    { limit: 190750, rate: 0.22 },
    { limit: 364200, rate: 0.24 },
    { limit: 462500, rate: 0.32 },
    { limit: 693750, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
};

const FICA_RATE = 0.0765; // Social Security (6.2%) + Medicare (1.45%)

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function HsaTaxBenefitCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filingStatus: undefined,
      annualIncome: undefined,
      hsaContribution: undefined,
      investmentReturnRate: undefined,
      yearsOfGrowth: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { annualIncome, hsaContribution, filingStatus, investmentReturnRate, yearsOfGrowth } = values;

    // 1. Calculate Marginal Tax Rate
    const brackets = TAX_BRACKETS[filingStatus];
    let marginalTaxRate = 0;
    for (const bracket of brackets) {
      if (annualIncome <= bracket.limit) {
        marginalTaxRate = bracket.rate;
        break;
      }
    }

    // 2. Calculate Tax Savings
    const federalTaxSavings = hsaContribution * marginalTaxRate;
    const ficaTaxSavings = hsaContribution * FICA_RATE; // Assuming contribution is via payroll deduction
    const totalTaxSavings = federalTaxSavings + ficaTaxSavings;

    // 3. Calculate Effective Contribution
    const effectiveContribution = hsaContribution - totalTaxSavings;

    // 4. Calculate Future Value (compounded annually)
    const r = investmentReturnRate / 100;
    const n = yearsOfGrowth;
    // FV of a series of payments (annuity)
    const futureValue = hsaContribution * ((Math.pow(1 + r, n) - 1) / r);
    const totalContributions = hsaContribution * n;
    const totalGrowth = futureValue - totalContributions;

    // 5. Generate Chart Data
    const chartData = [];
    for (let year = 1; year <= yearsOfGrowth; year++) {
      const yearContributions = hsaContribution * year;
      const yearFutureValue = hsaContribution * ((Math.pow(1 + r, year) - 1) / r);
      chartData.push({
        name: `Year ${year}`,
        'Contributions': yearContributions,
        'Tax-Free Growth': yearFutureValue - yearContributions,
      });
    }

    // Generate Recommendations
    const recommendations = [];
    recommendations.push(`By using an HSA, you save **${formatNumberUS(totalTaxSavings)}** in taxes immediately every year.`);

    if (totalGrowth > totalContributions) {
      recommendations.push(`Your tax-free investment growth (**${formatNumberUS(totalGrowth)}**) is projected to potentially exceed your total contributions!`);
      recommendations.push("This highlights why HSAs are often called the ultimate retirement account.");
    }

    if (investmentReturnRate < 5) {
      recommendations.push("Consider investing your HSA funds in broad market index funds (if available) to target higher long-term returns (e.g., 7-8%).");
    }

    if (yearsOfGrowth >= 20) {
      recommendations.push("With your long time horizon, treating your HSA as a retirement vehicle (paying current medical bills out of pocket) maximizes your tax-free growth.");
    }

    // Generate Action Plan
    const plan = [
      { label: 'Max Contributions', detail: 'Aim to contribute the maximum IRS limit each year to maximize your tax deductions.' },
      { label: 'Invest Contributions', detail: 'Don\'t leave your HSA in cash! Invest the balance above your deductible to let it grow tax-free.' },
      { label: 'Save Receipts', detail: 'Pay current medical expenses out-of-pocket and save receipts. You can reimburse yourself tax-free from your HSA years later.' }
    ];

    setResult({
      taxSavings: totalTaxSavings,
      effectiveContribution,
      futureValue,
      totalContributions,
      totalGrowth,
      chartData,
      recommendations,
      plan,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5" />
            Health Savings Account (HSA) Tax Benefit Calculator
          </CardTitle>
          <CardDescription>
            Estimate the powerful triple-tax advantage of your HSA contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Annual Income</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Filing Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="family">Married Filing Jointly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="hsaContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual HSA Contribution</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3850" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentReturnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Investment Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsOfGrowth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Growth</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Calculate My HSA Benefits
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your HSA Growth & Tax Savings</CardTitle>
              <CardDescription>
                Over {form.getValues('yearsOfGrowth')} years, your HSA could grow to a substantial amount while providing significant annual tax savings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Potential Future Value</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.futureValue)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Annual Tax Savings</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumberUS(result.taxSavings)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Your Effective Annual Cost</h4>
                  <p className="text-2xl font-bold">
                    {formatNumberUS(result.effectiveContribution)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Tax-Free Growth</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumberUS(result.totalGrowth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HSA Growth Over Time</CardTitle>
              <CardDescription>
                This chart illustrates the power of tax-free compound growth on your contributions.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData} stackOffset="sign">
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatNumberUS(value)} />
                  <Tooltip formatter={(value: number) => formatNumberUS(value)} />
                  <Legend />
                  <Bar dataKey="Contributions" fill="hsl(var(--chart-2))" stackId="a" />
                  <Bar dataKey="Tax-Free Growth" fill="hsl(var(--chart-1))" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.plan.map((step, index) => (
                    <li key={index} className="space-y-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                          {index + 1}
                        </span>
                        {step.label}
                      </h4>
                      <p className="text-sm text-muted-foreground pl-8">{step.detail}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Script id="calc-schema" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "HSA Tax Benefit Calculator",
          "description": "Estimate the powerful triple-tax advantage of your Health Savings Account (HSA) contributions.",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })
      }} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the HSA Triple-Tax Advantage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>A Health Savings Account (HSA) is widely regarded as the most powerful retirement and healthcare savings vehicle due to its unique triple-tax advantage. This calculator helps quantify that benefit.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong className="text-foreground">Tax-Deductible Contributions:</strong> The money you contribute is pre-tax (if via payroll) or tax-deductible (if you contribute directly), lowering your current taxable income. This calculator estimates this immediate benefit.</li>
              <li><strong className="text-foreground">Tax-Free Growth:</strong> Unlike a 401(k) or IRA, the money inside your HSA can be invested and grows completely tax-free. You never pay taxes on the interest or capital gains.</li>
              <li><strong className="text-foreground">Tax-Free Withdrawals:</strong> You can withdraw money from your HSA at any time, for any qualified medical expense, completely tax-free. After age 65, it can be used for any purpose (just like a 401(k)), with withdrawals for non-medical expenses being taxed as regular income.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Formulas Explained
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tax Savings</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Tax Savings = (Contribution * Marginal Federal Rate) + (Contribution * FICA Rate)</p>
              <p className="mt-2">This formula calculates your immediate tax reduction. It combines savings from your federal income tax bracket with savings from Social Security and Medicare (FICA) taxes, which you avoid when contributing via payroll deduction.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Future Value</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Future Value = P * [((1 + r)^n - 1) / r]</p>
              <p className="mt-2">This is the future value of an annuity formula, calculating the total growth of your annual contributions over time. 'P' is your annual contribution, 'r' is the annual investment return rate, and 'n' is the number of years.</p>
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
              <li><Link href="/long-term-care-cost-estimator" className="hover:underline">Long-Term Care Cost Estimator</Link></li>
              <li><Link href="/copay-vs-deductible-breakeven-calculator" className="hover:underline">Copay vs Deductible Breakeven Calculator</Link></li>
              <li><Link href="/health-insurance-subsidy-eligibility-calculator" className="hover:underline">Health Insurance Subsidy Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Unlocking the Ultimate Investment: A Deep Dive into the HSA</h1>
          <p className="text-lg italic">Discover why a Health Savings Account is more than just a healthcare tool—it's a supercharged retirement account in disguise, and potentially the most valuable investment you can make.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is an HSA and Who is Eligible?</h2>
          <p>A Health Savings Account (HSA) is a tax-advantaged savings account available to individuals and families enrolled in a High-Deductible Health Plan (HDHP). It's designed to help you save for medical expenses, but its powerful features make it an unparalleled long-term investment vehicle. To be eligible to contribute to an HSA, you must meet a few IRS requirements:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>You must be covered under a qualified HDHP on the first day of the month.</li>
            <li>You have no other health coverage (with limited exceptions).</li>
            <li>You aren’t enrolled in Medicare.</li>
            <li>You can’t be claimed as a dependent on someone else’s tax return.</li>
          </ul>
          <p>The IRS sets annual limits on contributions. For 2024, the limits are $4,150 for self-only coverage and $8,300 for family coverage. Individuals aged 55 and older can contribute an additional $1,000 as a "catch-up" contribution.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Unmatched Triple-Tax Advantage</h2>
          <p>The HSA's power comes from a unique combination of tax benefits that no other account can offer. Let's break down why this "triple-tax advantage" is so significant.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <div>
                <strong className="font-semibold text-foreground">Benefit 1: Pre-Tax or Tax-Deductible Contributions</strong>
                <p>When you contribute to an HSA, you reduce your taxable income for the year. If you contribute through your employer's payroll deduction, the contributions are made pre-tax, bypassing both federal income tax and FICA taxes (Social Security and Medicare). This immediately saves you money. For example, if you are in the 22% federal tax bracket, every $1,000 you contribute saves you $220 in federal taxes and another $76.50 in FICA taxes, for a total of $296.50. Your $1,000 contribution effectively only "costs" you $703.50. This calculator helps you see that immediate ROI.</p>
              </div>
            </li>
            <li>
              <div>
                <strong className="font-semibold text-foreground">Benefit 2: Tax-Free Growth</strong>
                <p>This is where the HSA begins to outshine other retirement accounts. Like a 401(k) or IRA, you can invest your HSA funds in stocks, bonds, and mutual funds. However, unlike a traditional 401(k) or IRA where you pay taxes on withdrawals, the growth in an HSA is <em className="italic">never</em> taxed. All the capital gains, dividends, and interest your investments generate are yours to keep, tax-free, forever. This allows your money to compound much faster over the long term.</p>
              </div>
            </li>
            <li>
              <div>
                <strong className="font-semibold text-foreground">Benefit 3: Tax-Free Withdrawals for Qualified Medical Expenses</strong>
                <p>This is the final piece of the puzzle. You can withdraw funds from your HSA at any time to pay for a vast range of qualified medical expenses—from doctor visits and prescriptions to dental care and vision—completely tax-free. There is no time limit. You can pay for a medical expense out-of-pocket today and reimburse yourself from your HSA 30 years from now, allowing your investments to grow untouched for decades. This makes it a flexible emergency fund and a dedicated healthcare fund in one.</p>
              </div>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">HSA as a Stealth Retirement Account</h2>
          <p>While its primary purpose is healthcare, the HSA's secret weapon is its function as a retirement account. Once you turn 65, the rules become even more flexible. You can continue to withdraw money tax-free for medical expenses, which are likely to be higher in retirement. But you can also withdraw money for <strong className="font-semibold">any reason at all</strong>. These non-medical withdrawals will be taxed as ordinary income, just like withdrawals from a traditional 401(k) or IRA. This feature effectively turns your HSA into a "Super IRA."</p>
          <p>The optimal strategy for wealth builders is to, if possible, pay for current medical expenses out-of-pocket and leave the HSA funds invested to maximize tax-free growth. Think of it as your primary investment account, maxing it out each year even before your 401(k) (after securing any employer match). Keep receipts for all your out-of-pocket medical expenses in a digital folder. This creates a "bank" of tax-free withdrawals you can take at any point in the future, penalty-free, for any reason.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Prioritize Your HSA</h2>
          <p>This calculator demonstrates that the HSA is not just another account; it's a financial powerhouse. The immediate tax deduction, combined with decades of tax-free compounding and tax-free withdrawals for healthcare, makes it an essential tool for anyone serious about building long-term wealth and preparing for the costs of healthcare in retirement. If you are eligible for an HSA, contributing the maximum amount each year should be one of your highest financial priorities.</p>
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
              <h4 className="font-semibold mb-2">What is a High-Deductible Health Plan (HDHP)?</h4>
              <p className="text-muted-foreground">An HDHP is a health insurance plan with a higher deductible than traditional plans. In exchange, they typically have lower monthly premiums. The IRS defines the minimum deductible and maximum out-of-pocket costs for a plan to be considered a qualified HDHP.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I change jobs or no longer have an HDHP?</h4>
              <p className="text-muted-foreground">The money in your HSA is always yours, even if you change jobs or insurance plans. You can no longer <em className="italic">contribute</em> to the HSA if you are not enrolled in an HDHP, but you can continue to use the existing funds for medical expenses or keep them invested for the future.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What are "qualified medical expenses"?</h4>
              <p className="text-muted-foreground">The IRS maintains a broad list (Publication 502) of eligible expenses, including doctor visits, dental work, prescriptions, vision care (glasses, contacts), chiropractic care, and even things like acupuncture. Over-the-counter medications are also eligible.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is it better to invest my HSA funds or keep them in cash?</h4>
              <p className="text-muted-foreground">For long-term growth, investing is key. Many HSA providers offer a range of investment options like low-cost index funds. A common strategy is to keep an amount equal to your annual deductible in cash for immediate medical needs and invest the rest for long-term, tax-free growth.</p>
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
            <p>This calculator quantifies the powerful triple-tax advantage of a Health Savings Account (HSA). By inputting your income, contribution, and investment expectations, you can visualize the immediate tax savings and long-term, tax-free growth potential. The HSA is a unique tool that lowers your current tax bill, allows investments to grow tax-free, and permits tax-free withdrawals for medical expenses, making it one of the most effective vehicles for both healthcare and retirement savings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
