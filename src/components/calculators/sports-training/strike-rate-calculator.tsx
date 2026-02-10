'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Zap, Activity, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
    runsScored: z.number().min(0),
    ballsFaced: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function StrikeRateCalculator() {
    const [result, setResult] = useState<{
        strikeRate: number;
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
            ballsFaced: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsScored == null || v.ballsFaced == null) return null;
        if (v.ballsFaced === 0) return 0;
        return (v.runsScored / v.ballsFaced) * 100;
    };

    const interpret = (sr: number) => {
        if (sr >= 150) return 'Explosive batting with exceptional scoring speed and aggression.';
        if (sr >= 130) return 'Highly aggressive batting with excellent run-scoring rate.';
        if (sr >= 100) return 'Strong strike rate indicating good balance between attack and defense.';
        if (sr >= 80) return 'Moderate strike rate - suitable for Test cricket or building innings.';
        if (sr >= 60) return 'Conservative approach - may need to accelerate in limited-overs formats.';
        return 'Very slow scoring rate - significant improvement needed for modern cricket.';
    };

    const getPerformanceLevel = (sr: number) => {
        if (sr >= 150) return 'Explosive';
        if (sr >= 130) return 'Highly Aggressive';
        if (sr >= 100) return 'Aggressive';
        if (sr >= 80) return 'Balanced';
        if (sr >= 60) return 'Conservative';
        return 'Very Slow';
    };

    const getRecommendation = (sr: number) => {
        if (sr >= 150) return 'Maintain aggressive intent while managing risk in crucial situations.';
        if (sr >= 130) return 'Excellent scoring rate. Balance aggression with match awareness.';
        if (sr >= 100) return 'Good strike rate. Look for opportunities to accelerate further.';
        if (sr >= 80) return 'Work on rotating strike and finding boundaries more frequently.';
        if (sr >= 60) return 'Increase scoring rate through better shot selection and risk assessment.';
        return 'Fundamental work needed on scoring shots and match tempo awareness.';
    };

    const getRating = (sr: number) => {
        if (sr >= 150) return 'Outstanding';
        if (sr >= 130) return 'Excellent';
        if (sr >= 100) return 'Good';
        if (sr >= 80) return 'Fair';
        if (sr >= 60) return 'Below Average';
        return 'Poor';
    };

    const getInsights = (sr: number) => {
        const insights = [];
        if (sr >= 150) {
            insights.push('Exceptional boundary-hitting ability');
            insights.push('High-impact player in limited-overs cricket');
            insights.push('Game-changing scoring speed');
        } else if (sr >= 130) {
            insights.push('Strong aggressive intent');
            insights.push('Effective in powerplay and death overs');
            insights.push('Valuable T20 and ODI asset');
        } else if (sr >= 100) {
            insights.push('Balanced run-scoring approach');
            insights.push('Good rotation of strike');
            insights.push('Adaptable to different formats');
        } else if (sr >= 80) {
            insights.push('Solid foundation building');
            insights.push('Suitable for Test cricket');
            insights.push('Needs acceleration in limited-overs');
        } else if (sr >= 60) {
            insights.push('Conservative batting style');
            insights.push('Struggles with scoring pressure');
            insights.push('Limited boundary options');
        } else {
            insights.push('Significant scoring difficulties');
            insights.push('Lacks attacking shots');
            insights.push('Puts pressure on batting partners');
        }
        return insights;
    };

    const getConsiderations = (sr: number) => {
        const considerations = [];
        considerations.push('Format of cricket significantly affects ideal strike rate');
        considerations.push('Match situation dictates required scoring speed');
        considerations.push('Pitch conditions impact scoring opportunities');
        considerations.push('Quality of bowling attack affects strike rate');
        considerations.push('Batting position influences expected strike rate');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const sr = calculate(values);
        if (sr !== null) {
            setResult({
                strikeRate: sr,
                interpretation: interpret(sr),
                performanceLevel: getPerformanceLevel(sr),
                recommendation: getRecommendation(sr),
                rating: getRating(sr),
                insights: getInsights(sr),
                considerations: getConsiderations(sr)
            });
        }
    };

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Batting Statistics
                    </CardTitle>
                    <CardDescription>
                        Enter runs scored and balls faced to calculate strike rate
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
                                                    placeholder="e.g., 85"
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
                                    name="ballsFaced"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Balls Faced
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 65"
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
                                Calculate Strike Rate
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
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Strike Rate</CardTitle>
                                    <CardDescription>Scoring Speed Analysis</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.strikeRate.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Explosive' ? 'default' : result.performanceLevel === 'Highly Aggressive' ? 'secondary' : result.performanceLevel === 'Aggressive' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Runs Per 100 Balls</p>
                                    <p className="text-lg font-bold">{result.strikeRate.toFixed(1)}</p>
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
                                <CardDescription>Key strengths and indicators</CardDescription>
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
                                <CardDescription>Factors affecting accuracy</CardDescription>
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
                        Key components required for strike rate calculation
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
                                The total number of runs scored by the batsman in the innings or period being analyzed.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs from boundaries, singles, twos, and threes</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Does not include extras like byes or leg-byes</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Balls Faced
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of deliveries faced by the batsman during the innings or period.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Counts all legal deliveries faced</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Does not include wides or no-balls</span>
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
                            Strike Rate = (Runs Scored / Balls Faced) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures a batsman's scoring speed by calculating the number of runs scored per 100 balls faced. A higher strike rate indicates faster scoring and more aggressive batting.
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
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Bowling performance</p>
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
                                            <p className="text-sm text-muted-foreground">Runs per over</p>
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
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
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
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Cricket Strike Rate: Calculation, Interpretation, and Performance Analysis" />
                <meta itemProp="description" content="An expert guide to understanding strike rate in cricket, including calculation methods, format-specific benchmarks, and how it complements batting average for comprehensive performance analysis." />
                <meta itemProp="keywords" content="strike rate cricket, cricket scoring speed, batting strike rate, T20 strike rate, ODI strike rate, Test cricket strike rate, cricket performance metrics" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-09" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Strike Rate: Measuring Scoring Speed and Impact</h1>
                <p className="text-lg italic text-muted-foreground">Master the essential metric that defines a batsman's scoring speed, aggression, and value in modern cricket, especially in limited-overs formats.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Strike Rate in Cricket?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Strike Rate</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting Strike Rate: What's Good?</a></li>
                    <li><a href="#formats" className="hover:underline">Format-Specific Benchmarks (Test, ODI, T20)</a></li>
                    <li><a href="#comparison" className="hover:underline">Strike Rate vs Batting Average</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve Strike Rate</a></li>
                </ul>
                <hr />

                {/* WHAT IS STRIKE RATE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Strike Rate in Cricket?</h2>
                <p>The <strong>Strike Rate</strong> is a crucial cricket statistic that measures how quickly a batsman scores runs. It represents the average number of runs scored per 100 balls faced.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Modern Metric of Impact</h3>
                <p>While batting average measures consistency, strike rate measures <em>speed</em>. In modern cricket, especially limited-overs formats, scoring quickly is often as important as scoring consistently. A batsman who scores 50 runs off 30 balls has far more impact than one who scores 50 off 80 balls.</p>

                <p>A higher strike rate indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Faster run accumulation</li>
                    <li>More aggressive batting approach</li>
                    <li>Better boundary-hitting ability</li>
                    <li>Higher impact in limited-overs cricket</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8">How to Calculate Strike Rate</h2>
                <p>Strike rate is calculated using a straightforward formula:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Strike Rate = (Runs Scored / Balls Faced) × 100
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>

                <p><strong>Runs Scored:</strong> The total runs accumulated by the batsman in the period being measured.</p>

                <p className="mt-4"><strong>Balls Faced:</strong> The number of legal deliveries faced. This does NOT include:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Wides (not faced by the batsman)</li>
                    <li>No-balls (though runs scored off them count)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>If a batsman scores 85 runs off 65 balls:</p>

                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-center">
                        Strike Rate = (85 / 65) × 100 = 130.77
                    </p>
                </div>

                <p>This means the batsman scores 130.77 runs per 100 balls faced—an excellent strike rate in limited-overs cricket.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8">Interpreting Strike Rate: What's Considered Good?</h2>

                <p>The interpretation of strike rate varies dramatically by format:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Universal Guidelines</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>150+:</strong> Explosive batting, exceptional in any format</li>
                    <li><strong>130-150:</strong> Highly aggressive, excellent for T20 and ODI</li>
                    <li><strong>100-130:</strong> Aggressive, good balance in limited-overs</li>
                    <li><strong>80-100:</strong> Balanced, suitable for Test cricket</li>
                    <li><strong>60-80:</strong> Conservative, acceptable only in Tests</li>
                    <li><strong>Below 60:</strong> Very slow, problematic in modern cricket</li>
                </ul>

                <hr />

                {/* FORMAT-SPECIFIC BENCHMARKS */}
                <h2 id="formats" className="text-2xl font-bold text-foreground pt-8">Format-Specific Benchmarks: Test, ODI, and T20</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <p>In Test cricket, strike rate is less emphasized than batting average. However, modern Test cricket values faster scoring:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>70+:</strong> Aggressive Test batsman (e.g., Virender Sehwag, David Warner)</li>
                    <li><strong>50-70:</strong> Balanced Test player</li>
                    <li><strong>40-50:</strong> Traditional, accumulative style</li>
                    <li><strong>Below 40:</strong> Very defensive, rare in modern Test cricket</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">One Day International (ODI)</h3>
                <p>ODI cricket requires a balance between consistency and scoring speed:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>100+:</strong> Excellent ODI strike rate</li>
                    <li><strong>85-100:</strong> Good ODI batsman</li>
                    <li><strong>70-85:</strong> Average, acceptable for anchors</li>
                    <li><strong>Below 70:</strong> Too slow for modern ODI cricket</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Twenty20 (T20)</h3>
                <p>T20 cricket demands the highest strike rates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>150+:</strong> Elite T20 batsman</li>
                    <li><strong>130-150:</strong> Excellent T20 player</li>
                    <li><strong>110-130:</strong> Good T20 batsman</li>
                    <li><strong>Below 110:</strong> Below par for T20 cricket</li>
                </ul>

                <p className="mt-4"><em>Important:</em> In T20 cricket, strike rate is often MORE important than batting average.</p>

                <hr />

                {/* COMPARISON */}
                <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8">Strike Rate vs Batting Average: Complementary Metrics</h2>

                <p>Strike rate and batting average work together to provide a complete picture:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Strike Rate</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Measures:</strong> Scoring speed</li>
                    <li><strong>Formula:</strong> (Runs / Balls) × 100</li>
                    <li><strong>Most important in:</strong> T20 cricket</li>
                    <li><strong>Ideal for:</strong> Assessing impact and aggression</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batting Average</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Measures:</strong> Consistency</li>
                    <li><strong>Formula:</strong> Runs / Dismissals</li>
                    <li><strong>Most important in:</strong> Test cricket</li>
                    <li><strong>Ideal for:</strong> Assessing reliability</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Balance</h3>
                <p><strong>Test Cricket:</strong> Average is paramount. Strike rate of 50+ with average 40+ is ideal.</p>
                <p><strong>ODI Cricket:</strong> Both matter. Average 40+ with strike rate 90+ defines elite players.</p>
                <p><strong>T20 Cricket:</strong> Strike rate is king. Strike rate 140+ with average 25+ is more valuable than average 35 with strike rate 110.</p>

                <hr />

                {/* IMPROVEMENT STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8">Strategies to Improve Your Strike Rate</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Boundary Hitting</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Power hitting:</strong> Develop strength for clearing boundaries</li>
                    <li><strong>Timing:</strong> Focus on clean ball striking rather than just power</li>
                    <li><strong>Identify scoring zones:</strong> Know your strongest areas and target them</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Strike Rotation</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Quick singles:</strong> Turn ones into twos, keep scoreboard moving</li>
                    <li><strong>Running between wickets:</strong> Improve fitness and judgment</li>
                    <li><strong>Gap finding:</strong> Place the ball into spaces rather than hitting at fielders</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Shot Selection</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Risk assessment:</strong> Know when to attack and when to defend</li>
                    <li><strong>Match situation:</strong> Adapt strike rate to match requirements</li>
                    <li><strong>Bowler analysis:</strong> Identify weak bowlers to target</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Mental Approach</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Positive intent:</strong> Look to score off every ball</li>
                    <li><strong>Fearless batting:</strong> Accept that getting out while attacking is part of the game</li>
                    <li><strong>Pressure management:</strong> Stay calm when required run rate increases</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
                <p>Strike rate has become one of cricket's most important statistics, especially in the modern era of limited-overs cricket. While batting average measures consistency, strike rate measures impact and scoring speed.</p>

                <p>Understanding strike rate, its calculation, and format-specific benchmarks is essential for players, coaches, and fans. When used alongside batting average, strike rate provides a complete picture of a batsman's value and effectiveness.</p>

                <p>Whether you're a player looking to improve your scoring rate, a coach analyzing performance, or a fan evaluating players, the strike rate calculator and this guide provide the tools and knowledge for comprehensive cricket analysis.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common questions about strike rate in cricket
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good strike rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                It depends on the format. In Test cricket, 50+ is good. In ODI cricket, 85-100 is good. In T20 cricket, 130+ is considered good. The ideal strike rate varies based on batting position, match situation, and team strategy.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is strike rate calculated?</h4>
                            <p className="text-muted-foreground">
                                Strike rate is calculated by dividing runs scored by balls faced, then multiplying by 100. Formula: Strike Rate = (Runs / Balls) × 100. For example, 75 runs off 50 balls = (75/50) × 100 = 150 strike rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is strike rate more important than batting average?</h4>
                            <p className="text-muted-foreground">
                                It depends on the format. In Test cricket, batting average is more important. In ODI cricket, both are equally important. In T20 cricket, strike rate is often more important than average, as scoring quickly is paramount in the shortest format.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between strike rate and run rate?</h4>
                            <p className="text-muted-foreground">
                                Strike rate measures individual batsman performance (runs per 100 balls faced), while run rate measures team scoring speed (runs per over). Strike rate is a batsman statistic, run rate is a team statistic.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest strike rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 internationals, players like Andre Russell and Glenn Maxwell have strike rates above 150. In ODIs, Jos Buttler and AB de Villiers have exceptional strike rates around 120-125. In Tests, Virender Sehwag had a remarkable strike rate of 82.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can strike rate be too high?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. However, an extremely high strike rate with a very low batting average suggests reckless batting. The ideal is a balance—high strike rate with reasonable average. In T20s, a strike rate of 150+ with average 25+ is excellent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I improve my strike rate?</h4>
                            <p className="text-muted-foreground">
                                Focus on boundary hitting, rotate strike with quick singles, improve shot selection, develop power and timing, work on fitness for running between wickets, and adopt a positive, aggressive mindset. Practice specific shots for different bowling types.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does strike rate include extras?</h4>
                            <p className="text-muted-foreground">
                                No. Strike rate only includes runs scored by the batsman off balls they faced. Wides and no-balls are not counted in balls faced. However, runs scored by the batsman off a no-ball do count in their runs total.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's a good strike rate for an opener?</h4>
                            <p className="text-muted-foreground">
                                In Tests, 50-60 is good for openers. In ODIs, 85-100 is expected. In T20s, openers should aim for 130-150+, especially during powerplay overs when field restrictions favor aggressive batting.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does pitch condition affect strike rate?</h4>
                            <p className="text-muted-foreground">
                                Flat, batting-friendly pitches allow higher strike rates. Seaming or spinning pitches make scoring difficult, reducing strike rates. Weather conditions, outfield speed, and boundary sizes also significantly impact achievable strike rates.
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
                        Usage of this Calculator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This Calculator?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Batsmen</strong>
                                    <span className="text-sm text-muted-foreground">Track your scoring speed and identify areas to accelerate your batting.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Analyze player performance and set strike rate targets for different formats.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate batsmen for commentary, articles, or fantasy cricket team selection.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">Better understand player statistics and compare batsmen across formats.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Doesn't Measure Consistency:</strong> A high strike rate with low average indicates reckless batting. Both metrics should be considered together.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Context Matters:</strong> Strike rate expectations vary by format, batting position, match situation, and pitch conditions.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Small Sample Size:</strong> Strike rate from a single innings can be misleading. Evaluate over multiple matches for accuracy.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 1 - T20 Explosive Innings:</strong> A batsman scores 85 runs off 50 balls in a T20 match. Strike Rate = (85 / 50) × 100 = 170. This is an exceptional T20 strike rate, indicating explosive batting that likely won the match for their team.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 2 - ODI Balanced Innings:</strong> A batsman scores 95 runs off 105 balls in an ODI. Strike Rate = (95 / 105) × 100 = 90.48. This is a good ODI strike rate, showing a balance between accumulation and acceleration.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 3 - Test Match Aggression:</strong> A Test batsman scores 120 runs off 150 balls. Strike Rate = (120 / 150) × 100 = 80. This is an aggressive Test cricket strike rate, showing positive intent while building a substantial innings.
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
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground">
                                The Strike Rate Calculator measures a cricket batsman's scoring speed by calculating runs scored per 100 balls faced.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It is especially important in limited-overs cricket (ODI and T20) where scoring quickly is as valuable as scoring consistently.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
