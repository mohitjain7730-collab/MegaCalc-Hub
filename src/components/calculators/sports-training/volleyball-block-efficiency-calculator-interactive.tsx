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
    stuffBlocks: z.number().min(0, "Stuff blocks must be non-negative"),
    blockErrors: z.number().min(0, "Block errors must be non-negative"),
    totalAttempts: z.number().min(1, "Total attempts must be at least 1"),
}).refine(data => (data.stuffBlocks + data.blockErrors) <= data.totalAttempts, {
    message: "Stuff blocks plus block errors cannot exceed total attempts",
    path: ["totalAttempts"],
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballBlockEfficiencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        efficiency: number;
        successRate: number;
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
            stuffBlocks: undefined,
            blockErrors: undefined,
            totalAttempts: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.stuffBlocks == null || v.blockErrors == null || v.totalAttempts == null) return null;
        if (v.totalAttempts === 0) return { eff: 0, suc: 0 };
        const efficiency = ((v.stuffBlocks - v.blockErrors) / v.totalAttempts);
        const successRate = (v.stuffBlocks / v.totalAttempts) * 100;
        return { eff: efficiency, suc: successRate };
    };

    const interpret = (eff: number) => {
        if (eff >= 0.20) return 'Elite blocking efficiency; dominating the net and shutting down hitters.';
        if (eff >= 0.10) return 'Highly effective blocking; scoring direct points while minimizing net faults.';
        if (eff >= 0.05) return 'Solid blocking presence; contributing positively to the defense.';
        if (eff > 0.00) return 'Average blocking efficiency; positive contribution but room for technical growth.';
        return 'Negative blocking efficiency; bleeding points through net faults or tooling.';
    };

    const getPerformanceLevel = (eff: number) => {
        if (eff >= 0.20) return 'World Class';
        if (eff >= 0.10) return 'Elite';
        if (eff >= 0.05) return 'Good';
        if (eff > 0.00) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (eff: number) => {
        if (eff >= 0.20) return 'Maintain exceptional timing and hand penetration across the net.';
        if (eff >= 0.10) return 'Excellent execution. Focus on closing the seam with your blocking partners on double blocks.';
        if (eff >= 0.05) return 'Work on holding your space and pressing over the net rather than reaching side-to-side.';
        if (eff > 0.00) return 'Focus on disciplined footwork to arrive early and avoid drifting on contact.';
        return 'Fundamental review needed. Focus on eye sequence, stopping before jumping, and avoiding net touches.';
    };

    const getRating = (eff: number) => {
        if (eff >= 0.20) return 'Outstanding';
        if (eff >= 0.10) return 'Excellent';
        if (eff >= 0.05) return 'Good';
        if (eff > 0.00) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (eff: number) => {
        const insights = [];
        if (eff >= 0.10) {
            insights.push('Exceptional lateral speed and timing');
            insights.push('Strong reading of the opposing setter');
            insights.push('Disciplined hands penetrating the plane of the net');
        } else if (eff >= 0.00) {
            insights.push('Reliable foundational blocking');
            insights.push('Capable of channeling attacks to defenders');
            insights.push('Occasional timing or drifting issues causing errors');
        } else {
            insights.push('Frequent net touches or centerline faults');
            insights.push('Hands getting consistently "tooled" or wiped by hitters');
            insights.push('Requires immediate footwork and hand-placement training');
        }
        return insights;
    };

    const getConsiderations = (eff: number) => {
        const considerations = [];
        considerations.push('Middle blockers inherently face more attempts and complex blocking schemes');
        considerations.push('Quality of the opponent\'s serve heavily dictates the opponent\'s set predictability');
        considerations.push('A block that slows the ball down (soft touch) is valuable but not counted as a Stuff Block');
        considerations.push('A negative efficiency indicates you are giving away more points than you are scoring');
        considerations.push('Context of the block (solo vs double vs triple) impacts individual success rates');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const res = calculate(values);
        if (res !== null) {
            setResult({
                efficiency: res.eff,
                successRate: res.suc,
                interpretation: interpret(res.eff),
                performanceLevel: getPerformanceLevel(res.eff),
                recommendation: getRecommendation(res.eff),
                rating: getRating(res.eff),
                insights: getInsights(res.eff),
                considerations: getConsiderations(res.eff)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Blocking Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your stuff blocks, block errors, and total block attempts to calculate efficiency.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="stuffBlocks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Stuff Blocks
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 5"
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
                                    name="blockErrors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Block Errors
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 2"
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
                                    name="totalAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Total Attempts
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 20"
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
                                Calculate Block Efficiency
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Shield className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Block Efficiency</h2>
                                    <p className="text-muted-foreground">Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className={`text-4xl font-bold ${result.efficiency >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.efficiency > 0 ? '+' : ''}{result.efficiency.toFixed(3)}
                                </p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
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
                                    <p className="font-semibold">Stuff Block %</p>
                                    <p className="text-lg font-bold">{result.successRate.toFixed(1)}%</p>
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
                                    Important Considerations
                                </CardTitle>
                                <CardDescription>Factors affecting accuracy</CardDescription>
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
