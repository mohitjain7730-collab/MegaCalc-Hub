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

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">About Partnership Analysis</h3>
                            <p className="text-sm text-muted-foreground">
                                The Cricket Partnership Run Rate Calculator analyzes the scoring pace and effectiveness of batting partnerships.
                                It evaluates both the combined partnership metrics and individual contributions to provide comprehensive insights.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Understanding partnership dynamics helps teams assess momentum, identify dominant batsmen, and make strategic decisions about acceleration or consolidation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
