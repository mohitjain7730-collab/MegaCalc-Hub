'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingDown, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - WHIP
// WHIP = (Walks + Hits) / Innings Pitched
const formSchema = z.object({
    hits: z.number().min(0, "Hits must be non-negative"),
    walks: z.number().min(0, "Walks must be non-negative"),
    inningsPitched: z.number().gt(0, "Innings Pitched must be greater than 0"),
}).refine(data => {
    // Validate IP decimal part (baseball notation: .1 = 1/3, .2 = 2/3)
    const decimal = data.inningsPitched % 1;
    const roundedDec = Math.round(decimal * 10);
    return roundedDec === 0 || roundedDec === 1 || roundedDec === 2;
}, {
    message: "Invalid Innings Pitched format (Use .1 for 1 out, .2 for 2 outs)",
    path: ["inningsPitched"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballWhipCalculatorInteractive() {
    const [result, setResult] = useState<{
        whip: number;
        whipString: string;
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
            inningsPitched: undefined,
        },
    });

    const parseInnings = (ip: number) => {
        const whole = Math.floor(ip);
        const decimal = ip - whole;
        const roundedDec = Math.round(decimal * 10);

        // .1 = 1/3, .2 = 2/3
        if (roundedDec === 1) return whole + (1 / 3);
        if (roundedDec === 2) return whole + (2 / 3);
        return whole;
    };

    const calculate = (v: FormValues) => {
        if (v.hits === undefined || v.walks === undefined || v.inningsPitched === undefined) return null;

        const realIP = parseInnings(v.inningsPitched);

        if (realIP === 0) return 0;

        const whip = (v.walks + v.hits) / realIP;

        return {
            value: whip,
            formatted: whip.toFixed(3) // WHIP standard is 3 decimal places? often 2 or 3. 1.25. Let's do 2.
        };
    };

    const interpret = (whip: number) => {
        if (whip < 1.00) return 'Elite - Very few base runners. Ace material.';
        if (whip < 1.15) return 'Great - Strong starter or setup man.';
        if (whip < 1.30) return 'Average - Solid, but allows traffic on the bases.';
        if (whip < 1.50) return 'Below Average - Dangerous. Allows too many base runners.';
        return 'Poor - High risk of runs scoring due to volume of runners.';
    };

    const getPerformanceLevel = (whip: number) => {
        if (whip < 1.00) return 'Elite';
        if (whip < 1.20) return 'All-Star';
        if (whip < 1.35) return 'Average';
        if (whip < 1.50) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (whip: number) => {
        if (whip < 1.00) return 'Keep attacking headers. Your ability to limit base runners is your greatest weapon.';
        if (whip < 1.25) return 'Solid. Focus on first-pitch strikes to avoid walks, which inflate WHIP quickly.';
        if (whip < 1.40) return 'Reduce walks. Hits will happen, but free passes kill WHIP and lead to big innings.';
        return 'Drastic change needed. Work on command to stop walking batters, or change speeds to induce weak contact.';
    };

    const getRating = (whip: number) => {
        if (whip < 1.00) return 'Elite';
        if (whip < 1.15) return 'Great';
        if (whip < 1.30) return 'Good';
        if (whip < 1.45) return 'Fair';
        return 'Needs Work';
    };

    const getInsights = (whip: number) => {
        const insights = [];
        if (whip < 1.00) {
            insights.push('Opponents average less than one baserunner per inning.');
            insights.push('You control the pace of the game.');
        } else if (whip < 1.30) {
            insights.push('You are effective but likely pitch from the stretch often.');
            insights.push('Strikeouts are key to stranding these runners.');
        } else {
            insights.push('High stress pitching. Always pitching with runners on.');
            insights.push('Likely high pitch count per inning.');
        }
        return insights;
    };

    const getConsiderations = (whip: number) => {
        const considerations = [];
        considerations.push('WHIP treats walks and hits equally (a walk is as bad as a double).');
        considerations.push('It ignores Hit By Pitches (HBP) in the standard formula.');
        considerations.push('It ignores extra-base hits (slugging against).');
        considerations.push('Babip luck can heavily influence WHIP in small samples.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue) {
            setResult({
                whip: resultValue.value,
                whipString: resultValue.formatted,
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
                        Enter Hits, Walks, and Innings for WHIP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="walks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingDown className="h-4 w-4 text-orange-500" />
                                                Walks (BB)
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
                                <FormField
                                    control={form.control}
                                    name="hits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-blue-500" />
                                                Hits Allowed (H)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 45"
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
                                                <AlertCircle className="h-4 w-4" />
                                                Innings Pitched (IP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 60.1"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Use .1 for 1/3 inning, .2 for 2/3 inning
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate WHIP
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
                                    <h2 className="text-2xl font-bold">WHIP</h2>
                                    <p className="text-muted-foreground">Walks + Hits per Inning Pitched</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.whipString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' || result.performanceLevel === 'All-Star' ? 'default' : result.performanceLevel === 'Average' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Base Runners / IP</p>
                                    <p className="text-lg font-bold">{result.whipString}</p>
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

function FormDescription({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <p className={`text-sm text-muted-foreground ${className}`}>
            {children}
        </p>
    )
}
