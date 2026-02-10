'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Target,
    Activity,
    TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    baseRarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'exclusive']),
    petAge: z.number({ invalid_type_error: 'Enter pet age' }).min(0, "Age must be positive"),
    demandLevel: z.number({ invalid_type_error: 'Enter demand level' }).min(0).max(100, "Demand is 0-100"),
    specialAttributes: z.number({ invalid_type_error: 'Enter special attributes count' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    baseRarity: string;
    petAge: number;
    demandLevel: number;
    specialAttributes: number;
    baseValue: number;
    ageMultiplier: number;
    demandMultiplier: number;
    attributeBonus: number;
    estimatedValue: string;
    status: 'low' | 'moderate' | 'high' | 'very-high';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const rarityMultipliers: Record<string, number> = {
    common: 100,
    uncommon: 500,
    rare: 2500,
    epic: 10000,
    legendary: 50000,
    mythical: 250000,
    exclusive: 1000000,
};

function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
}

const calculateResult = (values: FormValues): ResultPayload => {
    const baseRarity = values.baseRarity;
    const petAge = values.petAge;
    const demandLevel = values.demandLevel;
    const specialAttributes = values.specialAttributes;

    // Base value based on rarity (Gem Value approximation)
    const baseValue = rarityMultipliers[baseRarity] || 100;

    // Age multiplier: Older pets get a vintage bonus
    // Cap at 5x for extremely old pets (3+ years)
    const ageMultiplier = Math.min(1 + (petAge / 365) * 0.5, 5.0);

    // Demand multiplier: 0.1x (Trash) to 5.0x (Hyped)
    // 50 is neutral (1x)
    let demandMultiplier = 1;
    if (demandLevel < 50) {
        demandMultiplier = 0.1 + (demandLevel / 50) * 0.9;
    } else {
        demandMultiplier = 1 + ((demandLevel - 50) / 50) * 4;
    }

    // Attribute bonus: Multiplicative
    // Each attribute adds 50% value
    const attributeBonus = Math.pow(1.5, specialAttributes);

    // Estimated value calculation
    const rawValue = baseValue * ageMultiplier * demandMultiplier * attributeBonus;

    let status: ResultPayload['status'] = 'moderate';
    let interpretation = '';

    if (rawValue >= 1000000) {
        status = 'very-high';
        interpretation = 'This pet is a wealthy asset. It likely commands high-tier trades or massive gem overpays.';
    } else if (rawValue >= 100000) {
        status = 'high';
        interpretation = 'Strong trading value. Suitable for mid-to-high tier trading.';
    } else if (rawValue >= 10000) {
        status = 'moderate';
        interpretation = 'Decent starter to mid-game value.';
    } else {
        status = 'low';
        interpretation = 'Common value. Mostly used as fodder or for collection filling.';
    }

    const recommendations = [
        `Rarity Base: ${formatNumber(baseValue)} (${baseRarity})`,
        `Age Bonus: +${Math.round((ageMultiplier - 1) * 100)}% value from ${petAge} days history.`,
        `Market Demand: ${demandMultiplier.toFixed(1)}x multiplier due to ${demandLevel}/100 popularity.`,
        `Attributes: ${specialAttributes} special traits boosting value by ${((attributeBonus - 1) * 100).toFixed(0)}%.`,
    ];

    const plan = [
        {
            label: 'Immediate Action',
            detail: rawValue > 500000 ? 'Lock this pet. Do not trade fast.' : 'Open to offers, but verify prices.'
        },
        {
            label: 'Long Term',
            detail: petAge < 100 ? 'Hold to increase age value.' : 'Value has stabilized, good to trade.'
        },
    ];

    return {
        baseRarity,
        petAge,
        demandLevel,
        specialAttributes,
        baseValue,
        ageMultiplier,
        demandMultiplier,
        attributeBonus,
        estimatedValue: formatNumber(rawValue),
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function RobloxPetValueCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            baseRarity: 'legendary',
            petAge: 30,
            demandLevel: 50,
            specialAttributes: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateResult(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Calculator */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pet Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="baseRarity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rarity Tier</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select rarity" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="common">Common (Grey)</SelectItem>
                                                        <SelectItem value="uncommon">Uncommon (Green)</SelectItem>
                                                        <SelectItem value="rare">Rare (Blue)</SelectItem>
                                                        <SelectItem value="epic">Epic (Purple)</SelectItem>
                                                        <SelectItem value="legendary">Legendary (Orange)</SelectItem>
                                                        <SelectItem value="mythical">Mythical (Pink)</SelectItem>
                                                        <SelectItem value="exclusive">Exclusive (Special)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="demandLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Market Demand (0-100)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <div className="text-xs text-muted-foreground flex justify-between">
                                                    <span>No one wants it</span>
                                                    <span>Mega Hype</span>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="petAge"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Age (Days)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="specialAttributes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel># Special Traits</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Count Shiny, Neon, Rainbow, etc.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-500/20">
                                    CALCULATE TRUE VALUE
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {result ? (
                    <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-cyan-600/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Valuation Report</CardTitle>
                            </CardHeader>
                            <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Estimated Worth</h4>
                                    <p className="text-4xl font-black text-white tracking-tight">{result.estimatedValue}</p>
                                    <p className="text-sm text-blue-400 mt-1 font-medium">{result.interpretation}</p>

                                    <div className="mt-6 space-y-2">
                                        {result.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                                <span>{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 flex flex-col justify-center">
                                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                                        <h4 className="flex items-center gap-2 font-bold mb-3 text-white border-b border-white/10 pb-2">
                                            <Activity className="h-4 w-4 text-green-400" /> Action Plan
                                        </h4>
                                        <div className="space-y-3">
                                            {result.plan.map((p, i) => (
                                                <div key={i}>
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{p.label}</span>
                                                    <p className="text-sm text-slate-200">{p.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Target className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Ready to Appraise</h3>
                            <p>Fill in the rarity, age, and demand to see how much your inventory is worth.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Understanding the Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p><strong>Rarity Tier:</strong> The fundamental "spawn rate" of the pet. Mythicals are harder to hatch than Commons, giving them a higher base price.</p>
                            <p><strong>Market Demand:</strong> This is the "Hype Factor". A pet with 100 Demand is something everyone is looking for (e.g., a new update pet). A pet with 0 Demand is "dead stock".</p>
                            <p><strong>Age:</strong> Represents days since the pet was obtained or the event happened. Older pets accrue "vintage" value.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Formula Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Valuation Logic:</strong></p>
                            <code className="bg-muted px-2 py-1 rounded block w-fit">Value = Base &times; (Age_Mult + Demand_Mult) &times; Attr_Bonus</code>
                            <p>We use a composite score that weighs <strong>Scarcity (Rarity)</strong> against <strong>Liquidity (Demand)</strong>.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Column: Context & Guide */}
            <div className="space-y-6">
                <Card className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-yellow-600" />
                            Market Database
                        </CardTitle>
                        <CardDescription>Average Base Values</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">Tier</th>
                                    <th className="p-3 text-right">Avg Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    { t: 'Common', v: '100' },
                                    { t: 'Uncommon', v: '500' },
                                    { t: 'Rare', v: '2.5K' },
                                    { t: 'Epic', v: '10K' },
                                    { t: 'Legendary', v: '50K' },
                                    { t: 'Mythical', v: '250K+' },
                                    { t: 'Exclusive', v: '1M+' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/50">
                                        <td className="p-3 font-medium">{row.t}</td>
                                        <td className="p-3 text-right text-muted-foreground">{row.v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Special Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                            <h4 className="font-bold text-amber-600 flex items-center gap-2 text-sm"><Target className="h-3 w-3" /> Shiny/Rainbow</h4>
                            <p className="text-xs text-muted-foreground mt-1">Multiplies value by 1.5x - 3x depending on the game.</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                            <h4 className="font-bold text-purple-600 flex items-center gap-2 text-sm"><Target className="h-3 w-3" /> Huge/Titanic</h4>
                            <p className="text-xs text-muted-foreground mt-1">These always hold 100-200% of their RAP value even in crashes.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">ROI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="font-medium">Hold or Sell?</p>
                            <ul className="list-disc pl-4 text-muted-foreground mt-1 space-y-1">
                                <li><strong>New Pets:</strong> SELL immediately (Hype crash).</li>
                                <li><strong>Event Pets:</strong> HOLD for 6+ months.</li>
                                <li><strong>Exclusives:</strong> HOLD as inflation hedge.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
