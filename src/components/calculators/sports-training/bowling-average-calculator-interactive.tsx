'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsConceded: z.number().min(0),
    wicketsTaken: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function BowlingAverageCalculatorInteractive() {
    const [result, setResult] = useState<{
        average: number;
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
            runsConceded: undefined,
            wicketsTaken: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsConceded == null || v.wicketsTaken == null) return null;
        if (v.wicketsTaken === 0) return Infinity; // No wickets scenario
        return v.runsConceded / v.wicketsTaken;
    };

    const interpret = (avg: number) => {
        if (avg === Infinity) return 'No wickets taken - unable to calculate average.';
        if (avg <= 20) return 'World-class bowling performance with exceptional wicket-taking ability.';
        if (avg <= 25) return 'Elite bowling average indicating top-tier performance.';
        if (avg <= 30) return 'Strong bowling performance with good consistency.';
        if (avg <= 35) return 'Moderate bowling average - acceptable performance.';
        return 'Below-average bowling performance - requires improvement.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg === Infinity) return 'No Wickets';
        if (avg <= 20) return 'World Class';
        if (avg <= 25) return 'Elite';
        if (avg <= 30) return 'Good';
        if (avg <= 35) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (avg: number) => {
        if (avg === Infinity) return 'Focus on taking wickets. Work on variations and attacking lines.';
        if (avg <= 20) return 'Maintain current form and continue attacking the stumps.';
        if (avg <= 25) return 'Excellent performance. Focus on consistency in pressure situations.';
        if (avg <= 30) return 'Work on variations and wicket-taking deliveries.';
        if (avg <= 35) return 'Improve line, length, and develop more attacking options.';
        return 'Fundamental technical work needed. Focus on basics and match awareness.';
    };

    const getRating = (avg: number) => {
        if (avg === Infinity) return 'Needs Wickets';
        if (avg <= 20) return 'Outstanding';
        if (avg <= 25) return 'Excellent';
        if (avg <= 30) return 'Good';
        if (avg <= 35) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (avg: number) => {
        const insights = [];
        if (avg === Infinity) {
            insights.push('No wickets taken in the period');
            insights.push('Focus on attacking bowling');
            insights.push('Work with coach on wicket-taking strategies');
        } else if (avg <= 20) {
            insights.push('Exceptional wicket-taking ability');
            insights.push('High consistency and effectiveness');
            insights.push('Match-winning bowling capability');
        } else if (avg <= 25) {
            insights.push('Strong technical foundation');
            insights.push('Reliable strike bowler');
            insights.push('Good control under pressure');
        } else if (avg <= 30) {
            insights.push('Solid bowling foundation');
            insights.push('Capable of regular breakthroughs');
            insights.push('Potential for higher performance');
        } else if (avg <= 35) {
            insights.push('Developing bowling skills');
            insights.push('Inconsistent wicket-taking');
            insights.push('Requires tactical refinement');
        } else {
            insights.push('Significant improvement needed');
            insights.push('Focus on basic technique');
            insights.push('Build confidence through practice');
        }
        return insights;
    };

    const getConsiderations = (avg: number) => {
        const considerations = [];
        considerations.push('Format of cricket affects average (Test vs ODI vs T20)');
        considerations.push('Quality of opposition batting impacts statistics');
        considerations.push('Pitch and weather conditions vary significantly');
        considerations.push('Role as strike bowler vs stock bowler matters');
        considerations.push('Tail-end wickets can artificially lower average');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const avg = calculate(values);
        if (avg !== null) {
            setResult({
                average: avg,
                interpretation: interpret(avg),
                performanceLevel: getPerformanceLevel(avg),
                recommendation: getRecommendation(avg),
                rating: getRating(avg),
                insights: getInsights(avg),
                considerations: getConsiderations(avg)
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
                        <h2 className="text-xl font-semibold">Bowling Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter runs conceded and wickets taken to calculate bowling average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="runsConceded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Total Runs Conceded
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 850"
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
                                    name="wicketsTaken"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Total Wickets Taken
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 35"
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
                                Calculate Bowling Average
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && result.average !== Infinity && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Main Result Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Activity className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Bowling Average</h2>
                                    <p className="text-muted-foreground">Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.average.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
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
                                    <p className="font-semibold">Runs Per Wicket</p>
                                    <p className="text-lg font-bold">{result.average.toFixed(1)}</p>
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

            {result && result.average === Infinity && (
                <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-900/5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <AlertCircle className="h-6 w-6" />
                            No Wickets Taken
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Bowling average cannot be calculated when no wickets have been taken. Focus on developing wicket-taking deliveries and attacking bowling strategies.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
