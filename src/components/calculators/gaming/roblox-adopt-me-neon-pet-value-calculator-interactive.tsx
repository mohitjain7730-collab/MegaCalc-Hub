'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cat, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Schema
const formSchema = z.object({
    petName: z.string().optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'ultra-rare', 'legendary']),
    baseValue: z.number().min(1, 'Value must be at least 1'),
    isFly: z.boolean().default(false),
    isRide: z.boolean().default(false),
    demandMultiplier: z.number().min(1).max(3),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    neonValue: number;
    agingBonus: number;
    demandBonus: number;
    potionBonus: number;
    totalValue: number;
    tradingPower: string;
    recommendation: string;
};

const rarities = [
    { value: 'common', label: 'Common', agingHours: 1 },
    { value: 'uncommon', label: 'Uncommon', agingHours: 1.5 },
    { value: 'rare', label: 'Rare', agingHours: 2.5 },
    { value: 'ultra-rare', label: 'Ultra-Rare', agingHours: 4 },
    { value: 'legendary', label: 'Legendary', agingHours: 6 },
];

const calculateNeonValue = (values: FormValues): ResultPayload => {
    const baseTotal = values.baseValue * 4;

    // Aging bonus: Rare pets take longer, so the "Labor cost" is higher
    const rarityInfo = rarities.find(r => r.value === values.rarity)!;
    const agingMultiplier = 1 + (rarityInfo.agingHours * 0.05); // e.g. Legendary (6h) -> +30% value bonus

    let agingBonus = (baseTotal * agingMultiplier) - baseTotal;

    // Demand bonus
    let demandBonus = 0;
    if (values.demandMultiplier > 1) {
        demandBonus = baseTotal * (values.demandMultiplier - 1);
    }

    // Potion Bonus (Flat value approx)
    // Values are arbitrary units, lets assume 1 Ride Pot = 5 units, 1 Fly Pot = 10 units roughly
    // We scale this by base value to keep it proportional
    let potionBonus = 0;
    if (values.isRide) potionBonus += (values.baseValue * 0.5);
    if (values.isFly) potionBonus += (values.baseValue * 0.8);

    const totalValue = baseTotal + agingBonus + demandBonus + potionBonus;

    // Trading Power Interpretation
    let tradingPower = "Low";
    if (totalValue > 1000) tradingPower = "High Tier Legendary";
    else if (totalValue > 500) tradingPower = "Mid Tier";
    else if (totalValue > 100) tradingPower = "Decent";

    let recommendation = "";
    if (totalValue > baseTotal * 6) {
        recommendation = "Massive Profit! Making this neon is extremely worth the time.";
    } else if (totalValue > baseTotal * 5) {
        recommendation = "Good Profit. Worth aging the pets yourself.";
    } else {
        recommendation = "Fair Value. Trading 4 full grown might be similar value.";
    }

    return {
        neonValue: Math.round(baseTotal),
        agingBonus: Math.round(agingBonus),
        demandBonus: Math.round(demandBonus),
        potionBonus: Math.round(potionBonus),
        totalValue: Math.round(totalValue),
        tradingPower,
        recommendation
    };
};

export default function RobloxAdoptMeNeonPetValueInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rarity: 'legendary',
            baseValue: 10,
            isFly: false,
            isRide: false,
            demandMultiplier: 1.2,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateNeonValue(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pet Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="rarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pet Rarity</FormLabel>
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
                                    name="baseValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>One Pet Value (Estimated)</FormLabel>
                                            <CardDescription className="text-xs mb-2">Arbitrary value (e.g. 10 for Unicorn)</CardDescription>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isFly"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Fly</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isRide"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Ride</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="demandMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Demand: {field.value}x</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={3}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={vals => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                            <CardDescription className="text-xs">
                                                1.0 = Normal, 2.0 = High Tier (Cow, Turtle), 3.0 = Shadow Dragon
                                            </CardDescription>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold">
                                    CALCULATE NEON VALUE
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {result ? (
                    <>
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Estimated Neon Trading Value</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                                    {result.totalValue}
                                </div>
                                <p className="text-sm text-slate-400">
                                    ~{((result.totalValue / (result.neonValue / 4))).toFixed(1)}x value of a single pet
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Base (4x)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="text-2xl font-bold">{result.neonValue}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Aging Bonus</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="text-2xl font-bold text-green-600">+{result.agingBonus}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Demand Bonus</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="text-2xl font-bold text-blue-600">+{result.demandBonus}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Potions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="text-2xl font-bold text-purple-600">+{result.potionBonus}</span>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-cyan-50 dark:bg-cyan-900/10 border-cyan-100 dark:border-cyan-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Trader's Insight
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-lg mb-2">{result.recommendation}</p>
                                <p className="text-sm text-muted-foreground">
                                    This Neon falls into the <span className="font-bold text-foreground">{result.tradingPower}</span> category.
                                    {result.agingBonus > result.neonValue * 0.5
                                        ? " The high aging bonus suggests you should definitely make this neon yourself rather than trading for it."
                                        : " The low aging bonus suggests it might be faster to just trade 4 pets for it if you can."}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Cat className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Neon Value Estimator</h3>
                            <p>Enter the base pet details to see how much value is added by making it Neon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
