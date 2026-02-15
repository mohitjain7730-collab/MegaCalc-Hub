'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, Activity, AlertCircle, Calculator, TrendingUp, Info, CheckCircle2, TrendingDown, Crosshair, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    totalOffsides: z.coerce.number().min(0, "Offsides cannot be negative"),
    minutesPlayed: z.coerce.number().min(1, "Minutes played must be at least 1"),
    matchesPlayed: z.coerce.number().min(1, "Matches played must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballOffsideFrequencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        offsidesPer90: number;
        offsidesPerMatch: number;
        minutesPerOffside: number;
        rating: string;
        disciplineLevel: string;
        insights: string[];
        recommendation: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalOffsides: undefined,
            minutesPlayed: undefined,
            matchesPlayed: undefined,
        },
    });

    const calculate = (values: FormValues) => {
        const { totalOffsides, minutesPlayed, matchesPlayed } = values;

        const offsidesPer90 = (totalOffsides / minutesPlayed) * 90;
        const offsidesPerMatch = totalOffsides / matchesPlayed;
        const minutesPerOffside = totalOffsides > 0 ? minutesPlayed / totalOffsides : minutesPlayed;

        // Interpretations
        // High offside count isn't always bad (shows aggressive positioning), but too high kills attacks.
        // Approx benchmarks for a striker: < 0.5/90 (Good timing), 0.5-1.0 (Average), > 1.0 (Flag magnet)

        let rating = "Elite Timing";
        let disciplineLevel = "Low Risk";

        if (offsidesPer90 > 1.5) {
            rating = "Flag Magnet";
            disciplineLevel = "High Risk";
        } else if (offsidesPer90 > 0.8) {
            rating = "Aggressive Runner";
            disciplineLevel = "Moderate Risk";
        } else if (offsidesPer90 > 0.3) {
            rating = "Balanced";
            disciplineLevel = "Standard";
        } else {
            rating = "Clinical Timer";
            disciplineLevel = "Low Risk";
        }

        // Contextual Recommendation
        let recommendation = "";
        if (disciplineLevel === "High Risk") {
            recommendation = "Hold runs longer. You are killing too many attacks. Look across the line before sprinting.";
        } else if (disciplineLevel === "Moderate Risk") {
            recommendation = "Effective aggression, but try to curve runs to stay onside slightly more often.";
        } else if (rating === "Clinical Timer") {
            if (offsidesPer90 < 0.1) recommendation = "Consider making runs slightly earlier. You might be too passive.";
            else recommendation = "Perfect balance of aggression and patience. Maintain current style.";
        } else {
            recommendation = "Solid positioning. Focus on chemistry with passers to anticipate through-balls.";
        }

        const insights = [];
        insights.push(`Caught offside every ${Math.round(minutesPerOffside)} minutes on average.`);
        if (offsidesPerMatch > 1) insights.push("Averages more than 1 offside per game - frustration for teammates.");
        else insights.push("Rarely wastes possession through offside calls.");

        if (disciplineLevel === "High Risk") insights.push("Opponents likely use high lines against this player.");

        setResult({
            offsidesPer90,
            offsidesPerMatch,
            minutesPerOffside,
            rating,
            disciplineLevel,
            insights,
            recommendation
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Player Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter offside stats to analyze positioning efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalOffsides"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Flag className="h-4 w-4" /> Total Offsides</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 15" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="minutesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Minutes Played</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 1200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="matchesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Matches Played</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 15" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Frequency
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
                                <Flag className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Offside Frequency Analysis</h2>
                                    <p className="text-muted-foreground">Positioning Efficiency</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Offsides Per 90</p>
                                    <p className="text-2xl font-bold">{result.offsidesPer90.toFixed(2)}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Flag className="h-6 w-6 mx-auto mb-2 text-red-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Per Match</p>
                                    <p className="text-2xl font-bold">{result.offsidesPerMatch.toFixed(2)}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Crosshair className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Timing Rating</p>
                                    <Badge variant={result.rating === "Flag Magnet" ? "destructive" : "default"}>
                                        {result.rating}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Frequency Risk Level</span>
                                    <span className="font-bold">{result.disciplineLevel}</span>
                                </div>
                                <Progress
                                    value={Math.min(100, (result.offsidesPer90 / 2) * 100)}
                                    className="h-2"
                                // indicatorColor logic would need custom component, using standardized valid props
                                />
                                <p className="text-xs text-muted-foreground text-right">Based on standard deviation for forwards</p>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Advice:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <TrendingUp className="h-6 w-6" />
                                    Key Takeaways
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
                                    Tactical Risk
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                                        Frequent offsides kill momentum and turnover possession instantly.
                                    </span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                                        Opposing defenders may step up (Offside Trap) knowing you are eager.
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
