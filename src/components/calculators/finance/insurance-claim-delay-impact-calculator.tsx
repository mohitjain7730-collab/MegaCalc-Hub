'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Clock, Target, Info, Shield, ArrowRight, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    claimAmount: z.number().positive(),
    delayMonths: z.number().positive(),
    inflationRate: z.number().min(0).max(100),
    investmentReturnRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    presentValueLoss: number;
    opportunityCost: number;
    totalEffectiveLoss: number;
    realValueAfterDelay: number;
    chartData: { name: string; amount: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function InsuranceClaimDelayImpactCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            claimAmount: undefined,
            delayMonths: undefined,
            inflationRate: undefined, // User requested blank
            investmentReturnRate: undefined, // User requested blank
        },
    });

    const onSubmit = (values: FormValues) => {
        const { claimAmount, delayMonths, inflationRate, investmentReturnRate } = values;

        // 1. Inflation Loss (Purchasing Power Loss)
        const monthlyInflation = inflationRate / 100 / 12;
        // Value of claim amount in future dollars (if we just held it) - but here we want to know what the claim amount *will buy* compared to today.
        // Actually, simpler: Present Value = Future Value / (1 + r)^n
        // Here, the "Future Payment" is fixed at claimAmount. We want its PV.
        const presentValue = claimAmount / Math.pow(1 + monthlyInflation, delayMonths);
        const purchasingPowerLoss = claimAmount - presentValue;

        // 2. Opportunity Cost (Lost Investment potential)
        // If we had the money today, it would grow.
        const monthlyReturn = investmentReturnRate / 100 / 12;
        const potentialFutureValue = claimAmount * Math.pow(1 + monthlyReturn, delayMonths);
        const opportunityCost = potentialFutureValue - claimAmount;

        // Total Effective Loss = Purchasing Power Loss + Opportunity Cost
        // This is a bit double counting if we aren't careful, but conceptually correct for "Impact". 
        // Impact = (What I could have had) - (What I effectively get).
        // What I could have had: Claim Amount + Opportunity Cost (Value at T+delay)
        // What I get (Nominal): Claim Amount.
        // But that nominal amount is worth Less. 
        // Let's frame it as: Total Lost Value = Opportunity Cost + Inflation Impact.

        // A clearer way:
        // "Real" Value at Delay = Claim Amount adjusted for inflation.
        // "Potential" Value at Delay = Claim Amount + Investment Growth.
        // Gap = Potential - Real.

        const realValueAtDelay = claimAmount / Math.pow(1 + monthlyInflation, delayMonths); // Deflated

        // Let's stick to the user req: Present Value Loss & Opportunity Cost.
        const totalEffectiveLoss = purchasingPowerLoss + opportunityCost;

        const chartData = [
            { name: 'Original Claim', amount: claimAmount },
            { name: 'Real Value', amount: presentValue },
            { name: 'Potential Value', amount: potentialFutureValue },
        ];

        setResult({
            presentValueLoss: purchasingPowerLoss,
            opportunityCost: opportunityCost,
            totalEffectiveLoss,
            realValueAfterDelay: presentValue,
            chartData,
        });
    };

    const recommendationItems = result
        ? [
            `A ${result.opportunityCost > 0 ? 'delay' : 'wait'} of ${form.getValues().delayMonths} months effectively costs you $${formatNumberUS(result.totalEffectiveLoss)}.`,
            `Your $${formatNumberUS(form.getValues().claimAmount)} claim will only have the purchasing power of $${formatNumberUS(result.realValueAfterDelay)} by the time it arrives.`,
            'Document every follow-up interaction with your insurer to establish a timeline.',
            'File a complaint with your state insurance commissioner if delays exceed statutory limits.',
        ]
        : [
            'Keep a detailed log of all correspondence.',
            'Know your state\'s "Prompt Pay" laws.',
            'Consider the time-value of money when accepting settlement offers.',
            'Consult a public adjuster for large, complex claims.',
        ];

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Claim Details
                    </CardTitle>
                    <CardDescription>
                        Calculate the hidden cost of insurance delays
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="claimAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Claim Amount ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 50000"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="delayMonths"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Delay Duration (Months)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 6"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="inflationRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Annual Inflation Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 3.5"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
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
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Possible Investment Return (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 7"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Quantify My Loss
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    {/* Main Results Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Landmark className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Financial Impact Assessment</CardTitle>
                                    <CardDescription>
                                        The true cost of waiting for your money
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Total Value Lost</span>
                                    </div>
                                    <p className="text-3xl font-bold text-red-600">
                                        ${formatNumberUS(result.totalEffectiveLoss, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Combined inflation & opportunity cost
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Inflation Loss</span>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${formatNumberUS(result.presentValueLoss, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Loss in purchasing power
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Missed Growth</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${formatNumberUS(result.opportunityCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Investment opportunity cost
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Value Comparison</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Amount']}
                                                cursor={{ fill: 'transparent' }}
                                            />
                                            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                {recommendationItems.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Educational Content */}
            <div className="space-y-6">

                {/* Understanding the Inputs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Understanding the Impact
                        </CardTitle>
                        <CardDescription>
                            Why timing matters in insurance claims
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Inflation Erodes Value
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Prices rise over time. A $50,000 claim paid two years late buys significantly fewer repair materials or medical services than it would have at the time of loss.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Opportunity Cost
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Money has potential energy. If you had the claim money earlier, you could have invested it or paid off debt. The delay robs you of that potential growth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formula */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Methodology
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                            <strong>Purchasing Power Loss</strong> = Claim - (Claim / (1 + Inflation)^Delay)
                        </p>
                        <p>
                            <strong>Opportunity Cost</strong> = (Claim × (1 + Return)^Delay) - Claim
                        </p>
                        <p>
                            We calculate rates monthly to provide precise impact assessments for delays measured in months.
                        </p>
                    </CardContent>
                </Card>

                {/* Related Calculators */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/inflation-calculator" className="text-primary hover:underline">
                                        Inflation Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    See how prices change
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/compound-interest-calculator" className="text-primary hover:underline">
                                        Compound Interest
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Calculate growth potential
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">
                                        Emergency Fund
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Survive the delay
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/future-value-calculator" className="text-primary hover:underline">
                                        Future Value
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Project investment growth
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="The Hidden Cost of Delayed Insurance Claims: A Financial Analysis" />
                    <meta itemProp="description" content="Insurance delays act as a silent tax on your settlement. Learn how to calculate the real value of a delayed payout, understand the Time Value of Money, and fight back against bad faith tactics." />
                    <meta itemProp="keywords" content="insurance claim delay, claim inflation loss, opportunity cost of claim delay, insurance settlement value, bad faith insurance, prompt payment laws" />
                    <meta itemProp="author" content="MegaCalc Financial Team" />
                    <meta itemProp="datePublished" content="2025-12-09" />
                    <meta itemProp="url" content="/insurance-delay-impact-guide" />

                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">The Hidden Cost of Delayed Insurance Claims: Inflation and Opportunity Cost</h1>
                    <p className="text-xl italic text-muted-foreground mb-8">Why a $50,000 payout today is worth significantly more than a $50,000 payout next year.</p>

                    <div className="bg-muted p-6 rounded-lg mb-8">
                        <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Insurance companies generate profit by holding premium dollars (the "float") and delaying payouts.</li>
                            <li>Inflation erodes the purchasing power of your settlement—especially in sectors like construction (materials/labor) and medical care.</li>
                            <li>Opportunity cost represents the investment returns you miss while waiting for your money.</li>
                            <li>Prompt Payment Laws in many states entitle you to statutory interest (often 10%+) if a claim is delayed without cause.</li>
                        </ul>
                    </div>

                    <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                        <a href="#silent-tax" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The "Silent Tax" of Delay</a>
                        <a href="#time-value" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Time Value of Money</a>
                        <a href="#inflation" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Sector-Specific Inflation Risks</a>
                        <a href="#opportunity-cost" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Opportunity Cost Realities</a>
                        <a href="#legal-rights" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Your Legal Rights (Prompt Pay Laws)</a>
                        <a href="#fighting-back" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Strategy: How to Fight Back</a>
                    </div>
                    <hr className="my-8" />

                    <h2 id="silent-tax" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. The "Silent Tax" of Delay</h2>
                    <p className="mb-4">When an insurance company delays your claim, they are not just being slow; they are often acting in their own financial interest. Warren Buffett famously built Berkshire Hathaway on the concept of "insurance float"—money that doesn't belong to the company but which it holds temporarily. </p>
                    <p className="mb-4">While this is legal, it creates a perverse incentive: <strong>The longer they wait to pay you, the more interest they earn on your money.</strong></p>
                    <p className="mb-4">For the policyholder, however, time is an enemy. Every month that passes decreases the effective value of your settlement due to two economic forces: Inflation and Opportunity Cost.</p>

                    <h2 id="time-value" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. The Time Value of Money (TVM)</h2>
                    <p className="mb-4">The core financial principle here is the Time Value of Money: <em>A dollar today is worth more than a dollar tomorrow.</em></p>
                    <p className="mb-4">Why? Because a dollar today can be invested to earn interest. Additionally, a dollar today has more purchasing power than a dollar tomorrow in an inflationary environment. When an insurer delays payment by 12 months, they are effectively paying you in "future dollars" which are worth less, but they are paying you the nominal amount agreed upon in "past dollars."</p>

                    <div className="border-l-4 border-red-500 pl-6 my-6 bg-red-50 dark:bg-red-950/20 p-4 rounded-r-lg">
                        <h4 className="font-bold text-red-700 mb-2">The "Double Whammy" Scenario</h4>
                        <p className="text-sm">Imagine you have a $50,000 roof claim.
                            <br />1. <strong>Price Rises:</strong> While you wait 1 year, the cost of shingles and labor goes up 10%. The job now costs $55,000.
                            <br />2. <strong>Money Stagnates:</strong> The insurer finally sends you a check for $50,000.
                            <br /><strong>Result:</strong> You are now $5,000 out of pocket to do a repair that was "fully covered."</p>
                    </div>

                    <h2 id="inflation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. Sector-Specific Inflation Risks</h2>
                    <p className="mb-4">General CPI (Consumer Price Index) inflation is often misleading for insurance claims. You need to look at specific sector inflation, which is often much higher.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Construction & Property</h3>
                    <p className="mb-4">After natural disasters (hurricanes, wildfires), "demand surge" occurs. Material costs and labor rates can skyrocket 20-30% in weeks. If your claim takes 6 months to settle, the contractor bid you got on Day 1 is worthless.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Medical Costs</h3>
                    <p className="mb-4">Medical inflation consistently outpaces general inflation. If you settle a personal injury claim based on year-old medical bills without accounting for future care cost increases, you might run out of funds for your treatment.</p>

                    <h2 id="opportunity-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Opportunity Cost Realities</h2>
                    <p className="mb-4">Opportunity Cost is what you <em>could</em> have done with the money. This isn't just theoretical; it has real household impacts.</p>

                    <ul className="list-disc ml-6 mb-6 space-y-4">
                        <li><strong>Investment Loss:</strong> If you had $100,000 in the S&P 500 effectively earning 10%, a one-year delay costs you $10,000 in lost growth.</li>
                        <li><strong>Debt Interest:</strong> This is the most common and painful form. Most people cannot wait for the check; they put repairs on a credit card. If you pay 20% APR on a credit card while waiting for a 0% interest check from the insurer, you are losing massive amounts of wealth.</li>
                        <li><strong>Cash Flow Crisis:</strong> For businesses (Business Interruption claims), delay doesn't just mean lost interest; it can mean bankruptcy. If cash flow dries up, the business closes. A check arriving 12 months late for a business that closed 6 months ago is useless.</li>
                    </ul>

                    <h2 id="legal-rights" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Your Legal Rights (Prompt Pay Laws)</h2>
                    <p className="mb-4">Legislators know about these tactics, which is why most states have enacted <strong>Prompt Payment Statutes</strong>. These laws impose strict deadlines and penalties on insurers.</p>

                    <div className="overflow-x-auto my-8">
                        <table className="w-full border-collapse border border-border text-sm md:text-base">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-4 text-left">State</th>
                                    <th className="border p-4 text-left">Deadline to Pay</th>
                                    <th className="border p-4 text-left">Penalty / Interest</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-4 font-medium">Texas</td>
                                    <td className="border p-4">60 days after receiving all items</td>
                                    <td className="border p-4">18% Interest + Attorney Fees</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Florida</td>
                                    <td className="border p-4">90 days</td>
                                    <td className="border p-4">Interest at adjusted prime rate</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">California</td>
                                    <td className="border p-4">30 days to accept/deny</td>
                                    <td className="border p-4">Interest owed on late payments</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Georgia</td>
                                    <td className="border p-4">60 days</td>
                                    <td className="border p-4">12% Interest + Penalty</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-6">* Note: Laws change frequently. Consult a local attorney. Deadlines often pause if the insurer requests "additional information," a common stalling tactic.</p>

                    <h2 id="fighting-back" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Strategy: How to Fight Back</h2>
                    <p className="mb-4">Don't be a passive victim of the clock. Here is how to accelerate your claim.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Step 1: The "Clean" Submission</h3>
                    <p className="mb-4">Reduce their excuses. Submit a complete package: photos, labeled receipts, contractor estimates, and a clear Proof of Loss statement. Make it easy for the adjuster to say "yes."</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Step 2: The Paper Trail</h3>
                    <p className="mb-4">Never rely on phone calls. Send emails confirming every conversation. "Per our conversation today, you stated you are waiting for X." This prevents "I never said that" scenarios later.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Step 3: Invoke the Statute</h3>
                    <p className="mb-4">If the deadline passes, send a formal letter: "Under [State Code], this claim was due to be paid on [Date]. Please remit payment immediately, including the statutory interest of X% accrued to date." This signals you know your rights and usually moves your file to the top of the pile.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Step 4: Bad Faith Complaint</h3>
                    <p className="mb-4">If delay is unreasonable, you can file a complaint with your State Department of Insurance. It costs nothing and insurers hate receiving these inquiries from regulators.</p>

                    <p className="mt-12 text-muted-foreground">
                        <strong>Disclaimer:</strong> This article is for informational financial purposes only and does not constitute legal or investment advice. Insurance laws vary significantly by state. For disputes regarding claim delays or bad faith, consult with a qualified insurance attorney or public adjuster.
                    </p>
                </section>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Common questions about insurance delays
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">How long can they wait?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        State laws vary. Typically, insurers have 15-30 days to acknowledge a claim and 15-60 days to decide after receiving proof of loss.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Do they owe interest?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Yes. In many jurisdictions, if a payment is delayed past the statutory limit, the insurer owes you statutory interest (often Prime + X%).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What causes delays?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Common causes include incomplete documentation, disputes over coverage, high claim volume (after disasters), and administrative errors.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Should I hire a public adjuster?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        For large claims ($50k+), a public adjuster can manage the process and potentially speed up settlement, though they charge a fee (5-15%).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Can I sue for delay?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        If the delay is unreasonable and violates state prompt payment laws, you may have grounds for a lawsuit.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Does inflation adjust the claim?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        No. Policy limits are fixed. If your limit is $100k, that is the max they pay, regardless of inflation.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Is the interest taxable?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Yes. While the claim settlement for property damage is usually not taxable, any interest paid on top of it is typically considered taxable income.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">How to document delay?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Keep a communication log. "Called adjuster on 1/1, left voicemail. Called 1/5, no answer." This is crucial evidence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>This calculator quantifies the "invisible" financial loss caused by delayed insurance payments, factoring in inflation and lost investment opportunity.</p>
                        <p>Understanding these costs helps policyholders negotiate more effectively and recognize the importance of prompt claim resolution.</p>
                        <p>Use the data generated here to advocate for timely payments or calculate the real statutory interest you may be owed.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
