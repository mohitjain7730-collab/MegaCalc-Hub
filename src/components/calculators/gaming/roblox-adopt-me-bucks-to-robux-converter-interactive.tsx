'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coins, ArrowRightLeft, DollarSign, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Constants
const CONVERSION_RATES = {
    'shop': { rate: 7.14, label: 'Official Shop Rate', description: 'Buying Bucks directly from the Roblox store.' },
    'ride_potion': { rate: 8.0, label: 'Ride Potion Standard', description: 'Buying Ride Potions (150 R$) and trading them for Bucks/Pets.' },
    'black_market': { rate: 25.0, label: 'Third-Party / BM (Risky)', description: 'Estimated street value. (Violates TOS, for reference only).' },
};

const formSchema = z.object({
    amount: z.number().min(0, "Amount must be positive"),
    direction: z.enum(['robux_to_bucks', 'bucks_to_robux']),
    rateType: z.enum(['shop', 'ride_potion', 'black_market']).default('shop'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    convertedAmount: string;
    rateUsed: string;
    explanation: string;
    warning?: string;
};

const calculateConversion = (values: FormValues): ResultPayload => {
    const rateData = CONVERSION_RATES[values.rateType as keyof typeof CONVERSION_RATES];
    const rate = rateData.rate;

    let result = 0;
    let currency = "";

    if (values.direction === 'robux_to_bucks') {
        // Robux -> Bucks
        // e.g. 100 Robux * 7.14 = 714 Bucks
        result = values.amount * rate;
        currency = "Bucks";
    } else {
        // Bucks -> Robux
        // e.g. 1000 Bucks / 7.14 = 140 Robux
        result = values.amount / rate;
        currency = "Robux";
    }

    let warning = undefined;
    if (values.rateType === 'black_market') {
        warning = "WARNING: This rate reflects third-party markets which violate Roblox TOS. Trading for real money can get you banned.";
    } else if (values.rateType === 'shop') {
        warning = "Note: Buying Bucks directly is generally considered a bad deal. Trading Ride Potions is usually more efficient.";
    }

    return {
        convertedAmount: new Intl.NumberFormat('en-US').format(Math.floor(result)) + " " + currency,
        rateUsed: `1 Robux ≈ ${rate.toFixed(2)} Bucks`,
        explanation: rateData.description,
        warning
    };
};

export default function RobloxAdoptMeBucksConverterInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 1000,
            direction: 'bucks_to_robux',
            rateType: 'shop',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateConversion(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Conversion Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="direction"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Direction</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="bucks_to_robux">Bucks ➔ Robux</SelectItem>
                                                    <SelectItem value="robux_to_bucks">Robux ➔ Bucks</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rateType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Conversion Standard</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(CONVERSION_RATES).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="p-2 bg-muted text-xs rounded text-muted-foreground mt-2">
                                                {CONVERSION_RATES[form.watch('rateType') as keyof typeof CONVERSION_RATES].description}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold">
                                    CONVERT
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
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Estimated Value</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black tracking-tight text-white mb-2">
                                        {result.convertedAmount}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Using Rate: {result.rateUsed}
                                </p>

                                {result.warning && (
                                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-200 flex gap-2 items-start">
                                        <Info className="h-5 w-5 shrink-0" />
                                        <span>{result.warning}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Currency</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                        {form.watch('direction') === 'bucks_to_robux' ? 'Bucks' : 'Robux'}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Exchange Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                                        {form.watch('rateType') === 'shop' ? 'Official' : 'Trading'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Coins className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Converter Ready</h3>
                            <p>Select a conversion direction to assume purchasing power.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
