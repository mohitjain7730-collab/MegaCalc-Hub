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
import { Landmark, TrendingUp, DollarSign, Info, ShoppingCart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  itemCost: z.number().positive('Item cost must be positive.'),
  purchaseFrequency: z.number().positive('Purchase frequency must be positive.'),
  frequencyUnit: z.enum(['weekly', 'monthly', 'yearly']),
  annualReturnRate: z.number().positive('Annual return rate must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  annualSpending: number;
  opportunityCost10Y: number;
  opportunityCost20Y: number;
  opportunityCost30Y: number;
  chartData: { name: string; 'Opportunity Cost': number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const FREQUENCY_MULTIPLIER = {
  weekly: 52,
  monthly: 12,
  yearly: 1,
};

export default function CompulsiveBuyingImpactCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemCost: undefined,
      purchaseFrequency: undefined,
      frequencyUnit: 'monthly',
      annualReturnRate: undefined,
    },
  });

  const calculateFutureValueAnnuity = (monthlyPayment: number, rate: number, years: number) => {
    const monthlyRate = rate / 12 / 100;
    const n = years * 12;
    if (monthlyRate === 0) return monthlyPayment * n;
    return monthlyPayment * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
  };

  const onSubmit = (values: FormValues) => {
    const { itemCost, purchaseFrequency, frequencyUnit, annualReturnRate } = values;

    const annualSpending = itemCost * purchaseFrequency * FREQUENCY_MULTIPLIER[frequencyUnit];
    const monthlySpending = annualSpending / 12;

    const opportunityCost10Y = calculateFutureValueAnnuity(monthlySpending, annualReturnRate, 10);
    const opportunityCost20Y = calculateFutureValueAnnuity(monthlySpending, annualReturnRate, 20);
    const opportunityCost30Y = calculateFutureValueAnnuity(monthlySpending, annualReturnRate, 30);

    setResult({
      annualSpending,
      opportunityCost10Y,
      opportunityCost20Y,
      opportunityCost30Y,
      chartData: [
        { name: '10 Years', 'Opportunity Cost': opportunityCost10Y },
        { name: '20 Years', 'Opportunity Cost': opportunityCost20Y },
        { name: '30 Years', 'Opportunity Cost': opportunityCost30Y },
      ],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Compulsive Buying Impact Calculator
          </CardTitle>
          <CardDescription>
            Visualize the long-term financial impact of your recurring impulse purchases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="itemCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Per Purchase</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                          <Input type="number" className="pl-7" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many times?</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequencyUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How often?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Per Week</SelectItem>
                          <SelectItem value="monthly">Per Month</SelectItem>
                          <SelectItem value="yearly">Per Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualReturnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Return Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Impact
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The True Cost of Your Purchases</CardTitle>
              <CardDescription>
                You are spending an estimated <strong className="text-primary">{formatNumberUS(result.annualSpending)}</strong> per year on this habit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-6 bg-destructive/10 rounded-lg text-center">
                <h4 className="text-sm font-medium text-muted-foreground">The Real Cost is Not What You Spend, It's What You Lose</h4>
                <p className="text-4xl font-bold text-destructive">{formatNumberUS(result.opportunityCost30Y)}</p>
                <p className="text-muted-foreground mt-1">This is the potential wealth you could have after 30 years by investing that money instead.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Potential Value in 10 Years</h4>
                  <p className="text-3xl font-bold text-primary">{formatNumberUS(result.opportunityCost10Y)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Potential Value in 20 Years</h4>
                  <p className="text-3xl font-bold text-primary">{formatNumberUS(result.opportunityCost20Y)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visualizing Your Lost Growth</CardTitle>
              <CardDescription>
                This shows how the invested value of your spending grows over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatNumberUS(value as number, { notation: 'compact', compactDisplay: 'short' })} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatNumberUS(value as number)} contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }} />
                  <Bar dataKey="Opportunity Cost" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding Opportunity Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This calculator demonstrates a powerful financial concept called <strong className="text-foreground">Opportunity Cost</strong>. Every dollar you spend on one thing is a dollar you cannot spend—or invest—somewhere else. A $50 impulse buy isn't just a $50 loss; it's the loss of the decades of potential growth that $50 could have generated.</p>
            <p>By quantifying this lost potential, the calculator reframes compulsive spending from a minor indulgence to a major obstacle to wealth creation. It shifts the question from "Can I afford this today?" to "What am I giving up in the future to have this now?" This change in perspective is a critical first step toward building financial discipline.</p>
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Silent Wealth Killer: A Deep Dive into Compulsive Buying and Its Financial Fallout</h1>
          <p className="text-lg italic">It's not the one-off splurge that sinks your financial ship, but the steady leak of small, impulsive purchases. This guide explores the psychology behind compulsive buying and provides a roadmap to reclaim your financial future.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Compulsive Buying Disorder (CBD)?</h2>
          <p>Compulsive Buying Disorder, also known as oniomania, is a behavioral addiction characterized by an obsession with shopping and buying, and an inability to control these urges. While this calculator is a tool for anyone who struggles with impulse spending, understanding the clinical definition sheds light on the powerful psychological forces at play. It’s not just a "bad habit"; for many, it's a deeply ingrained behavioral pattern used to cope with negative emotions like anxiety, depression, or low self-esteem.</p>
          <div>
            <p>The pattern typically involves a cycle:</p>
            <ol className="list-decimal ml-6 mt-2 space-y-2">
              <li><strong className="font-semibold text-foreground">Anticipation:</strong> An intense preoccupation with buying a specific item or simply the act of shopping.</li>
              <li><strong className="font-semibold text-foreground">Preparation:</strong> Researching products, planning shopping trips, and experiencing a growing excitement.</li>
              <li><strong className="font-semibold text-foreground">Shopping:</strong> A thrilling, euphoric "high" experienced at the moment of purchase. This is the peak of the emotional cycle.</li>
              <li><strong className="font-semibold text-foreground">Spending:</strong> The culmination of the urge, often leading to financial outlays that are not planned for or affordable.</li>
              <li><strong className="font-semibold text-foreground">Post-Purchase Disappointment:</strong> The initial high quickly fades, replaced by feelings of guilt, shame, anxiety, and regret over the financial consequences. This emotional crash often triggers the cycle to begin again as a way to self-medicate the new negative feelings.</li>
            </ol>
          </div>
          <p>Recognizing that compulsive spending is often a symptom of a deeper emotional need is the first step toward addressing it. It's not about a lack of willpower; it's about a misaligned coping mechanism.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Financial Devastation of Opportunity Cost</h2>
          <p>As this calculator powerfully demonstrates, the true financial damage of compulsive buying isn't the line item on your credit card statement; it's the <strong className="text-primary">opportunity cost</strong>. This is one of the most fundamental and misunderstood concepts in personal finance.</p>
          <p>Let's break it down. Imagine you spend $200 a month on impulse online purchases. That's $2,400 a year. Many people stop their analysis there. "It's only $2,400, I can afford that." But the real calculation is far more sobering. If you had invested that $200 a month into a simple S&P 500 index fund and earned a historically average return of 8% per year, the numbers would look like this:</p>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li>After 10 years, you would have invested $24,000, but your balance could be over <strong className="font-semibold text-foreground">$36,000</strong>.</li>
            <li>After 20 years, you would have invested $48,000, but your balance could be over <strong className="font-semibold text-foreground">$118,000</strong>.</li>
            <li>After 30 years, you would have invested $72,000, but your balance could be over <strong className="font-semibold text-foreground">$295,000</strong>.</li>
          </ul>
          <p>The "cost" of that $200/month habit wasn't just $72,000. It was the nearly <strong className="text-destructive">$300,000</strong> future you that you gave up for a series of short-term dopamine hits. Every small purchase is a seed. You can either plant it in the fertile ground of the stock market and watch it grow into a tree, or you can consume it immediately for a fleeting moment of satisfaction. Compulsive buying is the act of consistently eating your seeds.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Actionable Strategies to Break the Cycle</h2>
          <p>Overcoming compulsive buying requires building intentional friction into your spending process and finding healthier coping mechanisms. It's about changing your behavior, not just your budget.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">The 72-Hour Rule:</strong> This is the single most effective tactic. For any non-essential purchase over a certain amount (e.g., $50), put it in your online cart or write it down, but do not buy it. Force yourself to wait 72 hours. The intense, emotion-driven urge to buy has a short half-life. After three days, the "need" will have faded significantly, and you can make a more rational decision. You'll be surprised how many items you no longer want.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Identify Your Triggers:</strong> Keep a small notebook or a note on your phone. Every time you feel a strong urge to buy something, write down what you're feeling. Are you bored? Stressed from work? Anxious about a social situation? Feeling lonely? Recognizing the emotional trigger is the key to finding a healthier substitute. If you're bored, call a friend. If you're stressed, go for a walk. Replace the coping mechanism of "shopping" with something that actually addresses the root emotion.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Curate Your Environment:</strong> You are a product of your environment. Make it harder to spend impulsively.
              <ul className="list-disc ml-8 mt-2 space-y-1">
                <li>Unsubscribe from all marketing emails. The "unsubscribe" link is your best friend.</li>
                <li>Delete shopping apps from your phone. Force yourself to use a web browser, which is less seamless.</li>
                <li>Do not save your credit card information on websites. The act of manually entering your card number provides a crucial moment of friction to reconsider the purchase.</li>
                <li>Unfollow influencers and social media accounts that exist solely to promote products and consumption.</li>
              </ul>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Automate Your Financial Goals:</strong> Make your future goals more tangible than your present urges. The same day you get paid, have automatic transfers set up to move money into your investment accounts, your high-yield savings account, and your debt-repayment funds. When the money is already allocated to a future purpose, it mentally "disappears" from your pool of available spending money. This is "paying yourself first" in its most powerful form.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Use Cash for Discretionary Spending:</strong> For categories where you tend to overspend (like dining out or hobbies), use a cash envelope system. At the beginning of the month, withdraw a set amount of cash for that category. When the cash is gone, you're done spending for the month. The physical, tangible nature of cash makes the spending feel more real than a credit card swipe.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Seek Professional Help:</strong> If your spending feels truly out of control and is causing significant financial and emotional distress, do not hesitate to seek help. A therapist specializing in cognitive-behavioral therapy (CBT) can provide tools to manage the underlying addiction. Financial counseling and groups like Debtors Anonymous can also provide invaluable support and structure.
            </li>
          </ol>
          <p className="mt-4">Breaking the cycle of compulsive buying is a journey of self-awareness and behavioral change. By using tools like this calculator to understand the monumental long-term stakes, and by implementing practical strategies to manage your urges, you can redirect your financial energy from short-term gratification to long-term freedom.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is opportunity cost?</h4>
              <p className="text-muted-foreground">It's the potential gain you miss out on when you choose one alternative over another. In finance, it's the money your purchases could have earned if they had been invested instead. This calculator's main purpose is to quantify this cost.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is it bad to ever spend money on things I enjoy?</h4>
              <p className="text-muted-foreground">Absolutely not! The goal isn't to live a life of extreme deprivation. It's about being <strong className="text-foreground">intentional</strong> with your spending. Consciously budgeting for things that bring you genuine, lasting joy is healthy. This calculator targets <strong className="text-foreground">mindless, repetitive, and compulsive</strong> purchases that often lead to regret.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's a realistic annual return rate to use for my calculation?</h4>
              <p className="text-muted-foreground">A rate of 7-8% is a commonly used long-term average for a diversified stock portfolio (like an S&P 500 index fund), adjusted for inflation. Using 10% reflects the historical average before inflation. It's generally wise to use a more conservative number like 7%.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I track my impulse spending to use this calculator accurately?</h4>
              <p className="text-muted-foreground">Review your credit card and bank statements for the last month. Look for recurring, non-essential purchases (e.g., daily coffees, takeout lunches, online shopping from specific sites). Categorize and add them up to get a baseline for your 'item cost' and 'frequency'.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">The opportunity cost numbers seem huge. Are they realistic?</h4>
              <p className="text-muted-foreground">Yes, they are. This is the power of compound interest working over long periods. Small, consistent amounts, when invested, can grow into very large sums over decades. The calculator simply reveals the mathematical reality of compounding.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's the first step I should take after seeing my results?</h4>
              <p className="text-muted-foreground">Implement the <strong className="text-foreground">72-Hour Rule</strong>. The next time you feel an urge to make an impulse buy, force yourself to wait 72 hours before purchasing. This simple act of creating a "cooling-off" period is often enough to break the emotional cycle and is the most effective first step.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator is designed to expose the hidden long-term cost of compulsive and impulsive spending. By calculating the opportunity cost—the potential wealth you forfeit by spending instead of investing—it transforms small, seemingly insignificant purchases into major financial decisions. The tool's primary purpose is to foster financial awareness and motivate a shift from mindless consumption to intentional wealth building.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
