'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calculator, DollarSign, BarChart3, Shield, TrendingUp, AlertCircle, CheckCircle2, Landmark, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    currentAssets: z.number().positive(),
    currentLiabilities: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrentRatioCalculatorInteractive() {
    const [result, setResult] = useState<{
        ratio: number;
        interpretation: string;
        liquidityLevel: string;
        recommendation: string;
        strength: string;
        insights: string[];
        considerations: string[];
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentAssets: undefined,
            currentLiabilities: undefined,
        },
    });

    const calculate = (v: FormValues) => {
        if (v.currentAssets == null || v.currentLiabilities == null) return null;
        return v.currentAssets / v.currentLiabilities;
    };

    const interpret = (ratio: number) => {
        if (ratio >= 3) return 'Very high liquidity with excellent short-term financial strength.';
        if (ratio >= 2) return 'Good liquidity position with comfortable short-term coverage.';
        if (ratio >= 1.5) return 'Adequate liquidity but monitor cash flow management.';
        if (ratio >= 1) return 'Marginal liquidity - potential short-term cash flow issues.';
        return 'Insufficient liquidity - immediate financial distress risk.';
    };

    const getLiquidityLevel = (ratio: number) => {
        if (ratio >= 3) return 'Very High';
        if (ratio >= 2) return 'High';
        if (ratio >= 1.5) return 'Moderate';
        if (ratio >= 1) return 'Low';
        return 'Very Low';
    };

    const getRecommendation = (ratio: number) => {
        if (ratio >= 3) return 'Consider optimizing working capital efficiency and investing excess liquidity.';
        if (ratio >= 2) return 'Maintain current liquidity levels and monitor cash flow trends.';
        if (ratio >= 1.5) return 'Focus on improving cash management and reducing current liabilities.';
        if (ratio >= 1) return 'Urgent need to improve liquidity through better cash flow management.';
        return 'Critical liquidity crisis - immediate action required to avoid default.';
    };

    const getStrength = (ratio: number) => {
        if (ratio >= 3) return 'Very Strong';
        if (ratio >= 2) return 'Strong';
        if (ratio >= 1.5) return 'Moderate';
        if (ratio >= 1) return 'Weak';
        return 'Very Weak';
    };

    const getInsights = (ratio: number) => {
        const insights = [];
        if (ratio >= 3) {
            insights.push('Excellent short-term financial flexibility');
            insights.push('Low risk of liquidity problems');
            insights.push('Strong position for growth opportunities');
        } else if (ratio >= 2) {
            insights.push('Healthy liquidity management');
            insights.push('Good financial stability');
            insights.push('Comfortable working capital position');
        } else if (ratio >= 1.5) {
            insights.push('Adequate but not optimal liquidity');
            insights.push('Monitor cash conversion cycles');
            insights.push('Consider working capital optimization');
        } else if (ratio >= 1) {
            insights.push('Marginal liquidity position');
            insights.push('High sensitivity to cash flow timing');
            insights.push('Urgent need for liquidity improvement');
        } else {
            insights.push('Insufficient assets to cover liabilities');
            insights.push('Immediate liquidity crisis');
            insights.push('Critical financial distress situation');
        }
        return insights;
    };

    const getConsiderations = (ratio: number) => {
        const considerations = [];
        considerations.push('Industry benchmarks vary significantly');
        considerations.push('Seasonal businesses may have fluctuating ratios');
        considerations.push('Inventory quality affects liquidity assessment');
        considerations.push('Compare with historical performance');
        considerations.push('Consider cash flow timing differences');
        return considerations;
    };

    const onSubmit = (values: FormValues) => {
        const ratio = calculate(values);
        if (ratio !== null) {
            setResult({
                ratio,
                interpretation: interpret(ratio),
                liquidityLevel: getLiquidityLevel(ratio),
                recommendation: getRecommendation(ratio),
                strength: getStrength(ratio),
                insights: getInsights(ratio),
                considerations: getConsiderations(ratio)
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
                        Financial Parameters
                    </CardTitle>
                    <CardDescription>
                        Enter your company's current assets and liabilities to calculate the Current Ratio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="currentAssets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Total Current Assets ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="e.g., 1000000"
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
                                    name="currentLiabilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Total Current Liabilities ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="e.g., 500000"
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
                                Calculate Current Ratio
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Main Result Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Landmark className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Current Ratio</CardTitle>
                                    <CardDescription>Short-term Liquidity Analysis</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-primary">{result.ratio.toFixed(2)}</p>
                                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold">Liquidity Level</p>
                                    <Badge variant={result.liquidityLevel === 'Very High' ? 'default' : result.liquidityLevel === 'High' ? 'secondary' : result.liquidityLevel === 'Moderate' ? 'outline' : 'destructive'}>
                                        {result.liquidityLevel}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="font-semibold">Financial Strength</p>
                                    <Badge variant={result.strength === 'Very Strong' ? 'default' : result.strength === 'Strong' ? 'secondary' : result.strength === 'Moderate' ? 'outline' : 'destructive'}>
                                        {result.strength}
                                    </Badge>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold">Asset Coverage</p>
                                    <p className="text-lg font-bold">{result.ratio.toFixed(1)}x</p>
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
                                    Strategic Insights
                                </CardTitle>
                                <CardDescription>Liquidity optimization opportunities</CardDescription>
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
                                    Risk Assessment
                                </CardTitle>
                                <CardDescription>Critical factors to monitor</CardDescription>
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
