'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    currentValue: z.number({ invalid_type_error: 'Enter current value' }).min(0),
    originalPrice: z.number({ invalid_type_error: 'Enter original price' }).min(0),
    yearsSinceRelease: z.number({ invalid_type_error: 'Enter years since release' }).min(0),
    rarityTier: z.enum(['limited', 'limited-u', 'rare', 'epic', 'legendary']),
    historicalGrowthRate: z.number({ invalid_type_error: 'Enter historical growth rate' }).min(-100).max(1000),
    predictionPeriod: z.number({ invalid_type_error: 'Enter prediction period' }).min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    currentValue: number;
    originalPrice: number;
    yearsSinceRelease: number;
    rarityTier: string;
    historicalGrowthRate: number;
    predictionPeriod: number;
    totalAppreciation: number;
    annualGrowthRate: number;
    predictedValue: number;
    predictedAppreciation: number;
    confidenceLevel: number;
    status: 'declining' | 'stable' | 'moderate-growth' | 'strong-growth' | 'exceptional-growth';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
    projections: {
        month3: number;
        month6: number;
        year1: number;
        year2: number;
        year5: number;
    };
};

const rarityMultipliers: Record<string, number> = {
    limited: 1.0,
    'limited-u': 0.8,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
};

const calculateResult = (values: FormValues): ResultPayload => {
    const currentValue = values.currentValue;
    const originalPrice = values.originalPrice;
    const yearsSinceRelease = values.yearsSinceRelease;
    const rarityTier = values.rarityTier;
    const historicalGrowthRate = values.historicalGrowthRate; // percentage
    const predictionPeriod = values.predictionPeriod; // years

    // Calculate total appreciation from original to current
    const totalAppreciation = originalPrice > 0 ? ((currentValue / originalPrice) - 1) * 100 : 0;

    // Calculate annual growth rate from historical data
    const annualGrowthRate = yearsSinceRelease > 0
        ? ((Math.pow(currentValue / originalPrice, 1 / yearsSinceRelease)) - 1) * 100
        : historicalGrowthRate;

    // Use provided historical growth rate or calculated annual growth rate
    const effectiveGrowthRate = historicalGrowthRate !== 0 ? historicalGrowthRate : annualGrowthRate;

    // Adjust growth rate based on rarity (rarer items may have different growth patterns)
    const rarityMultiplier = rarityMultipliers[rarityTier] || 1.0;
    const adjustedGrowthRate = effectiveGrowthRate * rarityMultiplier;

    // Predicted value using compound growth
    // Formula: Predicted Value = Current Value × (1 + Growth Rate / 100)^Prediction Period
    const predictedValue = currentValue * Math.pow(1 + adjustedGrowthRate / 100, predictionPeriod);

    // Predicted appreciation
    const predictedAppreciation = ((predictedValue / currentValue) - 1) * 100;

    // Confidence level based on years of data and rarity
    // More years of data = higher confidence, rarer items = slightly lower confidence (more volatile)
    let confidenceLevel = Math.min(100, 50 + (yearsSinceRelease * 5));
    if (rarityTier === 'legendary' || rarityTier === 'epic') {
        confidenceLevel *= 0.9; // Slightly lower confidence for very rare items (more volatile)
    }
    confidenceLevel = Math.max(30, Math.min(95, confidenceLevel));

    // Projections for different time periods
    const projections = {
        month3: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 0.25),
        month6: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 0.5),
        year1: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 1),
        year2: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 2),
        year5: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 5),
    };

    let status: ResultPayload['status'] = 'stable';
    let interpretation = 'Your limited item resale prediction has been calculated based on current value, historical growth, and rarity tier.';

    if (adjustedGrowthRate < -10) {
        status = 'declining';
        interpretation = `Declining value. The item is predicted to decrease in value with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). The item may be losing popularity or market conditions are unfavorable.`;
    } else if (adjustedGrowthRate < 5) {
        status = 'stable';
        interpretation = `Stable value. The item is predicted to maintain relatively stable value with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). The item maintains steady appreciation.`;
    } else if (adjustedGrowthRate < 20) {
        status = 'moderate-growth';
        interpretation = `Moderate growth. The item is predicted to appreciate with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This is solid growth for a limited item.`;
    } else if (adjustedGrowthRate < 50) {
        status = 'strong-growth';
        interpretation = `Strong growth! The item is predicted to appreciate significantly with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This is excellent growth potential.`;
    } else {
        status = 'exceptional-growth';
        interpretation = `Exceptional growth! The item is predicted to appreciate dramatically with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This represents exceptional growth potential, though such high rates may not be sustainable long-term.`;
    }

    const recommendations = [
        `Current Value: ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. This is the item's current market value.`,
        `Total Appreciation: ${totalAppreciation >= 0 ? '+' : ''}${totalAppreciation.toFixed(1)}% from original price of ${originalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${totalAppreciation > 100 ? 'Exceptional appreciation!' : totalAppreciation > 50 ? 'Strong appreciation.' : totalAppreciation > 0 ? 'Positive appreciation.' : 'Negative appreciation - value has declined.'}`,
        `Annual Growth Rate: ${annualGrowthRate >= 0 ? '+' : ''}${annualGrowthRate.toFixed(1)}% per year. ${annualGrowthRate > 30 ? 'Very high growth rate!' : annualGrowthRate > 15 ? 'Strong growth rate.' : annualGrowthRate > 5 ? 'Moderate growth rate.' : annualGrowthRate > 0 ? 'Slow growth rate.' : 'Declining value.'}`,
        `Adjusted Growth Rate: ${adjustedGrowthRate >= 0 ? '+' : ''}${adjustedGrowthRate.toFixed(1)}% per year (adjusted for ${rarityTier} rarity). ${rarityTier === 'legendary' || rarityTier === 'epic' ? 'Rare items may have higher volatility.' : 'Standard rarity tier.'}`,
        `Predicted Value (${predictionPeriod} years): ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${predictedValue > currentValue ? 'Predicted appreciation!' : 'Predicted depreciation.'}`,
        `Predicted Appreciation: ${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% over ${predictionPeriod} years. ${predictedAppreciation > 50 ? 'Excellent predicted growth!' : predictedAppreciation > 20 ? 'Good predicted growth.' : predictedAppreciation > 0 ? 'Moderate predicted growth.' : 'Predicted decline.'}`,
        `Confidence Level: ${confidenceLevel.toFixed(0)}%. ${confidenceLevel > 80 ? 'High confidence - predictions are more reliable.' : confidenceLevel > 60 ? 'Moderate confidence - predictions are reasonably reliable.' : 'Lower confidence - predictions have higher uncertainty.'}`,
    ];

    if (adjustedGrowthRate < 0) {
        recommendations.push('Declining value detected. Consider: monitoring market conditions for recovery signs, evaluating if the decline is temporary or long-term, and considering selling if further decline is expected.');
    } else if (adjustedGrowthRate > 50) {
        recommendations.push('Exceptional growth rate detected. Be cautious - such high rates may not be sustainable long-term. Monitor for signs of market saturation or bubble conditions. Consider taking profits if growth seems unsustainable.');
    } else {
        recommendations.push('Positive growth predicted. Monitor market conditions, game updates, and community trends. Consider holding for long-term appreciation or selling if you need liquidity. Track actual performance vs. predictions to refine estimates.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Evaluate prediction: current value ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux, predicted value in ${predictionPeriod} years: ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). Confidence: ${confidenceLevel.toFixed(0)}%.`
        },
        {
            label: 'This Month',
            detail: 'Monitor actual value changes and compare to predictions. Track market conditions, game updates, and community trends that may affect value. Adjust predictions if growth rates change significantly.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously track limited item performance: compare actual values to predictions, monitor market trends and game updates, assess whether growth rates are sustainable, and use this calculator to refine predictions based on new data. Remember that predictions are estimates, not guarantees.'
        },
    ];

    return {
        currentValue,
        originalPrice,
        yearsSinceRelease,
        rarityTier,
        historicalGrowthRate,
        predictionPeriod,
        totalAppreciation,
        annualGrowthRate,
        predictedValue,
        predictedAppreciation,
        confidenceLevel,
        status,
        interpretation,
        recommendations,
        plan,
        projections,
    };
};

export default function RobloxLimitedItemResalePredictorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentValue: undefined,
            originalPrice: undefined,
            yearsSinceRelease: undefined,
            rarityTier: undefined,
            historicalGrowthRate: undefined,
            predictionPeriod: undefined,
        },
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Input your limited item information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => {
                            try {
                                setResult(calculateResult(values));
                            } catch (error) {
                                console.error('Error calculating result:', error);
                                alert('An error occurred while calculating. Please check the console for details.');
                            }
                        }, (errors) => {
                            console.log('Form validation errors:', errors);
                        })} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="currentValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="originalPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Original Price (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearsSinceRelease"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Years Since Release</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rarityTier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rarity Tier</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || undefined)}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select rarity</option>
                                                    <option value="limited">Limited</option>
                                                    <option value="limited-u">Limited U</option>
                                                    <option value="rare">Rare</option>
                                                    <option value="epic">Epic</option>
                                                    <option value="legendary">Legendary</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="historicalGrowthRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Historical Growth Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 25 (auto-calculated if 0)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="predictionPeriod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prediction Period (years)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Predict Resale Value
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Interactive results
                        </CardTitle>
                        <CardDescription>See predicted value, growth projections, confidence levels, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Predicted Value</p>
                                <p className="text-2xl font-semibold text-primary">{result.predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">In {result.predictionPeriod} years</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Predicted Appreciation</p>
                                <p className={`text-2xl font-semibold ${result.predictedAppreciation >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.predictedAppreciation >= 0 ? '+' : ''}{result.predictedAppreciation.toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Over {result.predictionPeriod} years</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Annual Growth Rate</p>
                                <p className={`text-2xl font-semibold ${result.annualGrowthRate >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.annualGrowthRate >= 0 ? '+' : ''}{result.annualGrowthRate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Per year</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">3 Month Projection</p>
                                <p className="text-xl font-semibold text-primary">
                                    {result.projections.month3.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">6 Month Projection</p>
                                <p className="text-xl font-semibold text-primary">
                                    {result.projections.month6.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">1 Year Projection</p>
                                <p className="text-xl font-semibold text-primary">
                                    {result.projections.year1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">2 Year Projection</p>
                                <p className="text-xl font-semibold text-primary">
                                    {result.projections.year2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">5 Year Projection</p>
                                <p className="text-xl font-semibold text-primary">
                                    {result.projections.year5.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                        {result.recommendations.map((rec, idx) => (
                                            <li key={idx}>{rec}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Action plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        {result.plan.map((step) => (
                                            <li key={step.label}>
                                                <span className="font-semibold">{step.label}:</span> {step.detail}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
