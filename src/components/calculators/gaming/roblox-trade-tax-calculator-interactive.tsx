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
    tradeValue: z.number({ invalid_type_error: 'Enter trade value' }).min(0),
    platformFee: z.number({ invalid_type_error: 'Enter platform fee' }).min(0).max(100),
    additionalFees: z.number({ invalid_type_error: 'Enter additional fees' }).min(0),
    numberOfItems: z.number({ invalid_type_error: 'Enter number of items' }).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    tradeValue: number;
    platformFee: number;
    additionalFees: number;
    numberOfItems: number;
    platformFeeAmount: number;
    totalFees: number;
    netTradeValue: number;
    feePercentage: number;
    costPerItem: number;
    breakEvenValue: number;
    status: 'low-cost' | 'moderate-cost' | 'high-cost' | 'very-high-cost';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const tradeValue = values.tradeValue;
    const platformFee = values.platformFee; // percentage
    const additionalFees = values.additionalFees;
    const numberOfItems = values.numberOfItems;

    // Platform fee amount
    const platformFeeAmount = tradeValue * (platformFee / 100);

    // Total fees (platform fee + additional fees)
    const totalFees = platformFeeAmount + additionalFees;

    // Net trade value (after all fees)
    const netTradeValue = tradeValue - totalFees;

    // Fee percentage (total fees as percentage of trade value)
    const feePercentage = tradeValue > 0 ? (totalFees / tradeValue) * 100 : 0;

    // Cost per item
    const costPerItem = numberOfItems > 0 ? totalFees / numberOfItems : 0;

    // Break-even value (minimum trade value to cover fees)
    // If platform fee is 0, break-even is just additional fees
    const breakEvenValue = platformFee > 0 ? totalFees / (platformFee / 100) : additionalFees;

    let status: ResultPayload['status'] = 'moderate-cost';
    let interpretation = 'Your trade tax calculation has been completed based on trade value, platform fee, additional fees, and number of items.';

    if (feePercentage < 5) {
        status = 'low-cost';
        interpretation = `Low-cost trade. Total fees are ${feePercentage.toFixed(2)}% of trade value (${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux). This is a cost-effective trade with minimal fees relative to value.`;
    } else if (feePercentage < 10) {
        status = 'moderate-cost';
        interpretation = `Moderate-cost trade. Total fees are ${feePercentage.toFixed(2)}% of trade value (${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux). This is a reasonable fee structure for the trade value.`;
    } else if (feePercentage < 20) {
        status = 'high-cost';
        interpretation = `High-cost trade. Total fees are ${feePercentage.toFixed(2)}% of trade value (${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux). Fees are significant relative to trade value. Consider if the trade is still worthwhile.`;
    } else {
        status = 'very-high-cost';
        interpretation = `Very high-cost trade. Total fees are ${feePercentage.toFixed(2)}% of trade value (${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux). Fees are extremely high relative to trade value. This trade may not be cost-effective.`;
    }

    const recommendations = [
        `Trade Value: ${tradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. This is the gross value before fees.`,
        `Platform Fee: ${platformFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${platformFee}% of trade value). ${platformFee > 10 ? 'High platform fee - consider if trade is still worthwhile.' : platformFee > 5 ? 'Moderate platform fee - standard for Roblox trading.' : 'Low platform fee - cost-effective.'}`,
        `Additional Fees: ${additionalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${additionalFees > 0 ? 'Additional fees increase total costs - evaluate if they\'re necessary.' : 'No additional fees - good cost structure.'}`,
        `Total Fees: ${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${feePercentage.toFixed(2)}% of trade value). ${feePercentage > 15 ? 'Very high fees - trade may not be cost-effective.' : feePercentage > 10 ? 'High fees - evaluate trade carefully.' : feePercentage > 5 ? 'Moderate fees - reasonable for trade value.' : 'Low fees - cost-effective trade.'}`,
        `Net Trade Value: ${netTradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (after all fees). ${netTradeValue > 0 ? 'This is what you\'ll receive after fees.' : 'Fees exceed trade value - this trade results in a loss.'}`,
        `Cost per Item: ${costPerItem.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux per item (${numberOfItems} items). ${costPerItem > tradeValue / numberOfItems * 0.2 ? 'High cost per item - fees are significant.' : 'Reasonable cost per item.'}`,
        `Break-even Value: ${breakEvenValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${tradeValue >= breakEvenValue ? 'Trade value exceeds break-even - you\'ll receive net value after fees.' : 'Trade value below break-even - fees exceed trade value, resulting in a loss.'}`,
    ];

    if (feePercentage > 15) {
        recommendations.push('Very high fees detected. Consider: negotiating better trade values to offset fees, avoiding trades with excessive additional fees, using standard trading options instead of premium services, or evaluating if the trade is still worthwhile despite high fees.');
    } else if (netTradeValue < 0) {
        recommendations.push('Loss detected - fees exceed trade value. This trade is not cost-effective. Negotiate higher trade value, reduce fees, or reconsider the trade entirely.');
    } else {
        recommendations.push('Trade is cost-effective. Account for fees in all trade calculations, negotiate values that account for fees, and use this calculator to evaluate all trades before committing.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Evaluate trade costs: total fees ${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${feePercentage.toFixed(2)}%), net value ${netTradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${netTradeValue > 0 ? 'Trade is profitable after fees.' : 'Fees exceed trade value - reconsider trade.'}`
        },
        {
            label: 'This Month',
            detail: 'Track trading costs across multiple trades. Calculate average fee percentage and total fees paid. Identify opportunities to reduce fees through better trade negotiation or avoiding high-fee trades.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize trading costs: account for fees in all trade calculations, negotiate trade values that account for fees, avoid unnecessary additional fees, use this calculator to evaluate all trades, and track total fees paid over time to optimize trading strategy.'
        },
    ];

    return {
        tradeValue,
        platformFee,
        additionalFees,
        numberOfItems,
        platformFeeAmount,
        totalFees,
        netTradeValue,
        feePercentage,
        costPerItem,
        breakEvenValue,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function RobloxTradeTaxCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tradeValue: undefined,
            platformFee: undefined,
            additionalFees: undefined,
            numberOfItems: undefined,
        },
    });

    return (
        <div className="space-y-6">
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
                                    name="tradeValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade Value (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="platformFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Platform Fee (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="additionalFees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Fees (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numberOfItems"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Items</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Trade Tax
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
                        <CardDescription>See total fees, net trade value, cost per item, break-even value, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Fees</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux ({result.feePercentage.toFixed(2)}%)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Net Trade Value</p>
                                <p className={`text-2xl font-semibold ${result.netTradeValue >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.netTradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Robux (after fees)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Cost per Item</p>
                                <p className="text-2xl font-semibold text-primary">{result.costPerItem.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux per item</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Platform Fee</p>
                                <p className="text-xl font-semibold text-primary">{result.platformFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux ({result.platformFee}%)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Break-even Value</p>
                                <p className="text-xl font-semibold text-primary">{result.breakEvenValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Robux minimum</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Fee Percentage</p>
                                <p className="text-xl font-semibold text-primary">{result.feePercentage.toFixed(2)}%</p>
                                <p className="text-xs text-muted-foreground">Of trade value</p>
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
