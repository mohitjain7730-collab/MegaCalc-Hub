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
    originalValue: z.number({ invalid_type_error: 'Enter original value' }).min(0),
    dupeCount: z.number({ invalid_type_error: 'Enter dupe count' }).min(1),
    marketImpact: z.number({ invalid_type_error: 'Enter market impact' }).min(0).max(100),
    rarityTier: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'exclusive']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    originalValue: number;
    dupeCount: number;
    marketImpact: number;
    rarityTier: string;
    dupePenalty: number;
    dupeValue: number;
    valueRetention: number;
    marketStability: number;
    status: 'severely-depreciated' | 'depreciated' | 'moderate' | 'stable' | 'minimal-impact';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const rarityFactors: Record<string, number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 100,
    legendary: 200,
    mythical: 500,
    exclusive: 1000,
};

const calculateResult = (values: FormValues): ResultPayload => {
    const originalValue = values.originalValue;
    const dupeCount = values.dupeCount;
    const marketImpact = values.marketImpact; // percentage
    const rarityTier = values.rarityTier;

    // Base rarity factor provides protection - rarer pets are less affected by small dupe counts
    const baseRarityFactor = rarityFactors[rarityTier] || 10;

    // Dupe penalty calculation
    // Formula: (Dupe Count / (Dupe Count + Base Rarity Factor)) × (Market Impact / 100)
    // This creates a diminishing returns effect - more dupes have less additional impact
    const dupePenalty = (dupeCount / (dupeCount + baseRarityFactor)) * (marketImpact / 100);

    // Dupe value = Original Value × (1 - Dupe Penalty)
    const dupeValue = originalValue * (1 - dupePenalty);

    // Value retention percentage
    const valueRetention = originalValue > 0 ? (dupeValue / originalValue) * 100 : 0;

    // Market stability (inverse of penalty, as percentage)
    const marketStability = (1 - dupePenalty) * 100;

    let status: ResultPayload['status'] = 'moderate';
    let interpretation = 'Your pet dupe value has been calculated based on original value, dupe count, market impact, and rarity tier.';

    if (valueRetention < 30) {
        status = 'severely-depreciated';
        interpretation = `Severely depreciated value. The pet has lost ${(100 - valueRetention).toFixed(1)}% of its original value due to duplication. With ${dupeCount} duplicates and ${marketImpact}% market impact, the pet's value has been significantly reduced. Recovery is unlikely unless most duplicates are removed.`;
    } else if (valueRetention < 50) {
        status = 'depreciated';
        interpretation = `Depreciated value. The pet has lost ${(100 - valueRetention).toFixed(1)}% of its original value. With ${dupeCount} duplicates and ${marketImpact}% market impact, the pet's value has been substantially reduced. Limited recovery possible if duplicates are removed.`;
    } else if (valueRetention < 70) {
        status = 'moderate';
        interpretation = `Moderate value retention. The pet has retained ${valueRetention.toFixed(1)}% of its original value. With ${dupeCount} duplicates and ${marketImpact}% market impact, the pet has experienced moderate depreciation. Some recovery possible.`;
    } else if (valueRetention < 90) {
        status = 'stable';
        interpretation = `Stable value. The pet has retained ${valueRetention.toFixed(1)}% of its original value. With ${dupeCount} duplicates and ${marketImpact}% market impact, the pet has experienced minimal depreciation. Value is relatively stable.`;
    } else {
        status = 'minimal-impact';
        interpretation = `Minimal impact. The pet has retained ${valueRetention.toFixed(1)}% of its original value. With ${dupeCount} duplicates and ${marketImpact}% market impact, duplication has had minimal effect on value. The pet maintains most of its original worth.`;
    }

    const recommendations = [
        `Original Value: ${originalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. This was the pet's value before duplication occurred.`,
        `Dupe Count: ${dupeCount} duplicates exist in the market. ${dupeCount > 100 ? 'Very high dupe count - severe impact on value.' : dupeCount > 50 ? 'High dupe count - significant impact.' : dupeCount > 10 ? 'Moderate dupe count - noticeable impact.' : 'Low dupe count - minimal impact.'}`,
        `Market Impact: ${marketImpact}% impact on market prices. ${marketImpact > 70 ? 'Very high impact - severe price depreciation.' : marketImpact > 40 ? 'High impact - significant price drops.' : marketImpact > 20 ? 'Moderate impact - noticeable price changes.' : 'Low impact - minimal price changes.'}`,
        `Dupe Penalty: ${(dupePenalty * 100).toFixed(1)}% value reduction. This represents how much duplication has reduced the pet's value. Higher penalties mean greater value loss.`,
        `Dupe Value: ${dupeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. This is the estimated current value after accounting for duplication effects.`,
        `Value Retention: ${valueRetention.toFixed(1)}%. ${valueRetention > 70 ? 'Good retention - pet maintains most value.' : valueRetention > 50 ? 'Moderate retention - some value loss.' : 'Poor retention - significant value loss.'}`,
        `Market Stability: ${marketStability.toFixed(1)}%. ${marketStability > 70 ? 'Stable market - value is relatively secure.' : marketStability > 50 ? 'Moderate stability - some volatility.' : 'Unstable market - high volatility and risk.'}`,
    ];

    if (valueRetention < 50) {
        recommendations.push('Severe depreciation detected. Consider: monitoring Roblox updates for duplicate removals, avoiding additional purchases until market stabilizes, and evaluating if recovery is likely based on Roblox response history.');
    } else if (valueRetention < 70) {
        recommendations.push('Moderate depreciation. Monitor market conditions and Roblox updates. Consider holding if you believe duplicates will be removed, or selling if you expect further depreciation.');
    } else {
        recommendations.push('Stable value. Duplication has had minimal impact. Continue monitoring market conditions, but the pet maintains good value retention.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Evaluate dupe impact: original value ${originalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux, current dupe value ${dupeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux, ${valueRetention.toFixed(1)}% retention. Monitor Roblox updates for duplicate removals or patches.`
        },
        {
            label: 'This Month',
            detail: 'Track market conditions and price trends. Monitor dupe count changes - if duplicates are removed, value may recover. If more duplicates appear, value may decline further. Research Roblox response history for similar situations.'
        },
        {
            label: 'Ongoing',
            detail: 'Stay informed about Roblox updates, exploit patches, and market trends. Duplicated pets are high-risk investments - only invest what you can afford to lose. Use this calculator to evaluate dupe impact before making trading decisions.'
        },
    ];

    return {
        originalValue,
        dupeCount,
        marketImpact,
        rarityTier,
        dupePenalty,
        dupeValue,
        valueRetention,
        marketStability,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function RobloxPetDupeValueCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originalValue: undefined,
            dupeCount: undefined,
            marketImpact: undefined,
            rarityTier: undefined,
        },
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Input your pet duplication information</CardTitle>
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
                                    name="originalValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Original Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dupeCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dupe Count</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="marketImpact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Market Impact (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                                                    <option value="common">Common</option>
                                                    <option value="uncommon">Uncommon</option>
                                                    <option value="rare">Rare</option>
                                                    <option value="epic">Epic</option>
                                                    <option value="legendary">Legendary</option>
                                                    <option value="mythical">Mythical</option>
                                                    <option value="exclusive">Exclusive</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Dupe Value
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
                        <CardDescription>See dupe value calculation, value retention, market stability, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Dupe Value</p>
                                <p className="text-2xl font-semibold text-primary">{result.dupeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Value Retention</p>
                                <p className="text-2xl font-semibold text-primary">{result.valueRetention.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Of original value</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Dupe Penalty</p>
                                <p className="text-2xl font-semibold text-primary">{(result.dupePenalty * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Value reduction</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
