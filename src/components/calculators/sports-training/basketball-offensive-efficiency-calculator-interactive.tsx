'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Calculator, Info, CheckCircle2, Trophy, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    points: z.number().min(0, "Points must be non-negative"),
    fga: z.number().min(0, "Field Goal Attempts must be non-negative"),
    fta: z.number().min(0, "Free Throw Attempts must be non-negative"),
    orb: z.number().min(0, "Offensive Rebounds must be non-negative"),
    turnovers: z.number().min(0, "Turnovers must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasketballOffensiveEfficiencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        offensiveRating: number;
        possessions: number;
        interpretation: string;
        efficiencyLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            points: undefined,
            fga: undefined,
            fta: undefined,
            orb: undefined,
            turnovers: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        // Possessions Formula: FGA - ORB + TOV + (0.44 * FTA)
        const possessions = v.fga - v.orb + v.turnovers + (0.44 * v.fta);

        if (possessions <= 0) return null;

        // Offensive Rating (Points per 100 Possessions)
        const ortg = 100 * (v.points / possessions);

        return { ortg, possessions };
    };

    const interpret = (ortg: number) => {
        if (ortg >= 120) return 'Historically elite offensive efficiency. Absolute dominance.';
        if (ortg >= 115) return 'Superstar level efficiency. extremely productive.';
        if (ortg >= 110) return 'Excellent efficiency. All-Star caliber contribution.';
        if (ortg >= 105) return 'Good efficiency. Solid starter or rotation player.';
        if (ortg >= 100) return 'Average efficiency. Replacement level offense.';
        return 'Below average efficiency. Struggling to score effectively.';
    };

    const getEfficiencyLevel = (ortg: number) => {
        if (ortg >= 118) return 'Unstoppable';
        if (ortg >= 112) return 'Efficient Scorer';
        if (ortg >= 106) return 'Above Average';
        if (ortg >= 100) return 'Average';
        if (ortg >= 90) return 'Inefficient';
        return 'Liablity';
    };

    const getRecommendation = (ortg: number) => {
        if (ortg >= 115) return 'Green light. Increase volume if possible without sacrificing this efficiency.';
        if (ortg >= 108) return 'Maintain this efficiency. Look for slightly more aggressive shot selection.';
        if (ortg >= 102) return 'Analyze shot chart. eliminate low-percentage mid-range attempts.';
        if (ortg >= 95) return 'Focus on passing and cutting. Only take open catch-and-shoot looks.';
        return 'Drastic change needed. Reduce volume, focus on defense and rebounding.';
    };

    const getRating = (ortg: number) => {
        if (ortg >= 115) return 'Elite';
        if (ortg >= 108) return 'Great';
        if (ortg >= 102) return 'Good';
        if (ortg >= 96) return 'Average';
        return 'Poor';
    };

    const getInsights = (ortg: number) => {
        const insights = [];
        if (ortg >= 115) {
            insights.push('Maximizing every possession');
            insights.push('Likely high TS% or low turnovers');
            insights.push('Validates high usage');
        } else if (ortg >= 105) {
            insights.push('Positive offensive contributor');
            insights.push('Good decision making');
            insights.push('Solid shot selection');
        } else {
            insights.push('Wasting too many possessions');
            insights.push('Likely inefficient shooting or high TOV');
            insights.push('Hurting team offense');
        }
        return insights;
    };

    const getConsiderations = (ortg: number) => {
        const considerations = [];
        considerations.push('Volume matters: 120 ORtg on 5 shots is different than on 20.');
        considerations.push('Quality of teammates affects efficiency (spacing).');
        considerations.push('Matchup difficulty is not accounted for.');
        considerations.push('Garbage time stats can inflate ORtg.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const res = calculate(values);
        if (res) {
            const { ortg, possessions } = res;
            setResult({
                offensiveRating: ortg,
                possessions: possessions,
                interpretation: interpret(ortg),
                efficiencyLevel: getEfficiencyLevel(ortg),
                recommendation: getRecommendation(ortg),
                rating: getRating(ortg),
                insights: getInsights(ortg),
                considerations: getConsiderations(ortg)
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Production Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your box score stats to calculate efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="points"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Points Scored</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g. 28" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fga"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>FGA (Attempts)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g. 18" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fta"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>FTA (Attempts)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g. 6" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="orb"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Offensive Rebounds</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g. 2" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormDescription className="text-xs">Required to credit &quot;extra&quot; possessions.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="turnovers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Turnovers</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g. 3" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Efficiency
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Offensive Rating (ORtg)</h2>
                                    <p className="text-muted-foreground">Points Produced Per 100 Possessions</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.offensiveRating.toFixed(1)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Efficiency Level</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Great' ? 'secondary' : 'outline'}>
                                        {result.efficiencyLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Elite' || result.rating === 'Great' ? 'default' : 'secondary'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Possessions Used</p>
                                    <p className="text-lg font-bold">
                                        {result.possessions.toFixed(1)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <TrendingUp className="h-6 w-6" />
                                    Positive Indicators
                                </CardTitle>
                                <CardDescription>Why this rating is effective</CardDescription>
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

                        <Card className="h-full border-amber-100 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Context & Risks
                                </CardTitle>
                                <CardDescription>Factors to keep in mind</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.considerations.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{item}</span>
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
