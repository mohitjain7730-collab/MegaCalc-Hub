'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    totalAces: z.number().min(0, "Total aces must be non-negative"),
    matchesPlayed: z.number().min(1, "Matches played must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TennisAcesPerMatchCalculatorInteractive() {
    const [result, setResult] = useState<{
        avg: number;
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
            totalAces: undefined,
            matchesPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.totalAces == null || v.matchesPlayed == null) return null;
        return v.totalAces / v.matchesPlayed;
    };

    const interpret = (avg: number) => {
        if (avg >= 15) return 'Monster server. Your serve is an overpowering weapon.';
        if (avg >= 10) return 'Elite serving performance. You dominate on serve games.';
        if (avg >= 5) return 'Strong server. You get a few free points each match.';
        if (avg >= 2) return 'Average club level. You rely more on rallies than aces.';
        return 'Tactical server. You prioritize placement and consistency over power.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg >= 12) return 'Isner/Karlovic Level';
        if (avg >= 8) return 'ATP Elite';
        if (avg >= 4) return 'Strong Club';
        if (avg >= 1) return 'Standard';
        return 'Developmental';
    };

    const getRecommendation = (avg: number) => {
        if (avg >= 10) return 'Your serve is world-class. Focus on your volleying to capitalize on weak returns.';
        if (avg >= 5) return 'Great weapon. Work on placement variety to keep opponents guessing.';
        if (avg >= 2) return 'Good foundation. Try adding more slice or kick to create more trouble.';
        if (avg >= 0.5) return 'Focus on placement. You don\'t need aces to hold serve, just weak returns.';
        return 'Don\'t worry about aces. Focus on high first-serve percentage and starting the point neutral.';
    };

    const getRating = (avg: number) => {
        if (avg >= 10) return 'Exceptional';
        if (avg >= 6) return 'Excellent';
        if (avg >= 3) return 'Good';
        if (avg >= 1) return 'Fair';
        return 'Needs Power';
    };

    const getInsights = (avg: number) => {
        const insights = [];
        if (avg >= 10) {
            insights.push('Huge psychological advantage');
            insights.push('Opponent feels pressure to hold serve');
            insights.push('Likely play many tie-breaks');
        } else if (avg >= 5) {
            insights.push('Reliable source of free points');
            insights.push('Saves energy in service games');
            insights.push('Strong weapon on fast surfaces');
        } else if (avg >= 2) {
            insights.push('Consistent service motion');
            insights.push('Rely on point construction');
            insights.push('Serve sets up the next shot');
        } else {
            insights.push('Rely on groundstrokes to win');
            insights.push('Must have high fitness levels');
            insights.push('Harder to hold serve easily');
        }
        return insights;
    };

    const getConsiderations = (avg: number) => {
        const considerations = [];
        considerations.push('Surface speed (Grass > Hard > Clay for aces)');
        considerations.push('Match format (Best of 3 vs Best of 5)');
        considerations.push('Opponent return quality matters immensely');
        considerations.push('Height is a significant factor in ace potential');
        considerations.push('Risk of injury (shoulder/back) with high ace counts');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const avg = calculate(values);
        if (avg !== null) {
            setResult({
                avg: avg,
                interpretation: interpret(avg),
                performanceLevel: getPerformanceLevel(avg),
                recommendation: getRecommendation(avg),
                rating: getRating(avg),
                insights: getInsights(avg),
                considerations: getConsiderations(avg)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Ace Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your ace totals to calculate average per match
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalAces"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Aces
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 45"
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
                                    name="matchesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Matches Played
                                            </FormLabel>
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
                                Calculate Average
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
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Aces Per Match</h2>
                                    <p className="text-muted-foreground">Serving Dominance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.avg.toFixed(1)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel.includes('Isner') ? 'default' : result.performanceLevel.includes('Elite') ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Exceptional' ? 'default' : result.rating === 'Excellent' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Total Aces</p>
                                    <p className="text-lg font-bold">{form.getValues().totalAces}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coach's Tip:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Smart Actions & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Tactical Advantage
                                </CardTitle>
                                <CardDescription>How this impacts your game</CardDescription>
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
                                    Physical Reality
                                </CardTitle>
                                <CardDescription>Constraints to remember</CardDescription>
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
