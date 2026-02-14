'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsConceded: z.number().min(0),
    oversBowled: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function BowlingEconomyRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        economyRate: number;
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
            runsConceded: undefined,
            oversBowled: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsConceded == null || v.oversBowled == null) return null;
        if (v.oversBowled === 0) return 0;
        return v.runsConceded / v.oversBowled;
    };

    const interpret = (er: number) => {
        if (er <= 4.0) return 'Exceptional economy rate with outstanding run containment.';
        if (er <= 5.0) return 'Excellent economy rate indicating strong control and discipline.';
        if (er <= 6.0) return 'Good economy rate showing effective run containment.';
        if (er <= 7.5) return 'Average economy rate - room for improvement in control.';
        if (er <= 9.0) return 'Below-average economy - conceding too many runs per over.';
        return 'Poor economy rate - significant improvement needed in run containment.';
    };

    const getPerformanceLevel = (er: number) => {
        if (er <= 4.0) return 'Exceptional';
        if (er <= 5.0) return 'Excellent';
        if (er <= 6.0) return 'Good';
        if (er <= 7.5) return 'Average';
        if (er <= 9.0) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (er: number) => {
        if (er <= 4.0) return 'Maintain tight lines and lengths. Continue pressure bowling.';
        if (er <= 5.0) return 'Excellent control. Focus on taking wickets while maintaining economy.';
        if (er <= 6.0) return 'Good containment. Work on variations to improve further.';
        if (er <= 7.5) return 'Improve line and length consistency. Reduce boundary balls.';
        if (er <= 9.0) return 'Focus on dot balls and reducing scoring opportunities.';
        return 'Fundamental work needed on accuracy and match awareness.';
    };

    const getRating = (er: number) => {
        if (er <= 4.0) return 'Outstanding';
        if (er <= 5.0) return 'Excellent';
        if (er <= 6.0) return 'Good';
        if (er <= 7.5) return 'Fair';
        if (er <= 9.0) return 'Below Average';
        return 'Poor';
    };

    const getInsights = (er: number) => {
        const insights = [];
        if (er <= 4.0) {
            insights.push('Exceptional run containment ability');
            insights.push('Builds pressure through dot balls');
            insights.push('Highly valuable in all formats');
        } else if (er <= 5.0) {
            insights.push('Strong control and discipline');
            insights.push('Effective in middle overs');
            insights.push('Reliable containment bowler');
        } else if (er <= 6.0) {
            insights.push('Good line and length');
            insights.push('Capable of building pressure');
            insights.push('Solid team contribution');
        } else if (er <= 7.5) {
            insights.push('Inconsistent control');
            insights.push('Occasional boundary balls');
            insights.push('Needs improved accuracy');
        } else if (er <= 9.0) {
            insights.push('Struggles with containment');
            insights.push('Too many scoring opportunities');
            insights.push('Requires technical refinement');
        } else {
            insights.push('Poor run containment');
            insights.push('Lacks control and discipline');
            insights.push('Significant improvement needed');
        }
        return insights;
    };

    const getConsiderations = (er: number) => {
        const considerations = [];
        considerations.push('Format of cricket affects ideal economy rate');
        considerations.push('Bowling phase impacts expected economy (powerplay vs death)');
        considerations.push('Pitch conditions significantly affect run-scoring');
        considerations.push('Quality of opposition batting influences economy');
        considerations.push('Match situation may require defensive or attacking bowling');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const er = calculate(values);
        if (er !== null) {
            setResult({
                economyRate: er,
                interpretation: interpret(er),
                performanceLevel: getPerformanceLevel(er),
                recommendation: getRecommendation(er),
                rating: getRating(er),
                insights: getInsights(er),
                considerations: getConsiderations(er)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Bowling Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter runs conceded and overs bowled to calculate economy rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="runsConceded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Runs Conceded
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 42"
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
                                    name="oversBowled"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Overs Bowled
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 10"
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
                                Calculate Economy Rate
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
                                <BarChart3 className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Economy Rate</h2>
                                    <p className="text-muted-foreground">Run Containment Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.economyRate.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Exceptional' ? 'default' : result.performanceLevel === 'Excellent' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
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
                                    <p className="font-semibold">Runs Per Over</p>
                                    <p className="text-lg font-bold">{result.economyRate.toFixed(2)}</p>
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
