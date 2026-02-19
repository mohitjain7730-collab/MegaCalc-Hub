'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, Percent, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    matchesWon: z.number().min(0, "Matches won must be non-negative"),
    matchesPlayed: z.number().min(1, "Matches played must be at least 1"),
}).refine((data) => data.matchesWon <= data.matchesPlayed, {
    message: "Matches won cannot exceed matches played",
    path: ["matchesWon"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisWinRatioCalculatorInteractive() {
    const [result, setResult] = useState<{
        ratio: number;
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
            matchesWon: undefined,
            matchesPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.matchesWon == null || v.matchesPlayed == null) return null;
        return (v.matchesWon / v.matchesPlayed) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 80) return 'Dominant performance. You are likely playing below your level or having an incredible season.';
        if (pct >= 65) return 'Excellent win rate. Winning 2 out of 3 matches indicates strong superiority.';
        if (pct >= 50) return 'Solid, competitive performance. You are winning as much as you lose.';
        if (pct >= 35) return 'Learning phase. You might be facing tougher opponents than before.';
        return 'Challenging period. Focus on development rather than results.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 80) return 'Dominator';
        if (pct >= 60) return 'High Performer';
        if (pct >= 45) return 'Competitor';
        if (pct >= 30) return 'Challenger';
        return 'Developing';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 80) return 'Consider moving up a level or finding stronger sparring partners to keep improving.';
        if (pct >= 60) return 'Great momentum. Focus on closing out tight matches to push this even higher.';
        if (pct >= 45) return 'Identify the specific reasons for losses—fitness? backhand? mental game?';
        if (pct >= 30) return 'Review your matchplay tactics. Are you playing specific opponents that don\'t suit your style?';
        return 'Don\'t get discouraged. Focus on technical fundamentals and small wins within matches.';
    };

    const getRating = (pct: number) => {
        if (pct >= 70) return 'Outstanding';
        if (pct >= 55) return 'Excellent';
        if (pct >= 45) return 'Good';
        if (pct >= 35) return 'Fair';
        return 'Needs Experience';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 75) {
            insights.push('High confidence levels');
            insights.push('Opponents likely intimidated');
            insights.push('Risk of complacency');
        } else if (pct >= 55) {
            insights.push('Winning the key points');
            insights.push('Consistent performance');
            insights.push('Good physical conditioning');
        } else if (pct >= 45) {
            insights.push('Competitive in most matches');
            insights.push('Often decided by a few points');
            insights.push('Room for tactical growth');
        } else {
            insights.push('Struggling to close matches');
            insights.push('Likely defensive mindset');
            insights.push('Gaining valuable experience');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Strength of schedule (easy vs hard opponents)');
        considerations.push('Surface specialization (clay vs hard)');
        considerations.push('Injury impact on recent matches');
        considerations.push('Format (singles vs doubles dynamics differ)');
        considerations.push('Tournament pressure vs practice matches');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const pct = calculate(values);
        if (pct !== null) {
            setResult({
                ratio: pct,
                interpretation: interpret(pct),
                performanceLevel: getPerformanceLevel(pct),
                recommendation: getRecommendation(pct),
                rating: getRating(pct),
                insights: getInsights(pct),
                considerations: getConsiderations(pct)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your match record to calculate win ratio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="matchesWon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Matches Won
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 25"
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
                                    name="matchesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Matches Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 40"
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
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Win Ratio
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
                                <Percent className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Win Ratio</h2>
                                    <p className="text-muted-foreground">Season Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.ratio.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Dominator' ? 'default' : result.performanceLevel === 'High Performer' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                                    <p className="font-semibold">Record</p>
                                    <p className="text-lg font-bold">{form.getValues().matchesWon} W - {(form.getValues().matchesPlayed || 0) - (form.getValues().matchesWon || 0)} L</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Advice:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Smart Actions & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Key Takeaways
                                </CardTitle>
                                <CardDescription>What this record says about you</CardDescription>
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
                                    Contextual Factors
                                </CardTitle>
                                <CardDescription>Don't forget to consider</CardDescription>
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
