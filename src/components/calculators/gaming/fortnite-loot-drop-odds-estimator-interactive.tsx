'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    commonDropRate: z.number({ invalid_type_error: 'Enter common drop rate' }).min(0).max(100),
    uncommonDropRate: z.number({ invalid_type_error: 'Enter uncommon drop rate' }).min(0).max(100),
    rareDropRate: z.number({ invalid_type_error: 'Enter rare drop rate' }).min(0).max(100),
    epicDropRate: z.number({ invalid_type_error: 'Enter epic drop rate' }).min(0).max(100),
    legendaryDropRate: z.number({ invalid_type_error: 'Enter legendary drop rate' }).min(0).max(100),
    numberOfOpens: z.number({ invalid_type_error: 'Enter number of opens' }).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    commonDropRate: number;
    uncommonDropRate: number;
    rareDropRate: number;
    epicDropRate: number;
    legendaryDropRate: number;
    numberOfOpens: number;
    totalDropRate: number;
    expectedCommon: number;
    expectedUncommon: number;
    expectedRare: number;
    expectedEpic: number;
    expectedLegendary: number;
    probabilityAtLeastOneLegendary: number;
    probabilityAtLeastOneEpic: number;
    probabilityAllCommon: number;
    dropDistribution: {
        rarity: string;
        expected: number;
        probability: number;
    }[];
    status: 'low-odds' | 'moderate-odds' | 'good-odds' | 'excellent-odds';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const commonDropRate = values.commonDropRate;
    const uncommonDropRate = values.uncommonDropRate;
    const rareDropRate = values.rareDropRate;
    const epicDropRate = values.epicDropRate;
    const legendaryDropRate = values.legendaryDropRate;
    const numberOfOpens = values.numberOfOpens;

    // Total drop rate (should be close to 100%)
    const totalDropRate = commonDropRate + uncommonDropRate + rareDropRate + epicDropRate + legendaryDropRate;

    // Expected number of drops for each rarity
    const expectedCommon = (commonDropRate / 100) * numberOfOpens;
    const expectedUncommon = (uncommonDropRate / 100) * numberOfOpens;
    const expectedRare = (rareDropRate / 100) * numberOfOpens;
    const expectedEpic = (epicDropRate / 100) * numberOfOpens;
    const expectedLegendary = (legendaryDropRate / 100) * numberOfOpens;

    // Probability of at least one legendary
    const probabilityAtLeastOneLegendary = 1 - Math.pow(1 - legendaryDropRate / 100, numberOfOpens);

    // Probability of at least one epic
    const probabilityAtLeastOneEpic = 1 - Math.pow(1 - epicDropRate / 100, numberOfOpens);

    // Probability all common (no uncommon or higher)
    const probabilityAllCommon = Math.pow(commonDropRate / 100, numberOfOpens);

    // Drop distribution
    const dropDistribution = [
        { rarity: 'Common', expected: expectedCommon, probability: commonDropRate },
        { rarity: 'Uncommon', expected: expectedUncommon, probability: uncommonDropRate },
        { rarity: 'Rare', expected: expectedRare, probability: rareDropRate },
        { rarity: 'Epic', expected: expectedEpic, probability: epicDropRate },
        { rarity: 'Legendary', expected: expectedLegendary, probability: legendaryDropRate },
    ];

    let status: ResultPayload['status'] = 'moderate-odds';
    let interpretation = 'Your loot drop odds have been calculated based on drop rates and number of opens.';

    if (probabilityAtLeastOneLegendary >= 0.8) {
        status = 'excellent-odds';
        interpretation = `Excellent odds! ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Very high probability of rare loot.`;
    } else if (probabilityAtLeastOneLegendary >= 0.5) {
        status = 'good-odds';
        interpretation = `Good odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Reasonable probability of rare loot.`;
    } else if (probabilityAtLeastOneLegendary >= 0.25) {
        status = 'moderate-odds';
        interpretation = `Moderate odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Some probability of rare loot, but may require more opens.`;
    } else {
        status = 'low-odds';
        interpretation = `Lower odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Consider opening more loot sources or using sources with higher drop rates.`;
    }

    const recommendations = [
        `Total Drop Rate: ${totalDropRate.toFixed(1)}%. ${Math.abs(totalDropRate - 100) < 5 ? 'Drop rates are balanced and close to 100%.' : 'Drop rates may not sum to 100% - verify rates are accurate for your loot source.'}`,
        `Expected Drops: Common ${expectedCommon.toFixed(1)}, Uncommon ${expectedUncommon.toFixed(1)}, Rare ${expectedRare.toFixed(1)}, Epic ${expectedEpic.toFixed(1)}, Legendary ${expectedLegendary.toFixed(1)}. ${expectedLegendary >= 1 ? 'Good expected legendary drops - reasonable probability.' : expectedLegendary >= 0.5 ? 'Moderate expected legendary drops - some probability.' : 'Low expected legendary drops - may need more opens.'}`,
        `Probability of At Least One Legendary: ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}%. ${probabilityAtLeastOneLegendary >= 0.8 ? 'Excellent probability - very likely to get legendary.' : probabilityAtLeastOneLegendary >= 0.5 ? 'Good probability - reasonable chance of legendary.' : probabilityAtLeastOneLegendary >= 0.25 ? 'Moderate probability - some chance of legendary.' : 'Lower probability - consider more opens or better drop rates.'}`,
        `Probability of At Least One Epic: ${(probabilityAtLeastOneEpic * 100).toFixed(1)}%. ${probabilityAtLeastOneEpic >= 0.9 ? 'Very high probability of epic items.' : probabilityAtLeastOneEpic >= 0.7 ? 'High probability of epic items.' : 'Moderate to lower probability of epic items.'}`,
        `Probability All Common: ${(probabilityAllCommon * 100).toFixed(2)}%. ${probabilityAllCommon < 0.01 ? 'Very unlikely to get all common items.' : probabilityAllCommon < 0.1 ? 'Unlikely to get all common items.' : 'Possible to get all common items - luck plays a role.'}`,
    ];

    if (expectedLegendary < 0.5) {
        recommendations.push('Low Expected Legendary Drops: Consider opening more loot sources, using sources with higher legendary drop rates (supply drops, special chests), or increasing number of opens to improve legendary probability.');
    }

    if (probabilityAtLeastOneLegendary < 0.5) {
        recommendations.push(`Legendary Probability Optimization: To reach 50%+ probability, you need approximately ${Math.ceil(Math.log(0.5) / Math.log(1 - legendaryDropRate / 100))} opens with ${legendaryDropRate}% drop rate. Consider opening more sources or using better drop rate sources.`);
    }

    const plan = [
        {
            label: 'This Match',
            detail: `Plan loot strategy: ${numberOfOpens} opens expected, ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of legendary. ${probabilityAtLeastOneLegendary >= 0.5 ? 'Good odds - prioritize high-value loot sources.' : 'Moderate to lower odds - open more sources or use better drop rate sources.'}`
        },
        {
            label: 'This Week',
            detail: 'Track loot drop results: compare expected vs actual drops, identify which loot sources have best drop rates, test different loot source types, and optimize loot collection strategies based on drop rate data.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize loot collection: use drop rate data to prioritize loot sources, understand probability vs expected values, track actual drop results, and adapt strategies based on observed drop rates and probabilities.'
        },
    ];

    return {
        commonDropRate,
        uncommonDropRate,
        rareDropRate,
        epicDropRate,
        legendaryDropRate,
        numberOfOpens,
        totalDropRate,
        expectedCommon,
        expectedUncommon,
        expectedRare,
        expectedEpic,
        expectedLegendary,
        probabilityAtLeastOneLegendary,
        probabilityAtLeastOneEpic,
        probabilityAllCommon,
        dropDistribution,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteLootDropOddsEstimatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            commonDropRate: undefined,
            uncommonDropRate: undefined,
            rareDropRate: undefined,
            epicDropRate: undefined,
            legendaryDropRate: undefined,
            numberOfOpens: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your loot drop rates</CardTitle>
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
                                    name="commonDropRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Common (Gray) Drop Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="uncommonDropRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Uncommon (Green) Drop Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rareDropRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rare (Blue) Drop Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="epicDropRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Epic (Purple) Drop Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legendaryDropRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Legendary (Gold) Drop Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numberOfOpens"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Opens</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Drop Odds
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
                        <CardDescription>See expected drops, probabilities, drop distribution, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Expected Legendary</p>
                                <p className="text-2xl font-semibold text-primary">{result.expectedLegendary.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Drops</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Legendary Probability</p>
                                <p className="text-2xl font-semibold text-primary">{(result.probabilityAtLeastOneLegendary * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">At least one</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Epic Probability</p>
                                <p className="text-2xl font-semibold text-primary">{(result.probabilityAtLeastOneEpic * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">At least one</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {result.dropDistribution.map((dist) => (
                                <div key={dist.rarity} className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">{dist.rarity}</p>
                                    <p className="text-xl font-semibold text-primary">{dist.expected.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Expected ({dist.probability.toFixed(1)}%)</p>
                                </div>
                            ))}
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Expected Drops</strong> = (Drop Rate / 100) × Number of Opens. This calculates the average number of drops you can expect for each rarity tier. Expected values represent averages over many trials, not guarantees.
                    </p>
                    <p>
                        <strong>Probability of At Least One</strong> = 1 - (1 - Drop Rate / 100)^Number of Opens. This calculates the probability of getting at least one item of a specific rarity across multiple opens. Higher drop rates and more opens increase probability.
                    </p>
                    <p>
                        <strong>Probability All Common</strong> = (Common Drop Rate / 100)^Number of Opens. This calculates the probability that all opens result in common items only. This probability decreases as number of opens increases.
                    </p>
                    <p>
                        <strong>Total Drop Rate</strong> = Sum of All Rarity Drop Rates. This should be close to 100% for standard loot sources. If total is significantly different from 100%, verify drop rates are accurate for your specific loot source.
                    </p>
                    <p>
                        <strong>Opens Needed for 50% Probability</strong> = log(0.5) / log(1 - Drop Rate / 100). This calculates how many opens are needed to reach 50% probability of getting at least one item of a specific rarity. Useful for planning loot collection.
                    </p>
                    <p>These formulas help you understand drop probabilities, calculate expected values, and plan loot collection strategies. Remember that probabilities represent chances over many trials, and individual results will vary due to randomness.</p>
                </CardContent>
            </Card>
        </div>
    );
}
