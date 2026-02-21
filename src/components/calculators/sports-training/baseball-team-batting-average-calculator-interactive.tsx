'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Baseball Team Batting Average
// Formula: Team AVG = Total Team Hits / Total Team At-Bats
const formSchema = z.object({
    teamHits: z.number().min(0, "Team hits must be non-negative"),
    teamAtBats: z.number().min(1, "Team at-bats must be at least 1"),
    gamesPlayed: z.number().min(1, "Games played must be at least 1").optional(),
}).refine(data => data.teamHits <= data.teamAtBats, {
    message: "Team hits cannot exceed team at-bats",
    path: ["teamHits"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballTeamBattingAverageCalculatorInteractive() {
    const [result, setResult] = useState<{
        average: number;
        averageString: string;
        hitsPerGame: number | null;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamHits: undefined,
            teamAtBats: undefined,
            gamesPlayed: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.teamHits == null || v.teamAtBats == null) return null;
        if (v.teamAtBats === 0) return { value: 0, formatted: '.000', hitsPerGame: null };

        const avg = v.teamHits / v.teamAtBats;
        const hitsPerGame = v.gamesPlayed ? v.teamHits / v.gamesPlayed : null;

        return {
            value: avg,
            formatted: avg.toFixed(3).replace(/^0+/, ''),
            hitsPerGame,
        };
    };

    const interpret = (avg: number) => {
        if (avg >= 0.290) return 'Elite Offense — A historically dominant team batting performance.';
        if (avg >= 0.270) return 'Excellent Team Offense — Top-tier offensive output, playoff-caliber.';
        if (avg >= 0.255) return 'Above Average Offense — Outperforming the league average consistently.';
        if (avg >= 0.240) return 'Average Team Offense — Typical league-range performance.';
        if (avg >= 0.220) return 'Below Average Offense — Needs lineup improvements to compete.';
        return 'Poor Offensive Output — Significant lineup and approach changes required.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg >= 0.280) return 'Elite';
        if (avg >= 0.260) return 'Above Average';
        if (avg >= 0.245) return 'League Average';
        if (avg >= 0.220) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (avg: number) => {
        if (avg >= 0.280) return 'Outstanding team offense. Focus on protecting the lineup against specialist pitchers and maintaining depth in case of injuries.';
        if (avg >= 0.255) return 'Solid team average. Look to add a disciplined on-base presence (high OBP) to complement the contact hitters and increase run production.';
        if (avg >= 0.240) return 'League-average offense. Identify the weakest hitters in the lineup and work on pitch recognition scouting reports vs. upcoming opponents.';
        if (avg >= 0.220) return 'Below-average offense. Consider lineup construction changes, platoon advantages, and extra batting practice with a focus on contact and two-strike approaches.';
        return 'Serious offensive struggles. Evaluate whether positional changes or roster moves are necessary. Focus drills on reducing strikeouts and increasing walk rate.';
    };

    const getRating = (avg: number) => {
        if (avg >= 0.275) return 'Elite';
        if (avg >= 0.260) return 'Good';
        if (avg >= 0.245) return 'Average';
        if (avg >= 0.225) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (avg: number, hitsPerGame: number | null) => {
        const insights: string[] = [];
        if (avg >= 0.270) {
            insights.push('Team is generating elite offensive output — top-10 MLB territory.');
            insights.push('Likely producing 9+ hits per game, keeping deficits recoverable.');
            insights.push('High AVG teams typically rank in the top 5 in runs scored per game.');
        } else if (avg >= 0.250) {
            insights.push('Team is making consistent contact — a strong foundation for run production.');
            insights.push('Combined with on-base skills (OBP), this offense can score 4-5 runs per game.');
            insights.push('Upgrade one lineup spot to an elite hitter to push into elite-offense territory.');
        } else {
            insights.push('Contact rate is below expectations — key hitters may be slumping.');
            insights.push('Consider checking BABIP trends to separate bad luck from true skill regression.');
            insights.push('Teams below .240 AVG must compensate with exceptional power or walk rate.');
        }
        if (hitsPerGame !== null) {
            insights.push(`At ${hitsPerGame.toFixed(1)} hits per game, the offense is ${hitsPerGame >= 9 ? 'elite' : hitsPerGame >= 7 ? 'competitive' : 'struggling to generate opportunities'}.`);
        }
        return insights;
    };

    const getRiskFactors = (avg: number) => {
        const risks: string[] = [];
        risks.push('Team AVG ignores walks (BB) — a team with low AVG but high OBP may be more productive than it appears.');
        risks.push('Does not measure power — a .250 lineup with 250 home runs is far more dangerous than .250 with 50 home runs.');
        risks.push('Heavily influenced by lineup construction — one elite or poor hitter can skew the team-wide number.');
        risks.push('Sample size matters: team AVG early in the season can fluctuate wildly over small samples.');
        if (avg >= 0.275) {
            risks.push('High team AVG can mask poor plate discipline — opposing pitchers may start throwing more breaking balls when scouting reveals a contact-heavy approach.');
        }
        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                average: resultValue.value,
                averageString: resultValue.formatted,
                hitsPerGame: resultValue.hitsPerGame,
                interpretation: interpret(resultValue.value),
                performanceLevel: getPerformanceLevel(resultValue.value),
                recommendation: getRecommendation(resultValue.value),
                rating: getRating(resultValue.value),
                insights: getInsights(resultValue.value, resultValue.hitsPerGame),
                riskFactors: getRiskFactors(resultValue.value),
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Team Season Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your team&apos;s total hits and official at-bats to calculate team batting average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="teamHits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Team Hits (H)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 1350"
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
                                    name="teamAtBats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Team At-Bats (AB)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 5500"
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
                                    name="gamesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Games Played (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 162"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Team Batting Average
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
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Team Batting Average (AVG)</h2>
                                    <p className="text-muted-foreground">Collective Offensive Contact Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.averageString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">{result.hitsPerGame ? 'Hits Per Game' : 'Contact Rate'}</p>
                                    <p className="text-lg font-bold">
                                        {result.hitsPerGame ? result.hitsPerGame.toFixed(1) : `${(result.average * 100).toFixed(1)}%`}
                                    </p>
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
                                <CardDescription>Key Team Performance Takeaways</CardDescription>
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
                                <CardDescription>Why Team AVG isn&apos;t the full picture</CardDescription>
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
