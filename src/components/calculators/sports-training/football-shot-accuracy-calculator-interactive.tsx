'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Calculator, BarChart3, Info, CheckCircle2, Activity, Target, Shield, Crosshair } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    shotsOnTarget: z.number().min(0, { message: 'Shots must be 0 or more' }),
    shotsOffTarget: z.number().min(0, { message: 'Shots must be 0 or more' }),
    blockedShots: z.number().min(0, { message: 'Shots must be 0 or more' }),
    goalsScored: z.number().min(0, { message: 'Goals cannot be negative' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballShotAccuracyCalculatorInteractive() {
    const [result, setResult] = useState<{
        accuracy: number;
        totalShots: number;
        conversionRate: number;
        rating: string;
        interpretation: string;
        recommendation: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            shotsOnTarget: 0,
            shotsOffTarget: 0,
            blockedShots: 0,
            goalsScored: 0,
        },
    });

    const calculateStats = (values: FormValues) => {
        const totalShots = values.shotsOnTarget + values.shotsOffTarget + values.blockedShots;

        if (totalShots === 0) return null;

        const accuracy = (values.shotsOnTarget / totalShots) * 100;
        const conversionRate = (values.goalsScored / totalShots) * 100;

        // Accuracy Rating Logic
        let rating = '';
        if (accuracy >= 60) rating = 'Excellent';
        else if (accuracy >= 40) rating = 'Good';
        else if (accuracy >= 25) rating = 'Average';
        else rating = 'Poor';

        // Interpretation
        let interpretation = '';
        if (accuracy >= 60) interpretation = 'Forward is effectively testing the goalkeeper with almost every attempt.';
        else if (accuracy >= 40) interpretation = 'Solid accuracy. Consistent threat, forcing saves regularly.';
        else if (accuracy >= 25) interpretation = 'Inconsistent. Too many shots are missing the target completely.';
        else interpretation = 'Wasteful. Most shots are blocked or missing, ending attacks prematurely.';

        // Recommendation
        let recommendation = '';
        if (accuracy < 30) recommendation = 'Focus on "placement over power". Aim for corners rather than trying to blast it.';
        else if (accuracy > 60 && conversionRate < 10) recommendation = 'Accuracy is high but goals are low. You might be shooting too centrally or from too far (easy saves).';
        else if (values.blockedShots > values.shotsOnTarget) recommendation = 'Too many blocks! Work on creating space before shooting (feints, drop shoulder).';
        else recommendation = 'Keep up the current form. Focus on maintaining composure.';

        // Insights
        const insights = [];
        if (values.blockedShots > (totalShots * 0.4)) {
            insights.push('High blocked shot count suggests hesitation or poor spacing');
        }
        if (conversionRate > 25) {
            insights.push('Exceptionally clinical finishing (High Goal/Shot ratio)');
        }
        if (accuracy > 50) {
            insights.push('Ideally testing the keeper on the majority of attempts');
            insights.push('Forces defensive errors and rebounds');
        }
        if (values.shotsOffTarget > values.shotsOnTarget) {
            insights.push('More misses than saves forced - urgency needed');
        }

        // Risks
        const risks = [];
        if (accuracy < 25) {
            risks.push('Attacks break down without testing the defense');
            risks.push('Confidence likely drops with repeated misses');
        }
        if (conversionRate < 5 && totalShots > 10) {
            risks.push('Very low conversion suggests shooting from bad locations (Low xG)');
        }
        if (values.blockedShots > 5) {
            risks.push('Predictability allows defenders to close down easily');
        }

        return {
            accuracy,
            totalShots,
            conversionRate,
            rating,
            interpretation,
            recommendation,
            insights: insights.slice(0, 4),
            riskFactors: risks.slice(0, 4)
        };
    };

    const onSubmit = (values: FormValues) => {
        const stats = calculateStats(values);
        if (stats) setResult(stats);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crosshair className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Shooting Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter shot data to analyze accuracy and efficiency.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="shotsOnTarget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shots On Target</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Goals + Saves"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>Includes goals and saves.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shotsOffTarget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shots Off Target</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Missed shots"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>Missed wide or high.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="blockedShots"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blocked Shots</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Blocked by defenders"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>Hits a defender (not keeper).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="goalsScored"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Goals Scored</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Total goals"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>Used for conversion context.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Shot Accuracy
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Shooting Analysis Result</h2>
                                    <p className="text-muted-foreground">Accuracy & Efficiency Breakdown</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary">
                                <p className="text-sm text-muted-foreground mb-2">Shot Accuracy</p>
                                <p className="text-6xl font-bold text-primary">{result.accuracy.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-3">
                                    {result.totalShots} Total Attempts
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Rating</p>
                                    <Badge variant={result.rating === 'Excellent' ? 'default' : result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Conversion Rate</p>
                                    <p className="text-lg font-bold">{result.conversionRate.toFixed(1)}%</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Goals</p>
                                    <p className="text-lg font-bold">{form.getValues('goalsScored')}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Feedback:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <CheckCircle2 className="h-6 w-6" />
                                    Positive Indicators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium">{insight}</span>
                                    </div>
                                ))}
                                {result.insights.length === 0 && <p className="text-sm text-muted-foreground">No specific positive indicators found.</p>}
                            </CardContent>
                        </Card>

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                                    </div>
                                ))}
                                {result.riskFactors.length === 0 && <p className="text-sm text-muted-foreground">No critical risks identified.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
