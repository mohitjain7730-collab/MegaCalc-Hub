"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Target, ChevronRight, RotateCcw, Activity, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
    pointsScored: z.number().min(0, { message: "Points must be positive" }),
    fieldGoalAttempts: z.number().min(0, { message: "FGA must be positive" }),
    freeThrowAttempts: z.number().min(0, { message: "FTA must be positive" }),
    turnovers: z.number().min(0, { message: "Turnovers must be positive" }),
}).refine((data) => {
    // Ensure at least one "possession ending" event has occurred
    return (data.fieldGoalAttempts + data.freeThrowAttempts + data.turnovers) > 0;
}, {
    message: "Enter at least one FGA, FTA, or Turnover",
    path: ["fieldGoalAttempts"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballPointsPerPossessionCalculatorInteractive() {
    const [result, setResult] = useState<{
        ppp: number;
        totalPossessions: number;
        rating: string;
        ratingColor: string;
        description: string;
        comparison: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pointsScored: 24,
            fieldGoalAttempts: 18,
            freeThrowAttempts: 6,
            turnovers: 2,
        },
    });

    const calculatePPP = (values: FormValues) => {
        // Formula: PPP = Points / (FGA + 0.44 * FTA + TOV)
        const possessions = values.fieldGoalAttempts + (0.44 * values.freeThrowAttempts) + values.turnovers;

        if (possessions === 0) return;

        const ppp = values.pointsScored / possessions;

        // Interpretation
        let rating = "";
        let ratingColor = "";
        let description = "";
        let comparison = "";

        if (ppp >= 1.15) {
            rating = "Elite Efficiency";
            ratingColor = "bg-green-600";
            description = "Outstanding scoring efficiency. This level usually corresponds to top-tier offensive teams or elite individual scorers (e.g., Curry, Jokić).";
            comparison = "Top 10% of NBA Offenses";
        } else if (ppp >= 1.05) {
            rating = "Effective Offense";
            ratingColor = "bg-emerald-500";
            description = "Solid, winning basketball. Consistently generating good shots and executing well.";
            comparison = "Playoff-Caliber Team";
        } else if (ppp >= 0.95) {
            rating = "Average";
            ratingColor = "bg-amber-500 text-black";
            description = "League average performance. Efficient enough to compete, but needs improvement to contend.";
            comparison = "Average NBA/College Team";
        } else if (ppp >= 0.85) {
            rating = "Below Average";
            ratingColor = "bg-orange-500";
            description = "Struggling to score consistently. Likely plagued by poor shooting percentages or too many turnovers.";
            comparison = "Lottery Team / Rebuilding";
        } else {
            rating = "Poor Efficiency";
            ratingColor = "bg-red-600";
            description = "Major offensive issues. The team is wasting too many possessions without points.";
            comparison = "Bottom Tier Performance";
        }

        setResult({
            ppp,
            totalPossessions: possessions,
            rating,
            ratingColor,
            description,
            comparison
        });
    };

    const onSubmit = (values: FormValues) => {
        calculatePPP(values);
    };

    const resetForm = () => {
        form.reset();
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <Card className="border-t-4 border-t-indigo-600 shadow-lg">
                <CardHeader className="bg-muted/30 pb-8">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Target className="h-6 w-6 text-indigo-600" />
                        Points Per Possession (PPP) Calculator
                    </CardTitle>
                    <CardDescription>
                        Calculate offensive efficiency by measuring points produced per possession used.
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-6 bg-card rounded-b-xl pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Points */}
                                <FormField control={form.control} name="pointsScored" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points Scored</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormDescription>Total points (FG + FT)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* FGA */}
                                <FormField control={form.control} name="fieldGoalAttempts" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Goal Attempts</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormDescription>Shots taken (inc. misses)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* FTA */}
                                <FormField control={form.control} name="freeThrowAttempts" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Free Throw Attempts</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormDescription>Used to estimate Poss.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Turnovers */}
                                <FormField control={form.control} name="turnovers" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Turnovers</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormDescription>Possessions ending w/o shot</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" className="flex-1 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">
                                    <Activity className="mr-2 h-5 w-5" />
                                    Calculate PPP
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
                    <Card className="border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50 dark:from-background dark:to-indigo-900/10 shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="h-32 w-32 text-indigo-600" />
                        </div>

                        <CardContent className="p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wide">
                                        Points Per Possession
                                    </h3>
                                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                                        <span className="text-6xl font-extrabold tracking-tight text-indigo-900 dark:text-indigo-100">
                                            {result.ppp.toFixed(2)}
                                        </span>
                                        <span className="text-xl font-medium text-muted-foreground">PPP</span>
                                    </div>
                                    <Badge className={`${result.ratingColor} text-white px-3 py-1 text-base mt-2`}>
                                        {result.rating}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        on {result.totalPossessions.toFixed(1)} est. possessions
                                    </p>
                                </div>

                                <div className="space-y-6 pt-2">
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Efficiency Scale</span>
                                            <span className="text-sm font-bold text-indigo-600">{result.ppp.toFixed(2)}</span>
                                        </div>
                                        {/* Scale visualization: 0.6 to 1.5 range typically */}
                                        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                                                style={{ width: '100%' }}
                                            />
                                            <div
                                                className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)] z-10"
                                                style={{
                                                    left: `${Math.min(Math.max(((result.ppp - 0.6) / (1.5 - 0.6)) * 100, 0), 100)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                                            <span>0.6 (Poor)</span>
                                            <span>1.05 (Good)</span>
                                            <span>1.5 (Elite)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                            Analysis
                                        </h4>
                                        <p className="text-sm leading-relaxed font-medium">
                                            {result.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground italic">
                                            Benchmark: {result.comparison}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1">
                        <Card className="bg-primary/5 border-none shadow-inner">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">Possession Estimate Note</h4>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                                        This calculator uses the standard possession estimate formula: <code>FGA + 0.44*FTA + TOV</code>. This multiplier (0.44) accounts for "And-One" plays and technical free throws which do not use a full separate possession.
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
