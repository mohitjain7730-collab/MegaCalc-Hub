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
    petsValue: z.number({ invalid_type_error: 'Enter pets value' }).min(0),
    limitedItemsValue: z.number({ invalid_type_error: 'Enter limited items value' }).min(0),
    collectiblesValue: z.number({ invalid_type_error: 'Enter collectibles value' }).min(0),
    gamepassesValue: z.number({ invalid_type_error: 'Enter gamepasses value' }).min(0),
    otherItemsValue: z.number({ invalid_type_error: 'Enter other items value' }).min(0),
    depreciationFactor: z.number({ invalid_type_error: 'Enter depreciation factor' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    petsValue: number;
    limitedItemsValue: number;
    collectiblesValue: number;
    gamepassesValue: number;
    otherItemsValue: number;
    depreciationFactor: number;
    grossInventoryValue: number;
    depreciationAmount: number;
    netInventoryValue: number;
    valueByCategory: {
        category: string;
        value: number;
        percentage: number;
    }[];
    status: 'low' | 'moderate' | 'high' | 'very-high';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const petsValue = values.petsValue;
    const limitedItemsValue = values.limitedItemsValue;
    const collectiblesValue = values.collectiblesValue;
    const gamepassesValue = values.gamepassesValue;
    const otherItemsValue = values.otherItemsValue;
    const depreciationFactor = values.depreciationFactor; // percentage

    // Gross inventory value (sum of all categories)
    const grossInventoryValue = petsValue + limitedItemsValue + collectiblesValue + gamepassesValue + otherItemsValue;

    // Depreciation amount
    const depreciationAmount = grossInventoryValue * (depreciationFactor / 100);

    // Net inventory value (after depreciation)
    const netInventoryValue = grossInventoryValue - depreciationAmount;

    // Value breakdown by category
    const valueByCategory = [
        { category: 'Pets', value: petsValue, percentage: grossInventoryValue > 0 ? (petsValue / grossInventoryValue) * 100 : 0 },
        { category: 'Limited Items', value: limitedItemsValue, percentage: grossInventoryValue > 0 ? (limitedItemsValue / grossInventoryValue) * 100 : 0 },
        { category: 'Collectibles', value: collectiblesValue, percentage: grossInventoryValue > 0 ? (collectiblesValue / grossInventoryValue) * 100 : 0 },
        { category: 'Gamepasses', value: gamepassesValue, percentage: grossInventoryValue > 0 ? (gamepassesValue / grossInventoryValue) * 100 : 0 },
        { category: 'Other Items', value: otherItemsValue, percentage: grossInventoryValue > 0 ? (otherItemsValue / grossInventoryValue) * 100 : 0 },
    ].filter(item => item.value > 0); // Only show categories with value

    let status: ResultPayload['status'] = 'moderate';
    let interpretation = 'Your Roblox inventory value has been calculated based on all item categories and depreciation factor.';

    if (netInventoryValue >= 1000000) {
        status = 'very-high';
        interpretation = `Very high inventory value! Your inventory is worth ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux after accounting for ${depreciationFactor}% depreciation. This represents an exceptional collection with significant value.`;
    } else if (netInventoryValue >= 500000) {
        status = 'high';
        interpretation = `High inventory value! Your inventory is worth ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux after accounting for ${depreciationFactor}% depreciation. This is a valuable collection with strong market worth.`;
    } else if (netInventoryValue >= 100000) {
        status = 'moderate';
        interpretation = `Moderate inventory value. Your inventory is worth ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux after accounting for ${depreciationFactor}% depreciation. This represents a decent collection with meaningful value.`;
    } else {
        status = 'low';
        interpretation = `Lower inventory value. Your inventory is worth ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux after accounting for ${depreciationFactor}% depreciation. Consider strategies to grow your inventory value over time.`;
    }

    const recommendations = [
        `Gross Inventory Value: ${grossInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (before depreciation). This is the sum of all item categories.`,
        `Depreciation Amount: ${depreciationAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${depreciationFactor}% of gross value). This accounts for potential value loss due to market volatility. ${depreciationFactor > 20 ? 'High depreciation factor indicates significant volatility risk.' : depreciationFactor > 10 ? 'Moderate depreciation factor accounts for some volatility.' : 'Low depreciation factor assumes relatively stable values.'}`,
        `Net Inventory Value: ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (after depreciation). This is your realistic inventory value accounting for market risk.`,
    ];

    // Add category breakdown recommendations
    valueByCategory.forEach(cat => {
        recommendations.push(`${cat.category}: ${cat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${cat.percentage.toFixed(1)}% of total). ${cat.percentage > 50 ? 'This category dominates your inventory - consider diversifying.' : cat.percentage > 30 ? 'This is a significant portion of your inventory.' : 'This category contributes to your inventory value.'}`);
    });

    if (netInventoryValue < 50000) {
        recommendations.push('Lower inventory value detected. To grow: invest in appreciating items (limited items, rare pets), trade strategically for growth opportunities, hold valuable items as they appreciate, and use calculators to evaluate potential investments.');
    } else if (netInventoryValue >= 500000) {
        recommendations.push('High inventory value! Consider: diversifying across item types to reduce risk, monitoring market trends for optimization opportunities, protecting valuable items, and using calculators to track value changes over time.');
    } else {
        recommendations.push('Moderate to high inventory value. Continue building: monitor market trends, invest in appreciating items, trade strategically, and use calculators to evaluate opportunities and track performance.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Review inventory breakdown: total value ${netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. Largest category: ${valueByCategory.length > 0 ? valueByCategory.reduce((max, cat) => cat.percentage > max.percentage ? cat : max).category : 'N/A'}. Evaluate diversification and growth opportunities.`
        },
        {
            label: 'This Month',
            detail: 'Track inventory value changes. Compare current value to previous estimates. Monitor market trends for your item categories. Identify items that are appreciating or depreciating and adjust strategy accordingly.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously monitor and optimize inventory: update value estimates regularly, track market trends, invest in appreciating items, diversify across categories, and use calculators to evaluate potential investments and track overall performance.'
        },
    ];

    return {
        petsValue,
        limitedItemsValue,
        collectiblesValue,
        gamepassesValue,
        otherItemsValue,
        depreciationFactor,
        grossInventoryValue,
        depreciationAmount,
        netInventoryValue,
        valueByCategory,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function RobloxInventoryValueEstimatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petsValue: undefined,
            limitedItemsValue: undefined,
            collectiblesValue: undefined,
            gamepassesValue: undefined,
            otherItemsValue: undefined,
            depreciationFactor: undefined,
        },
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Input your inventory information</CardTitle>
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
                                    name="petsValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pets Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="limitedItemsValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Limited Items Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="collectiblesValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Collectibles Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 25000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gamepassesValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gamepasses Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 30000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="otherItemsValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Other Items Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 15000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="depreciationFactor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Depreciation Factor (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Estimate Inventory Value
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
                        <CardDescription>See total inventory value, category breakdown, depreciation, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Gross Inventory Value</p>
                                <p className="text-2xl font-semibold text-primary">{result.grossInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux (before depreciation)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Net Inventory Value</p>
                                <p className="text-2xl font-semibold text-primary">{result.netInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux (after depreciation)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Depreciation Amount</p>
                                <p className="text-2xl font-semibold text-primary">{result.depreciationAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux ({result.depreciationFactor}%)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        {result.valueByCategory.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {result.valueByCategory.map((cat) => (
                                    <div key={cat.category} className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">{cat.category}</p>
                                        <p className="text-xl font-semibold text-primary">{cat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}% of total</p>
                                    </div>
                                ))}
                            </div>
                        )}
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
