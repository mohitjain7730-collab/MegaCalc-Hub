'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Crosshair } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    fieldGoalsMade: z.number().min(0, "Field goals made must be non-negative"),
    fieldGoalsAttempted: z.number().min(1, "Attempts must be at least 1").describe("Field goals attempted"),
}).refine(data => data.fieldGoalsMade <= data.fieldGoalsAttempted, {
    message: "Made shots cannot exceed attempted shots",
    path: ["fieldGoalsMade"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballFieldGoalPercentageCalculatorInteractive() {
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
            fieldGoalsMade: undefined,
            fieldGoalsAttempted: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.fieldGoalsMade == null || v.fieldGoalsAttempted == null) return null;
        if (v.fieldGoalsAttempted === 0) return 0;
        return (v.fieldGoalsMade / v.fieldGoalsAttempted) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 60) return 'Dominant interior scoring or hyper-efficient shooting.';
        if (pct >= 50) return 'Highly efficient scoring. A major asset to the offense.';
        if (pct >= 45) return 'Solid efficiency, typical for good perimeter players.';
        if (pct >= 40) return 'Average efficiency. Acceptable for high-volume shooters.';
        return 'Inefficient scoring. Shot selection likely needs improvement.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 60) return 'Elite';
        if (pct >= 50) return 'Great';
        if (pct >= 45) return 'Good';
        if (pct >= 40) return 'Average';
        return 'Low Efficiency';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 60) return 'Maintain aggression in the paint and take high-percentage looks.';
        if (pct >= 50) return 'Excellent balance of volume and efficiency. Keep attacking mismatches.';
        if (pct >= 45) return 'Good standard. Focus on reducing contested mid-range jumpers.';
        if (pct >= 40) return 'Work on shot selection. Eliminate bad shots early in the shot clock.';
        return 'Re-evaluate shot selection entirely. Prioritize layups and open catch-and-shoot opportunities.';
    };

    const getRating = (pct: number) => {
        if (pct >= 60) return 'Outstanding';
        if (pct >= 50) return 'Excellent';
        if (pct >= 45) return 'Solid';
        if (pct >= 40) return 'Fair';
        return 'Needs Work';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 55) {
            insights.push('High effective field goal percentage (eFG%) potential');
            insights.push('Forces defense to collapse efficiently');
            insights.push('Likely dominating in the paint or transition');
        } else if (pct >= 42) {
            insights.push('Standard scoring efficiency');
            insights.push('Reliable offensive option');
            insights.push('Balanced shot distribution');
        } else {
            insights.push('Possessions are being wasted');
            insights.push('Defense will sag off to protect the paint');
            insights.push('Need to create easier scoring opportunities');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Does not account for 3-point value (use eFG% for that)');
        considerations.push('Volume matters: 1/1 is 100% but not significant');
        considerations.push('Position dependent (Centers typically have higher FG%)');
        considerations.push('Shot difficulty contexts (bail-out shots vs open layups)');
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
                        <Crosshair className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Shooting Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your field goals made and attempted (2PA + 3PA)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fieldGoalsMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Field Goals Made
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 8"
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
                                    name="fieldGoalsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Field Goals Attempted
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 15"
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
                                Calculate FG%
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
                                    <h2 className="text-2xl font-bold">Field Goal Percentage</h2>
                                    <p className="text-muted-foreground">Offensive Efficiency</p>
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
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Great' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Solid' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Conversion Rate</p>
                                    <p className="text-lg font-bold">{result.percentage.toFixed(1)}%</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Advice:</strong> {result.recommendation}
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
                                    Strategic Analysis
                                </CardTitle>
                                <CardDescription>Key takeaways</CardDescription>
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
                                <CardDescription>Variables to watch</CardDescription>
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
