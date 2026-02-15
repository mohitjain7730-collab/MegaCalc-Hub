'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    minutesPlayed: z.number().min(1, "Minutes played must be at least 1"),
    fieldGoalsMade: z.number().min(0, "Field goals made cannot be negative"),
    fieldGoalsAttempted: z.number().min(0, "Field goals attempted cannot be negative"),
    freeThrowsMade: z.number().min(0, "Free throws made cannot be negative"),
    freeThrowsAttempted: z.number().min(0, "Free throws attempted cannot be negative"),
    threePointersMade: z.number().min(0, "3-Pointers made cannot be negative"),
    assists: z.number().min(0, "Assists cannot be negative"),
    rebounds: z.number().min(0, "Rebounds cannot be negative"),
    steals: z.number().min(0, "Steals cannot be negative"),
    blocks: z.number().min(0, "Blocks cannot be negative"),
    turnovers: z.number().min(0, "Turnovers cannot be negative"),
    fouls: z.number().min(0, "Fouls cannot be negative"),
}).refine((data) => data.fieldGoalsMade <= data.fieldGoalsAttempted, {
    message: "Field goals made cannot exceed attempts",
    path: ["fieldGoalsMade"],
}).refine((data) => data.freeThrowsMade <= data.freeThrowsAttempted, {
    message: "Free throws made cannot exceed attempts",
    path: ["freeThrowsMade"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballPlayerEfficiencyRatingCalculatorInteractive() {
    const [result, setResult] = useState<{
        per: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            minutesPlayed: undefined,
            fieldGoalsMade: undefined,
            fieldGoalsAttempted: undefined,
            freeThrowsMade: undefined,
            freeThrowsAttempted: undefined,
            threePointersMade: undefined,
            assists: undefined,
            rebounds: undefined,
            steals: undefined,
            blocks: undefined,
            turnovers: undefined,
            fouls: undefined,
        },
    });

    const calculatePER = (v: FormValues) => {
        // Simplified PER formula (uPER approximation)
        // Hollinger's uPER uses specific constants.
        // Formula reference: uPER = (1/min) * ...
        // Using standard coefficients for unadjusted PER approximation:

        const factor = 1 / v.minutesPlayed;

        const term1 = v.threePointersMade * 62.5; // Adjusted weight for 3PM
        const term2 = v.assists * 50.0;
        const term3 = v.fieldGoalsMade * 50.0;
        const term4 = v.freeThrowsMade * 35.0;
        const term5 = v.blocks * 35.0;
        const term6 = v.rebounds * 35.0; // Combined Reb
        const term7 = v.steals * 50.0;

        // Negatives
        const term8 = v.turnovers * 50.0;
        const term9 = v.fouls * 25.0;
        const term10 = (v.freeThrowsAttempted - v.freeThrowsMade) * 20.0; // Missed FT
        const term11 = (v.fieldGoalsAttempted - v.fieldGoalsMade) * 25.0; // Missed FG

        // This linear weight formula gives a "Game Score" like value, we need to scale it to PER (avg 15).
        // The linear weights sum is roughly total "production".
        // Real PER is normalized so league average is 15.
        // A common rough conversion for "uPER" from these stats:
        // uPER approx = (Productivity Score) / Minutes

        // Let's use the explicit uPER formula coefficients (Hollinger)
        // uPER = (1 / min) * ( FGM * 85.910 + Steals * 53.897 + 3PTM * 51.757 + FTM * 46.845 + Blocks * 39.190 + Off_Reb * 39.190 + Def_Reb * 14.707 + Assists * 34.677 - Fouls * 17.174 - (FTA - FTM) * 20.091 - (FGA - FGM) * 39.190 - Turnovers * 53.897 )

        const uPER = factor * (
            (v.fieldGoalsMade * 85.910) +
            (v.steals * 53.897) +
            (v.threePointersMade * 51.757) +
            (v.freeThrowsMade * 46.845) +
            (v.blocks * 39.190) +
            (v.rebounds * 26.948) + // Averaging Off/Def Reb (39.19+14.707)/2 approx 27 if not split
            (v.assists * 34.677) -
            (v.fouls * 17.174) -
            ((v.freeThrowsAttempted - v.freeThrowsMade) * 20.091) -
            ((v.fieldGoalsAttempted - v.fieldGoalsMade) * 39.190) -
            (v.turnovers * 53.897)
        );

        // Normally uPER is adjusted for pace to get PER. Without league pace, we present uPER as the Estimate.
        // Standard "Good" PER is 15.0 (League Average).
        // Check scaling: simplified formulas might need normalization. 
        // Hollinger's uPER usually lands around the correct range if pace is average.

        return uPER;
    };

    const interpret = (per: number) => {
        if (per >= 35) return 'Historical season performance (All-Time Great).';
        if (per >= 30) return 'Runaway MVP candidate performance.';
        if (per >= 25) return 'Strong MVP candidate.';
        if (per >= 20) return 'All-Star level performance.';
        if (per >= 15) return 'Solid starter / League average.';
        if (per >= 11) return 'Rotation player.';
        return 'Bench warmer / struggling to contribute.';
    };

    const getPerformanceLevel = (per: number) => {
        if (per >= 25) return 'MVP Level';
        if (per >= 20) return 'All-Star';
        if (per >= 15) return 'Starter';
        if (per >= 10) return 'Rotation';
        return 'Bench';
    };

    const getRecommendation = (per: number) => {
        if (per >= 25) return 'Maintain exceptional efficiency; high volume is justified.';
        if (per >= 20) return 'Capitalize on strengths and look to increase volume slightly.';
        if (per >= 15) return 'Good efficiency; focus on reducing turnovers and improving shot selection.';
        if (per >= 10) return 'Work on finishing and defensive contributions to stay on the floor.';
        return 'Major efficiency improvements needed. Focus on easy baskets and ball security.';
    };

    const getRating = (per: number) => {
        if (per >= 25) return 'Elite';
        if (per >= 20) return 'Excellent';
        if (per >= 15) return 'Average';
        if (per >= 10) return 'Fair';
        return 'Poor';
    };

    const getInsights = (per: number, v: FormValues) => {
        const insights = [];

        if (per >= 20) insights.push('High per-minute productivity');
        else if (per < 15) insights.push('Below league average productivity');

        const fgPct = v.fieldGoalsAttempted > 0 ? (v.fieldGoalsMade / v.fieldGoalsAttempted) : 0;
        if (fgPct > 0.5) insights.push('Strong field goal efficiency contributes positively');
        else if (fgPct < 0.4) insights.push('Low field goal percentage hurting rating');

        const astToTo = v.turnovers > 0 ? v.assists / v.turnovers : v.assists;
        if (astToTo > 2) insights.push('Excellent playmaking decisions (High AST/TO)');

        if (v.minutesPlayed < 20 && per > 20) insights.push('Small sample size warning (Low Minutes)');

        return insights;
    };

    const getConsiderations = (per: number) => {
        const considerations = [];
        considerations.push('Does not account for defensive positioning, only stats (BLK/STL)');
        considerations.push('Unadjusted for team pace (Pace-adjusted PER requires league data)');
        considerations.push('Shooting efficiency is heavily weighted');
        considerations.push('Volume scorers can inflate PER despite poor defense');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const per = calculatePER(values);
        if (per !== null) {
            setResult({
                per: per,
                interpretation: interpret(per),
                performanceLevel: getPerformanceLevel(per),
                recommendation: getRecommendation(per),
                rating: getRating(per),
                insights: getInsights(per, values),
                considerations: getConsiderations(per)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Player Stats Input</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter single game or season average stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="minutesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Timer className="h-4 w-4" />
                                                Minutes Played (MP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g. 32.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fieldGoalsMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Goals Made (FGM)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fieldGoalsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Goals Attempted (FGA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="threePointersMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>3-Pointers Made (3PM)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="freeThrowsMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Free Throws Made (FTM)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="freeThrowsAttempted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Free Throws Attempted (FTA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rebounds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Rebounds (REB)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="assists"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assists (AST)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="steals"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Steals (STL)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="blocks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blocks (BLK)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="turnovers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Turnovers (TO)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fouls"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Personal Fouls (PF)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Activity className="mr-2 h-4 w-4" />
                                Calculate Efficiency Rating
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
                                    <h2 className="text-2xl font-bold">Estimated PER</h2>
                                    <p className="text-muted-foreground">Player Efficiency Rating</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.per.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'MVP Level' ? 'default' : result.performanceLevel === 'All-Star' ? 'secondary' : result.performanceLevel === 'Starter' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Average' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Productivity</p>
                                    <p className="text-lg font-bold">
                                        {result.per >= 15 ? 'Above Average' : 'Below Average'}
                                    </p>
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

                    {/* Smart Insights & Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Performance Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from the stats</CardDescription>
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
                                    Risk Factors & Limits
                                </CardTitle>
                                <CardDescription>Why this number might be misleading</CardDescription>
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
