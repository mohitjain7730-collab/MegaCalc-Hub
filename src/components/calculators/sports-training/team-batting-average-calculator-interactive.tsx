'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    totalRuns: z.number().min(0, "Total runs must be non-negative"),
    totalWickets: z.number().min(0, "Total wickets must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeamBattingAverageCalculatorInteractive() {
    const [result, setResult] = useState<{
        teamAverage: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        runsPerWicket: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalRuns: undefined,
            totalWickets: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.totalRuns == null || v.totalWickets == null) return null;
        if (v.totalWickets === 0) return v.totalRuns; // No wickets lost scenario
        return v.totalRuns / v.totalWickets;
    };

    const interpret = (avg: number) => {
        if (avg >= 40) return 'Outstanding team batting average! Exceptional collective performance and batting depth.';
        if (avg >= 30) return 'Excellent team batting average indicating strong batting lineup.';
        if (avg >= 25) return 'Good team batting average with solid collective performance.';
        if (avg >= 20) return 'Average team batting performance - room for improvement.';
        return 'Below-average team batting - significant improvement needed in batting depth.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg >= 40) return 'World Class';
        if (avg >= 30) return 'Excellent';
        if (avg >= 25) return 'Good';
        if (avg >= 20) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (avg: number) => {
        if (avg >= 40) return 'Exceptional team batting depth! Maintain this collective strength and continue developing all-round batting capability.';
        if (avg >= 30) return 'Strong team batting. Focus on consistency and converting good starts into match-winning totals.';
        if (avg >= 25) return 'Solid batting lineup. Work on improving lower-order contributions and reducing middle-order collapses.';
        if (avg >= 20) return 'Team batting needs improvement. Focus on building partnerships and developing batting depth throughout the order.';
        return 'Critical improvement needed in team batting. Address technical issues, improve batting depth, and develop collective responsibility.';
    };

    const getRating = (avg: number) => {
        if (avg >= 40) return 'Outstanding';
        if (avg >= 30) return 'Excellent';
        if (avg >= 25) return 'Good';
        if (avg >= 20) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (avg: number) => {
        const insights = [];
        if (avg >= 40) {
            insights.push('Exceptional batting depth throughout the order');
            insights.push('Strong collective responsibility and partnership building');
            insights.push('Resilient batting lineup capable of recovering from setbacks');
            insights.push('Multiple batsmen contributing consistently');
        } else if (avg >= 30) {
            insights.push('Strong team batting with good depth');
            insights.push('Effective partnerships and collective contributions');
            insights.push('Solid middle-order support for top order');
            insights.push('Good balance between aggression and consolidation');
        } else if (avg >= 25) {
            insights.push('Decent team batting foundation');
            insights.push('Moderate batting depth with room for improvement');
            insights.push('Some consistency in collective performance');
            insights.push('Lower order needs strengthening');
        } else if (avg >= 20) {
            insights.push('Average team batting performance');
            insights.push('Inconsistent contributions across the order');
            insights.push('Heavy reliance on top order');
            insights.push('Lower-middle order fragility');
        } else {
            insights.push('Weak team batting requiring urgent attention');
            insights.push('Lack of batting depth and partnerships');
            insights.push('Frequent collapses and low totals');
            insights.push('Technical and tactical issues throughout lineup');
        }
        return insights;
    };

    const getRiskFactors = (avg: number) => {
        const risks = [];
        if (avg >= 40) {
            risks.push('Maintain consistency - avoid complacency with strong average');
            risks.push('Continue developing young batsmen to sustain depth');
            risks.push('Monitor individual form to prevent collective decline');
        } else if (avg >= 30) {
            risks.push('Strengthen lower-order batting to increase resilience');
            risks.push('Avoid over-reliance on top 3-4 batsmen');
            risks.push('Work on converting good starts into big totals');
        } else if (avg >= 25) {
            risks.push('Batting depth is moderate - vulnerable to top-order failures');
            risks.push('Middle-order collapses can derail innings');
            risks.push('Lower order contributes minimally');
        } else if (avg >= 20) {
            risks.push('Heavy dependence on top order - team collapses if they fail');
            risks.push('Weak middle and lower order batting');
            risks.push('Struggle to post competitive totals consistently');
        } else {
            risks.push('Critical batting fragility - frequent collapses');
            risks.push('Lack of partnerships and collective responsibility');
            risks.push('Very difficult to post competitive totals');
            risks.push('Urgent need for technical and tactical improvements');
        }
        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const avg = calculate(values);
        if (avg !== null) {
            setResult({
                teamAverage: avg,
                interpretation: interpret(avg),
                performanceLevel: getPerformanceLevel(avg),
                recommendation: getRecommendation(avg),
                rating: getRating(avg),
                insights: getInsights(avg),
                riskFactors: getRiskFactors(avg),
                runsPerWicket: avg
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
                        <h2 className="text-xl font-semibold">Team Batting Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter total runs and wickets lost to calculate team batting average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalRuns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Total Runs Scored
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 2850"
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
                                    name="totalWickets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Total Wickets Lost
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 95"
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
                                Calculate Team Batting Average
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
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Team Batting Average</h2>
                                    <p className="text-muted-foreground">Collective Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.teamAverage.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground mt-1">runs per wicket</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Excellent' || result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Outstanding' || result.rating === 'Excellent' ? 'default' : result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Runs Per Wicket</p>
                                    <p className="text-lg font-bold">{result.runsPerWicket.toFixed(1)}</p>
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
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from team batting analysis</CardDescription>
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
                                <CardDescription>Important considerations and warnings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
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
