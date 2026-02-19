'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    firstServesMade: z.number().min(0, "First serves made must be non-negative"),
    firstServeAttempts: z.number().min(1, "First serve attempts must be at least 1"),
}).refine((data) => data.firstServesMade <= data.firstServeAttempts, {
    message: "First serves made cannot exceed attempts",
    path: ["firstServesMade"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisFirstServePercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
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
            firstServesMade: undefined,
            firstServeAttempts: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.firstServesMade == null || v.firstServeAttempts == null) return null;
        return (v.firstServesMade / v.firstServeAttempts) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 75) return 'Exceptionally high percentage. Ensure you are not just rolling the ball in.';
        if (pct >= 65) return 'Excellent consistency. Ideal balance for most players.';
        if (pct >= 55) return 'Solid consistency. Typical of many club and recreational players.';
        if (pct >= 45) return 'Below average consistency. Puts pressure on your second serve.';
        return 'Low percentage. High risk of double faults and short points against you.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 70) return 'Elite';
        if (pct >= 60) return 'Advanced';
        if (pct >= 50) return 'Intermediate';
        if (pct >= 40) return 'Beginner';
        return 'Novice';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 75) return 'Consider adding more power or placement variety. You might be playing too safe.';
        if (pct >= 65) return 'Maintain this rhythm. Focus on placement to convert this consistency into aces/service winners.';
        if (pct >= 55) return 'Work on a consistent toss. This is the foundation of a reliable first serve.';
        if (pct >= 45) return 'Simplify your motion. Reduce the number of moving parts to improve reliability.';
        return 'Go back to basics. Practice the toss and contact point without worrying about power.';
    };

    const getRating = (pct: number) => {
        if (pct >= 65 && pct <= 75) return 'Outstanding'; // Sweet spot
        if (pct > 75) return 'Very High'; // Can be too safe
        if (pct >= 55) return 'Good';
        if (pct >= 45) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct > 75) {
            insights.push('Very high reliability');
            insights.push('Risk of reduced serve potency (too safe)');
            insights.push('Excellent for pressure situations');
        } else if (pct >= 65) {
            insights.push('Optimal balance of risk and consistency');
            insights.push('Controls the point from the start');
            insights.push('Reduces pressure on second serve');
        } else if (pct >= 55) {
            insights.push('Average consistency');
            insights.push('Occasional free points');
            insights.push('Manageable second serve pressure');
        } else if (pct >= 45) {
            insights.push('Unreliable first weapon');
            insights.push('Heavy reliance on second serve');
            insights.push('Often starts point defensively');
        } else {
            insights.push('Critical weakness in game');
            insights.push('High double fault probability');
            insights.push('Easy for opponent to attack');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('High % means nothing if the serve is too slow/easy');
        considerations.push('Wind and sun can drastically affect toss consistency');
        considerations.push('Pressure moments (break points) often lower percentage');
        considerations.push('Surface speed impacts the value of a high percentage');
        considerations.push('Fatigue in late sets can degrade technique');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const pct = calculate(values);
        if (pct !== null) {
            setResult({
                percentage: pct,
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
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Serve Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your serve data to calculate first serve percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstServesMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                First Serves Made
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
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
                                    name="firstServeAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Total First Serve Attempts
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 70"
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
                                Calculate Percentage
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
                                    <h2 className="text-2xl font-bold">First Serve Percentage</h2>
                                    <p className="text-muted-foreground">Serve Efficiency Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.percentage.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Consistency Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Advanced' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Effectiveness</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Made / Attempts</p>
                                    <p className="text-lg font-bold">{form.getValues().firstServesMade} / {form.getValues().firstServeAttempts}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Tip:</strong> {result.recommendation}
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
                                    Game Insights
                                </CardTitle>
                                <CardDescription>Impact on your game</CardDescription>
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
                                    Risk Factors
                                </CardTitle>
                                <CardDescription>Things to watch out for</CardDescription>
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
