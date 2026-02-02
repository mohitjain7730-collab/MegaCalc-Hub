'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
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
    individualPerformance: z.number().min(0).max(500).optional(), // ACS
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

    // Round Difference Impact (e.g., 13-0 is huge, 13-11 is small)
    // For win: higher diff is better. For loss: lower diff (closer game) is better (less loss).
    let roundDiffImpact = 0;
    if (values.matchOutcome === 'win') {
        roundDiffImpact = values.roundDifference * 0.5; // +0.5 per round diff
    } else if (values.matchOutcome === 'loss') {
        // If you lost 0-13 (diff 13), that's bad. If you lost 11-13 (diff 2), that's good.
        // Base loss is usually around -20. 
        // Losing by a lot -> closer to -30. Losing by a little -> closer to -10.
        // So round diff of 13 should subtract RR (more negative). Diff of 1 should add RR (less negative).
        roundDiffImpact = -(values.roundDifference * 0.5);
    }

    // Rank Impact (Higher ranks have tighter RR gains/losses usually, or "convergence")
    // Simplifying: Immortal+ gains less on average wins unless strict MMR match.
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
        // Update min/max range for display based on calculation
        minRR = Math.max(10, finalRR - 5);
        maxRR = Math.min(50, finalRR + 5);
    } else if (values.matchOutcome === 'loss') {
        finalRR = Math.min(-10, Math.max(-35, finalRR)); // Cap loss typically
        // Update min/max range for display
        minRR = Math.max(-35, finalRR - 5);
        maxRR = Math.min(-5, finalRR + 5);
    } else {
        // Draw
        finalRR = Math.min(5, Math.max(-5, performanceScore)); // Draws usually depend heavily on performance
        minRR = finalRR - 2;
        maxRR = finalRR + 2;
    }

    // Generate Interpretation
    let status: ResultPayload['status'] = 'average';
    if (finalRR >= 25) status = 'excellent';
    else if (finalRR > 15) status = 'good';
    else if (finalRR >= -15) status = 'average';
    else if (finalRR > -25) status = 'bad';
    else status = 'terrible';

    return {
        estimatedRR: Math.round(finalRR),
        minRR: Math.round(minRR),
        maxRR: Math.round(maxRR),
        performanceFactor: values.performance === 'mvp' ? 'Massive Boost (MVP)' : values.performance === 'bot_frag' ? 'Penalty (Low Impact)' : 'Standard',
        roundDiffFactor: `${values.roundDifference} Round Diff`,
        rankFactor: values.currentRank,
        status,
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
            <Script id="valorant-rr-predictor-schema" type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'Valorant RR Predictor',
                    applicationCategory: 'GameApplication',
                    operatingSystem: 'Any',
                    description: 'Predict your Valorant Rank Rating (RR) gain or loss based on match performance.'
                })
            }} />

            <Card className="border-l-4 border-l-red-500 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Trophy className="h-6 w-6 text-red-500" />
                        Valorant RR Predictor
                    </CardTitle>
                    <CardDescription>
                        Estimate your Rank Rating (RR) gains or losses after a competitive match.
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
                                                            <option value="mvp">Match MVP (Best)</option>
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
                                                    How decisively did the match end? (e.g., 13-5 is a diff of 8)
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

                                <div className="text-sm italic text-muted-foreground">
                                    "{result.interpretation}"
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

            <section className="mt-12 space-y-6 bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-bold">How Valorant RR Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-red-500" /> Match Outcome</h3>
                        <p className="text-sm text-muted-foreground">Winning is the primary driver. Standard wins give ~20RR. Losses take ~20RR. Draws usually give slight + or - depending on performance.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-500" /> Performance (MMR)</h3>
                        <p className="text-sm text-muted-foreground">Your hidden MMR affects gains. If your MMR is higher than your rank, you gain more on wins and lose less on losses (convergence).</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-red-500" /> Round Differential</h3>
                        <p className="text-sm text-muted-foreground">Winning 13-0 gives significantly more RR than winning 13-11. Every round matters!</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
