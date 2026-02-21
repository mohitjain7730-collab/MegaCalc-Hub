'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, Zap, Info, PlusCircle, Trash2, Coffee, Beer, Pizza } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required."),
  amount: z.number().positive('Amount must be positive.'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

const formSchema = z.object({
  habits: z.array(habitSchema).min(1, 'Please add at least one habit.'),
  annualReturnRate: z.number().positive('Annual return rate must be positive.'),
  investmentPeriodYears: z.number().positive('Investment period must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalMonthlySavings: number;
  futureValue: number;
  totalInvestment: number;
  totalProfit: number;
  chartData: { name: string; value: number }[];
  years: number;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const FREQUENCY_MULTIPLIER = {
  daily: 30.44, // Average days in a month
  weekly: 4.33, // Average weeks in a month
  monthly: 1,
};

const PRESET_HABITS = [
  { name: 'Morning Coffee', amount: 5, frequency: 'daily', icon: Coffee },
  { name: 'Dining Out', amount: 50, frequency: 'weekly', icon: Pizza },
  { name: 'After-Work Drinks', amount: 30, frequency: 'weekly', icon: Beer },
];

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function HabitBasedWealthGrowthEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      habits: [{ name: '', amount: undefined, frequency: 'daily' }],
      annualReturnRate: undefined,
      investmentPeriodYears: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "habits",
  });

  const onSubmit = (values: FormValues) => {
    const totalMonthlySavings = values.habits.reduce((acc, habit) => {
      const monthlyCost = habit.amount * FREQUENCY_MULTIPLIER[habit.frequency];
      return acc + monthlyCost;
    }, 0);

    const monthlyInvestment = totalMonthlySavings;
    const r = values.annualReturnRate / 12 / 100;
    const n = values.investmentPeriodYears * 12;

    // Future Value of a series of payments (annuity)
    const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;

    const chartData = values.habits.map(habit => ({
      name: habit.name,
      value: habit.amount * FREQUENCY_MULTIPLIER[habit.frequency],
    }));

    setResult({
      totalMonthlySavings,
      futureValue,
      totalInvestment,
      totalProfit,
      chartData,
      years: values.investmentPeriodYears,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Habit-based Wealth Growth Estimator
          </CardTitle>
          <CardDescription>
            See how much wealth you could build by redirecting spending from daily habits to investments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Spending Habits</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative">
                      <h4 className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground">Habit {index + 1}</h4>
                      <FormField
                        control={form.control}
                        name={`habits.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Habit Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Morning Coffee" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`habits.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                <Input type="number" className="pl-7" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`habits.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', amount: undefined as unknown as number, frequency: 'weekly' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Habit
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Investment Scenario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="annualReturnRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Annual Return (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="investmentPeriodYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Period (Years)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Estimate My Growth
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Potential Wealth Growth</CardTitle>
              <CardDescription>
                By redirecting {formatNumberUS(result.totalMonthlySavings)} per month for {result.years} years, you could accumulate:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Potential Future Value</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.futureValue)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Invested</h4>
                  <p className="text-2xl font-bold">
                    {formatNumberUS(result.totalInvestment)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Profit</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumberUS(result.totalProfit)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Return on Investment</h4>
                  <p className="text-2xl font-bold">
                    {((result.totalProfit / result.totalInvestment) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Breakdown</CardTitle>
              <CardDescription>
                This is where your potential {formatNumberUS(result.totalMonthlySavings)} in monthly investments comes from.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={result.chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {result.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumberUS(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Concept
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This calculator demonstrates the "Latte Factor" on a larger scale. It's not about depriving yourself of joy, but about understanding the financial power of small, recurring expenses. By making conscious spending decisions and redirecting even a small portion of that money into investments, you can leverage the power of compound interest to build substantial wealth over time.</p>
            <p>The key is to identify non-essential, habitual spending, calculate its true monthly cost, and then visualize the long-term potential if that money were invested instead. This transforms a seemingly insignificant daily purchase into a powerful tool for achieving your financial goals.</p>
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Latte Factor Magnified: How Small Habits Create Massive Wealth</h1>
          <p className="text-lg italic">Uncover the hidden potential in your daily spending and learn how to turn your coffee budget into a cornerstone of your financial freedom.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is the 'Latte Factor'?</h2>
          <p>Coined by author David Bach, the "Latte Factor" is a metaphor for all the small, discretionary expenses we incur regularly without much thought. It might be a daily premium coffee, a frequent lunch out, a subscription service you don't use, or nightly takeout. While each purchase seems insignificant on its own, their cumulative financial impact over decades is staggering.</p>
          <p>This calculator's purpose is to make that impact tangible. It's not about guilt; it's about <strong className="font-semibold">awareness and empowerment</strong>. By understanding the opportunity cost of these habits, you can make conscious choices that align with your long-term goals.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Two Engines of Habit-Based Growth</h2>
          <p>The incredible results you see from this calculator are driven by two powerful financial principles working in tandem:</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">The Power of Aggregation</strong>
              <p>A $5 coffee doesn't seem like much. But a daily $5 coffee is $35 a week, or about $150 a month. Aggregated over a year, that's $1,800. This calculator does that first step for you, revealing the true annual cost of your habits. Often, this number alone is an eye-opener.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">The Magic of Compound Interest</strong>
              <p>This is where the real growth happens. When you take that aggregated savings ($1,800 a year, or $150 a month) and invest it, it doesn't just sit there. It starts earning returns. The next year, you earn returns on your original investment <strong className="text-primary">plus</strong> the returns from the previous year. This "return on returns" effect is what creates exponential growth, turning a small stream of redirected cash into a significant nest egg.</p>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Identify Your Own 'Latte Factors'</h2>
          <p>The most effective way to use this tool is to find your own personal spending habits. Here’s how:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Review Your Statements:</strong> Spend 30 minutes looking through your last month's credit card and bank statements. Look for small, recurring charges from the same vendors (e.g., Starbucks, Uber Eats, Amazon).</li>
            <li><strong className="font-semibold">Track Your Spending for a Week:</strong> Actively write down every single purchase you make for seven days. This manual process builds a strong awareness of where your money is truly going.</li>
            <li><strong className="font-semibold">Question Your Subscriptions:</strong> Make a list of all your monthly subscriptions (streaming, software, gym memberships). Are you using all of them to their full potential? Could you downgrade or cancel any? A single $15/month subscription is $180 a year you could be investing.</li>
            <li><strong className="font-semibold">Distinguish Between Joyful and Mindless Spending:</strong> This is key. The goal is not to eliminate all joy. If a weekly dinner with friends is a highlight of your week, keep it. The target is <strong className="text-foreground">mindless</strong> spending—the purchases made out of pure habit or convenience with little to no lasting satisfaction.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: A Tool for Mindful Spending</h2>
          <p>This calculator is more than a financial projection tool; it's a behavioral finance tool. It encourages you to pause and ask a powerful question: "Is the short-term satisfaction I get from this habit worth more than the long-term financial freedom it's costing me?"</p>
          <p>Sometimes the answer will be yes, and that's perfectly fine. But often, you'll discover habits you're happy to trade for a wealthier, more secure future. By making a few conscious changes, you can put your small habits to work building the life you want.</p>
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
              <h4 className="font-semibold mb-2">Is this calculator telling me to stop enjoying life?</h4>
              <p className="text-muted-foreground">Not at all! It's about mindful spending. The goal is to identify and cut back on <strong className="text-foreground">mindless or low-value</strong> habits, freeing up money for things that matter more, like your long-term financial security. If a habit brings you significant joy, it's worth keeping.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a realistic annual return rate to use?</h4>
              <p className="text-muted-foreground">A conservative and widely used estimate for a diversified stock portfolio (like an S&P 500 index fund) is 7-8% annually, which accounts for inflation. Using 10% reflects the historical market average before inflation. It's wise to be conservative with your estimate.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I actually invest the money I save?</h4>
              <p className="text-muted-foreground">The easiest way is to set up an automatic monthly transfer from your checking account into a low-cost index fund or ETF through a brokerage account (like Vanguard, Fidelity, or Charles Schwab). This automates the process and puts your savings to work immediately.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is it better to invest the money or pay off debt?</h4>
              <p className="text-muted-foreground">It depends on the interest rate. If you have high-interest debt (like credit cards with 20%+ APR), it's almost always better to pay that off first. The guaranteed "return" you get from eliminating that debt is higher than any likely investment return. For low-interest debt (like a mortgage at 3%), it's often better to invest.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if my habit costs are irregular?</h4>
              <p className="text-muted-foreground">Try to find an average. If you buy lunch out 2-3 times a week, use 2.5 times as your weekly frequency. The goal is to get a reasonable estimate of the monthly cost, not a perfectly exact number.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How does this relate to my retirement savings?</h4>
              <p className="text-muted-foreground">This is a powerful supplement to your formal retirement savings (like a 401(k)). While your 401(k) is your primary engine, redirecting "latte factor" money into a separate brokerage account (like a Roth IRA) can significantly accelerate your journey to financial independence or fund other major goals.</p>
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
            <p>This calculator quantifies the "Latte Factor" by showing how redirecting spending on small, recurring habits can lead to substantial wealth through compound interest. By inputting your habits and an investment scenario, you can visualize the long-term financial impact and opportunity cost of your daily spending. This tool empowers you to make mindful financial decisions and turn small behavioral changes into a powerful engine for wealth creation.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
