'use client';

import { useState } from 'react';
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

export default function ValorantRRPredictorInteractive() {
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
        </div>
    );
}
