'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Trophy, Clock, Target, ArrowRight, TrendingUp, BarChart2, ShieldCheck } from 'lucide-react';
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
    { id: 'radiant', label: 'Radiant', baseRR: 2500 } // Arbitrary cap for progression calc
];

// Each rank tier has 3 subdivisions (1, 2, 3) of 100 RR each, except Radiant.
// To simplify user input, we can ask for Rank (e.g. Silver) and Tier (1, 2, 3).
// Total RR = Base(Rank) + (Tier-1)*100 + CurrentRR

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
};

const calculateProgression = (values: FormValues): ResultPayload => {
    // Helper to get total cumulative RR
    const getAbsoluteRR = (rankId: string, tier: number, rr: number) => {
        const rank = ranks.find(r => r.id === rankId);
        if (!rank) return 0;
        // Immortal+ logic is simpler (depends on regional leaderboards), but for calculator we treat it as linear
        // Standard: Rank Base + ((Tier-1)*100) + RR
        return rank.baseRR + ((tier - 1) * 100) + rr;
    };

    // For Target, we assume they want to reach the *start* of that rank (Tier 1, 0 RR)
    // Unless target is same as current, then maybe next tier?
    // Let's assume start of Target Rank Tier 1.

    // Correction: "Target Rank" usually implies reaching the next major milestone.
    // Let's assume user wants to reach [Target Rank] 1 with 10 RR (safe buffer).

    const currentAbsoluteRR = getAbsoluteRR(values.currentRank, values.currentTier, values.currentRR);
    // Target is start of target rank
    const targetRankObj = ranks.find(r => r.id === values.targetRank);
    const targetAbsoluteRR = targetRankObj ? targetRankObj.baseRR : 0;

    const totalRRNeeded = Math.max(0, targetAbsoluteRR - currentAbsoluteRR);

    // Net RR Calculation
    // Expected Value per match = (Win% * WinRR) - (Loss% * LossRR)
    const winProb = values.winRate / 100;
    const lossProb = 1 - winProb;
    const netRR = (winProb * values.avgWinRR) - (lossProb * values.avgLossRR);

    if (netRR <= 0) {
        // Infinite/Impossible at current rate
        return {
            totalRRNeeded,
            netRRPerMatch: netRR,
            estimatedGames: Infinity,
            estimatedWins: 0,
            estimatedLosses: 0,
            totalGames: Infinity,
            winRate: values.winRate,
            timeEstimateHours: Infinity
        };
    }

    const totalGames = Math.ceil(totalRRNeeded / netRR);
    const estimatedWins = Math.ceil(totalGames * winProb);
    const estimatedLosses = Math.floor(totalGames * lossProb);

    // Assume avg game time 35 mins
    const timeEstimateHours = Math.ceil((totalGames * 35) / 60);

    return {
        totalRRNeeded,
        netRRPerMatch: netRR,
        estimatedGames: totalGames,
        estimatedWins,
        estimatedLosses,
        totalGames,
        winRate: values.winRate,
        timeEstimateHours
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
            avgLossRR: 15, // Usually slightly favored if not boosted
            winRate: 51,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateProgression(values));
    };

    // Custom validation or error handling if Target < Current
    const currentRankIdx = ranks.findIndex(r => r.id === form.getValues().currentRank);
    const targetRankIdx = ranks.findIndex(r => r.id === form.getValues().targetRank);
    const isTargetLower = targetRankIdx <= currentRankIdx && targetRankIdx !== -1;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="valorant-rank-progression-schema" type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'Valorant Rank Progression Calculator',
                    applicationCategory: 'GameApplication',
                    operatingSystem: 'Any',
                    description: 'Calculate how many games of Valorant you need to win to reach your dream rank.'
                })
            }} />

            <Card className="border-l-4 border-l-red-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <TrendingUp className="h-6 w-6 text-red-500" />
                        Valorant Rank Progression
                    </CardTitle>
                    <CardDescription>
                        Calculate the grind. Find out exactly how many games it takes to reach Immortal.
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
                                            ~{result.timeEstimateHours} hours of playtime
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Net RR Per Match</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-black tracking-tight text-red-600 dark:text-red-400 mb-1">
                                            {result.netRRPerMatch > 0 ? '+' : ''}{result.netRRPerMatch.toFixed(1)}
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
                                    {/* Simple visual timeline */}
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Grind Time</p>
                                            <p className="text-muted-foreground">At 3 games/day, this will take approximately <span className="text-foreground font-bold">{result.totalGames === Infinity ? 'Forever' : Math.ceil(result.totalGames / 3)} days</span>.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Consistency</p>
                                            <p className="text-muted-foreground">You need to earn <span className="text-foreground font-bold">{result.totalRRNeeded} RR</span> total. A 1% increase in Win Rate saves about {Math.ceil(result.totalGames * 0.1)} games.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Reality Check</p>
                                            <p className="text-muted-foreground">{result.netRRPerMatch < 0.5 ? "Progress will be very slow. Try to improve individual performance to boost RR gains." : "You are on a healthy climbing trajectory."}</p>
                                        </div>
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
        </div>
    );
}
