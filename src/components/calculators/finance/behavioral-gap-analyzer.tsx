'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Activity, Shield, Info, Replace } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
    investmentReturn: z.number().positive('The investment\'s average annual return is required.'),
    investorReturn: z.number().positive('Your actual average annual return is required.'),
    period: z.number().positive('The investment period in years is required.'),
    initialInvestment: z.number().positive('Initial investment is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    behavioralGap: number;
    investmentFutureValue: number;
    investorFutureValue: number;
    costOfBehavior: number;
    chartData: { name: string, 'Potential Growth': number, 'Your Growth': number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value);

const calculateFutureValue = (principal: number, rate: number, years: number) => {
    return principal * Math.pow(1 + rate / 100, years);
};

export default function BehavioralGapAnalyzer() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            investmentReturn: undefined,
            investorReturn: undefined,
            period: undefined,
            initialInvestment: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { investmentReturn, investorReturn, period, initialInvestment } = values;

        const behavioralGap = investmentReturn - investorReturn;
        const investmentFutureValue = calculateFutureValue(initialInvestment, investmentReturn, period);
        const investorFutureValue = calculateFutureValue(initialInvestment, investorReturn, period);
        const costOfBehavior = investmentFutureValue - investorFutureValue;

        const chartData = [
            {
                name: 'Portfolio Value',
                'Potential Growth': investmentFutureValue,
                'Your Growth': investorFutureValue,
            },
        ];

        setResult({
            behavioralGap,
            investmentFutureValue,
            investorFutureValue,
            costOfBehavior,
            chartData,
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Replace className="h-5 w-5" />
                        Behavioral Gap Analyzer
                    </CardTitle>
                    <CardDescription>
                        Measure the difference between your fund's return and your actual return to see the cost of your investment behavior.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="investmentReturn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fund's Average Annual Return (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="investorReturn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Actual Annual Return (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="initialInvestment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Initial Investment ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Investment Period (Years)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Analyze My Gap
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Behavioral Gap Analysis</CardTitle>
                            <CardDescription>
                                This shows how your behavior impacted your investment returns.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="p-4 bg-destructive/10 rounded-lg">
                                    <h4 className="text-sm font-medium text-muted-foreground">Behavioral Gap</h4>
                                    <p className="text-3xl font-bold text-destructive">{result.behavioralGap.toFixed(2)}%</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="text-sm font-medium text-muted-foreground">Potential Value</h4>
                                    <p className="text-3xl font-bold text-primary">{formatNumberUS(result.investmentFutureValue)}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="text-sm font-medium text-muted-foreground">Your Actual Value</h4>
                                    <p className="text-3xl font-bold">{formatNumberUS(result.investorFutureValue)}</p>
                                </div>
                            </div>
                            <div className="mt-6 p-6 bg-destructive/10 rounded-lg text-center">
                                <h4 className="text-sm font-medium text-muted-foreground">The "Cost of Behavior"</h4>
                                <p className="text-4xl font-bold text-destructive">{formatNumberUS(result.costOfBehavior)}</p>
                                <p className="text-muted-foreground mt-1">This is the potential wealth you missed out on due to behavioral factors.</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Visualizing the Gap</CardTitle>
                            <CardDescription>
                                The difference between the fund's growth and your actual portfolio growth.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => formatNumberUS(value as number, { notation: 'compact', compactDisplay: 'short' })} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => formatNumberUS(value as number)} />
                                    <Legend />
                                    <Bar dataKey="Potential Growth" fill="hsl(var(--primary))" />
                                    <Bar dataKey="Your Growth" fill="hsl(var(--muted-foreground))" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding the Behavioral Gap</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>The Behavioral Gap is the difference between the return of an investment (like a mutual fund) and the actual return the average investor in that fund achieves. Studies consistently show that investors underperform the very funds they invest in. Why? Because of behavior.</p>
                        <p>Investors tend to <strong className="text-foreground">buy high</strong> (piling in when a fund is popular and prices are high) and <strong className="text-foreground">sell low</strong> (panicking and selling during a market downturn). This poor timing erodes returns. This calculator quantifies that gap, showing you the "cost" of emotional decision-making.</p>
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
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Investor's Worst Enemy: A Guide to the Behavioral Gap</h1>
                    <p className="text-lg italic">Discover why the greatest threat to your investment returns isn't the market—it's the person in the mirror. Learn to identify and close the behavioral gap.</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What Is the Behavioral Gap?</h2>
                    <p>Coined by financial research firm DALBAR, the "behavioral gap" refers to the well-documented phenomenon where investors' actual returns are significantly lower than the returns of the funds they invest in. For example, if a mutual fund reports a 10% average annual return over 20 years, the average investor in that fund might have only earned 7%. That 3% difference is the behavioral gap.</p>
                    <p>It's the tangible cost of human emotion in investing. It arises from our natural, yet financially destructive, tendencies to react to market events rather than sticking to a disciplined, long-term strategy.</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Primary Causes of the Behavioral Gap</h2>
                    <ol className="list-decimal ml-6 space-y-4">
                        <li>
                            <strong className="font-semibold text-foreground">Herd Mentality (Chasing Performance):</strong> This is the most common mistake. Investors see a fund or stock that has performed exceptionally well recently and pile their money into it, effectively buying at the top. When performance inevitably reverts to the mean, they are disappointed and sell, often moving to the next "hot" investment.
                        </li>
                        <li>
                            <strong className="font-semibold text-foreground">Panic Selling (Loss Aversion):</strong> Our brains are wired to feel the pain of a loss about twice as intensely as the pleasure of a gain. This leads investors to sell during market downturns to "stop the bleeding," crystallizing a temporary paper loss into a permanent real loss and missing the subsequent recovery.
                        </li>
                        <li>
                            <strong className="font-semibold text-foreground">Market Timing:</strong> The futile attempt to predict short-term market movements. Investors who try to time the market often end up selling after a drop and buying back in only after the market has already recovered, missing the best days of performance. Studies show that missing just a handful of the best days in the market can devastate long-term returns.
                        </li>
                        <li>
                            <strong className="font-semibold text-foreground">Overconfidence:</strong> A belief that one can consistently outperform the market through superior stock-picking or timing. This often leads to excessive trading, which incurs transaction costs and taxes, further widening the behavioral gap.
                        </li>
                    </ol>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Close Your Behavioral Gap</h2>
                    <p>Closing the gap requires building a system that protects you from your own worst instincts.</p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong className="font-semibold">Automate Your Investments:</strong> The single most effective tool is the Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA). By investing a fixed amount automatically every month, you remove emotion from the equation. You automatically buy more when prices are low and less when they are high.</li>
                        <li><strong className="font-semibold">Have a Written Investment Plan:</strong> Create a simple document that outlines your financial goals, your time horizon, and your target asset allocation. When you feel the urge to make an emotional decision, consult your plan. It acts as a rational anchor in a sea of emotional noise.</li>
                        <li><strong className="font-semibold">Embrace Diversification:</strong> A well-diversified portfolio (with a mix of stocks, bonds, international assets, etc.) will have parts that are performing well even when other parts are not. This smooths out the overall ride and makes it easier to stay the course.</li>
                        <li><strong className="font-semibold">Tune Out the Noise:</strong> Stop watching financial news channels and checking your portfolio daily. This constant stream of information is designed to provoke an emotional response. A quarterly review of your investments is more than sufficient for a long-term investor.</li>
                    </ul>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">How do I find my "actual annual return"?</h4>
                            <p className="text-muted-foreground">This is often the trickiest part. You can calculate it using the XIRR function in a spreadsheet if you have a record of all your investments and withdrawals. Some brokerage platforms also show you your "personal rate of return." If you're unsure, you can use a conservative estimate to see the impact.</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Is a behavioral gap always bad?</h4>
                            <p className="text-muted-foreground">Yes. It represents a loss of potential wealth due to suboptimal decisions. The goal of a disciplined investor is to minimize this gap as much as possible, ideally making it zero or even slightly positive (by rebalancing effectively).</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Can I really just "set it and forget it"?</h4>
                            <p className="text-muted-foreground">Almost. The core idea is to avoid emotional, short-term reactions. However, you should still review your portfolio periodically (e.g., once a year) to rebalance it back to your target asset allocation. This is a disciplined, strategic action, not an emotional one.</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does this apply to individual stocks as well?</h4>
                            <p className="text-muted-foreground">Absolutely. The behavioral gap is often even wider for individual stocks, as they are more volatile and investors are more likely to have an emotional attachment to a specific company, leading to even poorer timing decisions.</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Why is it so hard to just do nothing?</h4>
                            <p className="text-muted-foreground">Our brains are wired for action. When faced with a perceived threat (a market crash) or opportunity (a hot stock), our instinct is to "do something." In investing, however, strategic inaction is often the most powerful and profitable move.</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">How can a financial advisor help?</h4>
                            <p className="text-muted-foreground">A good financial advisor's primary role is often that of a behavioral coach. They act as a buffer between you and your emotional impulses, helping you stick to your long-term plan during periods of market stress.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>This calculator quantifies the "Behavioral Gap"—the difference between a fund's potential return and an investor's actual return. By comparing these two figures, it reveals the monetary cost of emotional investment decisions, such as panic selling or performance chasing. The tool's primary purpose is to highlight the value of disciplined, systematic investing and to encourage strategies that minimize behavioral errors, thereby maximizing long-term wealth.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
