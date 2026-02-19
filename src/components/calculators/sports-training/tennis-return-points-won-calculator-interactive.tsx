'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Undo2, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    returnPointsPlayed: z.number().min(0, "Total return points must be non-negative"),
    returnPointsWon: z.number().min(0, "Return points won must be non-negative"),
}).refine((data) => data.returnPointsWon <= data.returnPointsPlayed, {
    message: "Return points won cannot exceed total return points played",
    path: ["returnPointsWon"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisReturnPointsWonCalculatorInteractive() {
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
            returnPointsPlayed: undefined,
            returnPointsWon: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.returnPointsPlayed === undefined || v.returnPointsWon === undefined) return null;
        if (v.returnPointsPlayed === 0) return 0;
        return (v.returnPointsWon / v.returnPointsPlayed) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 42) return 'Elite return game. You are likely breaking serve multiple times per set.';
        if (pct >= 38) return 'Strong return performance. You put consistant pressure on the server.';
        if (pct >= 34) return 'Solid baseline. You are competitive in return games but need more break opportunities.';
        if (pct >= 28) return 'Average. You struggle to make an impact on the opponent\'s serve.';
        return 'Defensive struggle. You are winning very few points on return, making breaks nearly impossible.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 42) return 'World Class';
        if (pct >= 38) return 'Elite';
        if (pct >= 34) return 'Competitive';
        if (pct >= 28) return 'Developing';
        return 'Needs Work';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 42) return 'Focus on maintaining aggressive court position to bully the server.';
        if (pct >= 38) return 'Great work. Try to attack the second serve even more to push for breaks.';
        if (pct >= 34) return 'Improve consistency on first serve returns. Just getting it back is often enough.';
        if (pct >= 28) return 'Adjust your standing position. Try moving back to buy more time.';
        return 'Focus on blocking the return back deep down the middle. Eliminate return errors.';
    };

    const getRating = (pct: number) => {
        if (pct >= 42) return 'Outstanding';
        if (pct >= 38) return 'Excellent';
        if (pct >= 34) return 'Good';
        if (pct >= 28) return 'Fair';
        return 'Poor';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 40) {
            insights.push('You are a nightmare for servers to face');
            insights.push('Breaking serve is your primary weapon');
            insights.push('High psychological pressure on opponents');
        } else if (pct >= 35) {
            insights.push('Good neutralizer of the serve advantage');
            insights.push('Capable of grinding out breaks');
            insights.push('Solid defensive skills');
        } else if (pct >= 30) {
            insights.push('Reliant on opponent double faults for free points');
            insights.push('Often losing return games 40-15 or 40-0');
            insights.push('Struggling to neutralize pace');
        } else {
            insights.push('Server is dictating every point');
            insights.push('Likely making too many unforced errors on return');
            insights.push('Need to shorten backswing against pace');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Playing on fast surfaces (grass) naturally lowers this %');
        considerations.push('First serve vs. Second serve return points vary wildly');
        considerations.push('Opponent serve quality is the biggest variable');
        considerations.push('Defensive "block" returns often win more points than aggressive drives');
        considerations.push('Fatigue affects reaction time heavily in late sets');
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
                        <Undo2 className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter data from your return games to calculate efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="returnPointsPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Return Points Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 80"
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
                                    name="returnPointsWon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Undo2 className="h-4 w-4" />
                                                Return Points Won
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 30"
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
                                Calculate Win %
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
                                <Undo2 className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Return Points Won</h2>
                                    <p className="text-muted-foreground">Return Game Efficiency</p>
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
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Competitive' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Win Rate</p>
                                    <p className="text-lg font-bold">{result.percentage.toFixed(1)}%</p>
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

                    {/* Smart Insights & Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Performance Analysis
                                </CardTitle>
                                <CardDescription>Key takeaways from your return strategy</CardDescription>
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
                                    Critical Factors
                                </CardTitle>
                                <CardDescription>Variables affecting this metric</CardDescription>
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
