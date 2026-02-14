'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsScored: z.number().min(0),
    ballsFaced: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function StrikeRateCalculatorInteractive() {
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
                        <h2 className="text-xl font-semibold">Batting Statistics</h2>
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
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Main Result Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Strike Rate</h2>
                                    <p className="text-muted-foreground">Scoring Speed Analysis</p>
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
        </div>
    );
}
