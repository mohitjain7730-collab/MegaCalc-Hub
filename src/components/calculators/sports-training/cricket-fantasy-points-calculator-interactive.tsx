'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity, Star, Award, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    // Batting points
    runs: z.number().min(0, 'Runs must be positive or zero'),
    fours: z.number().min(0, 'Fours must be positive or zero'),
    sixes: z.number().min(0, 'Sixes must be positive or zero'),
    fiftyBonus: z.boolean(),
    centuryBonus: z.boolean(),
    duck: z.boolean(),
    // Bowling points
    wickets: z.number().min(0, 'Wickets must be positive or zero'),
    maidenOvers: z.number().min(0, 'Maiden overs must be positive or zero'),
    fourWicketBonus: z.boolean(),
    fiveWicketBonus: z.boolean(),
    // Fielding points
    catches: z.number().min(0, 'Catches must be positive or zero'),
    stumpings: z.number().min(0, 'Stumpings must be positive or zero'),
    runOuts: z.number().min(0, 'Run outs must be positive or zero'),
    // Other
    playerRole: z.string(),
    isCaptain: z.boolean(),
    isViceCaptain: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CricketFantasyPointsCalculatorInteractive() {
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
                            <div className="bg-muted/30 rounded-lg overflow-hidden">
                                {result.breakdown.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {result.breakdown.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 px-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={item.category.includes('Penalty') ? 'destructive' : item.category.includes('Bonus') ? 'default' : 'outline'} className="w-20 justify-center">
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
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No scoring events recorded based on inputs.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
