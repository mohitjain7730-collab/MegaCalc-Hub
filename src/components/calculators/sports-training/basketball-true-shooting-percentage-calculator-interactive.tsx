'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    points: z.number().min(0, "Points cannot be negative"),
    fieldGoalsAttempted: z.number().min(1, "FGA must be at least 1"),
    freeThrowsAttempted: z.number().min(0, "FTA cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballTrueShootingPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        tsPercent: number;
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
            points: undefined,
            fieldGoalsAttempted: undefined,
            freeThrowsAttempted: undefined,
        },
    });

    const calculateTS = (v: FormValues) => {
        // Formula: TS% = PTS / (2 * (FGA + 0.44 * FTA))
        const denominator = 2 * (v.fieldGoalsAttempted + (0.44 * v.freeThrowsAttempted));
        if (denominator === 0) return 0;
        return (v.points / denominator) * 100;
    };

    const interpret = (ts: number) => {
        if (ts >= 65) return 'Historical elite efficiency. Unstoppable scoring.';
        if (ts >= 60) return 'Elite efficiency. All-Star / Superstar level.';
        if (ts >= 57) return 'Great efficiency. Significantly above league average.';
        if (ts >= 54) return 'Good efficiency. Above league average.';
        if (ts >= 50) return 'Average efficiency. Acceptable for high volume.';
        if (ts >= 45) return 'Below average efficiency.';
        return 'Poor efficiency. Hurting the offense.';
    };

    const getPerformanceLevel = (ts: number) => {
        if (ts >= 60) return 'Elite';
        if (ts >= 55) return 'Great';
        if (ts >= 50) return 'Average';
        if (ts >= 45) return 'Below Avg';
        return 'Poor';
    };

    const getRecommendation = (ts: number) => {
        if (ts >= 60) return 'Maintain this efficiency. Look for more shot opportunities.';
        if (ts >= 55) return 'Excellent work. Keep mixing 3s and FTs into your game.';
        if (ts >= 50) return 'Solid. Focus on shot selection to push this higher.';
        if (ts >= 45) return 'Reduce difficult shots. Focus on getting to the rim or open catch-and-shoot looks.';
        return 'Refine shot mechanics and selection. Priority: Get to the free throw line more.';
    };

    const getRating = (ts: number) => {
        if (ts >= 60) return 'A+';
        if (ts >= 55) return 'A';
        if (ts >= 50) return 'B';
        if (ts >= 45) return 'C';
        return 'D';
    };

    const getInsights = (ts: number, v: FormValues) => {
        const insights = [];

        if (ts >= 60) insights.push('Scoring at an elite rate per possession');

        // Check "Free Throw Rate" heuristic
        const ftRate = v.freeThrowsAttempted / v.fieldGoalsAttempted;
        if (ftRate > 0.4) insights.push('High Free Throw Rate boosting efficiency');
        else if (ftRate < 0.15 && ts < 50) insights.push('Low Free Throw Rate hurting efficiency');

        // Check if Points > 2x FGA (very crude eFG check substitute)
        if (v.points > 2 * v.fieldGoalsAttempted) insights.push('Scoring more than 1 point per attempt (Excellent)');

        return insights;
    };

    const getConsiderations = (ts: number) => {
        const considerations = [];
        considerations.push('Uses 0.44 constant for FTA (approximation for And-1s/Techs)');
        considerations.push('Does not account for turnovers (just shooting)');
        considerations.push('High volume with average TS% is still valuable');
        considerations.push('Context matters (late shot clock heaves vs open looks)');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const ts = calculateTS(values);
        setResult({
            tsPercent: ts,
            interpretation: interpret(ts),
            performanceLevel: getPerformanceLevel(ts),
            recommendation: getRecommendation(ts),
            rating: getRating(ts),
            insights: getInsights(ts, values),
            considerations: getConsiderations(ts)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Shootings Stats Input</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter values from a single game or season totals
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="points"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Total Points (PTS)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 25" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fieldGoalsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Goals Attempted (FGA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 18" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="freeThrowsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Free Throws Attempted (FTA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 6" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <FlaskConical className="mr-2 h-4 w-4" />
                                Calculate True Shooting %
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
                                    <h2 className="text-2xl font-bold">True Shooting Percentage</h2>
                                    <p className="text-muted-foreground">Scoring Efficiency Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.tsPercent.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Great' ? 'secondary' : result.performanceLevel === 'Average' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Logic Grade</p>
                                    <Badge variant={result.rating === 'A+' || result.rating === 'A' ? 'default' : result.rating === 'B' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Points Per Shot</p>
                                    <p className="text-lg font-bold">
                                        {(result.tsPercent * 2 / 100).toFixed(2)}
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
                                <CardDescription>Why is your TS% this value?</CardDescription>
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
                                    Constraints
                                </CardTitle>
                                <CardDescription>Limitations of TS%</CardDescription>
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
