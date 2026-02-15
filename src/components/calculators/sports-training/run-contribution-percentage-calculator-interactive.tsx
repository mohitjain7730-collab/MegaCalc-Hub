'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    individualRuns: z.number().min(0, "Individual runs must be non-negative"),
    teamTotal: z.number().min(0, "Team total must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RunContributionPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        contributionPercentage: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        teamImpact: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            individualRuns: undefined,
            teamTotal: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.individualRuns == null || v.teamTotal == null) return null;
        if (v.teamTotal === 0) return 0;
        return (v.individualRuns / v.teamTotal) * 100;
    };

    const interpret = (percentage: number) => {
        if (percentage >= 50) return 'Exceptional individual contribution! Dominated the innings and carried the team.';
        if (percentage >= 40) return 'Outstanding contribution indicating match-winning performance.';
        if (percentage >= 30) return 'Excellent contribution with significant impact on team total.';
        if (percentage >= 20) return 'Good contribution as part of team effort.';
        if (percentage >= 10) return 'Moderate contribution - decent support to team total.';
        return 'Minimal contribution to team total.';
    };

    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 50) return 'Match Winner';
        if (percentage >= 40) return 'Outstanding';
        if (percentage >= 30) return 'Excellent';
        if (percentage >= 20) return 'Good';
        if (percentage >= 10) return 'Average';
        return 'Below Average';
    };

    const getRecommendation = (percentage: number) => {
        if (percentage >= 50) return 'Exceptional innings! Continue this dominant form while ensuring team support in future innings.';
        if (percentage >= 40) return 'Outstanding performance. Maintain this level of contribution while building partnerships.';
        if (percentage >= 30) return 'Excellent innings. Focus on converting good starts into match-winning performances more consistently.';
        if (percentage >= 20) return 'Solid contribution. Work on increasing strike rate and converting starts into bigger scores.';
        if (percentage >= 10) return 'Decent support role. Look to take more responsibility and build larger innings.';
        return 'Limited impact on team total. Focus on improving consistency and building longer innings.';
    };

    const getRating = (percentage: number) => {
        if (percentage >= 50) return 'Exceptional';
        if (percentage >= 40) return 'Outstanding';
        if (percentage >= 30) return 'Excellent';
        if (percentage >= 20) return 'Good';
        if (percentage >= 10) return 'Fair';
        return 'Needs Improvement';
    };

    const getInsights = (percentage: number) => {
        const insights = [];
        if (percentage >= 50) {
            insights.push('Dominated the innings with exceptional individual performance');
            insights.push('Carried the team single-handedly - match-winning contribution');
            insights.push('Demonstrated outstanding consistency and concentration');
            insights.push('Likely played a long innings with high strike rate');
        } else if (percentage >= 40) {
            insights.push('Major contributor to team total with outstanding innings');
            insights.push('Anchored the innings effectively');
            insights.push('High-impact performance that shaped the match');
            insights.push('Demonstrated excellent batting skills and temperament');
        } else if (percentage >= 30) {
            insights.push('Significant contribution to team success');
            insights.push('Played crucial role in building competitive total');
            insights.push('Good balance between aggression and consolidation');
            insights.push('Effective partnership building');
        } else if (percentage >= 20) {
            insights.push('Solid supporting innings');
            insights.push('Contributed meaningfully to team effort');
            insights.push('Part of collective batting performance');
            insights.push('Decent foundation for team total');
        } else if (percentage >= 10) {
            insights.push('Moderate contribution to team score');
            insights.push('Supporting role in team innings');
            insights.push('Room for improvement in impact');
            insights.push('Needs to convert starts into substantial scores');
        } else {
            insights.push('Limited impact on team total');
            insights.push('Early dismissal or very slow scoring rate');
            insights.push('Significant improvement needed');
            insights.push('Failed to capitalize on batting opportunity');
        }
        return insights;
    };

    const getRiskFactors = (percentage: number) => {
        const risks = [];
        if (percentage >= 50) {
            risks.push('Over-reliance on single batsman - team vulnerability if this player fails');
            risks.push('Other batsmen may lack confidence or responsibility');
            risks.push('Unsustainable long-term - team needs more balanced contributions');
            risks.push('High pressure on this batsman in every match');
        } else if (percentage >= 40) {
            risks.push('Heavy dependence on one batsman - needs support from others');
            risks.push('Team may struggle if this player has off day');
            risks.push('Other batsmen should step up to share responsibility');
        } else if (percentage >= 30) {
            risks.push('Good individual performance but team needs more contributors');
            risks.push('Balanced team effort required for consistency');
        } else if (percentage >= 20) {
            risks.push('Contribution is adequate but not match-defining');
            risks.push('Team needs bigger innings from top/middle order');
        } else if (percentage >= 10) {
            risks.push('Low contribution indicates batting order concerns');
            risks.push('Player needs to take more responsibility');
            risks.push('Risk of being dropped if performance doesn\'t improve');
        } else {
            risks.push('Minimal contribution - serious performance concerns');
            risks.push('Technical or mental issues may need addressing');
            risks.push('Position in team may be under threat');
        }
        return risks;
    };

    const getTeamImpact = (percentage: number) => {
        if (percentage >= 50) return 'Single-handedly carried the team - match-winning impact';
        if (percentage >= 40) return 'Major pillar of team innings - critical impact';
        if (percentage >= 30) return 'Key contributor to team total - significant impact';
        if (percentage >= 20) return 'Important supporting role - moderate impact';
        if (percentage >= 10) return 'Minor contributor - limited impact';
        return 'Negligible impact on team performance';
    };

    const onSubmit = (values: FormValues) => {
        const pct = calculate(values);
        if (pct !== null) {
            setResult({
                contributionPercentage: pct,
                interpretation: interpret(pct),
                performanceLevel: getPerformanceLevel(pct),
                recommendation: getRecommendation(pct),
                rating: getRating(pct),
                insights: getInsights(pct),
                riskFactors: getRiskFactors(pct),
                teamImpact: getTeamImpact(pct)
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
                        <h2 className="text-xl font-semibold">Batting Contribution</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter individual runs and team total to calculate contribution percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="individualRuns"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <PieChart className="h-4 w-4" />
                                                Individual Runs Scored
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 85"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="teamTotal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Team Total Score
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g., 275"
                                                    {...field}
                                                    value={field.value ?? ''}
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
                                Calculate Run Contribution Percentage
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
                                <PieChart className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Run Contribution Percentage</h2>
                                    <p className="text-muted-foreground">Individual Impact Analysis</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.contributionPercentage.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">of team total</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Performance Level</p>
                                    <Badge variant={result.performanceLevel === 'Match Winner' || result.performanceLevel === 'Outstanding' ? 'default' : result.performanceLevel === 'Excellent' || result.performanceLevel === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Exceptional' || result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' || result.rating === 'Good' ? 'secondary' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Team Impact</p>
                                    <p className="text-xs font-bold mt-1">{result.teamImpact}</p>
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
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from contribution analysis</CardDescription>
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
                                    Risk Factors
                                </CardTitle>
                                <CardDescription>Important considerations and warnings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.riskFactors.map((risk, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
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
