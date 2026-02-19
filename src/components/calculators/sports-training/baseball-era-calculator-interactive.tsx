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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Form validation schema - ERA
// ERA = (Earned Runs / Innings Pitched) * Innings Per Game (usually 9)
const formSchema = z.object({
    earnedRuns: z.number().min(0, "Earned Runs must be non-negative"),
    inningsPitched: z.number().gt(0, "Innings Pitched must be greater than 0"),
    inningsFormat: z.enum(["9", "7", "6"], {
        required_error: "Please select game length",
    }),
}).refine(data => {
    // Validate IP decimal part (baseball notation: .1 = 1/3, .2 = 2/3)
    const decimal = data.inningsPitched % 1;
    // allowable decimals are approx 0, 0.1, 0.2. Allow some float tolerance
    const roundedDec = Math.round(decimal * 10);
    return roundedDec === 0 || roundedDec === 1 || roundedDec === 2;
}, {
    message: "Invalid Innings Pitched format. Use .1 for 1 out and .2 for 2 outs.",
    path: ["inningsPitched"]
});

type FormValues = z.infer<typeof formSchema>;

export default function BaseballEraCalculatorInteractive() {
    const [result, setResult] = useState<{
        era: number;
        eraString: string;
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
            earnedRuns: undefined,
            inningsPitched: undefined,
            inningsFormat: "9",
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
        if (v.earnedRuns === undefined || v.inningsPitched === undefined) return null;

        const realIP = parseInnings(v.inningsPitched);
        const gameLength = parseInt(v.inningsFormat);

        if (realIP === 0) return 0; // Avoid div by zero, though schema prevents 0

        const era = (v.earnedRuns * gameLength) / realIP;

        return {
            value: era,
            formatted: era.toFixed(2)
        };
    };

    const interpret = (era: number) => {
        if (era < 2.00) return 'Ace - Dominant performance, typically leads the league.';
        if (era < 3.00) return 'Excellent - All-Star caliber pitching.';
        if (era < 3.75) return 'Above Average - Solid #2 or #3 starter.';
        if (era < 4.50) return 'Average - Serviceable starter or middle reliever.';
        if (era < 5.50) return 'Below Average - Struggling to contain offenses.';
        return 'Poor - High risk of being removed from rotation.';
    };

    const getPerformanceLevel = (era: number) => {
        if (era < 2.50) return 'Elite';
        if (era < 3.50) return 'All-Star';
        if (era < 4.20) return 'Average';
        if (era < 5.00) return 'Below Average';
        return 'Poor';
    };

    const getRecommendation = (era: number) => {
        if (era < 3.00) return 'Maintain consistency. Focus on arm care and repeating delivery to sustain this dominance.';
        if (era < 4.00) return 'Great work. To lower it further, focus on situational pitching—preventing runners from scoring.';
        if (era < 5.00) return 'Analyze your walks and home runs allowed. Reducing "free bases" is the quickest way to lower ERA.';
        return 'Major adjustment needed. Re-evaluate pitch location and selection. Are you tipping pitches?';
    };

    const getRating = (era: number) => {
        if (era < 2.50) return 'Elite';
        if (era < 3.30) return 'Great';
        if (era < 4.00) return 'Good';
        if (era < 5.00) return 'Fair';
        return 'Needs Work';
    };

    const getInsights = (era: number) => {
        const insights = [];
        if (era < 3.00) {
            insights.push('You give your team a very high chance to win every start.');
            insights.push('Opponents likely struggle to string hits together against you.');
        } else if (era < 4.50) {
            insights.push('You keep your team in the game most days.');
            insights.push('Focus on efficiency to go deeper into games.');
        } else {
            insights.push('Runs are scoring too frequently.');
            insights.push('Likely facing issues with command or location.');
        }
        return insights;
    };

    const getConsiderations = (era: number) => {
        const considerations = [];
        considerations.push('ERA ignores unearned runs (scored via errors).');
        considerations.push('It does not account for inherited runners (relevant for relievers).');
        considerations.push('Ballpark factors and team defense heavily influence ERA.');
        considerations.push('FIP (Fielding Independent Pitching) is often a better measure of pure pitching skill.');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const resultValue = calculate(values);
        if (resultValue) {
            setResult({
                era: resultValue.value,
                eraString: resultValue.formatted,
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
                        Enter your pitching statistics to calculate ERA
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="earnedRuns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                Earned Runs (ER)
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
                                                    placeholder="e.g., 60.2"
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
                                <FormField
                                    control={form.control}
                                    name="inningsFormat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Game Standard
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select standard" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="9">9 Innings (MLB/College)</SelectItem>
                                                    <SelectItem value="7">7 Innings (Softball/HS)</SelectItem>
                                                    <SelectItem value="6">6 Innings (Little League)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate ERA
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
                                    <h2 className="text-2xl font-bold">Earned Run Average (ERA)</h2>
                                    <p className="text-muted-foreground">Run Prevention Efficiency</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.eraString}</p>
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
                                    <p className="font-semibold">Runs Per Game</p>
                                    <p className="text-lg font-bold">{result.eraString}</p>
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
