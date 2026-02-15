'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsScored: z.number().min(0, "Runs scored must be non-negative"),
    oversPlayed: z.number().min(0, "Overs played must be non-negative").max(10, "Powerplay is maximum 10 overs"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PowerplayRunRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        runRate: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        projectedScore: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsScored: undefined,
            oversPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsScored == null || v.oversPlayed == null) return null;
        if (v.oversPlayed === 0) return 0;
        return v.runsScored / v.oversPlayed;
    };

    const interpret = (runRate: number) => {
        if (runRate >= 10) return 'Exceptional powerplay run rate! Dominant batting performance with aggressive intent.';
        if (runRate >= 8) return 'Excellent powerplay run rate indicating strong batting performance.';
        if (runRate >= 6) return 'Good powerplay run rate with balanced risk-reward approach.';
        if (runRate >= 4) return 'Below-average powerplay run rate - more aggression needed.';
        return 'Poor powerplay run rate - significant improvement required in scoring rate.';
    };

    const getPerformanceLevel = (runRate: number) => {
        if (runRate >= 10) return 'Exceptional';
        if (runRate >= 8) return 'Excellent';
        if (runRate >= 6) return 'Good';
        if (runRate >= 4) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (runRate: number) => {
        if (runRate >= 10) return 'Outstanding powerplay performance! Maintain this aggressive approach while managing risk.';
        if (runRate >= 8) return 'Strong powerplay batting. Continue targeting boundaries while rotating strike effectively.';
        if (runRate >= 6) return 'Decent powerplay performance. Look to increase boundary percentage and capitalize on field restrictions.';
        if (runRate >= 4) return 'Powerplay run rate needs improvement. Focus on finding boundaries and rotating strike more effectively.';
        return 'Critical improvement needed. Work on aggressive intent, shot selection, and exploiting field restrictions during powerplay.';
    };

    const getRating = (runRate: number) => {
        if (runRate >= 10) return 'Outstanding';
        if (runRate >= 8) return 'Excellent';
        if (runRate >= 6) return 'Good';
        if (runRate >= 4) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (runRate: number) => {
        const insights = [];
        if (runRate >= 10) {
            insights.push('Exceptional powerplay exploitation with aggressive batting');
            insights.push('High boundary percentage and effective strike rotation');
            insights.push('Team positioned for commanding total with strong foundation');
            insights.push('Pressure shifted to opposition bowlers and fielders');
        } else if (runRate >= 8) {
            insights.push('Strong powerplay performance with good intent');
            insights.push('Effective use of field restrictions');
            insights.push('Balanced approach between aggression and wicket preservation');
            insights.push('Solid platform for middle overs acceleration');
        } else if (runRate >= 6) {
            insights.push('Moderate powerplay performance');
            insights.push('Room for improvement in boundary hitting');
            insights.push('Decent foundation but requires middle overs push');
            insights.push('Strike rotation adequate but boundary percentage could increase');
        } else if (runRate >= 4) {
            insights.push('Below-par powerplay performance');
            insights.push('Insufficient exploitation of field restrictions');
            insights.push('Pressure on middle and death overs to compensate');
            insights.push('Lack of aggressive intent or poor execution');
        } else {
            insights.push('Poor powerplay performance requiring immediate attention');
            insights.push('Significant pressure on remaining overs');
            insights.push('Technical or tactical issues in powerplay approach');
            insights.push('Risk of posting below-par total');
        }
        return insights;
    };

    const getRiskFactors = (runRate: number) => {
        const risks = [];
        if (runRate >= 10) {
            risks.push('High run rate may indicate excessive risk-taking - monitor wicket loss');
            risks.push('Sustainability of scoring rate in middle overs may be challenging');
            risks.push('Opposition may adjust tactics with defensive fields');
        } else if (runRate >= 8) {
            risks.push('Ensure wickets in hand to capitalize on strong start');
            risks.push('Maintain momentum without losing too many wickets');
        } else if (runRate >= 6) {
            risks.push('Moderate start requires acceleration in middle overs');
            risks.push('Risk of falling behind par score if run rate doesn\'t improve');
        } else if (runRate >= 4) {
            risks.push('Poor powerplay puts immense pressure on remaining overs');
            risks.push('High risk of posting below-par total');
            risks.push('Batsmen may take excessive risks to compensate, leading to wickets');
        } else {
            risks.push('Critical situation - very difficult to post competitive total');
            risks.push('Extremely high pressure on middle and death overs');
            risks.push('Team morale and confidence may be affected');
        }
        return risks;
    };

    const getProjectedScore = (runRate: number, oversPlayed: number) => {
        // Project to 50 overs (ODI) assuming run rate continues
        const remainingOvers = 50 - oversPlayed;
        const currentRuns = runRate * oversPlayed;
        // Assume slight decline in run rate for middle overs (realistic projection)
        const middleOversRate = runRate * 0.85;
        const projectedTotal = currentRuns + (remainingOvers * middleOversRate);
        return Math.round(projectedTotal);
    };

    const onSubmit = (values: FormValues) => {
        const rr = calculate(values);
        if (rr !== null) {
            setResult({
                runRate: rr,
                interpretation: interpret(rr),
                performanceLevel: getPerformanceLevel(rr),
                recommendation: getRecommendation(rr),
                rating: getRating(rr),
                insights: getInsights(rr),
                riskFactors: getRiskFactors(rr),
                projectedScore: getProjectedScore(rr, values.oversPlayed)
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
                        <h2 className="text-xl font-semibold">Powerplay Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter runs scored and overs played during powerplay to calculate run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="runsScored"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Runs Scored in Powerplay
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 55"
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
                                    name="oversPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Overs Played
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
                                Calculate Powerplay Run Rate
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
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Powerplay Run Rate</h2>
                                    <p className="text-muted-foreground">Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.runRate.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground mt-1">runs per over</p>
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
                                    <p className="font-semibold">Projected Total (ODI)</p>
                                    <p className="text-lg font-bold">{result.projectedScore}</p>
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
                                <CardDescription>Key takeaways from powerplay performance</CardDescription>
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
