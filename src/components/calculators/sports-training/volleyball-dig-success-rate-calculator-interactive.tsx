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
    successfulDigs: z.number().min(0, "Successful digs must be non-negative"),
    totalAttempts: z.number().min(1, "Total attempts must be at least 1"),
}).refine(data => data.successfulDigs <= data.totalAttempts, {
    message: "Successful digs cannot exceed total attempts",
    path: ["successfulDigs"],
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballDigSuccessRateCalculatorInteractive() {
    const [result, setResult] = useState<{
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
            successfulDigs: undefined,
            totalAttempts: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.successfulDigs == null || v.totalAttempts == null) return null;
        if (v.totalAttempts === 0) return 0;
        return (v.successfulDigs / v.totalAttempts) * 100;
    };

    const interpret = (rate: number) => {
        if (rate >= 75) return 'World-class defensive specialist reading hitters perfectly.';
        if (rate >= 65) return 'Elite defensive performance keeping the team overwhelmingly in-system.';
        if (rate >= 55) return 'Solid digging execution with dependable ball control.';
        if (rate >= 45) return 'Average digging rate; inconsistent defensive positioning.';
        return 'Below-average digging success; requires immediate defensive footwork review.';
    };

    const getPerformanceLevel = (rate: number) => {
        if (rate >= 75) return 'World Class';
        if (rate >= 65) return 'Elite';
        if (rate >= 55) return 'Good';
        if (rate >= 45) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (rate: number) => {
        if (rate >= 75) return 'Maintain exceptional court awareness and continue anchoring the team\'s transition offense.';
        if (rate >= 65) return 'Excellent execution. Focus on perfecting the trajectory of dug balls to the setter.';
        if (rate >= 55) return 'Work on holding defensive posture longer to react effectively to tips and fast tempo sets.';
        if (rate >= 45) return 'Focus heavily on defensive base positioning and taking aggressive angles on hard swings.';
        return 'Fundamental review needed. Focus on building a stable platform early and stopping momentum before contact.';
    };

    const getRating = (rate: number) => {
        if (rate >= 75) return 'Outstanding';
        if (rate >= 65) return 'Excellent';
        if (rate >= 55) return 'Good';
        if (rate >= 45) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate >= 65) {
            insights.push('Exceptional ability to read the opponent\'s offense');
            insights.push('Provides high-quality transition opportunities');
            insights.push('Strong defensive posturing and quick reflexes');
        } else if (rate >= 55) {
            insights.push('Reliable foundational defense');
            insights.push('Keeps the ball alive during intense rallies');
            insights.push('Minor inconsistencies against elite hitters');
        } else {
            insights.push('Frequent uncontrolled defensive contacts');
            insights.push('Struggling to anticipate hitter tendencies');
            insights.push('Requires platform stability and movement training');
        }
        return insights;
    };

    const getConsiderations = (rate: number) => {
        const considerations = [];
        considerations.push('Quality of the opposing team\'s offense drastically impacts dig difficulty');
        considerations.push('A team\'s blocking scheme defines defensive responsibilities and zones');
        considerations.push('Liberos naturally face harder-driven balls, skewing expected success rates');
        considerations.push('A "successful dig" implies the ball remained playable, not perfectly passed');
        considerations.push('Context of the dig (e.g., hard-driven spike vs off-speed roll shot) matters');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        if (rate !== null) {
            setResult({
                successRate: rate,
                interpretation: interpret(rate),
                performanceLevel: getPerformanceLevel(rate),
                recommendation: getRecommendation(rate),
                rating: getRating(rate),
                insights: getInsights(rate),
                considerations: getConsiderations(rate)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Digging Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter successful digs and total dig attempts to calculate defensive efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="successfulDigs"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Successful Digs
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
                                    name="totalAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Total Dig Attempts
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 70"
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
                                Calculate Dig Success Rate
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
                                    <h2 className="text-2xl font-bold">Dig Success Rate</h2>
                                    <p className="text-muted-foreground">Defensive Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.successRate.toFixed(2)}%</p>
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
                                    <p className="font-semibold">Successful Digs</p>
                                    <p className="text-lg font-bold">{(result.successRate / 100 * form.getValues().totalAttempts!).toFixed(0)}</p>
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
