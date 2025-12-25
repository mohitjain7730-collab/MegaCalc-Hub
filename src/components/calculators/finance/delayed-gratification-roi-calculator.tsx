'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, Clock, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const formSchema = z.object({
  purchaseCost: z.number().positive("Cost must be positive."),
  investmentReturnRate: z.number().min(0, "Return rate can't be negative."),
  yearsToInvest: z.number().positive("Years must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  futureValue: number;
  totalGrowth: number;
  chartData: { year: number; 'Investment Value': number; }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function DelayedGratificationROICalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchaseCost: undefined,
      investmentReturnRate: undefined,
      yearsToInvest: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      purchaseCost: undefined,
      investmentReturnRate: undefined,
      yearsToInvest: undefined,
    });
    setResult(null);
  };

  const onSubmit = (values: FormValues) => {
    const { purchaseCost, investmentReturnRate, yearsToInvest } = values;

    const rate = investmentReturnRate / 100;
    const futureValue = purchaseCost * Math.pow(1 + rate, yearsToInvest);
    const totalGrowth = futureValue - purchaseCost;

    const chartData = [];
    for (let year = 0; year <= yearsToInvest; year++) {
      const value = purchaseCost * Math.pow(1 + rate, year);
      chartData.push({ year, 'Investment Value': value });
    }

    // Generate Recommendations
    const recommendations = [];
    const multiplier = futureValue / purchaseCost;

    recommendations.push(`By delaying this purchase, you could turn **${formatNumberUS(purchaseCost)}** into **${formatNumberUS(futureValue)}** over ${yearsToInvest} years.`);
    recommendations.push(`That is a **${multiplier.toFixed(1)}x** return on your initial spending amount.`);

    if (totalGrowth > purchaseCost) {
      recommendations.push("The growth alone exceeds the initial cost of the item, effectively paying for itself and then some if invested instead.");
    }

    if (yearsToInvest < 5) {
      recommendations.push("Consider if you can delay this purchase even longer to take advantage of more significant compounding.");
    } else {
      recommendations.push("Your long time horizon allows compound interest to do the heavy lifting, significantly increasing the opportunity cost of this purchase.");
    }


    // Generate Action Plan
    const plan = [
      { label: 'Wait 72 Hours', detail: 'Implement a mandatory 3-day waiting period before making this purchase to see if the urge passes.' },
      { label: 'Calculate "Hours Worked"', detail: 'Divide the purchase price by your hourly wage to see how many hours of your life this item costs.' },
      { label: 'Automate the Savings', detail: 'If you decide not to buy, immediately transfer the purchase amount to your investment account.' }
    ];

    setResult({
      futureValue,
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
            <Clock className="h-5 w-5" />
            Delayed Gratification ROI Calculator
          </CardTitle>
          <CardDescription>
            See the potential future value of an immediate purchase if you invested the money instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="purchaseCost" render={({ field }) => (<FormItem><FormLabel>Cost of Immediate Purchase</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="investmentReturnRate" render={({ field }) => (<FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="yearsToInvest" render={({ field }) => (<FormItem><FormLabel>Years to Invest</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="flex gap-4">
                <Button type="submit">Calculate ROI</Button>
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
              <CardTitle>The Opportunity Cost of Your Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">That {formatNumberUS(form.getValues('purchaseCost'))} purchase could have grown to:</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.futureValue)}</p>
                <p className="text-muted-foreground mt-2">in {form.getValues('yearsToInvest')} years.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Initial Amount</h4>
                  <p className="text-2xl font-bold">{formatNumberUS(form.getValues('purchaseCost'))}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Growth</h4>
                  <p className="text-2xl font-bold text-green-600">{formatNumberUS(result.totalGrowth)}</p>
                </div>
              </div>

              <div className="mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <XAxis dataKey="year" name="Year" />
                    <YAxis name="Value" tickFormatter={(value) => formatNumberUS(value)} />
                    <Tooltip formatter={(value: number) => formatNumberUS(value)} labelFormatter={(label: number) => `Year: ${label}`} />
                    <Legend />
                    <Line type="monotone" dataKey="Investment Value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
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
          "name": "Delayed Gratification ROI Calculator",
          "description": "Calculate the potential future value of an immediate purchase if you invested the money instead.",
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
            <p>Delayed gratification is the ability to resist the temptation for an immediate reward and wait for a later, often larger or more enduring, reward. In finance, this translates to forgoing a discretionary purchase today in favor of investing that money for future growth.</p>
            <p>This calculator powerfully illustrates the <strong className="text-foreground">opportunity cost</strong> of spending. Every dollar you spend today is a dollar you can't invest for your future. By visualizing the potential return on investment (ROI) of that single purchase, you can make more conscious decisions that align with your long-term financial goals.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Explained</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Future Value of a Lump Sum</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Future Value = Present Value * (1 + Annual Rate) ^ Years</p>
              <p className="mt-2">This is the core formula for compound interest on a single, lump-sum investment. The calculator takes the "Present Value" (the cost of your purchase), applies the "Annual Rate" of return you expect, and compounds it over the number of "Years" you specify. The chart demonstrates how the value grows exponentially over time, with the growth accelerating in later years.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/category/finance/compound-interest-calculator" className="hover:underline">Sinking Fund Calculator</Link></li>
              <li><Link href="/category/finance/compound-interest-calculator" className="hover:underline">Subscription Audit Calculator</Link></li>
              <li><Link href="/category/finance/compound-interest-calculator" className="hover:underline">Lifestyle Creep Calculator</Link></li>
              <li><Link href="/category/finance/compound-interest-calculator" className="hover:underline">Opportunity Cost Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Billionaire's Mindset: A Guide to Delayed Gratification and Building Wealth</h1>
          <p className="text-lg italic">The ability to delay gratification is the single most powerful personality trait for financial success. It's the engine behind every savings account, every investment, and every fortune ever built. This guide explores why this skill is so critical and how you can cultivate it to transform your financial life.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Opportunity Cost and Why Does It Matter?</h2>
          <p>Opportunity cost is the concept that the true cost of something is what you give up to get it. When you buy a $1,000 phone, the cost isn't just the $1,000 you hand over. It's also the potential future value of that $1,000 if you had invested it. This calculator is designed to make that invisible opportunity cost visible and tangible.</p>
          <p>As the calculator shows, that $1,000, if invested with an average market return of 8% per year, could become:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold text-foreground">In 10 years:</strong> ~$2,159</li>
            <li><strong className="font-semibold text-foreground">In 20 years:</strong> ~$4,661</li>
            <li><strong className="font-semibold text-foreground">In 30 years:</strong> ~$10,063</li>
          </ul>
          <p>Suddenly, the question is no longer, "Is this phone worth $1,000?" The question becomes, "Is this phone worth $10,000 of my future self's money?" This reframing is the key to making better financial decisions. Our brains are not naturally wired to think this way; we are wired for immediate reward. Modern society, with its one-click purchasing and instant-everything culture, preys on this impulse. Building wealth requires consciously overriding it.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Psychology Behind Delayed Gratification</h2>
          <p>The famous "Stanford marshmallow experiment" from the 1960s and 70s perfectly illustrates this concept. In the study, a child was offered a choice: one marshmallow now, or two marshmallows if they could wait for 15 minutes while the researcher was away. Follow-up studies over decades found that the children who were able to wait for the second marshmallow tended to have better life outcomes, including higher test scores, healthier lives, and greater financial success.</p>
          <p>The children who succeeded didn't just have more "willpower." They used strategies. They covered their eyes, turned their backs to the marshmallow, sang songs, or tried to go to sleep. They created a system to make waiting easier. You can do the same with your finances.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Practical Strategies to Cultivate Financial Patience</h2>
          <p>Delaying gratification isn't about self-deprivation; it's about intentionality. It's about choosing your future self over your impulsive present self. Here’s how to build the muscle of financial patience:</p>
          <ul className="list-disc ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Implement a "Cooling-Off Period":</strong> For any non-essential purchase over a certain amount (e.g., $100), institute a mandatory waiting period. This could be 24 hours, 72 hours, or even 30 days for very large purchases. The initial emotional urge to buy will often fade, and you can make a more rational decision.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Visualize the "Second Marshmallow":</strong> What is your bigger financial goal? Is it a down payment on a house? Retiring early? Traveling the world? Have a clear, vivid picture of what you are saving *for*. When tempted to make an impulse buy, consciously bring that image to mind. This calculator helps by making that "second marshmallow" a concrete number.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Calculate the "Hours of Your Life" Cost:</strong> Instead of thinking of a purchase in dollars, think of it in terms of your time. If you make $25 per hour after taxes, a $500 purchase costs you 20 hours of your life's work. Is it worth it? This reframes the cost from an abstract number to a tangible piece of your life.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Make Saving and Investing Automatic:</strong> The easiest way to delay gratification is to remove the choice altogether. Pay yourself first. Set up automatic transfers from your checking account to your investment and savings accounts on payday. The money you don't see, you are less likely to spend. This is the ultimate system for financial success.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Unfollow, Unsubscribe, and Block:</strong> Modern marketing is the greatest enemy of delayed gratification. Unsubscribe from marketing emails. Unfollow "influencers" who constantly push new products. Use ad blockers. Create friction between yourself and the impulse to spend.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Choose Your Future</h2>
          <p>Every dollar you have is a seed with the potential to grow into a tree. You can either eat the seed now, or you can plant it and enjoy the fruit for years to come. Delayed gratification is the practice of planting more seeds than you eat.</p>
          <p>This calculator is a tool to help you see the forest. It reminds you that the small, seemingly insignificant financial decisions you make every day are the very ones that compound over time to build extraordinary wealth. By mastering the art of a well-timed "no," you give yourself the ability to say a much bigger "yes" in the future.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is delaying gratification the same as being cheap?</h4>
              <p className="text-muted-foreground">No. Being cheap is about spending as little as possible on everything. Delayed gratification is about being intentional. It means spending lavishly on the things you truly value (like a once-in-a-lifetime trip) while ruthlessly cutting costs on things you don't (like a daily coffee you barely taste).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a realistic "annual return rate" to use?</h4>
              <p className="text-muted-foreground">A widely used and historically accurate estimate for the long-term average return of a diversified stock portfolio (like an S&P 500 index fund) is 8-10% per year before inflation. Using a more conservative figure like 7% can account for inflation and provide a more realistic picture of future purchasing power.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I need the money sooner? Is it still worth it?</h4>
              <p className="text-muted-foreground">Yes. While the most dramatic results come from long time horizons, the principle still holds. Even investing for 3-5 years will likely result in more money than you started with. The key is to match your investment to your time horizon (e.g., don't put money you need in 2 years into the stock market; use a high-yield savings account instead).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I actually invest the money I save?</h4>
              <p className="text-muted-foreground">The easiest way for a beginner is to open an account with a low-cost brokerage (like Vanguard, Fidelity, or Charles Schwab) and buy a broad-market index fund or ETF (e.g., one that tracks the S&P 500). This gives you instant diversification without needing to pick individual stocks.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Doesn't inflation eat away at the returns?</h4>
              <p className="text-muted-foreground">Yes, inflation reduces the purchasing power of your future money. However, over the long term, the stock market has historically outpaced inflation by a significant margin. While your "real" return (after inflation) is lower than the "nominal" return shown, it is almost always significantly better than the real return of holding cash, which is negative.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator quantifies the powerful financial principle of delayed gratification by illustrating the opportunity cost of an immediate purchase. It translates the abstract concept of compound interest into a concrete number, showing you how much a small amount of money today could be worth in the future if invested. This tool encourages more mindful spending by framing every purchase not just by its price tag, but by its potential future value, helping you make choices that align with your long-term wealth-building goals.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
