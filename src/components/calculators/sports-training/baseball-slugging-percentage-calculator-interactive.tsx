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

// Form validation schema - Baseball Slugging Percentage
// Formula: SLG = Total Bases / At Bats
// Total Bases = (1B) + (2 × 2B) + (3 × 3B) + (4 × HR)
const formSchema = z.object({
    atBats: z.number().min(1, "At Bats must be at least 1"),
    singles: z.number().min(0, "Singles must be non-negative"),
    doubles: z.number().min(0, "Doubles must be non-negative"),
    triples: z.number().min(0, "Triples must be non-negative"),
    homeRuns: z.number().min(0, "Home Runs must be non-negative"),
}).refine(data => {
    const totalHits = data.singles + data.doubles + data.triples + data.homeRuns;
    return totalHits <= data.atBats;
}, {
    message: "Total hits (1B + 2B + 3B + HR) cannot exceed At Bats",
    path: ["atBats"] // Attach error to atBats field, or maybe a general error?
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballSluggingPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        slugging: number;
        sluggingString: string;
        totalBases: number;
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
            atBats: undefined,
            singles: undefined,
            doubles: undefined,
            triples: undefined,
            homeRuns: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.atBats === undefined) return null;
        if (v.atBats === 0) return 0;

        const singles = v.singles || 0;
        const doubles = v.doubles || 0;
        const triples = v.triples || 0;
        const homeRuns = v.homeRuns || 0;

        const totalBases = (singles) + (2 * doubles) + (3 * triples) + (4 * homeRuns);
        const slg = totalBases / v.atBats;

        return {
            value: slg,
            formatted: slg.toFixed(3).replace(/^0+/, ''),
            totalBases: totalBases
        };
    };

    const interpret = (slg: number) => {
        if (slg >= 0.600) return 'Elite Power Hitter - MVP caliber slugging.';
        if (slg >= 0.500) return 'Excellent Power - All-Star level production.';
        if (slg >= 0.450) return 'Above Average Power - Strong gap-to-gap threat.';
        if (slg >= 0.400) return 'Average Power - Respectable for most positions.';
        if (slg >= 0.350) return 'Below Average Power - Typical for defensive specialists.';
        return 'Low Power Output - Needs to rely on speed or OBP.';
    };

    const getPerformanceLevel = (slg: number) => {
        if (slg >= 0.550) return 'MVP Level';
        if (slg >= 0.500) return 'All-Star';
        if (slg >= 0.450) return 'Above Average';
        if (slg >= 0.400) return 'League Average';
        return 'Below Average';
    };

    const getRecommendation = (slg: number) => {
        if (slg >= 0.500) return 'Maintain your aggression. Pitchers will start pitching around you, so stay disciplined.';
        if (slg >= 0.400) return 'Good foundation. Look to turn those singles into doubles by attacking early in the count.';
        if (slg >= 0.350) return 'Focus on driving the ball rather than just making contact. Incorporate lower body strength training.';
        return 'Evaluate your swing mechanics. Are you rolling over? Work on staying through the ball to generate lift.';
    };

    const getRating = (slg: number) => {
        if (slg >= 0.550) return 'Elite';
        if (slg >= 0.480) return 'Great';
        if (slg >= 0.400) return 'Good';
        if (slg >= 0.350) return 'Fair';
        return 'Needs Work';
    };

    const getInsights = (slg: number) => {
        const insights = [];
        if (slg >= 0.500) {
            insights.push('You are a major extra-base hit threat.');
            insights.push('Opposing pitchers likely gameplan specifically for you.');
            insights.push('High value in the middle of the order (3rd, 4th, 5th spot).');
        } else if (slg >= 0.400) {
            insights.push('Reliable gap power and extra-base potential.');
            insights.push('Valuable for driving in runs (RBIs).');
            insights.push('Balanced hitter who can punish mistakes.');
        } else {
            insights.push('Likely a contact-oriented or "slap" hitter.');
            insights.push('Value comes from OBP, speed, or defense.');
            insights.push('Limited ability to score form first on a double.');
        }
        return insights;
    };

    const getConsiderations = (slg: number) => {
        const considerations = [];
        considerations.push('Slugging Percentage ignores walks (OBP is needed for full picture).');
        considerations.push('A high SLG with a low AVG means lots of home runs but also likely lots of strikeouts.');
        considerations.push('Ballpark factors heavily influence SLG (e.g., Coors Field vs. Pitcher parks).');
        considerations.push('Speed players can inflate SLG with triples and hustle doubles, not just raw power.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue && typeof resultValue !== 'number') {
            setResult({
                slugging: resultValue.value,
                sluggingString: resultValue.formatted,
                totalBases: resultValue.totalBases,
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
                        <h2 className="text-xl font-semibold">Season Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your hit breakdown to calculate Slugging Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="atBats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                At Bats (AB)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 400"
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
                                    name="singles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-blue-500" />
                                                Singles (1B)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 80"
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
                                    name="doubles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-green-500" />
                                                Doubles (2B)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 25"
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
                                    name="triples"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-orange-500" />
                                                Triples (3B)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 2"
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
                                    name="homeRuns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-red-500" />
                                                Home Runs (HR)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 20"
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
                                Calculate Slugging Percentage
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
                                    <h2 className="text-2xl font-bold">Slugging Percentage (SLG)</h2>
                                    <p className="text-muted-foreground">Power Production Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.sluggingString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'MVP Level' || result.performanceLevel === 'All-Star' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'}>
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
                                    <p className="font-semibold">Total Bases</p>
                                    <p className="text-lg font-bold">{result.totalBases}</p>
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

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />
                                    Context & Limitations
                                </CardTitle>
                                <CardDescription>Important Factors</CardDescription>
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
