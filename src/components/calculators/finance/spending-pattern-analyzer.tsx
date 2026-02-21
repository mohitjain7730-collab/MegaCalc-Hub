'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, PlusCircle, Trash2, PieChart, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required."),
  amount: z.number().positive("Amount must be positive."),
});

const formSchema = z.object({
  expenses: z.array(expenseSchema).min(1, 'Please add at least one expense.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalSpending: number;
  chartData: { name: string; value: number }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function SpendingPatternAnalyzer() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenses: [{ name: '', amount: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  const resetForm = () => {
    form.reset({
      expenses: [{ name: '', amount: undefined }],
    });
    setResult(null);
  };

  const onSubmit = (values: FormValues) => {
    const totalSpending = values.expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);

    const chartData = values.expenses.map(expense => ({
      name: expense.name,
      value: expense.amount || 0,
    }));

    // Generate Recommendations
    const recommendations = [];
    const sortedExpenses = [...values.expenses].sort((a, b) => (b.amount || 0) - (a.amount || 0));

    if (sortedExpenses.length > 0) {
      const topExpense = sortedExpenses[0];
      const percent = ((topExpense.amount || 0) / totalSpending) * 100;
      recommendations.push(`**${topExpense.name}** is your largest expense, consuming **${percent.toFixed(1)}%** of your total spending.`);
      if (percent > 40) {
        recommendations.push("This single category dominates your budget. Finding ways to reduce it even slightly will have the biggest impact.");
      }
    }

    if (totalSpending > 0) {
      recommendations.push(`Your total monthly spending is **${formatNumberUS(totalSpending)}**. Annualized, this is **${formatNumberUS(totalSpending * 12)}**.`);
    }

    // Generate Action Plan
    const plan = [
      { label: 'The 10% Cut', detail: 'Challenge yourself to reduce your top 3 expense categories by just 10% next month.' },
      { label: 'Negotiate Bills', detail: 'Call service providers (internet, insurance, phone) for your recurring fixed costs and ask for a better rate.' },
      { label: 'Track Daily', detail: 'For one week, write down every single penny you spend to identify "leakage" in your budget.' }
    ];

    setResult({
      totalSpending,
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
            <PieChart className="h-5 w-5" />
            Spending Pattern Analyzer
          </CardTitle>
          <CardDescription>
            Input your monthly expenses to understand where your money is going and identify potential savings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Monthly Expenses</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg relative">
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Expense Category {index + 1}</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Rent/Mortgage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="w-48">
                            <FormLabel>Monthly Amount</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 1500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', amount: undefined as unknown as number })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </div>
              <div className="flex gap-4">
                <Button type="submit">Analyze Spending</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Monthly Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Total Monthly Spending</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.totalSpending)}</p>
              </div>
              <div className="mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
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
          "name": "Spending Pattern Analyzer",
          "description": "Input your monthly expenses to understand where your money is going and identify potential savings.",
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Concept</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>A spending pattern analysis is the process of tracking where your money goes. It's the foundational step of creating a budget and building financial awareness. By categorizing your expenses, you can clearly see the big picture of your financial life, moving from vague guesses to concrete data.</p>
            <p>This calculator isn't about judging your spending; it's about empowering you with knowledge. The visual breakdown helps you quickly identify which areas consume the largest portion of your income, highlighting potential opportunities to save, invest, or reallocate funds toward your most important financial goals.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Explained</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Spending Calculation</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Total Spending = SUM(Expense 1, Expense 2, ... Expense N)</p>
              <p className="mt-2">The calculator performs a simple summation of all the expense amounts you enter to arrive at your total monthly spending figure.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Category Percentage</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Category % = (Category Amount / Total Spending) * 100</p>
              <p className="mt-2">For the pie chart, each expense category's percentage of the whole is calculated by dividing its individual amount by the total spending. This shows the proportional impact of each category on your overall budget.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/finance/savings-rate-vs-goal-timeline-visualizer" className="hover:underline">Savings Rate Goal Visualizer</Link></li>
              <li><Link href="/finance/delayed-gratification-roi-calculator" className="hover:underline">Delayed Gratification ROI Calculator</Link></li>
              <li><Link href="/finance/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Your Money: The Ultimate Guide to Analyzing Your Spending</h1>
          <p className="text-lg italic">Financial freedom doesn't start with earning more; it starts with understanding where your money is going right now. Analyzing your spending is the most powerful first step you can take to gain control of your finances, reduce stress, and accelerate your progress toward your biggest goals.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Tracking Your Spending is a Non-Negotiable Financial Habit</h2>
          <p>Many people resist tracking their spending because they fear it will be restrictive or they're afraid of what they'll find. In reality, it's the opposite: tracking your spending is an act of liberation. It replaces financial anxiety with clarity and empowerment.</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold text-foreground">It Exposes the Truth:</strong> You might think you spend $100 a month on takeout, but the data could reveal it's actually $400. This "aha!" moment is often the catalyst for powerful change. This calculator provides that clarity instantly.</li>
            <li><strong className="font-semibold text-foreground">It Aligns Spending with Values:</strong> Does your spending reflect what's most important to you? If you value travel and new experiences but see that a huge chunk of your income goes to subscription services you barely use, you've identified a misalignment. Tracking allows you to consciously redirect your resources toward what truly brings you joy and fulfillment.</li>
            <li><strong className="font-semibold text-foreground">It Uncovers "Financial Leaks":</strong> Small, mindless purchases—the daily coffee, the vending machine snack, the in-app purchase—add up. A spending analysis reveals these leaks, which often represent the easiest and most painless areas to cut back on, freeing up significant cash flow for saving or investing.</li>
            <li><strong className="font-semibold text-foreground">It Enables Goal Setting:</strong> You can't chart a course to a destination without knowing your starting point. Want to save for a down payment, invest for retirement, or pay off debt? Knowing your exact monthly surplus (or deficit) is essential to creating a realistic timeline and action plan.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">A Step-by-Step Guide to Using This Analyzer Effectively</h2>
          <p>To get the most out of this tool, you need accurate data. Follow this process for a comprehensive financial snapshot.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Gather Your Data:</strong> Collect at least one full month's worth of financial statements. This includes all credit cards, debit cards, and bank accounts. Don't forget to account for cash spending.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Categorize Every Transaction:</strong> This is the most labor-intensive but most valuable part. Group every single expense into a category. Start with broad categories and get more specific if needed. Common categories include:
              <ul className="list-circle pl-6 mt-2 space-y-2">
                <li><strong>Housing:</strong> Rent/Mortgage, property taxes, insurance, maintenance.</li>
                <li><strong>Transportation:</strong> Car payments, gas, insurance, public transit, ride-sharing.</li>
                <li><strong>Food:</strong> Groceries, restaurants, coffee shops.</li>
                <li><strong>Utilities:</strong> Electricity, water, gas, internet, phone.</li>
                <li><strong>Personal Care:</strong> Haircuts, toiletries, gym memberships.</li>
                <li><strong>Entertainment:</strong> Streaming services, movies, concerts, subscriptions.</li>
                <li><strong>Debt Payments:</strong> Student loans, credit card payments (the minimum payment part, not the whole bill if you pay in full).</li>
                <li><strong>Miscellaneous:</strong> Everything else. If this category is too big, you need to break it down further!</li>
              </ul>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Input the Totals into the Analyzer:</strong> Add up the total for each category you created and plug the names and amounts into the calculator above. This will generate your personalized spending pie chart.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Analyze and Act:</strong> Look at your results. Are you surprised? Where are the opportunities? This is where you can apply popular budgeting frameworks.</li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Interpreting Your Results: The 50/30/20 Rule</h2>
          <p>One of the most popular budgeting guidelines is the 50/30/20 rule. It provides a simple framework for allocating your after-tax income. Compare your spending analysis results to this rule to see how you stack up:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong className="font-semibold text-foreground">50% for Needs:</strong> This category includes all your essential expenses required for survival. This is your rent or mortgage, utilities, essential groceries, transportation to work, and insurance. If this category is well over 50% of your income, it might indicate a housing or transportation affordability issue.
            </li>
            <li>
              <strong className="font-semibold text-foreground">30% for Wants:</strong> This is the fun stuff. It includes dining out, shopping for non-essentials, hobbies, travel, and entertainment. This is often the most flexible category and the first place to look for potential savings. If your analysis shows a high percentage here, you can ask yourself: "Is this spending bringing me proportional joy?"
            </li>
            <li>
              <strong className="font-semibold text-foreground">20% for Savings & Debt Repayment:</strong> This is the category that builds your future. It includes contributions to retirement accounts (like a 401(k) or IRA), building an emergency fund, and making extra payments on high-interest debt (like credit cards). If this percentage is low, your top priority should be finding ways to increase it by reducing your "Wants" or, if necessary, your "Needs."
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: From Analysis to Action</h2>
          <p>A spending analysis is not a one-time event; it's a regular financial check-up. Do it quarterly or semi-annually to stay on track. Using this calculator provides the data-driven foundation you need to stop guessing and start owning your financial future. It transforms your bank statement from a source of confusion into a roadmap, showing you exactly where you are and helping you chart a course to where you want to be. The clarity you gain is the most valuable return on the time you invest.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How should I categorize my expenses?</h4>
              <p className="text-muted-foreground">There's no single right way. The key is to be consistent. You can start with broad categories like "Housing," "Food," and "Transportation" and create subcategories as needed. The goal is to create a system that makes sense to you and accurately reflects your unique spending habits.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">This seems like a lot of work. Are there any apps to help?</h4>
              <p className="text-muted-foreground">Yes, many apps (like Mint, YNAB, or Copilot) automate this process by linking to your bank accounts and auto-categorizing transactions. However, doing it manually for at least one month, as this calculator encourages, provides a powerful learning experience that apps can't replicate. The physical act of reviewing each expense builds a much stronger awareness.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if my income is irregular?</h4>
              <p className="text-muted-foreground">If you're a freelancer or have variable income, it's best to analyze your spending over a longer period, like three to six months, to get an average. Then, build your budget based on your lowest-earning month to ensure you can always cover your "Needs."</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's the difference between a spending analysis and a budget?</h4>
              <p className="text-muted-foreground">A spending analysis is backward-looking: it tells you where your money *went*. A budget is forward-looking: it's a plan for where your money *will go*. You must do a spending analysis first to create a realistic and effective budget.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">My "Needs" category is over 50%. What should I do?</h4>
              <p className="text-muted-foreground">This is a common issue, often due to high housing or transportation costs. It may indicate a need to consider more significant life changes, such as finding a cheaper place to live, getting a roommate, or exploring less expensive transportation options. It's a tough situation, but having the data is the first step to confronting it.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator is a fundamental budgeting tool that transforms your raw spending data into a clear, visual analysis. By inputting your expenses, you can instantly see a breakdown of your financial life, allowing you to identify areas of overspending, align your money with your values, and make informed decisions. It’s the essential first step toward creating a budget, reducing financial stress, and achieving your long-term goals.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
