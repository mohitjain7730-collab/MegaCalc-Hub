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
    runsScored: z.number().min(0),
    oversBowled: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeamRunRateCalculator() {
    const [result, setResult] = useState<{
        runRate: number;
        runsPerBall: number;
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
            runsScored: undefined,
            oversBowled: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsScored == null || v.oversBowled == null) return null;
        if (v.oversBowled === 0) return null;

        const runRate = v.runsScored / v.oversBowled;
        const totalBalls = v.oversBowled * 6;
        const runsPerBall = v.runsScored / totalBalls;

        return {
            runRate,
            runsPerBall
        };
    };

    const interpret = (rr: number) => {
        if (rr >= 10.0) return 'Exceptional run rate with explosive scoring throughout the innings.';
        if (rr >= 8.0) return 'Excellent run rate showing aggressive and effective batting.';
        if (rr >= 6.5) return 'Good run rate indicating strong batting performance.';
        if (rr >= 5.0) return 'Moderate run rate - acceptable for ODI cricket.';
        if (rr >= 4.0) return 'Below-average run rate - slow scoring pace.';
        return 'Poor run rate - very slow scoring requiring improvement.';
    };

    const getPerformanceLevel = (rr: number) => {
        if (rr >= 10.0) return 'Explosive';
        if (rr >= 8.0) return 'Excellent';
        if (rr >= 6.5) return 'Good';
        if (rr >= 5.0) return 'Moderate';
        if (rr >= 4.0) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (rr: number) => {
        if (rr >= 10.0) return 'Maintain aggressive approach. Excellent scoring rate for any format.';
        if (rr >= 8.0) return 'Strong performance. Continue positive batting intent.';
        if (rr >= 6.5) return 'Good pace. Look for opportunities to accelerate further.';
        if (rr >= 5.0) return 'Need to increase scoring rate. Find more boundaries and rotate strike better.';
        if (rr >= 4.0) return 'Scoring too slowly. Increase aggression and minimize dot balls.';
        return 'Critical situation. Immediate acceleration needed to post competitive total.';
    };

    const getRating = (rr: number) => {
        if (rr >= 10.0) return 'Outstanding';
        if (rr >= 8.0) return 'Excellent';
        if (rr >= 6.5) return 'Good';
        if (rr >= 5.0) return 'Fair';
        if (rr >= 4.0) return 'Below Average';
        return 'Poor';
    };

    const getInsights = (rr: number, runsPerBall: number) => {
        const insights = [];
        insights.push(`Scoring ${runsPerBall.toFixed(2)} runs per ball on average`);

        if (rr >= 10.0) {
            insights.push('Dominant batting performance');
            insights.push('Likely to post match-winning total');
            insights.push('Exceptional boundary-hitting and strike rotation');
        } else if (rr >= 8.0) {
            insights.push('Strong aggressive batting');
            insights.push('Competitive total likely');
            insights.push('Good balance of boundaries and strike rotation');
        } else if (rr >= 6.5) {
            insights.push('Solid batting foundation');
            insights.push('Decent total achievable');
            insights.push('Room for late acceleration');
        } else if (rr >= 5.0) {
            insights.push('Moderate scoring pace');
            insights.push('Need acceleration in death overs');
            insights.push('Below-par total risk');
        } else if (rr >= 4.0) {
            insights.push('Slow scoring rate');
            insights.push('Struggling to find boundaries');
            insights.push('Likely below-par total');
        } else {
            insights.push('Very poor scoring rate');
            insights.push('Significant batting struggles');
            insights.push('Well below competitive total');
        }
        return insights;
    };

    const getConsiderations = (rr: number) => {
        const considerations = [];
        considerations.push('Format of cricket affects ideal run rate expectations');
        considerations.push('Pitch conditions impact achievable scoring rates');
        considerations.push('Match phase (powerplay, middle, death) influences run rate');
        considerations.push('Wickets in hand affect ability to maintain/increase rate');
        considerations.push('Quality of bowling attack impacts scoring difficulty');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const calc = calculate(values);
        if (calc) {
            setResult({
                runRate: calc.runRate,
                runsPerBall: calc.runsPerBall,
                interpretation: interpret(calc.runRate),
                performanceLevel: getPerformanceLevel(calc.runRate),
                recommendation: getRecommendation(calc.runRate),
                rating: getRating(calc.runRate),
                insights: getInsights(calc.runRate, calc.runsPerBall),
                considerations: getConsiderations(calc.runRate)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Team Run Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate current team run rate (runs per over) to assess scoring pace and match position.
                </p>
            </div>

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Team Scoring Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter runs scored and overs completed to calculate team run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="runsScored"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Runs Scored
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 175"
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
                                    name="oversBowled"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Overs Completed
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
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
                                Calculate Team Run Rate
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
                                <BarChart3 className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Team Run Rate</h2>
                                    <p className="text-muted-foreground">Scoring Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.runRate.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground mt-1">runs per over</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Explosive' || result.performanceLevel === 'Excellent' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' || result.rating === 'Excellent' ? 'default' : result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Runs Per Ball</p>
                                    <p className="text-lg font-bold">{result.runsPerBall.toFixed(2)}</p>
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
                                <CardDescription>Key scoring indicators</CardDescription>
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
                                <CardDescription>Factors affecting interpretation</CardDescription>
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
                        Key components required for team run rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Runs Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total runs accumulated by the batting team so far in their innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs scored by batsmen and extras</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Updated continuously as the innings progresses</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Overs Completed
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of complete and partial overs bowled in the innings so far.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Expressed in decimal format (e.g., 15.4 = 15 overs and 4 balls)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Each complete over consists of 6 legal deliveries</span>
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
                        <p className="font-mono text-sm text-center">
                            Team Run Rate = Runs Scored / Overs Completed
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Calculates the average runs scored per over by the batting team. This metric shows the current scoring pace and helps compare performance against required run rates or opposition scores.
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
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
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
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
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
                        <Link href="/category/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
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
                <meta itemProp="name" content="The Complete Guide to Team Run Rate in Cricket: Calculation and Analysis" />
                <meta itemProp="description" content="An expert guide to understanding team run rate in cricket, including calculation methods, performance benchmarks, and strategic applications in limited-overs cricket." />
                <meta itemProp="keywords" content="team run rate, cricket run rate, current run rate, cricket scoring rate, T20 run rate, ODI run rate" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Team Run Rate in Cricket</h2>
                <p className="text-lg italic text-muted-foreground">Master the fundamental metric that measures team scoring pace and batting performance in limited-overs cricket.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Team Run Rate?</h2>
                <p>The <strong>Team Run Rate</strong> (also called Current Run Rate or CRR) is the average number of runs a team scores per over during their innings. It's calculated by dividing total runs scored by overs completed.</p>

                <p>Team run rate is constantly updated throughout an innings and serves as the primary indicator of scoring pace. It's compared against required run rates in chases or used to assess batting performance when setting a total.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">How to Calculate Team Run Rate</h2>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Team Run Rate = Runs Scored / Overs Completed
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>A team has scored 175 runs in 20 overs:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Team Run Rate = 175 / 20 = 8.75 runs per over</li>
                    <li>This indicates strong aggressive batting in T20 cricket</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Interpreting Team Run Rate by Format</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>10.0+:</strong> Exceptional scoring rate</li>
                    <li><strong>8.0-10.0:</strong> Excellent batting performance</li>
                    <li><strong>6.5-8.0:</strong> Good competitive rate</li>
                    <li><strong>5.0-6.5:</strong> Below par for T20</li>
                    <li><strong>Under 5.0:</strong> Poor scoring rate</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>7.0+:</strong> Exceptional scoring</li>
                    <li><strong>6.0-7.0:</strong> Excellent rate</li>
                    <li><strong>5.0-6.0:</strong> Good competitive rate</li>
                    <li><strong>4.0-5.0:</strong> Moderate rate</li>
                    <li><strong>Under 4.0:</strong> Slow scoring</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Team Run Rate vs Required Run Rate</h2>
                <p>In a chase, comparing team run rate with required run rate shows match status:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team RR &gt; Required RR:</strong> Batting team ahead of the chase</li>
                    <li><strong>Team RR = Required RR:</strong> Exactly on track</li>
                    <li><strong>Team RR &lt; Required RR:</strong> Batting team behind, needs acceleration</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategic Applications</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">When Batting First</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Monitor run rate to ensure competitive total</li>
                    <li>Compare with par scores for the venue</li>
                    <li>Identify when acceleration is needed</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">When Chasing</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Compare with required run rate constantly</li>
                    <li>Adjust batting approach based on gap</li>
                    <li>Plan acceleration or consolidation phases</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Team run rate is the heartbeat of limited-overs cricket innings. It provides instant feedback on scoring pace, helps teams make strategic decisions, and allows fans and analysts to assess batting performance in real-time.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about team run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is team run rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                Team run rate (also called current run rate) is the average runs per over a team is scoring. It's calculated by dividing total runs scored by overs completed. For example, 150 runs in 20 overs = 7.5 run rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you calculate team run rate?</h4>
                            <p className="text-muted-foreground">
                                Team Run Rate = Runs Scored / Overs Completed. For example, if a team has scored 85 runs in 12 overs, their run rate is 85/12 = 7.08 runs per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good team run rate?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, 8.0+ is excellent. In ODI cricket, 6.0+ is excellent. However, it depends on pitch conditions, opposition bowling quality, and match situation. Modern T20 teams often achieve run rates above 10.0.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between team run rate and required run rate?</h4>
                            <p className="text-muted-foreground">
                                Team run rate is the current scoring pace, while required run rate is the pace needed to win. If team run rate is higher than required run rate, the batting team is ahead of the chase.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does team run rate include extras?</h4>
                            <p className="text-muted-foreground">
                                Yes. Team run rate includes all runs scored by the team, including runs scored by batsmen and all extras (wides, no-balls, byes, leg-byes).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest team run rate ever achieved?</h4>
                            <p className="text-muted-foreground">
                                In T20 internationals, teams have achieved run rates above 15.0 in short bursts. In full T20 innings, run rates of 12.0+ have been achieved. In ODIs, run rates above 10.0 in death overs are common.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does team run rate change during an innings?</h4>
                            <p className="text-muted-foreground">
                                Team run rate fluctuates based on scoring pace. It typically starts moderate, dips during consolidation phases, and increases during powerplays and death overs when batsmen attack.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is team run rate the same as net run rate?</h4>
                            <p className="text-muted-foreground">
                                No. Team run rate is the current scoring pace in one innings. Net run rate is a tournament metric calculated across multiple matches by comparing runs scored per over vs runs conceded per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">When is team run rate most important?</h4>
                            <p className="text-muted-foreground">
                                Team run rate is crucial in all limited-overs cricket (T20, ODI). It's especially important when chasing (compared to required run rate) or when batting first to assess if the scoring pace will lead to a competitive total.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you increase team run rate?</h4>
                            <p className="text-muted-foreground">
                                Score runs faster than the current rate by finding boundaries, rotating strike, minimizing dot balls, targeting weaker bowlers, and increasing aggression. Powerplay overs and death overs are key phases for acceleration.
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
                                    <span className="text-sm text-muted-foreground">Monitor scoring pace and compare with targets or required rates.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Assess batting performance and plan strategic interventions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Commentators</strong>
                                    <span className="text-sm text-muted-foreground">Provide real-time scoring analysis and match context.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">Better understand match dynamics and scoring expectations.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 1 - Strong T20 Performance:</strong> A team scores 180 runs in 20 overs. Run Rate = 180/20 = 9.0. This is an excellent T20 run rate indicating aggressive batting and likely a winning total.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 2 - ODI Middle Overs:</strong> A team has 145 runs after 25 overs. Run Rate = 145/25 = 5.8. This is a good ODI run rate at the halfway mark, with scope for acceleration in death overs.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 3 - Chase Monitoring:</strong> Chasing 160, a team has 95 runs after 12 overs (run rate 7.92). They need 65 from 48 balls (required rate 8.125). They're slightly behind and need to accelerate.
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
                                The Team Run Rate Calculator measures a cricket team's current scoring pace by calculating runs scored per over.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It is essential for monitoring batting performance, comparing with required rates in chases, and assessing whether a team is on track for a competitive total.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
