'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Schema
const formSchema = z.object({
    inputType: z.enum(['single', 'neon']),
    inputValue: z.number().min(1, 'Value must be at least 1'),
    rarity: z.enum(['common', 'uncommon', 'rare', 'ultra-rare', 'legendary']),
    isFly: z.boolean().default(true),
    isRide: z.boolean().default(true),
    tierMultiplier: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    megaValue: number;
    baseCost: number;
    megaBonus: number;
    totalValue: number;
    tierLabel: string;
    recommendation: string;
};

const rarities = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'ultra-rare', label: 'Ultra-Rare' },
    { value: 'legendary', label: 'Legendary' },
];

const calculateMegaValue = (values: FormValues): ResultPayload => {
    let baseCost = 0;

    if (values.inputType === 'single') {
        baseCost = values.inputValue * 16;
    } else {
        baseCost = values.inputValue * 4;
    }

    // Mega Scaling Multiplier
    // High tier pets scale slightly differently.
    // Generally, Mega = 4 * Neon + Time Bonus.
    // But for HIGH tiers (Shadows), Mega might actually be LESS than 4 Neons sometimes purely on liquidity, 
    // but usually we assume standard positive scaling for the calculator logic.

    // Base Bonus for being Mega
    let megaMultiplier = 1.2; // 20% bonus default

    // Rarity Bonus
    switch (values.rarity) {
        case 'common': megaMultiplier = 1.1; break;
        case 'uncommon': megaMultiplier = 1.15; break;
        case 'rare': megaMultiplier = 1.25; break;
        case 'ultra-rare': megaMultiplier = 1.35; break;
        case 'legendary': megaMultiplier = 1.5; break; // Massive bonus for 16 legendaries
    }

    // Demand/Tier manual override
    // If user sets high demand, we compound it
    if (values.tierMultiplier > 1) {
        megaMultiplier += (values.tierMultiplier - 1) * 0.5;
    }

    const megaBonus = (baseCost * megaMultiplier) - baseCost;
    const totalValue = baseCost + megaBonus;

    // Tier Labeling
    let tierLabel = "Standard Mega";
    if (totalValue > 5000) tierLabel = "High-Tier Exotic/Legendary";
    else if (totalValue > 2000) tierLabel = "Mid-High Tier";
    else if (totalValue > 500) tierLabel = "Mid Tier";
    else tierLabel = "Low Tier / Random Mega";

    let recommendation = "";
    if (megaMultiplier >= 1.4) {
        recommendation = "High Profit Potential! The grind to Mega adds massive value for this rarity.";
    } else {
        recommendation = "Standard Value. The value is mostly in the pets themselves, not the Mega form.";
    }

    return {
        megaValue: Math.round(totalValue),
        baseCost: Math.round(baseCost),
        megaBonus: Math.round(megaBonus),
        totalValue: Math.round(totalValue),
        tierLabel,
        recommendation
    };
};

export default function RobloxAdoptMeMegaNeonValueInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inputType: 'single',
            inputValue: 10,
            rarity: 'legendary',
            isFly: true,
            isRide: true,
            tierMultiplier: 1.0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateMegaValue(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pet Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="inputType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Input Mode</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={field.value === 'single' ? "default" : "outline"}
                                                        onClick={() => field.onChange('single')}
                                                        className={field.value === 'single' ? "bg-purple-600" : ""}
                                                    >
                                                        Single Value
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === 'neon' ? "default" : "outline"}
                                                        onClick={() => field.onChange('neon')}
                                                        className={field.value === 'neon' ? "bg-cyan-500" : ""}
                                                    >
                                                        Neon Value
                                                    </Button>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="inputValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{form.watch('inputType') === 'single' ? 'Single Pet Value' : 'Neon Pet Value'}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <CardDescription className="text-xs">
                                                Use values from your favorite value list (e.g., 5, 20.5)
                                            </CardDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Rarity</FormLabel>
                                            <FormControl>
                                                <select {...field} className="w-full p-2 border rounded-md bg-background">
                                                    {rarities.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tierMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Demand Tier: {field.value}x</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={3}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={vals => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <CardDescription className="text-xs">
                                                Is this a "Preppy" or "High Tier" pet? Increase for higher demand.
                                            </CardDescription>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-white transition-all shadow-lg hover:shadow-xl">
                                    CALCULATE MEGA VALUE
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {result ? (
                    <>
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden ring-2 ring-purple-500/20">
                            <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/40 to-pink-900/40 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-purple-200">Estimated Mega Value</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2 drop-shadow-lg">
                                    {result.totalValue}
                                </div>
                                <div className="flex gap-4 text-sm text-purple-200/60">
                                    <span>Equals ~{(result.totalValue / (result.baseCost / 16)).toFixed(1)}x Single Pets</span>
                                    <span>•</span>
                                    <span>Equals ~{(result.totalValue / (result.baseCost / 4)).toFixed(1)}x Neon Pets</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Component Cost</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{result.baseCost}</div>
                                    <p className="text-xs text-muted-foreground">Value of {form.watch('inputType') === 'single' ? '16 singles' : '4 neons'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Mega/Rainbow Bonus</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-pink-600">+{result.megaBonus}</div>
                                    <p className="text-xs text-muted-foreground">Added value from grinding</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    Pro Trader Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-semibold">{result.tierLabel}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {result.recommendation} Creating this Mega {result.megaBonus > 500 ? "will result in MASSIVE profit" : "provides reliable, steady profit"} over selling the components individually.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Gem className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Mega Evolution</h3>
                            <p>Enter single or neon values to see the exponential growth of a Mega Neon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
