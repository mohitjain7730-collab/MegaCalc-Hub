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

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">About Win Probability</h3>
                            <p className="text-sm text-muted-foreground">
                                The Cricket Win Probability Calculator analyzes current match conditions to estimate the likelihood of victory.
                                It considers multiple factors including run rates, wickets remaining, balls left, pitch conditions, and team strength.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This tool is valuable for understanding match dynamics, making strategic decisions, and analyzing critical moments in limited-overs cricket.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
