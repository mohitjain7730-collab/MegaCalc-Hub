'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Clock, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    goalsScored: z.number().min(0, "Goals scored must be non-negative"),
    minutesPlayed: z.number().min(1, "Minutes played must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballGoalsPer90CalculatorInteractive() {
    const [result, setResult] = useState<{
        goalsPer90: number;
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
            goalsScored: undefined,
            minutesPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.goalsScored == null || v.minutesPlayed == null || v.minutesPlayed === 0) return null;
        return (v.goalsScored / v.minutesPlayed) * 90;
    };

    const interpret = (val: number) => {
        if (val >= 1.0) return 'Phenomenal scoring rate. Averaging a goal or more every game.';
        if (val >= 0.8) return 'Elite striker level. Top scorer contender in major leagues.';
        if (val >= 0.5) return 'Very good scoring rate. Reliable goal threat (standard for good strikers).';
        if (val >= 0.3) return 'Decent return. Good for wingers/midfielders or backup strikers.';
        return 'Below average for a primary goalscorer.';
    };

    const getPerformanceLevel = (val: number) => {
        if (val >= 0.9) return 'World Class';
        if (val >= 0.7) return 'Elite';
        if (val >= 0.5) return 'Good';
        if (val >= 0.3) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (val: number) => {
        if (val >= 0.8) return 'Maintain this efficiency. You are key to the team\'s success.';
        if (val >= 0.6) return 'Excellent form. Focus on consistency over a full season.';
        if (val >= 0.4) return 'Good contribution. Look to increase shot volume or quality (xG).';
        if (val >= 0.2) return 'Focus on positioning to get more high-quality chances.';
        return 'Review role and tactics. Is the service lacking or finishing poor?';
    };

    const getRating = (val: number) => {
        if (val >= 0.8) return 'Outstanding';
        if (val >= 0.6) return 'Excellent';
        if (val >= 0.4) return 'Good';
        if (val >= 0.2) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (val: number) => {
        const insights = [];
        if (val >= 0.8) {
            insights.push('Extremely lethal finisher');
            insights.push('Likely overperforming xG (check sustainability)');
            insights.push('Maximizes limited minutes effectively');
        } else if (val >= 0.5) {
            insights.push('Reliable goal source');
            insights.push('Good movement and positioning');
            insights.push('Valuable starter material');
        } else if (val >= 0.3) {
            insights.push('Contributes occasionally');
            insights.push('May offer more in link-up play/assists');
            insights.push('Standard for creative midfielders');
        } else {
            insights.push('Struggling in front of goal');
            insights.push('Confidence likely low');
            insights.push('Analyze shot selection maps');
        }
        return insights;
    };

    const getConsiderations = (val: number) => {
        const considerations = [];
        considerations.push('Small sample size (few minutes) can skew data wildly');
        considerations.push('Penalty goals inflate this number significantly');
        considerations.push('Does not account for assists or defensive work');
        considerations.push('Substitute appearances against tired legs can boost rate');
        considerations.push('Strength of opposition varies');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const val = calculate(values);
        if (val !== null) {
            setResult({
                goalsPer90: val,
                interpretation: interpret(val),
                performanceLevel: getPerformanceLevel(val),
                recommendation: getRecommendation(val),
                rating: getRating(val),
                insights: getInsights(val),
                considerations: getConsiderations(val)
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
                        <h2 className="text-xl font-semibold">Player Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter goals and minutes to calculate Goals per 90
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="goalsScored"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Goals Scored
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
                                <FormField
                                    control={form.control}
                                    name="minutesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Minutes Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 1250"
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
                                Calculate Goals Per 90
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
                                    <h2 className="text-2xl font-bold">Goals Per 90</h2>
                                    <p className="text-muted-foreground">Scoring Efficiency</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.goalsPer90.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
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
                                    <p className="font-semibold">Projected Goals (38 gms)</p>
                                    <p className="text-lg font-bold">{(result.goalsPer90 * 38).toFixed(1)}</p>
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
                                    Risk Factors
                                </CardTitle>
                                <CardDescription>Contextual limitations</CardDescription>
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
