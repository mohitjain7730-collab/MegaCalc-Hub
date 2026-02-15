'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Calculator, BarChart3, ArrowRight, Share2, Info, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    passType: z.enum(['through-ball', 'cross', 'cutback', 'simple-pass', 'long-ball', 'set-piece']),
    passOrigin: z.enum(['defensive-half', 'middle-third', 'final-third', 'wing', 'half-space']),
    passDestination: z.enum(['six-yard', 'penalty-area', 'outside-box', 'behind-defense']),
    pressureLevel: z.enum(['none', 'low', 'medium', 'high']),
    receiverPosition: z.enum(['clear', 'marked', 'moving', 'static']),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballExpectedAssistsCalculatorInteractive() {
    const [result, setResult] = useState<{
        xAValue: number;
        assistProbability: number;
        qualityRating: string;
        interpretation: string;
        recommendation: string;
        insights: string[];
        riskFactors: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            passType: undefined,
            passOrigin: undefined,
            passDestination: undefined,
            pressureLevel: undefined,
            receiverPosition: undefined,
        },
    });

    const calculatexA = (values: FormValues) => {
        let xA = 0.05; // Base xA

        // Pass Type Multipliers
        const typeMultipliers: Record<string, number> = {
            'through-ball': 0.35,
            'cutback': 0.30,
            'cross': 0.15,
            'set-piece': 0.12,
            'long-ball': 0.08,
            'simple-pass': 0.05
        };
        xA = typeMultipliers[values.passType] || 0.05;

        // Origin Logic (weights based on difficulty/value added)
        const originModifiers: Record<string, number> = {
            'final-third': 1.2,
            'half-space': 1.3,
            'wing': 0.9,
            'middle-third': 0.6,
            'defensive-half': 0.2
        };
        xA *= originModifiers[values.passOrigin] || 1.0;

        // Destination impacts probability significantly
        const destModifiers: Record<string, number> = {
            'six-yard': 1.8,
            'behind-defense': 1.5,
            'penalty-area': 1.0,
            'outside-box': 0.3
        };
        xA *= destModifiers[values.passDestination] || 1.0;

        // Pressure reduces probability
        const pressureModifiers: Record<string, number> = {
            'none': 1.4,
            'low': 1.1,
            'medium': 0.8,
            'high': 0.5
        };
        xA *= pressureModifiers[values.pressureLevel] || 1.0;

        // Receiver context
        const receiverModifiers: Record<string, number> = {
            'clear': 1.3,
            'moving': 1.1,
            'static': 0.8,
            'marked': 0.5
        };
        xA *= receiverModifiers[values.receiverPosition] || 1.0;

        // Cap reasonable xA (rare to exceed 0.80 per single pass unless it's an open goal square)
        return Math.min(xA, 0.95);
    };

    const getQualityRating = (xA: number) => {
        if (xA >= 0.50) return 'World Class';
        if (xA >= 0.30) return 'Excellent';
        if (xA >= 0.15) return 'Good';
        if (xA >= 0.05) return 'Average';
        return 'Low';
    };

    const getInterpretation = (xA: number) => {
        if (xA >= 0.50) return 'An exceptional pass that puts a teammate in a prime scoring position. Should result in a goal frequently.';
        if (xA >= 0.30) return 'A high-quality creative pass that breaks lines or finds space in dangerous areas.';
        if (xA >= 0.15) return 'A solid opportunity creation. Relies on the striker to do some work to finish.';
        if (xA >= 0.05) return 'Routine distribution or a speculative ball. Low probability of becoming an immediate assist.';
        return 'Unlikely to lead directly to a goal. More of a build-up play or safe possession pass.';
    };

    const getRecommendation = (xA: number) => {
        if (xA >= 0.50) return 'Primary Playmaker: Look to replicate this movement pattern. It is generating elite chances.';
        if (xA >= 0.30) return 'Effective Creator: Continue feeding this area. The delivery quality is threatening.';
        if (xA >= 0.15) return 'Solid Contribution: Mix these passes with higher risk/reward through balls when possible.';
        if (xA >= 0.05) return 'Possession Focus: Effective for retaining ball control, but look for more penetrating options.';
        return 'Recycle Possession: If the lane isn\'t there, keep the ball moving rather than forcing low-value passes.';
    };

    const getInsights = (xA: number, values: FormValues) => {
        const insights = [];
        if (xA >= 0.40) {
            insights.push('Kevin De Bruyne level chance creation');
            insights.push('Pass effectively eliminates the defensive line');
            insights.push('Striker has significant advantage over goalkeeper');
            insights.push('High value even if the shot is missed');
        } else if (xA >= 0.20) {
            insights.push('Strong creative metric for a single action');
            insights.push('Typical of top-tier playmakers (e.g., Odegaard, Fernandes)');
            insights.push('Good decision making in the final third');
            insights.push('Sustainable source of chance creation');
        } else if (xA >= 0.10) {
            insights.push('Standard chance creation value');
            insights.push('Requires volume to translate into consistent assists');
            insights.push('Relies heavily on striker\'s individual brilliance');
            insights.push('Safe, productive play');
        } else {
            insights.push('Low probability of direct assist');
            insights.push('May be part of early build-up phase');
            insights.push('Considered a "pre-assist" or preparatory pass');
        }

        if (values.passType === 'through-ball') insights.push('Through balls historically generate the highest xA per pass');
        if (values.passOrigin === 'half-space') insights.push('The "Half-Space" is statistically the most dangerous creation zone');

        return insights.slice(0, 4);
    };

    const getRiskFactors = (xA: number, values: FormValues) => {
        const risks = [];
        if (values.pressureLevel === 'high') risks.push('High defensive pressure significantly reduces pass completion rate');
        if (values.passType === 'cross' && values.passDestination === 'six-yard') risks.push('Crosses into six-yard box are high value but often intercepted by keepers');
        if (values.passType === 'long-ball') risks.push('Long balls have lower completion rates (~40-50%) compared to short passes');
        if (values.receiverPosition === 'marked') risks.push('Marked receiver may struggle to control ball even if pass arrives');

        if (xA < 0.10) {
            risks.push('Low xA passes rarely lead to goals directly');
            risks.push('Forcing passes from poor areas often results in turnover');
        } else if (xA > 0.6) {
            risks.push(' Extremely high xA implies a defensive error occurred');
        }

        return risks.slice(0, 4);
    };

    const onSubmit = (values: FormValues) => {
        const xA = calculatexA(values);

        setResult({
            xAValue: xA,
            assistProbability: xA * 100,
            qualityRating: getQualityRating(xA),
            interpretation: getInterpretation(xA),
            recommendation: getRecommendation(xA),
            insights: getInsights(xA, values),
            riskFactors: getRiskFactors(xA, values)
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Pass Characteristics</h2>
                    </CardTitle>
                    <CardDescription>
                        Analyze the quality of the pass to determine Expected Assists (xA)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="passType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pass Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="through-ball">Through Ball (Split defense)</SelectItem>
                                                    <SelectItem value="cutback">Cutback (from byline)</SelectItem>
                                                    <SelectItem value="cross">Cross (High/Low from wide)</SelectItem>
                                                    <SelectItem value="set-piece">Set Piece (Corner/Free Kick)</SelectItem>
                                                    <SelectItem value="simple-pass">Simple Pass / Lay-off</SelectItem>
                                                    <SelectItem value="long-ball">Long Ball / Switch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>The technique used to deliver the ball.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passOrigin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pass Origin</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Where was pass made from?" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="final-third">Final Third (Central)</SelectItem>
                                                    <SelectItem value="half-space">Half Space (Inside Channel)</SelectItem>
                                                    <SelectItem value="wing">Wing / Flank</SelectItem>
                                                    <SelectItem value="middle-third">Middle Third</SelectItem>
                                                    <SelectItem value="defensive-half">Defensive Half</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Zone on the pitch where the passer was located.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passDestination"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pass Destination</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Where did the ball go?" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="six-yard">Six-Yard Box</SelectItem>
                                                    <SelectItem value="penalty-area">Penalty Area</SelectItem>
                                                    <SelectItem value="behind-defense">Behind Defense (Open Run)</SelectItem>
                                                    <SelectItem value="outside-box">Outside Box</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Target area where teammate received the ball.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="receiverPosition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Receiver Context</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="State of the receiver" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="clear">Clear (Unmarked, open net)</SelectItem>
                                                    <SelectItem value="moving">Running into space</SelectItem>
                                                    <SelectItem value="static">Static / Standing still</SelectItem>
                                                    <SelectItem value="marked">Tightly Marked</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>How much freedom did the receiver have?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pressureLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pressure on Passer</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Defensive pressure" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Free to aim)</SelectItem>
                                                    <SelectItem value="low">Low (Jockeying)</SelectItem>
                                                    <SelectItem value="medium">Medium (Closing down)</SelectItem>
                                                    <SelectItem value="high">High (Physical contact)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Difficulty for the passer to execute.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Expected Assists (xA)
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Activity className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Expected Assists (xA) Analysis</h2>
                                    <p className="text-muted-foreground">Creativity & Playmaking Quality</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary">
                                <p className="text-sm text-muted-foreground mb-2">Expected Assists (xA)</p>
                                <p className="text-6xl font-bold text-primary">{result.xAValue.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-3">
                                    {result.assistProbability.toFixed(1)}% Probability of Assist
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Share2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Pass Quality</p>
                                    <Badge variant={result.qualityRating === 'World Class' ? 'default' : result.qualityRating === 'Excellent' ? 'default' : result.qualityRating === 'Good' ? 'secondary' : 'outline'}>
                                        {result.qualityRating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Success Probability</p>
                                    <p className="text-lg font-bold">{result.assistProbability.toFixed(0)}%</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Creation Zone</p>
                                    <p className="text-sm font-medium uppercase">{form.getValues('passOrigin')?.replace('-', ' ')}</p>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Tactical Recommendation:</strong> {result.recommendation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <CheckCircle2 className="h-6 w-6" />
                                    Smart Insights
                                </CardTitle>
                                <CardDescription>Key takeaways from xA model</CardDescription>
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
                                <CardDescription>Challenges affecting this pass</CardDescription>
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
