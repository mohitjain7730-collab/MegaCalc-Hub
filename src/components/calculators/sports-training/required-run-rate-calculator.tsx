'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Activity, Zap, Users, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
    runsNeeded: z.number().min(0),
    ballsRemaining: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequiredRunRateCalculator() {
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
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Required Run Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the run rate needed to win a cricket match based on runs required and balls remaining.
                </p>
            </div>

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
                <div className="space-y-6">
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

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for required run rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Runs Needed
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of runs the batting team needs to score to win the match.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Target minus current score (e.g., 250 - 175 = 75 runs needed)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Must be achieved within remaining balls to win</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Balls Remaining
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of legal deliveries left in the innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>In T20: 120 balls total (20 overs × 6 balls)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>In ODI: 300 balls total (50 overs × 6 balls)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center mb-2">
                            Required Run Rate = Runs Needed / (Balls Remaining / 6)
                        </p>
                        <p className="font-mono text-sm text-center">
                            Or: Required Run Rate = (Runs Needed × 6) / Balls Remaining
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Calculates the average runs per over needed to achieve the target within the remaining deliveries. Essential for chase planning and batting strategy in limited-overs cricket.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Cricket Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Wicket efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Fantasy cricket</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                <meta itemProp="name" content="The Complete Guide to Required Run Rate in Cricket: Chase Strategy and Calculation" />
                <meta itemProp="description" content="An expert guide to understanding required run rate in cricket, including calculation methods, chase strategies, and real-world applications in T20 and ODI cricket." />
                <meta itemProp="keywords" content="required run rate, cricket chase calculator, run rate cricket, T20 chase, ODI chase, cricket run rate formula" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Required Run Rate in Cricket</h2>
                <p className="text-lg italic text-muted-foreground">Master the essential metric for chase planning and batting strategy in limited-overs cricket.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Required Run Rate?</h2>
                <p>The <strong>Required Run Rate (RRR)</strong> is the average runs per over a batting team needs to score to achieve their target within the remaining deliveries. It's the most critical real-time metric in limited-overs cricket chases.</p>

                <p>Required run rate constantly changes as the innings progresses, providing instant feedback on whether the batting team is ahead of, on track with, or behind the required pace.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">How to Calculate Required Run Rate</h2>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Required Run Rate = Runs Needed / Overs Remaining
                    </p>
                </div>

                <p>Or expressed in terms of balls:</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-lg">
                        Required Run Rate = (Runs Needed × 6) / Balls Remaining
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>A team needs 75 runs from 60 balls (10 overs):</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Required Run Rate = 75 / 10 = 7.5 runs per over</li>
                    <li>Runs per ball = 75 / 60 = 1.25 runs per ball</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Interpreting Required Run Rate</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket Benchmarks</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 6.0:</strong> Very comfortable chase</li>
                    <li><strong>6.0-8.0:</strong> Moderate chase, achievable with good batting</li>
                    <li><strong>8.0-10.0:</strong> Challenging, requires aggressive batting</li>
                    <li><strong>10.0-12.0:</strong> Difficult, needs exceptional hitting</li>
                    <li><strong>Above 12.0:</strong> Extremely difficult, rarely achieved</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket Benchmarks</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 5.0:</strong> Comfortable chase</li>
                    <li><strong>5.0-6.5:</strong> Moderate chase</li>
                    <li><strong>6.5-8.0:</strong> Challenging chase</li>
                    <li><strong>Above 8.0:</strong> Very difficult chase</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Chase Strategies Based on Required Run Rate</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Low Required Run Rate (Under 6.0)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Play normal cricket with minimal risk</li>
                    <li>Build partnerships and rotate strike</li>
                    <li>Capitalize on bad balls</li>
                    <li>Preserve wickets for later acceleration if needed</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Moderate Required Run Rate (6.0-8.0)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Balance between accumulation and aggression</li>
                    <li>Find 4-5 boundaries per over</li>
                    <li>Rotate strike consistently</li>
                    <li>Target weaker bowlers</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">High Required Run Rate (Above 10.0)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Aggressive batting from ball one</li>
                    <li>Cannot afford dot balls</li>
                    <li>Every over needs multiple boundaries</li>
                    <li>High-risk, high-reward approach essential</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Factors Affecting Chase Success</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wickets in hand:</strong> More wickets allow aggressive batting</li>
                    <li><strong>Batting depth:</strong> Strong lower order provides cushion</li>
                    <li><strong>Pitch conditions:</strong> Flat pitches favor chasing</li>
                    <li><strong>Dew factor:</strong> Evening dew helps batting in night matches</li>
                    <li><strong>Bowling quality:</strong> Weak bowling attacks easier to chase against</li>
                    <li><strong>Pressure handling:</strong> Mental strength crucial in tight chases</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Required run rate is the heartbeat of limited-overs cricket chases. Understanding how to calculate and interpret it is essential for players, coaches, and fans. It provides instant strategic guidance and helps teams make informed decisions about batting approach, risk-taking, and match awareness.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about required run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is required run rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                Required run rate is the average runs per over a batting team needs to score to achieve their target within the remaining overs. It's calculated by dividing runs needed by overs remaining and is the key metric for chase planning.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you calculate required run rate?</h4>
                            <p className="text-muted-foreground">
                                Required Run Rate = Runs Needed / Overs Remaining. For example, if you need 80 runs from 10 overs, the required run rate is 80/10 = 8.0 runs per over. You can also calculate it as (Runs Needed × 6) / Balls Remaining.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good required run rate to chase?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, under 8.0 is generally achievable. In ODI cricket, under 6.0 is comfortable. However, it depends on wickets in hand, pitch conditions, and batting depth. Modern teams have successfully chased rates above 10.0 in T20s.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between run rate and required run rate?</h4>
                            <p className="text-muted-foreground">
                                Run rate is the current scoring rate (runs per over being scored), while required run rate is the rate needed to win. If current run rate is higher than required run rate, the batting team is ahead of the chase.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest required run rate successfully chased?</h4>
                            <p className="text-muted-foreground">
                                In T20 internationals, teams have successfully chased requiring 15+ runs per over in the final overs. In ODIs, chasing 10+ runs per over in the death overs has been achieved. The record varies by format and match situation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does required run rate change during an innings?</h4>
                            <p className="text-muted-foreground">
                                Required run rate increases if you score slower than needed and decreases if you score faster. It's recalculated after every ball based on remaining runs and balls, providing real-time chase guidance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">When is required run rate most important?</h4>
                            <p className="text-muted-foreground">
                                Required run rate is crucial in all limited-overs cricket chases (T20, ODI). It's especially important in the middle and death overs when teams need to decide between consolidation and acceleration.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can required run rate be negative?</h4>
                            <p className="text-muted-foreground">
                                No. Once a team achieves their target, the chase is complete. However, if a team has already scored more runs than needed with overs remaining, they've won and required run rate becomes irrelevant.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you reduce required run rate?</h4>
                            <p className="text-muted-foreground">
                                Score runs faster than the current required rate. Find boundaries, rotate strike, minimize dot balls, and target weaker bowlers. Each run scored reduces the total runs needed, lowering the required run rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What happens if required run rate becomes impossible?</h4>
                            <p className="text-muted-foreground">
                                If required run rate exceeds realistic scoring rates (e.g., 18+ runs per over for multiple overs), the chase becomes virtually impossible. Teams may continue playing for net run rate or individual milestones.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This Calculator?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Teams</strong>
                                    <span className="text-sm text-muted-foreground">Plan chase strategy and set batting targets during matches.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Analyze match situations and guide batting approach.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Commentators & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Provide real-time chase analysis and predictions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">Better understand chase dynamics and match situations.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 1 - Comfortable T20 Chase:</strong> Need 45 runs from 48 balls (8 overs). Required Run Rate = 45/8 = 5.625. This is very comfortable—normal batting with occasional boundaries will suffice.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 2 - Challenging ODI Chase:</strong> Need 85 runs from 60 balls (10 overs). Required Run Rate = 85/10 = 8.5. This is challenging for ODI cricket and requires aggressive batting with minimal dot balls.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 3 - Difficult T20 Finish:</strong> Need 36 runs from 18 balls (3 overs). Required Run Rate = 36/3 = 12.0. This is very difficult—needs 2 boundaries per over minimum with no dot balls.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Required Run Rate Calculator determines the runs per over needed to achieve a target within remaining deliveries.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It is the most critical real-time metric in limited-overs cricket chases, guiding batting strategy and match awareness.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
