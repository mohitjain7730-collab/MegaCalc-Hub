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
    savesMade: z.number().min(0, "Saves made must be non-negative"),
    goalsConceded: z.number().min(0, "Goals conceded must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballSavePercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
        totalShots: number;
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
            savesMade: undefined,
            goalsConceded: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.savesMade == null || v.goalsConceded == null) return null;

        const totalShots = v.savesMade + v.goalsConceded;
        if (totalShots === 0) return 0;

        return (v.savesMade / totalShots) * 100;
    };

    const interpret = (pct: number) => {
        if (pct >= 80) return 'World-class shot-stopping ability. Elite goalkeeper level.';
        if (pct >= 75) return 'Excellent performance. Top-tier professional standard.';
        if (pct >= 70) return 'Good, reliable performance. Standard for professional leagues.';
        if (pct >= 65) return 'Average performance. Room for improvement in positioning or reflexes.';
        return 'Below average. Analysis of technique and defense organization needed.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 80) return 'World Class';
        if (pct >= 75) return 'Elite';
        if (pct >= 70) return 'Good';
        if (pct >= 65) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 80) return 'Maintain high standards. Focus on command of area and distribution.';
        if (pct >= 75) return 'Very strong. Work on consistency against high-quality chances.';
        if (pct >= 70) return 'Solid. Focus on specific weakness areas (e.g., long shots, 1v1s).';
        if (pct >= 65) return 'Review positioning and reaction times. intense training drills suggested.';
        return 'Fundamental review needed. Focus on basic handling, positioning, and decision making.';
    };

    const getRating = (pct: number) => {
        if (pct >= 80) return 'Outstanding';
        if (pct >= 75) return 'Excellent';
        if (pct >= 70) return 'Good';
        if (pct >= 65) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 80) {
            insights.push('Exceptional reflex and positioning');
            insights.push('Likely saves points for the team alone');
            insights.push('Commanding presence in goal');
        } else if (pct >= 75) {
            insights.push('Reliable last line of defense');
            insights.push('Strong concentration levels');
            insights.push('Consistent under pressure');
        } else if (pct >= 70) {
            insights.push('Standard professional competency');
            insights.push('Makes expected saves consistently');
            insights.push('Solid contribution to team defense');
        } else if (pct >= 65) {
            insights.push('Vulnerable to high-quality finishing');
            insights.push('Inconsistency in shot-stopping');
            insights.push('May need defensive system support');
        } else {
            insights.push('significant weakness in goal');
            insights.push('Confidence likely low');
            insights.push('Urgent technical correction needed');
        }
        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Does not account for difficulty of shots faced (xG)');
        considerations.push('Defensive line quality impacts shots allowed');
        considerations.push('Sample size matters (1 game vs season)');
        considerations.push('Game state (winning/losing) affects opposition risk');
        considerations.push('Distribution and cross-claiming not measured here');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const pct = calculate(values);
        if (pct !== null) {
            const totalShots = values.savesMade + values.goalsConceded;
            setResult({
                percentage: pct,
                totalShots: totalShots,
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
                        <h2 className="text-xl font-semibold">Goalkeeper Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter save and goal data to calculate save percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="savesMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Saves Made
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 85"
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
                                    name="goalsConceded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Goals Conceded
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 25"
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
                                Calculate Save Percentage
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
                                    <h2 className="text-2xl font-bold">Save Percentage</h2>
                                    <p className="text-muted-foreground">Goalkeeper Analysis</p>
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
                                    <p className="font-semibold">Shots on Target Faced</p>
                                    <p className="text-lg font-bold">{result.totalShots}</p>
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
                                <CardDescription>Factors affecting calculation</CardDescription>
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
