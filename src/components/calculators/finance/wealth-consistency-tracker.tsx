'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, Gem, Info, PlusCircle, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line, Cell } from 'recharts';
import Link from 'next/link';

const monthSchema = z.object({
  income: z.number().positive('Income must be positive.'),
  savings: z.number().nonnegative('Savings can be zero.'),
});

const formSchema = z.object({
  months: z.array(monthSchema).min(3, 'Please provide data for at least 3 months.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  consistencyScore: number;
  averageSavingsRate: number;
  totalSavings: number;
  savingsVolatility: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  chartData: { name: string; income: number; savings: number; savingsRate: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const COLORS = {
  Excellent: 'hsl(var(--chart-2))', // Green
  Good: 'hsl(var(--chart-1))',      // Blue
  Fair: 'hsl(var(--chart-4))',      // Orange
  Poor: 'hsl(var(--destructive))',  // Red
};


export default function WealthConsistencyTracker() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      months: [{ income: undefined, savings: undefined }, { income: undefined, savings: undefined }, { income: undefined, savings: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "months",
  });

  const onSubmit = (values: FormValues) => {
    const savingsRates = values.months.map(m => m.income > 0 ? (m.savings / m.income) : 0);
    const averageSavingsRate = savingsRates.reduce((acc, rate) => acc + rate, 0) / savingsRates.length;

    const mean = averageSavingsRate;
    const squaredDiffs = savingsRates.map(rate => Math.pow(rate - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Coefficient of variation to measure volatility relative to the average
    const savingsVolatility = mean > 0 ? (stdDev / mean) * 100 : 100;

    // Consistency score (0-100), higher is better. Lower volatility = higher score.
    // Also factor in the average savings rate itself. A consistent 5% is good, but 20% is better.
    const volatilityScore = Math.max(0, 100 - savingsVolatility * 2); // Heavy penalty for volatility
    const rateScore = Math.min(100, averageSavingsRate * 300); // 33% rate = 100 score
    const consistencyScore = Math.round(volatilityScore * 0.6 + rateScore * 0.4);

    let status: CalculationResult['status'] = 'Poor';
    if (consistencyScore > 85) status = 'Excellent';
    else if (consistencyScore > 65) status = 'Good';
    else if (consistencyScore > 40) status = 'Fair';

    const totalSavings = values.months.reduce((acc, m) => acc + m.savings, 0);

    const chartData = values.months.map((m, i) => ({
      name: `Month ${i + 1}`,
      income: m.income,
      savings: m.savings,
      savingsRate: m.income > 0 ? (m.savings / m.income) * 100 : 0,
    }));

    setResult({
      consistencyScore,
      averageSavingsRate: averageSavingsRate * 100,
      totalSavings,
      savingsVolatility,
      status,
      chartData,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            Wealth Consistency Tracker
          </CardTitle>
          <CardDescription>
            Enter your income and savings for the past few months to measure your savings consistency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-lg relative">
                  <h4 className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground">Month {index + 1}</h4>
                  <FormField
                    control={form.control}
                    name={`months.${index}.income`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`months.${index}.savings`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Savings</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => append({ income: undefined as unknown as number, savings: undefined as unknown as number })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Month
                </Button>
                <Button type="submit">
                  Analyze Consistency
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Wealth Consistency Score</CardTitle>
              <CardDescription>
                An assessment of your ability to save consistently relative to your income.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Score', score: result.consistencyScore }]}>
                    <XAxis dataKey="name" hide />
                    <YAxis type="number" domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ display: 'none' }} />
                    <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={80}>
                      <Cell fill={COLORS[result.status]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-bold" style={{ color: COLORS[result.status] }}>
                    {result.consistencyScore}
                  </span>
                  <span className="text-lg font-medium" style={{ color: COLORS[result.status] }}>
                    {result.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Average Savings Rate</h4>
                  <p className="text-2xl font-bold text-primary">{result.averageSavingsRate.toFixed(1)}%</p>
                  <p className="text-sm">You save this percentage of your income on average.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Savings Volatility</h4>
                  <p className="text-2xl font-bold text-primary">{result.savingsVolatility.toFixed(1)}%</p>
                  <p className="text-sm">A measure of how much your savings rate fluctuates. Lower is better.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Total Savings</h4>
                  <p className="text-2xl font-bold text-primary">{formatNumberUS(result.totalSavings)}</p>
                  <p className="text-sm">Total amount saved across the analyzed period.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatNumberUS(value)} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'savingsRate') return [`${(value as number).toFixed(1)}%`, 'Savings Rate'];
                    return [formatNumberUS(value as number), name === 'income' ? 'Income' : 'Savings'];
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="income" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Income" />
                  <Line yAxisId="left" type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={2} name="Savings" />
                  <Line yAxisId="right" type="monotone" dataKey="savingsRate" stroke="hsl(var(--chart-2))" strokeDasharray="5 5" name="Savings Rate" />
                </LineChart>
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
              Understanding the Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Consistency Score</h4>
              <p className="text-muted-foreground">A score from 0-100 that measures how stable your savings habits are. It combines your savings rate's stability (volatility) and its magnitude. A high score means you are a disciplined and effective saver.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Average Savings Rate</h4>
              <p className="text-muted-foreground">The average percentage of your income that you save each month. A higher rate accelerates wealth building. Experts recommend at least 20%.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Savings Volatility</h4>
              <p className="text-muted-foreground">Measures how much your savings rate fluctuates. High volatility indicates inconsistent savings habits, which can derail long-term financial goals. Lower is better.</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <h4 className="font-semibold">Total Savings</h4>
              <p className="text-muted-foreground">The cumulative amount you've saved over the analyzed period. This is the direct result of your savings efforts.</p>
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
              <li><Link href="/compound-interest-calculator" className="hover:underline">Compound Interest Calculator</Link></li>
              <li><Link href="/return-on-investment-calculator" className="hover:underline">Return on Investment (ROI) Calculator</Link></li>
              <li><Link href="/monthly-budget-planner-calculator" className="hover:underline">Monthly Budget Planner</Link></li>
              <li><Link href="/emergency-fund-requirement-calculator" className="hover:underline">Emergency Fund Requirement Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Ultimate Guide to Building Wealth Through Consistency</h1>
          <p className="text-lg italic">Discover why consistency, not income, is the true engine of wealth creation. Learn to master your savings habits and build a durable financial future.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Consistency Beats Intensity</h2>
          <p>In personal finance, the most common misconception is that a high income is the only path to wealth. While income is important, the true determinant of long-term financial success is <strong className="font-semibold">consistency</strong>. A person earning $60,000 who consistently saves 20% of their income will almost always build more wealth than someone earning $150,000 who saves erratically.</p>
          <p>Wealth isn't built in windfalls; it's built brick by brick, month by month. This calculator is designed to measure that process, shifting the focus from "How much did I save this month?" to "How consistently am I saving?"</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Science of a High Consistency Score</h2>
          <p>Our Consistency Score is engineered to reward two key behaviors:</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Low Volatility (The Stability Factor)</strong>
              <p>This measures the 'wobble' in your savings rate. If you save 20% one month, 5% the next, and 35% the month after, your volatility is high. This signals a reactive, rather than proactive, approach to savings. Financial stability is built on predictable habits. A low volatility score means you have a system in place that works regardless of minor financial ups and downs.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">High Savings Rate (The Magnitude Factor)</strong>
              <p>While stability is crucial, the amount you save still matters. Consistently saving 2% is stable, but not effective. This part of the score rewards you for the actual percentage of income you're putting away. The higher your average savings rate, the faster your wealth compounds.</p>
            </li>
          </ol>
          <p className="mt-4">By combining these two factors, the score provides a holistic view of your financial discipline. It's not just about saving, but about building a <strong className="font-semibold">resilient savings system</strong>.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Actionable Strategies to Boost Your Consistency Score</h2>
          <p>A low score isn't a failure; it's a diagnostic tool. Here’s how to improve it:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Pay Yourself First:</strong> This is the golden rule. Automate a transfer from your checking account to your savings/investment account the day you get paid. Treat savings as a non-negotiable bill. This single action is the most effective way to reduce volatility.</li>
            <li><strong className="font-semibold">Implement a 50/30/20 Budget:</strong> A simple yet powerful framework. Allocate 50% of your after-tax income to Needs (housing, utilities), 30% to Wants (dining out, hobbies), and <strong className="text-foreground">20% to Savings</strong>. This provides a clear target for your savings rate.</li>
            <li><strong className="font-semibold">Create 'Sinking Funds':</strong> High volatility is often caused by large, infrequent expenses (e.g., car repairs, vacations). Create separate savings accounts for these known future costs. By saving a small amount each month towards them, you prevent them from derailing your primary savings goal when they occur.</li>
            <li><strong className="font-semibold">Track Your Spending for One Month:</strong> You can't control what you don't measure. Use an app or a simple spreadsheet to see exactly where your money is going. This often reveals "spending leaks" that can be redirected towards savings.</li>
            <li><strong className="font-semibold">Gradually Increase Your Savings Rate:</strong> If you're currently at 5%, don't jump to 20% overnight. Increase it to 6% for a few months until it feels normal, then move to 7%, and so on. Small, sustainable increases are more effective than drastic, temporary changes.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: From Tracker to Habit</h2>
          <p>Use this tracker not as a judgment, but as a compass. Check in every quarter to see how your score is evolving. The goal is to transform the act of saving from a monthly decision into an unconscious habit. A high consistency score is a leading indicator of future financial freedom. It proves you have built the system, not just the intention, to succeed.</p>
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
              <h4 className="font-semibold mb-2">Why is a consistent savings rate so important?</h4>
              <p className="text-muted-foreground">Consistency builds discipline and makes saving a habit, not an afterthought. It also simplifies long-term financial projections and ensures you are steadily working towards your goals, rather than relying on occasional windfalls or "catching up" with large, unsustainable savings efforts.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a good savings rate to aim for?</h4>
              <p className="text-muted-foreground">Most financial experts recommend a savings rate of at least 20% of your after-tax income. This includes retirement contributions, investments, and cash savings. If you can't reach 20% now, start with a smaller percentage and gradually increase it over time.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">My income is variable. How can I be consistent?</h4>
              <p className="text-muted-foreground">For variable incomes, aim to save a consistent <strong className="text-foreground">percentage</strong> rather than a fixed amount. When you have a high-income month, the saved amount will be higher; in a low-income month, it will be lower, but the rate remains stable. This approach naturally adjusts to your income flow.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What does 'Savings Volatility' mean?</h4>
              <p className="text-muted-foreground">It's a statistical measure of how much your savings rate deviates from your average rate. A high volatility (e.g., above 50%) means your savings are erratic and unpredictable. A low volatility (e.g., under 20%) indicates you have a strong, disciplined habit. Lower is always better.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Should I include my 401(k) or retirement contributions in 'savings'?</h4>
              <p className="text-muted-foreground">Yes, absolutely. Savings are any part of your income that you set aside for the future, not spend. This includes contributions to retirement accounts (401k, IRA), brokerage accounts, and high-yield savings accounts.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I improve my low consistency score?</h4>
              <p className="text-muted-foreground">The fastest way is to <strong className="text-foreground">automate your savings</strong>. Set up an automatic transfer to your savings or investment account for the day you get paid. This "pays yourself first" and removes the temptation to spend the money, dramatically increasing consistency.</p>
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
            <p>This calculator analyzes your monthly income and savings to generate a "Wealth Consistency Score." It helps you understand the stability of your savings habits, which is a critical predictor of long-term financial success. Use the score and volatility metrics to diagnose weaknesses in your financial discipline and apply strategies to build a more robust, automated savings system.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
