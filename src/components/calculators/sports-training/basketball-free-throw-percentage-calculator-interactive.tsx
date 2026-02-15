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
    freeThrowsMade: z.number().min(0, "Free throws made must be non-negative"),
    freeThrowsAttempted: z.number().min(1, "Attempts must be at least 1").describe("Free throws attempted"),
}).refine(data => data.freeThrowsMade <= data.freeThrowsAttempted, {
    message: "Made shots cannot exceed attempted shots",
    path: ["freeThrowsMade"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballFreeThrowPercentageCalculatorInteractive() {
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
            freeThrowsMade: undefined,
            freeThrowsAttempted: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.freeThrowsMade == null || v.freeThrowsAttempted == null) return null;
        if (v.freeThrowsAttempted === 0) return 0;
        return (v.freeThrowsMade / v.freeThrowsAttempted) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 90) return 'Elite shooting efficiency. You are automatic from the line.';
        if (pct >= 80) return 'Excellent consistency. Reliable in clutch situations.';
        if (pct >= 70) return 'Good average. Dependable but can improve.';
        if (pct >= 60) return 'Below average. Vulnerable to pressure.';
        return 'Poor shooting. A liability in close games.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 90) return 'Elite';
        if (pct >= 80) return 'Excellent';
        if (pct >= 70) return 'Good';
        if (pct >= 60) return 'Fair';
        return 'Needs Work';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 90) return 'Maintain your routine. Focus on mental toughness to stay perfect.';
        if (pct >= 80) return 'Refine your release point for even greater consistency.';
        if (pct >= 70) return 'Standardize your pre-shot routine to boost confidence.';
        if (pct >= 60) return 'Work on your mechanics (elbow in, follow through) and repetition.';
        return 'Rebuild your shooting form from scratch and practice high-volume reps.';
    };

    const getRating = (pct: number) => {
        if (pct >= 90) return 'Outstanding';
        if (pct >= 80) return 'Great';
        if (pct >= 70) return 'Solid';
        if (pct >= 60) return 'Subpar';
        return 'Critical';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 85) {
            insights.push('High value in "hack" situations');
            insights.push('Trustworthy for technical fouls');
            insights.push('Zone-breaker via free points');
        } else if (pct >= 70) {
            insights.push('Reliable scorer');
            insights.push('Standard efficiency');
            insights.push('Can close out games reasonably well');
        } else {
            insights.push('Risk in late-game scenarios');
            insights.push('Points left on the board');
            insights.push('Defenders may foul intentionally');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Fatigue levels significantly impact FT% late in games');
        considerations.push('Pressure situations (clutch time) can lower practice averages');
        considerations.push('Sample size matters (1/1 is 100% but not reliable)');
        considerations.push('Away crowds can affect concentration');
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
                        <h2 className="text-xl font-semibold">Shooting Data</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your free throw stats to analyze efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="freeThrowsMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Free Throws Made
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
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
                                    name="freeThrowsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Free Throws Attempted
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 50"
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
                                    <h2 className="text-2xl font-bold">Free Throw Percentage</h2>
                                    <p className="text-muted-foreground">Shooting Efficiency Analysis</p>
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
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Excellent' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Great' ? 'secondary' : result.rating === 'Solid' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Accuracy</p>
                                    <p className="text-lg font-bold">{result.percentage.toFixed(1)}%</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Note:</strong> {result.recommendation}
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
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Strategic takeaways</CardDescription>
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
