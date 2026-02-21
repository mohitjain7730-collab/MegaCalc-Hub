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

// Formula: Attack Success Rate (%) = (Kills / Total Attacks) × 100
// Hitting Efficiency = (Kills - Attack Errors) / Total Attacks
const formSchema = z.object({
    kills: z.number().min(0, 'Kills must be non-negative'),
    attackErrors: z.number().min(0, 'Attack errors must be non-negative'),
    totalAttempts: z.number().min(1, 'Total attempts must be at least 1'),
}).refine(d => d.kills + d.attackErrors <= d.totalAttempts, {
    message: 'Kills + Errors cannot exceed total attempts',
    path: ['kills'],
});

type FormValues = z.infer<typeof formSchema>;

export default function VolleyballAttackSuccessRateCalculatorInteractive() {
    const [result, setResult] = useState<{
        attackSuccessRate: number;
        hittingEfficiency: number;
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
        defaultValues: { kills: undefined, attackErrors: undefined, totalAttempts: undefined },
    });

    const getRating = (eff: number) => {
        if (eff >= 0.350) return 'Elite';
        if (eff >= 0.280) return 'Above Average';
        if (eff >= 0.200) return 'Average';
        if (eff >= 0.120) return 'Below Average';
        return 'Poor';
    };

    const getPerformanceLevel = (asr: number) => {
        if (asr >= 55) return 'Elite';
        if (asr >= 45) return 'Above Average';
        if (asr >= 35) return 'Average';
        if (asr >= 25) return 'Below Average';
        return 'Poor';
    };

    const interpret = (eff: number, asr: number) => {
        if (eff >= 0.350) return 'Elite Attacker — Top-5% hitting efficiency. Dominant offensive weapon at any level.';
        if (eff >= 0.280) return 'Excellent Attack — Above-average efficiency. Reliable offensive contributor with good decision-making.';
        if (eff >= 0.200) return 'Solid Attack — League-average efficiency. Competitive but room to reduce errors.';
        if (eff >= 0.120) return 'Developing Attacker — Below average. Focus on reducing unforced errors and improving shot selection.';
        return 'Struggling Offensively — High error rate relative to kills. Fundamentals and approach adjustments needed.';
    };

    const getRecommendation = (kills: number, errors: number, attempts: number, eff: number) => {
        const errorRate = errors / attempts;
        if (errorRate > 0.20) return 'Error rate is critically high (>20%). Focus on controlled attacks targeting open court rather than going for the lines. Consistency over aggression.';
        if (eff < 0.200) return 'Hitting efficiency is below average. Work on reading blockers before swinging and develop a higher-percentage shot (tool off the block, deep corner) as a primary option.';
        if (eff >= 0.350) return 'Outstanding efficiency. Continue varying attack angles and speeds to keep blockers off-balance. Maintaining this at higher block complexity is the next challenge.';
        return 'Good efficiency. To reach elite levels, reduce errors by 1–2 per set and develop a go-to shot against 2-person blocks.';
    };

    const getInsights = (kills: number, errors: number, attempts: number, asr: number, eff: number) => {
        const insights: string[] = [];
        const errorRate = (errors / attempts * 100).toFixed(1);
        insights.push(`Attack success rate of ${asr.toFixed(1)}% means ${asr.toFixed(0)} out of every 100 swings result in a direct kill point.`);
        if (eff >= 0.300) {
            insights.push('Hitting efficiency above .300 is NCAA Division I scholarship territory — this is elite performance.');
        } else if (eff >= 0.200) {
            insights.push('Hitting efficiency in the .200–.300 range is solid competitive volleyball. A few fewer errors per match would move this into elite territory.');
        } else {
            insights.push('Hitting efficiency below .200 typically signals too many unforced errors or attacks going directly into the block.');
        }
        insights.push(`Error rate stands at ${errorRate}%. ${parseFloat(errorRate) <= 12 ? 'This is excellent control.' : parseFloat(errorRate) <= 18 ? 'Borderline — aim for under 12%.' : 'Reducing errors is the single fastest path to efficiency improvement.'}`);
        insights.push(`For every ${(attempts / Math.max(kills, 1)).toFixed(1)} swings, one kill is recorded. Elite attackers average one kill every 2–3 swings.`);
        return insights;
    };

    const getRiskFactors = (eff: number) => {
        const risks: string[] = [];
        risks.push('Attack Success Rate does not account for serve quality or setter distribution — poor sets will lower efficiency regardless of attacker skill.');
        risks.push('Efficiency is heavily opponent-dependent: a .350 efficiency vs. a weak block shows less than .280 vs. elite international blocking.');
        risks.push('Small sample sizes (under 50 attempts) can produce misleading efficiency numbers due to variance in defensive positioning.');
        risks.push('Does not capture "tool" attacks (off the block for out-of-bounds) which count as kills but require different technique assessment.');
        if (eff < 0.150) risks.push('Very low efficiency may indicate the attacker is being over-set in a compromised position — setter decision-making may be a contributing factor.');
        return risks;
    };

    const onSubmit = (v: FormValues) => {
        const asr = (v.kills / v.totalAttempts) * 100;
        const eff = (v.kills - v.attackErrors) / v.totalAttempts;
        const errorRate = (v.attackErrors / v.totalAttempts) * 100;
        setResult({
            attackSuccessRate: asr,
            hittingEfficiency: eff,
            errorRate,
            rating: getRating(eff),
            performanceLevel: getPerformanceLevel(asr),
            interpretation: interpret(eff, asr),
            recommendation: getRecommendation(v.kills, v.attackErrors, v.totalAttempts, eff),
            insights: getInsights(v.kills, v.attackErrors, v.totalAttempts, asr, eff),
            riskFactors: getRiskFactors(eff),
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Attack Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter your attack stats to calculate success rate and hitting efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="kills" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Trophy className="h-4 w-4" />Kills</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 18" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="attackErrors" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Attack Errors</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="totalAttempts" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Total Attempts</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="e.g., 45" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />Calculate Attack Success Rate
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
                                <Trophy className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Attack Performance Report</h2>
                                    <p className="text-muted-foreground">Success Rate &amp; Hitting Efficiency</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.attackSuccessRate.toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">Attack Success Rate</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                                    <p className="font-semibold text-xs">Hitting Efficiency</p>
                                    <p className="text-xl font-bold">{result.hittingEfficiency >= 0 ? '+' : ''}{result.hittingEfficiency.toFixed(3)}</p>
                                    <Badge variant={result.hittingEfficiency >= 0.280 ? 'default' : result.hittingEfficiency >= 0.200 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                                    <p className="font-semibold text-xs">Error Rate</p>
                                    <p className="text-xl font-bold">{result.errorRate.toFixed(1)}%</p>
                                    <Badge variant={result.errorRate <= 12 ? 'default' : result.errorRate <= 18 ? 'secondary' : 'outline'} className="text-xs mt-1">
                                        {result.errorRate <= 12 ? 'Excellent' : result.errorRate <= 18 ? 'Average' : 'High'}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-xs">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Elite' ? 'default' : result.performanceLevel === 'Above Average' ? 'secondary' : 'outline'} className="mt-1">
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
                                <CardDescription>Key Attack Performance Takeaways</CardDescription>
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
                                <CardDescription>What this metric doesn&apos;t capture</CardDescription>
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
