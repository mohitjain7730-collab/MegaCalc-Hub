'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Activity, Zap, Users, Star, Award, Crown } from 'lucide-react';
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

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Player Performance Data
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
                        Fantasy Points System
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
                        Related Cricket Calculators
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

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">About Fantasy Cricket Points</h3>
                            <p className="text-sm text-muted-foreground">
                                Fantasy cricket points are calculated based on real match performance across batting, bowling, and fielding.
                                Players earn points for runs, wickets, catches, and other contributions, with bonus points for milestones like fifties, centuries, and multi-wicket hauls.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Strategic selection of captain (2x points) and vice-captain (1.5x points) can significantly boost your fantasy team's total score.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
