'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    runsScored: z.number().min(0, "Runs scored must be non-negative"),
    ballsFaced: z.number().min(0, "Balls faced must be non-negative"),
    wicketsTaken: z.number().min(0, "Wickets taken must be non-negative"),
    runsConceded: z.number().min(0, "Runs conceded must be non-negative"),
    oversBowled: z.number().min(0, "Overs bowled must be non-negative"),
    catches: z.number().min(0, "Catches must be non-negative"),
    runOuts: z.number().min(0, "Run outs must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MatchImpactScoreCalculatorInteractive() {
    const [result, setResult] = useState<{
        impactScore: number;
        battingScore: number;
        bowlingScore: number;
        fieldingScore: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        breakdown: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsScored: undefined,
            ballsFaced: undefined,
            wicketsTaken: undefined,
            runsConceded: undefined,
            oversBowled: undefined,
            catches: undefined,
            runOuts: undefined,
        },
    });

    const calculateBattingScore = (runs: number, balls: number) => {
        if (balls === 0) return 0;
        const strikeRate = (runs / balls) * 100;
        // Batting score: runs scored + strike rate bonus
        let score = runs * 1.0;
        if (strikeRate > 150) score += runs * 0.5;
        else if (strikeRate > 130) score += runs * 0.3;
        else if (strikeRate > 100) score += runs * 0.1;
        else if (strikeRate < 70) score -= runs * 0.2;
        return Math.max(0, score);
    };

    const calculateBowlingScore = (wickets: number, runs: number, overs: number) => {
        if (overs === 0) return 0;
        const economy = runs / overs;
        // Bowling score: wickets * 25 + economy bonus
        let score = wickets * 25;
        if (economy < 5) score += wickets * 10;
        else if (economy < 6) score += wickets * 5;
        else if (economy < 7) score += wickets * 2;
        else if (economy > 10) score -= wickets * 5;
        return Math.max(0, score);
    };

    const calculateFieldingScore = (catches: number, runOuts: number) => {
        return (catches * 10) + (runOuts * 15);
    };

    const calculate = (v: FormValues) => {
        const batting = calculateBattingScore(v.runsScored || 0, v.ballsFaced || 0);
        const bowling = calculateBowlingScore(v.wicketsTaken || 0, v.runsConceded || 0, v.oversBowled || 0);
        const fielding = calculateFieldingScore(v.catches || 0, v.runOuts || 0);
        return {
            total: batting + bowling + fielding,
            batting,
            bowling,
            fielding
        };
    };

    const interpret = (score: number) => {
        if (score >= 200) return 'Exceptional match-winning performance! Dominated across all departments.';
        if (score >= 150) return 'Outstanding all-round performance with significant match impact.';
        if (score >= 100) return 'Excellent contribution with strong impact on match outcome.';
        if (score >= 60) return 'Good performance with meaningful contribution to team effort.';
        if (score >= 30) return 'Moderate impact - decent supporting performance.';
        return 'Limited match impact - minimal contribution across departments.';
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 200) return 'Match Winner';
        if (score >= 150) return 'Outstanding';
        if (score >= 100) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 30) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (score: number) => {
        if (score >= 200) return 'Exceptional performance! Continue this dominant form and maintain consistency across all skills.';
        if (score >= 150) return 'Outstanding match impact. Focus on converting good performances into match-winning ones more consistently.';
        if (score >= 100) return 'Strong contribution. Work on improving weaker departments to become a complete match-winner.';
        if (score >= 60) return 'Solid performance. Identify and strengthen your primary skill while developing secondary skills.';
        if (score >= 30) return 'Moderate contribution. Focus on one department to make significant impact before expanding role.';
        return 'Limited impact. Concentrate on fundamental skills in your primary role and build consistency.';
    };

    const getRating = (score: number) => {
        if (score >= 200) return 'Exceptional';
        if (score >= 150) return 'Outstanding';
        if (score >= 100) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 30) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (score: number, batting: number, bowling: number, fielding: number) => {
        const insights = [];

        // Overall insights
        if (score >= 200) {
            insights.push('Match-defining performance across multiple departments');
            insights.push('Exceptional all-round contribution');
        } else if (score >= 150) {
            insights.push('High-impact performance with strong contributions');
            insights.push('Significant influence on match outcome');
        } else if (score >= 100) {
            insights.push('Meaningful contribution to team success');
        }

        // Department-specific insights
        if (batting > 80) insights.push('Dominant batting performance with high strike rate');
        else if (batting > 40) insights.push('Strong batting contribution');
        else if (batting > 0) insights.push('Moderate batting support');

        if (bowling > 80) insights.push('Exceptional bowling performance with wickets and economy');
        else if (bowling > 40) insights.push('Effective bowling contribution');
        else if (bowling > 0) insights.push('Decent bowling support');

        if (fielding > 30) insights.push('Outstanding fielding with multiple dismissals');
        else if (fielding > 15) insights.push('Good fielding contribution');
        else if (fielding > 0) insights.push('Solid fielding effort');

        if (insights.length === 0) {
            insights.push('Limited overall contribution');
            insights.push('Needs improvement across all departments');
        }

        return insights;
    };

    const getBreakdown = (batting: number, bowling: number, fielding: number) => {
        const total = batting + bowling + fielding;
        if (total === 0) return ['No contribution recorded'];

        return [
            `Batting: ${batting.toFixed(1)} points (${((batting / total) * 100).toFixed(1)}%)`,
            `Bowling: ${bowling.toFixed(1)} points (${((bowling / total) * 100).toFixed(1)}%)`,
            `Fielding: ${fielding.toFixed(1)} points (${((fielding / total) * 100).toFixed(1)}%)`
        ];
    };

    const onSubmit = (values: FormValues) => {
        const scores = calculate(values);
        setResult({
            impactScore: scores.total,
            battingScore: scores.batting,
            bowlingScore: scores.bowling,
            fieldingScore: scores.fielding,
            interpretation: interpret(scores.total),
            performanceLevel: getPerformanceLevel(scores.total),
            recommendation: getRecommendation(scores.total),
            rating: getRating(scores.total),
            insights: getInsights(scores.total, scores.batting, scores.bowling, scores.fielding),
            breakdown: getBreakdown(scores.batting, scores.bowling, scores.fielding)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Performance Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter batting, bowling, and fielding statistics to calculate match impact score
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Batting Stats */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Batting Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="runsScored"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Runs Scored</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 75"
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
                                        name="ballsFaced"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Balls Faced</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 52"
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
                            </div>

                            {/* Bowling Stats */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Bowling Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="wicketsTaken"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wickets Taken</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 3"
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
                                        name="runsConceded"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Runs Conceded</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 28"
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
                                        name="oversBowled"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Overs Bowled</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g., 4"
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
                            </div>

                            {/* Fielding Stats */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Fielding Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="catches"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Catches</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 2"
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
                                        name="runOuts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Run Outs</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 1"
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
                            </div>

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Match Impact Score
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
                                <Award className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Match Impact Score</h2>
                                    <p className="text-muted-foreground">All-Round Performance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.impactScore.toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground mt-1">impact points</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Match Winner' || result.performanceLevel === 'Outstanding' ? 'default' : result.performanceLevel === 'Excellent' || result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Exceptional' || result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' || result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Top Contribution</p>
                                    <p className="text-sm font-bold mt-1">
                                        {result.battingScore >= result.bowlingScore && result.battingScore >= result.fieldingScore ? 'Batting' :
                                            result.bowlingScore >= result.fieldingScore ? 'Bowling' : 'Fielding'}
                                    </p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Recommendation:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>

                            {/* Score Breakdown */}
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h3 className="font-semibold mb-3">Score Breakdown</h3>
                                <div className="space-y-2">
                                    {result.breakdown.map((item, index) => (
                                        <p key={index} className="text-sm text-muted-foreground">{item}</p>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Smart Insights */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                <Target className="h-6 w-6" />
                                Smart Insights
                            </CardTitle>
                            <CardDescription>Key takeaways from match performance</CardDescription>
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
                </div>
            )}
        </div>
    );
}
