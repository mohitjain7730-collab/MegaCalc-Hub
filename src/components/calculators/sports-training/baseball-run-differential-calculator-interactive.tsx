'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Skull } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Run Differential
// Formula: Diff = Runs Scored - Runs Allowed
const formSchema = z.object({
    runsScored: z.number().min(0, "Runs Scored must be non-negative"),
    runsAllowed: z.number().min(0, "Runs Allowed must be non-negative"),
    gamesPlayed: z.number().optional(), // Optional for projecting expected wins
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballRunDifferentialCalculatorInteractive() {
    const [result, setResult] = useState<{
        differential: number;
        differentialString: string;
        pythagoreanWinPct: string;
        expectedWins162: string;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsScored: undefined,
            runsAllowed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.runsScored == null || v.runsAllowed == null) return null;

        const diff = v.runsScored - v.runsAllowed;

        // Pythagorean Expectation Formula (using 1.83 exponent)
        // Win % = RS^1.83 / (RS^1.83 + RA^1.83)
        const exponent = 1.83;
        const numerator = Math.pow(v.runsScored, exponent);
        const denominator = numerator + Math.pow(v.runsAllowed, exponent);

        // Handle edge case where both are 0
        const pythagWinPct = (v.runsScored === 0 && v.runsAllowed === 0) ? 0.500 : (numerator / denominator);

        const expectedWins = pythagWinPct * 162;

        return {
            diff,
            pythagWinPct,
            expectedWins
        };
    };

    const interpret = (diff: number, pythag: number) => {
        if (diff > 200) return 'Dominant Team - Historic dominance, likely 100+ wins.';
        if (diff > 100) return 'Elite Contender - World Series favorite purely by performance.';
        if (diff > 50) return 'Playoff Caliber - Strong team likely to make postseason.';
        if (diff > 0) return 'Above Average - Fighting for a Wild Card spot.';
        if (diff > -50) return 'Average / Mediocre - Hovering around .500.';
        if (diff > -100) return 'Rebuilding - Likely selling at the trade deadline.';
        return 'Tanking / Struggling - Bottom of the league.';
    };

    const getPerformanceLevel = (diff: number) => {
        if (diff >= 100) return 'Elite';
        if (diff >= 20) return 'Contender';
        if (diff >= -20) return 'Average';
        if (diff >= -100) return 'Struggling';
        return 'Poor';
    };

    const getRecommendation = (diff: number, pythag: number) => {
        const winPct = (pythag * 100).toFixed(1);
        if (diff > 0) return `Based on your runs, you should be winning ${winPct}% of games. If actual wins are lower, you may be "unlucky" in close games.`;
        return `Your run production suggests a ${winPct}% win rate. If you are winning more than this, you are "lucky" and regression may be coming.`;
    };

    const getInsights = (diff: number, pythag: number) => {
        const insights = [];
        if (diff > 0) {
            insights.push(`Positive Differential (+${diff}): You score more than you allow.`);
            insights.push('Typically indicates a team with strong sustainable pitching or offense.');
            insights.push('Teams with this profile rarely miss playoffs over long samples.');
        } else if (diff < 0) {
            insights.push(`Negative Differential (${diff}): You allow more runs than you score.`);
            insights.push('Even if record is good, this is a "red flag" for future collapse.');
            insights.push('Likely issues in bullpen or blowout losses.');
        } else {
            insights.push('Perfectly Balanced (0): True .500 team performance.');
        }

        if (Math.abs(diff) < 20) {
            insights.push('Result is very close to neutral. One blowout game could flip the sign.');
        }
        return insights;
    };

    const getConsiderations = (diff: number) => {
        const considerations = [];
        considerations.push('Run Differential treats a 10-0 win the same as ten 1-0 wins, but the 1-0 wins are harder to sustain.');
        considerations.push('Blowout games can skew the differential (e.g., winning 20-1 once, losing 2-3 ten times).');
        considerations.push('Does not account for "Clutch" performance or bullpen management in tight games.');
        considerations.push('Pythagorean expectation is predictive, not descriptive of the past standings.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                differential: resultValue.diff,
                differentialString: resultValue.diff > 0 ? `+${resultValue.diff}` : `${resultValue.diff}`,
                pythagoreanWinPct: resultValue.pythagWinPct.toFixed(3).replace(/^0+/, ''),
                expectedWins162: resultValue.expectedWins.toFixed(1),
                interpretation: interpret(resultValue.diff, resultValue.pythagWinPct),
                performanceLevel: getPerformanceLevel(resultValue.diff),
                recommendation: getRecommendation(resultValue.diff, resultValue.pythagWinPct),
                insights: getInsights(resultValue.diff, resultValue.pythagWinPct),
                considerations: getConsiderations(resultValue.diff)
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
                        <h2 className="text-xl font-semibold">Team Runs Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter total runs scored and allowed for the season
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
                                                <TrendingUp className="h-4 w-4" />
                                                Runs Scored (RS)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 750"
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
                                    name="runsAllowed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Runs Allowed (RA)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 680"
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
                                Calculate Run Differential
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
                                    <h2 className="text-2xl font-bold">Run Differential</h2>
                                    <p className="text-muted-foreground">Team Strength Indicator</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className={`text-4xl font-bold ${result.differential > 0 ? 'text-green-600' : result.differential < 0 ? 'text-red-600' : 'text-primary'}`}>
                                    {result.differentialString}
                                </p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Pythagorean Win %</p>
                                    <p className="text-lg font-bold">{result.pythagoreanWinPct}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Expected Wins (162)</p>
                                    <p className="text-lg font-bold">{result.expectedWins162}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Status</p>
                                    <Badge variant={result.differential > 0 ? 'default' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Projection:</strong> {result.recommendation}
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
                                <CardDescription>What the numbers say</CardDescription>
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
                                    <Skull className="h-6 w-6" />
                                    Limits of the Pythagorean
                                </CardTitle>
                                <CardDescription>Why real wins might differ</CardDescription>
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
