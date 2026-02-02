'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
    matchOutcome: z.enum(['win', 'loss', 'draw'], { required_error: 'Select match outcome' }),
    currentRank: z.string({ required_error: 'Select current rank' }),
    roundDifference: z.number().min(0).max(13),
    performance: z.enum(['mvp', 'top_frag', 'mid_frag', 'bot_frag'], { required_error: 'Select performance' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    estimatedRR: number;
    minRR: number;
    maxRR: number;
    performanceFactor: string;
    roundDiffFactor: string;
    rankFactor: string;
    interpretation: string;
    status: 'excellent' | 'good' | 'average' | 'bad' | 'terrible';
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const ranks = [
    { value: 'iron', label: 'Iron' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' },
    { value: 'ascendant', label: 'Ascendant' },
    { value: 'immortal', label: 'Immortal' },
    { value: 'radiant', label: 'Radiant' },
];

const steps = [
    'Select your match outcome (Win, Loss, or Draw).',
    'Choose your current rank (factors into MMR convergence).',
    'Select your individual performance (MVP, Top Frag, etc.).',
    'Set the round difference (1-13). How one-sided was the match?',
    'Click "Predict RR Change" to see your estimated gains or losses.',
];

const relatedCalculators = [
    {
        name: 'Valorant Rank Progression Calculator',
        slug: 'valorant-rank-progression',
        description: 'Calculate how many games of Valorant you need to reach your target rank based on win rate and RR gains.',
    },
    {
        name: 'Fortnite Victory Royale Probability Estimator',
        slug: 'fortnite-victory-royale-probability-estimator',
        description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, skill level, and match factors.',
    },
    {
        name: 'Fortnite DPS Calculator',
        slug: 'fortnite-dps-calculator',
        description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
    },
    {
        name: 'Minecraft Farm Yield Calculator',
        slug: 'minecraft-farm-yield-calculator',
        description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms.',
    },
];

const faqs = [
    {
        question: 'How is Valorant RR calculated?',
        answer: 'Valorant Rank Rating (RR) is calculated based on match result (win/loss), round differential, and individual performance relative to your hidden MMR. If your MMR is higher than your rank, you gain more RR on wins and lose less on losses.',
    },
    {
        question: 'How much RR do I get for a win?',
        answer: 'A standard win typically awards 10-50 RR. However, most balanced matches award between 17-25 RR. High performance and large round differences push this higher.',
    },
    {
        question: 'Does individual performance matter?',
        answer: 'Yes, especially in lower ranks (Iron to Platinum). In Diamond and above, winning rounds becomes the dominant factor, though performance still affects "Performance Bonus" stars.',
    },
    {
        question: 'What is a Performance Bonus?',
        answer: 'If you play exceptionally well compared to what the system expects (based on your MMR), you may receive a +2 to +10 star bonus on top of your win RR.',
    },
    {
        question: 'Why do I lose more RR than I gain?',
        answer: 'This usually happens when your hidden MMR is lower than your current visible rank. The system is trying to push you down to where it thinks you belong. To fix this, you must consistently win to raise your MMR.',
    },
    {
        question: 'Does round difference matter?',
        answer: 'Yes. Winning 13-0 gives significantly more RR than winning 13-11. Every round you win adds to your gains, and every round you lose softens the loss penalty.',
    },
];

const baseUrl = 'https://mycalculating.com/category/gaming/valorant-rr-predictor';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Valorant RR Predictor', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Valorant RR Predictor',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Predict your Valorant Rank Rating (RR) gain or loss per match based on performance, match outcome, and current rank.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

const calculateRR = (values: FormValues): ResultPayload => {
    let baseRR = 0;
    let minRR = 0;
    let maxRR = 0;
    let performanceScore = 0;

    // Base RR based on outcome
    if (values.matchOutcome === 'win') {
        baseRR = 20;
        minRR = 10;
        maxRR = 50;
    } else if (values.matchOutcome === 'loss') {
        baseRR = -20;
        minRR = -30;
        maxRR = -10;
    } else {
        baseRR = 0; // Draw
        minRR = -5;
        maxRR = 5;
    }

    // Performance Impact
    switch (values.performance) {
        case 'mvp': performanceScore = 5; break;
        case 'top_frag': performanceScore = 3; break;
        case 'mid_frag': performanceScore = 0; break;
        case 'bot_frag': performanceScore = -3; break;
    }

    // Round Difference Impact
    let roundDiffImpact = 0;
    if (values.matchOutcome === 'win') {
        roundDiffImpact = values.roundDifference * 0.5; // +0.5 per round diff
    } else if (values.matchOutcome === 'loss') {
        roundDiffImpact = -(values.roundDifference * 0.5);
    }

    // Rank Impact
    let rankImpact = 0;
    if (['immortal', 'radiant'].includes(values.currentRank)) {
        rankImpact = -2; // Slightly harder to gain
    } else if (['iron', 'bronze'].includes(values.currentRank)) {
        rankImpact = 2; // Slightly easier to climb low elo
    }

    let finalRR = baseRR + performanceScore + roundDiffImpact + rankImpact;

    // Clamping
    if (values.matchOutcome === 'win') {
        finalRR = Math.max(10, Math.min(50, finalRR));
        minRR = Math.max(10, finalRR - 5);
        maxRR = Math.min(50, finalRR + 5);
    } else if (values.matchOutcome === 'loss') {
        finalRR = Math.min(-10, Math.max(-35, finalRR));
        minRR = Math.max(-35, finalRR - 5);
        maxRR = Math.min(-5, finalRR + 5);
    } else {
        // Draw
        finalRR = Math.min(5, Math.max(-5, performanceScore));
        minRR = finalRR - 2;
        maxRR = finalRR + 2;
    }

    // Generate Interpretation & Status
    let status: ResultPayload['status'] = 'average';
    if (finalRR >= 25) status = 'excellent';
    else if (finalRR > 18) status = 'good';
    else if (finalRR >= -15) status = 'average';
    else if (finalRR > -25) status = 'bad';
    else status = 'terrible';

    const recommendations = [
        `Base Outcome: ${values.matchOutcome.toUpperCase()}. Standard expectation is approx ${values.matchOutcome === 'win' ? '+20' : values.matchOutcome === 'loss' ? '-20' : '0'} RR.`,
        `Round Differential: ${values.roundDifference}. ${values.roundDifference > 8 ? 'Stomp! Large impact on RR.' : 'Close game. Small impact on RR.'}`,
        `Performance: ${values.performance.replace('_', ' ')}. ${values.performance === 'mvp' ? 'Possible performance star included.' : 'Standard impact.'}`,
        `Net Prediction: ${Math.round(finalRR)} RR. (Range: ${Math.round(minRR)} to ${Math.round(maxRR)})`,
    ];

    const plan = [
        { label: 'Next Match', detail: 'Focus on round differential. Even in losses, every round won reduces RR loss.' },
        { label: 'Strategy', detail: 'If you are losing more than you gain on average, your MMR is low. You need a win streak to correct it.' },
        { label: 'Long Term', detail: 'Consistent individual performance (KDA/ACS) helps build MMR, leading to easier climbs later.' }
    ];

    return {
        estimatedRR: Math.round(finalRR),
        minRR: Math.round(minRR),
        maxRR: Math.round(maxRR),
        performanceFactor: values.performance === 'mvp' ? 'Massive Boost (MVP)' : values.performance === 'bot_frag' ? 'Penalty (Low Impact)' : 'Standard',
        roundDiffFactor: `${values.roundDifference} Round Diff`,
        rankFactor: values.currentRank,
        status,
        recommendations,
        plan,
        interpretation: values.matchOutcome === 'win'
            ? `A ${values.matchOutcome.toUpperCase()} with ${values.performance.replace('_', ' ')} performance usually yields strong gains.`
            : `A ${values.matchOutcome.toUpperCase()} typically results in RR loss, but performance can mitigate it.`
    };
};

export default function ValorantRRPredictor() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            matchOutcome: 'win',
            currentRank: 'gold',
            roundDifference: 5,
            performance: 'mid_frag',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateRR(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="valorant-rr-predictor-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-red-500 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Trophy className="h-6 w-6 text-red-500" />
                        Valorant RR Predictor
                    </CardTitle>
                    <CardDescription>
                        Estimate your Rank Rating (RR) gains or losses after a competitive match based on performance and score.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Match Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                    <FormField
                                        control={form.control}
                                        name="matchOutcome"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Match Outcome</FormLabel>
                                                <div className="flex gap-2">
                                                    {['win', 'loss', 'draw'].map((outcome) => (
                                                        <Button
                                                            key={outcome}
                                                            type="button"
                                                            variant={field.value === outcome ? "default" : "outline"}
                                                            className={`flex-1 ${field.value === outcome ? (outcome === 'win' ? 'bg-green-600 hover:bg-green-700' : outcome === 'loss' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700') : ''}`}
                                                            onClick={() => field.onChange(outcome)}
                                                        >
                                                            {outcome.toUpperCase()}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="currentRank"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Current Rank</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full p-2 border rounded-md bg-background"
                                                        >
                                                            {ranks.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="performance"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Performance</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full p-2 border rounded-md bg-background"
                                                        >
                                                            <option value="mvp">Match MVP</option>
                                                            <option value="top_frag">Top Frag / Team MVP</option>
                                                            <option value="mid_frag">Mid Frag (Average)</option>
                                                            <option value="bot_frag">Bot Frag (Poor)</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="roundDifference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Round Difference ({field.value})</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-mono text-muted-foreground">Close (1)</span>
                                                        <Slider
                                                            min={1}
                                                            max={13}
                                                            step={1}
                                                            value={[field.value]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                            className="flex-1"
                                                        />
                                                        <span className="text-sm font-mono text-muted-foreground">Stomp (13)</span>
                                                    </div>
                                                </FormControl>
                                                <CardDescription className="text-xs mt-1">
                                                    The difference in rounds (e.g., 13-5 is a diff of 8).
                                                </CardDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" size="lg" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold">
                                        PREDICT RR CHANGE
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-5">
                    {result ? (
                        <Card className="h-full border-red-200 dark:border-red-900 bg-gradient-to-br from-background to-red-50/10 dark:to-red-900/10">
                            <CardHeader>
                                <CardTitle className="text-center">Estimated RR Change</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 text-center">
                                <div className={`text-6xl font-black ${result.estimatedRR > 0 ? 'text-green-500' : result.estimatedRR < 0 ? 'text-red-500' : 'text-gray-500'} drop-shadow-sm`}>
                                    {result.estimatedRR > 0 ? '+' : ''}{result.estimatedRR}
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground px-8">
                                    <span>Min: {result.estimatedRR > 0 ? '+' : ''}{result.minRR}</span>
                                    <span>Max: {result.estimatedRR > 0 ? '+' : ''}{result.maxRR}</span>
                                </div>

                                <div className="space-y-2 mt-4 text-left p-4 bg-background/50 rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Performance:</span>
                                        <span className="font-medium text-sm">{result.performanceFactor}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Round Diff:</span>
                                        <span className="font-medium text-sm">{result.roundDiffFactor}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Rank Tier:</span>
                                        <span className="font-medium text-sm capitalize">{result.rankFactor}</span>
                                    </div>
                                </div>

                                {/* Action Plan / Summary */}
                                <div className="space-y-2 mt-4 text-left text-sm">
                                    <div className="font-semibold text-muted-foreground">Analysis:</div>
                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                        {result.recommendations.slice(0, 2).map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>

                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/20 border-dashed">
                            <div className="text-center space-y-2">
                                <Gamepad2 className="w-12 h-12 mx-auto opacity-20" />
                                <p>Enter match details to predict your RR.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {result && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Detailed Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Key Factors</h4>
                            <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                                {result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Action Plan</h4>
                            <ul className="space-y-2 text-sm">
                                {result.plan.map((item, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold text-foreground">{item.label}:</span> <span className="text-muted-foreground">{item.detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Base RR</strong> = Win (+20), Loss (-20), Draw (0). This is the starting point before modifiers are applied.
                    </p>
                    <p>
                        <strong>Round Differential</strong> = Each round won above the opponent adds approximately 0.5 to 1 RR. A 13-0 stomp yields significantly more than a 13-11 close game.
                    </p>
                    <p>
                        <strong>Performance Bonus</strong> = Exceptional individual performance (MVP, high ACS) can trigger a Performance Star, adding +2 to +10 RR. This is more common in lower ranks or when your MMR exceeds your Rank.
                    </p>
                    <p>
                        <strong>Rank Convergence</strong> = If your Rank is higher than your MMR, the system imposes a penalty (-RR) to pull you down. If your Rank is lower, it gives a bonus (+RR).
                    </p>
                    <p>
                        <strong>Final Calculation</strong> = Base RR + (Round Diff × Modifier) + Performance Score + Convergence Factor. (Capped at +50 / -30 usually).
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

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Ultimate Guide to Valorant Ranked Rating (RR): How It Works" />
                <meta itemProp="description" content="A comprehensive deep dive into Valorant's RR system, hidden MMR, performance bonuses, and strategies for climbing from Iron to Radiant." />
                <meta itemProp="keywords" content="Valorant RR, Rank Rating, MMR, Elo, Calculator, Valorant Ranking System, Climbing Guide, Performance Bonus" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Valorant Ranked Rating (RR): How It Works</h1>
                <p className="text-lg italic text-muted-foreground">Everything you ever wanted to know about how Valorant decides your rank, from hidden MMR mechanics to the myth of 'Losers Queue'.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#introduction" className="hover:underline">Introduction: The Frustration of +18 / -24</a></li>
                    <li><a href="#core-mechanics" className="hover:underline">The Three Pillars of RR</a></li>
                    <li><a href="#round-differential" className="hover:underline">Why 13-0 Matters (Round Differential)</a></li>
                    <li><a href="#hidden-mmr" className="hover:underline">The Hidden MMR System (Convergence)</a></li>
                    <li><a href="#rank-tiers" className="hover:underline">How RR Changes by Rank (Iron vs. Immortal)</a></li>
                    <li><a href="#performance-bonus" className="hover:underline">Unlocking the Performance Star</a></li>
                    <li><a href="#roles" className="hover:underline">Does Playing Support Hurt Your Rank?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Maximize RR Gains</a></li>
                </ul>
                <hr className="my-6" />

                <h2 id="introduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Introduction: The Frustration of +18 / -24</h2>
                <p>If you have played Valorant Competitive for any length of time, you have likely experienced the pain of winning three hard-fought games only to lose all your progress in one or two losses. You see +16, +18, +17, and then suddenly -28. It feels unfair. It feels broken.</p>
                <p>However, the Ranked Rating (RR) system in Valorant is actually a highly sophisticated engine designed to combat "lucky win streaks" and test for consistency. Unlike simple Elo systems of the past, Valorant uses a dual-rating system comprising your visible Rank (e.g., Gold 2) and your hidden Matchmaking Rating (MMR). Understanding how these two interact is the first step to conquering the ladder.</p>

                <h2 id="core-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Three Pillars of RR</h2>
                <p>When you finish a match, the number you see is not random. It is determined by three distinct factors, weighted differently depending on your rank:</p>
                <ul className="list-disc pl-6 space-y-4 my-4">
                    <li><strong>Match Outcome (Lead Factor):</strong> The most obvious one. You won? You gain points. You lost? You lose points. Draws usually result in +0, though a slight gain is possible for performance. The "base" value for a balanced match is typically +/- 20 points.</li>
                    <li><strong>Round Differential (Multiplier):</strong> The game cares <em>how</em> you won. A 13-11 overtime win tells the system "These teams were equal." A 13-0 tells the system "One team does not belong here." We will discuss this more below.</li>
                    <li><strong>Individual Performance (Bonus):</strong> Your kills, assists, Average Combat Score (ACS), and first bloods play a role. However, this is NOT the primary factor. You cannot lose a match and gain RR (unless you are at the absolute bottom of Iron), no matter if you dropped 40 kills. Performance is a modifier, not a driver.</li>
                </ul>

                <h2 id="round-differential" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why 13-0 Matters (Round Differential)</h2>
                <p>Round Differential is the discrete difference between rounds won and lost. This is the easiest way for players to influence their RR, yet it is often ignored.</p>
                <p>Imagine two scenarios:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Scenario A:</strong> You are winning 12-4. You get cocky, try to knife the enemy, and throw 3 rounds. You win 13-7.</li>
                    <li><strong>Scenario B:</strong> You are winning 12-4. You play disciplined and close it out 13-4.</li>
                </ul>
                <p>In Scenario B, you might gain +24 RR. In Scenario A, you might only gain +19 RR. Those 3 rounds you threw effectively cost you 5 RR. Over the course of 100 wins, "throwing for content" or getting lazy with a lead can cost you 500 RR—that's five entire rank tiers!</p>
                <p><strong>The takeaway:</strong> Every round counts. Losing 0-13 destroys your RR. Fighting back to lose 5-13 softens the blow significantly.</p>

                <h2 id="hidden-mmr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hidden MMR System (Convergence)</h2>
                <p>This is the most misunderstood part of Valorant. Why do you get +15 for a win and -25 for a loss?</p>
                <p>This happens because of a concept called <strong>Convergence</strong>. Your visible Rank (e.g., Platinum 1) is higher than your hidden MMR (e.g., Gold 2). The system believes you are "over-ranked" or "boosted."</p>
                <p>Because the system thinks you belong in Gold, it tries to push you there efficiently. It gives you small rewards for winning (because it thinks you got lucky) and huge penalties for losing (confirming its suspicion that you belong lower).</p>
                <h3 className="text-xl font-semibold mt-4">How to fix bad MMR gains?</h3>
                <p>There is only one way to fix this: <strong>Win consistently.</strong></p>
                <p>You must prove the system wrong. If you maintain a win rate above 50% over 20-30 games, your hidden MMR will rise faster than your visible Rank. Eventually, they will equalize, and you will see standard +/- 20 gains again. If you continue to win, your MMR will surpass your Rank, and you will start seeing "Smurf Gains" (+30 / -10).</p>

                <h2 id="rank-tiers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How RR Changes by Rank (Iron vs. Immortal)</h2>
                <p>Riot Games adjusts the formula as you climb.</p>
                <ul className="list-disc pl-6 space-y-4 my-4">
                    <li><strong>Iron to Platinum ("Metal Ranks"):</strong> Individual performance matters a lot. If you are dropping 30 kills per game, the system will give you huge bonuses to get you out of these ranks quickly. This is to combat smurfing by moving high-skill players up rapidly.</li>
                    <li><strong>Diamond to Ascendant:</strong> The system begins to transition. Teamplay becomes more important. Your KDA matters less, and the round differential matters more.</li>
                    <li><strong>Immortal and Radiant:</strong> In these ranks, individual performance has almost zero impact on RR. The only thing that matters is winning and the round score. You could go 4/15/2, but if your team wins 13-0, you get max points. This encourages high-elo players to play Support/Controller roles properly rather than baiting teammates for kills.</li>
                </ul>

                <h2 id="performance-bonus" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Unlocking the Performance Star</h2>
                <p>You may sometimes see a gold star next to your RR gain. This implies you played better than the system's prediction.</p>
                <p><strong>Important distinction:</strong> This doesn't just mean "You had a good KDA." It means "You did better than we expected YOU to do against THESE specific opponents."</p>
                <p>If you are Silver fighting Golds and you top frag, you are guaranteed a star (+5 to +9 RR). If you are Platinum fighting Silvers and you top frag, you might NOT get a star, because the system <em>expected</em> you to dominate. This keeps the ladder honest.</p>

                <h2 id="roles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Does Playing Support Hurt Your Rank?</h2>
                <p>A common myth is that Duelists climb faster because they get more kills and thus more ACS (Average Combat Score). While it is true that ACS favors damage and kills, Riot has integrated strict encounter MMR.</p>
                <p>If you play Sage and you wall off a site, slow the push, and delay the round, you might not get a kill, but your "Round Win" probability goes up. Since winning the match is the #1 factor (accounting for ~80% of RR math), playing a Support role correctly is arguably better than playing a Duelist poorly.</p>
                <p>Do not switch to Reyna just because you think it will give you more points. A 20-kill Loss is always -20 RR. A 5-kill Win is always +20 RR.</p>

                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Maximize RR Gains</h2>
                <ol className="list-decimal pl-6 space-y-4 my-4">
                    <li><strong>Never Give Up (The 0-12 comeback):</strong> We mentioned this before, but even if losing is inevitable, winning 5 rounds turns a -30 loss into a -22 loss. Over 100 games, saving 8 points here and there adds up to entire rank promotions.</li>
                    <li><strong>Dodge "Lost Lobbies":</strong> If your teammates are toxic in Agent Select, screaming, or fighting over roles, statistically your chance of winning drops below 40%. It is usually better to dodge (-3 RR penalty) than to play and lose (-20 RR and 45 minutes of time). The -3 RR does NOT affect your hidden MMR, so your future gains remain healthy.</li>
                    <li><strong>Duo Queue for Consistency:</strong> Having one teammate you can rely on reduces the RNG of matchmaking by 20%. You can ensure at least one lane is held or one trade is made. 5-stacking is risky as it often pits you against highly coordinated teams (and smurf stacks). Duo or Trio is the sweet spot for climbing.</li>
                </ol>

                <p className="mt-8"><strong>Summary:</strong> Valorant's RR system is designed to test consistency over a long period. One game means nothing. Ten games mean nothing. It is the trend over 50-100 games that defines your true rank. Stop staring at the +/- number of a single match, and focus on the trend of your performance.</p>

                <hr className="my-8" />
                <p className="text-sm"><em>Disclaimer: Riot Games tweaks their algorithms every Episode. This guide is based on the current competitive ecosystem (Episode 8/9 era).</em></p>
            </section>

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
                    <p>The Valorant RR Predictor helps players estimate their Rank Rating changes after a competitive match. By inputting the Match Outcome (Winning is the primary factor), Current Rank, Round Differential (margin of victory), and Performance (MVP vs Bot Frag), the tool calculates a likely RR range.</p>
                    <p>Key mechanics include the "Convergence" factor where hidden MMR pulls visible Rank, and the "Round Multiplier" where decisive victories yield higher rewards. This tool helps players visualize why they might be gaining less or losing more points, offering transparency into Valorant's complex ELO system.</p>
                </CardContent>
            </Card>
        </div>
    );
}
