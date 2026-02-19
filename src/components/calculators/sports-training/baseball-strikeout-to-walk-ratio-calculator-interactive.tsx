'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Skull } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Strikeout-to-Walk Ratio
// Formula: K/BB = Strikeouts / Walks
const formSchema = z.object({
    strikeouts: z.number().min(0, "Strikeouts must be non-negative"),
    walks: z.number().min(0, "Walks must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballStrikeoutToWalkRatioCalculatorInteractive() {
    const [result, setResult] = useState<{
        ratio: number;
        ratioString: string;
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
            strikeouts: undefined,
            walks: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.strikeouts == null || v.walks == null) return null;

        // Handle division by zero
        if (v.walks === 0) {
            // If walks is 0, ratio is technically infinite. 
            // We'll return a special case object or just a very high number display
            if (v.strikeouts > 0) {
                return {
                    value: Infinity,
                    formatted: "Perfect (∞)"
                };
            } else {
                return {
                    value: 0,
                    formatted: "0.00" // 0 K / 0 BB
                };
            }
        }

        const ratio = v.strikeouts / v.walks;

        return {
            value: ratio,
            formatted: ratio.toFixed(2)
        };
    };

    const interpret = (ratio: number) => {
        if (ratio === Infinity) return 'Perfect Control - Zero walks allowed.';
        if (ratio >= 5.0) return 'Elite Command - Cy Young caliber control.';
        if (ratio >= 4.0) return 'Ace Material - Dominant strike-thrower.';
        if (ratio >= 3.0) return 'Solid Starter - Good command of the zone.';
        if (ratio >= 2.0) return 'Average - Acceptable for a back-end starter.';
        if (ratio >= 1.5) return 'Below Average - Struggling with command.';
        return 'Major Control Issues - Walks are hurting performance significantly.';
    };

    const getPerformanceLevel = (ratio: number) => {
        if (ratio >= 5.0) return 'Elite';
        if (ratio >= 3.5) return 'Great';
        if (ratio >= 2.5) return 'Good';
        if (ratio >= 2.0) return 'Average';
        return 'Poor';
    };

    const getRecommendation = (ratio: number) => {
        if (ratio >= 4.0) return 'Maintain aggressive approach. Hitters feel pressure to swing early knowing you won\'t walk them.';
        if (ratio >= 3.0) return 'Continue attacking the zone. Focus on "pitching to contact" early in counts to save arm.';
        if (ratio >= 2.0) return 'Work on first-pitch strikes. Reducing 3-ball counts will naturally lower walks.';
        return 'Immediate mechanical adjustment needed. Simplify delivery to improve repeatability and strike throwing.';
    };

    const getRating = (ratio: number) => {
        if (ratio >= 5.0) return 'A+';
        if (ratio >= 4.0) return 'A';
        if (ratio >= 3.0) return 'B';
        if (ratio >= 2.0) return 'C';
        if (ratio >= 1.5) return 'D';
        return 'F';
    };

    const getInsights = (ratio: number) => {
        const insights = [];
        if (ratio >= 3.0) {
            insights.push('You strike out 3+ batters for every walk allowed.');
            insights.push('Excellent command reduces pitch count and base runners.');
            insights.push('High K/BB is strongly correlated with low ERA and WHIP.');
        } else if (ratio >= 2.0) {
            insights.push('Standard major league average performance.');
            insights.push('Walks are manageable but could be improved.');
        } else {
            insights.push('Too many "free passes" (walks).');
            insights.push('Likely forcing defense to work harder with runners on base.');
            insights.push('High risk of "big innings" due to walks compounding hits.');
        }
        return insights;
    };

    const getConsiderations = (ratio: number) => {
        const considerations = [];
        considerations.push('K/BB does not measure "quality of contact." A pitcher could have a high K/BB but give up many home runs.');
        considerations.push('Some styles (knuckleballers, groundball specialists) naturally have lower K rates but induce weak contact.');
        considerations.push('Intentional Walks (IBB) are included in standard BB counts but are strategic, not control failures.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                ratio: resultValue.value,
                ratioString: resultValue.formatted,
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
                        <h2 className="text-xl font-semibold">Pitching Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter Strikeouts and Walks to calculate K/BB Ratio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="strikeouts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Strikeouts (K)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 200"
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
                                                <AlertCircle className="h-4 w-4" />
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
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate K/BB Ratio
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
                                    <h2 className="text-2xl font-bold">K/BB Ratio</h2>
                                    <p className="text-muted-foreground">Command & Control Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.ratioString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Good' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={['A+', 'A', 'B'].includes(result.rating) ? 'default' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Strikeouts per Walk</p>
                                    <p className="text-lg font-bold">{result.ratio === Infinity ? "∞" : result.ratio.toFixed(2)}</p>
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
                                <CardDescription>Performance Analysis</CardDescription>
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
                                    <Skull className="h-6 w-6" />
                                    Context & Limitations
                                </CardTitle>
                                <CardDescription>What K/BB misses</CardDescription>
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
