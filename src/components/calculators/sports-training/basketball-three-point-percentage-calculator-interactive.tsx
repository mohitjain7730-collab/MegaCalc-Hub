"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Target, ChevronRight, RotateCcw, Activity, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
    threePointersMade: z.number().min(0, { message: "Adds must be positive" }),
    threePointersAttempted: z.number().min(1, { message: "Attempts must be at least 1" }),
}).refine((data) => data.threePointersMade <= data.threePointersAttempted, {
    message: "Makes cannot exceed attempts",
    path: ["threePointersMade"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballThreePointPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
        rating: string;
        ratingColor: string;
        description: string;
        effectiveValue: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            threePointersMade: 4,
            threePointersAttempted: 10,
        },
    });

    const calculatePercentage = (values: FormValues) => {
        const percentage = (values.threePointersMade / values.threePointersAttempted) * 100;

        // Effective value in terms of 2-point percentage (e.g., 33% 3P = 50% 2P)
        const effectiveValue = percentage * 1.5;

        // Interpretation
        let rating = "";
        let ratingColor = "";
        let description = "";

        if (percentage >= 40) {
            rating = "Elite Shooter";
            ratingColor = "bg-green-600";
            description = "Steph Curry territory. Defenders must press up beyond the arc. This creates massive spacing for the offense.";
        } else if (percentage >= 37) {
            rating = "Great Shooter";
            ratingColor = "bg-emerald-500";
            description = "Highly reliable threat. Teams will run plays specifically to get this shooter open.";
        } else if (percentage >= 35) {
            rating = "Good / League Average";
            ratingColor = "bg-blue-500";
            description = "Respectable spacer. Must be guarded, but not a pure specialist. This is roughly the NBA league average.";
        } else if (percentage >= 30) {
            rating = "Below Average";
            ratingColor = "bg-yellow-500 text-black";
            description = "Inconsistent. Defenders might help off this shooter to clog the paint. Needs to improve to play a '3&D' role.";
        } else {
            rating = "Non-Shooter";
            ratingColor = "bg-red-600";
            description = "Liability from deep. Opponents will sag off completely (\"Dare to Shoot\"). Restrict attempts to late-clock situations.";
        }

        setResult({
            percentage,
            rating,
            ratingColor,
            description,
            effectiveValue
        });
    };

    const onSubmit = (values: FormValues) => {
        calculatePercentage(values);
    };

    const resetForm = () => {
        form.reset();
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <Card className="border-t-4 border-t-orange-600 shadow-lg">
                <CardHeader className="bg-muted/30 pb-8">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Target className="h-6 w-6 text-orange-600" />
                        3-Point Percentage Calculator
                    </CardTitle>
                    <CardDescription>
                        Calculate 3FG% and verify shooting efficiency benchmarks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-6 bg-card rounded-b-xl pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Makes */}
                                <FormField control={form.control} name="threePointersMade" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>3-Pointers Made</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Attempts */}
                                <FormField control={form.control} name="threePointersAttempted" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>3-Pointers Attempted</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" className="flex-1 text-lg font-semibold bg-orange-600 hover:bg-orange-700">
                                    <Activity className="mr-2 h-5 w-5" />
                                    Calculate Percentage
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
                    <Card className="border-orange-100 dark:border-orange-900 bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Target className="h-32 w-32 text-orange-600" />
                        </div>

                        <CardContent className="p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wide">
                                        3-Point Percentage
                                    </h3>
                                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                                        <span className="text-6xl font-extrabold tracking-tight text-orange-900 dark:text-orange-100">
                                            {result.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Badge className={`${result.ratingColor} text-white px-3 py-1 text-base mt-2`}>
                                        {result.rating}
                                    </Badge>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Shooting Benchmarks</span>
                                            <span className="text-sm font-bold text-orange-600">{result.percentage.toFixed(1)}%</span>
                                        </div>
                                        {/* Scale visualization: 20% to 50% range typically meaningful */}
                                        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                                                style={{ width: '100%' }}
                                            />
                                            <div
                                                className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)] z-10"
                                                style={{
                                                    left: `${Math.min(Math.max(((result.percentage - 20) / (50 - 20)) * 100, 0), 100)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                                            <span>20% (Poor)</span>
                                            <span>35% (Avg)</span>
                                            <span>45% (Elite)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                            Shooter Profile
                                        </h4>
                                        <p className="text-sm leading-relaxed font-medium">
                                            {result.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Efficiency Translation</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300 mt-1">
                                Shooting {result.percentage.toFixed(1)}% from 3 is mathematically equivalent to shooting <strong>{result.effectiveValue.toFixed(1)}%</strong> on 2-pointers.
                            </AlertDescription>
                        </Alert>

                        <Card className="bg-primary/5 border-none shadow-inner">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Sample Size Warning</h4>
                                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                        3-point percentage stabilizes slowly. Need ~750 attempts to be statistically reliable. Small samples (e.g., 5/10) can be very misleading hot streaks.
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
