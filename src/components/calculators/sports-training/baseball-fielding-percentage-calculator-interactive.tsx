'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Hand } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema - Fielding Percentage
// Formula: FPCT = (Putouts + Assists) / (Putouts + Assists + Errors)
const formSchema = z.object({
    putouts: z.number().min(0, "Putouts must be non-negative"),
    assists: z.number().min(0, "Assists must be non-negative"),
    errors: z.number().min(0, "Errors must be non-negative"),
}).refine(data => (data.putouts + data.assists + data.errors) > 0, {
    message: "Total chances (Putouts + Assists + Errors) must be greater than 0",
    path: ["putouts"] // Attach error to putouts primarily, or generic
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballFieldingPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        fpct: number;
        fpctString: string;
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
            putouts: undefined,
            assists: undefined,
            errors: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.putouts == null || v.assists == null || v.errors == null) return null;

        const totalChances = v.putouts + v.assists + v.errors;
        if (totalChances === 0) return null;

        const successfulPlays = v.putouts + v.assists;
        const fpct = successfulPlays / totalChances;

        // Fielding percentage is traditionally displayed to 3 decimal places
        return {
            value: fpct,
            formatted: fpct.toFixed(3).replace(/^0+/, '')
        };
    };

    const interpret = (fpct: number) => {
        if (fpct >= 0.990) return 'Gold Glove Caliber - Exceptional reliability.';
        if (fpct >= 0.980) return 'Solid Defender - Very trustworthy in the field.';
        if (fpct >= 0.970) return 'Average Defender - Makes the routine plays.';
        if (fpct >= 0.950) return 'Below Average - Occasional lapses in concentration or mechanics.';
        return 'Defensive Liability - Significant improvement needed in glove work or throwing.';
    };

    const getPerformanceLevel = (fpct: number) => {
        if (fpct >= 0.990) return 'Elite';
        if (fpct >= 0.980) return 'Above Average';
        if (fpct >= 0.970) return 'Average';
        if (fpct >= 0.950) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (fpct: number) => {
        if (fpct >= 0.990) return 'Maintain focus and mental sharpness. You are a defensive anchor.';
        if (fpct >= 0.980) return 'Continue working on footwork for difficult plays to reach elite status.';
        if (fpct >= 0.960) return 'Focus on "sure" outs. Don\'t rush throws. Improving footwork will reduce throwing errors.';
        return 'Go back to basics. Drill fielding mechanics (funneling, footwork) and throwing accuracy daily.';
    };

    const getRating = (fpct: number) => {
        if (fpct >= 0.990) return 'Excellent';
        if (fpct >= 0.980) return 'Very Good';
        if (fpct >= 0.960) return 'Average';
        if (fpct >= 0.940) return 'Fair';
        return 'Poor';
    };

    const getInsights = (fpct: number) => {
        const insights = [];
        if (fpct >= 0.990) {
            insights.push('Extremely reliable; coaches trust you in high-pressure situations.');
            insights.push('Likely saves runs for pitchers by making nearly all routine plays.');
            insights.push('Rarely gives the opposition "extra outs."');
        } else if (fpct >= 0.970) {
            insights.push('Competent fielder who handles most chances cleanly.');
            insights.push('Errors are infrequent but may happen on tougher plays.');
        } else {
            insights.push('Errors are costing the team runs and extending innings.');
            insights.push('May be playing out of position or needs mechanical overhaul.');
            insights.push('Pitchers may feel less confident pitching to contact.');
        }
        return insights;
    };

    const getConsiderations = (fpct: number) => {
        const considerations = [];
        considerations.push('Fielding Percentage does NOT measure range. A player who reaches fewer balls might have fewer errors.');
        considerations.push('Position matters: First basemen often have higher FPCT than Shortstops due to play difficulty.');
        considerations.push('Scorers\' judgment influences Error calls vs. Hits.');
        considerations.push('Does not account for "scoops" or saving bad throws from other fielders.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue !== null) {
            setResult({
                fpct: resultValue.value,
                fpctString: resultValue.formatted,
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
                        <h2 className="text-xl font-semibold">Defensive Stats</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your defensive statistics to calculate Fielding Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="putouts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Hand className="h-4 w-4" />
                                                Putouts (PO)
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
                                    name="assists"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Assists (A)
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
                                    name="errors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Errors (E)
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
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Fielding Percentage
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
                                    <h2 className="text-2xl font-bold">Fielding Percentage (FPCT)</h2>
                                    <p className="text-muted-foreground">Defensive Reliability Metric</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.fpctString}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Rating</p>
                                    <Badge variant={result.rating === 'Excellent' ? 'default' : result.rating === 'Very Good' ? 'secondary' : 'outline'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Reliability</p>
                                    <p className="text-lg font-bold">{(result.fpct * 100).toFixed(1)}%</p>
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
                                <CardDescription>What this stat misses</CardDescription>
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
