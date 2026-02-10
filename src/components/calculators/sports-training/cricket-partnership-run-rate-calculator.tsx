'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Activity, Zap, Users, AlertTriangle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    // Partnership details
    partnershipRuns: z.number().min(0),
    ballsFaced: z.number().min(0),
    // Individual contributions
    player1Runs: z.number().min(0),
    player2Runs: z.number().min(0),
    player1Balls: z.number().min(0),
    player2Balls: z.number().min(0),
    // Match context
    matchFormat: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CricketPartnershipRunRateCalculator() {
    const [result, setResult] = useState<{
        partnershipRunRate: number;
        runsPerBall: number;
        oversCompleted: number;
        player1StrikeRate: number;
        player2StrikeRate: number;
        dominantBatsman: string;
        partnershipQuality: string;
        performanceLevel: string;
        insights: string[];
        recommendations: string[];
        projectedRuns: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            partnershipRuns: undefined,
            ballsFaced: undefined,
            player1Runs: undefined,
            player2Runs: undefined,
            player1Balls: undefined,
            player2Balls: undefined,
            matchFormat: 't20',
        },
    });

    const calculatePartnershipMetrics = (values: FormValues) => {
        // Partnership run rate (per over)
        const partnershipRunRate = values.ballsFaced > 0
            ? (values.partnershipRuns / values.ballsFaced) * 6
            : 0;

        // Runs per ball
        const runsPerBall = values.ballsFaced > 0
            ? values.partnershipRuns / values.ballsFaced
            : 0;

        // Overs completed
        const oversCompleted = values.ballsFaced / 6;

        // Individual strike rates
        const player1StrikeRate = values.player1Balls > 0
            ? (values.player1Runs / values.player1Balls) * 100
            : 0;

        const player2StrikeRate = values.player2Balls > 0
            ? (values.player2Runs / values.player2Balls) * 100
            : 0;

        // Determine dominant batsman
        let dominantBatsman = 'Equal Partnership';
        if (values.player1Runs > values.player2Runs * 1.5) {
            dominantBatsman = 'Player 1 Dominant';
        } else if (values.player2Runs > values.player1Runs * 1.5) {
            dominantBatsman = 'Player 2 Dominant';
        } else if (Math.abs(values.player1Runs - values.player2Runs) < values.partnershipRuns * 0.2) {
            dominantBatsman = 'Balanced Partnership';
        }

        // Partnership quality
        const partnershipQuality = getPartnershipQuality(partnershipRunRate, values.matchFormat);

        // Performance level
        const performanceLevel = getPerformanceLevel(partnershipRunRate, values.matchFormat);

        // Insights
        const insights = getInsights(
            partnershipRunRate,
            player1StrikeRate,
            player2StrikeRate,
            values.player1Runs,
            values.player2Runs,
            values.matchFormat
        );

        // Recommendations
        const recommendations = getRecommendations(
            partnershipRunRate,
            player1StrikeRate,
            player2StrikeRate,
            values.matchFormat
        );

        // Projected runs if partnership continues for 10 overs
        const projectedRuns = partnershipRunRate * 10;

        return {
            partnershipRunRate,
            runsPerBall,
            oversCompleted,
            player1StrikeRate,
            player2StrikeRate,
            dominantBatsman,
            partnershipQuality,
            performanceLevel,
            insights,
            recommendations,
            projectedRuns,
        };
    };

    const getPartnershipQuality = (runRate: number, format: string): string => {
        if (format === 't20') {
            if (runRate >= 12) return 'Explosive';
            if (runRate >= 9) return 'Excellent';
            if (runRate >= 7) return 'Good';
            if (runRate >= 5) return 'Moderate';
            return 'Slow';
        } else if (format === 'odi') {
            if (runRate >= 8) return 'Explosive';
            if (runRate >= 6) return 'Excellent';
            if (runRate >= 5) return 'Good';
            if (runRate >= 4) return 'Moderate';
            return 'Slow';
        } else { // Test
            if (runRate >= 5) return 'Aggressive';
            if (runRate >= 3.5) return 'Brisk';
            if (runRate >= 2.5) return 'Steady';
            if (runRate >= 1.5) return 'Cautious';
            return 'Defensive';
        }
    };

    const getPerformanceLevel = (runRate: number, format: string): string => {
        if (format === 't20') {
            if (runRate >= 10) return 'Outstanding';
            if (runRate >= 8) return 'Very Good';
            if (runRate >= 6) return 'Good';
            return 'Below Par';
        } else if (format === 'odi') {
            if (runRate >= 7) return 'Outstanding';
            if (runRate >= 5.5) return 'Very Good';
            if (runRate >= 4.5) return 'Good';
            return 'Below Par';
        } else {
            if (runRate >= 4) return 'Aggressive';
            if (runRate >= 3) return 'Positive';
            if (runRate >= 2) return 'Steady';
            return 'Defensive';
        }
    };

    const getInsights = (
        partnershipRR: number,
        p1SR: number,
        p2SR: number,
        p1Runs: number,
        p2Runs: number,
        format: string
    ): string[] => {
        const insights = [];

        // Run rate insights
        if (format === 't20' && partnershipRR > 10) {
            insights.push('Partnership scoring at an explosive rate ideal for T20 cricket');
        } else if (format === 'odi' && partnershipRR > 6) {
            insights.push('Partnership maintaining excellent run rate for ODI format');
        } else if (format === 'test' && partnershipRR > 4) {
            insights.push('Aggressive partnership putting pressure on bowling team');
        }

        // Strike rate comparison
        if (Math.abs(p1SR - p2SR) > 30) {
            insights.push('Significant difference in strike rates between partners');
        } else if (Math.abs(p1SR - p2SR) < 15) {
            insights.push('Both batsmen scoring at similar pace - well-balanced partnership');
        }

        // Contribution balance
        const totalRuns = p1Runs + p2Runs;
        const contributionDiff = Math.abs(p1Runs - p2Runs) / totalRuns;
        if (contributionDiff < 0.2) {
            insights.push('Equal contribution from both batsmen strengthens partnership');
        } else if (contributionDiff > 0.5) {
            insights.push('One batsman dominating the scoring - consider rotating strike more');
        }

        // Strike rate quality
        if (p1SR > 100 && p2SR > 100) {
            insights.push('Both batsmen maintaining excellent strike rates');
        } else if (p1SR < 70 || p2SR < 70) {
            insights.push('At least one batsman struggling with scoring rate');
        }

        if (insights.length === 0) {
            insights.push('Partnership progressing at a steady pace');
        }

        return insights;
    };

    const getRecommendations = (
        partnershipRR: number,
        p1SR: number,
        p2SR: number,
        format: string
    ): string[] => {
        const recommendations = [];

        if (format === 't20') {
            if (partnershipRR < 7) {
                recommendations.push('Increase scoring rate - look for boundaries and rotate strike');
                recommendations.push('Target weaker bowlers and exploit powerplay restrictions');
            } else if (partnershipRR > 12) {
                recommendations.push('Maintain aggressive approach while minimizing risks');
                recommendations.push('Continue targeting boundaries but avoid reckless shots');
            } else {
                recommendations.push('Good scoring rate - maintain current approach');
            }
        } else if (format === 'odi') {
            if (partnershipRR < 4.5) {
                recommendations.push('Partnership needs to accelerate - increase boundary hitting');
                recommendations.push('Rotate strike more frequently to maintain momentum');
            } else if (partnershipRR > 7) {
                recommendations.push('Excellent run rate - balance aggression with wicket preservation');
            } else {
                recommendations.push('Solid partnership - look to accelerate in final overs');
            }
        } else { // Test
            if (partnershipRR < 2) {
                recommendations.push('Very defensive approach - consider scoring opportunities');
            } else if (partnershipRR > 4) {
                recommendations.push('Aggressive batting - ensure shot selection remains disciplined');
            } else {
                recommendations.push('Good balance between attack and defense');
            }
        }

        // Strike rate specific recommendations
        if (Math.abs(p1SR - p2SR) > 40) {
            recommendations.push('Large strike rate difference - struggling batsman should focus on rotation');
        }

        if (p1SR < 80 && p2SR < 80 && format !== 'test') {
            recommendations.push('Both batsmen need to increase scoring rate through better shot selection');
        }

        return recommendations;
    };

    const onSubmit = (values: FormValues) => {
        const metrics = calculatePartnershipMetrics(values);
        setResult(metrics);
    };

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Partnership Details
                    </CardTitle>
                    <CardDescription>
                        Enter partnership statistics to analyze run rate and performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Match Format */}
                            <FormField
                                control={form.control}
                                name="matchFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Match Format</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select format" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="t20">T20 (20 overs)</SelectItem>
                                                <SelectItem value="odi">ODI (50 overs)</SelectItem>
                                                <SelectItem value="test">Test Match</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Partnership Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Partnership Statistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="partnershipRuns"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Partnership Runs</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 85"
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
                                                        placeholder="e.g., 54"
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

                            {/* Player 1 Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-orange-600" />
                                    Player 1 Contribution
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="player1Runs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Runs Scored</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
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
                                        name="player1Balls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Balls Faced</FormLabel>
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
                                </div>
                            </div>

                            {/* Player 2 Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-green-600" />
                                    Player 2 Contribution
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="player2Runs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Runs Scored</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 40"
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
                                        name="player2Balls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Balls Faced</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 26"
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
                                Calculate Partnership Metrics
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Main Result Card */}
                    <Card className="border-2 border-primary">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Partnership Run Rate</CardTitle>
                                    <CardDescription>{result.partnershipQuality} Partnership - {result.performanceLevel}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-6xl font-bold text-primary">{result.partnershipRunRate.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground mt-1">Runs per Over</p>
                                <Badge variant="default" className="mt-3 text-lg px-4 py-1">
                                    {result.dominantBatsman}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Runs/Ball</p>
                                    <p className="text-xl font-bold text-blue-600">{result.runsPerBall.toFixed(2)}</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/20">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Overs</p>
                                    <p className="text-xl font-bold text-purple-600">{result.oversCompleted.toFixed(1)}</p>
                                </div>
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/20">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Player 1 SR</p>
                                    <p className="text-xl font-bold text-orange-600">{result.player1StrikeRate.toFixed(1)}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Player 2 SR</p>
                                    <p className="text-xl font-bold text-green-600">{result.player2StrikeRate.toFixed(1)}</p>
                                </div>
                            </div>

                            <Alert>
                                <TrendingUp className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Projection:</strong> If this partnership continues for 10 overs at the current rate, it would add approximately <strong>{result.projectedRuns.toFixed(0)} runs</strong>.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Insights */}
                    <Card className="border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                                <CheckCircle2 className="h-6 w-6" />
                                Partnership Insights
                            </CardTitle>
                            <CardDescription>Key observations about the partnership</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.insights.map((insight, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{insight}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="border-green-100 bg-green-50/10 dark:border-green-900/20 dark:bg-green-900/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
                                <Target className="h-6 w-6" />
                                Recommendations
                            </CardTitle>
                            <CardDescription>Strategic suggestions for the partnership</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <Target className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">{recommendation}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Understanding Partnership Run Rate */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding Partnership Run Rate
                    </CardTitle>
                    <CardDescription>
                        Key metrics for analyzing batting partnerships
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">What is Partnership Run Rate?</h4>
                        <p className="text-sm text-muted-foreground">
                            Partnership run rate measures the scoring pace of two batsmen batting together. It's calculated by dividing the total runs scored during the partnership by the number of overs faced, providing insight into the partnership's effectiveness and momentum.
                        </p>
                    </div>

                    <div className="space-y-3 mt-4">
                        <h4 className="font-semibold">Format-Specific Benchmarks:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">T20 Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Excellent: 9+ RPO</p>
                                <p className="text-xs text-muted-foreground">Good: 7-9 RPO</p>
                                <p className="text-xs text-muted-foreground">Average: 5-7 RPO</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">ODI Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Excellent: 6+ RPO</p>
                                <p className="text-xs text-muted-foreground">Good: 5-6 RPO</p>
                                <p className="text-xs text-muted-foreground">Average: 4-5 RPO</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Test Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Aggressive: 4+ RPO</p>
                                <p className="text-xs text-muted-foreground">Brisk: 3-4 RPO</p>
                                <p className="text-xs text-muted-foreground">Steady: 2-3 RPO</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Calculation Formulas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-3">
                        <div>
                            <p className="font-mono text-sm text-center">
                                Partnership Run Rate = (Partnership Runs / Balls Faced) × 6
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-sm text-center">
                                Strike Rate = (Runs Scored / Balls Faced) × 100
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-sm text-center">
                                Runs Per Ball = Partnership Runs / Balls Faced
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Cricket Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Team scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase planning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Cricket Partnership Run Rate: Building Match-Winning Stands" />
                <meta itemProp="description" content="Master partnership analysis in cricket with our comprehensive guide covering run rate calculation, partnership dynamics, strategic importance, role distribution, and how to build match-winning batting stands." />
                <meta itemProp="keywords" content="cricket partnership, run rate, batting partnership, strike rotation, partnership building, cricket strategy, batting analysis" />
                <meta itemProp="author" content="MegaCalc Cricket Strategy Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Partnership Run Rate: Building Championship Stands</h1>
                <p className="text-lg italic text-muted-foreground">Learn how to analyze batting partnerships, understand run rate dynamics, master strike rotation, and discover the strategies used by successful batting pairs to build match-winning stands.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is-partnership" className="hover:underline">What is Partnership Run Rate?</a></li>
                    <li><a href="#calculation-metrics" className="hover:underline">Calculation and Key Metrics</a></li>
                    <li><a href="#partnership-dynamics" className="hover:underline">Understanding Partnership Dynamics</a></li>
                    <li><a href="#strategic-importance" className="hover:underline">Strategic Importance of Partnerships</a></li>
                    <li><a href="#role-distribution" className="hover:underline">Role Distribution in Partnerships</a></li>
                    <li><a href="#building-partnerships" className="hover:underline">Building Successful Partnerships</a></li>
                    <li><a href="#format-differences" className="hover:underline">Format-Specific Partnership Strategies</a></li>
                    <li><a href="#famous-partnerships" className="hover:underline">Famous Partnerships in Cricket History</a></li>
                </ul>
                <hr />

                {/* WHAT IS PARTNERSHIP */}
                <h2 id="what-is-partnership" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Partnership Run Rate?</h2>
                <p>Partnership run rate measures the scoring pace of two batsmen batting together. It's calculated by dividing the total runs scored during the partnership by the number of overs faced. This metric helps assess whether a partnership is building momentum, consolidating, or struggling.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Partnerships Matter</h3>
                <p>Cricket is fundamentally a game of partnerships. While individual brilliance wins matches, partnerships provide the foundation. A strong partnership:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Builds Pressure:</strong> Forces bowling changes and defensive fields</li>
                    <li><strong>Provides Stability:</strong> Reduces risk of batting collapses</li>
                    <li><strong>Creates Momentum:</strong> Shifts match dynamics in team's favor</li>
                    <li><strong>Tires Bowlers:</strong> Long partnerships fatigue the bowling attack</li>
                    <li><strong>Enables Acceleration:</strong> Platform for late-innings aggression</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Partnership vs. Individual Performance</h3>
                <p>A partnership scoring at 6 runs per over is more valuable than two individual innings of 50 runs at 4 runs per over separated by wickets. Continuity matters as much as individual scores.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation-metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation and Key Metrics</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Partnership Run Rate</h3>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Partnership Run Rate = Total Partnership Runs ÷ Overs Faced</p>
                    <p className="text-xs mt-1">Example: 85 runs in 14.2 overs = 85 ÷ 14.33 = 5.93 RPO</p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Runs Per Ball</h3>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Runs Per Ball = Total Partnership Runs ÷ Balls Faced</p>
                    <p className="text-xs mt-1">Example: 85 runs off 86 balls = 85 ÷ 86 = 0.99 runs per ball</p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Individual Strike Rates</h3>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Strike Rate = (Runs Scored ÷ Balls Faced) × 100</p>
                    <p className="text-xs mt-1">Example: 45 runs off 38 balls = (45 ÷ 38) × 100 = 118.4 SR</p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Contribution Percentage</h3>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Contribution % = (Individual Runs ÷ Partnership Runs) × 100</p>
                    <p className="text-xs mt-1">Example: 45 runs in 85-run partnership = (45 ÷ 85) × 100 = 52.9%</p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dominant Batsman</h3>
                <p>The batsman who scores more runs or maintains a higher strike rate is considered dominant. However, the supporting batsman's role is equally crucial for partnership success.</p>

                <hr />

                {/* PARTNERSHIP DYNAMICS */}
                <h2 id="partnership-dynamics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Partnership Dynamics</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Strike Rotation</h3>
                <p>Effective partnerships rotate strike consistently, preventing bowlers from settling into rhythm. Ideally, batsmen should exchange ends every 2-3 balls through singles and twos.</p>
                <p className="mt-2"><strong>Benefits of Strike Rotation:</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Prevents bowlers from targeting one batsman repeatedly</li>
                    <li>Keeps both batsmen engaged and in rhythm</li>
                    <li>Forces field changes and disrupts bowling plans</li>
                    <li>Reduces pressure from dot balls</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Communication</h3>
                <p>Successful partnerships require constant communication about:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Running Between Wickets:</strong> Clear calls for singles, twos, and threes</li>
                    <li><strong>Bowling Analysis:</strong> Sharing insights about bowler variations</li>
                    <li><strong>Field Placements:</strong> Identifying gaps and scoring opportunities</li>
                    <li><strong>Match Situation:</strong> Discussing required run rate and strategy</li>
                    <li><strong>Mental Support:</strong> Encouraging each other during pressure moments</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Complementary Styles</h3>
                <p>The best partnerships often feature complementary batting styles:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Aggressor + Anchor:</strong> One attacks while other consolidates</li>
                    <li><strong>Right-Left Combination:</strong> Forces bowling and field changes</li>
                    <li><strong>Power + Placement:</strong> One hits boundaries, other rotates strike</li>
                    <li><strong>Experience + Youth:</strong> Veteran guides younger partner</li>
                </ul>

                <hr />

                {/* STRATEGIC IMPORTANCE */}
                <h2 id="strategic-importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Importance of Partnerships</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Opening Partnership</h3>
                <p>The opening partnership sets the tone for the innings. A strong start (50+ runs) provides:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Platform for middle order to build on</li>
                    <li>Psychological advantage over opposition</li>
                    <li>Opportunity to see off new ball</li>
                    <li>Momentum for the innings</li>
                </ul>
                <p className="mt-2"><strong>Benchmark:</strong> In T20s, 40+ in powerplay is good. In ODIs, 50+ in first 10 overs is solid. In Tests, surviving first hour is crucial.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Middle-Order Rebuilding</h3>
                <p>After early wickets, middle-order partnerships must:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Stabilize the innings and stop collapse</li>
                    <li>Assess conditions and rebuild carefully</li>
                    <li>Rotate strike without taking excessive risks</li>
                    <li>Create platform for late acceleration</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Finishing Partnerships</h3>
                <p>Late-innings partnerships (overs 15-20 in T20, 40-50 in ODI) focus on:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Maximizing run rate through boundaries</li>
                    <li>Targeting specific bowlers and overs</li>
                    <li>Taking calculated risks for big shots</li>
                    <li>Capitalizing on fielding restrictions</li>
                </ul>

                <hr />

                {/* ROLE DISTRIBUTION */}
                <h2 id="role-distribution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role Distribution in Partnerships</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Aggressor</h3>
                <p>Responsibilities:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Score boundaries to maintain run rate</li>
                    <li>Put pressure on bowlers</li>
                    <li>Target weaker bowlers aggressively</li>
                    <li>Take calculated risks for quick runs</li>
                </ul>
                <p className="mt-2"><strong>Ideal Strike Rate:</strong> 120+ in T20, 90+ in ODI, 60+ in Tests</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Anchor</h3>
                <p>Responsibilities:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Provide stability and occupy crease</li>
                    <li>Rotate strike consistently</li>
                    <li>Play out difficult bowlers</li>
                    <li>Support aggressor by maintaining pressure</li>
                </ul>
                <p className="mt-2"><strong>Ideal Strike Rate:</strong> 100-110 in T20, 70-80 in ODI, 45-55 in Tests</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Flexible Roles</h3>
                <p>In successful partnerships, roles aren't rigid. Batsmen should be able to switch between aggressor and anchor based on:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Who's seeing the ball better</li>
                    <li>Match-ups with current bowler</li>
                    <li>Match situation and required run rate</li>
                    <li>Field placements and scoring opportunities</li>
                </ul>

                <hr />

                {/* BUILDING PARTNERSHIPS */}
                <h2 id="building-partnerships" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Successful Partnerships</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Phase 1: Settlement (First 10-15 balls)</h3>
                <p>Focus on getting your eye in:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Watch the ball carefully, don't force shots</li>
                    <li>Play to your strengths, avoid risky shots</li>
                    <li>Communicate with partner about conditions</li>
                    <li>Assess bowler's line, length, and variations</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Phase 2: Consolidation (Next 20-30 balls)</h3>
                <p>Build the partnership foundation:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Rotate strike regularly through singles</li>
                    <li>Identify scoring areas and gaps in field</li>
                    <li>Target loose deliveries for boundaries</li>
                    <li>Build pressure on bowlers through dot-ball minimization</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Phase 3: Acceleration (After Settlement)</h3>
                <p>Once set, increase scoring rate:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Target specific bowlers for boundaries</li>
                    <li>Take calculated risks on good deliveries</li>
                    <li>Exploit field placements aggressively</li>
                    <li>Maintain strike rotation while scoring boundaries</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dealing with Pressure</h3>
                <p>When partnership is under pressure (dot balls accumulating, required rate rising):</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Stay Calm:</strong> Don't panic, assess situation rationally</li>
                    <li><strong>Communicate:</strong> Discuss strategy with partner</li>
                    <li><strong>Target Weak Links:</strong> Identify easiest bowler to score off</li>
                    <li><strong>Rotate Strike:</strong> Keep scoreboard moving with singles</li>
                    <li><strong>One Big Over:</strong> Plan to target specific over for acceleration</li>
                </ul>

                <hr />

                {/* FORMAT DIFFERENCES */}
                <h2 id="format-differences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Format-Specific Partnership Strategies</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Partnerships</h3>
                <p><strong>Characteristics:</strong> High risk, high reward. Partnerships rarely last more than 10 overs.</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Target Run Rate:</strong> 8-10 runs per over minimum</li>
                    <li><strong>Powerplay Focus:</strong> Maximize first 6 overs (field restrictions)</li>
                    <li><strong>Death Overs:</strong> Aim for 12-15 runs per over in final 5</li>
                    <li><strong>Boundary Percentage:</strong> 40-50% of runs should come from boundaries</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Partnerships</h3>
                <p><strong>Characteristics:</strong> Balance between aggression and consolidation. Partnerships can build over 20+ overs.</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Target Run Rate:</strong> 5-6 RPO in middle overs, 7-9 in death</li>
                    <li><strong>Phase-Based:</strong> Powerplay (6 RPO), middle (5 RPO), death (8+ RPO)</li>
                    <li><strong>Century Partnerships:</strong> 100+ run partnerships are match-winning</li>
                    <li><strong>Strike Rotation:</strong> Critical in middle overs to prevent pressure</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Partnerships</h3>
                <p><strong>Characteristics:</strong> Patience and endurance. Partnerships can last entire sessions or days.</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Target Run Rate:</strong> 3-4 RPO is healthy, 2.5+ acceptable</li>
                    <li><strong>Session-Based:</strong> Aim to bat entire session without losing wicket</li>
                    <li><strong>Big Partnerships:</strong> 150+ run partnerships shift match momentum</li>
                    <li><strong>Patience:</strong> Leave deliveries outside off, wait for scoring opportunities</li>
                </ul>

                <hr />

                {/* FAMOUS PARTNERSHIPS */}
                <h2 id="famous-partnerships" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Famous Partnerships in Cricket History</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Record Partnerships</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>413 - V.V.S. Laxman & Rahul Dravid (India vs. Australia, 2001):</strong> Match-winning partnership that turned around a Test match after following on</li>
                    <li><strong>372 - Mahela Jayawardene & Kumar Sangakkara (Sri Lanka vs. South Africa, 2006):</strong> Record ODI partnership showcasing perfect strike rotation</li>
                    <li><strong>229 - Hashim Amla & AB de Villiers (South Africa vs. West Indies, 2015):</strong> Record T20I partnership demonstrating controlled aggression</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">What Made Them Special</h3>
                <p>These partnerships shared common traits:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Complementary Styles:</strong> Partners had different strengths that meshed perfectly</li>
                    <li><strong>Excellent Communication:</strong> Constant dialogue about strategy and tactics</li>
                    <li><strong>Pressure Handling:</strong> Thrived in high-pressure situations</li>
                    <li><strong>Strike Rotation:</strong> Kept scoreboard moving without taking excessive risks</li>
                    <li><strong>Match Awareness:</strong> Understood situation and adapted accordingly</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Partnerships are the building blocks of successful innings in cricket. While individual brilliance captures headlines, it's the partnerships that provide the foundation for match-winning performances. Understanding partnership run rate, dynamics, and strategies helps teams build momentum, apply pressure, and ultimately win matches.</p>

                <p>Use this calculator to analyze partnership effectiveness, identify dominant batsmen, assess scoring pace, and make informed strategic decisions about when to consolidate and when to accelerate. Remember that great partnerships are built on communication, complementary skills, and shared understanding of match situations.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common questions about cricket partnerships
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good partnership run rate in T20 cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, a partnership run rate of 8-10 runs per over is considered good, 10-12 is excellent, and above 12 is exceptional. However, context matters - a 6 RPO partnership after early wickets can be valuable for stabilization, while 8 RPO in the powerplay might be below par.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How important is strike rotation in partnerships?</h4>
                            <p className="text-muted-foreground">
                                Strike rotation is crucial for partnership success. It prevents bowlers from settling into rhythm, keeps both batsmen engaged, forces field changes, and maintains scoring pressure without excessive risk. Ideally, batsmen should rotate strike every 2-3 balls through singles and twos.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What makes a partnership "dominant" vs. "balanced"?</h4>
                            <p className="text-muted-foreground">
                                A dominant partnership has one batsman contributing 60%+ of runs or maintaining significantly higher strike rate. A balanced partnership has both batsmen contributing 45-55% of runs with similar strike rates. Both can be effective - dominance works when one batsman is in exceptional form, while balance provides stability and flexibility.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do right-left batting combinations help partnerships?</h4>
                            <p className="text-muted-foreground">
                                Right-left combinations force bowlers to constantly adjust line and length, disrupt rhythm, require field changes, and make it harder to bowl consistently. This creates more scoring opportunities and puts additional pressure on the bowling team. However, the benefits only materialize if both batsmen can score effectively.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's more important: partnership runs or partnership duration?</h4>
                            <p className="text-muted-foreground">
                                It depends on format and match situation. In T20s, runs matter more than duration - a 50-run partnership in 4 overs is better than 50 in 8 overs. In Tests, duration can be equally important - batting 30 overs for 80 runs might be more valuable than 80 runs in 15 overs if you're saving a match. Context is key.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How should partnerships handle pressure situations?</h4>
                            <p className="text-muted-foreground">
                                Under pressure (dot balls accumulating, required rate rising), partnerships should: (1) Stay calm and communicate, (2) Rotate strike to keep scoreboard moving, (3) Identify the weakest bowler to target, (4) Plan to attack one specific over for momentum shift, (5) Avoid rash shots that risk both wickets. One big over can release pressure.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the ideal contribution split in a partnership?</h4>
                            <p className="text-muted-foreground">
                                There's no single ideal split. A 50-50 balanced partnership provides stability. A 60-40 split with one dominant batsman works when that player is in exceptional form. Even 70-30 can be effective if the supporting batsman rotates strike well and allows the dominant player to flourish. The key is both batsmen contributing positively.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do partnerships differ between batting first and chasing?</h4>
                            <p className="text-muted-foreground">
                                When batting first, partnerships can be more patient, building platform before accelerating. When chasing, partnerships must be aware of required run rate from the start. Chasing partnerships often have clearer targets and timelines, while first-innings partnerships have more flexibility to adapt based on conditions and opposition bowling.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the most critical partnership in an innings?</h4>
                            <p className="text-muted-foreground">
                                The opening partnership sets the tone, but the most critical is often the first partnership after early wickets. If a team loses 2-3 early wickets, the next partnership must stabilize the innings and prevent collapse. This "rebuilding partnership" determines whether the team posts a competitive total or folds cheaply.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a slow partnership ever be beneficial?</h4>
                            <p className="text-muted-foreground">
                                Yes, in specific contexts: (1) Test cricket when saving a match, (2) After early wickets when stabilization is needed, (3) Difficult pitch conditions where survival is priority, (4) Seeing off a dangerous spell from quality bowlers. However, in limited-overs cricket, even "slow" partnerships should maintain 4-5 RPO minimum to avoid excessive pressure later.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage of this Calculator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Usage of this Calculator
                    </CardTitle>
                    <CardDescription>
                        Practical applications and real-world context
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Who should use */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            Who Should Use This Calculator?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Coaches & Team Analysts</strong>
                                <span className="text-sm text-muted-foreground">Analyze partnership effectiveness, identify successful batting combinations, and plan strategic pairings.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Cricket Commentators</strong>
                                <span className="text-sm text-muted-foreground">Provide real-time partnership analysis and context about scoring pace and contribution balance.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Players & Batsmen</strong>
                                <span className="text-sm text-muted-foreground">Understand partnership dynamics, assess personal contribution, and improve strike rotation skills.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Cricket Statisticians</strong>
                                <span className="text-sm text-muted-foreground">Track partnership records, analyze historical data, and identify trends in batting combinations.</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border/50" />

                    {/* Limitations */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Limitations & When It May Be Misleading
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>No Context of Match Situation:</strong> A 5 RPO partnership might be excellent after early collapse or poor on a flat pitch chasing a big total.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Doesn't Account for Extras:</strong> Runs from wides, no-balls, and byes aren't attributed to batsmen but affect partnership total.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Quality of Opposition Not Considered:</strong> Scoring 6 RPO against world-class bowling is more impressive than 8 RPO against weak attack.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Pitch and Conditions Ignored:</strong> Partnership run rate should be evaluated relative to pitch difficulty and weather conditions.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>No Qualitative Assessment:</strong> Calculator can't measure communication quality, running between wickets, or psychological pressure handling.</span>
                            </li>
                        </ul>
                    </div>

                    <hr className="border-border/50" />

                    {/* Real World Examples */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Trophy className="h-5 w-5 text-green-600" />
                            Real-World Examples
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Balanced T20 Partnership</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Partnership: 92 runs off 54 balls. Player A: 48 runs (28 balls, SR 171). Player B: 44 runs (26 balls, SR 169). Partnership RR: 10.2 RPO. This demonstrates a perfectly balanced partnership with both batsmen scoring at similar high strike rates, ideal for T20 cricket's demands.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: Dominant ODI Partnership</h5>
                                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                                    Partnership: 156 runs off 162 balls. Player A: 102 runs (98 balls, SR 104). Player B: 54 runs (64 balls, SR 84). Partnership RR: 5.8 RPO. Player A dominates with 65% contribution, while Player B provides crucial support by rotating strike and allowing the dominant batsman to flourish.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: Test Match Rebuilding Partnership</h5>
                                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                                    Partnership: 127 runs off 288 balls (48 overs). Player A: 68 runs (156 balls, SR 44). Player B: 59 runs (132 balls, SR 45). Partnership RR: 2.6 RPO. After early collapse, this patient partnership stabilized the innings, demonstrating that in Tests, occupying the crease and tiring bowlers can be more valuable than quick runs.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>The Cricket Partnership Run Rate Calculator analyzes batting partnerships by measuring scoring pace, individual contributions, and partnership effectiveness across different match formats.</p>
                    <p>Use this tool to evaluate partnership quality, identify dominant batsmen, assess strike rotation efficiency, and make strategic decisions about batting combinations and role distribution.</p>
                    <p>Remember that successful partnerships combine complementary skills, excellent communication, and shared understanding of match situations to build match-winning stands.</p>
                </CardContent>
            </Card>
        </div>
    );
}
