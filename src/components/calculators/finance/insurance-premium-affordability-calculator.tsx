'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, PieChart as PieChartIcon, Info } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  monthlyIncome: z.number().positive('Monthly income is required.'),
  existingDebts: z.number().nonnegative('Existing debts cannot be negative.'),
  desiredCoverage: z.number().positive('Desired coverage amount is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  affordabilityIndex: number;
  recommendedMaxPremium: number;
  coverageToIncomeRatio: number;
  health: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  monthlyIncome: number;
  desiredCoverage: number;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const COLORS = {
  Excellent: 'hsl(var(--chart-2))', // Green
  Good: 'hsl(var(--chart-1))',      // Blue
  Fair: 'hsl(var(--chart-4))',      // Orange
  Poor: 'hsl(var(--destructive))',  // Red
};

export default function InsuranceAffordabilityCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: undefined,
      existingDebts: undefined,
      desiredCoverage: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monthlyIncome, existingDebts, desiredCoverage } = values;

    const disposableIncome = Math.max(0, monthlyIncome - existingDebts);
    const recommendedMaxPremium = disposableIncome * 0.10;

    const estimatedPremium = desiredCoverage / 240;
    const affordabilityIndex = Math.max(0, Math.min(100, (recommendedMaxPremium / estimatedPremium) * 100));

    const coverageToIncomeRatio = desiredCoverage / (monthlyIncome * 12);

    let health: CalculationResult['health'] = 'Poor';
    if (affordabilityIndex > 85) health = 'Excellent';
    else if (affordabilityIndex > 65) health = 'Good';
    else if (affordabilityIndex > 40) health = 'Fair';

    setResult({
      affordabilityIndex,
      recommendedMaxPremium,
      coverageToIncomeRatio,
      health,
      monthlyIncome,
      desiredCoverage,
    });
  };

  const chartData = result
    ? [
      { name: 'Affordability', value: result.affordabilityIndex },
      { name: 'Remaining', value: Math.max(0, 100 - result.affordabilityIndex) },
    ]
    : [];

  const recommendationItems = result
    ? [
      result.health === 'Excellent' ? 'Your income strongly supports this coverage. You have flexibility to explore comprehensive plans and riders.' : 'Your budget may be strained. Consider reviewing your coverage amount or exploring ways to increase disposable income.',
      result.coverageToIncomeRatio < 10 ? 'Your coverage seems low for your income. It may not be enough to support dependents. Consider increasing it.' : 'Your coverage-to-income ratio is robust, offering solid protection for your dependents.',
      `A monthly premium up to ${formatNumberUS(result.recommendedMaxPremium, { maximumFractionDigits: 0 })} is considered a healthy maximum for your budget.`,
      'Explore term life insurance for high coverage at a low cost, which is often the most efficient way to get protection.'
    ]
    : [];

  const actionPlanItems = result
    ? [
      {
        label: 'Get Quotes',
        detail: `Request quotes from multiple top-rated insurers for a term plan of at least ${formatNumberUS(result.desiredCoverage, { maximumFractionDigits: 0 })} to compare rates.`
      },
      {
        label: 'Health Check-up',
        detail: 'A medical check-up can sometimes lower premiums if you are in good health. Don\'t delay your application.'
      },
      {
        label: 'Review Debts',
        detail: 'Reducing existing monthly debt payments is the fastest way to free up more room in your budget for insurance premiums.'
      },
      {
        label: 'Consult an Advisor',
        detail: 'A financial advisor can help tailor an insurance strategy to your specific needs and long-term goals.'
      }
    ]
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Premium Affordability
          </CardTitle>
          <CardDescription>
            Enter your financial details to assess how much insurance coverage you can comfortably afford.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Net Monthly Income
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
                <FormField
                  control={form.control}
                  name="existingDebts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly Debt Payments (EMI, etc.)
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
                  name="desiredCoverage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Desired Insurance Coverage Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1000000"
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
              <Button type="submit" className="w-full md:w-auto">
                Calculate Affordability
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Insurance Affordability Index</CardTitle>
              <CardDescription>
                An assessment of your capacity to pay premiums for the desired ${formatNumberUS(result.desiredCoverage, { maximumFractionDigits: 0 })} coverage.
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
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill={COLORS[result.health]} />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ display: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-bold" style={{ color: COLORS[result.health] }}>
                    {result.affordabilityIndex.toFixed(0)}
                  </span>
                  <span className="text-lg font-medium" style={{ color: COLORS[result.health] }}>
                    {result.health}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Recommended Max Premium</h4>
                  <p className="text-2xl font-bold text-primary">{formatNumberUS(result.recommendedMaxPremium, { maximumFractionDigits: 0 })} / month</p>
                  <p className="text-sm">This is about 10% of your disposable income—a healthy upper limit for your budget.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Coverage-to-Income Ratio</h4>
                  <p className="text-2xl font-bold text-primary">{result.coverageToIncomeRatio.toFixed(1)}x</p>
                  <p className="text-sm">A common rule of thumb is 10-15x your annual income.</p>
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
                  {recommendationItems.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
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
                  {actionPlanItems.map((step) => (
                    <li key={step.label}>
                      <span className="font-semibold text-foreground">{step.label}:</span> {step.detail}
                    </li>
                  ))}
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
              <h4 className="font-semibold">Net Monthly Income</h4>
              <p className="text-muted-foreground">Your take-home pay after taxes and deductions. This is the foundation of your budget.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Monthly Debt Payments</h4>
              <p className="text-muted-foreground">Total of all existing EMIs, credit card payments, and other loans. This determines your disposable income.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1 md:col-span-2">
              <h4 className="font-semibold">Desired Insurance Coverage</h4>
              <p className="text-muted-foreground">The total amount your beneficiaries would receive. A common guideline is 10-15 times your annual income, but it depends on your family's needs.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              How is Affordability Calculated?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>1. Disposable Income:</strong> First, we calculate your disposable income by subtracting your monthly debt payments from your net monthly income.
            </p>
            <p>
              <strong>2. Recommended Premium:</strong> Financial planners often suggest that life insurance premiums should not exceed 5-10% of your disposable income. We use 10% as a safe upper limit for the "Recommended Max Premium".
            </p>
            <p>
              <strong>3. Affordability Index:</strong> We estimate a potential monthly premium for your desired coverage (this is a rough estimate) and compare it to your Recommended Max Premium. The index shows how comfortably your recommended premium budget covers the estimated cost. An index of 100 means you can likely afford the premium with ease.
            </p>
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
              <li><Link href="/compound-interest-calculator" className="hover:underline">Compound Interest Calculator</Link></li>
              <li><Link href="/return-on-investment-calculator" className="hover:underline">Return on Investment (ROI) Calculator</Link></li>
              <li><Link href="/monthly-budget-planner-calculator" className="hover:underline">Monthly Budget Planner</Link></li>
              <li><Link href="/emergency-fund-requirement-calculator" className="hover:underline">Emergency Fund Requirement Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinancialProduct">
          <meta itemProp="name" content="The Ultimate Guide to Life Insurance Affordability & Needs Analysis" />
          <meta itemProp="description" content="An expert guide on determining how much life insurance you can afford and how much coverage you truly need. Explore calculation methods like DIME and the 10x rule, understand different policy types (Term vs. Whole Life), and learn how to balance budget constraints with financial security for your dependents." />
          <meta itemProp="keywords" content="life insurance affordability, how much life insurance, DIME method, term vs whole life, calculate life insurance needs, insurance premium budget, financial protection, income replacement" />
          <meta itemProp="author" content="FinanceFriend Experts" />
          <meta itemProp="datePublished" content="2025-10-26" />
          <meta itemProp="url" content="/guides/insurance-affordability" />

          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Life Insurance Affordability: How Much Coverage Do You Really Need?</h1>
          <p className="text-lg italic text-muted-foreground">Demystifying life insurance calculations to ensure your loved ones are protected without straining your budget. A deep dive into balancing needs, affordability, and long-term financial security.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
          <ul className="list-disc ml-6 space-y-2 text-primary">
            <li><a href="#core-concepts" className="hover:underline">Core Concepts: Why Affordability and Needs Analysis Matter</a></li>
            <li><a href="#how-much-coverage" className="hover:underline">Method 1: The 10-15x Income Rule of Thumb</a></li>
            <li><a href="#dime-method" className="hover:underline">Method 2: The DIME Formula (A Detailed Approach)</a></li>
            <li><a href="#affordability-analysis" className="hover:underline">The Affordability Equation: Budgeting for Premiums</a></li>
            <li><a href="#policy-types" className="hover:underline">Choosing Your Policy: Term vs. Whole Life Insurance</a></li>
          </ul>
          <hr className="my-6" />

          <h2 id="core-concepts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Concepts: Why Affordability and Needs Analysis Matter</h2>
          <p>Life insurance is a cornerstone of responsible financial planning. Its primary purpose is to provide a financial safety net for your dependents if you were to pass away unexpectedly. However, the question isn't just <em className="font-semibold">whether</em> you need it, but <strong className="font-semibold">how much</strong> you need and <strong className="font-semibold">what you can realistically afford</strong>.</p>
          <p>Over-insuring can strain your monthly budget, diverting funds from other critical financial goals like retirement savings or debt repayment. Under-insuring, on the other hand, can leave your family vulnerable and unable to cover essential expenses. This guide provides a framework for finding the optimal balance.</p>

          <h3 className="text-xl font-semibold text-foreground mt-6">The Two Pillars of Insurance Planning</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Needs Analysis:</strong> A detailed calculation to determine the exact financial resources your dependents would require to maintain their standard of living. This covers everything from mortgage payments to college tuition.</li>
            <li><strong className="font-semibold">Affordability Analysis:</strong> A realistic assessment of your current budget to determine how much you can allocate to insurance premiums without compromising your financial health. The best policy is one you can consistently pay for.</li>
          </ul>
          <hr className="my-6" />

          <h2 id="how-much-coverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Method 1: The 10-15x Income Rule of Thumb</h2>
          <p>For a quick and easy estimate, the most common guideline is to secure a life insurance policy with a death benefit equal to <strong className="font-semibold">10 to 15 times your current annual gross income</strong>. This method is simple but effective for many families.</p>
          <p>For example, if you earn $80,000 per year, this rule suggests you should aim for a coverage amount between <strong className="font-semibold">$800,000 and $1,200,000</strong>. This capital lump sum, when invested conservatively, is intended to replace your income for your family over a significant period.</p>
          <h3 className="text-xl font-semibold text-foreground mt-6">Advantages and Disadvantages</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="text-green-600">Pro:</strong> It's incredibly simple to calculate and provides a solid baseline for coverage needs.</li>
            <li><strong className="text-destructive">Con:</strong> It doesn't account for individual circumstances like the number of dependents, existing debts, or specific future goals like college education. A young family with a large mortgage may need more, while an older individual with no dependents may need less.</li>
          </ul>
          <hr className="my-6" />

          <h2 id="dime-method" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Method 2: The DIME Formula (A Detailed Approach)</h2>
          <p>For a more precise and personalized calculation, the DIME formula is an excellent framework. It stands for <strong className="font-semibold">Debt, Income, Mortgage, and Education</strong>—the four primary financial obligations your policy should cover.</p>
          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="p-4 border rounded-lg"><strong>D - Debt:</strong> Total all outstanding non-mortgage debts. This includes credit card balances, auto loans, personal loans, and student loans.</div>
            <div className="p-4 border rounded-lg"><strong>I - Income:</strong> Multiply your annual income by the number of years your family would need support. A common figure is 10-15 years, or until your youngest child turns 18.</div>
            <div className="p-4 border rounded-lg"><strong>M - Mortgage:</strong> Add the remaining balance on your mortgage. Paying off the house is often the single largest financial relief you can provide.</div>
            <div className="p-4 border rounded-lg"><strong>E - Education:</strong> Estimate the future cost of your children's college education. A common estimate is $100,000 to $150,000 per child for a four-year degree.</div>
          </div>
          <p><strong className="font-semibold">Total Coverage = D + I + M + E</strong>. From this total, you can subtract your existing assets, such as savings, investments, and any current life insurance policies.</p>
          <hr className="my-6" />

          <h2 id="affordability-analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Affordability Equation: Budgeting for Premiums</h2>
          <p>Once you know how much coverage you need, you must determine what you can afford. The core of this calculation is your <strong className="font-semibold">disposable income</strong>.</p>
          <p><strong className="font-semibold">Disposable Income = Net Monthly Income - Total Monthly Debt Payments</strong></p>
          <p>A widely accepted financial guideline suggests that your life insurance premium should be between <strong className="font-semibold">5% and 10% of your disposable income</strong>. Our calculator uses the 10% figure as a healthy upper limit for a robust policy.</p>
          <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation:</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>Net Monthly Income: $5,000</li>
            <li>Monthly Debts (Car, Student Loan): $1,000</li>
            <li>Disposable Income: $5,000 - $1,000 = $4,000</li>
            <li>Recommended Premium Budget: $4,000 * 10% = <strong className="font-semibold">$400/month</strong></li>
          </ul>
          <p>This means a premium up to $400 per month is likely manageable. If quotes for your desired coverage exceed this, you may need to either adjust the coverage amount or look for ways to reduce monthly expenses.</p>
          <hr className="my-6" />

          <h2 id="policy-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Choosing Your Policy: Term vs. Whole Life Insurance</h2>
          <p>The type of policy you choose has the single biggest impact on your premium cost.</p>
          <h3 className="text-xl font-semibold text-foreground mt-6">1. Term Life Insurance</h3>
          <p>Term life insurance provides coverage for a specific period (the "term"), typically 10, 20, or 30 years. If you pass away during this term, your beneficiaries receive the death benefit. If you outlive the term, the policy expires. It is pure insurance with no investment component.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="text-green-600">Advantage:</strong> It is significantly cheaper than whole life insurance, allowing you to get a large amount of coverage for a low premium. It's often called the most "efficient" form of life insurance.</li>
            <li><strong className="text-destructive">Disadvantage:</strong> It provides no value if you outlive the term.</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Whole Life Insurance (and other Permanent Policies)</h3>
          <p>Whole life insurance provides coverage for your entire life. In addition to the death benefit, it includes a savings component known as "cash value," which grows over time on a tax-deferred basis. You can borrow against this cash value or surrender the policy for it.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="text-green-600">Advantage:</strong> It provides lifelong coverage and builds cash value, acting as a forced savings vehicle.</li>
            <li><strong className="text-destructive">Disadvantage:</strong> Premiums are 5 to 15 times more expensive than term life for the same death benefit. The investment returns on the cash value component are often lower than what could be achieved through traditional investing.</li>
          </ul>
          <p className="mt-4"><strong className="font-semibold">Common Financial Strategy:</strong> Many financial advisors recommend "Buy Term and Invest the Difference." This strategy involves purchasing an affordable term policy and investing the money saved (the difference in premium between a term and whole life policy) into retirement accounts like a 401(k) or IRA, often leading to better overall wealth creation.</p>

        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about insurance affordability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How much life insurance do I really need?</h4>
              <p className="text-muted-foreground">
                A common rule of thumb is 10-15 times your annual income. For a more detailed assessment, use the DIME method: sum up your <strong className="text-foreground">D</strong>ebt, <strong className="text-foreground">I</strong>ncome replacement needs, <strong className="text-foreground">M</strong>ortgage balance, and future <strong className="text-foreground">E</strong>ducation costs for your children.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is Term or Whole Life Insurance better?</h4>
              <p className="text-muted-foreground">
                For most people, <strong className="text-foreground">Term Life Insurance</strong> is the better choice. It's significantly cheaper, allowing you to get a large amount of coverage during the years you need it most (e.g., while raising children and paying a mortgage). Many experts advise buying term insurance and investing the premium difference in retirement accounts.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I lower my insurance premium?</h4>
              <p className="text-muted-foreground">
                You can lower your premium by improving your health (quitting smoking, losing weight), choosing a shorter term length, reducing your coverage amount, and shopping around for quotes from multiple insurers. Applying when you are younger and healthier always results in the lowest rates.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a "rider" in an insurance policy?</h4>
              <p className="text-muted-foreground">
                A rider is an optional add-on to a life insurance policy that provides additional benefits or coverage. Common riders include Accelerated Death Benefit (allows you to access funds if terminally ill), Waiver of Premium (waives payments if you become disabled), and Child Term Rider (provides a small death benefit for your children).
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Do I need a medical exam to get life insurance?</h4>
              <p className="text-muted-foreground">
                Not always. While traditional policies require a medical exam for the best rates, many companies now offer "simplified issue" or "guaranteed issue" policies that don't require an exam. However, these policies are typically more expensive and may have lower coverage limits.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">When should I review my life insurance coverage?</h4>
              <p className="text-muted-foreground">
                You should review your policy after any major life event, such as getting married, having a child, buying a home, or receiving a significant salary increase. This ensures your coverage continues to meet your family's evolving needs.
              </p>
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
            <p>This calculator helps you determine if your desired life insurance coverage is affordable based on your income and debts. It provides a simple "Affordability Index" and a recommended maximum monthly premium to guide your decisions.</p>
            <p>The goal is to find a balance where your family is financially protected without putting unnecessary strain on your current budget. Use this tool as a starting point for discussions with a qualified financial advisor.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
