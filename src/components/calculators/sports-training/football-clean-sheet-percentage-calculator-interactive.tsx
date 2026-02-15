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
    matchesPlayed: z.number().min(1, "Matches played must be at least 1"),
    cleanSheets: z.number().min(0, "Clean sheets must be non-negative"),
}).refine((data) => {
    return data.cleanSheets <= data.matchesPlayed;
}, {
    message: "Clean sheets cannot exceed Matches Played",
    path: ["cleanSheets"],
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballCleanSheetPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        csPercentage: number;
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
            matchesPlayed: undefined,
            cleanSheets: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.matchesPlayed === 0) return 0;
        return (v.cleanSheets / v.matchesPlayed) * 100;
    };

    const interpret = (rate: number) => {
        if (rate >= 50) return 'Legendary defensive wall. Historically elite performance.';
        if (rate >= 40) return 'World-class defense. Championship winning standard.';
        if (rate >= 30) return 'Solid defensive unit. Top 4 quality.';
        if (rate >= 20) return 'Average defense. Can survive but rarely dominates.';
        return 'Leaky defense. Relegation struggle likely without improvement.';
    };

    const getPerformanceLevel = (rate: number) => {
        if (rate >= 50) return 'Legendary';
        if (rate >= 40) return 'Elite';
        if (rate >= 30) return 'Good';
        if (rate >= 20) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (rate: number) => {
        if (rate >= 50) return 'Maintain focus and organization. You are setting records.';
        if (rate >= 40) return 'Excellent work. Ensure backup defenders are ready to maintain this standard.';
        if (rate >= 30) return 'Focus on eliminating individual errors to reach the next level.';
        if (rate >= 20) return 'Review set-piece defending and transition organization.';
        return 'Urgent defensive overhaul needed. Prioritize shape and discipline over attacking.';
    };

    const getRating = (rate: number) => {
        if (rate >= 50) return 'Outstanding';
        if (rate >= 40) return 'Excellent';
        if (rate >= 30) return 'Good';
        if (rate >= 20) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate >= 50) {
            insights.push('Defense wins titles - you are on track');
            insights.push('Opposition strikers fear your backline');
            insights.push('Goalkeeper likely in Golden Glove contention');
        } else if (rate >= 40) {
            insights.push('Extremely difficult to beat');
            insights.push('Strong foundation for league success');
            insights.push('Consistent back 4/5 partnerships');
        } else if (rate >= 30) {
            insights.push('Competitive at the highest level');
            insights.push('Occasional lapses cost points');
            insights.push('Good organization in open play');
        } else if (rate >= 20) {
            insights.push('Vulnerable to counter-attacks');
            insights.push('Goalkeeper often overworked');
            insights.push('Need to protect the lead better');
        } else {
            insights.push('Severe defensive frailties');
            insights.push('High Goals Against expected');
            insights.push('Relegation candidate profile');
        }
        return insights;
    };

    const getConsiderations = (rate: number) => {
        const considerations = [];
        considerations.push('Quality of opposition strikers');
        considerations.push('Defensive playing style (High line vs Low block)');
        considerations.push('Goalkeeper shot-stopping ability (PSxG)');
        considerations.push('Injuries to key defenders');
        considerations.push('Set-piece vulnerability');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        setResult({
            csPercentage: rate,
            interpretation: interpret(rate),
            performanceLevel: getPerformanceLevel(rate),
            recommendation: getRecommendation(rate),
            rating: getRating(rate),
            insights: getInsights(rate),
            considerations: getConsiderations(rate)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Defensive Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter matches played and clean sheets kept
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="matchesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Matches Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 38"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cleanSheets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Clean Sheets
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 15"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                <Shield className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Clean Sheet %</h2>
                                    <p className="text-muted-foreground">Defensive Reliability</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.csPercentage.toFixed(2)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Legendary' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Defensive Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Goals Conceded Trend</p>
                                    <p className="text-lg font-bold">{result.csPercentage >= 35 ? 'Low' : 'High'}</p>
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
                                    Defensive Insights
                                </CardTitle>
                                <CardDescription>Key takeaways for the backline</CardDescription>
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
