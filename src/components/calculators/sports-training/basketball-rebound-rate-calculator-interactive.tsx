'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Crown, Timer, Users, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    playerRebounds: z.number().min(0, "Rebounds cannot be negative"),
    playerMinutes: z.number().min(1, "Player minutes must be at least 1"),
    teamRebounds: z.number().min(0, "Team rebounds cannot be negative"),
    opponentRebounds: z.number().min(0, "Opponent rebounds cannot be negative"),
    teamMinutes: z.number().min(48, "Team minutes usually 48 (NBA) or 40 (FIBA/College)").default(48),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballReboundRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        trbPercent: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            playerRebounds: undefined,
            playerMinutes: undefined,
            teamRebounds: undefined,
            opponentRebounds: undefined,
            teamMinutes: 48,
        },
    });

    const calculateTRB = (v: FormValues) => {
        // Formula: 100 * (Player TRB * (Team MP / 5)) / (Player MP * (Team TRB + Opp TRB))
        // Team MP / 5 is historically used to estimate "Possessions" or standardize for 5 players.
        // Actually, the term (Team MP / 5) corrects for the fact that 5 players are on court.
        // Simplified Logic: 
        // Denominator (Team TRB + Opp TRB) is total available rebounds while player was on floor? 
        // No, standard advanced stat uses season/game totals and scales by minutes.
        // Formula: TRB% = 100 * (TRB * (Tm MP / 5)) / (MP * (Tm TRB + Opp TRB))

        const numerator = v.playerRebounds * (v.teamMinutes / 5);
        const denominator = v.playerMinutes * (v.teamRebounds + v.opponentRebounds);

        if (denominator === 0) return 0;
        return (numerator / denominator) * 100;
    };

    const interpret = (trb: number) => {
        if (trb >= 20) return 'Dominant Rebounder (Rodman/Drummond level).';
        if (trb >= 15) return 'Elite Rebounder. Consistent double-double threat.';
        if (trb >= 10) return 'Solid Rebounder. Standard for starting bigs.';
        if (trb >= 5) return 'Average/Guard Level.';
        return 'Below Average. Minimal impact on the glass.';
    };

    const getPerformanceLevel = (trb: number) => {
        if (trb >= 20) return 'Historic';
        if (trb >= 15) return 'Elite';
        if (trb >= 10) return 'Solid';
        if (trb >= 5) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (trb: number) => {
        if (trb >= 15) return 'Keep crashing. Your boarding provides immense extra possessions.';
        if (trb >= 10) return 'Good work. Focus on boxing out to turn 50/50 balls into wins.';
        if (trb >= 5) return 'For a guard, this is fine. For a forward, be more aggressive.';
        return 'Work on positioning and anticipation. You are rarely securing the ball.';
    };

    const getRating = (trb: number) => {
        if (trb >= 20) return 'A+';
        if (trb >= 15) return 'A';
        if (trb >= 10) return 'B';
        if (trb >= 5) return 'C';
        return 'D';
    };

    const getInsights = (trb: number, v: FormValues) => {
        const insights = [];
        const totalRebounds = v.teamRebounds + v.opponentRebounds;

        if (trb >= 20) insights.push('Securing 1 in 5 available rebounds (Dominant)');
        if (trb >= 10 && trb < 15) insights.push('Securing 1 in 10 available rebounds');

        const rpg = v.playerRebounds * (v.teamMinutes / v.playerMinutes); // approx per 36-48
        if (rpg > 10) insights.push('Pacing for double-digit rebounds per game');

        if (v.playerMinutes < 15 && trb > 15) insights.push('High efficiency in limited minutes (Per-Minute Beast)');

        return insights;
    };

    const getConsiderations = (trb: number) => {
        const considerations = [];
        considerations.push('Does not differentiate offensive vs defensive rebounds (ORB% / DRB% differ)');
        considerations.push('Depends on system (some teams box out for guards to grab)');
        considerations.push('Assumes opponent missed enough shots to create rebound opportunities');
        considerations.push('Raw size advantage often skews this at lower levels');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const trb = calculateTRB(values);
        setResult({
            trbPercent: trb,
            interpretation: interpret(trb),
            performanceLevel: getPerformanceLevel(trb),
            recommendation: getRecommendation(trb),
            rating: getRating(trb),
            insights: getInsights(trb, values),
            considerations: getConsiderations(trb)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Rebounding Stats Input</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter game or season totals to calculate TRB%
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="playerRebounds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Player Rebounds
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 12" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="playerMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Timer className="h-4 w-4" />
                                                Player Minutes (MP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 32" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="teamMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Timer className="h-4 w-4" />
                                                Possible Minutes
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="48 (NBA) or 40 (FIBA)" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormDescription className="text-xs">Usually 48 for NBA, 40 for High School/College.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Alert className="md:col-span-2 bg-muted/50 border-none">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-sm text-muted-foreground">
                                        Enter total rebounds for BOTH teams. If you don't have exact numbers, estimate based on game averages (e.g. Team: 45, Opp: 45).
                                    </AlertDescription>
                                </Alert>

                                <FormField
                                    control={form.control}
                                    name="teamRebounds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Team Rebounds</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 45" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="opponentRebounds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Opponent Rebounds</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 42" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                <Crown className="mr-2 h-4 w-4" />
                                Calculate Rebound Rate (TRB%)
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Main Result Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Crown className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Total Rebound Percentage (TRB%)</h2>
                                    <p className="text-muted-foreground">Glass Dominance Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.trbPercent.toFixed(2)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Tier</p>
                                    <Badge variant={result.performanceLevel === 'Historic' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Solid' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Grade</p>
                                    <Badge variant={result.rating === 'A+' || result.rating === 'A' ? 'default' : result.rating === 'B' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Share of Boards</p>
                                    <p className="text-lg font-bold">1 in {(100 / result.trbPercent).toFixed(1)}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Recommendation:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Insights & Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Key Findings
                                </CardTitle>
                                <CardDescription>What the numbers say</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium">{insight}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Context
                                </CardTitle>
                                <CardDescription>Why this varies</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.considerations.map((consideration, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
