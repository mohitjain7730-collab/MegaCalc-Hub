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
    wins: z.number().min(0, "Wins must be non-negative"),
    draws: z.number().min(0, "Draws must be non-negative").optional(),
    losses: z.number().min(0, "Losses must be non-negative"),
    matchesPlayed: z.number().min(1, "Matches played must be at least 1"),
}).refine((data) => {
    const totalInput = data.wins + (data.draws || 0) + data.losses;
    return totalInput <= data.matchesPlayed;
}, {
    message: "Wins + Draws + Losses cannot exceed Returns Played",
    path: ["matchesPlayed"],
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballWinRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        winRate: number;
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
            matchesPlayed: undefined,
            wins: undefined,
            draws: 0,
            losses: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.matchesPlayed === 0) return 0;
        return (v.wins / v.matchesPlayed) * 100;
    };

    const interpret = (rate: number) => {
        if (rate >= 60) return 'Championship-winning form. Dominant performance.';
        if (rate >= 50) return 'Strong performance. Likely to finish in European spots.';
        if (rate >= 40) return 'Solid mid-table performance. Reliable but not spectacular.';
        if (rate >= 30) return 'Struggling form. Risk of relegation battle.';
        return 'Relegation form. Critical improvement needed immediately.';
    };

    const getPerformanceLevel = (rate: number) => {
        if (rate >= 60) return 'World Class';
        if (rate >= 50) return 'Elite';
        if (rate >= 40) return 'Good';
        if (rate >= 30) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (rate: number) => {
        if (rate >= 60) return 'Maintain tactical consistency and manage player fatigue to sustain this level.';
        if (rate >= 50) return 'Turn draws into wins by improving attacking efficiency in the final third.';
        if (rate >= 40) return 'Focus on defensive solidity to ensure narrow leads are protected.';
        if (rate >= 30) return 'Review tactical setup and consider squad rotation to arrest the slide.';
        return 'Major overhaul required. Focus on basics, defensive organization, and morale.';
    };

    const getRating = (rate: number) => {
        if (rate >= 60) return 'Outstanding';
        if (rate >= 50) return 'Excellent';
        if (rate >= 40) return 'Good';
        if (rate >= 30) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate >= 60) {
            insights.push('High probability of winning titles');
            insights.push('Feared by opposition teams');
            insights.push('Excellent squad depth and management');
        } else if (rate >= 50) {
            insights.push('Strong contender for top honors');
            insights.push('Consistent performance week-in, week-out');
            insights.push('Good balance between attack and defense');
        } else if (rate >= 40) {
            insights.push('Capable of beating top teams on their day');
            insights.push('Stable league position likely');
            insights.push('Needs more consistency to challenge higher');
        } else if (rate >= 30) {
            insights.push('Inconsistent results patterns');
            insights.push('Vulnerable against strong opposition');
            insights.push('Struggling to close out games');
        } else {
            insights.push('High risk of relegation');
            insights.push('Significant tactical or personnel issues');
            insights.push('Urgent need for strategic change');
        }
        return insights;
    };

    const getConsiderations = (rate: number) => {
        const considerations = [];
        considerations.push('League difficulty affects expected win rates');
        considerations.push('Home vs Away form variance');
        considerations.push('Cup competitions vs League consistency');
        considerations.push('Injury crisis or squad availability');
        considerations.push('Strength of schedule (recent opponents)');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        setResult({
            winRate: rate,
            interpretation: interpret(rate),
            performanceLevel: getPerformanceLevel(rate),
            recommendation: getRecommendation(rate),
            rating: getRating(rate),
            insights: getInsights(rate),
            considerations: getConsiderations(rate)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter matches played, won, drawn, and lost
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="matchesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Matches Played
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 38"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="wins"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Wins
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 20"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="draws"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Draws (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 10"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="losses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Losses
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 8"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Win Rate
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
                                    <h2 className="text-2xl font-bold">Win Rate</h2>
                                    <p className="text-muted-foreground">Season Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.winRate.toFixed(2)}%</p>
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
                                    <p className="font-semibold">Trend Indicator</p>
                                    <p className="text-lg font-bold">{result.winRate >= 50 ? 'Positive' : 'Concerning'}</p>
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
                                    Key Takeaways
                                </CardTitle>
                                <CardDescription>Strategic insights based on data</CardDescription>
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
                                <CardDescription>Variables to watch</CardDescription>
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
