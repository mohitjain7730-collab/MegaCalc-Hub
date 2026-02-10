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

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Cricket Player Performance Index: Comprehensive Player Evaluation" />
                <meta itemProp="description" content="An expert guide to understanding the Player Performance Index in cricket, including calculation methodology, role-based weighting, performance benchmarks, and how to use it for player evaluation and team selection." />
                <meta itemProp="keywords" content="cricket performance index, player rating system, cricket statistics, all-rounder evaluation, player assessment, cricket analytics, performance metrics" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Player Performance Index: Holistic Player Evaluation</h1>
                <p className="text-lg italic text-muted-foreground">Master the comprehensive metric that evaluates cricket players across all disciplines - batting, bowling, and fielding - to determine overall value and contribution to the team.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is the Player Performance Index?</a></li>
                    <li><a href="#calculation" className="hover:underline">How the Index is Calculated</a></li>
                    <li><a href="#components" className="hover:underline">Understanding the Three Components</a></li>
                    <li><a href="#role-weighting" className="hover:underline">Role-Based Weighting System</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting Performance Scores</a></li>
                    <li><a href="#advantages" className="hover:underline">Advantages Over Single-Metric Analysis</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations and Context</a></li>
                    <li><a href="#improvement" className="hover:underline">Using the Index for Player Development</a></li>
                </ul>
                <hr />

                {/* WHAT IS PERFORMANCE INDEX */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is the Player Performance Index?</h2>
                <p>The <strong>Player Performance Index (PPI)</strong> is a comprehensive metric that evaluates a cricket player's overall contribution across all three disciplines of the game: batting, bowling, and fielding. Unlike traditional statistics that focus on a single aspect, the PPI provides a holistic view of a player's value to the team.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Need for Comprehensive Evaluation</h3>
                <p>Cricket is unique among sports in requiring players to excel in multiple disciplines. A batsman who can't field becomes a liability. A bowler who contributes with the bat adds immense value. The PPI quantifies this multi-dimensional contribution into a single, comparable score out of 100.</p>

                <p>The index is particularly valuable for:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Evaluating all-rounders and their balance between disciplines</li>
                    <li>Comparing players across different roles objectively</li>
                    <li>Identifying hidden strengths and weaknesses</li>
                    <li>Making informed team selection decisions</li>
                    <li>Tracking player development over time</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Index is Calculated</h2>
                <p>The Player Performance Index uses a weighted scoring system that combines three component scores:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        PPI = (Batting Score × Weight) + (Bowling Score × Weight) + (Fielding Score × Weight)
                    </p>
                </div>

                <p>Each component is scored out of 100, and the weights vary based on the player's designated role. This ensures that specialists are evaluated primarily on their core skill while still accounting for secondary contributions.</p>

                <hr />

                {/* COMPONENTS */}
                <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding the Three Components</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Batting Score (0-100)</h3>
                <p>The batting component evaluates run-scoring ability through two key metrics:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting Average (60% weight):</strong> Measures consistency and reliability. Normalized against a benchmark of 50 runs per dismissal.</li>
                    <li><strong>Strike Rate (40% weight):</strong> Measures scoring speed. Normalized against a benchmark of 150 runs per 100 balls.</li>
                </ul>
                <p className="mt-4">This 60-40 split reflects that consistency is slightly more valuable than speed in most formats, though both are essential for modern cricket.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Bowling Score (0-100)</h3>
                <p>The bowling component assesses wicket-taking and run-containment ability:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Bowling Average (50% weight):</strong> Measures wicket-taking efficiency. Lower is better - normalized against 50 runs per wicket.</li>
                    <li><strong>Economy Rate (50% weight):</strong> Measures run containment. Lower is better - normalized against 10 runs per over.</li>
                </ul>
                <p className="mt-4">Equal weighting reflects that both taking wickets and containing runs are equally important for bowlers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Fielding Score (0-100)</h3>
                <p>The fielding component rewards dismissals created through fielding:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Catches:</strong> 5 points each (maximum 30 points)</li>
                    <li><strong>Run Outs:</strong> 7 points each (maximum 35 points)</li>
                    <li><strong>Stumpings:</strong> 8 points each (maximum 35 points)</li>
                </ul>
                <p className="mt-4">Stumpings are valued highest as they require specialized wicket-keeping skills. The maximum cap ensures fielding doesn't disproportionately affect the overall index.</p>

                <hr />

                {/* ROLE WEIGHTING */}
                <h2 id="role-weighting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role-Based Weighting System</h2>
                <p>The PPI adapts to different player roles by adjusting the importance of each component:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batsman (Specialist)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batting: 70% - Primary skill</li>
                    <li>Bowling: 10% - Minimal contribution expected</li>
                    <li>Fielding: 20% - Important supporting skill</li>
                </ul>
                <p className="mt-2">A specialist batsman is judged primarily on run-scoring, with fielding as a significant secondary factor.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bowler (Specialist)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batting: 10% - Minimal contribution expected</li>
                    <li>Bowling: 70% - Primary skill</li>
                    <li>Fielding: 20% - Important supporting skill</li>
                </ul>
                <p className="mt-2">Specialist bowlers are evaluated mainly on wicket-taking and economy, with fielding contributing significantly.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">All-Rounder</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batting: 40% - Equal importance</li>
                    <li>Bowling: 40% - Equal importance</li>
                    <li>Fielding: 20% - Supporting skill</li>
                </ul>
                <p className="mt-2">All-rounders must excel in both batting and bowling to achieve high scores, reflecting their dual role.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Wicket-Keeper</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batting: 40% - Important contribution</li>
                    <li>Bowling: 10% - Rarely bowls</li>
                    <li>Fielding: 50% - Specialized keeping skills</li>
                </ul>
                <p className="mt-2">Wicket-keepers are unique in having fielding as their primary skill, with batting as a crucial secondary contribution.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Performance Scores</h2>
                <p>The PPI ranges from 0 to 100, with clear performance bands:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>80-100 (Outstanding A+):</strong> World-class player, elite performer across all relevant disciplines</li>
                    <li><strong>70-79 (Excellent A):</strong> International quality, strong in primary role with good secondary skills</li>
                    <li><strong>60-69 (Very Good B+):</strong> Solid international player, reliable in primary role</li>
                    <li><strong>50-59 (Good B):</strong> Competent player, acceptable at international level</li>
                    <li><strong>40-49 (Average C):</strong> Developing player or struggling at current level</li>
                    <li><strong>30-39 (Below Average D):</strong> Significant improvement needed</li>
                    <li><strong>0-29 (Poor F):</strong> Not performing at required standard</li>
                </ul>

                <p className="mt-4"><strong>Important Context:</strong> These benchmarks assume international cricket standards. For domestic or amateur cricket, adjust expectations downward by approximately 10-15 points.</p>

                <hr />

                {/* ADVANTAGES */}
                <h2 id="advantages" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advantages Over Single-Metric Analysis</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Captures Complete Value</h3>
                <p>Traditional statistics like batting average or bowling average only tell part of the story. A batsman with a 45 average who can't field is less valuable than one with a 40 average who takes brilliant catches. The PPI captures this complete picture.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Enables Cross-Role Comparison</h3>
                <p>How do you compare a specialist batsman to an all-rounder? The PPI's role-based weighting allows fair comparison by evaluating each player against their role's expectations.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Identifies Hidden Strengths</h3>
                <p>A bowler who contributes 20-25 with the bat might not seem impressive, but if their bowling is excellent, the PPI reveals their true value as a lower-order contributor.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Highlights Development Areas</h3>
                <p>By breaking down the index into components, players and coaches can identify specific areas for improvement. An all-rounder with a 35 batting score but 65 bowling score knows exactly where to focus training.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Context</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Doesn't Account for Match Situation</h3>
                <p>The PPI treats all runs and wickets equally. A match-winning 50 under pressure is statistically identical to a 50 in a dead rubber. Context-aware analysis is still needed.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Format Agnostic</h3>
                <p>The same benchmarks apply across formats, but a strike rate of 120 means different things in Test cricket versus T20. Consider format when interpreting scores.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Sample Size Matters</h3>
                <p>A player with 2 innings and 1 wicket can have inflated scores. The PPI is most reliable with a minimum of 10 innings and 20 overs bowled.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Fielding Limitations</h3>
                <p>The fielding component only captures dismissals, not ground fielding, throwing accuracy, or positioning. A brilliant fielder who rarely takes catches may be undervalued.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Role Classification</h3>
                <p>Some players don't fit neatly into roles. A batting all-rounder might be classified as "all-rounder" when they should be weighted more toward batting.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using the Index for Player Development</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Identify Weak Points</h3>
                <p>Calculate the PPI regularly and track component scores. If batting score is consistently below 40, focus training on technique, shot selection, and match awareness.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Set Realistic Goals</h3>
                <p>Use the PPI to set measurable improvement targets. For example: "Increase overall PPI from 52 to 60 by improving bowling economy from 7.5 to 6.0."</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Balance Development</h3>
                <p>All-rounders should aim for balanced component scores. If batting is 65 but bowling is 35, focus on bowling development to become a more complete player.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Role Optimization</h3>
                <p>If a player classified as "all-rounder" has batting 75 and bowling 25, they might be better suited as a "batsman" role, which would increase their PPI by emphasizing their strength.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Track Progress Over Time</h3>
                <p>Calculate PPI after each series or season. Consistent improvement indicates effective training and development.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Player Performance Index provides a sophisticated, multi-dimensional evaluation of cricket players that goes beyond traditional single-metric analysis. By combining batting, bowling, and fielding performance with role-based weighting, it offers a fair and comprehensive assessment of a player's overall value.</p>

                <p>While the PPI has limitations and should be used alongside qualitative analysis and match context, it remains an invaluable tool for player evaluation, team selection, and development planning. Whether you're a player tracking your progress, a coach assessing your squad, or a selector making difficult decisions, the PPI provides objective, actionable insights into cricket performance.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common questions about the Player Performance Index
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good Player Performance Index score?</h4>
                            <p className="text-muted-foreground">
                                For international cricket, a PPI above 70 indicates excellent performance, 60-70 is very good, 50-60 is good, and 40-50 is average. Scores above 80 are outstanding and typically reserved for world-class players. For domestic cricket, reduce these benchmarks by approximately 10-15 points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is the PPI different from batting or bowling average?</h4>
                            <p className="text-muted-foreground">
                                Traditional averages measure only one aspect of performance. The PPI combines batting, bowling, and fielding into a single holistic score, weighted according to the player's role. This provides a complete picture of a player's value rather than just their primary skill.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do different roles have different weightings?</h4>
                            <p className="text-muted-foreground">
                                Different roles have different expectations. A specialist batsman should be judged primarily on batting (70%), while an all-rounder must excel in both batting and bowling (40% each). This ensures fair comparison - a batsman isn't penalized for not taking wickets, and a bowler isn't penalized for not scoring runs.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can the PPI be used across different formats (Test, ODI, T20)?</h4>
                            <p className="text-muted-foreground">
                                Yes, but with caution. The same calculation applies to all formats, but interpretation differs. A strike rate of 120 is excellent in Test cricket but average in T20. When comparing players across formats, consider format-specific benchmarks for batting and bowling metrics.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many innings are needed for a reliable PPI?</h4>
                            <p className="text-muted-foreground">
                                For reliable results, players should have at least 10 batting innings and 20 overs bowled (for bowlers/all-rounders). Smaller sample sizes can produce misleading scores due to statistical variance. The PPI becomes more accurate with larger data sets.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does the PPI account for opposition quality?</h4>
                            <p className="text-muted-foreground">
                                No, the PPI treats all performances equally regardless of opposition strength. A player scoring heavily against weak teams will have the same PPI as one performing against strong teams. This is a limitation - qualitative analysis should supplement PPI evaluation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is fielding weighted at only 20% for most roles?</h4>
                            <p className="text-muted-foreground">
                                While fielding is important, it has less direct impact on match outcomes than batting and bowling. Additionally, the fielding score only captures dismissals (catches, run outs, stumpings), not general ground fielding. The 20% weight reflects this limited scope, except for wicket-keepers where it's 50%.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a specialist batsman have a higher PPI than an all-rounder?</h4>
                            <p className="text-muted-foreground">
                                Absolutely. A specialist batsman who excels in batting (e.g., 85/100 batting score) can easily outscore an all-rounder with moderate scores in both disciplines (e.g., 55/100 batting, 55/100 bowling). The PPI evaluates players against their role's expectations, not absolute contribution.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How should I use the PPI for team selection?</h4>
                            <p className="text-muted-foreground">
                                Use the PPI as one factor among many. Compare players in similar roles, consider recent form (last 10 innings), match conditions, and opposition. The PPI helps identify the best performers objectively, but team balance, experience, and match situation should also influence selection.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between "Balanced All-Rounder" and "Elite All-Rounder" player types?</h4>
                            <p className="text-muted-foreground">
                                An "Elite All-Rounder" has both batting and bowling scores above 60, indicating excellence in both disciplines. A "Balanced All-Rounder" has both scores above 50 but below 60, showing competence in both areas. The distinction helps identify true all-round excellence versus balanced mediocrity.
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
                                <strong className="block text-primary mb-1">Cricket Players</strong>
                                <span className="text-sm text-muted-foreground">Track your overall performance across all disciplines, identify strengths and weaknesses, and set development goals.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Coaches & Selectors</strong>
                                <span className="text-sm text-muted-foreground">Objectively evaluate players for team selection, compare candidates across different roles, and identify development priorities.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                <span className="text-sm text-muted-foreground">Analyze player performance holistically, create player rankings, and provide data-driven insights for commentary or articles.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Fantasy Cricket Players</strong>
                                <span className="text-sm text-muted-foreground">Evaluate all-rounders and multi-skilled players to build balanced fantasy teams with maximum point-scoring potential.</span>
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
                                <span><strong>Small Sample Size:</strong> PPI requires sufficient data (minimum 10 innings, 20 overs bowled) for accuracy. Early-career players or those with limited opportunities may have unreliable scores.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>No Context Awareness:</strong> The index doesn't distinguish between runs scored in pressure situations versus easy conditions, or wickets taken against strong versus weak opposition.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Fielding Limitations:</strong> Only captures dismissals (catches, stumpings, run outs), not general fielding quality, athleticism, or ground fielding contributions.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Format Differences:</strong> The same benchmarks apply across Test, ODI, and T20, but these formats have different performance expectations. Interpret scores with format context.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Role Misclassification:</strong> Players who don't fit neatly into one role (e.g., batting all-rounders) may be evaluated against inappropriate expectations.</span>
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
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Elite All-Rounder</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Player scores 450 runs in 12 innings (10 dismissals), takes 18 wickets for 420 runs in 65 overs, and takes 8 catches. Batting Score: 67.5, Bowling Score: 68.2, Fielding Score: 40. As an all-rounder (40% batting, 40% bowling, 20% fielding): PPI = 67.5×0.4 + 68.2×0.4 + 40×0.2 = 62.3 (Very Good B+). This player is a valuable balanced all-rounder.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: Specialist Batsman</h5>
                                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                                    Player scores 850 runs in 20 innings (18 dismissals) with strike rate 118, doesn't bowl, takes 5 catches. Batting Score: 82.4, Bowling Score: 0, Fielding Score: 25. As a batsman (70% batting, 10% bowling, 20% fielding): PPI = 82.4×0.7 + 0×0.1 + 25×0.2 = 62.7 (Very Good B+). Despite no bowling, excellent batting drives high PPI.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: Wicket-Keeper Batsman</h5>
                                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                                    Player scores 380 runs in 15 innings (12 dismissals), doesn't bowl, takes 12 catches and 3 stumpings. Batting Score: 54.2, Bowling Score: 0, Fielding Score: 84. As wicket-keeper (40% batting, 10% bowling, 50% fielding): PPI = 54.2×0.4 + 0×0.1 + 84×0.5 = 63.7 (Very Good B+). Excellent keeping compensates for moderate batting.
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
                    <p>The Player Performance Index Calculator provides a comprehensive, multi-dimensional evaluation of cricket players across batting, bowling, and fielding disciplines.</p>
                    <p>By using role-based weighting, it ensures fair comparison between specialists and all-rounders, providing objective insights into overall player value.</p>
                    <p>Use this tool to track player development, make informed team selection decisions, and identify specific areas for improvement in your cricket performance.</p>
                </CardContent>
            </Card>
        </div>
    );
}
