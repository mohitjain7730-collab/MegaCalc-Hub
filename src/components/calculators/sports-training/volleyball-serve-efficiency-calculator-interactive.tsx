'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Serve Efficiency = (Aces - Service Errors) / Total Serves
// Serve Success Rate = ((Total Serves - Service Errors) / Total Serves) × 100
// Ace Rate = (Aces / Total Serves) × 100
const formSchema = z.object({
    aces: z.number().min(0, 'Aces must be non-negative'),
    serviceErrors: z.number().min(0, 'Service errors must be non-negative'),
    totalServes: z.number().min(1, 'Total serves must be at least 1'),
}).refine(d => d.aces + d.serviceErrors <= d.totalServes, {
    message: 'Aces + Errors cannot exceed total serves',
    path: ['aces'],
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballServeEfficiencyCalculatorInteractive() {
    const [result, setResult] = useState<{
        serveEfficiency: number;
        serveSuccessRate: number;
        aceRate: number;
        errorRate: number;
        rating: string;
        performanceLevel: string;
        interpretation: string;
        recommendation: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { aces: undefined, serviceErrors: undefined, totalServes: undefined },
    });

    const getRating = (eff: number) => {
        if (eff >= 0.200) return 'Elite';
        if (eff >= 0.120) return 'Above Average';
        if (eff >= 0.060) return 'Average';
        if (eff >= 0.000) return 'Below Average';
        return 'Poor';
    };

    const getPerformanceLevel = (successRate: number) => {
        if (successRate >= 92) return 'Elite';
        if (successRate >= 87) return 'Above Average';
        if (successRate >= 82) return 'Average';
        if (successRate >= 75) return 'Below Average';
        return 'Poor';
    };

    const interpret = (eff: number, successRate: number) => {
        if (eff >= 0.200) return 'Elite Server — High ace rate with excellent control. A genuine weapon off the service line.';
        if (eff >= 0.120) return 'Above Average Serving — Strong contribution. Pressuring opponents consistently while keeping errors low.';
        if (eff >= 0.060) return 'Average Serving — Competitive consistency with modest ace production. Manageable error rate.';
        if (eff >= 0.000) return 'Below Average Serving — Low aces relative to errors. Serving may be giving opponents free points too often.';
        return 'Negative Serve Efficiency — More service errors than aces. Service line is currently working against the team.';
    };

    const getRecommendation = (aces: number, errors: number, serves: number, eff: number) => {
        const errorRate = errors / serves;
        if (errorRate > 0.18) return 'Service error rate exceeds 18% — prioritize keeping the ball in play. Reduce pace and target a consistent zone (deep corners, seam between passers) before incorporating more aggressive serving.';
        if (eff < 0.060) return 'Serving is not generating enough pressure relative to costly errors. Consider targeting zones that create difficult passing angles (short-angle crosscourt, deep seam) rather than relying on raw pace.';
        if (eff >= 0.200) return 'Elite serving. Continue varying placement and spin to prevent opponents from reading patterns. Mix serve types (jump float, jump topspin) to disrupt passing rhythm.';
        return 'Solid serving. To reach elite levels, develop a second serve type (if using only one) and track which reception zones produce the most reception errors for targeted improvement.';
    };

    const getInsights = (aces: number, errors: number, serves: number, eff: number, successRate: number, aceRate: number) => {
        const insights: string[] = [];
        insights.push(`Serve efficiency of ${eff >= 0 ? '+' : ''}${eff.toFixed(3)} places this server ${eff >= 0.120 ? 'above' : eff >= 0.060 ? 'at' : 'below'} the competitive average of ~.060–.120.`);
        insights.push(`Ace rate of ${aceRate.toFixed(1)}% means roughly 1 ace every ${(100 / Math.max(aceRate, 0.01)).toFixed(0)} serves. Elite servers average 1 ace every 8–15 serves.`);
        insights.push(`In-bound rate of ${successRate.toFixed(1)}% is ${successRate >= 90 ? 'excellent control' : successRate >= 82 ? 'acceptable' : 'too low — each error is a free point for the opponent'}.`);
        insights.push(`Over ${serves} serves, this server contributed ${aces} direct ace points and gave away ${errors} free points via errors — a net of ${aces - errors > 0 ? '+' : ''}${aces - errors} service-line points.`);
        return insights;
    };

    const getRiskFactors = (eff: number) => {
        return [
            'Serve efficiency does not measure reception pressure created by in-play serves — a serve that forces a third-contact set or poor pass is valuable even without an ace.',
            'Ace rate can be inflated against weak reception teams and deflated against elite passing lineups — opponent context is critical.',
            'Does not distinguish serve type (float, jump float, jump topspin) — efficiency benchmarks differ significantly by serve technique.',
            'Service errors in crucial game moments (break points, set points) are far more damaging than errors in low-leverage rotations — aggregate error counts hide this.',
            'Short sample sizes (under 30 serves) can produce misleading efficiency values due to natural variance in ace and error distribution.',
        ];
    };

    const onSubmit = (v: FormValues) => {
        const serveEfficiency = (v.aces - v.serviceErrors) / v.totalServes;
        const serveSuccessRate = ((v.totalServes - v.serviceErrors) / v.totalServes) * 100;
        const aceRate = (v.aces / v.totalServes) * 100;
        const errorRate = (v.serviceErrors / v.totalServes) * 100;
        setResult({
            serveEfficiency,
            serveSuccessRate,
            aceRate,
            errorRate,
            rating: getRating(serveEfficiency),
            performanceLevel: getPerformanceLevel(serveSuccessRate),
            interpretation: interpret(serveEfficiency, serveSuccessRate),
            recommendation: getRecommendation(v.aces, v.serviceErrors, v.totalServes, serveEfficiency),
            insights: getInsights(v.aces, v.serviceErrors, v.totalServes, serveEfficiency, serveSuccessRate, aceRate),
            riskFactors: getRiskFactors(serveEfficiency),
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Serve Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your serving data to calculate efficiency, ace rate, and in-bound percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="aces" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Trophy className="h-4 w-4" />Aces</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="serviceErrors" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Service Errors</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 3" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="totalServes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Total Serves</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 40" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />Calculate Serve Efficiency
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
                                    <h2 className="text-2xl font-bold">Serve Efficiency Report</h2>
                                    <p className="text-muted-foreground">Ace Rate, Control &amp; Net Contribution</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">
                                    {result.serveEfficiency >= 0 ? '+' : ''}{result.serveEfficiency.toFixed(3)}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Serve Efficiency Score</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                                    <p className="font-semibold text-xs">Ace Rate</p>
                                    <p className="text-xl font-bold">{result.aceRate.toFixed(1)}%</p>
                                    <Badge variant={result.aceRate >= 10 ? 'default' : result.aceRate >= 5 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.aceRate >= 10 ? 'Elite' : result.aceRate >= 5 ? 'Good' : 'Low'}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                                    <p className="font-semibold text-xs">Error Rate</p>
                                    <p className="text-xl font-bold">{result.errorRate.toFixed(1)}%</p>
                                    <Badge variant={result.errorRate <= 8 ? 'default' : result.errorRate <= 15 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.errorRate <= 8 ? 'Excellent' : result.errorRate <= 15 ? 'Average' : 'High'}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-xs">In-Bound Rate</p>
                                    <p className="text-xl font-bold">{result.serveSuccessRate.toFixed(1)}%</p>
                                    <Badge variant={result.serveSuccessRate >= 90 ? 'default' : result.serveSuccessRate >= 82 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold text-xs">Overall Rating</p>
                                    <Badge variant={result.rating === 'Elite' ? 'default' : result.rating === 'Above Average' ? 'secondary' : 'outline'} className="mt-1">
                                        {result.rating}
                                    </Badge>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />Smart Insights
                                </CardTitle>
                                <CardDescription>Key Serving Intelligence Takeaways</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium">{insight}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />Risk Factors &amp; Limitations
                                </CardTitle>
                                <CardDescription>What serve efficiency doesn&apos;t capture</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.riskFactors.map((risk, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
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
