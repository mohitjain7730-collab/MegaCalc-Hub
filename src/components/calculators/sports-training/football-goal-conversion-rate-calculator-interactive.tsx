'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    goalsScored: z.number().min(0, "Goals scored must be non-negative"),
    shotsOnTarget: z.number().min(0, "Shots on target must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballGoalConversionRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        conversionRate: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        efficiency: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            goalsScored: undefined,
            shotsOnTarget: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.goalsScored == null || v.shotsOnTarget == null) return null;
        if (v.shotsOnTarget === 0) return 0;
        return (v.goalsScored / v.shotsOnTarget) * 100;
    };

    const interpret = (rate: number) => {
        if (rate >= 40) return 'Exceptional goal conversion rate! Elite finishing ability and clinical in front of goal.';
        if (rate >= 30) return 'Outstanding conversion rate indicating excellent finishing skills.';
        if (rate >= 20) return 'Good conversion rate with solid finishing ability.';
        if (rate >= 15) return 'Average conversion rate - room for improvement in finishing.';
        if (rate >= 10) return 'Below-average conversion - needs significant work on finishing.';
        return 'Poor conversion rate - critical improvement needed in finishing technique.';
    };

    const getPerformanceLevel = (rate: number) => {
        if (rate >= 40) return 'Elite';
        if (rate >= 30) return 'Excellent';
        if (rate >= 20) return 'Good';
        if (rate >= 15) return 'Average';
        if (rate >= 10) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (rate: number) => {
        if (rate >= 40) return 'Elite finishing! Maintain this exceptional conversion rate through consistent practice and mental preparation.';
        if (rate >= 30) return 'Excellent finishing ability. Focus on maintaining composure in high-pressure situations and continue refining technique.';
        if (rate >= 20) return 'Solid conversion rate. Work on shot placement, power control, and decision-making in the box to reach elite levels.';
        if (rate >= 15) return 'Average finishing. Dedicate time to finishing drills, improve first touch, and work on shooting technique under pressure.';
        if (rate >= 10) return 'Below-average conversion. Focus on fundamental finishing techniques, composure, and shot selection. Practice one-on-one situations.';
        return 'Critical improvement needed. Work extensively on basic finishing technique, shot accuracy, and mental composure in scoring positions.';
    };

    const getRating = (rate: number) => {
        if (rate >= 40) return 'Elite';
        if (rate >= 30) return 'Excellent';
        if (rate >= 20) return 'Good';
        if (rate >= 15) return 'Fair';
        if (rate >= 10) return 'Below Average';
        return 'Needs Improvement';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate >= 40) {
            insights.push('Elite finishing ability - among the best strikers');
            insights.push('Exceptional composure and technique in front of goal');
            insights.push('Clinical decision-making in scoring positions');
            insights.push('High-value player with match-winning capability');
        } else if (rate >= 30) {
            insights.push('Excellent finishing skills with consistent conversion');
            insights.push('Strong shot placement and power control');
            insights.push('Good composure under pressure');
            insights.push('Reliable goal-scoring threat');
        } else if (rate >= 20) {
            insights.push('Solid finishing ability with room for growth');
            insights.push('Decent shot accuracy and technique');
            insights.push('Consistent goal-scoring contribution');
            insights.push('Potential to reach elite levels with improvement');
        } else if (rate >= 15) {
            insights.push('Average finishing requiring development');
            insights.push('Inconsistent shot conversion');
            insights.push('Needs improvement in composure and technique');
            insights.push('Moderate goal-scoring threat');
        } else if (rate >= 10) {
            insights.push('Below-average finishing ability');
            insights.push('Struggles with shot accuracy and placement');
            insights.push('Limited composure in scoring positions');
            insights.push('Significant improvement needed');
        } else {
            insights.push('Poor finishing requiring urgent attention');
            insights.push('Major technical and mental issues');
            insights.push('Very low goal-scoring efficiency');
            insights.push('Fundamental skill development needed');
        }
        return insights;
    };

    const getRiskFactors = (rate: number) => {
        const risks = [];
        if (rate >= 40) {
            risks.push('High expectations - pressure to maintain elite standards');
            risks.push('Risk of complacency with excellent conversion rate');
            risks.push('Opposition may focus defensive efforts on limiting chances');
        } else if (rate >= 30) {
            risks.push('Need to maintain consistency to stay at this level');
            risks.push('Pressure situations may affect conversion rate');
            risks.push('Competition for starting position if rate drops');
        } else if (rate >= 20) {
            risks.push('Inconsistency in finishing may cost crucial goals');
            risks.push('Needs improvement to compete at highest levels');
            risks.push('May struggle against top-quality goalkeepers');
        } else if (rate >= 15) {
            risks.push('Low conversion limits goal-scoring potential');
            risks.push('Team may lack confidence in player\'s finishing');
            risks.push('Position in team may be under threat');
            risks.push('Wastes scoring opportunities');
        } else if (rate >= 10) {
            risks.push('Very low conversion rate hurts team performance');
            risks.push('Likely to be replaced by better finishers');
            risks.push('Lacks confidence in front of goal');
            risks.push('Significant liability in crucial matches');
        } else {
            risks.push('Critical finishing deficiency - major team weakness');
            risks.push('Unable to capitalize on scoring chances');
            risks.push('Position as striker/forward untenable');
            risks.push('Urgent technical and mental coaching required');
        }
        return risks;
    };

    const getEfficiency = (rate: number) => {
        if (rate >= 40) return 'Elite efficiency - converts 2 in 5 shots on target';
        if (rate >= 30) return 'Excellent efficiency - converts 1 in 3 shots on target';
        if (rate >= 20) return 'Good efficiency - converts 1 in 5 shots on target';
        if (rate >= 15) return 'Average efficiency - converts roughly 1 in 6-7 shots';
        if (rate >= 10) return 'Below-average efficiency - converts 1 in 10 shots';
        return 'Poor efficiency - rarely converts shots on target';
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        if (rate !== null) {
            setResult({
                conversionRate: rate,
                interpretation: interpret(rate),
                performanceLevel: getPerformanceLevel(rate),
                recommendation: getRecommendation(rate),
                rating: getRating(rate),
                insights: getInsights(rate),
                riskFactors: getRiskFactors(rate),
                efficiency: getEfficiency(rate)
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
                        <h2 className="text-xl font-semibold">Shooting Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter goals scored and shots on target to calculate conversion rate
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
                                                <Activity className="h-4 w-4" />
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
                                    name="shotsOnTarget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Shots on Target
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 52"
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
                                Calculate Goal Conversion Rate
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
                                    <h2 className="text-2xl font-bold">Goal Conversion Rate</h2>
                                    <p className="text-muted-foreground">Finishing Efficiency Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.conversionRate.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">of shots on target converted to goals</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' || result.performanceLevel === 'Excellent' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Elite' || result.rating === 'Excellent' ? 'default' : result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Efficiency</p>
                                    <p className="text-xs font-bold mt-1">{result.efficiency}</p>
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
                                <CardDescription>Key takeaways from conversion analysis</CardDescription>
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
