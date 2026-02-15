'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, TrendingDown, Activity, Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    leagueType: z.enum(["38", "34", "46", "30"], {
        required_error: "Select a league format",
    }),
    currentPoints: z.number().min(0, "Points cannot be negative").max(120, "Points seem realistically high"),
    gamesPlayed: z.number().min(1, "Must have played at least 1 game"),
    goalDifference: z.number().int(),
    targetPoints: z.number().optional(), // e.g., needed for title or safety
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballLeagueStandingProbabilityCalculatorInteractive() {
    const [result, setResult] = useState<{
        ppg: number;
        projectedPoints: number;
        maxPoints: number;
        minPoints: number;
        winRate: number;
        formGuide: string;
        probabilityTitle: number; // estimated
        probabilityRelegation: number; // estimated
        insights: string[];
        rating: string;
        recommendation: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            leagueType: "38",
            currentPoints: undefined,
            gamesPlayed: undefined,
            goalDifference: undefined,
        },
    });

    const calculate = (values: FormValues) => {
        const totalGames = parseInt(values.leagueType);
        const { currentPoints, gamesPlayed } = values;

        if (gamesPlayed > totalGames) {
            form.setError("gamesPlayed", { message: "Games played cannot exceed total games" });
            return;
        }

        const remainingGames = totalGames - gamesPlayed;
        const ppg = currentPoints / gamesPlayed;
        const winRate = (currentPoints / (gamesPlayed * 3)) * 100;

        // Projections
        const projectedPoints = Math.round(currentPoints + (ppg * remainingGames));
        const maxPoints = currentPoints + (remainingGames * 3);
        const minPoints = currentPoints; // Lose all remaining

        // Heuristic Probabilities (Baselined on typical Top 5 Leagues)
        // Title avg ~ 86-90pts. Relegation Safety ~ 36-40pts.
        let titleThreshold = 86;
        let safetyThreshold = 38;

        if (totalGames === 46) { // Championship style
            titleThreshold = 90;
            safetyThreshold = 45;
        } else if (totalGames === 34) { // Bundesliga
            titleThreshold = 78;
            safetyThreshold = 34;
        }

        // Simple sigmoid-like estimation for probability
        const probTitle = Math.max(0, Math.min(100, ((projectedPoints - (titleThreshold - 10)) / 20) * 100)); // Rough curve around 86

        // Relegation chance: 100% if projected < safety - buffer, 0% if > safety + buffer
        const probRelegation = Math.max(0, Math.min(100, ((safetyThreshold + 5 - projectedPoints) / 15) * 100));

        let formGuide = "Inconsistent";
        if (ppg >= 2.0) formGuide = "Championship Form";
        else if (ppg >= 1.5) formGuide = "European Contender";
        else if (ppg >= 1.1) formGuide = "Mid-Table Stability";
        else formGuide = "Relegation Battle";

        let rating = "Average";
        if (probTitle > 50) rating = "Title Favorite";
        else if (probTitle > 10) rating = "Contender";
        else if (probRelegation > 50) rating = "Relegation Zone";
        else if (probRelegation > 20) rating = "At Risk";

        // Insights
        const insights = [];
        insights.push(`Currently securing ${ppg.toFixed(2)} points per game.`);
        if (remainingGames > 0) {
            insights.push(`Max possible finish: ${maxPoints} points.`);
            insights.push(`Projecting ${projectedPoints} points based on current form.`);
        } else {
            insights.push("Season completed.");
        }

        if (winRate > 60) insights.push("Dominant win rate.");
        if (values.goalDifference > 20) insights.push("Superior goal difference is a huge advantage.");
        if (values.goalDifference < -15) insights.push("Defensive issues are critical risks.");

        // Recommendation
        let recommendation = "";
        if (probTitle > 40) recommendation = "Maintain squad rotation to avoid fatigue. Title is within reach.";
        else if (probRelegation > 40) recommendation = "Immediate tactical changes needed. Focus on defensive solidity to scrap points.";
        else if (ppg > 1.3 && ppg < 1.8) recommendation = "Push for European spots. Turn draws into wins.";
        else recommendation = "Focus on consistency to secure league status comfortably.";

        setResult({
            ppg,
            projectedPoints,
            maxPoints,
            minPoints,
            winRate,
            formGuide,
            probabilityTitle: Math.round(probTitle),
            probabilityRelegation: Math.round(probRelegation),
            insights,
            rating,
            recommendation
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">League Performance Data</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter team statistics to project season finish and probabilities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="leagueType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>League Format</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select league games" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="38">38 Games (EPL, La Liga, Serie A)</SelectItem>
                                                    <SelectItem value="34">34 Games (Bundesliga)</SelectItem>
                                                    <SelectItem value="46">46 Games (EFL Championship)</SelectItem>
                                                    <SelectItem value="30">30 Games (Smaller Leagues)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Current Points</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="25" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gamesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Games Played</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="15" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="goalDifference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Swords className="h-4 w-4" /> Goal Difference</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="+5 or -3" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Project Standings
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
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Season Projection</h2>
                                    <p className="text-muted-foreground">Based on current PPG of {result.ppg.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-muted/50 rounded-lg border-t-4 border-t-yellow-500">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Projected Points</p>
                                    <p className="text-4xl font-bold">{result.projectedPoints}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Expected Finish</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg border-t-4 border-t-green-500">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Max Possible</p>
                                    <p className="text-4xl font-bold">{result.maxPoints}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Mathematical Ceiling</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg border-t-4 border-t-red-500">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Relegation Risk</p>
                                    <p className="text-4xl font-bold">{result.probabilityRelegation}%</p>
                                    <Badge variant={result.probabilityRelegation > 30 ? "destructive" : "outline"} className="mt-2">
                                        {result.probabilityRelegation > 50 ? "High Risk" : result.probabilityRelegation > 20 ? "Moderate" : "Low Risk"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Title Probability</span>
                                        <span className="text-sm font-bold text-primary">{result.probabilityTitle}%</span>
                                    </div>
                                    <Progress value={result.probabilityTitle} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Win Rate</span>
                                        <span className="text-sm font-bold text-green-600">{result.winRate.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={result.winRate} className="h-2 bg-secondary" indicatorClassName="bg-green-500" />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <TrendingUp className="h-6 w-6" />
                                    Smart Insights
                                </CardTitle>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">Injuries to key players can drastically drop PPG.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">Fixture difficulty usually increases late season.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">Cup competitions may cause league form variance.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
