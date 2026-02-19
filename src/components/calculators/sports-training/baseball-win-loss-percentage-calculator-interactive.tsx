'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Crown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Win-Loss Percentage
// Formula: Win % = Wins / (Wins + Losses + Ties)
const formSchema = z.object({
    wins: z.number().min(0, "Wins must be non-negative"),
    losses: z.number().min(0, "Losses must be non-negative"),
    ties: z.number().min(0, "Ties must be non-negative").optional().default(0),
}).refine(data => (data.wins + data.losses + (data.ties || 0)) > 0, {
    message: "Total games played must be greater than 0",
    path: ["wins"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballWinLossCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
        percentageString: string;
        totalGames: number;
        gamesAbove500: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        trend: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            wins: undefined,
            losses: undefined,
            ties: 0,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.wins == null || v.losses == null) return null;
        const ties = v.ties || 0;
        const totalGames = v.wins + v.losses + ties;

        if (totalGames === 0) return null;

        // Standard Win Percentage: Wins / Total Games
        // Note: Some formats use (Wins + 0.5 * Ties) / Total Games, but usually strict Win % is just W/Total.
        // We will use W / Total to represent the % of games won.
        const percentage = v.wins / totalGames;

        // Games above/below .500
        // Formula: Wins - Losses
        const gamesAbove500 = v.wins - v.losses;

        return {
            percentage,
            totalGames,
            gamesAbove500
        };
    };

    const interpret = (pct: number) => {
        if (pct >= 0.700) return 'Dynasty Caliber - Historic dominance.';
        if (pct >= 0.600) return 'Championship Contender - Elite performance.';
        if (pct >= 0.550) return 'Playoff Team - Strong winning culture.';
        if (pct >= 0.500) return 'Above Average - Winning record.';
        if (pct >= 0.450) return 'Mediocre - Hovering near .500.';
        if (pct >= 0.400) return 'Struggling - Rebuilding phase.';
        return 'Need Major Changes - Bottom of the standings.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 0.600) return 'Elite';
        if (pct >= 0.500) return 'Good';
        if (pct >= 0.400) return 'Average';
        if (pct >= 0.300) return 'Poor';
        return 'Critical';
    };

    const getRecommendation = (pct: number, gamesAbove: number) => {
        if (pct >= 0.600) return 'Maintain momentum. Rest starters in meaningless games if playoffs are secured.';
        if (pct >= 0.500) return 'Focus on winning series (2 out of 3). consistency is key to securing a playoff spot.';
        if (pct >= 0.400) return 'Analyze run differential. If positive, luck may turn. If negative, roster changes needed.';
        return 'Focus on player development and fundamentals. The current strategy is not yielding results.';
    };

    const getTrend = (gamesAbove: number) => {
        if (gamesAbove > 20) return 'Surging';
        if (gamesAbove > 0) return 'Positive';
        if (gamesAbove === 0) return 'Neutral';
        return 'Negative';
    };

    const getInsights = (pct: number, totalGames: number, gamesAbove: number) => {
        const insights = [];
        const winPctString = (pct * 100).toFixed(1) + '%';

        if (pct >= 0.500) {
            insights.push(`winning ${winPctString} of games puts you on pace for playoffs in most leagues.`);
            insights.push(`You are ${gamesAbove} games over .500.`);
        } else {
            insights.push(`Winning ${winPctString} of games indicates defensive or offensive struggles.`);
            insights.push(`You are ${Math.abs(gamesAbove)} games under .500.`);
        }

        const project162 = Math.round(pct * 162);
        insights.push(`Pace: ~${project162} wins in a 162-game MLB season.`);

        if (totalGames < 20) {
            insights.push('Sample size is small. One streak could drastically change this percentage.');
        }

        return insights;
    };

    const getConsiderations = (pct: number) => {
        const considerations = [];
        considerations.push('Strength of schedule is not factored in. 10-0 against weak teams is different from 10-0 against champs.');
        considerations.push('Run differential is often a better predictor of future success than current record.');
        considerations.push('Home/Away splits often result in vastly different winning percentages.');
        considerations.push('Injuries to key players can skew season-long percentages.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                percentage: resultValue.percentage,
                percentageString: resultValue.percentage.toFixed(3).replace(/^0+/, ''),
                totalGames: resultValue.totalGames,
                gamesAbove500: resultValue.gamesAbove500,
                interpretation: interpret(resultValue.percentage),
                performanceLevel: getPerformanceLevel(resultValue.percentage),
                recommendation: getRecommendation(resultValue.percentage, resultValue.gamesAbove500),
                trend: getTrend(resultValue.gamesAbove500),
                insights: getInsights(resultValue.percentage, resultValue.totalGames, resultValue.gamesAbove500),
                considerations: getConsiderations(resultValue.percentage)
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
                        <h2 className="text-xl font-semibold">Team Record</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your team stats to calculate Winning Percentage and Games Above .500
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="wins"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Wins (W)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 50"
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
                                    name="losses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Losses (L)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 30"
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
                                    name="ties"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Ties (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 0"
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
                                Calculate Winning Percentage
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
                                <Crown className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Winning Percentage</h2>
                                    <p className="text-muted-foreground">{result.totalGames} Games Played</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.percentageString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Games Above .500</p>
                                    <p className={`text-lg font-bold ${result.gamesAbove500 > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {result.gamesAbove500 > 0 ? "+" : ""}{result.gamesAbove500}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Win Rate</p>
                                    <p className="text-lg font-bold">{(result.percentage * 100).toFixed(1)}%</p>
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
                                <CardDescription>Performance Indicators</CardDescription>
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
                                    Context & Limitations
                                </CardTitle>
                                <CardDescription>Beyond the Record</CardDescription>
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
