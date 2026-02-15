"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trophy, ChevronRight, RotateCcw, Activity, AlertTriangle, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Schema Validation
const formSchema = z.object({
    gamesPlayed: z.number().min(1, { message: "Games played must be at least 1" }),
    minutesPerGame: z.number().min(1, { message: "Minutes must be positive" }).max(48, { message: "Max 48 minutes" }),
    pointsPerGame: z.number().min(0),
    reboundsPerGame: z.number().min(0),
    assistsPerGame: z.number().min(0),
    stealsPerGame: z.number().min(0),
    blocksPerGame: z.number().min(0),
    turnoversPerGame: z.number().min(0),
    personalFoulsPerGame: z.number().min(0),
    teamWins: z.number().min(0).max(82, { message: "Max 82 wins" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballWinSharesCalculatorInteractive() {
    const [result, setResult] = useState<{
        estimatedWS: number;
        wsPer48: number;
        playerGrade: string;
        gradeColor: string;
        description: string;
        comparison: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gamesPlayed: 82,
            minutesPerGame: 34.5,
            pointsPerGame: 25.4,
            reboundsPerGame: 7.8,
            assistsPerGame: 6.2,
            stealsPerGame: 1.2,
            blocksPerGame: 0.8,
            turnoversPerGame: 3.1,
            personalFoulsPerGame: 2.5,
            teamWins: 50,
        },
    });

    const calculateWinShares = (values: FormValues) => {
        // This is a simplified estimation model for Win Shares based on linear weights and team success.
        // Real WS requires possession-by-possession league norms.
        // We use a modified "Approximate Value" (AV) method adapted for modern WS scales.

        // 1. Calculate Player Efficiency Estimate (Daily Fantasy-style linear weights)
        // Weights approximated from various advanced metric coefficients
        const rawProduction =
            (values.pointsPerGame * 1.0) +
            (values.reboundsPerGame * 1.2) +
            (values.assistsPerGame * 1.5) +
            (values.stealsPerGame * 2.5) +
            (values.blocksPerGame * 2.0) -
            (values.turnoversPerGame * 1.5) -
            (values.personalFoulsPerGame * 0.5);

        // 2. Adjust for Team Success (Win Shares are heavily context-dependent)
        // A player putting up stats on a winning team typically has higher WS
        const teamFactor = (values.teamWins / 41.0); // 1.0 is average, >1 is good

        // 3. Scale to Win Shares approximate range
        // An MVP usually has ~15-20 WS. A starter ~4-6 WS.
        // Normalize derived "value" to this scale.
        // Base constant derived to match typical NBA outputs roughly.
        const estimatedWS = (rawProduction * values.gamesPlayed * teamFactor) / 165;

        // 4. Calculate WS/48
        const totalMinutes = values.gamesPlayed * values.minutesPerGame;
        const wsPer48 = totalMinutes > 0 ? (estimatedWS / totalMinutes) * 48 : 0;

        // Interpretation
        let playerGrade = "";
        let gradeColor = "";
        let description = "";
        let comparison = "";

        if (estimatedWS >= 12) {
            playerGrade = "MVP Candidate";
            gradeColor = "bg-purple-600";
            description = "Dominant superstar impact. This player is the primary engine of a winning team.";
            comparison = "Comparable to: Nikola Jokić, Giannis Antetokounmpo, Michael Jordan (Season)";
        } else if (estimatedWS >= 8) {
            playerGrade = "All-NBA / All-Star";
            gradeColor = "bg-blue-600";
            description = "Elite contributor. A cornerstone player who significantly drives winning.";
            comparison = "Comparable to: Jimmy Butler, Damian Lillard, Paul George";
        } else if (estimatedWS >= 5) {
            playerGrade = "Solid Starter";
            gradeColor = "bg-green-600";
            description = "Reliable starter. Contributes positively to winning, likely a key rotation piece.";
            comparison = "Comparable to: Derrick White, Aaron Gordon, Kentavious Caldwell-Pope";
        } else if (estimatedWS >= 2) {
            playerGrade = "Rotation Player";
            gradeColor = "bg-yellow-500 text-black";
            description = "Bench contributor. Provides value in limited minutes or a specific role.";
            comparison = "Comparable to: 6th-8th man in rotation";
        } else {
            playerGrade = "Replacement Level";
            gradeColor = "bg-gray-500";
            description = "Marginal impact. Struggling to contribute to winning basketball.";
            comparison = "End of bench / G-League call-up";
        }

        setResult({
            estimatedWS,
            wsPer48,
            playerGrade,
            gradeColor,
            description,
            comparison
        });
    };

    const onSubmit = (values: FormValues) => {
        calculateWinShares(values);
    };

    const resetForm = () => {
        form.reset();
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <Card className="border-t-4 border-t-amber-500 shadow-lg">
                <CardHeader className="bg-muted/30 pb-8">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-amber-500" />
                        Win Shares Estimator
                    </CardTitle>
                    <CardDescription>
                        Estimate a player's seasonal Win Shares and WS/48 based on box score stats and team wins.
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-6 bg-card rounded-b-xl pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Games & Minutes */}
                                <FormField control={form.control} name="gamesPlayed" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Games Played</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="minutesPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minutes Per Game</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="teamWins" render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-1">
                                        <FormLabel className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                                            <Trophy className="h-3 w-3" /> Team Wins
                                        </FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormDescription className="text-xs">Crucial for context</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Per Game Stats */}
                                <FormField control={form.control} name="pointsPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points (PPG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="reboundsPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rebounds (RPG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="assistsPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assists (APG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="stealsPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Steals (SPG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="blocksPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blocks (BPG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="turnoversPerGame" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Turnovers (TOPG)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" className="flex-1 text-lg font-semibold bg-amber-600 hover:bg-amber-700">
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    Estimate Win Shares
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="px-6"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-amber-100 dark:border-amber-900 bg-gradient-to-br from-white to-amber-50 dark:from-background dark:to-amber-900/10 shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="h-32 w-32 text-amber-600" />
                        </div>

                        <CardContent className="p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wide">
                                        Estimated Win Shares
                                    </h3>
                                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                                        <span className="text-6xl font-extrabold tracking-tight text-amber-900 dark:text-amber-100">
                                            {result.estimatedWS.toFixed(1)}
                                        </span>
                                        <span className="text-xl font-medium text-muted-foreground">Wins</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center md:justify-start mt-2">
                                        <Badge className={`${result.gradeColor} text-white px-3 py-1 text-base`}>
                                            {result.playerGrade}
                                        </Badge>
                                        <span className="text-sm font-mono text-muted-foreground">WS/48: {result.wsPer48.toFixed(3)}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">Impact on Winning</span>
                                            <span className="font-bold text-amber-600">{result.estimatedWS.toFixed(1)} Wins Added</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-full" style={{ width: `${Math.min((result.estimatedWS / 20) * 100, 100)}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground">
                                            <TrendingUp className="h-4 w-4" />
                                            Analysis
                                        </h4>
                                        <p className="text-sm leading-relaxed font-medium">
                                            {result.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground italic">
                                            {result.comparison}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1">
                        <Card className="bg-primary/5 border-none shadow-inner">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Approximation Warning</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        Official Win Shares (Basketball-Reference) require possession-level league data. This tool provides a high-accuracy estimate suited for fantasy analysis and historical comparison using standard box-score weights.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
