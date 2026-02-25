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
    perfectPasses: z.number().min(0, "Perfect passes must be non-negative"),
    goodPasses: z.number().min(0, "Good passes must be non-negative"),
    poorPasses: z.number().min(0, "Poor passes must be non-negative"),
    receptionErrors: z.number().min(0, "Reception errors must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballReceptionAccuracyCalculatorInteractive() {
    const [result, setResult] = useState<{
        passingAverage: number;
        efficiencyPercent: number;
        totalAttempts: number;
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
            perfectPasses: undefined,
            goodPasses: undefined,
            poorPasses: undefined,
            receptionErrors: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.perfectPasses == null || v.goodPasses == null || v.poorPasses == null || v.receptionErrors == null) return null;
        const total = v.perfectPasses + v.goodPasses + v.poorPasses + v.receptionErrors;
        if (total === 0) return { avg: 0, eff: 0, total: 0 };

        const passedScore = (v.perfectPasses * 3) + (v.goodPasses * 2) + (v.poorPasses * 1);
        const average = passedScore / total;
        const efficiency = ((v.perfectPasses + v.goodPasses) / total) * 100;

        return { avg: average, eff: efficiency, total: total };
    };

    const interpret = (avg: number) => {
        if (avg >= 2.40) return 'Elite reception; running a perfectly in-system offense consistently.';
        if (avg >= 2.15) return 'Highly accurate passing; keeping all offensive options open.';
        if (avg >= 1.90) return 'Solid reception average; forcing opponents to rely on blocking and defense.';
        if (avg >= 1.60) return 'Average passing; frequently relying on out-of-system pin attacks.';
        return 'Struggling reception; unable to establish middle attackers or run quick tempos.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg >= 2.40) return 'World Class';
        if (avg >= 2.15) return 'Elite';
        if (avg >= 1.90) return 'Good';
        if (avg >= 1.60) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (avg: number) => {
        if (avg >= 2.40) return 'Maintain exceptional platform tracking and early footwork to the ball.';
        if (avg >= 2.15) return 'Excellent accuracy. Focus on perfectly delivering the ball to the setter\'s exact target zone on jump top-spin serves.';
        if (avg >= 1.90) return 'Work on passing the ball higher and more centrally to keep the middle blocker as a viable attacking threat.';
        if (avg >= 1.60) return 'Focus on early platform presentation and moving your feet before contact to eliminate 1-point and 0-point shanks.';
        return 'Critical review needed. Focus exclusively on seeing the server\'s toss, taking a decisive first step, and freezing your platform on contact.';
    };

    const getRating = (avg: number) => {
        if (avg >= 2.40) return 'Outstanding';
        if (avg >= 2.15) return 'Excellent';
        if (avg >= 1.90) return 'Good';
        if (avg >= 1.60) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (avg: number) => {
        const insights = [];
        if (avg >= 2.15) {
            insights.push('Exceptional visual tracking of the float/spin trajectory');
            insights.push('Consistent, quiet platform on contact');
            insights.push('Allows the setter to utilize a multi-tempo offense');
        } else if (avg >= 1.90) {
            insights.push('Reliable serve-receive mechanics');
            insights.push('Capable of handling moderate to heavy service pressure');
            insights.push('Occasional platform swinging leading to 1-point passes');
        } else {
            insights.push('Frequent uncontrolled contacts (shanking)');
            insights.push('Struggling to anticipate serve depth and velocity');
            insights.push('Requires rigorous footwork and angle training');
        }
        return insights;
    };

    const getConsiderations = (avg: number) => {
        const considerations = [];
        considerations.push('A team passing above a 2.0 is statistically favored to win the set');
        considerations.push('Quality of the opponent\'s serve strictly dictates reception difficulty');
        considerations.push('Passing a 3-point ball on a top-spin jump serve is significantly harder than a standing float');
        considerations.push('The setter\'s mobility and reach can artificially inflate or depress perceived pass quality');
        considerations.push('A "perfect pass" is generally defined as arriving off the net, high in the air, in the middle third of the court');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const res = calculate(values);
        if (res !== null) {
            setResult({
                passingAverage: res.avg,
                efficiencyPercent: res.eff,
                totalAttempts: res.total,
                interpretation: interpret(res.avg),
                performanceLevel: getPerformanceLevel(res.avg),
                recommendation: getRecommendation(res.avg),
                rating: getRating(res.avg),
                insights: getInsights(res.avg),
                considerations: getConsiderations(res.avg)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Serve Receive Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter passes by quality (0-3 scale) to calculate your passing average.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="perfectPasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-green-600" />
                                                Perfect (3-Pt)
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
                                    name="goodPasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                Good (2-Pt)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
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
                                <FormField
                                    control={form.control}
                                    name="poorPasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                Poor (1-Pt)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 4"
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
                                    name="receptionErrors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                Error (0-Pt)
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
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Reception Accuracy
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && result.totalAttempts > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Passing Average</h2>
                                    <p className="text-muted-foreground">Based on {result.totalAttempts} receives</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.passingAverage.toFixed(2)}</p>
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
                                    <p className="font-semibold">In-System %</p>
                                    <p className="text-lg font-bold">{result.efficiencyPercent.toFixed(1)}%</p>
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
