'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Data based on market logic.
const EGG_DATA = {
    'danger_egg': { name: 'Danger Egg', unhatchedVal: 0.85, hatchedAvgVal: 0.65, cost: 750, currency: 'Bucks' },
    'urban_egg': { name: 'Urban Egg', unhatchedVal: 0.95, hatchedAvgVal: 0.70, cost: 750, currency: 'Bucks' },
    'desert_egg': { name: 'Desert Egg', unhatchedVal: 1.1, hatchedAvgVal: 0.75, cost: 750, currency: 'Bucks' },
    'royal_egg': { name: 'Royal Egg', unhatchedVal: 0.5, hatchedAvgVal: 0.45, cost: 1450, currency: 'Bucks' },
    'retired_egg': { name: 'Retired Egg', unhatchedVal: 0.6, hatchedAvgVal: 0.55, cost: 600, currency: 'Bucks' },
    'aussie_egg': { name: 'Aussie Egg (Old)', unhatchedVal: 6.5, hatchedAvgVal: 3.2, cost: 0, currency: 'Trade Only' },
    'fossil_egg': { name: 'Fossil Egg (Old)', unhatchedVal: 2.5, hatchedAvgVal: 1.1, cost: 0, currency: 'Trade Only' },
    'ocean_egg': { name: 'Ocean Egg (Old)', unhatchedVal: 2.0, hatchedAvgVal: 0.9, cost: 0, currency: 'Trade Only' },
};

const formSchema = z.object({
    eggType: z.string(),
    quantity: z.number().min(1).max(100).default(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalUnhatchedValue: number;
    totalHatchedValue: number;
    difference: number;
    verdict: string;
    verdictColor: string;
    roi: string;
};

const calculateEggValue = (values: FormValues): ResultPayload => {
    const egg = EGG_DATA[values.eggType as keyof typeof EGG_DATA];
    const qty = values.quantity;

    const totalUnhatched = egg.unhatchedVal * qty;
    const totalHatched = egg.hatchedAvgVal * qty;
    const diff = totalHatched - totalUnhatched;
    const roi = ((diff / totalUnhatched) * 100).toFixed(1);

    let verdict = "HOLD / TRADE";
    let color = "text-yellow-500";

    // Logic: In almost all cases, older eggs are better to keep closed.
    // Permanent eggs (Royal) are statistically losing money either way, but hatching is fun.
    if (diff > 0) {
        verdict = "HATCH IT! (Profit)";
        color = "text-green-500";
    } else if (Math.abs(diff) < 0.5) {
        verdict = "NEUTRAL (Gambler's Choice)";
        color = "text-blue-400";
    } else {
        verdict = "DO NOT HATCH (Loss)";
        color = "text-red-500";
    }

    return {
        totalUnhatchedValue: parseFloat(totalUnhatched.toFixed(2)),
        totalHatchedValue: parseFloat(totalHatched.toFixed(2)),
        difference: parseFloat(diff.toFixed(2)),
        verdict,
        verdictColor: color,
        roi: `${roi}%`
    };
};

export default function RobloxAdoptMeEggValueInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eggType: 'urban_egg',
            quantity: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateEggValue(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Egg Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="eggType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Egg Name</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(EGG_DATA).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {data.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity: {field.value}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-black">
                                    ANALYZE VALUE
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
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Financial Verdict</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                    <span className={`text-4xl font-black tracking-tight ${result.verdictColor}`}>
                                        {result.verdict}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                    <div className="p-3 bg-white/5 rounded">
                                        <p className="text-slate-400">Trading Value (Sealed)</p>
                                        <p className="text-xl font-bold text-white mb-2">{result.totalUnhatchedValue}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded">
                                        <p className="text-slate-400">Expected Value (Hatched)</p>
                                        <p className="text-xl font-bold text-white mb-2">{result.totalHatchedValue}</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-2 text-center text-xs text-slate-500">
                                    ROI: {result.roi} (Hatching usually destroys value)
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                    Market Insight
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Old eggs act like rare collectibles. Once you crack them, the "vintage" status is gone. Only hatch if you are feeling lucky for the 1-3% Legendary drop!
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Package className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Egg Analyzer</h3>
                            <p>Compare the value of keeping it sealed vs cracking it open.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
