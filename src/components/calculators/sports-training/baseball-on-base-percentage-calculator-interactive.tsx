'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Baseball OBP
// Formula: OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
const formSchema = z.object({
    hits: z.number().min(0, "Hits must be non-negative"),
    walks: z.number().min(0, "Walks must be non-negative"),
    hitByPitch: z.number().min(0, "Hit By Pitch must be non-negative"),
    atBats: z.number().min(0, "At Bats must be non-negative"),
    sacrificeFlies: z.number().min(0, "Sacrifice Flies must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballOnBasePercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        obp: number;
        obpString: string;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hits: undefined,
            walks: undefined,
            hitByPitch: undefined,
            atBats: undefined,
            sacrificeFlies: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.hits == null || v.walks == null || v.hitByPitch == null || v.atBats == null || v.sacrificeFlies == null) return null;

        const numerator = v.hits + v.walks + v.hitByPitch;
        const denominator = v.atBats + v.walks + v.hitByPitch + v.sacrificeFlies;

        if (denominator === 0) return { value: 0, formatted: '.000' };

        const obp = numerator / denominator;

        // Baseball OBP is traditionally displayed to 3 decimal places without the leading zero (e.g., .400)
        return {
            value: obp,
            formatted: obp.toFixed(3).replace(/^0+/, '')
        };
    };

    const interpret = (obp: number) => {
        if (obp >= 0.400) return 'Elite On-Base Ability - MVP Caliber patience and eye.';
        if (obp >= 0.370) return 'Great Leadoff Hitter - Consistently sets the table for the lineup.';
        if (obp >= 0.340) return 'Above Average - Solid contributor, good plate discipline.';
        if (obp >= 0.310) return 'Average - Typical for most starters.';
        if (obp >= 0.290) return 'Below Average - Aggressive hitter with low walk rate.';
        return 'Struggling to get on base - Detrimental to team offense.';
    };

    const getPerformanceLevel = (obp: number) => {
        if (obp >= 0.400) return 'Superstar';
        if (obp >= 0.370) return 'All-Star';
        if (obp >= 0.340) return 'Above Average';
        if (obp >= 0.310) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (obp: number) => {
        if (obp >= 0.370) return 'Maximize plate appearances. Force pitchers to work deep counts.';
        if (obp >= 0.340) return 'Continue hitting approach. Look to isolate pitches in your zone.';
        if (obp >= 0.310) return 'Be more selective early in counts. Look for your pitch to drive.';
        return 'Must improve plate discipline. Stop chasing pitches outside the zone.';
    };

    const getRating = (obp: number) => {
        if (obp >= 0.400) return 'Elite';
        if (obp >= 0.370) return 'Great';
        if (obp >= 0.340) return 'Good';
        if (obp >= 0.310) return 'Fair';
        return 'Poor';
    };

    const getInsights = (obp: number) => {
        const insights = [];
        if (obp >= 0.400) {
            insights.push('You create scoring opportunities frequently.');
            insights.push('Opposing pitchers likely fear throwing strikes to you.');
            insights.push('Ideal leadoff or #3 hitter.');
        } else if (obp >= 0.340) {
            insights.push('Reliable run producer.');
            insights.push('Good eye for the strike zone.');
            insights.push('Balances aggression with patience well.');
        } else {
            insights.push('Low walk rate limiting offensive value.');
            insights.push('Likely making weak contact on pitcher\'s pitches.');
            insights.push('Need to force pitcher to throw strikes.');
        }
        return insights;
    };

    const getConsiderations = (obp: number) => {
        const considerations = [];
        considerations.push('OBP values walks (BB) equally to hits, unlike Batting Average.');
        considerations.push('Sacrifice Flies lower OBP (unlike AVG), penalizing productive outs.');
        considerations.push('Hit By Pitch (HBP) counts positively towards OBP.');
        considerations.push('Errors do NOT count as reaching base for OBP purposes.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                obp: resultValue.value,
                obpString: resultValue.formatted,
                interpretation: interpret(resultValue.value),
                performanceLevel: getPerformanceLevel(resultValue.value),
                recommendation: getRecommendation(resultValue.value),
                rating: getRating(resultValue.value),
                insights: getInsights(resultValue.value),
                considerations: getConsiderations(resultValue.value)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Season Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter all ways of reaching base and total plate appearances components
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="hits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                Hits (H)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 150"
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
                                    name="walks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Walks (BB)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 50"
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
                                    name="hitByPitch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Hit By Pitch (HBP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 5"
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
                                    name="atBats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calculator className="h-4 w-4" />
                                                At Bats (AB)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 450"
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
                                    name="sacrificeFlies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Sacrifice Flies (SF)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 3"
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
                                Calculate OBP
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
                                    <h2 className="text-2xl font-bold">On-Base Percentage (OBP)</h2>
                                    <p className="text-muted-foreground">The most critical batting metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.obpString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Superstar' ? 'default' : result.performanceLevel === 'All-Star' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Great' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Base Rate</p>
                                    <p className="text-lg font-bold">{(result.obp * 100).toFixed(1)}%</p>
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

                    {/* Smart Actions & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Key Takeaways
                                </CardTitle>
                                <CardDescription>Why OBP matters more than AVG</CardDescription>
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
                                    Statistical Nuance
                                </CardTitle>
                                <CardDescription>Important technicalities</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.considerations.map((consideration, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
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
