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

// Form validation schema - Baseball Batting Average
// Formula: AVG = Hits / At Bats
const formSchema = z.object({
    hits: z.number().min(0, "Hits must be non-negative"),
    atBats: z.number().min(1, "At Bats must be at least 1"),
}).refine(data => data.hits <= data.atBats, {
    message: "Hits cannot exceed At Bats",
    path: ["hits"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballBattingAverageCalculatorInteractive() {
    const [result, setResult] = useState<{
        average: number;
        averageString: string;
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
            atBats: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.hits == null || v.atBats == null) return null;
        if (v.atBats === 0) return { value: 0, formatted: ".000" };

        const avg = v.hits / v.atBats;

        // Baseball averages are traditionally displayed to 3 decimal places without the leading zero (e.g., .300)
        return {
            value: avg,
            formatted: avg.toFixed(3).replace(/^0+/, '')
        };
    };

    const interpret = (avg: number) => {
        if (avg >= 0.400) return 'Legendary Performance - One of the greatest seasons of all time.';
        if (avg >= 0.300) return 'Excellent Hitter - An All-Star caliber performance.';
        if (avg >= 0.280) return 'Above Average Hitter - Solid starter quality.';
        if (avg >= 0.250) return 'Average Hitter - Typical major league performance.';
        if (avg >= 0.200) return 'Below Average - Needs improvement or brings other value (defense/power).';
        return 'Struggling at the plate - Risk of being benched or sent down.';
    };

    const getPerformanceLevel = (avg: number) => {
        if (avg >= 0.300) return 'All-Star';
        if (avg >= 0.280) return 'Above Average';
        if (avg >= 0.250) return 'League Average';
        if (avg >= 0.200) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (avg: number) => {
        if (avg >= 0.300) return 'Maintain approach. Focus on consistency and adjusting to pitchers making adjustments to you.';
        if (avg >= 0.250) return 'Good foundation. To reach the next level, improve pitch recognition or hit to all fields.';
        if (avg >= 0.200) return 'Focus on making more contact and reducing strikeouts. shortening your swing may help.';
        return 'Significant mechanical or approach adjustments needed. Work on basic contact drills and plate discipline.';
    };

    const getRating = (avg: number) => {
        if (avg >= 0.300) return 'Elite';
        if (avg >= 0.270) return 'Good';
        if (avg >= 0.250) return 'Average';
        if (avg >= 0.200) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (avg: number) => {
        const insights = [];
        if (avg >= 0.300) {
            insights.push('Batting .300 is the gold standard for hitters.');
            insights.push('High probability of reaching base via hit.');
            insights.push('Likely a top-order or middle-order batter.');
        } else if (avg >= 0.250) {
            insights.push('Consistent contributor to the offense.');
            insights.push('Respectable performance for a starter.');
            insights.push('May need power or walks to boost overall value (OPS).');
        } else {
            insights.push('Contact rate needs improvement.');
            insights.push('May be relying too much on power (Three True Outcomes).');
            insights.push('Pressure on defensive value to stay in lineup.');
        }
        return insights;
    };

    const getConsiderations = (avg: number) => {
        const considerations = [];
        considerations.push('Batting Average ignores walks (Base on Balls). Use OBP for a complete picture.');
        considerations.push('Does not measure power (Slugging). A .300 singles hitter is different from a .300 slugger.');
        considerations.push('Sample size matters - small number of At Bats can skew average wildly.');
        considerations.push('Sacrifice flies and bunts are excluded from At Bats, helping the average.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                average: resultValue.value,
                averageString: resultValue.formatted,
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
                        Enter hits and official at-bats (AB) to calculate batting average
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
                                                    step="1"
                                                    placeholder="e.g., 500"
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
                                Calculate Batting Average
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
                                    <h2 className="text-2xl font-bold">Batting Average (AVG)</h2>
                                    <p className="text-muted-foreground">Historical Efficiency Metric</p>
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
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'All-Star' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'}>
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
                                    <p className="font-semibold">Success Rate</p>
                                    <p className="text-lg font-bold">{(result.average * 100).toFixed(1)}%</p>
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
                                <CardDescription>Why AVG isn't everything</CardDescription>
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
