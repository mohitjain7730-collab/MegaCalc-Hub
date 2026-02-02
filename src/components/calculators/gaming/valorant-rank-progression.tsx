'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Trophy, Clock, Target, ArrowRight, TrendingUp, BarChart2, ShieldCheck, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

const ranks = [
    { id: 'iron', label: 'Iron', baseRR: 0 },
    { id: 'bronze', label: 'Bronze', baseRR: 300 },
    { id: 'silver', label: 'Silver', baseRR: 600 },
    { id: 'gold', label: 'Gold', baseRR: 900 },
    { id: 'platinum', label: 'Platinum', baseRR: 1200 },
    { id: 'diamond', label: 'Diamond', baseRR: 1500 },
    { id: 'ascendant', label: 'Ascendant', baseRR: 1800 },
    { id: 'immortal', label: 'Immortal', baseRR: 2100 },
    { id: 'radiant', label: 'Radiant', baseRR: 2500 }
];

const formSchema = z.object({
    currentRank: z.string(),
    currentTier: z.number().min(1).max(3),
    currentRR: z.number().min(0).max(99),
    targetRank: z.string(),
    avgWinRR: z.number().min(10).max(50),
    avgLossRR: z.number().min(10).max(50),
    winRate: z.number().min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalRRNeeded: number;
    netRRPerMatch: number;
    estimatedGames: number;
    estimatedWins: number;
    estimatedLosses: number;
    totalGames: number;
    winRate: number;
    timeEstimateHours: number;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const steps = [
    'Select your current Rank and Tier (e.g., Silver 2).',
    'Input your current RR (0-99).',
    'Choose your ambitious Target Rank (e.g., Ascendant).',
    'Adjust your Win Rate slider (be realistic! 50-55% is standard).',
    'Review the "Total Games" calculation to see the grind ahead.',
];

const relatedCalculators = [
    {
        name: 'Valorant RR Predictor',
        slug: 'valorant-rr-predictor',
        description: 'Predict your Valorant Rank Rating (RR) gain or loss per match based on performance and outcome.',
    },
    {
        name: 'Fortnite Victory Royale Probability Estimator',
        slug: 'fortnite-victory-royale-probability-estimator',
        description: 'Estimate your probability of winning a Victory Royale based on current placement and skill.',
    },
    {
        name: 'Minecraft Villager Trade Tracker',
        slug: 'minecraft-villager-trade-tracker',
        description: 'Track villager trades and calculate emerald profit per trade based on trade costs.',
    },
    {
        name: 'Roblox Trading Profit Analyzer',
        slug: 'roblox-trading-profit-analyzer',
        description: 'Analyze trading profits by comparing buy and sell prices and fees.',
    },
];

const faqs = [
    {
        question: 'How is "Net RR" calculated?',
        answer: 'Net RR is the average amount of rank rating you gain per match played, factoring in both wins and losses. Formula: (Win% × WinRR) - (Loss% × LossRR). If you win 50% of games gaining 20 and losing 20, your Net RR is 0 (you will not climb).',
    },
    {
        question: 'Why does the result say "Infinity" games?',
        answer: 'If your Win Rate is too low or your Loss Penalty is too high, your "Net RR" becomes negative. This means statistically, you are de-ranking. You must increase your Win Rate or MMR (Win/Loss Variance) to climb. It is mathematically impossible to reach a higher rank with negative expected value.',
    },
    {
        question: 'What is a good Win Rate for climbing?',
        answer: '51-55% is a healthy climbing rate. 60%+ is "smurfing" territory or very rapid climbing. Anything below 50% usually relies on having very high MMR (gaining 25, losing 15) to climb. A 52% win rate is standard for consistent progression.',
    },
    {
        question: 'How long does a Valorant match take?',
        answer: 'The average competitive match lasts 30-40 minutes including agent select and overtime. This calculator assumes an average of 35 minutes per game. Ranking up requires hundreds of hours; it is a marathon, not a sprint.',
    },
    {
        question: 'Does this account for double rank-ups?',
        answer: 'No, this calculator assumes a linear progression. Double rank-ups happen when your MMR is significantly higher than your rank (e.g., Gold 1 climbing to Gold 3 instantly), which would speed up this process considerably.',
    },
    {
        question: 'How does a "Loss Streak" affect this?',
        answer: 'Loss streaks lower your MMR, which reduces your future specific RR gains. However, this calculator uses averages. In reality, a loss streak might make the climb slightly longer than predicted because you have to repair your MMR before you start climbing optimally again.',
    },
    {
        question: 'What is the "Hidden MMR" impact?',
        answer: 'Your Hidden MMR determines your +/- RR. If your MMR is high, you might gain +25 and lose -15. If it is low, you gain +15 and lose -25. Adjust the "RR Gain/Win" inputs in this calculator to reflect your actual current MMR state for better accuracy.',
    }
];

const baseUrl = 'https://mycalculating.com/category/gaming/valorant-rank-progression';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Valorant Rank Progression Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Valorant Rank Progression Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate how many games of Valorant you need to reach your target rank based on win rate and RR gains.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

const calculateProgression = (values: FormValues): ResultPayload => {
    const getAbsoluteRR = (rankId: string, tier: number, rr: number) => {
        const rank = ranks.find(r => r.id === rankId);
        if (!rank) return 0;
        return rank.baseRR + ((tier - 1) * 100) + rr;
    };

    const currentAbsoluteRR = getAbsoluteRR(values.currentRank, values.currentTier, values.currentRR);
    const targetRankObj = ranks.find(r => r.id === values.targetRank);
    const targetAbsoluteRR = targetRankObj ? targetRankObj.baseRR : 0;

    const totalRRNeeded = Math.max(0, targetAbsoluteRR - currentAbsoluteRR);

    // Expected Value per match
    const winProb = values.winRate / 100;
    const lossProb = 1 - winProb;
    const netRR = (winProb * values.avgWinRR) - (lossProb * values.avgLossRR);

    const isImpossible = netRR <= 0;
    const totalGames = isImpossible ? Infinity : Math.ceil(totalRRNeeded / netRR);
    const estimatedWins = isImpossible ? 0 : Math.ceil(totalGames * winProb);
    const estimatedLosses = isImpossible ? 0 : Math.floor(totalGames * lossProb);
    const timeEstimateHours = isImpossible ? Infinity : Math.ceil((totalGames * 35) / 60);

    const recommendations = [
        `Distance to Goal: ${totalRRNeeded} RR. You are typically ${Math.ceil(totalRRNeeded / 100)} rank tiers away.`,
        `Net Gain: ${netRR.toFixed(2)} RR per game. ${netRR > 3 ? "Fast climbing speed." : netRR > 0 ? "Slow and steady climb." : "Stagnant or falling."}`,
        `Volume Required: ${totalGames === Infinity ? "Infinite" : totalGames} games. At this winrate, you will need to play consistently.`,
        `Consistency is Key: A 5% increase in winrate reduces games needed significantly.`
    ];

    const plan = [
        { label: 'Weekly Goal', detail: `Play ${Math.min(20, Math.ceil(totalGames / 4))} games/week to reach target in a month.` },
        { label: 'Expectation', detail: `You will likely lose ${estimatedLosses} games. Don't tilt. It's part of the math.` },
        { label: 'Focus', detail: 'Improve Round Win % to boost your MMR, which increases your +/- RR efficiency.' }
    ];

    return {
        totalRRNeeded,
        netRRPerMatch: netRR,
        estimatedGames: totalGames,
        estimatedWins,
        estimatedLosses,
        totalGames,
        winRate: values.winRate,
        timeEstimateHours,
        recommendations,
        plan
    };
};

export default function ValorantRankProgression() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentRank: 'silver',
            currentTier: 2,
            currentRR: 50,
            targetRank: 'platinum',
            avgWinRR: 19,
            avgLossRR: 15,
            winRate: 51,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateProgression(values));
    };

    const currentRankIdx = ranks.findIndex(r => r.id === form.getValues().currentRank);
    const targetRankIdx = ranks.findIndex(r => r.id === form.getValues().targetRank);
    const isTargetLower = targetRankIdx <= currentRankIdx && targetRankIdx !== -1;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="valorant-rank-progression-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-red-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <TrendingUp className="h-6 w-6 text-red-500" />
                        Valorant Rank Progression
                    </CardTitle>
                    <CardDescription>
                        Calculate the grind. Find out exactly how many games it takes to reach Immortal based on your stats.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <div className="space-y-2">
                                        <FormLabel>Current Rank</FormLabel>
                                        <div className="flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name="currentRank"
                                                render={({ field }) => (
                                                    <select {...field} className="flex-1 p-2 border rounded-md bg-background">
                                                        {ranks.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                                    </select>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="currentTier"
                                                render={({ field }) => (
                                                    <select
                                                        value={field.value}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                        className="w-16 p-2 border rounded-md bg-background"
                                                    >
                                                        {[1, 2, 3].map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="currentRR"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel>Current Tier RR ({field.value})</FormLabel>
                                                </div>
                                                <Slider
                                                    min={0}
                                                    max={99}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(v) => field.onChange(v[0])}
                                                    className="py-2"
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <FormLabel className="text-red-500 font-bold">Target Rank</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="targetRank"
                                            render={({ field }) => (
                                                <select {...field} className="w-full p-2 border rounded-md bg-background border-red-200 focus:border-red-500">
                                                    {ranks.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                                </select>
                                            )}
                                        />
                                        {isTargetLower && <p className="text-xs text-red-500">Target must be higher than current!</p>}
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Stats Assumptions</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="avgWinRR"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">RR Gain/Win</FormLabel>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="h-8" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="avgLossRR"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">RR Loss/Loss</FormLabel>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="h-8" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="winRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex justify-between">
                                                        <FormLabel className="text-xs">Win Rate %</FormLabel>
                                                        <span className="text-xs font-mono">{field.value}%</span>
                                                    </div>
                                                    <Slider
                                                        min={1}
                                                        max={100}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(v) => field.onChange(v[0])}
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold" disabled={isTargetLower}>
                                        CALCULATE JOURNEY
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-slate-950 text-white border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-400">Total Games Required</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-black tracking-tight text-white mb-1">
                                            {result.totalGames === Infinity ? "∞" : result.totalGames}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            ~{result.timeEstimateHours === Infinity ? "Forever" : result.timeEstimateHours} hours of playtime
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Net RR Per Match</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-black tracking-tight text-red-600 dark:text-red-400 mb-1">
                                            {result.netRRPerMatch > 0 ? '+' : ''}{result.netRRPerMatch.toFixed(2)}
                                        </div>
                                        <p className="text-xs text-red-600/70 dark:text-red-400/70">
                                            Expected value based on {result.winRate}% WR
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Journey Visualization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="relative pt-6 pb-2">
                                        <div className="flex justify-between items-center mb-2 font-bold text-sm">
                                            <span className="flex items-center gap-1 text-slate-500"><Target className="w-4 h-4" /> Start: {form.getValues().currentRank}</span>
                                            <ArrowRight className="text-muted-foreground w-4 h-4" />
                                            <span className="flex items-center gap-1 text-red-600"><Trophy className="w-4 h-4" /> Goal: {form.getValues().targetRank}</span>
                                        </div>
                                        <Progress value={10} className="h-4" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>{result.estimatedWins} Projected Wins</span>
                                            <span>{result.estimatedLosses} Projected Losses</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    Reality Check
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                    {result.recommendations.map((rec, idx) => (
                                                        <li key={idx}>{rec}</li>
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
                                                <ul className="space-y-1 text-sm text-muted-foreground">
                                                    {result.plan.map((step) => (
                                                        <li key={step.label}>
                                                            <span className="font-semibold">{step.label}:</span> {step.detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <TrendingUp className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Ready to Calculate</h3>
                                <p>Enter your current rank and goals to see your roadmap to the top.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Total RR Needed</strong> = (Target Rank Base RR) - (Current Rank Base RR + Current Tier RR).
                    </p>
                    <p>
                        <strong>Net RR Per Match</strong> = (Win% × Avg Win RR) - (Loss% × Avg Loss RR). This is the "Expected Value" of playing one match.
                    </p>
                    <p>
                        <strong>Total Games Required</strong> = Total RR Needed / Net RR Per Match.
                    </p>
                    <p>
                        <strong>Example:</strong> If you gain 20 on wins and lose 20 on losses with a 51% win rate, your Net RR is +0.4 per match. It will take 250 matches to gain 100 RR (one tier).
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        {steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Related calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedCalculators.map((calc) => (
                        <div key={calc.slug} className="p-4 border rounded">
                            <h4 className="font-semibold mb-1">
                                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline">
                                    {calc.name}
                                </Link>
                            </h4>
                            <p className="text-sm text-muted-foreground">{calc.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Math Behind Climbing: Valorant Rank Progression Guide" />
                <meta itemProp="description" content="Calculate exactly how many games you need to reach your dream rank in Valorant. Understanding Net RR and the importance of win rate." />
                <meta itemProp="keywords" content="Valorant Rank Calculator, Valorant Grind, Games to Immortal, Rank Progression" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Math Behind Climbing: Valorant Rank Progression Guide</h1>
                <p className="text-lg italic text-muted-foreground">Why a 51% win rate is enough to climb, but 55% changes everything. The mathematical reality of reaching Immortal.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#mathematics" className="hover:underline">The Mathematics of the Grind</a></li>
                    <li><a href="#winrate-impact" className="hover:underline">Win Rate vs. Volume (The Exponential Curve)</a></li>
                    <li><a href="#variance" className="hover:underline">Variance and Streaks (The "Losers Queue" Myth)</a></li>
                    <li><a href="#strategy" className="hover:underline">Optimizing Your Climb</a></li>
                    <li><a href="#mental" className="hover:underline">The Mental Game: Handling Tilt</a></li>
                    <li><a href="#distribution" className="hover:underline">Rank Distribution Realities</a></li>
                    <li><a href="#resets" className="hover:underline">Episode Resets and Their Impact</a></li>
                </ul>
                <hr className="my-6" />

                <h2 id="mathematics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of the Grind</h2>
                <p>Ranking up in Valorant is fundamentally a function of <strong>Net RR</strong> over time. Many players believe that if they simply "play enough," they will rank up. This is statistically false.</p>
                <p>Your Net RR is calculated as: <code>(Win % × Avg Win RR) - (Loss % × Avg Loss RR)</code>.</p>
                <p>If you lose as much RR as you gain (e.g., +20 / -20) and have a 50% win rate, your Net RR is exactly 0. You will stay in Silver 2 forever, regardless of whether you play 10 games or 1,000 games. To climb, you must break this equilibrium by either (a) increasing your Win Rate above 50%, or (b) increasing your MMR so you gain more per win.</p>

                <h2 id="winrate-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Win Rate vs. Volume (The Exponential Curve)</h2>
                <p>Small improvements in Win Rate have massive, exponential impacts on the speed of your climb. Consider a player trying to gain 400 RR (climbing from Silver to Platinum):</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>51% Win Rate (The Grinder):</strong> With balanced gains (+20/-20), you net 0.4 RR per game. It will take <strong>1,000 games</strong> to reach your goal.</li>
                    <li><strong>53% Win Rate (The Improver):</strong> You net 1.2 RR per game. It takes <strong>333 games</strong>. You just saved 667 hours of gameplay by winning 2 more games per 100.</li>
                    <li><strong>55% Win Rate (The Climber):</strong> You net 2.0 RR per game. It takes <strong>200 games</strong>. The grind is 5x faster than at 51%.</li>
                    <li><strong>60% Win Rate (The Smurf):</strong> You net 4.0 RR per game. It takes <strong>100 games</strong>.</li>
                </ul>
                <p><strong>The takeaway:</strong> Stop spamming games on autopilot. Playing 3 games at peak focus (55% WR chance) is infinitely more valuable than spamming 8 games while tired (50% WR chance).</p>

                <h2 id="variance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Variance and Streaks (The "Losers Queue" Myth)</h2>
                <p>A 55% win rate does not mean you win 5.5 games out of every 10 consistently. True randomness involves "clumping," or streaks.</p>
                <p>Over a 100-game sample with a 55% win rate, there is a statistical certainty that you will experience a <strong>5-game losing streak</strong>. Most players interpret this as "The system is rigged" or "Losers Queue." It isn't. It is standard variance.</p>
                <p>The "Expected Losses" figure in our calculator is crucial. If you are projected to play 300 games to reach Immortal, you <em>will</em> lose approximately 135 of them. Accepting that you are going to lose 135 games—and that some of them will be 13-0 stomps or have AFK teammates—is the key to mental resilience.</p>

                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Your Climb</h2>
                <h3 className="text-xl font-semibold mt-4">1. Duo Queue vs Solo Queue</h3>
                <p>Solo queue is heavy variation. You might get a Radiant smurf or a thrower. Duo queueing stabilizes this variance. By guaranteeing one reliable teammate, you control 20% of your team's variables. Statistical analysis shows Duos typically have a 2-3% higher win rate than pure Solos.</p>
                <h3 className="text-xl font-semibold mt-4">2. The "Two Loss Rule"</h3>
                <p>If you lose two games in a row, <strong>stop playing Ranked</strong>. Studies on cognitive performance show that frustration (tilt) lowers reaction time and decision-making quality. Continuing to play while trying to "earn back" your lost RR usually leads to a spiral.</p>

                <h2 id="mental" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mental Game: Handling Tilt</h2>
                <p>Tilt is not just anger; it is an optimized state of failure. When tilted, you wide-swing more, you communicate less, and you give up rounds earlier.</p>
                <p>The calculator measures "Time Estimate" in hours. This is a long-term project. Ranking up is like going to the gym; you don't get fit in one day, and you don't hit Radiant in one night. View your RR as a stock market graph: it will have dips, but as long as the long-term trend is up, you are succeeding.</p>

                <h2 id="distribution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rank Distribution Realities</h2>
                <p>Understanding where you sit is important. As of recent episodes:</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>Iron - Silver:</strong> Contains ~50% of the player base.</li>
                    <li><strong>Gold - Platinum:</strong> The "average" competitive player. Top ~30%.</li>
                    <li><strong>Diamond - Ascendant:</strong> High elo. Top ~10%.</li>
                    <li><strong>Immortal+:</strong> The elite. Top ~1% or less.</li>
                </ul>
                <p>Moving from Silver to Gold is statistically easier than moving from Ascendant 1 to Ascendant 2. The skill gap widens exponentially at the top.</p>

                <h2 id="resets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Episode Resets and Their Impact</h2>
                <p>At the start of every Episode (every ~6 months), everyone performs a "Hard Reset." Your visible rank will drop significantly (often 3-5 tiers), but your MMR stays roughly the same.</p>
                <p>This means your first 50 games of a new Episode will have massive RR gains (+25/-10) as the system tries to push you back to your old rank. Use this period wisely! High win rates during the start of an Episode are worth "double" due to this volatility.</p>

                <hr className="my-8" />
                <p className="text-sm"><em>Note: This calculator assumes a standard competitive environment. Double rank-ups, smurf detection bonuses, and severe MMR disparities can alter the timeline significantly.</em></p>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>FAQs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.question}>
                            <h4 className="font-semibold">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                    ))}
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
                    <p>The Valorant Rank Progression Calculator estimates the total number of competitive matches required to reach a specific target rank. By inputting Current Rank, Target Rank, Win Rate, and Average RR Gains/Losses, users can see the "Total Games" count and "Estimated Hours" required.</p>
                    <p>The tool highlights the critical relationship between Win Rate and climbing speed—improving win rate by just a few percentage points typically reduces the required grind time exponentially. It serves as a reality check for players setting long-term ranking goals.</p>
                </CardContent>
            </Card>
        </div>
    );
}
