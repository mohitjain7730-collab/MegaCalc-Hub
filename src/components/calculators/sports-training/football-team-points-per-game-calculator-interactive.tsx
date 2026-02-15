'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Clock, Info, CheckCircle2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    points: z.number().min(0, "Points must be non-negative"),
    matchesPlayed: z.number().min(1, "Matches played must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballTeamPointsPerGameCalculatorInteractive() {
    const [result, setResult] = useState<{
        ppg: number;
        projectedPoints: number;
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
            points: undefined,
            matchesPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.points == null || v.matchesPlayed == null || v.matchesPlayed === 0) return null;
        return v.points / v.matchesPlayed;
    };

    const interpret = (val: number) => {
        if (val >= 2.5) return 'Historic dominance. Championship winning pace in any major league.';
        if (val >= 2.0) return 'Title contender form. Valid pace for Champions League qualification.';
        if (val >= 1.5) return 'Solid upper-mid table. Likely European qualification spots (Europa/Conference).';
        if (val >= 1.2) return 'Safe mid-table comfort. No relegation risk but limited upside.';
        if (val >= 1.0) return 'Relegation battle territory. Just enough to survive (usually).';
        return 'Crisis mode. High risk of relegation if form does not improve immediately.';
    };

    const getPerformanceLevel = (val: number) => {
        if (val >= 2.3) return 'World Class';
        if (val >= 2.0) return 'Elite';
        if (val >= 1.5) return 'Good';
        if (val >= 1.1) return 'Average';
        return 'Relegation Form';
    };

    const getRecommendation = (val: number) => {
        if (val >= 2.2) return 'Maintain consistency. Rotation is key to sustaining this high level.';
        if (val >= 1.8) return 'Great platform. Turn draws into wins to challenge for the title.';
        if (val >= 1.4) return 'Improve defensive solidity to break into the top 4.';
        if (val >= 1.0) return 'Review tactical setup. Focus on grinding out results at home.';
        return 'Immediate change needed. Managerial or tactical overhaul required.';
    };

    const getRating = (val: number) => {
        if (val >= 2.3) return 'Outstanding';
        if (val >= 2.0) return 'Excellent';
        if (val >= 1.5) return 'Good';
        if (val >= 1.1) return 'Fair';
        return 'Poor';
    };

    const getInsights = (val: number) => {
        const insights = [];
        if (val >= 2.0) {
            insights.push('Championship winning trajectory');
            insights.push('Dominant home and away form');
            insights.push('Squad likely fully bought in');
        } else if (val >= 1.5) {
            insights.push('European qualification contender');
            insights.push('Inconsistent away form typically');
            insights.push('Good foundation to build on');
        } else if (val >= 1.0) {
            insights.push('Survival is the primary goal');
            insights.push('Strong home form essential now');
            insights.push('Every point is crucial');
        } else {
            insights.push('Relegation highly probable');
            insights.push('Defensive fragility usually the cause');
            insights.push('Confidence likely shattered');
        }
        return insights;
    };

    const getConsiderations = (val: number) => {
        const considerations = [];
        considerations.push('Strength of schedule (played top teams yet?)');
        considerations.push('Home vs Away disparity ( PPG often lower Away)');
        considerations.push('Injuries/Suspensions affecting recent form');
        considerations.push('Luck factor (xPoints vs Actual Points)');
        considerations.push('League competitiveness (2.0 in one league might not be 2.0 in another)');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const val = calculate(values);
        if (val !== null) {
            setResult({
                ppg: val,
                projectedPoints: Math.round(val * 38), // Standard 38 game season
                interpretation: interpret(val),
                performanceLevel: getPerformanceLevel(val),
                recommendation: getRecommendation(val),
                rating: getRating(val),
                insights: getInsights(val),
                considerations: getConsiderations(val)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Team Standings Data</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter current points and matches played to calculate PPG
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="points"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Current Points
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 45"
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
                                                <Clock className="h-4 w-4" />
                                                Matches Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 20"
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
                                Calculate Points Per Game
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
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Points Per Game</h2>
                                    <p className="text-muted-foreground">Season Trajectory</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.ppg.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Projected Finish (38gms)</p>
                                    <p className="text-lg font-bold">{result.projectedPoints} pts</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
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

                    {/* Smart Actions & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Performance Insights
                                </CardTitle>
                                <CardDescription>Trajectory Analysis</CardDescription>
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
                                    Context & Risks
                                </CardTitle>
                                <CardDescription>Factors affecting projection</CardDescription>
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
