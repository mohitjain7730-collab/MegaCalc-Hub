'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, Info, Gauge } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  monthlyIncome: z.number().positive('Monthly income is required.'),
  monthlySavings: z.number().nonnegative('Savings cannot be negative.'),
  totalDebt: z.number().nonnegative('Total debt cannot be negative.'),
  liquidAssets: z.number().nonnegative('Liquid assets cannot be negative.'),
  monthlyHousingCost: z.number().nonnegative('Housing cost cannot be negative.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ScoreResult {
  totalScore: number;
  savingsScore: number;
  debtScore: number;
  emergencyFundScore: number;
  housingScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  chartData: { subject: string, score: number, fullMark: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const COLORS = {
  Excellent: 'hsl(var(--chart-2))', // Green
  Good: 'hsl(var(--chart-1))',      // Blue
  Fair: 'hsl(var(--chart-4))',      // Orange
  'Needs Improvement': 'hsl(var(--destructive))',  // Red
};

export default function FinancialHealthScoreCalculator() {
  const [result, setResult] = useState<ScoreResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: undefined,
      monthlySavings: undefined,
      totalDebt: undefined,
      liquidAssets: undefined,
      monthlyHousingCost: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monthlyIncome, monthlySavings, totalDebt, liquidAssets, monthlyHousingCost } = values;
    const annualIncome = monthlyIncome * 12;

    // 1. Savings Rate Score (25 points)
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) : 0;
    let savingsScore = 0;
    if (savingsRate >= 0.2) savingsScore = 25;
    else if (savingsRate >= 0.15) savingsScore = 20;
    else if (savingsRate >= 0.1) savingsScore = 15;
    else if (savingsRate >= 0.05) savingsScore = 10;
    else savingsScore = 5;

    // 2. Debt-to-Income Ratio Score (25 points)
    const debtToIncomeRatio = annualIncome > 0 ? (totalDebt / annualIncome) : Infinity;
    let debtScore = 0;
    if (debtToIncomeRatio < 0.5) debtScore = 25;
    else if (debtToIncomeRatio < 1) debtScore = 20;
    else if (debtToIncomeRatio < 1.5) debtScore = 15;
    else if (debtToIncomeRatio < 2) debtScore = 10;
    else debtScore = 5;

    // 3. Emergency Fund Score (25 points)
    const monthlyExpenses = monthlyHousingCost + (monthlyIncome - monthlySavings - monthlyHousingCost) * 0.7; // Estimate
    const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
    let emergencyFundScore = 0;
    if (emergencyFundMonths >= 6) emergencyFundScore = 25;
    else if (emergencyFundMonths >= 4) emergencyFundScore = 20;
    else if (emergencyFundMonths >= 3) emergencyFundScore = 15;
    else if (emergencyFundMonths >= 1) emergencyFundScore = 10;
    else emergencyFundScore = 5;

    // 4. Housing Cost Score (25 points)
    const housingCostRatio = monthlyIncome > 0 ? (monthlyHousingCost / monthlyIncome) : 0;
    let housingScore = 0;
    if (housingCostRatio <= 0.28) housingScore = 25;
    else if (housingCostRatio <= 0.33) housingScore = 20;
    else if (housingCostRatio <= 0.4) housingScore = 15;
    else if (housingCostRatio <= 0.5) housingScore = 10;
    else housingScore = 5;

    const totalScore = savingsScore + debtScore + emergencyFundScore + housingScore;

    let status: ScoreResult['status'] = 'Needs Improvement';
    if (totalScore >= 85) status = 'Excellent';
    else if (totalScore >= 70) status = 'Good';
    else if (totalScore >= 50) status = 'Fair';

    setResult({
      totalScore,
      savingsScore,
      debtScore,
      emergencyFundScore,
      housingScore,
      status,
      chartData: [
        { subject: 'Savings', score: savingsScore, fullMark: 25 },
        { subject: 'Debt', score: debtScore, fullMark: 25 },
        { subject: 'Emergency Fund', score: emergencyFundScore, fullMark: 25 },
        { subject: 'Housing', score: housingScore, fullMark: 25 },
      ],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Financial Health Score Calculator
          </CardTitle>
          <CardDescription>
            Get a snapshot of your financial health based on key metrics.
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
                      <FormLabel>Gross Monthly Income</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 6000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlySavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Monthly Savings</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Debt (excl. mortgage)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liquidAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liquid Assets (Emergency Fund)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyHousingCost"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Total Monthly Housing Cost (Rent/Mortgage)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate My Score
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Financial Health Score</CardTitle>
              <CardDescription>
                Your overall score is <strong style={{ color: COLORS[result.status] }}>{result.totalScore} out of 100</strong>, which is considered <strong style={{ color: COLORS[result.status] }}>{result.status}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar name="Your Score" dataKey="score" stroke={COLORS[result.status]} fill={COLORS[result.status]} fillOpacity={0.6} />
                    <Tooltip contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold" style={{ color: COLORS[result.status] }}>Your {result.status} Score Breakdown:</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.status === 'Excellent' && 'You are in a superb financial position. Your habits for saving, managing debt, and preparing for emergencies are top-notch. Focus on optimizing your investments and staying the course.'}
                    {result.status === 'Good' && 'You are on the right track with solid financial habits. You have a good foundation, but there are opportunities to improve, perhaps by increasing your savings rate or accelerating debt repayment.'}
                    {result.status === 'Fair' && 'You have some positive financial habits, but there are areas of concern. You may be over-leveraged on debt or have an insufficient emergency fund. It\'s a good time to create a clear action plan.'}
                    {result.status === 'Needs Improvement' && 'Your finances may be a source of stress. Key areas like savings, debt, or emergency preparedness require immediate attention. It\'s crucial to take small, consistent steps to build a stronger foundation.'}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Savings Score:</span>
                  <span className="font-bold">{result.savingsScore}/25</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Debt Score:</span>
                  <span className="font-bold">{result.debtScore}/25</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Emergency Fund Score:</span>
                  <span className="font-bold">{result.emergencyFundScore}/25</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Housing Score:</span>
                  <span className="font-bold">{result.housingScore}/25</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Your Financial Health Score is like a credit score for your personal financial habits. It's a snapshot in time, designed to show you where you're strong and where you have opportunities to improve. It's not a judgment, but a diagnostic tool.</p>
            <p>The score is based on four pillars of financial stability:
              <strong className="text-foreground"> Savings Rate</strong> (your wealth-building engine),
              <strong className="text-foreground"> Debt Load</strong> (your financial drag),
              <strong className="text-foreground"> Emergency Preparedness</strong> (your financial shield), and
              <strong className="text-foreground"> Housing Affordability</strong> (your biggest expense).
              A balanced, high score across all categories is the hallmark of a resilient financial life.
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
              <li><Link href="/category/finance/compound-interest-calculator" className="hover:underline">Compound Interest Calculator</Link></li>
              <li><Link href="/category/finance/return-on-investment-calculator" className="hover:underline">Return on Investment (ROI) Calculator</Link></li>
              <li><Link href="/category/finance/monthly-budget-planner-calculator" className="hover:underline">Monthly Budget Planner</Link></li>
              <li><Link href="/category/finance/emergency-fund-requirement-calculator" className="hover:underline">Emergency Fund Requirement Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text_4xl font-extrabold text-foreground mb-4">The Ultimate Guide to a 100/100 Financial Health Score</h1>
          <p className="text-lg italic">Financial health isn't about being rich; it's about being resilient. This guide breaks down the four core pillars of a strong financial life and provides a clear, actionable playbook to improve your score and reduce financial stress.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Deconstructing the Four Pillars of Financial Health</h2>
          <p>Your financial life can feel complex and overwhelming. However, it can be distilled into four fundamental areas. Mastering these four pillars is the key to building a robust and stress-free financial future. Our Financial Health Score is a direct reflection of your performance in these domains.</p>

          <h3 className="text-xl font-bold text-foreground mt-6" id="pillar1">Pillar 1: The Savings Rate (Your Engine)</h3>
          <p>
            Your savings rate—the percentage of your income you set aside for the future—is the single most powerful driver of wealth creation. It's more important than your income and more important than your investment returns. A high savings rate can compensate for a lower income or mediocre investment performance. It is the engine of your financial plan.
          </p>
          <h4 className="font-semibold text-foreground mt-2">How to Maximize Your Savings Score:</h4>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>The 20%+ Gold Standard:</strong> To get a perfect score, you need to be saving at least 20% of your gross income. This includes all forms of savings: 401(k) contributions (including employer match), IRA contributions, brokerage investments, and cash savings.
            </li>
            <li><strong>Automate Everything ("Pay Yourself First"):</strong> This is the golden rule. Set up automatic transfers from your checking account to your savings and investment accounts on the day you get paid. Treat savings as a bill you must pay. This removes willpower from the equation.
            </li>
            <li><strong>Mind the Gap:</strong> Focus on the gap between your income and your expenses. The only two ways to increase your savings rate are to increase your income or decrease your expenses. Focus on the "Big 3": housing, transportation, and food, as they typically offer the biggest opportunities for savings.
            </li>
          </ul>

          <hr className="my-6" />

          <h3 className="text-xl font-bold text-foreground mt-6" id="pillar2">Pillar 2: Debt Management (Your Anchor)</h3>
          <p>
            Debt is a powerful tool that can either build you up (like a sensible mortgage) or tear you down (like high-interest credit card debt). Your debt score is a reflection of how much of your income is claimed by others before you even get to use it. A high debt load is like trying to run a race with a heavy anchor tied to your ankle.
          </p>
          <h4 className="font-semibold text-foreground mt-2">How to Maximize Your Debt Score:</h4>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Debt-to-Income Ratio:</strong> Our calculator measures your total non-mortgage debt relative to your annual income. A ratio below 50% (e.g., $40,000 in debt on an $80,000 income) is excellent. A ratio above 100% is a major red flag.
            </li>
            <li><strong>The Debt Avalanche Method:</strong> List all your debts from highest interest rate to lowest. Make minimum payments on all debts, but throw every extra dollar you have at the debt with the highest interest rate. This is the most mathematically efficient way to get out of debt. Once the highest-rate debt is gone, roll that entire payment into the next-highest-rate debt.
            </li>
            <li><strong>Avoid New "Bad Debt":</strong> Make a pact with yourself to never carry a balance on a credit card again. Avoid personal loans for depreciating assets like cars or vacations. Only take on debt for assets that have a high probability of increasing in value, like a home or a business.
            </li>
          </ul>

          <hr className="my-6" />

          <h3 className="text-xl font-bold text-foreground mt-6" id="pillar3">Pillar 3: Emergency Preparedness (Your Shield)</h3>
          <p>
            Life is unpredictable. Job losses, medical emergencies, and unexpected repairs are not a matter of if, but when. Your emergency fund is your shield. It's a pool of liquid cash that protects your long-term investment plan from short-term life shocks. Without it, a simple car repair can force you to sell investments at the worst possible time or go into high-interest debt.
          </p>
          <h4 className="font-semibold text-foreground mt-2">How to Maximize Your Emergency Fund Score:</h4>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>The 3-6 Month Rule:</strong> The gold standard is to have 3 to 6 months' worth of essential living expenses saved in a high-yield savings account. Essential expenses include housing, utilities, food, transportation, and minimum debt payments. To get a perfect score, you need 6+ months.
            </li>
            <li><strong>Calculate Your Number:</strong> Don't guess. Look at your past three months of bank statements and add up all the essential costs. Multiply that number by six. That is your emergency fund target.</li>
            <li><strong>Keep it Separate and Liquid:</strong> Your emergency fund should not be in the stock market or in a CD. It must be in a highly liquid, easily accessible savings account. It's not an investment; it's insurance. The low return it earns is the "premium" you pay for peace of mind.</li>
          </ul>

          <hr className="my-6" />

          <h3 className="text-xl font-bold text-foreground mt-6" id="pillar4">Pillar 4: Housing Affordability (Your Foundation)</h3>
          <p>For most people, housing is their single largest expense. Keeping it under control is the foundation of a healthy budget. When your housing cost is too high relative to your income, it starves all other financial goals. It becomes nearly impossible to maintain a high savings rate or pay down debt when the rent or mortgage check is too large.
          </p>
          <h4 className="font-semibold text-foreground mt-2">How to Maximize Your Housing Score:</h4>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>The 28% Rule:</strong> A long-standing rule of thumb in lending is that your total housing cost (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. Adhering to this guideline earns a perfect score.
            </li>
            <li><strong>"House-Poor" is a Trap:</strong> Be wary of stretching your budget to buy the biggest or best house you can "qualify" for. A lender's qualification is not a recommendation. Living in a smaller home or in a less expensive area can free up hundreds or thousands of dollars a month that can be deployed to your other financial goals.
            </li>
            <li><strong>Consider the Total Cost:</strong> Don't just look at the mortgage payment. Factor in property taxes, homeowner's insurance, potential HOA fees, and a budget for maintenance and repairs (a common estimate is 1% of the home's value per year).
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: A Journey of Incremental Improvement</h2>
          <p>A low score is not a reason for despair; it's a call to action. Don't try to fix everything at once. Pick the pillar with the lowest score and focus on making a small, incremental improvement this month. If your savings score is low, try to increase your savings rate by just 1%. If your debt score is low, find an extra $50 to put towards your highest-interest debt. Financial health is a marathon, not a sprint. By consistently taking small, positive steps in these four key areas, you will inevitably build a stronger, more resilient financial life.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why is Savings Rate so important for my score?</h4>
              <p className="text-muted-foreground">It's the primary engine for wealth creation. A high savings rate gives you the most control over your financial future, allowing you to build wealth regardless of market conditions. It's a direct measure of your financial discipline.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is considered "good debt" vs. "bad debt"?</h4>
              <p className="text-muted-foreground">"Good debt" is typically used to purchase assets that can grow in value, like a mortgage for a home or a loan for a business. "Bad debt" is used for consumption or on depreciating assets, such as credit card debt for vacations or high-interest car loans. This calculator focuses on non-mortgage debt, which is often "bad debt".</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why do I need 3-6 months in an emergency fund? It seems like a lot.</h4>
              <p className="text-muted-foreground">An emergency fund is your shield against life's unexpected events, like a job loss or a major medical bill. Having 3-6 months of expenses in cash prevents you from having to sell long-term investments or go into high-interest debt to cover a short-term crisis.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">My score is low. Where should I start?</h4>
              <p className="text-muted-foreground">Start with the category where you have the lowest score. If your Emergency Fund score is the lowest, make that your #1 priority. Building a small cash cushion provides the psychological and financial stability needed to then tackle other goals like debt repayment or increasing your savings rate.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does my credit score affect my financial health score?</h4>
              <p className="text-muted-foreground">Indirectly, yes. While this calculator doesn't ask for your credit score, the factors that lead to a good credit score (like low credit card balances and a history of on-time payments) are the same habits that lead to a good Debt Score and a good overall Financial Health Score.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How often should I check my Financial Health Score?</h4>
              <p className="text-muted-foreground">Checking your score every 6 to 12 months is a good cadence. It gives you enough time to make meaningful progress on your goals and see how your actions have impacted your overall financial picture. Think of it as an annual financial check-up.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>The Financial Health Score calculator provides a holistic, score-based assessment of your personal finances across four key pillars: savings, debt, emergency preparedness, and housing costs. By quantifying these critical areas, the tool helps you quickly identify your financial strengths and weaknesses. Use this score not as a final grade, but as a diagnostic tool to create a targeted action plan for improving your financial resilience and achieving long-term security.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
