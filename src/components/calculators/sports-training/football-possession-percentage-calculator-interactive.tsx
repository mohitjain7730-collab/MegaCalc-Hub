'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, TrendingUp, AlertCircle, Target, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    teamPossessionTime: z.number().min(0, "Team possession time must be non-negative"),
    totalMatchTime: z.number().min(0.01, "Total match time must be greater than zero"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballPossessionPercentageCalculatorInteractive() {
    const [result, setResult] = useState<{
        possessionPercentage: number;
        opponentPossession: number;
        interpretation: string;
        performanceLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamPossessionTime: undefined,
            totalMatchTime: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.teamPossessionTime == null || v.totalMatchTime == null) return null;
        if (v.totalMatchTime === 0) return null; // Prevent division by zero
        if (v.teamPossessionTime > v.totalMatchTime) return null; // Invalid input
        return (v.teamPossessionTime / v.totalMatchTime) * 100;
    };

    const interpret = (possession: number) => {
        if (possession >= 65) return 'Dominant possession - your team controlled the game exceptionally well.';
        if (possession >= 55) return 'Strong possession - your team had good control of the match.';
        if (possession >= 45) return 'Balanced possession - fairly even contest between both teams.';
        if (possession >= 35) return 'Low possession - your team was on the defensive for most of the match.';
        return 'Very low possession - your team struggled to maintain control of the ball.';
    };

    const getPerformanceLevel = (possession: number) => {
        if (possession >= 65) return 'Dominant';
        if (possession >= 55) return 'Strong';
        if (possession >= 45) return 'Balanced';
        if (possession >= 35) return 'Low';
        return 'Very Low';
    };

    const getRecommendation = (possession: number) => {
        if (possession >= 65) return 'Excellent ball control. Focus on converting possession into goals and maintaining defensive shape when attacking.';
        if (possession >= 55) return 'Good possession game. Work on creating more scoring opportunities from your dominance.';
        if (possession >= 45) return 'Balanced match. Focus on quality over quantity - make your possession count in dangerous areas.';
        if (possession >= 35) return 'Consider improving ball retention and pressing strategies to gain more control.';
        return 'Significant improvement needed in possession play. Focus on passing accuracy, movement off the ball, and pressing coordination.';
    };

    const getRating = (possession: number) => {
        if (possession >= 65) return 'Excellent';
        if (possession >= 55) return 'Good';
        if (possession >= 45) return 'Average';
        if (possession >= 35) return 'Below Average';
        return 'Poor';
    };

    const getInsights = (possession: number) => {
        const insights = [];
        if (possession >= 65) {
            insights.push('Exceptional ball control and territorial dominance');
            insights.push('Team likely dictated the tempo and rhythm of the match');
            insights.push('High probability of creating multiple scoring chances');
            insights.push('Opponent forced into reactive, defensive tactics');
        } else if (possession >= 55) {
            insights.push('Strong midfield control and passing game');
            insights.push('Good ability to retain the ball under pressure');
            insights.push('Created favorable attacking opportunities');
            insights.push('Effective pressing and ball recovery');
        } else if (possession >= 45) {
            insights.push('Evenly contested midfield battle');
            insights.push('Both teams had periods of control');
            insights.push('Tactical flexibility may be key to success');
            insights.push('Counter-attacking opportunities for both sides');
        } else if (possession >= 35) {
            insights.push('Defensive approach or opponent dominance');
            insights.push('Reliance on counter-attacks and set pieces');
            insights.push('Midfield struggled to establish control');
            insights.push('Passing accuracy and retention need improvement');
        } else {
            insights.push('Significant territorial disadvantage');
            insights.push('Team under constant defensive pressure');
            insights.push('Limited attacking opportunities created');
            insights.push('Fundamental tactical and technical issues evident');
        }
        return insights;
    };

    const getRiskFactors = (possession: number) => {
        const risks = [];
        if (possession >= 65) {
            risks.push('High possession doesn\'t guarantee goals - conversion efficiency is critical');
            risks.push('Vulnerable to counter-attacks if caught over-committed');
            risks.push('Player fatigue from constant attacking movement');
            risks.push('Frustration if dominance doesn\'t translate to scoreboard');
        } else if (possession >= 55) {
            risks.push('Need to maintain defensive discipline despite attacking dominance');
            risks.push('Opponent may exploit spaces left by attacking players');
            risks.push('Possession without penetration can be ineffective');
        } else if (possession >= 45) {
            risks.push('Game can swing either way - mental strength crucial');
            risks.push('Set pieces and individual moments may decide outcome');
            risks.push('Tactical adjustments critical for gaining advantage');
        } else if (possession >= 35) {
            risks.push('Extended defensive periods increase error likelihood');
            risks.push('Player fatigue from constant defending');
            risks.push('Limited attacking rhythm and confidence');
            risks.push('Difficulty building attacks from deep positions');
        } else {
            risks.push('Severe defensive pressure increases conceding risk');
            risks.push('Team morale and confidence likely affected');
            risks.push('Physical and mental exhaustion from defending');
            risks.push('Minimal attacking threat reduces opponent\'s defensive concerns');
        }
        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const possession = calculate(values);
        if (possession !== null && possession >= 0 && possession <= 100) {
            const opponentPossession = 100 - possession;
            setResult({
                possessionPercentage: possession,
                opponentPossession: opponentPossession,
                interpretation: interpret(possession),
                performanceLevel: getPerformanceLevel(possession),
                recommendation: getRecommendation(possession),
                rating: getRating(possession),
                insights: getInsights(possession),
                riskFactors: getRiskFactors(possession)
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Possession Data</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter possession time in minutes to calculate your team's possession percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="teamPossessionTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Your Team's Possession Time (minutes)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 54.5"
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
                                    name="totalMatchTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Timer className="h-4 w-4" />
                                                Total Match Time (minutes)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 90"
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
                                Calculate Possession Percentage
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
                                <BarChart3 className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Possession Analysis</h2>
                                    <p className="text-muted-foreground">Match Control Breakdown</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary">
                                    <p className="text-sm text-muted-foreground mb-2">Your Team</p>
                                    <p className="text-5xl font-bold text-primary">{result.possessionPercentage.toFixed(1)}%</p>
                                    <p className="text-lg text-muted-foreground mt-2">Possession</p>
                                </div>
                                <div className="text-center p-6 bg-muted/50 rounded-lg border-2 border-muted">
                                    <p className="text-sm text-muted-foreground mb-2">Opponent</p>
                                    <p className="text-5xl font-bold text-muted-foreground">{result.opponentPossession.toFixed(1)}%</p>
                                    <p className="text-lg text-muted-foreground mt-2">Possession</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Control Level</p>
                                    <Badge variant={result.performanceLevel === 'Dominant' ? 'default' : result.performanceLevel === 'Strong' ? 'secondary' : result.performanceLevel === 'Balanced' ? 'outline' : 'destructive'}>
                                        {result.performanceLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Overall Rating</p>
                                    <Badge variant={result.rating === 'Excellent' ? 'default' : result.rating === 'Good' ? 'secondary' : result.rating === 'Average' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Possession Ratio</p>
                                    <p className="text-lg font-bold">{result.possessionPercentage.toFixed(0)}:{result.opponentPossession.toFixed(0)}</p>
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

                    {/* Smart Insights & Risk Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <Target className="h-6 w-6" />
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from possession analysis</CardDescription>
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
                                <CardDescription>Important considerations and potential pitfalls</CardDescription>
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
