'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, TrendingUp, AlertCircle, Calculator, BarChart3, Shield, Info, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    serviceGamesPlayed: z.number().min(0, "Total service games must be non-negative"),
    serviceGamesWon: z.number().min(0, "Service games won must be non-negative"),
}).refine((data) => data.serviceGamesWon <= data.serviceGamesPlayed, {
    message: "Service games won cannot exceed total service games played",
    path: ["serviceGamesWon"],
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisHoldPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        percentage: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        ratingColor: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serviceGamesPlayed: undefined,
            serviceGamesWon: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.serviceGamesPlayed === undefined || v.serviceGamesWon === undefined) return null;
        if (v.serviceGamesPlayed === 0) return 0;
        return (v.serviceGamesWon / v.serviceGamesPlayed) * 100;
    };

    const getInterpretation = (pct: number) => {
        if (pct >= 90) return 'Unbreakable. You are dominating on serve.';
        if (pct >= 80) return 'Very Strong. You are setting yourself up to win sets with one break.';
        if (pct >= 70) return 'Solid. You are holding comfortably most of the time.';
        if (pct >= 60) return 'Vulnerable. You are getting broken often, putting pressure on your return game.';
        return 'Critical. Your serve is a liability. You are being broken more often than you hold.';
    };

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 90) return 'ATP Elite';
        if (pct >= 80) return 'ATP Pro';
        if (pct >= 70) return 'Competitive';
        if (pct >= 60) return 'Club Level';
        return 'Novice';
    };

    const getRating = (pct: number) => {
        if (pct >= 90) return 'God Mode';
        if (pct >= 80) return 'Excellent';
        if (pct >= 70) return 'Good';
        if (pct >= 60) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (pct: number) => {
        if (pct >= 85) return 'Maintain focus on first serve percentage to keep pressure low.';
        if (pct >= 75) return 'Work on spot serving on crucial points (30-30, Deuce).';
        if (pct >= 65) return 'Improve your second serve. Double faults or weak seconds are likely costing you holds.';
        if (pct >= 50) return 'Focus on just getting the first serve in play. Stop analyzing and just hit targets.';
        return 'Rebuild your service motion. It is not currently a weapon.';
    };

    const getInsights = (pct: number) => {
        const insights = [];
        if (pct >= 85) {
            insights.push('You likely win tiebreaks due to service dominance');
            insights.push('Opponents feel immense pressure to hold their own serve');
        } else if (pct >= 70) {
            insights.push('Service games are generally routine');
            insights.push('You can afford to take risks on return games');
        } else {
            insights.push('Every service game is a battle');
            insights.push('Likely playing from behind in the score often');
            insights.push('Opponent confidence grows with every break');
        }
        return insights;
    };

    const onSubmit = (values: FormValues) => {
        const pct = calculate(values);
        if (pct !== null) {
            setResult({
                percentage: pct,
                interpretation: getInterpretation(pct),
                performanceLevel: getPerformanceLevel(pct),
                recommendation: getRecommendation(pct),
                rating: getRating(pct),
                insights: getInsights(pct),
                ratingColor: pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Service Game Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your service game records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="serviceGamesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Service Games Played</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 12"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="serviceGamesWon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Games Won (Holds)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 10"
                                                    {...field}
                                                    value={field.value ?? ''}
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
                                Calculate Hold %
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Activity className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Hold Percentage</h2>
                                    <p className="text-muted-foreground">Server Dominance Rating</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className={`text-5xl font-bold ${result.ratingColor}`}>
                                    {result.percentage.toFixed(1)}%
                                </p>
                                <p className="text-lg font-medium mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/30 rounded-lg border">
                                    <p className="text-sm text-muted-foreground mb-1">Level</p>
                                    <Badge className="text-base px-4 py-1">{result.performanceLevel}</Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg border">
                                    <p className="text-sm text-muted-foreground mb-1">Rating</p>
                                    <span className="font-bold text-lg">{result.rating}</span>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg border">
                                    <p className="text-sm text-muted-foreground mb-1">Risk</p>
                                    <span className={`font-bold text-lg ${result.percentage < 70 ? 'text-red-500' : 'text-green-500'}`}>
                                        {result.percentage < 70 ? 'High' : 'Low'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Key Insights
                                </h4>
                                <ul className="space-y-2">
                                    {result.insights.map((insight, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/20 p-2 rounded">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Alert variant={result.percentage < 70 ? "destructive" : "default"}>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Recommendation:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
