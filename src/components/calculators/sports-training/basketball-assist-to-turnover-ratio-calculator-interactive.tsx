'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Share2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    assists: z.number().min(0, "Assists cannot be negative"),
    turnovers: z.number().min(0, "Turnovers cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballAssistToTurnoverRatioCalculatorInteractive() {
    const [result, setResult] = useState<{
        ratio: number;
        isPerfect: boolean;
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
            assists: undefined,
            turnovers: undefined,
        },
    });

    const calculateRatio = (v: FormValues) => {
        if (v.turnovers === 0) {
            return { value: v.assists, isPerfect: true }; // Treat as infinite/perfect, but return assists as the "ratio" for display logic or handle separately
        }
        return { value: v.assists / v.turnovers, isPerfect: false };
    };

    const interpret = (ratio: number, isPerfect: boolean) => {
        if (isPerfect) return 'Flawless ball security. Outstanding control.';
        if (ratio >= 4.0) return 'Elite playmaker status. Rare historical efficiency.';
        if (ratio >= 3.0) return 'Excellent ratio. Top-tier point guard standard.';
        if (ratio >= 2.5) return 'Very good. Reliable floor general.';
        if (ratio >= 2.0) return 'Solid / Above Average. Standard for starting guards.';
        if (ratio >= 1.5) return 'Average. Acceptable for non-point guards.';
        if (ratio >= 1.0) return 'Below Average. Risky with the ball.';
        return 'Poor. Turning the ball over more than creating.';
    };

    const getPerformanceLevel = (ratio: number, isPerfect: boolean) => {
        if (isPerfect || ratio >= 4.0) return 'God Tier';
        if (ratio >= 3.0) return 'Elite';
        if (ratio >= 2.0) return 'Good';
        if (ratio >= 1.5) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (ratio: number, isPerfect: boolean) => {
        if (isPerfect && ratio > 5) return 'Incredible. Maintain this aggression while protecting the ball.';
        if (ratio >= 3.0) return 'You are mastering the position. Look to increase risk/reward slightly to create even more.';
        if (ratio >= 2.0) return 'Good balance. Focus on reading passing lanes to clear the 3:1 milestone.';
        if (ratio >= 1.0) return 'Prioritize safe passes. Avoid forcing plays in traffic.';
        return 'Critical Focus: Ball security drills. Simplify your game; make the easy pass first.';
    };

    const getRating = (ratio: number, isPerfect: boolean) => {
        if (isPerfect && ratio > 0) return 'A+';
        if (ratio >= 4.0) return 'A+';
        if (ratio >= 3.0) return 'A';
        if (ratio >= 2.0) return 'B';
        if (ratio >= 1.0) return 'C';
        return 'F';
    };

    const getInsights = (ratio: number, isPerfect: boolean, v: FormValues) => {
        const insights = [];

        if (isPerfect) {
            insights.push('Zero turnovers recorded (Undefined Ratio)');
            insights.push('Perfect ball security session');
        } else {
            if (ratio >= 3.0) insights.push('Ratio exceeds the "Gold Standard" of 3:1');
            if (ratio < 1.0) insights.push('More turnovers than assists (Negative contribution)');
        }

        if (v.assists > 10) insights.push('High volume playmaking detected');
        if (v.turnovers > 5) insights.push('High turnover count - requires immediate attention');

        return insights;
    };

    const getConsiderations = (ratio: number) => {
        const considerations = [];
        considerations.push('Does not measure "Hockey Assists" (pass before the assist)');
        considerations.push('Risk-takers (e.g. LeBron/Harden) often have lower ratios due to usage difficulty');
        considerations.push('Turnovers include offensive fouls and bad catches, not just bad passes');
        considerations.push('A ratio of 5:1 with only 1 assist is less impressive than 3:1 with 10 assists');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const { value: ratio, isPerfect } = calculateRatio(values);
        setResult({
            ratio: ratio,
            isPerfect: isPerfect,
            interpretation: interpret(ratio, isPerfect),
            performanceLevel: getPerformanceLevel(ratio, isPerfect),
            recommendation: getRecommendation(ratio, isPerfect),
            rating: getRating(ratio, isPerfect),
            insights: getInsights(ratio, isPerfect, values),
            considerations: getConsiderations(ratio)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Ball Handling Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your assist and turnover numbers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="assists"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Share2 className="h-4 w-4" />
                                                Total Assists (AST)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="turnovers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Total Turnovers (TO)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 2" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Calculate Ratio
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
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Assist-to-Turnover Ratio</h2>
                                    <p className="text-muted-foreground">Playmaking Efficiency</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">
                                    {result.isPerfect ? "∞" : result.ratio.toFixed(2)}
                                </p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Tier</p>
                                    <Badge variant={result.performanceLevel === 'God Tier' || result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : result.performanceLevel === 'Average' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Grade</p>
                                    <Badge variant={result.rating === 'A+' || result.rating === 'A' ? 'default' : result.rating === 'B' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Net Differential</p>
                                    <p className="text-lg font-bold">
                                        {(form.getValues().assists || 0) - (form.getValues().turnovers || 0)}
                                    </p>
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

                    {/* Insights & Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Performance Insights
                                </CardTitle>
                                <CardDescription>Analysis of your distribution</CardDescription>
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
                                    Context & Limits
                                </CardTitle>
                                <CardDescription>Factors to consider</CardDescription>
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
