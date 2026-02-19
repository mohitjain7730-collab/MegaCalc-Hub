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

// Form validation schema - OPS Calculator
const formSchema = z.object({
    atBats: z.number().min(1, "At Bats must be at least 1"),
    hits: z.number().min(0, "Hits must be non-negative"),
    doubles: z.number().min(0).optional(),
    triples: z.number().min(0).optional(),
    homeRuns: z.number().min(0).optional(),
    walks: z.number().min(0).optional(),
    hitByPitch: z.number().min(0).optional(),
    sacFlies: z.number().min(0).optional(),
}).refine(data => {
    return data.hits <= data.atBats;
}, {
    message: "Hits cannot exceed At Bats",
    path: ["hits"]
}).refine(data => {
    const d = data.doubles || 0;
    const t = data.triples || 0;
    const hr = data.homeRuns || 0;
    return (d + t + hr) <= data.hits;
}, {
    message: "Extra base hits cannot exceed total hits",
    path: ["hits"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballOpsCalculatorInteractive() {
    const [result, setResult] = useState<{
        ops: number;
        opsString: string;
        obp: string;
        slg: string;
        interpretation: string;
        rating: string;
        insights: string[];
        recommendation: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            atBats: undefined,
            hits: undefined,
            doubles: undefined,
            triples: undefined,
            homeRuns: undefined,
            walks: undefined,
            hitByPitch: undefined,
            sacFlies: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.atBats === undefined || v.hits === undefined) return null;

        const H = v.hits;
        const AB = v.atBats;
        const D = v.doubles || 0;
        const T = v.triples || 0;
        const HR = v.homeRuns || 0;
        const BB = v.walks || 0;
        const HBP = v.hitByPitch || 0;
        const SF = v.sacFlies || 0;

        // Calculate OBP
        // OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
        const obpNumerator = H + BB + HBP;
        const obpDenominator = AB + BB + HBP + SF;
        const obp = obpDenominator > 0 ? obpNumerator / obpDenominator : 0;

        // Calculate SLG
        // SLG = (1B + 2*2B + 3*3B + 4*HR) / AB
        // 1B = H - D - T - HR
        const S = H - D - T - HR;
        const totalBases = S + (2 * D) + (3 * T) + (4 * HR);
        const slg = AB > 0 ? totalBases / AB : 0;

        const ops = obp + slg;

        return {
            ops,
            obp,
            slg,
            formattedOps: ops.toFixed(3).replace(/^0+/, ''),
            formattedObp: obp.toFixed(3).replace(/^0+/, ''),
            formattedSlg: slg.toFixed(3).replace(/^0+/, '')
        };
    };

    const interpret = (ops: number) => {
        if (ops >= 1.000) return 'MVP Caliber - Absolute dominance at the plate.';
        if (ops >= 0.900) return 'Elite Hitter - All-Star level production.';
        if (ops >= 0.800) return 'Above Average - Strong offensive contributor.';
        if (ops >= 0.700) return 'Average - Solid major league regular.';
        if (ops >= 0.600) return 'Below Average - Struggling to produce runs.';
        return 'Poor Production - Risk of losing roster spot.';
    };

    const getRating = (ops: number) => {
        if (ops >= 0.900) return 'Elite';
        if (ops >= 0.800) return 'Great';
        if (ops >= 0.700) return 'Good';
        if (ops >= 0.600) return 'Fair';
        return 'Poor';
    };

    const getRecommendation = (ops: number) => {
        if (ops >= 0.900) return 'Maintain your approach. You are balancing getting on base and driving the ball perfectly.';
        if (ops >= 0.800) return 'Great work. Look for small adjustments to turn walks into aggression on hittable pitches.';
        if (ops >= 0.700) return 'Solid. To reach the next level, identify if OBP or SLG is lagging and focus training there.';
        return 'Focus on On-Base Percentage first. A walk is as good as a hit for starting rallies. Don\'t chase power.';
    };

    const getInsights = (ops: number, obp: number, slg: number) => {
        const insights = [];
        if (ops >= 0.900) {
            insights.push('You are likely the best hitter on your team.');
        }

        if (obp > slg) {
            insights.push('You rely more on patience and getting on base than raw power.');
            insights.push('You would fit well in the leadoff spot.');
        } else if (slg > obp + 0.150) {
            insights.push('You are a power-first hitter ("Slugger").');
            insights.push('You fit well in the middle of the order (cleanup).');
        } else {
            insights.push('You have a balanced offensive profile.');
        }

        return insights;
    };

    const onSubmit = (values: FormValues) => {
        const res = calculate(values);
        if (res) {
            setResult({
                ops: res.ops,
                opsString: res.formattedOps,
                obp: res.formattedObp,
                slg: res.formattedSlg,
                interpretation: interpret(res.ops),
                rating: getRating(res.ops),
                recommendation: getRecommendation(res.ops),
                insights: getInsights(res.ops, res.obp, res.slg)
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
                        <h2 className="text-xl font-semibold">Calculator Inputs</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your stats to calculate OPS (On-Base + Slugging)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="atBats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>At Bats (AB)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 300" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hits (H)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 90" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="doubles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doubles (2B)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="triples"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Triples (3B)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="homeRuns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Home Runs (HR)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                                            <FormLabel>Walks (BB)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                                            <FormLabel>Hit By Pitch (HBP)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sacFlies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sacrifice Flies (SF)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate OPS
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
                                    <h2 className="text-2xl font-bold">OPS (On-base Plus Slugging)</h2>
                                    <p className="text-muted-foreground">Comprehensive Offensive Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.opsString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">On-Base % (OBP)</p>
                                    <p className="text-lg font-bold">{result.obp}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Slugging % (SLG)</p>
                                    <p className="text-lg font-bold">{result.slg}</p>
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
                                <CardDescription>Performance Indicators</CardDescription>
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
                        <Card className="h-full border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                                    <Info className="h-6 w-6" />
                                    What This Means
                                </CardTitle>
                                <CardDescription>Understanding your OPS</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        OPS combines your ability to get on base (OBP) with your ability to hit for power (SLG). It is often cited as the single best statistic to measure a player's overall offensive value.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
