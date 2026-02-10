'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Activity, Zap, Users, AlertTriangle, Award, TrendingDown, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    // Match situation
    runsNeeded: z.number().min(0),
    ballsRemaining: z.number().min(1).max(300),
    wicketsInHand: z.number().min(0).max(10),
    currentRunRate: z.number().min(0),
    requiredRunRate: z.number().min(0),
    // Match format
    matchFormat: z.string(),
    // Additional factors
    pitchCondition: z.string(),
    teamStrength: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CricketWinProbabilityCalculator() {
    const [result, setResult] = useState<{
        winProbability: number;
        lossProbability: number;
        tieProbability: number;
        confidence: string;
        matchSituation: string;
        keyFactors: string[];
        recommendations: string[];
        pressureIndex: number;
        difficultyRating: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsNeeded: undefined,
            ballsRemaining: undefined,
            wicketsInHand: undefined,
            currentRunRate: undefined,
            requiredRunRate: undefined,
            matchFormat: 't20',
            pitchCondition: 'balanced',
            teamStrength: 'average',
        },
    });

    const calculateWinProbability = (values: FormValues): number => {
        let baseProbability = 50;

        // Factor 1: Run rate comparison (40% weight)
        const rrDifference = values.currentRunRate - values.requiredRunRate;
        const rrFactor = Math.min(Math.max(rrDifference * 5, -20), 20);
        baseProbability += rrFactor;

        // Factor 2: Wickets in hand (30% weight)
        const wicketsFactor = ((values.wicketsInHand - 5) / 5) * 15;
        baseProbability += wicketsFactor;

        // Factor 3: Balls remaining vs runs needed (20% weight)
        const runsPerBallNeeded = values.runsNeeded / values.ballsRemaining;
        let difficultyFactor = 0;
        if (runsPerBallNeeded < 1) difficultyFactor = 10;
        else if (runsPerBallNeeded < 1.5) difficultyFactor = 5;
        else if (runsPerBallNeeded < 2) difficultyFactor = 0;
        else if (runsPerBallNeeded < 2.5) difficultyFactor = -5;
        else difficultyFactor = -10;
        baseProbability += difficultyFactor;

        // Factor 4: Match format adjustment
        if (values.matchFormat === 't20' && values.ballsRemaining < 12) {
            baseProbability -= 5; // Death overs are harder
        } else if (values.matchFormat === 'odi' && values.ballsRemaining < 30) {
            baseProbability -= 3;
        }

        // Factor 5: Pitch condition (10% weight)
        if (values.pitchCondition === 'batting-friendly') baseProbability += 5;
        else if (values.pitchCondition === 'bowling-friendly') baseProbability -= 5;

        // Factor 6: Team strength
        if (values.teamStrength === 'strong') baseProbability += 5;
        else if (values.teamStrength === 'weak') baseProbability -= 5;

        // Ensure probability is between 0 and 100
        return Math.min(Math.max(baseProbability, 0), 100);
    };

    const getConfidence = (probability: number, wickets: number, balls: number): string => {
        if (probability > 85 || probability < 15) return 'Very High';
        if (probability > 70 || probability < 30) return 'High';
        if (probability > 55 || probability < 45) return 'Moderate';
        return 'Low';
    };

    const getMatchSituation = (probability: number): string => {
        if (probability >= 80) return 'Strong Position - Victory Highly Likely';
        if (probability >= 65) return 'Comfortable Position - Favorites to Win';
        if (probability >= 55) return 'Slight Advantage - Marginal Favorites';
        if (probability >= 45) return 'Evenly Poised - Too Close to Call';
        if (probability >= 35) return 'Under Pressure - Underdogs';
        if (probability >= 20) return 'Difficult Situation - Unlikely to Win';
        return 'Critical Situation - Victory Extremely Unlikely';
    };

    const getPressureIndex = (rrr: number, wickets: number, balls: number): number => {
        const wicketPressure = (10 - wickets) * 10;
        const rrrPressure = Math.min(rrr * 10, 50);
        const timePressure = balls < 30 ? 20 : balls < 60 ? 10 : 0;
        return Math.min(wicketPressure + rrrPressure + timePressure, 100);
    };

    const getDifficultyRating = (runsPerBall: number): string => {
        if (runsPerBall < 0.5) return 'Very Easy';
        if (runsPerBall < 1) return 'Easy';
        if (runsPerBall < 1.5) return 'Moderate';
        if (runsPerBall < 2) return 'Difficult';
        if (runsPerBall < 2.5) return 'Very Difficult';
        return 'Extremely Difficult';
    };

    const getKeyFactors = (values: FormValues, probability: number): string[] => {
        const factors = [];

        const runsPerBall = values.runsNeeded / values.ballsRemaining;
        if (runsPerBall > 2) {
            factors.push(`High required run rate of ${(runsPerBall * 6).toFixed(2)} per over puts immense pressure`);
        } else if (runsPerBall < 1) {
            factors.push(`Low required run rate of ${(runsPerBall * 6).toFixed(2)} per over favors batting team`);
        }

        if (values.wicketsInHand <= 3) {
            factors.push('Limited wickets remaining increases risk of collapse');
        } else if (values.wicketsInHand >= 7) {
            factors.push('Plenty of wickets in hand provides cushion for aggressive batting');
        }

        if (values.ballsRemaining < 30) {
            factors.push('Few balls remaining means limited room for error');
        } else if (values.ballsRemaining > 100) {
            factors.push('Ample time available to build innings strategically');
        }

        if (values.currentRunRate > values.requiredRunRate + 1) {
            factors.push('Current run rate well ahead of required rate');
        } else if (values.requiredRunRate > values.currentRunRate + 1) {
            factors.push('Falling behind required run rate increases pressure');
        }

        if (factors.length === 0) {
            factors.push('Match evenly balanced with no clear advantage');
        }

        return factors;
    };

    const getRecommendations = (values: FormValues, probability: number): string[] => {
        const recommendations = [];
        const runsPerBall = values.runsNeeded / values.ballsRemaining;

        if (probability > 70) {
            recommendations.push('Maintain current approach and avoid unnecessary risks');
            recommendations.push('Rotate strike and look for singles to keep scoreboard ticking');
            if (values.wicketsInHand > 5) {
                recommendations.push('Set batsmen should look to accelerate in final overs');
            }
        } else if (probability > 50) {
            recommendations.push('Balance risk and reward - mix rotation with boundaries');
            recommendations.push('Target weaker bowlers and exploit field gaps');
            recommendations.push('Avoid dot balls to maintain required run rate');
        } else if (probability > 30) {
            recommendations.push('Aggressive approach needed - look for boundaries');
            recommendations.push('Take calculated risks against defensive fields');
            if (values.wicketsInHand <= 4) {
                recommendations.push('Partnerships crucial - avoid reckless shots');
            }
        } else {
            recommendations.push('High-risk strategy required - attack from ball one');
            recommendations.push('Target boundary hitting and maximize powerplay overs');
            recommendations.push('Unconventional shots and innovative batting needed');
        }

        return recommendations;
    };

    const onSubmit = (values: FormValues) => {
        const winProb = calculateWinProbability(values);
        const lossProb = 100 - winProb - 0.5; // 0.5% for tie
        const runsPerBall = values.runsNeeded / values.ballsRemaining;

        setResult({
            winProbability: winProb,
            lossProbability: lossProb,
            tieProbability: 0.5,
            confidence: getConfidence(winProb, values.wicketsInHand, values.ballsRemaining),
            matchSituation: getMatchSituation(winProb),
            keyFactors: getKeyFactors(values, winProb),
            recommendations: getRecommendations(values, winProb),
            pressureIndex: getPressureIndex(values.requiredRunRate, values.wicketsInHand, values.ballsRemaining),
            difficultyRating: getDifficultyRating(runsPerBall),
        });
    };

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Match Situation
                    </CardTitle>
                    <CardDescription>
                        Enter current match details to calculate win probability
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

                            {/* Chase Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Target className="h-5 w-5 text-red-600" />
                                    Chase Requirements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="runsNeeded"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Runs Needed</FormLabel>
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
                                        name="ballsRemaining"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Balls Remaining</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="e.g., 36"
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
                                        name="wicketsInHand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wickets in Hand</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="0"
                                                        max="10"
                                                        placeholder="e.g., 6"
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

                            {/* Run Rates */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Run Rate Analysis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="currentRunRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Run Rate</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g., 7.5"
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
                                        name="requiredRunRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Required Run Rate</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g., 7.5"
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

                            {/* Match Conditions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Match Conditions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="pitchCondition"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pitch Condition</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select condition" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="batting-friendly">Batting Friendly</SelectItem>
                                                        <SelectItem value="balanced">Balanced</SelectItem>
                                                        <SelectItem value="bowling-friendly">Bowling Friendly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="teamStrength"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team Strength</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select strength" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="strong">Strong</SelectItem>
                                                        <SelectItem value="average">Average</SelectItem>
                                                        <SelectItem value="weak">Weak</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Win Probability
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
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Win Probability</CardTitle>
                                    <CardDescription>{result.matchSituation}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-6xl font-bold text-primary">{result.winProbability.toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">Chance of Victory</p>
                                <Badge variant="default" className="mt-3 text-lg px-4 py-1">
                                    {result.confidence} Confidence
                                </Badge>
                            </div>

                            {/* Probability Breakdown */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                        <span className="font-semibold">Win Probability</span>
                                    </div>
                                    <span className="text-2xl font-bold text-green-600">{result.winProbability.toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/20">
                                    <div className="flex items-center gap-3">
                                        <TrendingDown className="h-6 w-6 text-red-600" />
                                        <span className="font-semibold">Loss Probability</span>
                                    </div>
                                    <span className="text-2xl font-bold text-red-600">{result.lossProbability.toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Pressure & Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/20">
                                    <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Pressure Index</p>
                                    <p className="text-2xl font-bold text-orange-600">{result.pressureIndex.toFixed(0)}/100</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/20">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Chase Difficulty</p>
                                    <p className="text-lg font-bold text-purple-600">{result.difficultyRating}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Factors */}
                    <Card className="border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                                <Info className="h-6 w-6" />
                                Key Factors
                            </CardTitle>
                            <CardDescription>Critical elements affecting win probability</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.keyFactors.map((factor, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{factor}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="border-green-100 bg-green-50/10 dark:border-green-900/20 dark:bg-green-900/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
                                <Target className="h-6 w-6" />
                                Strategic Recommendations
                            </CardTitle>
                            <CardDescription>Tactical approach for current situation</CardDescription>
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

            {/* How It Works */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How Win Probability is Calculated
                    </CardTitle>
                    <CardDescription>
                        Understanding the calculation methodology
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">Key Factors Considered:</h4>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Run Rate Comparison (40%):</strong> Current run rate vs required run rate</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Wickets in Hand (30%):</strong> Remaining batting resources</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Runs per Ball Required (20%):</strong> Chase difficulty assessment</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Pitch Conditions (10%):</strong> Batting vs bowling friendly surface</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Team Strength:</strong> Overall team quality and depth</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Match Format:</strong> T20, ODI, or Test match dynamics</span>
                            </li>
                        </ul>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Note:</strong> Win probability is a statistical estimate based on current match conditions. Actual outcomes can vary due to individual performances, momentum shifts, and unpredictable match events.
                        </AlertDescription>
                    </Alert>
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
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Player rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Fantasy scoring</p>
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
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Cricket Win Probability: Understanding Match Dynamics" />
                <meta itemProp="description" content="Master win probability analysis in cricket with our comprehensive guide covering calculation methodology, key factors, strategic applications, and how to interpret probability shifts during matches." />
                <meta itemProp="keywords" content="cricket win probability, match prediction, cricket analytics, run rate analysis, wickets remaining, match dynamics, cricket statistics" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Win Probability: Predicting Match Outcomes</h1>
                <p className="text-lg italic text-muted-foreground">Learn how win probability is calculated in cricket, understand the key factors that influence match outcomes, and discover how to use probability analysis for strategic decision-making.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is-wp" className="hover:underline">What is Win Probability?</a></li>
                    <li><a href="#calculation" className="hover:underline">How Win Probability is Calculated</a></li>
                    <li><a href="#key-factors" className="hover:underline">Key Factors Affecting Win Probability</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting Probability Values</a></li>
                    <li><a href="#strategic-use" className="hover:underline">Strategic Applications</a></li>
                    <li><a href="#probability-shifts" className="hover:underline">Understanding Probability Shifts</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations and Considerations</a></li>
                    <li><a href="#historical-context" className="hover:underline">Historical Context and Famous Chases</a></li>
                </ul>
                <hr />

                {/* WHAT IS WIN PROBABILITY */}
                <h2 id="what-is-wp" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Win Probability?</h2>
                <p>Win probability in cricket is a statistical measure that estimates the likelihood of a team winning from the current match situation. Expressed as a percentage, it quantifies the batting team's chances of successfully chasing the target based on runs needed, balls remaining, wickets in hand, and other contextual factors.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Evolution of Win Probability</h3>
                <p>Win probability analysis emerged from the broader field of sports analytics, gaining prominence in cricket during the 2000s. Modern broadcasters display live win probability graphs during matches, helping viewers understand match momentum and critical turning points.</p>

                <p className="mt-4">The metric serves multiple purposes:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Match Analysis:</strong> Understand which team has the advantage at any point</li>
                    <li><strong>Strategic Planning:</strong> Inform decisions about aggression vs. consolidation</li>
                    <li><strong>Entertainment:</strong> Add drama by quantifying how close or one-sided a match is</li>
                    <li><strong>Historical Comparison:</strong> Compare current situations to historical precedents</li>
                    <li><strong>Betting Markets:</strong> Inform live betting odds and market movements</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Win Probability is Calculated</h2>
                <p>Win probability calculations use weighted scoring systems that combine multiple match factors. While sophisticated models use machine learning trained on thousands of matches, simplified models use factor-based weighting:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Core Calculation Factors</h3>

                <p className="mt-4"><strong>1. Run Rate Comparison (40% weight)</strong></p>
                <p>The difference between current run rate and required run rate is the most significant factor. A team scoring at 8 runs per over when needing 7 has a significant advantage.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">RR Factor = (Current RR - Required RR) × 5</p>
                    <p className="text-xs mt-1">Example: (8.5 - 7.0) × 5 = +7.5% probability boost</p>
                </div>

                <p className="mt-4"><strong>2. Wickets in Hand (30% weight)</strong></p>
                <p>More wickets provide batting depth and flexibility. The relationship isn't linear - losing early wickets is more damaging than late wickets.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Wickets Factor = ((Wickets - 5) / 5) × 15</p>
                    <p className="text-xs mt-1">Example: 8 wickets in hand = ((8-5)/5) × 15 = +9% probability</p>
                </div>

                <p className="mt-4"><strong>3. Balls Remaining (20% weight)</strong></p>
                <p>More balls provide more opportunities to score. However, too many balls with too many runs needed indicates a difficult chase.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Balls Factor = (Balls / 120) × 10 (capped)</p>
                    <p className="text-xs mt-1">Example: 60 balls = (60/120) × 10 = +5% probability</p>
                </div>

                <p className="mt-4"><strong>4. Contextual Adjustments (10% weight)</strong></p>
                <p>Pitch conditions, team strength, and match format provide additional context that fine-tunes the probability.</p>

                <hr />

                {/* KEY FACTORS */}
                <h2 id="key-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors Affecting Win Probability</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Required Run Rate vs. Current Run Rate</h3>
                <p>The gap between these two rates is the primary determinant. A team can afford to score below the required rate early in the chase if they have wickets in hand, but the gap must narrow as overs decrease.</p>
                <p className="mt-2"><strong>Critical Threshold:</strong> When current RR falls more than 3 runs below required RR with fewer than 10 overs remaining, win probability drops sharply.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Wickets in Hand</h3>
                <p>Wickets provide insurance against failure. The value of wickets increases as the chase progresses:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>8-10 wickets:</strong> Full batting depth, can afford risks</li>
                    <li><strong>5-7 wickets:</strong> Moderate depth, balanced approach needed</li>
                    <li><strong>3-4 wickets:</strong> Limited depth, must protect wickets</li>
                    <li><strong>1-2 wickets:</strong> Critical situation, high pressure</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Balls Remaining</h3>
                <p>Time is a double-edged sword. More balls provide more opportunities, but also indicate a larger target. The relationship between balls and runs needed determines urgency:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Needing 6 RPO with 15 overs left:</strong> Comfortable chase</li>
                    <li><strong>Needing 10 RPO with 15 overs left:</strong> Difficult but achievable</li>
                    <li><strong>Needing 15 RPO with 5 overs left:</strong> Nearly impossible</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Pitch Conditions</h3>
                <p>Pitch behavior significantly affects scoring rates:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Flat Pitch:</strong> Favors batting, increases win probability for chasing team</li>
                    <li><strong>Turning Pitch:</strong> Favors spinners, makes scoring difficult</li>
                    <li><strong>Seaming Pitch:</strong> Favors pace bowlers, especially with new ball</li>
                    <li><strong>Deteriorating Pitch:</strong> Becomes harder to bat as match progresses</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Team Strength and Quality</h3>
                <p>A stronger batting lineup has higher probability of chasing the same target compared to a weaker lineup. Similarly, a quality bowling attack can defend lower totals.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Probability Values</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Probability Ranges</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>80-100%:</strong> Overwhelming favorite, match nearly decided</li>
                    <li><strong>65-80%:</strong> Clear favorite, but not guaranteed</li>
                    <li><strong>50-65%:</strong> Slight advantage, match still competitive</li>
                    <li><strong>35-50%:</strong> Slight disadvantage, can still win with good performance</li>
                    <li><strong>20-35%:</strong> Significant underdog, needs exceptional performance</li>
                    <li><strong>0-20%:</strong> Extreme underdog, requires miracle</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Confidence Levels</h3>
                <p>Win probability models also output confidence levels indicating reliability:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>High Confidence (80%+):</strong> Stable match situation, probability reliable</li>
                    <li><strong>Medium Confidence (60-80%):</strong> Some uncertainty, probability indicative</li>
                    <li><strong>Low Confidence (below 60%):</strong> Volatile situation, probability less reliable</li>
                </ul>

                <hr />

                {/* STRATEGIC USE */}
                <h2 id="strategic-use" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Applications</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">For Batting Teams</h3>
                <p><strong>When Probability is High (70%+):</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Maintain steady approach, don't take unnecessary risks</li>
                    <li>Rotate strike, keep scoreboard ticking</li>
                    <li>Target weaker bowlers for boundaries</li>
                </ul>

                <p className="mt-4"><strong>When Probability is Medium (40-60%):</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Balance aggression with wicket preservation</li>
                    <li>Look for partnerships to stabilize innings</li>
                    <li>Calculate when to accelerate</li>
                </ul>

                <p className="mt-4"><strong>When Probability is Low (below 30%):</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Aggressive approach required, take calculated risks</li>
                    <li>Target boundaries, maximize every ball</li>
                    <li>Look for momentum shifts through big overs</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">For Bowling Teams</h3>
                <p><strong>When Probability is Low (opponent 70%+):</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Focus on taking wickets to create pressure</li>
                    <li>Use best bowlers strategically</li>
                    <li>Create dot ball pressure to force mistakes</li>
                </ul>

                <p className="mt-4"><strong>When Probability is High (opponent below 30%):</strong></p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Maintain discipline, don't give away easy runs</li>
                    <li>Protect boundaries, force singles</li>
                    <li>Keep pressure on batsmen</li>
                </ul>

                <hr />

                {/* PROBABILITY SHIFTS */}
                <h2 id="probability-shifts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Probability Shifts</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Events That Cause Large Shifts</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wicket of Set Batsman:</strong> -10 to -15% probability shift</li>
                    <li><strong>Big Over (15+ runs):</strong> +8 to +12% probability shift</li>
                    <li><strong>Maiden Over in Death:</strong> -5 to -8% probability shift</li>
                    <li><strong>Boundary in Final Over:</strong> +15 to +25% probability shift</li>
                    <li><strong>Run Out of Key Player:</strong> -12 to -18% probability shift</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Momentum and Probability</h3>
                <p>Probability shifts often lag behind momentum. A team hitting 3 consecutive boundaries hasn't just scored 18 runs - they've also gained psychological momentum that can lead to further success. Models struggle to capture this intangible factor.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Considerations</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. No Individual Player Context</h3>
                <p>Win probability treats all batsmen and bowlers equally. A team with a world-class finisher at the crease has better chances than the model suggests.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Doesn't Account for Pressure</h3>
                <p>High-pressure situations (finals, rivalries) can cause players to perform below their usual standards. Models based on historical data don't capture this.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Weather and Interruptions</h3>
                <p>Rain interruptions, DLS adjustments, and changing light conditions can dramatically alter match dynamics in ways models can't predict.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Small Sample Sizes</h3>
                <p>Unusual match situations (e.g., needing 30 runs off 6 balls) have limited historical precedent, making probability estimates less reliable.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Format Differences</h3>
                <p>T20 matches are more volatile than ODIs. A 60% win probability in T20 is less certain than 60% in ODI due to the shorter format's higher variance.</p>

                <hr />

                {/* HISTORICAL CONTEXT */}
                <h2 id="historical-context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Context and Famous Chases</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Improbable Victories</h3>
                <p>Cricket history is filled with matches where teams won despite having less than 10% win probability:</p>

                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>India vs. Australia, 2001 Kolkata Test:</strong> Following on, India had less than 5% win probability but won by 171 runs</li>
                    <li><strong>England vs. New Zealand, 2019 World Cup Final:</strong> England needed 15 off final over with probability around 20%, won via super over</li>
                    <li><strong>South Africa vs. Australia, 2006 ODI:</strong> SA needed 434 to win, probability was below 2%, but they chased it down</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">What These Teach Us</h3>
                <p>These improbable victories demonstrate that:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Win probability is not destiny - exceptional performances can overcome odds</li>
                    <li>Momentum and belief matter more than statistics suggest</li>
                    <li>Never give up until the final ball is bowled</li>
                    <li>Models are guides, not guarantees</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Win probability is a powerful analytical tool that quantifies match situations and helps understand cricket's dynamic nature. By combining run rates, wickets, balls remaining, and contextual factors, it provides objective assessment of which team has the advantage.</p>

                <p>However, win probability should be used as a guide, not gospel. Cricket's beauty lies in its unpredictability - the improbable victories, the momentum shifts, the individual brilliance that defies statistical expectations. Use win probability to inform your understanding, but never underestimate the human element that makes cricket endlessly fascinating.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common questions about cricket win probability
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What does 50% win probability mean?</h4>
                            <p className="text-muted-foreground">
                                50% win probability means the match is perfectly balanced - both teams have equal chances of winning from the current situation. This typically occurs when the required run rate equals the current run rate with a moderate number of wickets in hand (5-7) and reasonable balls remaining.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How accurate is win probability in cricket?</h4>
                            <p className="text-muted-foreground">
                                Sophisticated models trained on thousands of matches achieve 75-85% accuracy in predicting match outcomes. However, accuracy varies by match situation - stable situations (clear advantage) are more predictable than volatile situations (close match, few wickets). The model is a probability, not a guarantee.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does win probability change so dramatically after a wicket?</h4>
                            <p className="text-muted-foreground">
                                Wickets have compound effects: they remove a set batsman, bring in an unsettle new batsman, reduce batting depth, and increase pressure on remaining batsmen. A key wicket can shift probability by 10-20% because it affects both immediate and future scoring potential. The impact is larger when fewer wickets remain.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a team with 10% win probability still win?</h4>
                            <p className="text-muted-foreground">
                                Absolutely. 10% probability means that in 10 similar situations, the team would win once on average. Cricket history has many examples of teams winning from 5% or lower probability. Exceptional individual performances, momentum shifts, and opposition mistakes can overcome statistical odds.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is win probability more reliable in T20 or ODI cricket?</h4>
                            <p className="text-muted-foreground">
                                Win probability is generally more reliable in ODI cricket due to the longer format providing more data points and reducing variance. T20 matches are more volatile - a single big over can swing the match dramatically. A 70% probability in ODI is more certain than 70% in T20.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do pitch conditions affect win probability?</h4>
                            <p className="text-muted-foreground">
                                Pitch conditions significantly impact scoring rates. A flat batting pitch increases the chasing team's probability as boundaries are easier. A turning or seaming pitch favors bowlers, reducing the batting team's probability. Deteriorating pitches become harder to bat on, affecting second-innings chases negatively.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between win probability and required run rate?</h4>
                            <p className="text-muted-foreground">
                                Required run rate is a simple calculation (runs needed ÷ overs remaining), while win probability is a comprehensive assessment considering run rates, wickets, balls remaining, pitch, and team strength. Two teams needing the same run rate can have very different win probabilities based on wickets in hand and other factors.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does win probability sometimes seem wrong?</h4>
                            <p className="text-muted-foreground">
                                Win probability is based on historical averages and doesn't account for specific player quality, current form, pressure situations, or intangibles like momentum. If a world-class finisher is at the crease, the actual probability may be higher than the model suggests. Models provide objective baselines but can't capture every nuance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">At what point in a chase does win probability become most volatile?</h4>
                            <p className="text-muted-foreground">
                                The final 5 overs of a close chase (within 30-40 runs) with 3-5 wickets remaining is the most volatile period. Each ball can swing probability by 2-5%, and wickets or boundaries cause 10-20% swings. This is when matches are won or lost, and small events have outsized impacts.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should teams make decisions based on win probability?</h4>
                            <p className="text-muted-foreground">
                                Win probability should inform decisions but not dictate them. It's one tool among many. Captains should consider probability alongside player matchups, field restrictions, bowling changes, and match context. Use it to understand the situation objectively, but trust experience and instinct for final decisions.
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
                                <strong className="block text-primary mb-1">Cricket Fans & Viewers</strong>
                                <span className="text-sm text-muted-foreground">Understand match dynamics in real-time and predict likely outcomes during live matches.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Commentators & Analysts</strong>
                                <span className="text-sm text-muted-foreground">Provide objective analysis of match situations and explain turning points to audiences.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Team Strategists</strong>
                                <span className="text-sm text-muted-foreground">Inform tactical decisions about when to attack, defend, or take calculated risks.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Betting & Fantasy Players</strong>
                                <span className="text-sm text-muted-foreground">Assess live match situations to inform betting decisions or fantasy substitutions.</span>
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
                                <span><strong>Player Quality Not Considered:</strong> Model treats all players equally. A team with elite finishers has better chances than probability suggests.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Pressure Situations:</strong> Finals, rivalries, and high-stakes matches create pressure that affects performance unpredictably.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Weather Interruptions:</strong> Rain, DLS adjustments, and changing conditions can invalidate probability calculations mid-match.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Momentum Not Captured:</strong> Psychological momentum from consecutive boundaries or wickets isn't reflected in statistical models.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Unusual Situations:</strong> Rare scenarios (e.g., needing 36 off final over) have limited historical data, making estimates unreliable.</span>
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
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Comfortable Chase</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Team needs 72 runs from 60 balls with 8 wickets in hand. Required RR: 7.2, Current RR: 8.5. Win Probability: 78%. The team has wickets in hand, is scoring above required rate, and has plenty of time. This is a strong position with high probability of success.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: Tense Finish</h5>
                                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                                    Team needs 28 runs from 18 balls with 3 wickets in hand. Required RR: 9.3, Current RR: 7.8. Win Probability: 42%. Below required rate with limited wickets creates pressure. Probability is below 50% but still achievable with 1-2 big overs. Match hangs in balance.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: Nearly Impossible</h5>
                                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                                    Team needs 45 runs from 12 balls with 2 wickets in hand. Required RR: 22.5, Current RR: 6.0. Win Probability: 8%. Requires 3.75 runs per ball with minimal batting left. While not impossible (cricket has seen miracles), probability correctly identifies this as an extreme long shot requiring exceptional hitting.
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
                    <p>The Cricket Win Probability Calculator provides objective analysis of match situations by combining run rates, wickets remaining, balls left, and contextual factors into a single probability estimate.</p>
                    <p>Use this tool to understand match dynamics, identify critical moments, and make informed strategic decisions during limited-overs cricket matches.</p>
                    <p>Remember that probability is a guide, not a guarantee - cricket's beauty lies in its unpredictability and the human performances that defy statistical expectations.</p>
                </CardContent>
            </Card>
        </div>
    );
}
