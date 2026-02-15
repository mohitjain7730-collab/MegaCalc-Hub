'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Calculator, BarChart3, Shield, Info, CheckCircle2, Activity, Crosshair, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    shotLocation: z.enum(['box-center', 'box-left', 'box-right', 'six-yard', 'penalty-spot', 'outside-box', 'long-range']),
    shotType: z.enum(['open-play', 'header', 'free-kick', 'penalty', 'volley', 'one-on-one']),
    defenderPressure: z.enum(['none', 'low', 'medium', 'high']),
    assistType: z.enum(['through-ball', 'cross', 'cutback', 'rebound', 'individual', 'set-piece']),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballExpectedGoalsCalculatorInteractive() {
    const [result, setResult] = useState<{
        xGValue: number;
        interpretation: string;
        qualityLevel: string;
        recommendation: string;
        rating: string;
        insights: string[];
        riskFactors: string[];
        conversionProbability: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            shotLocation: undefined,
            shotType: undefined,
            defenderPressure: undefined,
            assistType: undefined,
        },
    });

    const calculateXG = (values: FormValues) => {
        let xG = 0.10; // Base xG value

        // Location factor (most important)
        const locationMultipliers: Record<string, number> = {
            'six-yard': 0.65,
            'penalty-spot': 0.45,
            'box-center': 0.35,
            'box-left': 0.25,
            'box-right': 0.25,
            'outside-box': 0.08,
            'long-range': 0.03,
        };
        xG = locationMultipliers[values.shotLocation] || 0.10;

        // Shot type modifier
        const shotTypeModifiers: Record<string, number> = {
            'penalty': 2.0,
            'one-on-one': 1.8,
            'volley': 0.7,
            'header': 0.6,
            'open-play': 1.0,
            'free-kick': 0.5,
        };
        xG *= shotTypeModifiers[values.shotType] || 1.0;

        // Defender pressure modifier
        const pressureModifiers: Record<string, number> = {
            'none': 1.4,
            'low': 1.1,
            'medium': 0.9,
            'high': 0.6,
        };
        xG *= pressureModifiers[values.defenderPressure] || 1.0;

        // Assist type modifier
        const assistModifiers: Record<string, number> = {
            'through-ball': 1.3,
            'cutback': 1.2,
            'rebound': 1.1,
            'individual': 1.0,
            'cross': 0.8,
            'set-piece': 0.7,
        };
        xG *= assistModifiers[values.assistType] || 1.0;

        // Cap xG at realistic maximum (penalties are ~0.76-0.79)
        return Math.min(xG, 0.85);
    };

    const interpret = (xG: number) => {
        if (xG >= 0.50) return 'Excellent scoring opportunity - this chance should be converted more often than not.';
        if (xG >= 0.30) return 'High-quality chance - a good opportunity that skilled players convert regularly.';
        if (xG >= 0.15) return 'Moderate chance - requires good technique and composure to convert.';
        if (xG >= 0.05) return 'Low-probability chance - difficult opportunity requiring exceptional skill or luck.';
        return 'Very low-quality chance - unlikely to result in a goal under normal circumstances.';
    };

    const getQualityLevel = (xG: number) => {
        if (xG >= 0.50) return 'Excellent';
        if (xG >= 0.30) return 'High Quality';
        if (xG >= 0.15) return 'Moderate';
        if (xG >= 0.05) return 'Low Quality';
        return 'Very Low';
    };

    const getRecommendation = (xG: number) => {
        if (xG >= 0.50) return 'Prime scoring opportunity. Focus on composure and technique. These chances win matches.';
        if (xG >= 0.30) return 'Quality chance. Take your time, pick your spot. Good players convert these regularly.';
        if (xG >= 0.15) return 'Decent opportunity. Requires good execution. Consider passing if a better-positioned teammate is available.';
        if (xG >= 0.05) return 'Difficult chance. May be worth attempting if no better options exist, but consider retaining possession.';
        return 'Very difficult opportunity. Strongly consider alternative options like passing or retaining possession.';
    };

    const getRating = (xG: number) => {
        if (xG >= 0.50) return 'Big Chance';
        if (xG >= 0.30) return 'Clear Chance';
        if (xG >= 0.15) return 'Half-Chance';
        if (xG >= 0.05) return 'Speculative';
        return 'Long Shot';
    };

    const getInsights = (xG: number, values: FormValues) => {
        const insights = [];

        if (xG >= 0.50) {
            insights.push('Elite strikers convert 60-80% of these opportunities');
            insights.push('Missing this chance is considered a significant error');
            insights.push('Creates high pressure on goalkeeper and defenders');
            insights.push('Often results from excellent team build-up or individual skill');
        } else if (xG >= 0.30) {
            insights.push('Professional players convert 30-50% of these chances');
            insights.push('Represents good attacking play and positioning');
            insights.push('Accumulating these chances typically leads to goals');
            insights.push('Quality finishing makes the difference at this level');
        } else if (xG >= 0.15) {
            insights.push('Conversion rate typically 15-30% for these opportunities');
            insights.push('Requires good technique and decision-making');
            insights.push('Volume of these chances matters for goal output');
            insights.push('Defenders still have reasonable chance to prevent goal');
        } else if (xG >= 0.05) {
            insights.push('Low conversion rate (5-15%) even for skilled players');
            insights.push('Often taken out of necessity rather than quality');
            insights.push('Can be valuable for creating rebounds or set pieces');
            insights.push('Goalkeeper heavily favored in these situations');
        } else {
            insights.push('Extremely low conversion probability (<5%)');
            insights.push('Usually better to retain possession or pass');
            insights.push('Occasionally produces spectacular goals but rarely');
            insights.push('Goalkeeper has overwhelming advantage');
        }

        // Add context-specific insights
        if (values.shotType === 'penalty') {
            insights.push('Penalties have ~76% conversion rate in professional football');
        }
        if (values.shotType === 'one-on-one') {
            insights.push('One-on-one situations test composure and finishing ability');
        }
        if (values.defenderPressure === 'none') {
            insights.push('Lack of defensive pressure significantly increases scoring probability');
        }

        return insights.slice(0, 4); // Return top 4 most relevant
    };

    const getRiskFactors = (xG: number, values: FormValues) => {
        const risks = [];

        if (xG >= 0.50) {
            risks.push('High expectation creates pressure - composure is critical');
            risks.push('Missing "big chances" can swing match momentum');
            risks.push('Overconfidence can lead to poor shot selection');
            risks.push('Goalkeeper may anticipate obvious finish');
        } else if (xG >= 0.30) {
            risks.push('Rushing the shot reduces conversion probability');
            risks.push('Defender recovery can quickly reduce chance quality');
            risks.push('Poor first touch can eliminate the opportunity');
            risks.push('Goalkeeper positioning crucial at this range');
        } else if (xG >= 0.15) {
            risks.push('Forcing the shot may waste possession');
            risks.push('Better options (pass to teammate) might exist');
            risks.push('Defender blocks are common from this position');
            risks.push('Requires precise placement to beat goalkeeper');
        } else if (xG >= 0.05) {
            risks.push('Low success rate makes shot selection questionable');
            risks.push('Losing possession in dangerous area aids opponent counter');
            risks.push('Team may have better possession-based options');
            risks.push('Frustration from repeated low-quality attempts');
        } else {
            risks.push('Almost certainly better to pass or retain possession');
            risks.push('Wasting possession from poor shot selection');
            risks.push('Can damage team morale if taken selfishly');
            risks.push('Opponent gains possession in favorable position');
        }

        return risks;
    };

    const onSubmit = (values: FormValues) => {
        const xG = calculateXG(values);
        const conversionProb = xG * 100;

        setResult({
            xGValue: xG,
            conversionProbability: conversionProb,
            interpretation: interpret(xG),
            qualityLevel: getQualityLevel(xG),
            recommendation: getRecommendation(xG),
            rating: getRating(xG),
            insights: getInsights(xG, values),
            riskFactors: getRiskFactors(xG, values)
        });
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crosshair className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Shot Characteristics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter shot details to calculate Expected Goals (xG) value
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="shotLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Shot Location
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="six-yard">Six-Yard Box</SelectItem>
                                                    <SelectItem value="penalty-spot">Penalty Spot</SelectItem>
                                                    <SelectItem value="box-center">Box Center</SelectItem>
                                                    <SelectItem value="box-left">Box Left</SelectItem>
                                                    <SelectItem value="box-right">Box Right</SelectItem>
                                                    <SelectItem value="outside-box">Outside Box</SelectItem>
                                                    <SelectItem value="long-range">Long Range (25+ yards)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Where was the shot taken from?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shotType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Shot Type
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select shot type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="penalty">Penalty</SelectItem>
                                                    <SelectItem value="one-on-one">One-on-One</SelectItem>
                                                    <SelectItem value="open-play">Open Play</SelectItem>
                                                    <SelectItem value="volley">Volley</SelectItem>
                                                    <SelectItem value="header">Header</SelectItem>
                                                    <SelectItem value="free-kick">Free Kick</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>How was the shot taken?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="defenderPressure"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Defender Pressure
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select pressure level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Clear shot)</SelectItem>
                                                    <SelectItem value="low">Low (Distant defender)</SelectItem>
                                                    <SelectItem value="medium">Medium (Nearby defender)</SelectItem>
                                                    <SelectItem value="high">High (Tight marking)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Level of defensive pressure</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="assistType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Assist Type
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select assist type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="through-ball">Through Ball</SelectItem>
                                                    <SelectItem value="cutback">Cutback</SelectItem>
                                                    <SelectItem value="rebound">Rebound</SelectItem>
                                                    <SelectItem value="individual">Individual (No assist)</SelectItem>
                                                    <SelectItem value="cross">Cross</SelectItem>
                                                    <SelectItem value="set-piece">Set Piece</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>How was the chance created?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Expected Goals (xG)
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
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">Expected Goals (xG) Analysis</h2>
                                    <p className="text-muted-foreground">Chance Quality Assessment</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary">
                                <p className="text-sm text-muted-foreground mb-2">Expected Goals (xG)</p>
                                <p className="text-6xl font-bold text-primary">{result.xGValue.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-3">
                                    {result.conversionProbability.toFixed(1)}% Conversion Probability
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Chance Quality</p>
                                    <Badge variant={result.qualityLevel === 'Excellent' ? 'default' : result.qualityLevel === 'High Quality' ? 'secondary' : result.qualityLevel === 'Moderate' ? 'outline' : 'destructive'}>
                                        {result.qualityLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Shot Rating</p>
                                    <Badge variant={result.rating === 'Big Chance' ? 'default' : result.rating === 'Clear Chance' ? 'secondary' : result.rating === 'Half-Chance' ? 'outline' : 'destructive'}>
                                        {result.rating}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Success Rate</p>
                                    <p className="text-lg font-bold">{result.conversionProbability.toFixed(0)}%</p>
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
                                <CardDescription>Key takeaways from xG analysis</CardDescription>
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
                                <CardDescription>Important considerations for this chance</CardDescription>
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
