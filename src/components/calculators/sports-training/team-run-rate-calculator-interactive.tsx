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
    runsScored: z.number().min(0, 'Runs scored must be positive'),
    oversBowled: z.number().min(0.1, 'Overs bowled must be greater than 0'),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeamRunRateCalculatorInteractive() {
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
        const totalBalls = Math.floor(v.oversBowled) * 6 + (v.oversBowled % 1 * 10); // Approximation for simplicity in display context, though logical calc is overs * 6. Let's stick to standard RR calc.

        // Correct logic for total balls if needed, but RR is just runs/overs.
        // Let's refine balls calculation if exact balls are needed for runsPerBall.
        // Standard cricket notation 10.3 means 10 overs 3 balls.
        const wholeOvers = Math.floor(v.oversBowled);
        const ballsPart = Math.round((v.oversBowled - wholeOvers) * 10);
        const actualBalls = wholeOvers * 6 + ballsPart;

        const runsPerBall = v.runsScored / actualBalls;

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
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
        </div>
    );
}
