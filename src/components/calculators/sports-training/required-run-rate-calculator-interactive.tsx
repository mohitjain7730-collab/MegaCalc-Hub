'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsNeeded: z.number().min(0, 'Runs needed must be positive'),
    ballsRemaining: z.number().min(1, 'Balls remaining must be greater than 0'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequiredRunRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        requiredRunRate: number;
        runsPerBall: number;
        oversRemaining: number;
        interpretation: string;
        difficulty: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsNeeded: undefined,
            ballsRemaining: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsNeeded == null || v.ballsRemaining == null) return null;
        if (v.ballsRemaining === 0) return null;

        const oversRemaining = v.ballsRemaining / 6;
        const requiredRunRate = v.runsNeeded / oversRemaining;
        const runsPerBall = v.runsNeeded / v.ballsRemaining;

        return {
            requiredRunRate,
            runsPerBall,
            oversRemaining
        };
    };

    const interpret = (rrr: number) => {
        if (rrr <= 6.0) return 'Very achievable run rate with normal batting approach.';
        if (rrr <= 8.0) return 'Moderate chase requiring good strike rotation and boundaries.';
        if (rrr <= 10.0) return 'Challenging chase requiring aggressive batting and risk-taking.';
        if (rrr <= 12.0) return 'Difficult chase requiring exceptional hitting and minimal dot balls.';
        if (rrr <= 15.0) return 'Very difficult chase requiring explosive batting throughout.';
        return 'Extremely difficult chase requiring near-perfect execution and boundaries every over.';
    };

    const getDifficulty = (rrr: number) => {
        if (rrr <= 6.0) return 'Easy';
        if (rrr <= 8.0) return 'Moderate';
        if (rrr <= 10.0) return 'Challenging';
        if (rrr <= 12.0) return 'Difficult';
        if (rrr <= 15.0) return 'Very Difficult';
        return 'Extremely Difficult';
    };

    const getRecommendation = (rrr: number) => {
        if (rrr <= 6.0) return 'Play normal cricket. Rotate strike and capitalize on bad balls.';
        if (rrr <= 8.0) return 'Build partnerships. Target weak bowlers and find boundaries regularly.';
        if (rrr <= 10.0) return 'Aggressive intent needed. Minimize dot balls and target boundaries.';
        if (rrr <= 12.0) return 'High-risk batting required. Attack from the start and maintain momentum.';
        if (rrr <= 15.0) return 'Explosive batting essential. Every ball must be scored off with boundary intent.';
        return 'Near-impossible chase. Requires exceptional power hitting and luck.';
    };

    const getRating = (rrr: number) => {
        if (rrr <= 6.0) return 'Comfortable';
        if (rrr <= 8.0) return 'Achievable';
        if (rrr <= 10.0) return 'Tough';
        if (rrr <= 12.0) return 'Very Tough';
        if (rrr <= 15.0) return 'Nearly Impossible';
        return 'Impossible';
    };

    const getInsights = (rrr: number, runsPerBall: number) => {
        const insights = [];
        insights.push(`Need ${runsPerBall.toFixed(2)} runs per ball on average`);

        if (rrr <= 6.0) {
            insights.push('Standard batting approach sufficient');
            insights.push('Focus on building partnerships');
            insights.push('Plenty of time to settle in');
        } else if (rrr <= 8.0) {
            insights.push('Good strike rotation essential');
            insights.push('Find 4-5 boundaries per over');
            insights.push('Avoid long periods without boundaries');
        } else if (rrr <= 10.0) {
            insights.push('Aggressive batting from ball one');
            insights.push('Target 6-8 boundaries per over');
            insights.push('Minimal margin for error');
        } else if (rrr <= 12.0) {
            insights.push('Explosive batting absolutely necessary');
            insights.push('Every over must have multiple boundaries');
            insights.push('Cannot afford dot balls');
        } else {
            insights.push('Requires exceptional power hitting');
            insights.push('Almost every ball must be a boundary');
            insights.push('Historically very rare to achieve');
        }
        return insights;
    };

    const getConsiderations = (rrr: number) => {
        const considerations = [];
        considerations.push('Pitch conditions significantly affect achievability');
        considerations.push('Quality of remaining batsmen impacts success probability');
        considerations.push('Bowling quality and variations matter greatly');
        considerations.push('Pressure situations affect batting performance');
        considerations.push('Wickets in hand provide cushion for aggressive batting');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const calc = calculate(values);
        if (calc) {
            setResult({
                requiredRunRate: calc.requiredRunRate,
                runsPerBall: calc.runsPerBall,
                oversRemaining: calc.oversRemaining,
                interpretation: interpret(calc.requiredRunRate),
                difficulty: getDifficulty(calc.requiredRunRate),
                recommendation: getRecommendation(calc.requiredRunRate),
                rating: getRating(calc.requiredRunRate),
                insights: getInsights(calc.requiredRunRate, calc.runsPerBall),
                considerations: getConsiderations(calc.requiredRunRate)
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
                        <h2 className="text-xl font-semibold">Chase Requirements</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter runs needed and balls remaining to calculate required run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="runsNeeded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Runs Needed
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 75"
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
                                    name="ballsRemaining"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Balls Remaining
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 60"
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
                                Calculate Required Run Rate
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
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Required Run Rate</h2>
                                    <p className="text-muted-foreground">Chase Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.requiredRunRate.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground mt-1">runs per over</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Difficulty</p>
                                    <Badge variant={result.difficulty === 'Easy' || result.difficulty === 'Moderate' ? 'default' : result.difficulty === 'Challenging' ? 'secondary' : 'destructive'}>
                                        {result.difficulty}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Assessment</p>
                                    <Badge variant={result.rating === 'Comfortable' || result.rating === 'Achievable' ? 'default' : result.rating === 'Tough' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Overs Remaining</p>
                                    <p className="text-lg font-bold">{result.oversRemaining.toFixed(1)}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold">Runs Per Ball</p>
                                    <p className="text-lg font-bold">{result.runsPerBall.toFixed(2)}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Strategy:</strong> {result.recommendation}
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
                                    Chase Insights
                                </CardTitle>
                                <CardDescription>Key factors and requirements</CardDescription>
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
                                    Important Considerations
                                </CardTitle>
                                <CardDescription>Factors affecting success</CardDescription>
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
