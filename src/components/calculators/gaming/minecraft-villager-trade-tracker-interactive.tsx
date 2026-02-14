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
    tradeCost: z.number({ invalid_type_error: 'Enter trade cost' }).min(0),
    itemValue: z.number({ invalid_type_error: 'Enter item value' }).min(0),
    tradeType: z.enum(['buy', 'sell'], { invalid_type_error: 'Select trade type' }),
    tradeFrequency: z.number({ invalid_type_error: 'Enter trade frequency' }).min(1).optional(),
    villagerLevel: z.number({ invalid_type_error: 'Enter villager level' }).min(1).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    tradeCost: number;
    itemValue: number;
    tradeType: string;
    tradeFrequency: number;
    villagerLevel: number;
    emeraldProfit: number;
    profitPerTrade: number;
    profitPerHour: number;
    profitPerDay: number;
    tradeEfficiency: number;
    status: 'loss' | 'break-even' | 'low-profit' | 'moderate-profit' | 'high-profit';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const tradeCost = values.tradeCost;
    const itemValue = values.itemValue;
    const tradeType = values.tradeType;
    const tradeFrequency = values.tradeFrequency ?? 1;
    const villagerLevel = values.villagerLevel ?? 1;

    // Calculate emerald profit based on trade type
    let emeraldProfit = 0;
    if (tradeType === 'buy') {
        // Buying: profit = item value - trade cost (positive if item worth more than cost)
        emeraldProfit = itemValue - tradeCost;
    } else {
        // Selling: profit = trade cost - item value (positive if you receive more than item worth)
        emeraldProfit = tradeCost - itemValue;
    }

    // Profit per trade
    const profitPerTrade = emeraldProfit;

    // Profit per hour
    const profitPerHour = profitPerTrade * tradeFrequency;

    // Profit per day (24 hours)
    const profitPerDay = profitPerHour * 24;

    // Trade efficiency (profit per emerald invested, if buying)
    const tradeEfficiency = tradeType === 'buy' && tradeCost > 0 ? (emeraldProfit / tradeCost) * 100 : tradeType === 'sell' && itemValue > 0 ? (emeraldProfit / itemValue) * 100 : 0;

    let status: ResultPayload['status'] = 'moderate-profit';
    let interpretation = 'Your villager trade profit has been calculated based on trade cost, item value, and trade type.';

    if (emeraldProfit < 0) {
        status = 'loss';
        interpretation = `Trade results in a loss. You lose ${Math.abs(emeraldProfit).toFixed(1)} emeralds per trade. This trade is not profitable - consider alternative trades or renegotiating prices.`;
    } else if (emeraldProfit === 0) {
        status = 'break-even';
        interpretation = `Trade breaks even. No profit or loss per trade. Consider trades with positive profit for emerald generation.`;
    } else if (emeraldProfit < 1) {
        status = 'low-profit';
        interpretation = `Low profit. You gain ${emeraldProfit.toFixed(1)} emeralds per trade. This trade is profitable but may not be optimal. Consider higher-profit trades or increasing trade frequency.`;
    } else if (emeraldProfit < 5) {
        status = 'moderate-profit';
        interpretation = `Moderate profit. You gain ${emeraldProfit.toFixed(1)} emeralds per trade. This is a decent trade with reasonable profit. Good for regular trading.`;
    } else {
        status = 'high-profit';
        interpretation = `High profit! You gain ${emeraldProfit.toFixed(1)} emeralds per trade. This is an excellent trade with strong profit. Prioritize this trade for maximum emerald generation.`;
    }

    const recommendations = [
        `Trade Type: ${tradeType === 'buy' ? 'Buying' : 'Selling'}. ${tradeType === 'buy' ? 'You pay emeralds for items. Profit = Item Value - Trade Cost.' : 'You receive emeralds for items. Profit = Trade Cost - Item Value.'}`,
        `Trade Cost: ${tradeCost} emeralds. ${tradeType === 'buy' ? 'This is what you pay to the villager.' : 'This is what the villager pays you.'}`,
        `Item Value: ${itemValue} emeralds. ${tradeType === 'buy' ? 'This is the value of the item you receive.' : 'This is the value of the item you provide.'}`,
        `Emerald Profit: ${emeraldProfit >= 0 ? '+' : ''}${emeraldProfit.toFixed(1)} emeralds per trade. ${emeraldProfit >= 5 ? 'Excellent profit - prioritize this trade.' : emeraldProfit >= 1 ? 'Good profit - valuable trade.' : emeraldProfit > 0 ? 'Low profit - consider alternatives.' : emeraldProfit === 0 ? 'Break-even - no profit.' : 'Loss - avoid this trade.'}`,
        `Profit Per Hour: ${profitPerHour.toFixed(1)} emeralds/hour (${tradeFrequency} trades/hour). ${profitPerHour >= 100 ? 'Exceptional profit rate - excellent for emerald generation.' : profitPerHour >= 50 ? 'High profit rate - very good for emerald generation.' : profitPerHour >= 20 ? 'Moderate profit rate - decent for emerald generation.' : 'Lower profit rate - consider increasing frequency or finding better trades.'}`,
        `Trade Efficiency: ${tradeEfficiency.toFixed(1)}%. ${tradeEfficiency >= 50 ? 'Excellent efficiency - very profitable trade.' : tradeEfficiency >= 25 ? 'Good efficiency - profitable trade.' : tradeEfficiency >= 10 ? 'Moderate efficiency - some profit.' : tradeEfficiency > 0 ? 'Low efficiency - minimal profit.' : 'No efficiency - trade is not profitable.'}`,
    ];

    if (villagerLevel < 5) {
        recommendations.push(`Villager Level: ${villagerLevel}/5. Level up the villager to unlock better trades and potentially better prices. Master level (5) villagers typically offer the best trades.`);
    }

    if (emeraldProfit < 0) {
        recommendations.push('Trade Optimization: This trade results in a loss. Consider: finding alternative trades with positive profit, leveling up the villager for better prices, or renegotiating trade terms. Avoid unprofitable trades to preserve emeralds.');
    } else if (emeraldProfit < 1) {
        recommendations.push('Trade Optimization: Low profit detected. To increase profit: find trades with higher profit margins, level up villagers for better prices, increase trade frequency for more total profit, or focus on high-value trades.');
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Track trade performance: ${emeraldProfit >= 0 ? '+' : ''}${emeraldProfit.toFixed(1)} emerald profit per trade, ${profitPerHour.toFixed(1)} emeralds/hour. ${emeraldProfit >= 5 ? 'Excellent trade - continue using this trade.' : emeraldProfit >= 1 ? 'Good trade - valuable for emerald generation.' : 'Consider finding better trades for higher profit.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize trading: identify highest-profit trades, level up villagers to unlock better trades, compare multiple trade options, increase trade frequency through automation, and track total emerald profit to identify optimal trading strategies.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize villager trading: track profit per trade for all trades, prioritize high-profit trades, level up villagers for better prices, automate trading for continuous profit, compare different villager professions, and maximize emerald generation through efficient trading.'
        },
    ];

    return {
        tradeCost,
        itemValue,
        tradeType,
        tradeFrequency,
        villagerLevel,
        emeraldProfit,
        profitPerTrade,
        profitPerHour,
        profitPerDay,
        tradeEfficiency,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftVillagerTradeTrackerInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tradeCost: undefined,
            itemValue: undefined,
            tradeType: undefined,
            tradeFrequency: undefined,
            villagerLevel: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Villager Trade Tracker
                    </CardTitle>
                    <CardDescription>Track villager trades and calculate emerald profit per trade based on trade costs, item values, and trade frequency.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your trade information</CardTitle>
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
                                    name="tradeCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade Cost (Emeralds)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="itemValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Value (Emeralds)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tradeType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'buy' | 'sell')}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="">Select trade type</option>
                                                    <option value="buy">Buy (You pay emeralds for items)</option>
                                                    <option value="sell">Sell (You receive emeralds for items)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tradeFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade Frequency (trades per hour, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="villagerLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Villager Level (1-5, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Trade Profit
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
                        <CardDescription>See emerald profit, profit per trade/hour/day, trade efficiency, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Emerald Profit</p>
                                <p className={`text-2xl font-semibold ${result.emeraldProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.emeraldProfit >= 0 ? '+' : ''}{result.emeraldProfit.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground">Emeralds per trade</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Profit Per Hour</p>
                                <p className="text-2xl font-semibold text-primary">{result.profitPerHour.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Emeralds/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Profit Per Day</p>
                                <p className="text-2xl font-semibold text-primary">{result.profitPerDay.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Emeralds/day</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Trade Efficiency</p>
                                <p className="text-xl font-semibold text-primary">{result.tradeEfficiency.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Profit percentage</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Villager Level</p>
                                <p className="text-xl font-semibold text-primary">{result.villagerLevel}/5</p>
                                <p className="text-xs text-muted-foreground">{result.villagerLevel >= 5 ? 'Master level' : 'Level up for better trades'}</p>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Emerald Profit (Buying)</strong> = Item Value - Trade Cost. When buying from villagers, profit is the difference between item value and what you pay. Positive profit means the item is worth more than you paid, making the trade profitable.
                    </p>
                    <p>
                        <strong>Emerald Profit (Selling)</strong> = Trade Cost - Item Value. When selling to villagers, profit is the difference between what you receive and item value. Positive profit means you receive more emeralds than the item is worth, making the trade profitable.
                    </p>
                    <p>
                        <strong>Profit Per Trade</strong> = Emerald Profit. This is the emerald gain or loss per individual trade. Higher profit per trade means better trade value and more efficient emerald generation.
                    </p>
                    <p>
                        <strong>Profit Per Hour</strong> = Profit Per Trade × Trade Frequency. This calculates total emerald profit per hour based on how many trades you can complete. Higher frequency dramatically increases total profit, even with moderate profit per trade.
                    </p>
                    <p>
                        <strong>Profit Per Day</strong> = Profit Per Hour × 24. This calculates total emerald profit over 24 hours. Useful for long-term profit planning and evaluating trade value over extended periods.
                    </p>
                    <p>
                        <strong>Trade Efficiency</strong> = (Emerald Profit / Trade Cost) × 100 (for buying) or (Emerald Profit / Item Value) × 100 (for selling). This shows profit as a percentage of investment. Higher efficiency means better return on investment and more valuable trades.
                    </p>
                    <p>These formulas help you understand trade profitability, calculate profit over time, and optimize trading strategies. Track profit per trade to identify optimal trades, and consider both profit per trade and frequency when evaluating trade value.</p>
                </CardContent>
            </Card>
        </div>
    );
}
