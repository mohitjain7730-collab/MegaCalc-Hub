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
    // Batting stats
    runsScored: z.number().min(0),
    ballsFaced: z.number().min(0),
    timesOut: z.number().min(0),
    // Bowling stats
    wicketsTaken: z.number().min(0),
    runsConceded: z.number().min(0),
    oversBowled: z.number().min(0),
    // Fielding stats
    catches: z.number().min(0),
    runOuts: z.number().min(0),
    stumpings: z.number().min(0),
    // Player role
    playerRole: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CricketPlayerPerformanceIndexCalculator() {
    const [result, setResult] = useState<{
        overallIndex: number;
        battingScore: number;
        bowlingScore: number;
        fieldingScore: number;
        performanceGrade: string;
        playerType: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runsScored: undefined,
            ballsFaced: undefined,
            timesOut: undefined,
            wicketsTaken: undefined,
            runsConceded: undefined,
            oversBowled: undefined,
            catches: undefined,
            runOuts: undefined,
            stumpings: undefined,
            playerRole: 'all-rounder',
        },
    });

    const calculateBattingScore = (runs: number, balls: number, outs: number): number => {
        if (outs === 0 && runs === 0) return 0;

        const average = outs > 0 ? runs / outs : runs;
        const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;

        // Weighted scoring: 60% average, 40% strike rate
        const avgScore = Math.min((average / 50) * 60, 60); // Max 60 points
        const srScore = Math.min((strikeRate / 150) * 40, 40); // Max 40 points

        return avgScore + srScore;
    };

    const calculateBowlingScore = (wickets: number, runs: number, overs: number): number => {
        if (wickets === 0 && runs === 0) return 0;

        const average = wickets > 0 ? runs / wickets : (runs > 0 ? 100 : 0);
        const economy = overs > 0 ? runs / overs : 0;

        // Weighted scoring: 50% average, 50% economy
        const avgScore = Math.min((1 - (average / 50)) * 50, 50); // Lower is better
        const ecoScore = Math.min((1 - (economy / 10)) * 50, 50); // Lower is better

        return Math.max(avgScore + ecoScore, 0);
    };

    const calculateFieldingScore = (catches: number, runOuts: number, stumpings: number): number => {
        // Each catch = 5 points, run out = 7 points, stumping = 8 points
        const catchScore = Math.min(catches * 5, 30);
        const runOutScore = Math.min(runOuts * 7, 35);
        const stumpingScore = Math.min(stumpings * 8, 35);

        return Math.min(catchScore + runOutScore + stumpingScore, 100);
    };

    const calculateOverallIndex = (
        battingScore: number,
        bowlingScore: number,
        fieldingScore: number,
        role: string
    ): number => {
        let weights = { batting: 0.4, bowling: 0.4, fielding: 0.2 };

        switch (role) {
            case 'batsman':
                weights = { batting: 0.7, bowling: 0.1, fielding: 0.2 };
                break;
            case 'bowler':
                weights = { batting: 0.1, bowling: 0.7, fielding: 0.2 };
                break;
            case 'all-rounder':
                weights = { batting: 0.4, bowling: 0.4, fielding: 0.2 };
                break;
            case 'wicket-keeper':
                weights = { batting: 0.4, bowling: 0.1, fielding: 0.5 };
                break;
        }

        return (
            battingScore * weights.batting +
            bowlingScore * weights.bowling +
            fieldingScore * weights.fielding
        );
    };

    const getPerformanceGrade = (index: number): string => {
        if (index >= 80) return 'Outstanding (A+)';
        if (index >= 70) return 'Excellent (A)';
        if (index >= 60) return 'Very Good (B+)';
        if (index >= 50) return 'Good (B)';
        if (index >= 40) return 'Average (C)';
        if (index >= 30) return 'Below Average (D)';
        return 'Poor (F)';
    };

    const getPlayerType = (battingScore: number, bowlingScore: number, fieldingScore: number): string => {
        if (battingScore > 60 && bowlingScore > 60) return 'Elite All-Rounder';
        if (battingScore > 70) return 'Specialist Batsman';
        if (bowlingScore > 70) return 'Specialist Bowler';
        if (fieldingScore > 70) return 'Fielding Specialist';
        if (battingScore > 50 && bowlingScore > 50) return 'Balanced All-Rounder';
        if (battingScore > bowlingScore) return 'Batting All-Rounder';
        if (bowlingScore > battingScore) return 'Bowling All-Rounder';
        return 'Developing Player';
    };

    const getStrengths = (battingScore: number, bowlingScore: number, fieldingScore: number): string[] => {
        const strengths = [];
        if (battingScore > 60) strengths.push('Strong batting performance with good average and strike rate');
        if (bowlingScore > 60) strengths.push('Effective bowling with good wicket-taking ability');
        if (fieldingScore > 60) strengths.push('Excellent fielding contributions');
        if (battingScore > 50 && bowlingScore > 50) strengths.push('Well-balanced all-round capabilities');
        if (strengths.length === 0) strengths.push('Developing player with room for improvement across all departments');
        return strengths;
    };

    const getWeaknesses = (battingScore: number, bowlingScore: number, fieldingScore: number): string[] => {
        const weaknesses = [];
        if (battingScore < 40) weaknesses.push('Batting needs significant improvement in average and strike rate');
        if (bowlingScore < 40) weaknesses.push('Bowling effectiveness needs work on economy and wicket-taking');
        if (fieldingScore < 30) weaknesses.push('Fielding contributions are minimal - focus on catches and run outs');
        if (weaknesses.length === 0) weaknesses.push('No major weaknesses identified - maintain consistency');
        return weaknesses;
    };

    const getRecommendations = (
        battingScore: number,
        bowlingScore: number,
        fieldingScore: number,
        role: string
    ): string[] => {
        const recommendations = [];

        if (role === 'batsman' && battingScore < 60) {
            recommendations.push('Focus on improving batting average through better shot selection');
            recommendations.push('Work on strike rotation to maintain a healthy strike rate');
        }

        if (role === 'bowler' && bowlingScore < 60) {
            recommendations.push('Improve bowling economy through better line and length');
            recommendations.push('Develop variations to increase wicket-taking ability');
        }

        if (role === 'all-rounder') {
            if (battingScore < bowlingScore - 20) {
                recommendations.push('Balance your game by improving batting skills');
            } else if (bowlingScore < battingScore - 20) {
                recommendations.push('Work on bowling to become a more balanced all-rounder');
            }
        }

        if (fieldingScore < 40) {
            recommendations.push('Improve fielding through regular practice and positioning awareness');
        }

        if (recommendations.length === 0) {
            recommendations.push('Maintain current performance levels and focus on consistency');
            recommendations.push('Continue developing all aspects of your game');
        }

        return recommendations;
    };

    const onSubmit = (values: FormValues) => {
        const battingScore = calculateBattingScore(
            values.runsScored || 0,
            values.ballsFaced || 0,
            values.timesOut || 0
        );

        const bowlingScore = calculateBowlingScore(
            values.wicketsTaken || 0,
            values.runsConceded || 0,
            values.oversBowled || 0
        );

        const fieldingScore = calculateFieldingScore(
            values.catches || 0,
            values.runOuts || 0,
            values.stumpings || 0
        );

        const overallIndex = calculateOverallIndex(
            battingScore,
            bowlingScore,
            fieldingScore,
            values.playerRole
        );

        setResult({
            overallIndex,
            battingScore,
            bowlingScore,
            fieldingScore,
            performanceGrade: getPerformanceGrade(overallIndex),
            playerType: getPlayerType(battingScore, bowlingScore, fieldingScore),
            strengths: getStrengths(battingScore, bowlingScore, fieldingScore),
            weaknesses: getWeaknesses(battingScore, bowlingScore, fieldingScore),
            recommendations: getRecommendations(battingScore, bowlingScore, fieldingScore, values.playerRole),
        });
    };

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Player Statistics
                    </CardTitle>
                    <CardDescription>
                        Enter comprehensive player statistics to calculate performance index
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Player Role */}
                            <FormField
                                control={form.control}
                                name="playerRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Player Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select player role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="batsman">Batsman</SelectItem>
                                                <SelectItem value="bowler">Bowler</SelectItem>
                                                <SelectItem value="all-rounder">All-Rounder</SelectItem>
                                                <SelectItem value="wicket-keeper">Wicket-Keeper</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Batting Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-orange-600" />
                                    Batting Statistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                        placeholder="e.g., 450"
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
                                                        placeholder="e.g., 380"
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
                                        name="timesOut"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Times Out</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
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
                                </div>
                            </div>

                            {/* Bowling Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Bowling Statistics
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
                                                        placeholder="e.g., 18"
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
                                                        placeholder="e.g., 420"
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
                                                        placeholder="e.g., 65"
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

                            {/* Fielding Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Fielding Statistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                        placeholder="e.g., 8"
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
                                        name="stumpings"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stumpings</FormLabel>
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
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Performance Index
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
                                <Award className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Performance Index</CardTitle>
                                    <CardDescription>Overall Player Rating</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-primary">{result.overallIndex.toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                                <p className="text-xl font-semibold text-muted-foreground mt-3">{result.performanceGrade}</p>
                                <Badge variant="outline" className="mt-2 text-lg px-4 py-1">
                                    {result.playerType}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/20">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Batting Score</p>
                                    <p className="text-2xl font-bold text-orange-600">{result.battingScore.toFixed(1)}</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Bowling Score</p>
                                    <p className="text-2xl font-bold text-blue-600">{result.bowlingScore.toFixed(1)}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Fielding Score</p>
                                    <p className="text-2xl font-bold text-green-600">{result.fieldingScore.toFixed(1)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full border-green-100 bg-green-50/10 dark:border-green-900/20 dark:bg-green-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-6 w-6" />
                                    Strengths
                                </CardTitle>
                                <CardDescription>Key performance highlights</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.strengths.map((strength, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-green-800 dark:text-green-300">{strength}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-6 w-6" />
                                    Areas for Improvement
                                </CardTitle>
                                <CardDescription>Focus areas for development</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.weaknesses.map((weakness, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{weakness}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                                <Target className="h-6 w-6" />
                                Recommendations
                            </CardTitle>
                            <CardDescription>Actionable steps to improve performance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{recommendation}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Understanding the Calculator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How the Performance Index Works
                    </CardTitle>
                    <CardDescription>
                        Understanding the calculation methodology
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">Scoring Components:</h4>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Batting Score (0-100):</strong> Based on batting average (60%) and strike rate (40%)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Bowling Score (0-100):</strong> Based on bowling average (50%) and economy rate (50%)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Fielding Score (0-100):</strong> Based on catches, run outs, and stumpings</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3 mt-4">
                        <h4 className="font-semibold">Role-Based Weighting:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Batsman</p>
                                <p className="text-xs text-muted-foreground">70% Batting, 10% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Bowler</p>
                                <p className="text-xs text-muted-foreground">10% Batting, 70% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">All-Rounder</p>
                                <p className="text-xs text-muted-foreground">40% Batting, 40% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Wicket-Keeper</p>
                                <p className="text-xs text-muted-foreground">40% Batting, 10% Bowling, 50% Fielding</p>
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
                        Performance Index Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
                        <p className="font-mono text-sm text-center">
                            Performance Index = (Batting Score × Weight) + (Bowling Score × Weight) + (Fielding Score × Weight)
                        </p>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Weights vary based on player role
                        </p>
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
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
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
                                        <Zap className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Wicket efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
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
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
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
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground">
                                The Cricket Player Performance Index Calculator provides a comprehensive evaluation of player performance across batting, bowling, and fielding disciplines.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It uses role-based weighting to generate a holistic performance score, helping identify strengths, weaknesses, and areas for improvement.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
