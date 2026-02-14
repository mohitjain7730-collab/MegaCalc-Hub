'use client';

import { useState } from 'react';
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

export default function ValorantRankProgressionInteractive() {
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
        </div>
    );
}
