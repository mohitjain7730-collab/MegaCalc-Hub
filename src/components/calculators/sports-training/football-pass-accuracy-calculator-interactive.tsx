'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, TrendingUp, AlertCircle, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    successfulPasses: z.number().min(0, "Successful passes must be non-negative"),
    totalPasses: z.number().min(0, "Total passes must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballPassAccuracyCalculatorInteractive() {
    const [result, setResult] = useState<{
        passAccuracy: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        passesCompleted: number;
        passesMissed: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            successfulPasses: undefined,
            totalPasses: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.successfulPasses == null || v.totalPasses == null) return null;
        if (v.totalPasses === 0) return 0;
        return (v.successfulPasses / v.totalPasses) * 100;
    };

    const interpret = (accuracy: number) => {
        if (accuracy >= 90) return 'Exceptional pass accuracy! Elite ball control and distribution skills.';
        if (accuracy >= 85) return 'Outstanding pass accuracy indicating excellent technical ability.';
        if (accuracy >= 80) return 'Very good pass accuracy with strong ball retention.';
        if (accuracy >= 75) return 'Good pass accuracy with solid distribution skills.';
        if (accuracy >= 70) return 'Average pass accuracy - room for improvement in ball control.';
        return 'Below-average pass accuracy - significant improvement needed in passing technique.';
    };

    const getPerformanceLevel = (accuracy: number) => {
        if (accuracy >= 90) return 'Elite';
        if (accuracy >= 85) return 'Excellent';
        if (accuracy >= 80) return 'Very Good';
        if (accuracy >= 75) return 'Good';
        if (accuracy >= 70) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (accuracy: number) => {
        if (accuracy >= 90) return 'Elite passing ability! Maintain this exceptional accuracy through consistent practice and continue developing vision and creativity.';
        if (accuracy >= 85) return 'Outstanding passing skills. Focus on increasing pass difficulty and range while maintaining high accuracy.';
        if (accuracy >= 80) return 'Very good accuracy. Work on decision-making under pressure and expanding your passing repertoire.';
        if (accuracy >= 75) return 'Solid passing foundation. Improve first touch, scanning, and passing technique to reach elite levels.';
        if (accuracy >= 70) return 'Average passing accuracy. Focus on fundamental technique, weight of pass, and decision-making to improve retention.';
        return 'Below-average accuracy requires urgent attention. Work extensively on basic passing technique, first touch, and composure under pressure.';
    };

    const getRating = (accuracy: number) => {
        if (accuracy >= 90) return 'Elite';
        if (accuracy >= 85) return 'Excellent';
        if (accuracy >= 80) return 'Very Good';
        if (accuracy >= 75) return 'Good';
        if (accuracy >= 70) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (accuracy: number) => {
        const insights = [];
        if (accuracy >= 90) {
            insights.push('Elite ball retention and distribution ability');
            insights.push('Exceptional technical skills and composure');
            insights.push('Excellent decision-making under pressure');
            insights.push('Key playmaker with high reliability');
        } else if (accuracy >= 85) {
            insights.push('Outstanding passing accuracy and ball control');
            insights.push('Strong technical foundation');
            insights.push('Reliable in possession and distribution');
            insights.push('Consistent performance in passing');
        } else if (accuracy >= 80) {
            insights.push('Very good passing ability with solid retention');
            insights.push('Good technical skills and awareness');
            insights.push('Effective ball distribution');
            insights.push('Reliable possession player');
        } else if (accuracy >= 75) {
            insights.push('Good passing foundation with room for growth');
            insights.push('Decent ball control and distribution');
            insights.push('Consistent but not exceptional');
            insights.push('Potential to reach higher levels');
        } else if (accuracy >= 70) {
            insights.push('Average passing requiring development');
            insights.push('Inconsistent ball retention');
            insights.push('Technical improvements needed');
            insights.push('Moderate reliability in possession');
        } else {
            insights.push('Below-average passing needing urgent work');
            insights.push('Poor ball retention and control');
            insights.push('Frequent turnovers and mistakes');
            insights.push('Fundamental skill development required');
        }
        return insights;
    };

    const getRiskFactors = (accuracy: number) => {
        const risks = [];
        if (accuracy >= 90) {
            risks.push('May become too conservative to maintain high accuracy');
            risks.push('Risk of not attempting difficult but necessary passes');
            risks.push('High expectations to maintain elite standards');
        } else if (accuracy >= 85) {
            risks.push('Need to balance accuracy with progressive passing');
            risks.push('Pressure to maintain consistency');
            risks.push('May struggle against high-pressing opponents');
        } else if (accuracy >= 80) {
            risks.push('Accuracy may drop under intense pressure');
            risks.push('Needs improvement to compete at highest levels');
            risks.push('May lose possession in crucial moments');
        } else if (accuracy >= 75) {
            risks.push('Inconsistent passing limits team possession');
            risks.push('Vulnerable to high-pressing tactics');
            risks.push('May struggle in tight spaces');
            risks.push('Turnovers can lead to counter-attacks');
        } else if (accuracy >= 70) {
            risks.push('Low accuracy hurts team ball retention');
            risks.push('Frequent turnovers create defensive pressure');
            risks.push('Position in team may be threatened');
            risks.push('Lacks composure under pressure');
        } else {
            risks.push('Critical passing deficiency - major liability');
            risks.push('Constant turnovers hurt team performance');
            risks.push('Unable to maintain possession effectively');
            risks.push('Urgent technical coaching required');
        }
        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const accuracy = calculate(values);
        if (accuracy !== null) {
            setResult({
                passAccuracy: accuracy,
                interpretation: interpret(accuracy),
                performanceLevel: getPerformanceLevel(accuracy),
                recommendation: getRecommendation(accuracy),
                rating: getRating(accuracy),
                insights: getInsights(accuracy),
                riskFactors: getRiskFactors(accuracy),
                passesCompleted: values.successfulPasses || 0,
                passesMissed: (values.totalPasses || 0) - (values.successfulPasses || 0)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Passing Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter successful passes and total passes attempted to calculate accuracy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="successfulPasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Successful Passes
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
                                    name="totalPasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Total Passes Attempted
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
                                Calculate Pass Accuracy
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
                                <Navigation className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Pass Accuracy</h2>
                                    <p className="text-muted-foreground">Ball Retention Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.passAccuracy.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">of passes completed successfully</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' || result.performanceLevel === 'Excellent' ? 'default' : result.performanceLevel === 'Very Good' || result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Elite' || result.rating === 'Excellent' ? 'default' : result.rating === 'Very Good' || result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Pass Breakdown</p>
                                    <p className="text-xs font-bold mt-1">{result.passesCompleted} completed / {result.passesMissed} missed</p>
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
                                    <Navigation className="h-6 w-6" />
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from passing analysis</CardDescription>
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
