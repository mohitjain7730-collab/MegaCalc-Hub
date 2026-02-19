'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Calculator, Scale, Activity, CheckCircle2, Crosshair, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    attempts: z.number().min(0, "Total attempts must be non-negative"),
    successfulHits: z.number().min(0, "Successful hits must be non-negative"),
}).refine((data) => data.successfulHits <= data.attempts, {
    message: "Successful hits cannot exceed total attempts",
    path: ["successfulHits"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisServeAccuracyCalculatorInteractive() {
    const [result, setResult] = useState<{
        accuracy: number;
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
            attempts: undefined,
            successfulHits: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.attempts === undefined || v.successfulHits === undefined) return null;
        if (v.attempts === 0) return 0;
        return (v.successfulHits / v.attempts) * 100;
    };

    const interpret = (acc: number) => {
        if (acc >= 70) return 'Sniper-level precision. You can hit your spots at will.';
        if (acc >= 55) return 'Professional grade accuracy. Reliable enough to build strategies around.';
        if (acc >= 40) return 'Solid consistency. You hit your zones often enough to keep opponents guessing.';
        if (acc >= 25) return 'Inconsistent placement. The serve is landing, but not always where intended.';
        return 'Low accuracy. Focus on larger targets to build confidence.';
    };

    const getPerformanceLevel = (acc: number) => {
        if (acc >= 70) return 'World Class';
        if (acc >= 55) return 'Elite';
        if (acc >= 40) return 'Competitive';
        if (acc >= 25) return 'Developing';
        return 'Novice';
    };

    const getRecommendation = (acc: number) => {
        if (acc >= 70) return 'Excellent. Start adding pace or spin variations to these spots.';
        if (acc >= 55) return 'Great work. Introduces smaller targets within the zones (e.g., coin on the line).';
        if (acc >= 40) return 'Good foundation. Improve your toss consistency to boost this number.';
        if (acc >= 25) return 'Simplify the motion. Ensure your toss is in the same spot every time.';
        return 'Move targets further inside the box to increase success rate before aiming for lines.';
    };

    const getRating = (acc: number) => {
        if (acc >= 70) return 'Outstanding';
        if (acc >= 55) return 'Excellent';
        if (acc >= 40) return 'Good';
        if (acc >= 25) return 'Fair';
        return 'Needs Practice';
    };

    const getInsights = (acc: number) => {
        const insights = [];
        if (acc >= 60) {
            insights.push('Opponents cannot predict your serve location');
            insights.push('Ability to exploit opponent weaknesses effectively');
            insights.push('High confidence in pressure situations');
        } else if (acc >= 40) {
            insights.push('Functional directional control');
            insights.push('Can occasionally ace or force errors');
            insights.push('Good enough for most club-level play');
        } else if (acc >= 20) {
            insights.push('Serve placement is more random than intentional');
            insights.push('Relying more on power/consistency than precision');
            insights.push('Opponent can comfortably camp in the middle of the box');
        } else {
            insights.push('High risk of faulting when aiming for lines');
            insights.push('Likely telegraphing serve direction via toss');
            insights.push('Mentally taxing to aim for specific spots');
        }
        return insights;
    };

    const getConsiderations = (acc: number) => {
        const considerations = [];
        considerations.push('Target size matters (hitting a cone vs hitting a zone)');
        considerations.push('Adding speed almost always reduces accuracy initially');
        considerations.push('Wind creates significant deviation in ball trajectory');
        considerations.push('Accuracy on "First Serve" is harder than "Second Serve" (due to risk)');
        considerations.push('Fatigue degrades fine motor skills needed for precision');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const acc = calculate(values);
        if (acc !== null) {
            setResult({
                accuracy: acc,
                interpretation: interpret(acc),
                performanceLevel: getPerformanceLevel(acc),
                recommendation: getRecommendation(acc),
                rating: getRating(acc),
                insights: getInsights(acc),
                considerations: getConsiderations(acc)
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
                        <h2 className="text-xl font-semibold">Target Practice Data</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your serve placement attempts (e.g., aiming for T, Wide, or Body)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="attempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Targeted Serves
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
                                <FormField
                                    control={form.control}
                                    name="successfulHits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Successful Hits to Zone
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 22"
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
                                Calculate Accuracy %
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
                                    <h2 className="text-2xl font-bold">Serve Accuracy</h2>
                                    <p className="text-muted-foreground">Placement & Precision Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.accuracy.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                                    <p className="font-semibold">Precision Level</p>
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
                                    <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Hit Ratio</p>
                                    <p className="text-lg font-bold">{(result.accuracy / 100).toFixed(2)}</p>
                                </div>
                            </div>

                            <Alert>
                                <Activity className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Drill Focus:</strong> {result.recommendation}
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
                                    Tactical Advantage
                                </CardTitle>
                                <CardDescription>What this accuracy enables</CardDescription>
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
                                    Accuracy Killers
                                </CardTitle>
                                <CardDescription>Factors reducing precision</CardDescription>
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
