"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shield, ChevronRight, RotateCcw, Activity, AlertTriangle, TrendingDown, Info, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Schema Validation
const formSchema = z.object({
    pointsAllowed: z.number().min(0, { message: "Points allowed must be positive" }),
    opponentFGA: z.number().min(1, { message: "Opponent FGA must be at least 1" }),
    opponentFTA: z.number().min(0, { message: "Opponent FTA must be positive" }),
    opponentORB: z.number().min(0, { message: "Opponent offensive rebounds must be positive" }),
    opponentTOV: z.number().min(0, { message: "Opponent turnovers must be positive" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballDefensiveEfficiencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        drtg: number;
        possessions: number;
        rating: string;
        ratingColor: string;
        description: string;
        recommendation: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pointsAllowed: 105,
            opponentFGA: 88,
            opponentFTA: 22,
            opponentORB: 10,
            opponentTOV: 14,
        },
    });

    const calculateDRtg = (values: FormValues) => {
        // Formula: Possessions = FGA - ORB + TOV + (0.44 * FTA)
        // DRtg = 100 * (Points Allowed / Possessions)

        const possessions = values.opponentFGA - values.opponentORB + values.opponentTOV + (0.44 * values.opponentFTA);

        if (possessions <= 0) return;

        const drtg = 100 * (values.pointsAllowed / possessions);

        // Interpretation
        let rating = "";
        let ratingColor = "";
        let description = "";
        let recommendation = "";

        if (drtg < 105) {
            rating = "Elite Defense";
            ratingColor = "bg-green-500 hover:bg-green-600";
            description = "Historically elite defensive performance. This level of efficiency usually correlates with championship-contending defense.";
            recommendation = "Maintain this intensity. Ensure defensive rebounding remains high to limit second-chance points.";
        } else if (drtg < 110) {
            rating = "Good Defense";
            ratingColor = "bg-blue-500 hover:bg-blue-600";
            description = "Solid defensive efficiency. Better than league average, capable of winning most games if the offense is competent.";
            recommendation = "Focus on forcing more turnovers or reducing opponent free throw attempts to reach elite status.";
        } else if (drtg < 115) {
            rating = "Average Defense";
            ratingColor = "bg-yellow-500 hover:bg-yellow-600";
            description = "League average performance. You are trading buckets with the opponent.";
            recommendation = "Identify weak links. Are you fouling too much? Giving up too many offensive rebounds?";
        } else {
            rating = "Poor Defense";
            ratingColor = "bg-red-500 hover:bg-red-600";
            description = "Below average efficiency. The opponent is scoring too easily per possession.";
            recommendation = "Immediate adjustments needed. Focus on transition defense and basics: stop ball, deny middle, no easy layups.";
        }

        setResult({
            drtg,
            possessions,
            rating,
            ratingColor,
            description,
            recommendation
        });
    };

    const onSubmit = (values: FormValues) => {
        calculateDRtg(values);
    };

    const resetForm = () => {
        form.reset();
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <Card className="border-t-4 border-t-red-600 shadow-lg">
                <CardHeader className="bg-muted/30 pb-8">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Lock className="h-6 w-6 text-red-600" />
                        Defensive Efficiency Calculator
                    </CardTitle>
                    <CardDescription>
                        Calculate Defensive Rating (DRtg) based on opponent stats.
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-6 bg-card rounded-b-xl pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Points Allowed */}
                                <FormField
                                    control={form.control}
                                    name="pointsAllowed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Activity className="h-4 w-4 text-red-500" />
                                                Opponent Points
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 105"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Total points scored by the opponent.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Opponent FGA */}
                                <FormField
                                    control={form.control}
                                    name="opponentFGA"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opponent FGA</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 88"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Field Goal Attempts allowed.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Opponent FTA */}
                                <FormField
                                    control={form.control}
                                    name="opponentFTA"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opponent FTA</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 22"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Free Throw Attempts allowed.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Opponent Def Reb / ORB Context */}
                                {/* Note: We need Opponent ORB for the formula directly */}
                                <FormField
                                    control={form.control}
                                    name="opponentORB"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opponent Offensive Rebounds</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 10"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Second chance opportunities allowed.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Opponent TOV */}
                                <FormField
                                    control={form.control}
                                    name="opponentTOV"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Forced Turnovers</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 14"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Turnovers forced by your defense.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" className="flex-1 text-lg font-semibold bg-red-600 hover:bg-red-700">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Calculate Efficiency
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
                    <Card className="border-red-100 dark:border-red-900 bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="h-32 w-32 text-red-600" />
                        </div>

                        <CardContent className="p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wide">
                                        Defensive Rating (DRtg)
                                    </h3>
                                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                                        <span className="text-6xl font-extrabold tracking-tight text-red-900 dark:text-red-100">
                                            {result.drtg.toFixed(1)}
                                        </span>
                                        <span className="text-xl font-medium text-muted-foreground">pts / 100 poss</span>
                                    </div>
                                    <Badge className={`${result.ratingColor} text-white px-3 py-1 text-base mt-2`}>
                                        {result.rating}
                                    </Badge>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">Estimated Possessions</span>
                                            <span className="font-bold">{result.possessions.toFixed(1)}</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500/50 w-full" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                            Analysis
                                        </h4>
                                        <p className="text-sm leading-relaxed">
                                            {result.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
                            <TrendingDown className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Recommendation</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300 mt-1">
                                {result.recommendation}
                            </AlertDescription>
                        </Alert>

                        <Card className="bg-primary/5 border-none shadow-inner">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Context Matters</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        Lower is better for Defensive Rating. An elite defense typically holds opponents under 105 points per 100 possessions in the modern era.
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
