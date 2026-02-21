'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, Info, BrainCircuit, HeartPulse, Stethoscope, Gem, Zap, Replace } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Tooltip } from 'recharts';
import Link from 'next/link';


const questions = [
  { id: 'q1', text: 'When the stock market drops 20% in a month, my first reaction is to:', scoreMap: { a: 1, b: 3, c: 5 } },
  { id: 'q2', text: 'My knowledge of investment products (stocks, bonds, ETFs) is:', scoreMap: { a: 1, b: 3, c: 5 } },
  { id: 'q3', text: 'I prefer investments that offer:', scoreMap: { a: 1, b: 3, c: 5 } },
  { id: 'q4', text: "How long is your typical investment horizon for a major financial goal (like retirement)?", scoreMap: { a: 1, b: 3, c: 5 } },
  { id: 'q5', text: "If an investment I own loses 15% of its value in a year, I would:", scoreMap: { a: 1, b: 3, c: 5 } },
];

const formSchema = z.object({
  q1: z.string().nonempty("Please select an answer."),
  q2: z.string().nonempty("Please select an answer."),
  q3: z.string().nonempty("Please select an answer."),
  q4: z.string().nonempty("Please select an answer."),
  q5: z.string().nonempty("Please select an answer."),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalScore: number;
  profile: 'Conservative' | 'Balanced' | 'Aggressive';
  summary: string;
  chartData: { subject: string, score: number, fullMark: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', { ...options }).format(value);

const COLORS = {
  Conservative: 'hsl(var(--chart-1))',
  Balanced: 'hsl(var(--chart-4))',
  Aggressive: 'hsl(var(--chart-2))',
};

export default function InvestmentConfidenceMeter() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    let totalScore = 0;
    const scores = {
      riskReaction: 0,
      knowledge: 0,
      preference: 0,
      horizon: 0,
      lossAversion: 0
    };

    scores.riskReaction = questions[0].scoreMap[values.q1 as keyof typeof questions[0]['scoreMap']];
    scores.knowledge = questions[1].scoreMap[values.q2 as keyof typeof questions[1]['scoreMap']];
    scores.preference = questions[2].scoreMap[values.q3 as keyof typeof questions[2]['scoreMap']];
    scores.horizon = questions[3].scoreMap[values.q4 as keyof typeof questions[3]['scoreMap']];
    scores.lossAversion = questions[4].scoreMap[values.q5 as keyof typeof questions[4]['scoreMap']];

    totalScore = Object.values(scores).reduce((acc, score) => acc + score, 0);

    let profile: CalculationResult['profile'] = 'Conservative';
    let summary = '';
    if (totalScore <= 10) {
      profile = 'Conservative';
      summary = 'You prioritize capital preservation and are uncomfortable with significant market fluctuations. Lower-risk investments like bonds and fixed-income funds may suit you best.';
    } else if (totalScore <= 18) {
      profile = 'Balanced';
      summary = 'You are willing to accept moderate risk for potentially higher returns. A diversified portfolio of stocks and bonds aligns with your mindset.';
    } else {
      profile = 'Aggressive';
      summary = 'You are comfortable with high risk for the potential of high rewards and understand that market volatility is part of the journey. A portfolio heavily weighted in equities is likely appropriate.';
    }

    setResult({
      totalScore,
      profile,
      summary,
      chartData: [
        { subject: 'Risk Reaction', score: scores.riskReaction, fullMark: 5 },
        { subject: 'Knowledge', score: scores.knowledge, fullMark: 5 },
        { subject: 'Preference', score: scores.preference, fullMark: 5 },
        { subject: 'Horizon', score: scores.horizon, fullMark: 5 },
        { subject: 'Loss Aversion', score: scores.lossAversion, fullMark: 5 },
      ],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Investment Confidence Meter
          </CardTitle>
          <CardDescription>
            Answer a few questions to understand your investment personality and risk tolerance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="q1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{questions[0].text}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="a" /></FormControl>
                          <FormLabel className="font-normal">Sell some investments to cut my losses.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="b" /></FormControl>
                          <FormLabel className="font-normal">Do nothing and wait for it to recover.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="c" /></FormControl>
                          <FormLabel className="font-normal">Invest more; it's a buying opportunity.</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="q2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{questions[1].text}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="a" /></FormControl>
                          <FormLabel className="font-normal">Beginner - I'm just starting to learn.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="b" /></FormControl>
                          <FormLabel className="font-normal">Intermediate - I understand the basics.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="c" /></FormControl>
                          <FormLabel className="font-normal">Advanced - I am confident in my knowledge.</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="q3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{questions[2].text}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="a" /></FormControl>
                          <FormLabel className="font-normal">Guaranteed returns, even if they are low.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="b" /></FormControl>
                          <FormLabel className="font-normal">A mix of safety and moderate growth.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="c" /></FormControl>
                          <FormLabel className="font-normal">High growth potential, even with high risk.</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="q4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{questions[3].text}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="a" /></FormControl>
                          <FormLabel className="font-normal">Less than 5 years</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="b" /></FormControl>
                          <FormLabel className="font-normal">5 to 15 years</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="c" /></FormControl>
                          <FormLabel className="font-normal">More than 15 years</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="q5"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{questions[4].text}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="a" /></FormControl>
                          <FormLabel className="font-normal">Sell it to prevent further losses.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="b" /></FormControl>
                          <FormLabel className="font-normal">Hold it and review my investment thesis.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="c" /></FormControl>
                          <FormLabel className="font-normal">Buy more at a lower price.</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto">
                Discover My Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Investment Profile: <span style={{ color: COLORS[result.profile] }}>{result.profile}</span></CardTitle>
              <CardDescription>
                {result.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar name="Your Score" dataKey="score" stroke={COLORS[result.profile]} fill={COLORS[result.profile]} fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Total Score</h4>
                  <p className="text-3xl font-bold" style={{ color: COLORS[result.profile] }}>{result.totalScore} / 25</p>
                  <p className="text-sm">A higher score indicates a higher tolerance for investment risk.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-muted-foreground">What this means for you:</h4>
                  {result.profile === 'Conservative' && <p className="text-sm">You value safety and predictability. Your portfolio should focus on capital preservation with assets like high-quality bonds, fixed deposits, and blue-chip stocks.</p>}
                  {result.profile === 'Balanced' && <p className="text-sm">You seek a middle ground between growth and safety. A mix of equities (like index funds) and fixed-income assets is suitable. You understand that some volatility is necessary for long-term growth.</p>}
                  {result.profile === 'Aggressive' && <p className="text-sm">You are focused on maximizing returns and have a long time horizon. Your portfolio can be heavily weighted towards growth stocks, small-cap funds, and other high-growth assets. You see market dips as opportunities.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This meter isn't a definitive judgment but a tool for self-reflection. Your "Investment Confidence" is a blend of your risk tolerance, your financial knowledge, and your emotional discipline. Understanding your natural tendencies is the first step toward building a portfolio and a strategy that you can stick with through market cycles.</p>
            <p>A <strong className="text-foreground">Conservative</strong> investor might panic-sell during a crash, while an <strong className="text-foreground">Aggressive</strong> investor might see it as a sale. There is no "right" profile—only the one that aligns with your financial goals and your ability to sleep at night.</p>
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Psychology of Investing: A Guide to Understanding Your Financial DNA</h1>
          <p className="text-lg italic">Unlock better investment outcomes by decoding your own behavioral biases, risk tolerance, and emotional responses to money.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Your Mindset Matters More Than Your Money</h2>
          <p>Successful investing is often less about complex financial models and more about mastering your own psychology. The difference between a successful investor and an unsuccessful one often comes down to behavior during periods of market stress or euphoria. This guide explores the key psychological factors that shape your investment journey.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Three Pillars of an Investment Profile</h2>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Risk Tolerance:</strong> This is your inherent willingness to take financial risks. It's partly genetic and partly shaped by life experiences. It's about how much of a paper loss you can endure without panicking. Someone with high risk tolerance can watch their portfolio drop 30% and not lose sleep, while someone with low risk tolerance might be distressed by a 5% drop.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Risk Capacity:</strong> This is your financial ability to take risks, independent of your feelings. It's determined by factors like your age, income stability, time horizon, and existing wealth. A young person with a stable job has a high risk capacity, even if they have low risk tolerance. Conversely, a retiree living on a fixed income has low risk capacity, regardless of how adventurous they feel.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Emotional Discipline:</strong> This is your ability to stick to a long-term plan, ignoring market "noise" and your own emotional impulses. It's about avoiding common behavioral biases like loss aversion (feeling the pain of a loss more than the pleasure of a gain), herd mentality (following the crowd), and confirmation bias (seeking out information that confirms your existing beliefs).
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Matching Your Portfolio to Your Profile</h2>
          <p>The goal is to build a portfolio that aligns with all three pillars. A mismatch can lead to poor decisions.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">High Tolerance, Low Capacity:</strong> A classic recipe for disaster. A young investor with little savings might take huge risks, potentially wiping out their capital before they can recover. The solution is to respect your limited capacity by using diversification and avoiding excessive leverage, even if you feel fearless.</li>
            <li><strong className="font-semibold">Low Tolerance, High Capacity:</strong> This leads to missed opportunities. A wealthy individual who is terrified of the market might keep all their money in cash, where it gets eroded by inflation. The solution is education and starting with a small allocation to growth assets to slowly build comfort with market movements.</li>
            <li><strong className="font-semibold">Lack of Emotional Discipline:</strong> This can wreck any portfolio, regardless of how well-constructed it is. The best strategy is one you can stick with. Automation (through SIPs/DCA), having a written investment plan, and avoiding checking your portfolio too frequently are effective ways to build discipline.</li>
          </ul>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Can my risk tolerance change over time?</h4>
              <p className="text-muted-foreground">Yes, it can. Major life events like getting married, having children, or nearing retirement can change your perspective on risk. It's a good idea to reassess your profile every few years or after a significant life change.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is being "Aggressive" better than being "Conservative"?</h4>
              <p className="text-muted-foreground">Not at all. The "best" profile is the one that's right for you. An aggressive investor who panics and sells at the bottom will do far worse than a conservative investor who sticks to their plan. Success comes from alignment, not aggressiveness.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the difference between risk tolerance and risk capacity?</h4>
              <p className="text-muted-foreground">Risk tolerance is how much risk you <span className="font-semibold text-foreground">feel</span> comfortable taking (psychological). Risk capacity is how much risk you can <span className="font-semibold text-foreground">afford</span> to take (financial). A sound investment plan must consider both.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I improve my investment knowledge?</h4>
              <p className="text-muted-foreground">Start with reputable sources. Read books by authors like John Bogle, Benjamin Graham, or Morgan Housel. Follow well-regarded financial news outlets. The goal is to understand core principles like diversification, asset allocation, and long-term thinking.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if my partner and I have different risk profiles?</h4>
              <p className="text-muted-foreground">This is very common. The solution is often to have a conversation and find a compromise, or to segment your investments. You might have a joint portfolio that is 'Balanced', while each of you has smaller, individual accounts that reflect your personal risk tolerance.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I avoid making emotional investment decisions?</h4>
              <p className="text-muted-foreground">Automate your investments through a Systematic Investment Plan (SIP). Have a written investment policy statement that outlines your goals and strategy. And most importantly, avoid checking your portfolio too often. Quarterly is usually enough.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This tool helps you understand your investment personality by scoring your responses to common financial scenarios. The resulting profile (Conservative, Balanced, or Aggressive) provides a starting point for building an investment strategy that aligns with both your financial goals and your emotional temperament, increasing your chances of long-term success.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
