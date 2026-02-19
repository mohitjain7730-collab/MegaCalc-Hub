'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    secondServesPoints: z.number().min(0, "Total service points must be non-negative"),
    doubleFaults: z.number().min(0, "Double faults must be non-negative"),
}).refine((data) => data.doubleFaults <= data.secondServesPoints, {
    message: "Double faults cannot exceed total service points",
    path: ["doubleFaults"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisDoubleFaultPercentageCalculatorInteractive() {
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
            secondServesPoints: undefined,
            doubleFaults: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.secondServesPoints === undefined || v.doubleFaults === undefined) return null;
        if (v.secondServesPoints === 0) return 0;
        return (v.doubleFaults / v.secondServesPoints) * 100; // Formula: (DF / Total Serve Points) * 100
        // Note: Often DF% is calculated against total points served or total second serves. 
        // Standard ATP/WTA stat is usually (Double Faults / Total Service Points).
        // Let's clarify in the input label that we mean Total Service Points playing.
    };

    const interpret = (pct: number) => {
        if (pct <= 2) return 'Exceptional serving discipline with minimal free points given.';
        if (pct <= 4) return 'Elite level consistency, typical of top-tier professionals.';
        if (pct <= 6) return 'Good control, standard for competitive club players.';
        if (pct <= 9) return 'Average consistency, risky but acceptable in aggressive playstyles.';
        return 'High error rate significantly handicapping service games.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct <= 2) return 'World Class';
        if (pct <= 4) return 'Elite';
        if (pct <= 6) return 'Competitive';
        if (pct <= 9) return 'Average';
        return 'Needs Work';
    };

    const getRecommendation = (pct: number) => {
        if (pct <= 2) return 'Maintain this rhythm. Consider adding more pace or spin without increasing risk.';
        if (pct <= 4) return 'Excellent work. Focus on placement variations while keeping this reliability.';
        if (pct <= 6) return 'Solid. Work on second serve kick/slice to reduce pressure.';
        if (pct <= 9) return 'Too many free points. Prioritize second serve placement over power.';
        return 'Urgent: Rebuild the second serve motion. Focus on spin (topspin) for margin of safety.';
    };

    const getRating = (pct: number) => {
        if (pct <= 2) return 'Outstanding';
        if (pct <= 4) return 'Excellent';
        if (pct <= 6) return 'Good';
        if (pct <= 9) return 'Fair';
        return 'Poor';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct <= 3) {
            insights.push('Extremely reliable service motion');
            insights.push('Opponents rarely get "free" points');
            insights.push('Allows you to pressure returners confidently');
        } else if (pct <= 6) {
            insights.push('Balanced risk-to-reward ratio');
            insights.push('Competitive match stability');
            insights.push('Second serve is reliable enough');
        } else if (pct <= 10) {
            insights.push('Service games effectively start at 0-15 or worse often');
            insights.push('Likely pushing too hard on second serves');
            insights.push('Mental pressure increasing on service games');
        } else {
            insights.push('Giving away nearly a game per set in DFs');
            insights.push('Serve technique likely unstable under pressure');
            insights.push('Critically undermining match win probability');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Aggressive servers naturally have slightly higher DF rates');
        considerations.push('Windy conditions drastically affect toss consistency');
        considerations.push('Match pressure (tiebreaks/break points) increases error likelihood');
        considerations.push('Percentages vary between First Serve oriented and Second Serve oriented stats');
        considerations.push('Fatigue in late sets often spikes DF%');
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
                        Enter your service data to calculate Double Fault Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="secondServesPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Total Service Points Played
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
                                <FormField
                                    control={form.control}
                                    name="doubleFaults"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Total Double Faults
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 4"
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
                                Calculate Double Fault %
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
                                <Activity className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Double Fault Percentage</h2>
                                    <p className="text-muted-foreground">Serve Reliability Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.percentage.toFixed(2)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Consistency Tier</p>
                                    <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Competitive' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Risk Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Error Rate</p>
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
                                    Match Impact
                                </CardTitle>
                                <CardDescription>Key takeaways from this statistic</CardDescription>
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
                                <CardDescription>Variables that influence this metric</CardDescription>
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
