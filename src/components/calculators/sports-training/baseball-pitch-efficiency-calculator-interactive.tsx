'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Baseball Pitch Efficiency
// Core Metric: Pitches Per Inning (PPI) = Total Pitches / Innings Pitched
// Secondary: Strikes Per Pitch (Strike%) = Strikes Thrown / Total Pitches
// Tertiary: First Pitch Strike % = First Pitch Strikes / Batters Faced
const formSchema = z.object({
    totalPitches: z.number().min(1, "Total pitches must be at least 1"),
    inningsPitched: z.number().min(0.1, "Innings pitched must be positive"),
    strikesThrown: z.number().min(0, "Strikes thrown must be non-negative"),
    battersFaced: z.number().min(1, "Batters faced must be at least 1"),
    firstPitchStrikes: z.number().min(0, "First pitch strikes must be non-negative").optional(),
}).refine(data => data.strikesThrown <= data.totalPitches, {
    message: "Strikes cannot exceed total pitches",
    path: ["strikesThrown"]
}).refine(data => {
    if (data.firstPitchStrikes !== undefined && data.firstPitchStrikes > data.battersFaced) return false;
    return true;
}, {
    message: "First pitch strikes cannot exceed batters faced",
    path: ["firstPitchStrikes"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballPitchEfficiencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        pitchesPerInning: number;
        strikePercentage: number;
        pitchesPerBatter: number;
        firstPitchStrike: number | null;
        efficiencyScore: number;
        rating: string;
        performanceLevel: string;
        interpretation: string;
        recommendation: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalPitches: undefined,
            inningsPitched: undefined,
            strikesThrown: undefined,
            battersFaced: undefined,
            firstPitchStrikes: undefined,
        },
    });

    const calculateEfficiency = (v: FormValues) => {
        const pitchesPerInning = v.totalPitches / v.inningsPitched;
        const strikePercentage = (v.strikesThrown / v.totalPitches) * 100;
        const pitchesPerBatter = v.totalPitches / v.battersFaced;
        const firstPitchStrike = v.firstPitchStrikes != null
            ? (v.firstPitchStrikes / v.battersFaced) * 100
            : null;

        // Composite efficiency score (0–100 scale)
        // Lower PPI = better; Higher Strike% = better; Lower PPB = better; Higher FPS% = better
        const ppiScore = Math.max(0, Math.min(100, (20 - pitchesPerInning) * 10)); // ~15 PPI = elite
        const strikeScore = Math.min(100, strikePercentage * (100 / 70)); // 70% strikes = 100
        const ppbScore = Math.max(0, Math.min(100, (5 - pitchesPerBatter) * 50)); // ~3.5 PPB = elite
        const fpsScore = firstPitchStrike !== null ? Math.min(100, (firstPitchStrike / 65) * 100) : 60; // FPS% > 65 = elite

        const efficiencyScore = (ppiScore * 0.35 + strikeScore * 0.30 + ppbScore * 0.20 + fpsScore * 0.15);

        return { pitchesPerInning, strikePercentage, pitchesPerBatter, firstPitchStrike, efficiencyScore };
    };

    const interpret = (ppi: number, strikeP: number, efficiency: number) => {
        if (efficiency >= 80) return 'Elite Pitch Efficiency — Historically efficient outing. Deep innings, excellent command.';
        if (efficiency >= 65) return 'Above Average Efficiency — Strong command and pitch economy, typical starting rotation quality.';
        if (efficiency >= 50) return 'Average Efficiency — League-average control. Some inefficient innings pulling up pitch count.';
        if (efficiency >= 35) return 'Below Average — Command issues driving up pitch counts. Difficulty going deep into games.';
        return 'Poor Pitch Efficiency — Serious control problems. High risk of early removal and bullpen overuse.';
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 80) return 'Elite';
        if (score >= 65) return 'Above Average';
        if (score >= 50) return 'Average';
        if (score >= 35) return 'Below Average';
        return 'Poor';
    };

    const getRating = (score: number) => {
        if (score >= 80) return 'Ace Quality';
        if (score >= 65) return 'Good';
        if (score >= 50) return 'Average';
        if (score >= 35) return 'Fair';
        return 'Needs Work';
    };

    const getRecommendation = (v: FormValues, ppi: number, strikeP: number, fps: number | null) => {
        if (ppi > 18) {
            return 'Pitch count is running high per inning. Work on throwing more first-pitch strikes and expanding the zone early in counts to avoid deep counts.';
        }
        if (strikeP < 60) {
            return 'Strike percentage is below 60%, causing high pitch counts. Focus on command of the fastball in/out, focusing on hitting the catcher\'s target rather than speed.';
        }
        if (fps !== null && fps < 55) {
            return 'First-pitch strike rate is too low. Hitters with 0-0 counts hit significantly better. Attack the zone first-pitch with your best strike-throwing pitch.';
        }
        if (ppi <= 14 && strikeP >= 65) {
            return 'Excellent efficiency. Continue mixing sequences and keep batters off-balance. Deep game work requires sustaining this efficiency into the 6th+ inning.';
        }
        return 'Solid efficiency overall. To reach elite levels, sharpen pitch-to-pitch sequencing and focus on increasing first-pitch strike rate above 65%.';
    };

    const getInsights = (ppi: number, strikeP: number, ppb: number, fps: number | null, score: number) => {
        const insights: string[] = [];

        if (ppi <= 15) {
            insights.push(`At ${ppi.toFixed(1)} pitches/inning, this pitcher can project to complete 6+ innings on a standard 90-100 pitch limit.`);
        } else if (ppi <= 18) {
            insights.push(`At ${ppi.toFixed(1)} pitches/inning, a 90-pitch limit projects to approximately ${Math.floor(90 / ppi).toFixed(0)} innings — typical for quality starts.`);
        } else {
            insights.push(`At ${ppi.toFixed(1)} pitches/inning, a 100-pitch limit only projects to ${(100 / ppi).toFixed(1)} innings — a concern for starter longevity.`);
        }

        if (strikeP >= 65) {
            insights.push(`A ${strikeP.toFixed(1)}% strike rate is above the MLB average threshold of ~62-65%. Command is strong.`);
        } else {
            insights.push(`A ${strikeP.toFixed(1)}% strike rate is below the MLB average of ~62-65%. Working in hitter-friendly counts (2-0, 3-1) is affecting efficiency.`);
        }

        if (fps !== null) {
            const comparison = fps >= 65 ? 'at an elite level' : fps >= 55 ? 'slightly below average' : 'well below average';
            insights.push(`First-pitch strike rate of ${fps.toFixed(1)}% is ${comparison}. When pitchers throw first-pitch strikes, batter batting average drops dramatically.`);
        }

        if (ppb <= 3.8) {
            insights.push(`At ${ppb.toFixed(1)} pitches per batter, this pitcher is efficient at retiring hitters quickly — a key trait of durable starters.`);
        } else {
            insights.push(`At ${ppb.toFixed(1)} pitches per batter, sequences are running long. More early-count swings or quick outs would improve efficiency significantly.`);
        }

        return insights;
    };

    const getRiskFactors = (v: FormValues, ppi: number, strikeP: number) => {
        const risks: string[] = [];
        risks.push('Pitch efficiency alone does not measure run prevention. A pitcher can be efficient but still allow many runs if contact quality is poor.');
        risks.push('Strikeout totals are not included in this metric — a pitcher can be efficient with weak contact (ground balls, pop-ups) rather than strikeouts.');
        risks.push('Different pitch types have different efficiency profiles. A junk-baller with 55% strikes might be very effective; an overpowering closer at 60% might not.');
        if (ppi > 17) {
            risks.push('High pitches per inning significantly increases injury risk over a long season — overuse of the arm compounds when starters cannot go deep.');
        }
        risks.push('Sample size matters greatly for pitching metrics. A single-game pitch efficiency reading may not reflect a pitcher\'s true capabilities over a season.');
        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const calc = calculateEfficiency(values);
        const fps = calc.firstPitchStrike;

        setResult({
            pitchesPerInning: calc.pitchesPerInning,
            strikePercentage: calc.strikePercentage,
            pitchesPerBatter: calc.pitchesPerBatter,
            firstPitchStrike: fps,
            efficiencyScore: calc.efficiencyScore,
            rating: getRating(calc.efficiencyScore),
            performanceLevel: getPerformanceLevel(calc.efficiencyScore),
            interpretation: interpret(calc.pitchesPerInning, calc.strikePercentage, calc.efficiencyScore),
            recommendation: getRecommendation(values, calc.pitchesPerInning, calc.strikePercentage, fps),
            insights: getInsights(calc.pitchesPerInning, calc.strikePercentage, calc.pitchesPerBatter, fps, calc.efficiencyScore),
            riskFactors: getRiskFactors(values, calc.pitchesPerInning, calc.strikePercentage),
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Pitching Performance Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter pitching statistics to calculate pitch efficiency, command quality, and endurance projection
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalPitches"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Total Pitches Thrown
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 95"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="inningsPitched"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Innings Pitched (IP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 6.0"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="strikesThrown"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Total Strikes Thrown
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 64"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="battersFaced"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Total Batters Faced (TBF)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 24"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="firstPitchStrikes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            First-Pitch Strikes (Optional — for FPS% calculation)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="1"
                                                placeholder="e.g., 16"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Pitch Efficiency
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
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Pitch Efficiency Report</h2>
                                    <p className="text-muted-foreground">Command, Control & Endurance Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.efficiencyScore.toFixed(0)}<span className="text-xl font-normal">/100</span></p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            {/* Primary Metric Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-xs">Pitches / Inning</p>
                                    <p className="text-xl font-bold">{result.pitchesPerInning.toFixed(1)}</p>
                                    <Badge variant={result.pitchesPerInning <= 15 ? 'default' : result.pitchesPerInning <= 17 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.pitchesPerInning <= 15 ? 'Elite' : result.pitchesPerInning <= 17 ? 'Good' : 'High'}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-xs">Strike Rate</p>
                                    <p className="text-xl font-bold">{result.strikePercentage.toFixed(1)}%</p>
                                    <Badge variant={result.strikePercentage >= 65 ? 'default' : result.strikePercentage >= 60 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.strikePercentage >= 65 ? 'Elite' : result.strikePercentage >= 60 ? 'Average' : 'Low'}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold text-xs">Pitches / Batter</p>
                                    <p className="text-xl font-bold">{result.pitchesPerBatter.toFixed(1)}</p>
                                    <Badge variant={result.pitchesPerBatter <= 3.8 ? 'default' : result.pitchesPerBatter <= 4.2 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.pitchesPerBatter <= 3.8 ? 'Efficient' : result.pitchesPerBatter <= 4.2 ? 'Average' : 'High'}
                                    </Badge>
                                </div>
                                {result.firstPitchStrike !== null && (
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <Shield className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                        <p className="font-semibold text-xs">1st Pitch Strike%</p>
                                        <p className="text-xl font-bold">{result.firstPitchStrike.toFixed(1)}%</p>
                                        <Badge variant={result.firstPitchStrike >= 65 ? 'default' : result.firstPitchStrike >= 55 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                            {result.firstPitchStrike >= 65 ? 'Elite' : result.firstPitchStrike >= 55 ? 'Average' : 'Low'}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Overall Rating */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                                    <p className="font-semibold">Efficiency Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'} className="mt-1">
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                                    <p className="font-semibold">Pitcher Rating</p>
                                    <Badge variant={result.rating === 'Ace Quality' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'} className="mt-1">
                                        {result.rating}
                                    </Badge>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Recommendation:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Smart Insights & Risk Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key Pitching Intelligence Takeaways</CardDescription>
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

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Risk Factors & Limitations
                                </CardTitle>
                                <CardDescription>What Pitch Efficiency doesn&apos;t capture</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
