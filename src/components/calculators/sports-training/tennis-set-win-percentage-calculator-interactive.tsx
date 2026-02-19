'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, XCircle, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    setsWon: z.number().min(0, "Sets won must be non-negative"),
    setsLost: z.number().min(0, "Sets lost must be non-negative"),
    matchesWon: z.number().min(0).optional(),
    matchesPlayed: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisSetWinPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
        totalSets: number;
        rating: string;
        level: string;
        interpretation: string;
        recommendation: string;
        insights: string[];
        metrics: { label: string; value: string; icon: any; color: string }[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            setsWon: undefined,
            setsLost: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.setsWon === undefined || v.setsLost === undefined) return null;

        const won = v.setsWon;
        const lost = v.setsLost;
        const total = won + lost;

        if (total === 0) return null;

        const percentage = (won / total) * 100;

        return {
            percentage,
            won,
            lost,
            total
        };
    };

    const getRating = (pct: number) => {
        if (pct >= 80) return 'Dominant';
        if (pct >= 60) return 'Excellent';
        if (pct >= 50) return 'Solid';
        if (pct >= 40) return 'Competitive';
        return 'Struggling';
    };

    const getLevel = (pct: number) => {
        if (pct >= 75) return 'Elite Performance';
        if (pct >= 60) return 'High Performance';
        if (pct >= 45) return 'Average Performance';
        return 'Needs Improvement';
    };

    const getInterpretation = (pct: number) => {
        if (pct >= 80) return "You are consistently outplaying your opponents, winning the vast majority of sets played.";
        if (pct >= 60) return "You have a strong winning record in sets, indicating superior consistency and closing ability.";
        if (pct >= 50) return "You are evenly matched with your competition, winning as often as you lose.";
        if (pct >= 40) return "You are competitive in matches but struggle to convert good play into set wins.";
        return "You are finding it difficult to win sets at this level.";
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 70) return "Consider playing higher-rated opponents or moving up a division to challenge yourself.";
        if (pct >= 55) return "Focus on maintaining mental focus to convert dominance into match wins.";
        if (pct >= 45) return "Work on winning 'big points' (break points, tiebreaks) to turn close sets into wins.";
        if (pct >= 30) return "Analyze your serve and return game. Improve basic consistency to elevate set win rate.";
        return "Focus on fundamentals and fitness. Don't worry about score, worry about technique.";
    };

    const getInsights = (pct: number, won: number, lost: number) => {
        const insights = [];
        const ratio = lost === 0 ? won : won / lost;

        if (pct > 50) {
            insights.push(`Winning ${ratio.toFixed(1)} sets for every set lost.`);
        } else {
            insights.push(`Losing ${(1 / ratio).toFixed(1)} sets for every set won.`);
        }

        if (pct > 66.6) { // Winning 2/3 sets roughly
            insights.push('Likely winning majority of matches in straight sets.');
        } else if (pct > 50 && pct < 55) {
            insights.push('Many matches likely going to deciding sets.');
        }

        if (pct < 40 && pct > 20) {
            insights.push('Competitive but often losing tight sets.');
        }

        return insights;
    };

    const onSubmit = (values: FormValues) => {
        const data = calculate(values);
        if (data) {
            setResult({
                percentage: data.percentage,
                totalSets: data.total,
                rating: getRating(data.percentage),
                level: getLevel(data.percentage),
                interpretation: getInterpretation(data.percentage),
                recommendation: getRecommendation(data.percentage),
                insights: getInsights(data.percentage, data.won, data.lost),
                metrics: [
                    { label: 'Sets Won', value: data.won.toString(), icon: CheckCircle2, color: 'text-green-600' },
                    { label: 'Sets Lost', value: data.lost.toString(), icon: XCircle, color: 'text-red-600' },
                    { label: 'Total Sets', value: data.total.toString(), icon: PieChart, color: 'text-blue-600' },
                ]
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Set Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your set records to calculate win percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="setsWon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Sets Won
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 45"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="setsLost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4" />
                                                Sets Lost
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 20"
                                                    {...field}
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
                                Calculate Set Win Percentage
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
                                <PieChart className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Set Win Percentage</h2>
                                    <p className="text-muted-foreground">Efficiency Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.percentage.toFixed(1)}%</p>
                                <Progress value={result.percentage} className="h-2 w-full mt-4" />
                                <p className="text-lg text-muted-foreground mt-4">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {result.metrics.map((metric, index) => (
                                    <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                                        <metric.icon className={`h-6 w-6 mx-auto mb-2 ${metric.color}`} />
                                        <p className="font-semibold">{metric.label}</p>
                                        <p className="text-lg font-bold">{metric.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <Badge variant={result.rating === 'Dominant' ? 'default' : result.rating === 'Excellent' ? 'secondary' : 'outline'} className="text-lg py-1 px-4">
                                    {result.rating}
                                </Badge>
                                <Badge variant="outline" className="text-lg py-1 px-4">
                                    {result.level}
                                </Badge>
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
                                    Key Insights
                                </CardTitle>
                                <CardDescription>Statistical takeaways</CardDescription>
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

                        <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Risk Factors
                                </CardTitle>
                                <CardDescription>Potential issues</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        High set win % doesn't guarantee match wins if you lose close deciding sets.
                                    </span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        Low sample size (fewer than 10 matches) can lead to misleading percentages.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
