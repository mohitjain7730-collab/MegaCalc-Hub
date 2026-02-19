'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, Zap, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    breakPointsWon: z.number().min(0, "Break points won must be non-negative"),
    breakPointOpportunities: z.number().min(1, "Opportunities must be at least 1"),
}).refine((data) => data.breakPointsWon <= data.breakPointOpportunities, {
    message: "Won points cannot exceed opportunities",
    path: ["breakPointsWon"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisBreakPointConversionRateCalculatorInteractive() {
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
            breakPointsWon: undefined,
            breakPointOpportunities: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.breakPointsWon == null || v.breakPointOpportunities == null) return null;
        return (v.breakPointsWon / v.breakPointOpportunities) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 60) return 'Extraordinary clutch performance. You dominate big moments.';
        if (pct >= 50) return 'Excellent conversion rate. You capitalize on opportunities well.';
        if (pct >= 40) return 'Solid tour-level standard. You are competitive under pressure.';
        if (pct >= 30) return 'Average conversion. You let too many chances slip away.';
        return 'Struggling under pressure. Mental toughness needs work.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 55) return 'Elite';
        if (pct >= 45) return 'Advanced';
        if (pct >= 35) return 'Intermediate';
        if (pct >= 25) return 'Developing';
        return 'Struggling';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 55) return 'Maintain your aggressive mindset on big points. It is paying off.';
        if (pct >= 45) return 'Great work. Continue to trust your shots when the pressure is on.';
        if (pct >= 35) return 'Focus on playing the score. Don\'t change your game just because it\'s a break point.';
        if (pct >= 25) return 'Simplify your strategy on break points. Make the opponent play.';
        return 'Mental reset needed. Stop overthinking the moment and treat it like 15-15.';
    };

    const getRating = (pct: number) => {
        if (pct >= 50) return 'Outstanding';
        if (pct >= 40) return 'Good';
        if (pct >= 30) return 'Average';
        if (pct >= 20) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 50) {
            insights.push('High mental toughness');
            insights.push('Capitalizes on opponent weakness');
            insights.push('Game changer in tight matches');
        } else if (pct >= 40) {
            insights.push('Reliable under pressure');
            insights.push('Competitive match player');
            insights.push('Solid tactical choices');
        } else if (pct >= 30) {
            insights.push('Inconsistent execution');
            insights.push('Often lets set/match slip');
            insights.push('Needs better focus');
        } else {
            insights.push('Mental block on big points');
            insights.push('Passive play under stress');
            insights.push('Giving opponent confidence');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Sample size matters (1/2 is 50%, but not reliable data)');
        considerations.push('Surface speed affects defensive capability on BPs');
        considerations.push('Opponent serve quality is a huge factor');
        considerations.push('Mental fatigue late in matches lowers conversion');
        considerations.push('Dependent on creating opportunities first');
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
                        <Zap className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Break Point Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your break point opportunities and conversions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="breakPointsWon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Break Points Won
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 3"
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
                                    name="breakPointOpportunities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Opportunities
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
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
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Conversion Rate
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
                                <Zap className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <h2 className="text-2xl font-bold">Conversion Rate</h2>
                                    <p className="text-muted-foreground">Clutch Performance Analysis</p>
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
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Advanced' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-red-600" />
                                    <p className="font-semibold">Won / Opportunities</p>
                                    <p className="text-lg font-bold">{form.getValues().breakPointsWon} / {form.getValues().breakPointOpportunities}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Tactical Advice:</strong> {result.recommendation}
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
                                    Psychological Insights
                                </CardTitle>
                                <CardDescription>Mental game impact</CardDescription>
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
                                <CardDescription>Why conversion fails</CardDescription>
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
