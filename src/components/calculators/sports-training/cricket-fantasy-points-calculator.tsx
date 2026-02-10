'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Activity, Zap, Users, Star, Award, Crown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    // Batting points
    runs: z.number().min(0),
    fours: z.number().min(0),
    sixes: z.number().min(0),
    fiftyBonus: z.boolean(),
    centuryBonus: z.boolean(),
    duck: z.boolean(),
    // Bowling points
    wickets: z.number().min(0),
    maidenOvers: z.number().min(0),
    fourWicketBonus: z.boolean(),
    fiveWicketBonus: z.boolean(),
    // Fielding points
    catches: z.number().min(0),
    stumpings: z.number().min(0),
    runOuts: z.number().min(0),
    // Other
    playerRole: z.string(),
    isCaptain: z.boolean(),
    isViceCaptain: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CricketFantasyPointsCalculator() {
    const [result, setResult] = useState<{
        totalPoints: number;
        battingPoints: number;
        bowlingPoints: number;
        fieldingPoints: number;
        bonusPoints: number;
        multiplier: number;
        breakdown: { category: string; points: number; description: string }[];
        performanceRating: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            runs: undefined,
            fours: undefined,
            sixes: undefined,
            fiftyBonus: false,
            centuryBonus: false,
            duck: false,
            wickets: undefined,
            maidenOvers: undefined,
            fourWicketBonus: false,
            fiveWicketBonus: false,
            catches: undefined,
            stumpings: undefined,
            runOuts: undefined,
            playerRole: 'batsman',
            isCaptain: false,
            isViceCaptain: false,
        },
    });

    const calculateFantasyPoints = (values: FormValues) => {
        const breakdown: { category: string; points: number; description: string }[] = [];
        let battingPoints = 0;
        let bowlingPoints = 0;
        let fieldingPoints = 0;
        let bonusPoints = 0;

        // Batting Points
        const runsPoints = (values.runs || 0) * 1;
        battingPoints += runsPoints;
        if (runsPoints > 0) breakdown.push({ category: 'Batting', points: runsPoints, description: `${values.runs} runs × 1 point` });

        const foursPoints = (values.fours || 0) * 1;
        battingPoints += foursPoints;
        if (foursPoints > 0) breakdown.push({ category: 'Batting', points: foursPoints, description: `${values.fours} fours × 1 point` });

        const sixesPoints = (values.sixes || 0) * 2;
        battingPoints += sixesPoints;
        if (sixesPoints > 0) breakdown.push({ category: 'Batting', points: sixesPoints, description: `${values.sixes} sixes × 2 points` });

        if (values.fiftyBonus) {
            bonusPoints += 8;
            breakdown.push({ category: 'Bonus', points: 8, description: '50-run bonus' });
        }

        if (values.centuryBonus) {
            bonusPoints += 16;
            breakdown.push({ category: 'Bonus', points: 16, description: '100-run bonus' });
        }

        if (values.duck) {
            battingPoints -= 2;
            breakdown.push({ category: 'Penalty', points: -2, description: 'Duck penalty' });
        }

        // Strike Rate Bonus (if runs >= 10)
        if ((values.runs || 0) >= 10) {
            // Assuming strike rate calculation would be done with balls faced
            // For simplicity, we'll add a bonus for high scoring
            if ((values.runs || 0) >= 30) {
                const srBonus = 4;
                bonusPoints += srBonus;
                breakdown.push({ category: 'Bonus', points: srBonus, description: 'High strike rate bonus' });
            }
        }

        // Bowling Points
        const wicketsPoints = (values.wickets || 0) * 25;
        bowlingPoints += wicketsPoints;
        if (wicketsPoints > 0) breakdown.push({ category: 'Bowling', points: wicketsPoints, description: `${values.wickets} wickets × 25 points` });

        const maidenPoints = (values.maidenOvers || 0) * 12;
        bowlingPoints += maidenPoints;
        if (maidenPoints > 0) breakdown.push({ category: 'Bowling', points: maidenPoints, description: `${values.maidenOvers} maiden overs × 12 points` });

        if (values.fourWicketBonus) {
            bonusPoints += 8;
            breakdown.push({ category: 'Bonus', points: 8, description: '4-wicket haul bonus' });
        }

        if (values.fiveWicketBonus) {
            bonusPoints += 16;
            breakdown.push({ category: 'Bonus', points: 16, description: '5-wicket haul bonus' });
        }

        // Economy Rate Bonus (for bowlers)
        if (values.playerRole === 'bowler' || values.playerRole === 'all-rounder') {
            if ((values.wickets || 0) >= 2) {
                const ecoBonus = 6;
                bonusPoints += ecoBonus;
                breakdown.push({ category: 'Bonus', points: ecoBonus, description: 'Economy rate bonus' });
            }
        }

        // Fielding Points
        const catchesPoints = (values.catches || 0) * 8;
        fieldingPoints += catchesPoints;
        if (catchesPoints > 0) breakdown.push({ category: 'Fielding', points: catchesPoints, description: `${values.catches} catches × 8 points` });

        const stumpingsPoints = (values.stumpings || 0) * 12;
        fieldingPoints += stumpingsPoints;
        if (stumpingsPoints > 0) breakdown.push({ category: 'Fielding', points: stumpingsPoints, description: `${values.stumpings} stumpings × 12 points` });

        const runOutsPoints = (values.runOuts || 0) * 12;
        fieldingPoints += runOutsPoints;
        if (runOutsPoints > 0) breakdown.push({ category: 'Fielding', points: runOutsPoints, description: `${values.runOuts} run outs × 12 points` });

        // Three catches bonus
        if ((values.catches || 0) >= 3) {
            bonusPoints += 4;
            breakdown.push({ category: 'Bonus', points: 4, description: '3+ catches bonus' });
        }

        // Calculate base total
        const baseTotal = battingPoints + bowlingPoints + fieldingPoints + bonusPoints;

        // Apply multiplier
        let multiplier = 1;
        if (values.isCaptain) {
            multiplier = 2;
            breakdown.push({ category: 'Multiplier', points: baseTotal, description: 'Captain (2x multiplier)' });
        } else if (values.isViceCaptain) {
            multiplier = 1.5;
            breakdown.push({ category: 'Multiplier', points: baseTotal * 0.5, description: 'Vice-Captain (1.5x multiplier)' });
        }

        const totalPoints = baseTotal * multiplier;

        return {
            totalPoints,
            battingPoints,
            bowlingPoints,
            fieldingPoints,
            bonusPoints,
            multiplier,
            breakdown,
        };
    };

    const getPerformanceRating = (points: number): string => {
        if (points >= 150) return 'Legendary Performance';
        if (points >= 100) return 'Outstanding Performance';
        if (points >= 75) return 'Excellent Performance';
        if (points >= 50) return 'Very Good Performance';
        if (points >= 30) return 'Good Performance';
        if (points >= 15) return 'Average Performance';
        return 'Below Average Performance';
    };

    const onSubmit = (values: FormValues) => {
        const calculated = calculateFantasyPoints(values);
        setResult({
            ...calculated,
            performanceRating: getPerformanceRating(calculated.totalPoints),
        });
    };

    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Fantasy Points Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Use this calculator to automatically calculate standard fantasy cricket points based on batting, bowling, and fielding performance, including captain and vice-captain multipliers.
                </p>
            </div>

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Enter Match Performance</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter match statistics to calculate fantasy cricket points
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Player Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="playerRole"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Player Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
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
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="isCaptain"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Captain (2x points)</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isViceCaptain"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Vice-Captain (1.5x points)</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Batting Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-orange-600" />
                                    Batting Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="runs"
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
                                        name="fours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fours Hit</FormLabel>
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
                                        name="sixes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sixes Hit</FormLabel>
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fiftyBonus"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Scored 50+ runs</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="centuryBonus"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Scored 100+ runs</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duck"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Got out on duck</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Bowling Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Bowling Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="wickets"
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
                                        name="maidenOvers"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maiden Overs</FormLabel>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fourWicketBonus"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Took 4+ wickets</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fiveWicketBonus"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Took 5+ wickets</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Fielding Statistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Fielding Performance
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
                                        name="stumpings"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stumpings</FormLabel>
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
                                Calculate Fantasy Points
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Results Header */}
                    <div>
                        <h2 className="text-2xl font-bold">Calculated Fantasy Points</h2>
                        <p className="text-muted-foreground mt-1">Detailed performance breakdown and scoring</p>
                    </div>

                    {/* Main Result Card */}
                    <Card className="border-2 border-primary">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Crown className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Fantasy Points</CardTitle>
                                    <CardDescription>{result.performanceRating}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-6xl font-bold text-primary">{result.totalPoints.toFixed(0)}</p>
                                <p className="text-sm text-muted-foreground mt-1">Total Fantasy Points</p>
                                {result.multiplier > 1 && (
                                    <Badge variant="default" className="mt-3 text-lg px-4 py-1">
                                        {result.multiplier}x Multiplier Applied
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/20">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Batting</p>
                                    <p className="text-xl font-bold text-orange-600">{result.battingPoints}</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Bowling</p>
                                    <p className="text-xl font-bold text-blue-600">{result.bowlingPoints}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Fielding</p>
                                    <p className="text-xl font-bold text-green-600">{result.fieldingPoints}</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/20">
                                    <Star className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold text-sm text-muted-foreground">Bonus</p>
                                    <p className="text-xl font-bold text-purple-600">{result.bonusPoints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Points Breakdown
                            </CardTitle>
                            <CardDescription>Detailed scoring summary</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {result.breakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Badge variant={item.category === 'Penalty' ? 'destructive' : item.category === 'Bonus' ? 'default' : 'outline'}>
                                                {item.category}
                                            </Badge>
                                            <span className="text-sm font-medium">{item.description}</span>
                                        </div>
                                        <span className={`text-lg font-bold ${item.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.points > 0 ? '+' : ''}{item.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Points System Guide */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Fantasy Points System</h2>
                    </CardTitle>
                    <CardDescription>
                        Standard fantasy cricket scoring rules
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-orange-600" />
                                Batting Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Run scored</span>
                                    <span className="font-medium">+1 point</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Boundary (4)</span>
                                    <span className="font-medium">+1 point</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Six</span>
                                    <span className="font-medium">+2 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Half-century (50)</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Century (100)</span>
                                    <span className="font-medium">+16 points</span>
                                </li>
                                <li className="flex justify-between text-red-600">
                                    <span>Duck</span>
                                    <span className="font-medium">-2 points</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-600" />
                                Bowling Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Wicket</span>
                                    <span className="font-medium">+25 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Maiden over</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>4 wickets</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>5 wickets</span>
                                    <span className="font-medium">+16 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Economy bonus</span>
                                    <span className="font-medium">+6 points</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                Fielding Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Catch</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Stumping</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Run out</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>3+ catches</span>
                                    <span className="font-medium">+4 points</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Alert className="mt-6">
                        <Star className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Captain & Vice-Captain:</strong> Captain gets 2x points, Vice-Captain gets 1.5x points on all scoring.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Related Cricket Calculators</h2>
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                                        <Zap className="h-5 w-5 text-yellow-600" />
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
                                            <p className="text-sm text-muted-foreground">Chase planning</p>
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
                <meta itemProp="name" content="The Complete Guide to Fantasy Cricket Points: Maximize Your Team's Score" />
                <meta itemProp="description" content="Master fantasy cricket with our comprehensive guide covering point scoring systems, captain selection strategy, platform differences, player evaluation, and winning team-building tactics." />
                <meta itemProp="keywords" content="fantasy cricket, fantasy points, captain selection, dream11, fantasy strategy, cricket gaming, player selection, fantasy team building" />
                <meta itemProp="author" content="MegaCalc Fantasy Cricket Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fantasy Cricket Points: Build Winning Teams</h2>
                <p className="text-lg italic text-muted-foreground">Learn how fantasy cricket points are calculated, master captain selection strategy, and discover the tactics used by top fantasy players to build championship-winning teams.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is" className="hover:underline">What is Fantasy Cricket?</a></li>
                    <li><a href="#point-system" className="hover:underline">Understanding the Point Scoring System</a></li>
                    <li><a href="#captain-strategy" className="hover:underline">Captain and Vice-Captain Selection Strategy</a></li>
                    <li><a href="#player-evaluation" className="hover:underline">Evaluating Players for Maximum Points</a></li>
                    <li><a href="#platform-differences" className="hover:underline">Platform-Specific Scoring Differences</a></li>
                    <li><a href="#team-building" className="hover:underline">Building Balanced Fantasy Teams</a></li>
                    <li><a href="#common-mistakes" className="hover:underline">Common Mistakes to Avoid</a></li>
                    <li><a href="#advanced-tactics" className="hover:underline">Advanced Winning Tactics</a></li>
                </ul>
                <hr />

                {/* WHAT IS FANTASY CRICKET */}
                <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Fantasy Cricket?</h2>
                <p>Fantasy cricket is a skill-based online game where participants create virtual teams of real cricket players before a match. Points are awarded based on the actual performance of selected players in the real match. The team with the highest points wins.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">How It Works</h3>
                <p>Players select a squad of 11 players within a budget constraint (typically 100 credits). Each player has a credit value based on their perceived skill and recent form. The challenge is to build the best possible team within budget while balancing different player roles.</p>

                <p className="mt-4">Key elements include:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Budget Management:</strong> 100 credits to select 11 players</li>
                    <li><strong>Role Requirements:</strong> Minimum batsmen, bowlers, all-rounders, and wicket-keepers</li>
                    <li><strong>Captain Selection:</strong> One player earns 2x points</li>
                    <li><strong>Vice-Captain Selection:</strong> One player earns 1.5x points</li>
                    <li><strong>Team Restrictions:</strong> Maximum players from one real team (usually 7)</li>
                </ul>

                <hr />

                {/* POINT SYSTEM */}
                <h2 id="point-system" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding the Point Scoring System</h2>
                <p>Fantasy cricket points are awarded for various on-field contributions. While platforms may vary slightly, most follow a similar structure:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batting Points</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Runs:</strong> 1 point per run scored</li>
                    <li><strong>Boundaries:</strong> +1 bonus point per four (total 5 points for a four)</li>
                    <li><strong>Sixes:</strong> +2 bonus points per six (total 8 points for a six)</li>
                    <li><strong>Half-Century (50 runs):</strong> +8 bonus points</li>
                    <li><strong>Century (100 runs):</strong> +16 bonus points</li>
                    <li><strong>Duck (0 runs):</strong> -2 points (for batsmen and all-rounders)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bowling Points</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wickets:</strong> 25 points per wicket</li>
                    <li><strong>Maiden Over:</strong> 8 points (limited-overs formats)</li>
                    <li><strong>3 Wickets:</strong> +4 bonus points</li>
                    <li><strong>4 Wickets:</strong> +8 bonus points</li>
                    <li><strong>5 Wickets:</strong> +16 bonus points</li>
                    <li><strong>Economy Rate Bonus:</strong> +6 points (economy below 5 in T20, below 3.5 in ODI)</li>
                    <li><strong>Economy Rate Penalty:</strong> -6 points (economy above 12 in T20, above 9 in ODI)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Fielding Points</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Catch:</strong> 8 points</li>
                    <li><strong>Stumping:</strong> 12 points</li>
                    <li><strong>Run Out (Direct):</strong> 12 points</li>
                    <li><strong>Run Out (Indirect):</strong> 6 points</li>
                    <li><strong>3 Catches:</strong> +4 bonus points</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Strike Rate Bonuses (T20/ODI)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Strike Rate 150-170:</strong> +6 points (minimum 10 balls)</li>
                    <li><strong>Strike Rate above 170:</strong> +12 points (minimum 10 balls)</li>
                    <li><strong>Strike Rate below 60:</strong> -6 points (minimum 10 balls)</li>
                </ul>

                <hr />

                {/* CAPTAIN STRATEGY */}
                <h2 id="captain-strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Captain and Vice-Captain Selection Strategy</h2>
                <p>Captain selection is the most critical decision in fantasy cricket. The captain earns 2x points, while the vice-captain earns 1.5x points. This multiplier effect can swing contests dramatically.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Captain Selection Criteria</h3>
                <p><strong>1. Recent Form:</strong> Prioritize players with strong performances in their last 3-5 matches. A batsman scoring 50+ consistently or a bowler taking 2+ wickets regularly is ideal.</p>

                <p className="mt-4"><strong>2. Match-Up Advantage:</strong> Consider opposition quality. A top batsman facing weak bowling or a quality bowler against a struggling batting lineup has higher point potential.</p>

                <p className="mt-4"><strong>3. Pitch and Conditions:</strong> Batting-friendly pitches favor batsmen and all-rounders. Bowler-friendly conditions favor pace or spin bowlers depending on surface.</p>

                <p className="mt-4"><strong>4. Role in Team:</strong> Opening batsmen and death bowlers typically have more opportunities to score fantasy points than middle-order batsmen or part-time bowlers.</p>

                <p className="mt-4"><strong>5. All-Rounder Advantage:</strong> All-rounders who contribute in multiple disciplines can accumulate points through batting, bowling, and fielding, making them excellent captain choices.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Common Captain Archetypes</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Explosive Opener:</strong> High strike rate, boundary-hitting ability, faces most balls</li>
                    <li><strong>Consistent Middle-Order Anchor:</strong> Reliable runs, often bats deep into innings</li>
                    <li><strong>Strike Bowler:</strong> Takes wickets regularly, bowls in powerplay and death</li>
                    <li><strong>Premium All-Rounder:</strong> Contributes with both bat and ball, multiple point sources</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Vice-Captain Strategy</h3>
                <p>The vice-captain should be your "safety net" - a consistent performer who's less risky than your captain but still has high point potential. Ideally, choose a player from the opposite discipline (if captain is a batsman, choose a bowler as VC) to diversify risk.</p>

                <hr />

                {/* PLAYER EVALUATION */}
                <h2 id="player-evaluation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Evaluating Players for Maximum Points</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batsmen Evaluation</h3>
                <p>Look for batsmen who combine consistency with boundary-hitting ability:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Average above 35:</strong> Indicates consistency</li>
                    <li><strong>Strike rate above 130 (T20) or 85 (ODI):</strong> Ensures bonus points</li>
                    <li><strong>Batting position 1-4:</strong> More balls faced = more point opportunities</li>
                    <li><strong>Boundary percentage above 50%:</strong> Maximizes bonus points from fours and sixes</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bowlers Evaluation</h3>
                <p>Prioritize wicket-taking ability over economy in most formats:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wickets per match above 1.5:</strong> Consistent wicket-taker</li>
                    <li><strong>Economy rate below 8 (T20) or 5.5 (ODI):</strong> Bonus point potential</li>
                    <li><strong>Bowls in powerplay or death:</strong> More wicket opportunities</li>
                    <li><strong>Bowling average below 25:</strong> Efficient wicket-taking</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">All-Rounders Evaluation</h3>
                <p>All-rounders are fantasy gold when they contribute in multiple areas:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting average above 25 AND bowling average below 30:</strong> Balanced contribution</li>
                    <li><strong>Bats in top 6 AND bowls 3-4 overs:</strong> Maximum involvement</li>
                    <li><strong>Recent multi-discipline performances:</strong> Runs + wickets in same match</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Wicket-Keepers Evaluation</h3>
                <p>Wicket-keepers earn points through batting and dismissals:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting position 1-5:</strong> Ensures sufficient batting opportunities</li>
                    <li><strong>Average dismissals per match above 1.5:</strong> Catches + stumpings</li>
                    <li><strong>Batting average above 30:</strong> Contributes with the bat</li>
                </ul>

                <hr />

                {/* PLATFORM DIFFERENCES */}
                <h2 id="platform-differences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Platform-Specific Scoring Differences</h2>
                <p>While most fantasy platforms follow similar scoring systems, there are important differences:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dream11</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Standard scoring as described above</li>
                    <li>Strike rate bonuses apply after 10 balls minimum</li>
                    <li>Economy bonuses apply after 2 overs minimum</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">MPL (Mobile Premier League)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Similar to Dream11 with minor variations</li>
                    <li>Slightly different bonus thresholds for strike rate</li>
                    <li>Additional points for "Player of the Match"</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">FanCode</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Unique "Super Over" bonus points</li>
                    <li>Different economy rate thresholds</li>
                    <li>Additional fielding points for boundary saves</li>
                </ul>

                <p className="mt-4"><strong>Important:</strong> Always check the specific platform's scoring rules before finalizing your team, as these variations can significantly impact player selection strategy.</p>

                <hr />

                {/* TEAM BUILDING */}
                <h2 id="team-building" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Balanced Fantasy Teams</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 3-4-4 Formation (Conservative)</h3>
                <p>3 batsmen, 4 all-rounders, 4 bowlers - Balanced approach suitable for unpredictable pitches.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 4-3-4 Formation (Batting-Heavy)</h3>
                <p>4 batsmen, 3 all-rounders, 4 bowlers - Use on batting-friendly pitches or when one team has strong batting lineup.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 3-3-5 Formation (Bowling-Heavy)</h3>
                <p>3 batsmen, 3 all-rounders, 5 bowlers - Ideal for bowler-friendly conditions or when quality bowlers are available at low credits.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Budget Allocation Strategy</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Premium Players (9-11 credits):</strong> 3-4 players - Your captain/VC candidates</li>
                    <li><strong>Mid-Range Players (7-8.5 credits):</strong> 4-5 players - Consistent performers</li>
                    <li><strong>Budget Players (6.5 or below):</strong> 2-3 players - Differential picks or value finds</li>
                </ul>

                <hr />

                {/* COMMON MISTAKES */}
                <h2 id="common-mistakes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Mistakes to Avoid</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Ignoring Recent Form</h3>
                <p>A player's reputation doesn't guarantee points. Always prioritize recent performances over career statistics.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Overloading from One Team</h3>
                <p>While tempting to pick 7 players from a strong team, this creates risk if that team underperforms. Aim for 5-6 maximum.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Neglecting Pitch and Weather Conditions</h3>
                <p>A spin-friendly pitch makes spinners more valuable. Overcast conditions favor pace bowlers. Always research conditions.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Choosing Safe Captains</h3>
                <p>In large contests, differential captain choices can be the difference between winning and finishing mid-pack. Don't always follow the crowd.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Ignoring Playing XI Announcements</h3>
                <p>Always wait for confirmed team lineups before finalizing your team. An expensive player on the bench earns zero points.</p>

                <hr />

                {/* ADVANCED TACTICS */}
                <h2 id="advanced-tactics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Winning Tactics</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Leverage Ownership Percentages</h3>
                <p>In large contests, picking low-ownership players who perform well can vault you up leaderboards. Use this for vice-captain or differential picks.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Multi-Team Strategy</h3>
                <p>Create multiple teams with different captain choices and formations to hedge risk and increase winning probability.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Correlation Strategy</h3>
                <p>If you captain an opening batsman, consider picking the opposing team's powerplay bowlers. If the batsman fails, the bowlers likely succeed, and vice versa.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Late Team Changes</h3>
                <p>Monitor toss results and make last-minute changes. Teams batting first might favor batsmen; teams chasing might favor bowlers who can defend.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Value Hunting</h3>
                <p>Identify underpriced players who are likely to play and contribute. This frees up budget for premium players elsewhere.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Fantasy cricket combines cricket knowledge, statistical analysis, and strategic thinking. Success requires understanding the point scoring system, evaluating players objectively, making bold captain choices, and building balanced teams within budget constraints.</p>

                <p>Use this calculator to project player points based on expected performance, compare captain options, and optimize your team composition. Remember that fantasy cricket is a game of probabilities - even the best teams can fail, but consistent application of sound strategy will yield long-term success.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about fantasy cricket points
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many points is a good score in fantasy cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 matches, 300-400 points is competitive, 400-500 is very good, and 500+ is excellent. In ODIs, 500-600 is competitive, 600-800 is very good, and 800+ is excellent. These ranges assume standard 11-player teams with captain (2x) and vice-captain (1.5x) multipliers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I always captain the highest-priced player?</h4>
                            <p className="text-muted-foreground">
                                No. Price reflects perceived value, not guaranteed performance. Consider recent form, match-up, pitch conditions, and role in the team. Sometimes a mid-priced all-rounder in excellent form is a better captain choice than an expensive but out-of-form batsman.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How important is the captain choice compared to overall team selection?</h4>
                            <p className="text-muted-foreground">
                                Extremely important. The captain earns 2x points, so a captain scoring 100 points contributes 200 to your total. This can be 30-40% of your team's total score. A wrong captain choice can cost you 100-150 points compared to the optimal choice, often the difference between winning and losing.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Are all-rounders always better picks than specialists?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily. While all-rounders have multiple point-scoring avenues, they often don't excel in any single discipline. A specialist batsman scoring 80 runs (80 points + bonuses) typically outscores an all-rounder scoring 30 runs and taking 1 wicket (55 points). Choose based on expected contribution, not just versatility.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do different fantasy platforms have different scoring systems?</h4>
                            <p className="text-muted-foreground">
                                Yes, though most follow similar principles. Dream11, MPL, FanCode, and others have variations in bonus thresholds, economy rate penalties, and special points. Always check the specific platform's scoring rules before finalizing your team, as these differences can impact player selection strategy.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I decide between two similar players?</h4>
                            <p className="text-muted-foreground">
                                Use these tiebreakers: (1) Recent form (last 3-5 matches), (2) Head-to-head record against opposition, (3) Performance at the venue, (4) Role certainty (opening batsman vs. floater), (5) Credit difference (if one is cheaper, use savings elsewhere). If still tied, go with your gut instinct.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I pick players from both teams equally?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily equally, but you should have representation from both teams. A 7-4 or 6-5 split is common. Avoid going 9-2 or more extreme unless there's a massive skill gap between teams. Having players from both teams ensures you benefit regardless of which team dominates.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the best time to finalize my fantasy team?</h4>
                            <p className="text-muted-foreground">
                                Wait until team lineups are officially announced (usually 30-60 minutes before match start). This ensures all your selected players are actually playing. Also consider waiting for the toss result, as it can inform batting vs. bowling strategy, though this leaves less time for changes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many teams should I create for a single match?</h4>
                            <p className="text-muted-foreground">
                                For small contests (head-to-head or small leagues), 1-2 teams is sufficient. For large contests (grand leagues), creating 3-5 teams with different captain choices and formations increases your winning probability. However, ensure each team is well-researched rather than creating many random variations.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can I win consistently at fantasy cricket, or is it mostly luck?</h4>
                            <p className="text-muted-foreground">
                                Fantasy cricket is a skill-based game with a luck component. Skilled players who research thoroughly, understand scoring systems, make informed decisions, and manage their budget effectively win more consistently than casual players. However, even the best teams can fail due to unpredictable match events. Long-term success requires both skill and accepting short-term variance.
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
                        <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
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
                                <strong className="block text-primary mb-1">Fantasy Cricket Players</strong>
                                <span className="text-sm text-muted-foreground">Calculate expected points for players to make informed captain and team selection decisions.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Contest Strategists</strong>
                                <span className="text-sm text-muted-foreground">Compare multiple captain options and formations to optimize team composition for different contest types.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                <span className="text-sm text-muted-foreground">Project player performance in fantasy format and create content around optimal team selection.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Beginners Learning Fantasy Cricket</strong>
                                <span className="text-sm text-muted-foreground">Understand how different actions translate to fantasy points and learn the scoring system.</span>
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
                                <span><strong>Platform Variations:</strong> This calculator uses standard scoring. Actual platforms (Dream11, MPL, etc.) may have slightly different point values or bonus thresholds.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Unpredictable Performance:</strong> Projected points assume expected performance. Actual match results can vary dramatically due to form, conditions, and opposition.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Doesn't Account for Playing XI:</strong> Calculator assumes all selected players will play. Always verify team lineups before match start.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>No Substitution Logic:</strong> Fantasy platforms may have substitution rules if a player doesn't play. This calculator doesn't model those scenarios.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Format Assumptions:</strong> Point values may differ between T20, ODI, and Test fantasy cricket. Verify format-specific rules.</span>
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
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Explosive Opener (Captain)</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Player scores 78 runs (78 points) with 8 fours (+8) and 4 sixes (+8), plus half-century bonus (+8). Base points: 102. As captain (2x): 204 points. This demonstrates why high-scoring batsmen with boundaries make excellent captains.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: Strike Bowler Performance</h5>
                                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                                    Bowler takes 4 wickets (100 points), bowls 1 maiden (+8), gets 4-wicket bonus (+8), and economy bonus (+6). Base points: 122. As vice-captain (1.5x): 183 points. Shows how wicket-taking bowlers can match batsmen's point potential.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: All-Rounder Multi-Discipline</h5>
                                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                                    All-rounder scores 42 runs (42 points) with 3 fours (+3) and 2 sixes (+4), takes 2 wickets (50 points), and 1 catch (+8). Base points: 107. As captain (2x): 214 points. Illustrates why all-rounders who contribute in multiple areas are premium captain options.
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
                        <h2 className="text-xl font-semibold">Summary</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>The Fantasy Cricket Points Calculator helps you project player performance in fantasy format, enabling data-driven team selection and captain choices.</p>
                    <p>By understanding the point scoring system and using this tool to compare options, you can build optimized teams that maximize point potential within budget constraints.</p>
                    <p>Use this calculator before every match to evaluate captain candidates, compare formations, and make informed decisions that increase your chances of fantasy cricket success.</p>
                </CardContent>
            </Card>
        </div>
    );
}
