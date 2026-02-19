'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Trophy, Calculator, BarChart3, Shield, Info, CheckCircle2, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    currentRating: z.number().min(0, "Rating must be non-negative").max(3000, "Rating typically stays below 3000"),
    opponentRating: z.number().min(0, "Rating must be non-negative").max(3000, "Rating typically stays below 3000"),
    kFactor: z.string().min(1, "Please select a match level"),
    result: z.string().min(1, "Please select a result"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisEloRatingCalculatorInteractive() {
    const [result, setResult] = useState<{
        newRating: number;
        ratingChange: number;
        winProbability: number;
        currentRating: number;
        opponentRating: number;
        interpretation: string;
        ratingCategory: string;
        recommendation: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentRating: 1500,
            opponentRating: 1500,
            kFactor: "32",
            result: "1",
        },
    });

    const calculate = (v: FormValues) => {
        const Ra = v.currentRating;
        const Rb = v.opponentRating;
        const K = parseInt(v.kFactor);
        const actualScore = parseFloat(v.result);

        // Expected score formula: E = 1 / (1 + 10^((Rb - Ra) / 400))
        const expectedScore = 1 / (1 + Math.pow(10, (Rb - Ra) / 400));

        // New Rating formula: R' = R + K * (S - E)
        const ratingChange = K * (actualScore - expectedScore);
        const newRating = Ra + ratingChange;

        return {
            newRating,
            ratingChange,
            winProbability: expectedScore * 100, // as percentage
            currentRating: Ra,
            opponentRating: Rb
        };
    };

    const interpret = (rating: number) => {
        if (rating >= 2500) return 'World Class / Grand Slam Level';
        if (rating >= 2200) return 'Professional Tour Level';
        if (rating >= 2000) return 'Semi-Professional / Challenger Level';
        if (rating >= 1800) return 'Advanced Club / National Level';
        if (rating >= 1500) return 'Intermediate Club Level';
        return 'Beginner / Recreational Level';
    };

    const getRatingCategory = (rating: number) => {
        if (rating >= 2400) return 'Elite';
        if (rating >= 2100) return 'Professional';
        if (rating >= 1800) return 'Advanced';
        if (rating >= 1500) return 'Intermediate';
        return 'Recreational';
    };

    const getRecommendation = (ratingChange: number, winProb: number, actualScore: number) => {
        if (actualScore === 1) { // Won
            if (winProb < 40) return "Great upset! Beating a higher-rated opponent significantly boosts your rating. Analyze what tactics worked.";
            if (winProb > 60) return "Expected win. To gain more points, focus on consistent performance against higher-rated players.";
            return "Solid victory against a peer. Consistency in these matches builds the foundation for moving up.";
        } else { // Lost
            if (winProb > 60) return "Upset loss. Analyze if mental pressure or specific matchups caused this. Vital to bounce back.";
            if (winProb < 40) return "Expected loss against a stronger opponent. Use this as a learning experience for higher-level pace.";
            return "Close loss against a peer. Small details defined this match. Focus on fitness and closing out sets.";
        }
    };

    const getInsights = (winProb: number, ratingChange: number, resultValue: number) => {
        const insights = [];

        if (winProb > 75) {
            insights.push('You were the heavy favorite.');
            insights.push('Pressure to win was high.');
        } else if (winProb < 25) {
            insights.push('You were the underdog.');
            insights.push('Low pressure, high reward opportunity.');
        } else {
            insights.push('Evenly matched contest.');
            insights.push('Outcome depended on daily form.');
        }

        if (Math.abs(ratingChange) > 20) {
            insights.push('High volatility match (High K-factor).');
            insights.push('Significant impact on rankings.');
        }

        if (resultValue === 1) {
            insights.push('Confidence booster.');
        } else {
            insights.push('Opportunity for analysis.');
        }

        return insights;
    };

    const getRiskFactors = (kFactor: string) => {
        const k = parseInt(kFactor);
        const risks = [];

        if (k >= 30) {
            risks.push('High rating volatility (K-factor ' + k + ').');
            risks.push('A string of losses can drop rating quickly.');
        }

        risks.push('Elo assumes constant form, which ignores injury/fatigue.');
        risks.push('Does not account for surface preference (Clay vs Grass).');
        risks.push('Matchup styles not factored in mathematical probability.');

        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const calculation = calculate(values);
        if (calculation) {
            setResult({
                ...calculation,
                interpretation: interpret(calculation.newRating),
                ratingCategory: getRatingCategory(calculation.newRating),
                recommendation: getRecommendation(calculation.ratingChange, calculation.winProbability, parseFloat(values.result)),
                insights: getInsights(calculation.winProbability, calculation.ratingChange, parseFloat(values.result)),
                riskFactors: getRiskFactors(values.kFactor)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Details</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter current ratings and match result to update Elo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="currentRating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Your Rating
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 1500"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="opponentRating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Opponent's Rating
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 1600"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="kFactor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Match Level (K-Factor)
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="10">Grand Slam / Professional (K=10)</SelectItem>
                                                    <SelectItem value="20">Regional / Tour Level (K=20)</SelectItem>
                                                    <SelectItem value="32">Club / Recreational (K=32)</SelectItem>
                                                    <SelectItem value="40">Junior / Provisional (K=40)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="result"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Match Result
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select result" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Win (1.0)</SelectItem>
                                                    <SelectItem value="0">Loss (0.0)</SelectItem>
                                                    <SelectItem value="0.5">Draw (0.5) - Rare</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate New Rating
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
                                    <h2 className="text-2xl font-bold">New Elo Rating</h2>
                                    <p className="text-muted-foreground">Updated Performance Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{Math.round(result.newRating)}</p>
                                <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full ${result.ratingChange >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {result.ratingChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                                    <span className="font-semibold">{result.ratingChange >= 0 ? '+' : ''}{result.ratingChange.toFixed(1)} points</span>
                                </div>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Calculated Category</p>
                                    <Badge variant={result.ratingCategory === 'Elite' ? 'default' : result.ratingCategory === 'Professional' ? 'secondary' : result.ratingCategory === 'Advanced' ? 'outline' : 'secondary'}>
                                        {result.ratingCategory}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Win Probability</p>
                                    <p className="text-lg font-bold">{(result.winProbability).toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">Pre-match expectation</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold">Rating Delta</p>
                                    <p className="text-lg font-bold text-orange-600">{Math.abs(result.currentRating - result.opponentRating)} pts</p>
                                    <p className="text-xs text-muted-foreground">Difference</p>
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

                    {/* Smart Insights & Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Trophy className="h-6 w-6" />
                                    Match Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from this result</CardDescription>
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
                                <CardDescription>Limitations of Elo</CardDescription>
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
