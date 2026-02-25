'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    totalErrors: z.number().min(0, "Total errors must be non-negative"),
    totalAttempts: z.number().min(1, "Total attempts must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballErrorRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        errorRate: number;
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
            totalErrors: undefined,
            totalAttempts: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.totalErrors == null || v.totalAttempts == null) return null;
        if (v.totalAttempts === 0) return 0;
        return (v.totalErrors / v.totalAttempts) * 100;
    };

    const interpret = (rate: number) => {
        if (rate <= 5) return 'Elite level of precision with exceptional ball control.';
        if (rate <= 10) return 'Highly efficient performance with minimal unforced errors.';
        if (rate <= 15) return 'Solid consistency, but marginal room for tightening play.';
        if (rate <= 20) return 'Average error rate; indicates need for technical refinement.';
        return 'High error rate; significant impact on team momentum and points.';
    };

    const getPerformanceLevel = (rate: number) => {
        if (rate <= 5) return 'World Class';
        if (rate <= 10) return 'Elite';
        if (rate <= 15) return 'Good';
        if (rate <= 20) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (rate: number) => {
        if (rate <= 5) return 'Maintain exceptional focus and continue executing high-level tactical plays safely.';
        if (rate <= 10) return 'Excellent consistency. Focus on recognizing high-risk situations to avoid marginal errors.';
        if (rate <= 15) return 'Work on shot selection and defensive positioning to reduce unnecessary mistakes.';
        if (rate <= 20) return 'Focus heavily on fundamentals and reducing unforced errors in pressure moments.';
        return 'Immediate technical review needed. Prioritize keeping the ball in play over aggressive tactics.';
    };

    const getRating = (rate: number) => {
        if (rate <= 5) return 'Outstanding';
        if (rate <= 10) return 'Excellent';
        if (rate <= 15) return 'Good';
        if (rate <= 20) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate <= 10) {
            insights.push('Exceptional strategic execution');
            insights.push('High reliability in crucial match moments');
            insights.push('Strong technical foundation and decision-making');
        } else if (rate <= 15) {
            insights.push('Reliable overall performance');
            insights.push('Capable of sustaining long rallies');
            insights.push('Minor lapses in concentration or technique');
        } else {
            insights.push('Frequent loss of point control');
            insights.push('Inconsistent execution patterns');
            insights.push('Requires fundamental technical refinement');
        }
        return insights;
    };

    const getConsiderations = (rate: number) => {
        const considerations = [];
        considerations.push('High-risk offensive systems naturally produce slightly higher error rates');
        considerations.push('Fatigue in late sets significantly impacts decision-making');
        considerations.push('Quality of opposition block/defense forces more marginal errors');
        considerations.push('Different skills (serve vs attack) have different acceptable error thresholds');
        considerations.push('Context of errors (e.g., end of set vs beginning) matters immensely');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        if (rate !== null) {
            setResult({
                errorRate: rate,
                interpretation: interpret(rate),
                performanceLevel: getPerformanceLevel(rate),
                recommendation: getRecommendation(rate),
                rating: getRating(rate),
                insights: getInsights(rate),
                considerations: getConsiderations(rate)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Error Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter total errors committed and total attempts to calculate your error rate percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalErrors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Total Errors
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 12"
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
                                    name="totalAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Total Attempts
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 150"
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
                                Calculate Error Rate
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Error Rate</h2>
                                    <p className="text-muted-foreground">Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.errorRate.toFixed(2)}%</p>
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
                                    <p className="font-semibold">Errors Per 100</p>
                                    <p className="text-lg font-bold">{result.errorRate.toFixed(1)}</p>
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
