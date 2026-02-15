'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Calculator, Info, CheckCircle2, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    minutesPlayed: z.number().min(1, "Minutes played must be greater than 0"),
    fga: z.number().min(0, "Field Goal Attempts must be non-negative"),
    fta: z.number().min(0, "Free Throw Attempts must be non-negative"),
    turnovers: z.number().min(0, "Turnovers must be non-negative"),
    teamMinutes: z.number().min(1, "Team minutes must be greater than 0").default(240),
    teamFga: z.number().min(0, "Team Field Goal Attempts must be non-negative"),
    teamFta: z.number().min(0, "Team Free Throw Attempts must be non-negative"),
    teamTurnovers: z.number().min(0, "Team Turnovers must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballUsageRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        usageRate: number;
        interpretation: string;
        role: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            minutesPlayed: undefined,
            fga: undefined,
            fta: undefined,
            turnovers: undefined,
            teamMinutes: 240,
            teamFga: undefined,
            teamFta: undefined,
            teamTurnovers: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        // Usage Rate Formula: 
        // 100 * ((FGA + 0.44 * FTA + TOV) * (Tm MP / 5)) / (MP * (Tm FGA + 0.44 * Tm FTA + Tm TOV))

        const playerPossessions = v.fga + 0.44 * v.fta + v.turnovers;
        const teamPossessions = v.teamFga + 0.44 * v.teamFta + v.teamTurnovers;
        const term1 = playerPossessions * (v.teamMinutes / 5);
        const term2 = v.minutesPlayed * teamPossessions;

        if (term2 === 0) return null;

        return 100 * (term1 / term2);
    };

    const interpret = (rate: number) => {
        if (rate >= 35) return 'Heliocentric usage. The entire offense revolves around this player.';
        if (rate >= 30) return 'Primary superstar usage. Dominates possession and shot creation.';
        if (rate >= 25) return 'High usage. Likely a primary or secondary scoring option.';
        if (rate >= 20) return 'Average usage. Balanced role player or rotation piece.';
        if (rate >= 15) return 'Low usage. Floor spacer, defensive specialist, or role player.';
        return 'Minimal offensive involvement. Likely a defensive anchor or low-touch player.';
    };

    const getRole = (rate: number) => {
        if (rate >= 32) return 'System Hub / MVP Candidate';
        if (rate >= 28) return 'Primary Scorer';
        if (rate >= 24) return 'Second/Third Option';
        if (rate >= 18) return 'Role Player';
        if (rate >= 12) return 'Low-Usage Support';
        return 'Minimal Touch';
    };

    const getRecommendation = (rate: number) => {
        if (rate >= 30) return 'Ensure efficiency (TS%) remains high. High usage with low efficiency hurts the team.';
        if (rate >= 25) return 'Balance scoring with playmaking. Look to involve teammates when defense collapses.';
        if (rate >= 20) return 'Solid balance. Look to be aggressive when opportunities arise but maintain flow.';
        if (rate >= 15) return 'Focus on high-efficiency shots (corners, layups) and moving without the ball.';
        return 'Look for opportunities to cut or screen. Don\'t be passive if open.';
    };

    const getRating = (rate: number) => {
        if (rate >= 30) return 'Very High';
        if (rate >= 25) return 'High';
        if (rate >= 20) return 'Moderate';
        if (rate >= 15) return 'Low';
        return 'Very Low';
    };

    const getInsights = (rate: number) => {
        const insights = [];
        if (rate >= 30) {
            insights.push('Carries significant offensive load');
            insights.push('Likely faces constant double teams');
            insights.push('Fatigue management is critical');
        } else if (rate >= 20) {
            insights.push('Balanced offensive contribution');
            insights.push('Sustainable over long minutes');
            insights.push('Allows teammates to operate');
        } else {
            insights.push('Minimal ball dominance');
            insights.push('Relies on others for creation');
            insights.push('Must capitalize on limited touches');
        }
        return insights;
    };

    const getConsiderations = (rate: number) => {
        const considerations = [];
        considerations.push('Usage Rate does not measure efficiency, only volume.');
        considerations.push('Turnovers increase Usage Rate (which is negative).');
        considerations.push('Does not account for assists or passing (unless leading to TO).');
        considerations.push('Context matters: Bench units may inflate usage for reserves.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const rate = calculate(values);
        if (rate !== null) {
            setResult({
                usageRate: rate,
                interpretation: interpret(rate),
                role: getRole(rate),
                recommendation: getRecommendation(rate),
                rating: getRating(rate),
                insights: getInsights(rate),
                considerations: getConsiderations(rate)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Player & Team Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter individual and team stats for the same period (game or season)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Player Stats Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Player Stats</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="minutesPlayed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> Player Minutes</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" placeholder="e.g. 36" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fga"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Field Goal Attempts (FGA)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fta"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Free Throw Attempts (FTA)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                                                <FormLabel>Turnovers (TOV)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 3" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Team Stats Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Team Stats</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="teamMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4" /> Team Total Minutes</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 240 (for reg. game)" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormDescription>Usually 240 mins (48x5) for NBA game.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="teamFga"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team FGA</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 90" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="teamFta"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team FTA</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 25" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="teamTurnovers"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team Turnovers</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="e.g. 15" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Usage Rate
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
                                <Activity className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Usage Rate (Usg%)</h2>
                                    <p className="text-muted-foreground">Offensive Load Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.usageRate.toFixed(1)}%</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Projected Role</p>
                                    <Badge variant="outline" className="mt-1">
                                        {result.role}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Volume Rating</p>
                                    <Badge variant={result.rating === 'Very High' || result.rating === 'High' ? 'default' : 'secondary'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Calculator className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Est. Possessions</p>
                                    <p className="text-lg font-bold">
                                        {/* Simple estimation for display */}
                                        {Math.round((form.getValues().fga || 0) + 0.44 * (form.getValues().fta || 0) + (form.getValues().turnovers || 0))} Used
                                    </p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Take:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <TrendingUp className="h-6 w-6" />
                                    Key Insights
                                </CardTitle>
                                <CardDescription>Tactical implications</CardDescription>
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

                        <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Risk Factors
                                </CardTitle>
                                <CardDescription>Contextual awareness</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.considerations.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{item}</span>
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
